import { Request, Response } from 'express';
// @ts-ignore
import * as qpdf from 'node-qpdf2';
import fs from 'fs-extra';
import path from 'path';

export const repairPDF = async (req: Request, res: Response) => {
  let inputPath: string | null = null;
  let outputPath: string | null = null;

  try {
    if (!req.file) {
      return res.status(400).send('No file uploaded.');
    }

    inputPath = req.file.path;
    const fileName = `repaired_${Date.now()}_${req.file.originalname}`;
    outputPath = path.join('uploads', fileName);

    await fs.ensureDir('uploads');

    // SOLUSI: Cast ke 'any' agar TypeScript tidak protes tentang properti 'base'
    const qpdfEngine = qpdf as any;

    // Menjalankan perintah repair (qpdf input.pdf --replace-input)
    // Dalam library node-qpdf2, .base() digunakan untuk command dasar
    await qpdfEngine.base({
      input: inputPath,
      output: outputPath,
    });

    if (await fs.pathExists(outputPath)) {
      const fileBuffer = await fs.readFile(outputPath);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${fileName}"`
      );

      return res.send(fileBuffer);
    } else {
      throw new Error('Output file not found');
    }
  } catch (error: any) {
    console.error('🔥 Repair Error:', error);
    return res.status(500).send(`Repair failed: ${error.message}`);
  } finally {
    try {
      if (inputPath && (await fs.pathExists(inputPath)))
        await fs.unlink(inputPath);
      if (outputPath && (await fs.pathExists(outputPath)))
        await fs.unlink(outputPath);
    } catch (err) {
      console.error('Cleanup Error:', err);
    }
  }
};
