'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function RepairPDF() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false); // State loading

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    // Kita batasi 1 file dulu biar aman, atau ambil yang pertama jika user select banyak
    const newFiles = Array.from(e.target.files);
    setFiles(newFiles);
  };

  const addMoreFiles = () => {
    document.getElementById('file-input')?.click();
  };

  const clearFiles = () => {
    setFiles([]);
  };

  // ==========================================
  // LOGIC REPAIR (Fetch ke Backend)
  // ==========================================
  const handleRepair = async () => {
    if (files.length === 0) {
      alert('Silakan pilih file PDF terlebih dahulu.');
      return;
    }

    setIsProcessing(true);

    // Ambil file pertama saja untuk diproses
    const fileToRepair = files[0];

    try {
      const formData = new FormData();
      formData.append('file', fileToRepair);

      // Panggil API Backend (Sesuaikan Port jika beda)
      const response = await fetch('http://localhost:5000/api/pdf/repair', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        // Cek apakah error JSON atau HTML
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.indexOf('application/json') !== -1) {
          const errData = await response.json();
          throw new Error(errData.message || 'Gagal memperbaiki PDF');
        } else {
          throw new Error(`Server Error: ${response.statusText}`);
        }
      }

      // Download File Hasil Repair
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `repaired_${fileToRepair.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Opsional: Bersihkan file setelah sukses
      // clearFiles();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Terjadi kesalahan saat memperbaiki file.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 antialiased">
      {/* ================= NAVBAR ================= */}
      <nav className="bg-gray-800 border-b border-gray-700 sticky top-0 z-30">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-white text-xl">
              <span className="text-indigo-500">Bento</span>PDF
            </div>
            <div className="hidden md:flex gap-8 text-sm">
              <Link href="/" className="hover:text-indigo-400">
                Home
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ================= MAIN ================= */}
      <main className="flex justify-center px-4 py-12">
        <div className="w-full max-w-2xl bg-gray-800 border border-gray-700 rounded-xl shadow-xl p-6 md:p-8">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 text-sm font-semibold"
          >
            ← Back to Tools
          </Link>

          <h1 className="text-2xl font-bold text-white mb-2">Repair PDF</h1>
          <p className="text-gray-400 mb-6 text-sm">
            Recover data from corrupted or damaged PDF files.
          </p>

          {/* ================= UPLOAD AREA ================= */}
          {files.length === 0 && (
            <div className="relative flex h-56 flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-600 bg-gray-900 hover:bg-gray-700 transition cursor-pointer">
              <div className="text-center px-4">
                <p className="text-sm text-gray-400">
                  <span className="font-semibold text-indigo-400">
                    Click to select PDF
                  </span>{' '}
                  or drag and drop
                </p>
                <p className="text-xs text-gray-500 mt-1">PDF files only</p>
              </div>
              <input
                id="file-input"
                type="file"
                accept="application/pdf"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={handleFileChange}
              />
            </div>
          )}

          {/* ================= FILE LIST & ACTIONS ================= */}
          {files.length > 0 && (
            <>
              <div className="mt-4 space-y-2">
                {files.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm"
                  >
                    <span className="truncate">{file.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                      <button
                        onClick={clearFiles}
                        className="text-red-500 hover:text-red-400 text-xs"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <button
                  onClick={handleRepair}
                  disabled={isProcessing}
                  className={`w-full font-semibold py-3 px-4 rounded-lg transition-colors duration-200 ${
                    isProcessing
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg'
                  }`}
                >
                  {isProcessing ? 'Repairing PDF...' : 'Repair PDF Now'}
                </button>

                {files.length > 1 && (
                  <p className="text-xs text-yellow-500 mt-2 text-center">
                    *Note: Only the first file will be processed currently.
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </main>

      <footer className="mt-16 border-t border-gray-700 py-8 text-center text-sm text-gray-400">
        © 2025 BentoPDF. All rights reserved.
      </footer>
    </div>
  );
}
