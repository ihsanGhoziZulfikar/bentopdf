'use client';

import React, { useState, ChangeEvent } from 'react';
import Link from 'next/link';

export default function MergePDF() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // --- STATE ---
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isMerging, setIsMerging] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 1. Fungsi saat user memilih file
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles(filesArray);
      setDownloadUrl(null);
      setErrorMsg(null);
    }
  };

  // 2. Fungsi Utama: Kirim ke Backend Express
  // PERUBAHAN PENTING: Menambahkan event 'e' untuk mencegah reload
  const handleMerge = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (selectedFiles.length < 2) {
      setErrorMsg('Please select at least 2 PDF files to merge.');
      return;
    }

    setIsMerging(true);
    setErrorMsg(null);

    try {
      const formData = new FormData();
      selectedFiles.forEach((file) => {
        formData.append('files', file);
      });

      const response = await fetch('http://localhost:5000/api/merge', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        // Fix: Berikan tipe data 'unknown' lalu cek propertinya
        const errorData = (await response.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(errorData.error || 'Merge process failed on server.');
      }

      const blob = await response.blob();

      // Buat URL
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = 'bento-merged.pdf';
      document.body.appendChild(a);
      a.click();

      // Cleanup
      a.remove();
      window.URL.revokeObjectURL(url);

      // Optional: tampilkan UI sukses
      setDownloadUrl(url);
    } catch (error) {
      // --- PERBAIKAN TYPE SCRIPT DI SINI ---
      // Jangan pakai (err: any). Pakai 'error' biasa lalu di-cast.
      console.error('Frontend Error:', error);

      let message = 'Failed to connect to server or merge files.';
      if (error instanceof Error) {
        message = error.message;
      }

      setErrorMsg(message);
    } finally {
      setIsMerging(false);
    }
  };

  return (
    <div className="antialiased bg-gray-900 min-h-screen text-gray-200">
      {/* Navigation */}
      <nav className="bg-gray-800 border-b border-gray-700 sticky top-0 z-30">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0 flex items-center cursor-pointer">
              <img
                src="/images/favicon.svg"
                alt="Bento PDF Logo"
                className="h-8 w-8"
              />
              <span className="text-white font-bold text-xl ml-2">
                <Link href="/">BentoPDF</Link>
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8 text-white">
              <Link
                href="/"
                className="hover:text-indigo-400 transition-colors"
              >
                Home
              </Link>
              <Link
                href="/about"
                className="hover:text-indigo-400 transition-colors"
              >
                About
              </Link>
              <Link
                href="/contact"
                className="hover:text-indigo-400 transition-colors"
              >
                Contact
              </Link>
              <Link
                href="/"
                className="hover:text-indigo-400 transition-colors"
              >
                All Tools
              </Link>
            </div>

            {/* Mobile Hamburger Button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none"
              >
                {!isMobileMenuOpen ? (
                  <svg
                    className="block h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-gray-800 border-t border-gray-700">
            <div className="px-2 pt-2 pb-3 space-y-1 text-center flex flex-col">
              <Link
                href="/"
                className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md"
              >
                Home
              </Link>
              <Link
                href="/about"
                className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md"
              >
                About
              </Link>
              <Link
                href="/contact"
                className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md"
              >
                Contact
              </Link>
            </div>
          </div>
        )}
      </nav>

      <main
        id="uploader"
        className="min-h-screen flex flex-col items-center justify-start py-12 p-4"
      >
        <div
          id="tool-uploader"
          className="bg-gray-800 rounded-xl shadow-xl px-4 py-8 md:p-8 max-w-2xl w-full border border-gray-700"
        >
          <Link
            href="/"
            className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 mb-6 font-semibold"
          >
            <span>← Back to Tools</span>
          </Link>

          <h1 className="text-2xl font-bold text-white mb-2">Merge PDFs</h1>
          <p className="text-gray-400 mb-6">
            Combine multiple PDF files into one document securely.
          </p>

          {/* --- AREA HASIL DOWNLOAD --- */}
          {downloadUrl && (
            <div className="mb-6 p-4 bg-green-900/30 border border-green-600 rounded-lg text-center animate-pulse">
              <p className="text-green-400 font-bold mb-3">
                ✅ Merge Successful!
              </p>
              <a
                href={downloadUrl}
                download="bento-merged.pdf"
                className="inline-block px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg transition-colors"
              >
                Download Merged PDF
              </a>
              <button
                onClick={() => {
                  setDownloadUrl(null);
                  setSelectedFiles([]);
                }}
                className="block mx-auto mt-3 text-sm text-gray-400 hover:text-white underline"
              >
                Merge Another File
              </button>
            </div>
          )}

          {/* --- DROP ZONE --- */}
          {!downloadUrl && (
            <>
              <div className="relative flex flex-col items-center justify-center w-full h-48 md:h-64 border-2 border-dashed border-gray-600 rounded-xl cursor-pointer bg-gray-900 hover:bg-gray-700 transition-colors duration-300">
                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                  <svg
                    className="w-10 h-10 mb-3 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <p className="mb-2 text-sm text-gray-400">
                    <span className="font-semibold">Click to select files</span>{' '}
                    or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    PDFs only (Min 2 files)
                  </p>
                </div>

                <input
                  type="file"
                  className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                  multiple
                  accept="application/pdf"
                  onChange={handleFileChange}
                />
              </div>

              {/* --- LIST FILES --- */}
              {selectedFiles.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-white font-semibold mb-2">
                    Selected Files ({selectedFiles.length}):
                  </h3>
                  <ul className="space-y-2 mb-6">
                    {selectedFiles.map((file, index) => (
                      <li
                        key={index}
                        className="flex items-center text-sm text-gray-300 bg-gray-700 px-3 py-2 rounded"
                      >
                        <span className="mr-2">📄</span>
                        {file.name}{' '}
                        <span className="text-gray-500 text-xs ml-2">
                          ({(file.size / 1024).toFixed(1)} KB)
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* ERROR MESSAGE */}
                  {errorMsg && (
                    <div className="mb-4 p-3 bg-red-900/50 border border-red-500 text-red-200 text-sm rounded">
                      {errorMsg}
                    </div>
                  )}

                  {/* BUTTON MERGE */}
                  <button
                    type="button" // <--- WAJIB: Agar tidak dianggap tombol submit form
                    onClick={handleMerge}
                    disabled={isMerging}
                    className={`w-full py-3 px-4 rounded-lg font-bold text-white transition-all 
                            ${isMerging ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500 shadow-lg hover:shadow-indigo-500/30'}`}
                  >
                    {isMerging ? (
                      <span className="flex items-center justify-center">
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                        Uploading & Merging...
                      </span>
                    ) : (
                      'Merge PDF Now'
                    )}
                  </button>
                </div>
              )}
            </>
          )}

          {/* --- INFO PRIVASI --- */}
          <div className="mt-6 p-4 bg-gray-900 rounded-lg border border-gray-700">
            <p className="text-sm text-indigo-300">
              Note: Files are uploaded securely to our server for processing and{' '}
              <strong>automatically deleted</strong> immediately after the
              download is ready.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-gray-700 py-12 bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1">
              <div className="flex items-center mb-4">
                <img
                  src="/images/favicon.svg"
                  alt="Logo"
                  className="h-8 w-8 mr-2"
                />
                <span className="text-xl font-bold text-white">BentoPDF</span>
              </div>
              <p className="text-gray-400 text-sm">
                © 2025 BentoPDF. All rights reserved.
              </p>
            </div>
            {/* ...Footer links... */}
          </div>
        </div>
      </footer>
    </div>
  );
}
