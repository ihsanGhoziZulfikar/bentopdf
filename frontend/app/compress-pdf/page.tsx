'use client';

import { useState } from 'react';
import Link from 'next/link';

// Interface untuk data response dari backend
interface CompressResult {
  download_url: string;
  saved_size: string;
  original_size: string;
  compressed_size: string;
}

export default function CompressPDF() {
  const [files, setFiles] = useState<File[]>([]);

  // UBAH 1: Default value disesuaikan dengan API Backend (recommended, extreme, low)
  const [compressionLevel, setCompressionLevel] = useState('recommended');
  const [algorithm, setAlgorithm] = useState('vector');

  // State UI
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // UBAH 2: State untuk menyimpan hasil kompresi dari JSON Backend
  const [resultData, setResultData] = useState<CompressResult | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    // Reset state hasil sebelumnya
    setResultData(null);
    setError(null);
    setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
  };

  const clearFiles = () => {
    setFiles([]);
    setResultData(null);
    setError(null);
  };

  const handleCompress = async () => {
    if (files.length === 0) return;

    setIsLoading(true);
    setError(null);
    setResultData(null);

    try {
      const formData = new FormData();
      formData.append('file', files[0]);

      // Kirim level sesuai API: extreme, recommended, low
      formData.append('level', compressionLevel);

      // Request ke Backend
      const response = await fetch('http://localhost:5000/api/compress', {
        method: 'POST',
        body: formData,
      });

      // UBAH 3: Terima sebagai JSON, BUKAN BLOB
      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || result.details || 'Gagal melakukan kompresi PDF.'
        );
      }

      // Simpan data dari backend ke state
      setResultData(result.data);
    } catch (err: Error | unknown) {
      console.error(err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Terjadi kesalahan saat memproses file.';
      setError(errorMessage || 'Terjadi kesalahan saat memproses file.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 antialiased">
      {/* ================= NAVBAR ================= */}
      <nav className="bg-gray-800 border-b border-gray-700 sticky top-0 z-30">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-white text-xl">
              <div className="h-8 w-8 bg-indigo-500 rounded flex items-center justify-center text-xs">
                PDF
              </div>
              BentoPDF
            </div>

            <div className="hidden md:flex gap-8 text-sm">
              <Link href="/" className="hover:text-indigo-400">
                Home
              </Link>
              <Link href="/about" className="hover:text-indigo-400">
                About
              </Link>
              <Link href="/contact" className="hover:text-indigo-400">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ================= MAIN ================= */}
      <main className="flex justify-center px-4 py-12">
        <div className="w-full max-w-2xl bg-gray-800 border border-gray-700 rounded-xl shadow-xl p-6 md:p-8">
          {/* Back */}
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 text-sm font-semibold"
          >
            ← Back to Tools
          </Link>

          {/* Title */}
          <h1 className="text-2xl font-bold text-white mb-2">Compress PDF</h1>
          <p className="text-gray-400 mb-6">
            Reduce file size significantly while maintaining quality.
          </p>

          {/* ================= UPLOAD AREA ================= */}
          {!resultData && (
            <div className="relative flex h-56 flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-600 bg-gray-900 hover:bg-gray-700 transition cursor-pointer group">
              <div className="text-center px-4 group-hover:scale-105 transition-transform">
                <p className="text-sm text-gray-400">
                  <span className="font-semibold">Click to select files</span>{' '}
                  or drag and drop
                </p>
                <p className="text-xs text-gray-500 mt-1">PDF files only</p>
              </div>

              <input
                type="file"
                accept="application/pdf"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={handleFileChange}
                disabled={isLoading}
              />
            </div>
          )}

          {/* ================= RESULT AREA (SUCCESS) ================= */}
          {resultData && (
            <div className="mb-6 rounded-xl bg-green-900/30 border border-green-800 p-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-900 mb-4">
                <svg
                  className="h-6 w-6 text-green-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white">
                Compression Complete!
              </h3>

              {/* Menampilkan Data Ukuran dari Backend */}
              <div className="mt-4 text-sm text-gray-300 flex justify-center items-center gap-6">
                <div className="text-center">
                  <div className="text-xs text-gray-500">Original</div>
                  <div className="font-mono text-white">
                    {resultData.original_size}
                  </div>
                </div>

                <div className="text-gray-500">→</div>

                <div className="text-center">
                  <div className="text-xs text-gray-500">Compressed</div>
                  <div className="font-mono text-green-400 font-bold">
                    {resultData.compressed_size}
                  </div>
                </div>
              </div>

              <div className="mt-2 text-xs text-green-300 bg-green-900/40 inline-block px-3 py-1 rounded-full">
                Saved: {resultData.saved_size}
              </div>

              <div className="mt-6 flex justify-center gap-3">
                {/* UBAH 4: Link Download menggunakan URL dari Backend */}
                <a
                  href={resultData.download_url}
                  download // Atribut download agar browser memaksa unduh
                  target="_blank" // Jaga-jaga buka tab baru
                  className="rounded-lg bg-green-600 hover:bg-green-700 px-6 py-2.5 font-semibold text-white transition"
                >
                  Download PDF
                </a>
                <button
                  onClick={clearFiles}
                  className="rounded-lg bg-gray-700 hover:bg-gray-600 px-6 py-2.5 font-semibold text-white transition"
                >
                  Compress Another
                </button>
              </div>
            </div>
          )}

          {/* ================= FILE LIST & ACTIONS ================= */}
          {files.length > 0 && !resultData && (
            <>
              <div className="mt-4 space-y-2 text-sm">
                {files.map((file, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center bg-gray-900 border border-gray-700 rounded-lg px-3 py-2"
                  >
                    <span className="truncate max-w-[70%]">{file.name}</span>
                    <span className="text-xs text-gray-400">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                ))}
              </div>

              {/* Error Message */}
              {error && (
                <div className="mt-4 p-3 rounded-lg bg-red-900/50 border border-red-800 text-red-200 text-sm text-center">
                  {error}
                </div>
              )}

              {/* Action Buttons (Clear) */}
              <div className="mt-2 flex justify-end">
                <button
                  onClick={clearFiles}
                  className="text-xs text-red-400 hover:text-red-300 underline"
                  disabled={isLoading}
                >
                  Clear Selection
                </button>
              </div>
            </>
          )}

          {/* ================= OPTIONS & SUBMIT ================= */}
          {files.length > 0 && !resultData && (
            <div className="mt-8 space-y-6">
              <div>
                <label className="block mb-2 text-sm font-medium">
                  Compression Level
                </label>
                {/* UBAH 5: Value Option disesuaikan dengan API Backend */}
                <select
                  value={compressionLevel}
                  onChange={(e) => setCompressionLevel(e.target.value)}
                  className="w-full rounded-lg bg-gray-700 border border-gray-600 p-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  disabled={isLoading}
                >
                  <option value="extreme">
                    Extreme Compression (Low Quality - 72dpi)
                  </option>
                  <option value="recommended">
                    Recommended (Good Quality - 150dpi)
                  </option>
                  <option value="low">
                    Low Compression (High Quality - 300dpi)
                  </option>
                </select>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium">
                  Processing Mode
                </label>
                <select
                  value={algorithm}
                  onChange={(e) => setAlgorithm(e.target.value)}
                  className="w-full rounded-lg bg-gray-700 border border-gray-600 p-2.5 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  disabled={isLoading}
                >
                  <option value="vector">Standard (Text & Vector)</option>
                  <option value="photon">Image Heavy (Scanned Docs)</option>
                </select>
                <p className="mt-2 text-xs text-gray-400">
                  Standard preserves text clarity. Use Image Heavy if the PDF
                  contains mostly photos/scans.
                </p>
              </div>

              <button
                onClick={handleCompress}
                disabled={isLoading}
                className={`w-full rounded-lg py-3 font-semibold text-white transition flex justify-center items-center gap-2
                  ${isLoading ? 'bg-indigo-800 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Compressing...
                  </>
                ) : (
                  'Compress PDF Now'
                )}
              </button>
            </div>
          )}
        </div>
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="mt-16 border-t border-gray-700 py-8 text-center text-sm text-gray-400">
        © 2025 BentoPDF. All rights reserved.
      </footer>
    </div>
  );
}
