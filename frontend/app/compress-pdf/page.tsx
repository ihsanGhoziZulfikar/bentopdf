'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function CompressPDF() {
  const [files, setFiles] = useState<File[]>([]);
  const [compressionLevel, setCompressionLevel] = useState('balanced');
  const [algorithm, setAlgorithm] = useState('vector');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
  };

  const clearFiles = () => setFiles([]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 antialiased">
      {/* ================= NAVBAR ================= */}
      <nav className="bg-gray-800 border-b border-gray-700 sticky top-0 z-30">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-white text-xl">
              <img
                src="/images/favicon.svg"
                alt="BentoPDF Logo"
                className="h-8 w-8"
              />
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
              <Link href="/" className="hover:text-indigo-400">
                All Tools
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
            Reduce file size by choosing the compression method that best suits
            your document.
          </p>

          {/* ================= UPLOAD ================= */}
          <div className="relative flex h-56 flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-600 bg-gray-900 hover:bg-gray-700 transition cursor-pointer">
            <div className="text-center px-4">
              <p className="text-sm text-gray-400">
                <span className="font-semibold">Click to select files</span> or
                drag and drop
              </p>
              <p className="text-xs text-gray-500 mt-1">
                One or more PDF files
              </p>
              <p className="text-xs text-gray-500">
                Your files never leave your device
              </p>
            </div>

            <input
              type="file"
              accept="application/pdf"
              multiple
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={handleFileChange}
            />
          </div>

          {/* File list */}
          {files.length > 0 && (
            <>
              <div className="mt-4 space-y-2 text-sm">
                {files.map((file, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center bg-gray-900 border border-gray-700 rounded-lg px-3 py-2"
                  >
                    <span className="truncate">{file.name}</span>
                    <span className="text-xs text-gray-400">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex gap-3">
                <label className="cursor-pointer rounded-lg bg-indigo-600 hover:bg-indigo-700 px-4 py-2 text-sm font-semibold text-white">
                  Add More Files
                  <input
                    type="file"
                    accept="application/pdf"
                    multiple
                    hidden
                    onChange={handleFileChange}
                  />
                </label>

                <button
                  onClick={clearFiles}
                  className="rounded-lg bg-red-600 hover:bg-red-700 px-4 py-2 text-sm font-semibold text-white"
                >
                  Clear All
                </button>
              </div>
            </>
          )}

          {/* ================= OPTIONS ================= */}
          {files.length > 0 && (
            <div className="mt-8 space-y-6">
              <div>
                <label className="block mb-2 text-sm font-medium">
                  Compression Level
                </label>
                <select
                  value={compressionLevel}
                  onChange={(e) => setCompressionLevel(e.target.value)}
                  className="w-full rounded-lg bg-gray-700 border border-gray-600 p-2.5 text-white"
                >
                  <option value="balanced">Balanced (Recommended)</option>
                  <option value="high-quality">High Quality</option>
                  <option value="small-size">Smallest Size</option>
                  <option value="extreme">Extreme</option>
                </select>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium">
                  Compression Algorithm
                </label>
                <select
                  value={algorithm}
                  onChange={(e) => setAlgorithm(e.target.value)}
                  className="w-full rounded-lg bg-gray-700 border border-gray-600 p-2.5 text-white"
                >
                  <option value="vector">Vector (Text Heavy PDF)</option>
                  <option value="photon">Photon (Images & Scans)</option>
                </select>
                <p className="mt-2 text-xs text-gray-400">
                  Vector for text-based PDFs, Photon for scanned or image-heavy
                  PDFs.
                </p>
              </div>

              <button className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-700 py-2.5 font-semibold text-white transition">
                Compress PDF
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
