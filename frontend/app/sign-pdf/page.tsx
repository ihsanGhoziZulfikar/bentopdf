'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function SignPDF() {
  const [file, setFile] = useState<File | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [flatten, setFlatten] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setFile(e.target.files[0]);
    setShowEditor(true);
  };

  const clearFile = () => {
    setFile(null);
    setShowEditor(false);
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
        <div className="w-full max-w-2xl bg-gray-800 border border-gray-700 rounded-xl shadow-xl p-6 md:p-8">
          {/* Back */}
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 text-sm font-semibold"
          >
            ← Back to Tools
          </Link>

          {/* Title */}
          <h1 className="text-2xl font-bold text-white mb-2">Sign PDF</h1>
          <p className="text-gray-400 mb-6 text-sm">
            Upload a PDF to sign it using the built-in PDF.js viewer. Look for
            the <strong>signature / pen tool</strong> in the toolbar.
          </p>

          {/* ================= UPLOAD ================= */}
          <div className="relative flex h-56 flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-600 bg-gray-900 hover:bg-gray-700 transition cursor-pointer">
            <div className="text-center px-4">
              <p className="text-sm text-gray-400">
                <span className="font-semibold">Click to select a file</span> or
                drag and drop
              </p>
              <p className="text-xs text-gray-500 mt-1">PDF Documents</p>
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
            </>
          )}

          {/* ================= SIGNATURE EDITOR ================= */}
          {showEditor && (
            <div className="mt-6 w-full max-w-full">
              <div className="relative w-full h-[85vh] overflow-auto bg-gray-900 border border-gray-600 rounded-lg">
                {/* PDF.js viewer iframe / canvas akan dimasukkan di sini */}
              </div>

              <div className="mt-4 flex items-center gap-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded text-indigo-600 bg-gray-700 border-gray-600 focus:ring-indigo-500"
                    checked={flatten}
                    onChange={(e) => setFlatten(e.target.checked)}
                  />
                  Flatten PDF (use the Save button below)
                </label>
              </div>

              <button
                className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                style={{ display: showEditor ? 'block' : 'none' }}
              >
                Save & Download Signed PDF
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
