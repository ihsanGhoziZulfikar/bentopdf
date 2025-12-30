'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function EditPDF() {
  const [file, setFile] = useState<File | null>(null);
  const [showEmbed, setShowEmbed] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setFile(e.target.files[0]);
    setShowEmbed(true);
  };

  const clearFile = () => {
    setFile(null);
    setShowEmbed(false);
  };

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
        <div className="w-full max-w-2xl bg-gray-800 border border-gray-700 rounded-xl shadow-xl p-6 md:p-8 text-blue-400">
          {/* Back */}
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 text-sm font-semibold"
          >
            ← Back to Tools
          </Link>

          {/* Title */}
          <h1 className="text-2xl font-bold text-white mb-2">PDF Editor</h1>
          <p className="text-gray-400 mb-6">
            Annotate, highlight, redact, comment, add shapes/images, search, and
            view PDFs.
          </p>

          {/* ================= UPLOAD ================= */}
          <div className="relative flex h-56 flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-600 bg-gray-900 hover:bg-gray-700 transition cursor-pointer">
            <div className="text-center px-4">
              <p className="text-sm text-gray-400">
                <span className="font-semibold">Click to select a file</span> or
                drag and drop
              </p>
              <p className="text-xs text-gray-500 mt-1">PDF file</p>
              <p className="text-xs text-gray-500">
                Your files never leave your device.
              </p>
            </div>

            <input
              type="file"
              accept="application/pdf"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={handleFileChange}
            />
          </div>

          {/* ================= FILE DISPLAY ================= */}
          {file && (
            <>
              <div className="mt-4 flex justify-between items-center bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm">
                <span className="truncate">{file.name}</span>
                <span className="text-xs text-gray-400">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </span>
                <button
                  onClick={clearFile}
                  className="ml-2 text-red-500 hover:text-red-400 text-xs"
                >
                  Clear
                </button>
              </div>

              {/* ================= EMBED PDF ================= */}
              {showEmbed && (
                <div className="mt-6 w-full h-[75vh] border border-gray-600 rounded-lg">
                  <div id="embed-pdf-container" className="w-full h-full">
                    {/* PDF viewer logic will be added here */}
                  </div>
                </div>
              )}
            </>
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
