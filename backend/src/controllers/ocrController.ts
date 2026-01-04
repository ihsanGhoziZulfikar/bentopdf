import { Request, Response } from 'express';
import fs from 'fs-extra';
import { createWorker } from 'tesseract.js';
import pdf2img from 'pdf-img-convert';

export const ocrPDF = async (req: Request, res: Response) => {
  let worker: any = null;
  const inputPath = req.file?.path;

  try {
    if (!req.file || !inputPath) {
      return res.status(400).json({
        message: 'File PDF tidak ditemukan.',
      });
    }

    /**
     * Language mapping
     */
    let lang = req.body.language || 'eng';
    if (lang === 'id') lang = 'ind';
    if (lang === 'en') lang = 'eng';

    /**
     * Convert PDF → Images
     */
    const images = await pdf2img.convert(inputPath, {
      scale: 2.0,
    });

    /**
     * ⬅️ API LAMA (INI KUNCI)
     */
    worker = await createWorker(lang);

    let extractedText = '';

    for (const image of images) {
      const {
        data: { text },
      } = await worker.recognize(image);

      extractedText += text.trim() + '\n\n';
    }

    res.json({
      message: 'success ocr',
      data: {
        text: extractedText.trim(),
      },
    });
  } catch (error: any) {
    console.error('OCR Error:', error);
    res.status(500).json({
      message: 'Gagal memproses OCR',
      details: error.message,
    });
  } finally {
    if (worker) await worker.terminate();
    if (inputPath) await fs.unlink(inputPath).catch(() => {});
  }
};
