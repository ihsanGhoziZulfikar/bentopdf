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

export const mergePdf = async (req: Request, res: Response) => {
  let mergedPath: string | null = null;
  const inputFiles: string[] = [];

  try {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length < 2) {
      res
        .status(400)
        .json({ error: 'Upload minimal 2 file PDF untuk digabungkan' });
      return;
    }

    console.log(`Merging ${files.length} files...`);
    files.forEach((f) => inputFiles.push(f.path));

    const mergedPdf = await PDFDocument.create();

    for (const file of files) {
      const buffer = await fs.readFile(file.path);
      try {
        const pdf = await PDFDocument.load(buffer);
        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        pages.forEach((p) => mergedPdf.addPage(p));
      } catch (e: any) {
        console.warn(`Gagal membaca file ${file.originalname}: ${e.message}`);
      }
    }

    const mergedBytes = await mergedPdf.save();

    const unique = Date.now();
    const outputFilename = `merged_bentopdf_${unique}.pdf`;
    mergedPath = path.join(UPLOAD_DIR, outputFilename);

    await fs.writeFile(mergedPath, mergedBytes);

    // Auto Delete Output
    setTimeout(
      () => {
        if (mergedPath) fs.unlink(mergedPath).catch(() => {});
      },
      15 * 60 * 1000
    );

    // Hapus Input segera
    await Promise.all(inputFiles.map((p) => fs.unlink(p).catch(() => {})));

    res.status(200).json({
      message: 'success merge pdf',
      data: {
        download_url: `${BASE_URL}${DOWNLOAD_ROUTE}/${outputFilename}`,
        total_files: files.length,
        file_size: formatSize(mergedBytes.length),
      },
    });
  } catch (err: any) {
    // Cleanup on error
    inputFiles.forEach((p) => fs.unlink(p).catch(() => {}));
    if (mergedPath) fs.unlink(mergedPath).catch(() => {});

    console.error('Merge Error:', err);
    res
      .status(500)
      .json({ error: 'Gagal menggabungkan PDF', details: err.message });
  }
};
