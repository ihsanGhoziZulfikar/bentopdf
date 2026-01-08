import { Request, Response } from 'express';
import fs from 'fs';

const pdfParse = require('pdf-parse');

export const summarizePdf = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const dataBuffer = fs.readFileSync(filePath);

    const pdfData = await pdfParse(dataBuffer);
    const extractedText = pdfData.text;

    const summaryText =
      `[SUMMARY RESULT]\n\n` +
      `File: ${req.file.originalname}\n\n` +
      extractedText.substring(0, 500) +
      '...';

    fs.unlinkSync(filePath);

    return res.json({ summary: summaryText });
  } catch (error) {
    console.error('Error summarizing PDF:', error);
    return res.status(500).json({ error: 'Failed to process summary' });
  }
};
