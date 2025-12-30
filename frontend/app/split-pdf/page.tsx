'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function SplitPDF() {
  const [file, setFile] = useState<File | null>(null);
  const [splitMode, setSplitMode] = useState('range');

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
          {/* Back Button */}
          <button className="mb-6 flex items-center gap-2 text-indigo-400 hover:text-indigo-300 text-sm font-semibold">
            ← Back to Tools
          </button>

          {/* Title */}
          <h1 className="text-2xl font-bold text-white mb-2">Split PDF</h1>
          <p className="text-gray-400 mb-6">
            Extract pages from a PDF using various methods.
          </p>

          {/* ================= FILE UPLOAD ================= */}
          <div className="relative flex h-56 flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-600 bg-gray-900 hover:bg-gray-700 transition cursor-pointer">
            <div className="text-center px-4">
              <p className="text-sm text-gray-400">
                <span className="font-semibold">Click to select a file</span> or
                drag and drop
              </p>
              <p className="text-xs text-gray-500 mt-1">A single PDF file</p>
              <p className="text-xs text-gray-500">
                Your files never leave your device
              </p>
            </div>

            <input
              type="file"
              accept="application/pdf"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={(e) => {
                const selected = e.target.files?.[0];
                if (selected) setFile(selected);
              }}
            />
          </div>

          {/* File info */}
          {file && (
            <div className="mt-4 text-sm text-gray-300">
              Selected file:{' '}
              <span className="font-semibold text-white">{file.name}</span>
            </div>
          )}

          {/* ================= SPLIT OPTIONS ================= */}
          <div className="mt-8 space-y-4">
            <div>
              <label className="block mb-2 text-sm font-medium">
                Split Mode
              </label>
              <select
                value={splitMode}
                onChange={(e) => setSplitMode(e.target.value)}
                className="w-full rounded-lg bg-gray-700 border border-gray-600 p-2.5 text-white"
              >
                <option value="range">Extract by Page Range</option>
                <option value="even-odd">Even / Odd Pages</option>
                <option value="all">Split All Pages</option>
                <option value="visual">Visual Selection</option>
                <option value="bookmarks">Split by Bookmarks</option>
                <option value="n-times">Split N Times</option>
              </select>
            </div>

            {/* INFO PANEL */}
            <div className="rounded-lg border border-gray-700 bg-gray-900 p-4 text-sm text-gray-400">
              <strong className="text-white block mb-1">How it works:</strong>

              {splitMode === 'range' && (
                <p>
                  Extract pages using ranges like <code>1-3, 6, 9-12</code>.
                </p>
              )}

              {splitMode === 'even-odd' && (
                <p>Extract all even or all odd pages.</p>
              )}

              {splitMode === 'all' && (
                <p>Each page will be saved as a separate PDF.</p>
              )}

              {splitMode === 'visual' && (
                <p>Select pages visually from thumbnails.</p>
              )}

              {splitMode === 'bookmarks' && (
                <p>Split the document based on bookmarks.</p>
              )}

              {splitMode === 'n-times' && <p>Split the PDF every N pages.</p>}
            </div>

            <button
              disabled={!file}
              className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed py-2.5 font-semibold text-white transition"
            >
              Split PDF
            </button>
          </div>
        </div>
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="mt-16 border-t border-gray-700 py-8 text-center text-sm text-gray-400">
        © 2025 BentoPDF. All rights reserved.
      </footer>
    </div>
  );
}
