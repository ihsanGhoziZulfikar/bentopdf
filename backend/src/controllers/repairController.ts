import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

export const repairPDF = async (req: Request, res: Response) => {
  console.log('1. Masuk ke controller repairPDF');

  if (!req.file) {
    console.log('Error: Tidak ada file');
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const filePath = req.file.path;
  console.log(`2. File diterima di: ${filePath}`);

  try {
    // --- MODE DEBUGGING ---
    // Kita kirim balik file ASLINYA dulu tanpa diproses pdf-lib/ghostscript.
    // Tujuannya: Memastikan Frontend bisa menerima file download.

    const fileName = req.file.originalname;

    // Set Header agar browser tahu ini file PDF untuk didownload
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="repaired_${fileName}"`
    );

    // Buat stream baca file
    const fileStream = fs.createReadStream(filePath);

    // Saat stream selesai dibaca, hapus file dari server
    fileStream.on('close', () => {
      try {
        fs.unlinkSync(filePath);
        console.log('3. File temp dihapus (Cleanup)');
      } catch (e) {
        console.error('Gagal hapus file:', e);
      }
    });

    // Kirim ke frontend (Piping)
    console.log('4. Mengirim stream ke frontend...');
    fileStream.pipe(res);

    // Handle jika error saat kirim
    fileStream.on('error', (err) => {
      console.error('Stream Error:', err);
      res.status(500).end();
    });
  } catch (error: any) {
    console.error('🔥 Controller Error:', error);
    // Hapus file jika ada error
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    res
      .status(500)
      .json({ message: 'Processing failed', error: error.message });
  }
};
