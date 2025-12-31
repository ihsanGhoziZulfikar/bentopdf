import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { promisify } from 'util';

const execPromise = promisify(exec);

export async function POST(req: NextRequest) {
  // Deklarasi path di luar try agar bisa diakses di blok catch/finally untuk pembersihan
  let inputPath: string | undefined;
  let outputPath: string | undefined;

  try {
    // 1. Ambil data dari FormData
    const formData = await req.formData();
    // Casting ke File (Web API File)
    const file = formData.get('file') as File | null;
    const level = (formData.get('level') as string) || '/ebook';

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // 2. Siapkan path temporary
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const tempDir = os.tmpdir();
    // Gunakan random string sederhana untuk ID
    const uniqueId = Date.now() + '-' + Math.random().toString(36).substring(7);

    inputPath = path.join(tempDir, `input-${uniqueId}.pdf`);
    outputPath = path.join(tempDir, `output-${uniqueId}.pdf`);

    // 3. Tulis file asli ke temp folder
    await fs.writeFile(inputPath, buffer);

    // 4. Validasi level (Security)
    const validLevels = [
      '/screen',
      '/ebook',
      '/printer',
      '/prepress',
      '/default',
    ];
    const safeLevel = validLevels.includes(level) ? level : '/ebook';

    // 5. SETUP PATH GHOSTSCRIPT (BAGIAN KRUSIAL)
    const isWindows = os.platform() === 'win32';

    // Perhatikan: Kita menunjuk ke file .exe asli di Program Files, BUKAN shortcut .lnk
    // Tanda kutip ganda ('"') diperlukan karena ada spasi di 'Program Files'
    const windowsPath = '"C:\\Program Files\\gs\\gs10.06.0\\bin\\gswin64c.exe"';

    // Jika Windows gunakan path lengkap di atas, jika Linux gunakan 'gs'
    const executable = isWindows ? windowsPath : 'gs';

    // Command Ghostscript
    const gsCommand = `${executable} -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=${safeLevel} -dNOPAUSE -dQUIET -dBATCH -sOutputFile="${outputPath}" "${inputPath}"`;

    // 6. Eksekusi Ghostscript
    // console.log('Executing:', gsCommand); // Uncomment baris ini jika ingin melihat command di terminal
    await execPromise(gsCommand);

    // 7. Baca file hasil kompresi
    // Pastikan file output benar-benar terbentuk sebelum dibaca
    try {
      await fs.access(outputPath);
    } catch {
      throw new Error(
        'Ghostscript gagal membuat file output (Path mungkin salah atau file corrupt)'
      );
    }

    const compressedBuffer = await fs.readFile(outputPath);

    // 8. Konversi Buffer ke Blob
    const uint8 = new Uint8Array(compressedBuffer);
    const pdfBlob = new Blob([uint8], { type: 'application/pdf' });

    // 9. Bersihkan file temp
    await Promise.all([
      fs.unlink(inputPath).catch(() => {}),
      fs.unlink(outputPath).catch(() => {}),
    ]);

    // 10. Kembalikan response
    return new NextResponse(pdfBlob, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="compressed.pdf"`,
      },
    });
  } catch (error: unknown) {
    console.error('Compression Error:', error);

    // Bersihkan file jika terjadi error
    if (inputPath) await fs.unlink(inputPath).catch(() => {});
    if (outputPath) await fs.unlink(outputPath).catch(() => {});

    let errorMessage = 'An unexpected error occurred';
    let errorDetails = '';

    if (error instanceof Error) {
      errorMessage = error.message;
      // Menangkap pesan error spesifik jika command not found
      if (
        errorMessage.includes('is not recognized') ||
        errorMessage.includes('ENOENT')
      ) {
        errorDetails =
          'Ghostscript executable not found. Please check the path in route.ts';
      }
    } else if (typeof error === 'string') {
      errorMessage = error;
    }

    return NextResponse.json(
      {
        error: 'Compression failed',
        details: errorMessage,
        hint: errorDetails,
      },
      { status: 500 }
    );
  }
}
