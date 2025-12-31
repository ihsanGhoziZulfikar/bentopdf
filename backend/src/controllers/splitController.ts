import { Request, Response } from 'express';
import fs from 'fs-extra';
import path from 'path';
import { PDFDocument } from 'pdf-lib';
import { UPLOAD_DIR } from '../config/multer';
import { formatSize } from '../utils/formatSize';

// Config
const PORT = 5000;
const BASE_URL = `http://localhost:${PORT}`;
const DOWNLOAD_ROUTE = '/dl';

// ==========================================
// HELPER: Parse Range String
// ==========================================
const parsePageRange = (rangeStr: string, totalPages: number): number[] => {
  const pages = new Set<number>();
  const parts = rangeStr.split(',');

  parts.forEach((part) => {
    const range = part.trim().split('-');
    if (range.length === 2) {
      // Handle range "1-3"
      const start = parseInt(range[0]) - 1;
      const end = parseInt(range[1]) - 1;
      for (let i = start; i <= end; i++) {
        if (i >= 0 && i < totalPages) pages.add(i);
      }
    } else {
      // Handle single page "5"
      const page = parseInt(range[0]) - 1;
      if (page >= 0 && page < totalPages) pages.add(page);
    }
  });

  return Array.from(pages).sort((a, b) => a - b);
};

// ==========================================
// CONTROLLER: SPLIT PDF
// ==========================================
export const splitPdf = async (req: Request, res: Response) => {
  let inputPath: string | null = null;
  let outputPath: string | null = null;

  try {
    if (!req.file) {
      res.status(400).json({ error: 'File binary is required' });
      return;
    }

    inputPath = req.file.path;
    const rangeStr = req.body.range || '1'; // Default page 1 if empty

    console.log(`Splitting PDF ${req.file.originalname} | Range: ${rangeStr}`);

    // 1. Load PDF Asli
    const pdfBuffer = await fs.readFile(inputPath);
    const srcPdf = await PDFDocument.load(pdfBuffer);
    const totalPages = srcPdf.getPageCount();

    // 2. Tentukan halaman mana yang mau diambil
    const pageIndices = parsePageRange(rangeStr, totalPages);

    if (pageIndices.length === 0) {
      throw new Error(
        'Halaman yang diminta tidak valid atau di luar jangkauan.'
      );
    }

    // 3. Buat PDF Baru
    const newPdf = await PDFDocument.create();
    const copiedPages = await newPdf.copyPages(srcPdf, pageIndices);
    copiedPages.forEach((page) => newPdf.addPage(page));

    // 4. Simpan PDF Baru
    const outputBytes = await newPdf.save();
    const unique = Date.now();
    const outputFilename = `split_${unique}.pdf`;
    outputPath = path.join(UPLOAD_DIR, outputFilename);

    await fs.writeFile(outputPath, outputBytes);

    // 5. Cleanup & Response
    setTimeout(
      () => {
        if (outputPath) fs.unlink(outputPath).catch(() => {});
      },
      15 * 60 * 1000
    );

    await fs.unlink(inputPath).catch(() => {});

    res.status(200).json({
      message: 'success split pdf',
      data: {
        download_url: `${BASE_URL}${DOWNLOAD_ROUTE}/${outputFilename}`,
        original_pages: totalPages,
        extracted_pages: pageIndices.length,
        file_size: formatSize(outputBytes.length),
      },
    });
  } catch (err: any) {
    if (inputPath) fs.unlink(inputPath).catch(() => {});
    if (outputPath) fs.unlink(outputPath).catch(() => {});

    console.error('Split Error:', err);
    res
      .status(500)
      .json({ error: 'Gagal memisahkan PDF', details: err.message });
  }
};
