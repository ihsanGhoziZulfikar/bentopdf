import { Request, Response } from 'express';
import fs from 'fs-extra';
import path from 'path';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pdfParse = require('pdf-parse');

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
    if (!req.file) {
      res.status(400).json({ error: 'File binary is required' });
      return;
    }

    inputPath = req.file.path;

    // Read PDF
    const pdfBuffer = await fs.readFile(inputPath);
    const pdfData = await pdfParse(pdfBuffer);

    const children: Paragraph[] = [];

    // Title
    if (pdfData.info?.Title) {
      children.push(
        new Paragraph({
          text: pdfData.info.Title,
          heading: HeadingLevel.HEADING_1,
        })
      );
    }

    // Split text to paragraphs
    const paragraphs = pdfData.text
      .split(/\n\s*\n/)
      .filter((p: string) => p.trim());

    paragraphs.forEach((para: string) => {
      const lines = para.split('\n').filter((l: string) => l.trim());

      lines.forEach((line: string) => {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: line.trim(),
                size: 24, // 12pt
              }),
            ],
          })
        );
      });
    });

    // Fallback jika PDF kosong / scanned
    if (children.length === 0) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'PDF tidak mengandung teks yang dapat diekstrak (kemungkinan hasil scan).',
              size: 24,
            }),
          ],
        })
      );
    }

    // Create Word document
    const doc = new Document({
      sections: [{ children }],
    });

    const docBuffer = await Packer.toBuffer(doc);

    const outputFilename = `pdf_to_word_${Date.now()}.docx`;
    outputPath = path.join(UPLOAD_DIR, outputFilename);

    await fs.writeFile(outputPath, docBuffer);

    const inputStats = await fs.stat(inputPath);
    const outputStats = await fs.stat(outputPath);

    // Auto delete output (15 menit)
    setTimeout(
      () => {
        if (outputPath) fs.unlink(outputPath).catch(() => {});
      },
      15 * 60 * 1000
    );

    // Hapus input
    await fs.unlink(inputPath).catch(() => {});

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
    if (inputPath) fs.unlink(inputPath).catch(() => {});
    if (outputPath) fs.unlink(outputPath).catch(() => {});

    console.error('PDF to Word Error:', err);
    res.status(500).json({
      error: 'Gagal mengkonversi PDF ke Word',
      details: err.message,
    });
  }
};
