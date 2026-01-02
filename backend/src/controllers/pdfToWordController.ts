import { Request, Response } from 'express';
import fs from 'fs-extra';
import path from 'path';
import pdf from 'pdf-parse';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { UPLOAD_DIR } from '../config/multer';
import { formatSize } from '../utils/formatSize';

// Config
const PORT = 5000;
const BASE_URL = `http://localhost:${PORT}`;
const DOWNLOAD_ROUTE = '/dl';

export const pdfToWord = async (req: Request, res: Response) => {
  let inputPath: string | null = null;
  let outputPath: string | null = null;

  try {
    // 1. Cek File Masuk
    if (!req.file) {
      res.status(400).json({ error: 'File binary is required' });
      return;
    }

    inputPath = req.file.path;

    console.log(`Converting PDF to Word: ${req.file.originalname}`);

    // 2. Baca PDF dan Extract Text
    const pdfBuffer = await fs.readFile(inputPath);
    const pdfData = await pdf(pdfBuffer);

    // 3. Buat Document Word dari Text
    const children: (Paragraph | TextRun)[] = [];

    // Tambahkan judul jika ada
    if (pdfData.info?.Title) {
      children.push(
        new Paragraph({
          text: pdfData.info.Title,
          heading: HeadingLevel.HEADING_1,
        })
      );
    }

    // Split text menjadi paragraphs berdasarkan newline
    const paragraphs = pdfData.text.split(/\n\s*\n/).filter((p) => p.trim());

    paragraphs.forEach((para) => {
      if (para.trim()) {
        // Split paragraph menjadi lines untuk handling yang lebih baik
        const lines = para.split('\n').filter((line) => line.trim());
        lines.forEach((line) => {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: line.trim(),
                  size: 24, // 12pt font size (half points)
                }),
              ],
            })
          );
        });
      }
    });

    // Jika tidak ada text yang diextract, tambahkan pesan
    if (children.length === 0) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'PDF tidak mengandung text yang dapat diextract. File mungkin berupa scanned image.',
              size: 24,
            }),
          ],
        })
      );
    }

    // 4. Buat Document Word
    const doc = new Document({
      sections: [
        {
          children: children as Paragraph[],
        },
      ],
    });

    // 5. Generate Word Document Buffer
    const docBuffer = await Packer.toBuffer(doc);

    // 6. Simpan File Word
    const unique = Date.now();
    const outputFilename = `pdf_to_word_${unique}.docx`;
    outputPath = path.join(UPLOAD_DIR, outputFilename);

    await fs.writeFile(outputPath, docBuffer);

    // 7. Hitung Size
    const inputStats = await fs.stat(inputPath);
    const outputStats = await fs.stat(outputPath);

    // Auto Delete Output (15 Menit)
    setTimeout(
      () => {
        if (outputPath) fs.unlink(outputPath).catch(() => {});
      },
      15 * 60 * 1000
    );

    // Hapus file input segera
    await fs.unlink(inputPath).catch(() => {});

    // 8. Response Sukses
    res.status(200).json({
      message: 'success convert pdf to word',
      data: {
        download_url: `${BASE_URL}${DOWNLOAD_ROUTE}/${outputFilename}`,
        original_size: formatSize(inputStats.size),
        word_size: formatSize(outputStats.size),
        pages: pdfData.numpages,
      },
    });
  } catch (err: any) {
    // Cleanup jika error
    if (inputPath) fs.unlink(inputPath).catch(() => {});
    if (outputPath) fs.unlink(outputPath).catch(() => {});

    console.error('PDF to Word Error:', err);
    res
      .status(500)
      .json({ error: 'Gagal mengkonversi PDF ke Word', details: err.message });
  }
};

