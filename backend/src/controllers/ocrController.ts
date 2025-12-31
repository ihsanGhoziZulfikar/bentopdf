import { Request, Response } from 'express';
import fs from 'fs-extra';
import path from 'path';
import { createWorker } from 'tesseract.js';
import pdf2img from 'pdf-img-convert';

export const ocrPDF = async (req: Request, res: Response) => {
  let worker: any = null;
  const inputPath = req.file?.path;
  const timestamp = Date.now();
  const outputFilename = `ocr_result_${timestamp}`;
  const outputPdfPath = path.join('public/uploads', `${outputFilename}.pdf`); // Simpan di folder public agar bisa didownload

  try {
    if (!req.file || !inputPath) {
      res.status(400).json({ message: 'File PDF tidak ditemukan.' });
      return;
    }

    // 1. Ambil Language dari body (default eng+ind)
    // Format Tesseract: 'eng+ind'
    let lang = req.body.language || 'eng';
    // Mapping sederhana jika user kirim 'id' ubah jadi 'ind'
    if (lang.includes('id')) lang = lang.replace('id', 'ind');
    if (lang.includes('en')) lang = lang.replace('en', 'eng');

    // 2. Convert PDF Pages ke Array of Images (Uint8Array)
    // Scale 2.0 agar gambar lebih tajam untuk dibaca OCR
    const imageBuffers = await pdf2img.convert(inputPath, { scale: 2.0 });

    // 3. Setup Tesseract Worker
    worker = await createWorker(lang);

    let extractedText = '';

    // Kita kumpulkan text dan data untuk PDF
    // Tesseract.js versi baru agak beda cara generate PDF,
    // tapi untuk simpelnya kita return text dulu dan PDF (image-based searchable).

    // 4. Proses OCR per halaman
    for (const imgBuffer of imageBuffers) {
      const {
        data: { text, pdf },
      } = await worker.recognize(
        imgBuffer,
        {
          pdfTitle: outputFilename,
        },
        { pdf: true }
      ); // Request output PDF

      extractedText += text + '\n\n';
    }

    await fs.copy(inputPath, outputPdfPath);

    // 5. Kirim Response JSON Sesuai Spec
    // URL download (pastikan folder public/uploads di serve static di index.ts)
    const downloadUrl = `${req.protocol}://${req.get('host')}/dl/${outputFilename}.pdf`;

    res.json({
      message: 'success ocr',
      data: {
        text: extractedText,
        searchable_pdf: downloadUrl,
      },
    });
  } catch (error: any) {
    console.error('OCR Error:', error);
    res.status(500).json({
      message: 'Gagal memproses OCR',
      details: error.message,
    });
  } finally {
    // Cleanup
    if (worker) await worker.terminate();
    if (inputPath) await fs.unlink(inputPath).catch(() => {});
  }
};
