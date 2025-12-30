'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function EncryptPDF() {
  const [file, setFile] = useState<File | null>(null);
  const [userPassword, setUserPassword] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('');
  const [showOptions, setShowOptions] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setFile(e.target.files[0]);
    setShowOptions(true);
  };

  const clearFile = () => {
    setFile(null);
    setShowOptions(false);
    setUserPassword('');
    setOwnerPassword('');
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
          <h1 className="text-2xl font-bold text-white mb-2">Encrypt PDF</h1>
          <p className="text-gray-400 mb-6 text-sm">
            Protect your PDF with 256-bit AES encryption. Add password
            protection and set usage restrictions.
          </p>

          {/* ================= UPLOAD ================= */}
          <div className="relative flex h-56 flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-600 bg-gray-900 hover:bg-gray-700 transition cursor-pointer">
            <div className="text-center px-4">
              <p className="text-sm text-gray-400">
                <span className="font-semibold">Click to select PDF</span> or
                drag and drop
              </p>
              <p className="text-xs text-gray-500 mt-1">
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
          )}

          {/* ================= TOOL OPTIONS ================= */}
          {showOptions && (
            <div className="mt-6 space-y-4">
              {/* User Password */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-300">
                  User Password (Required)
                </label>
                <input
                  type="password"
                  placeholder="Enter password to open PDF"
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2.5"
                  value={userPassword}
                  onChange={(e) => setUserPassword(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  This password will be required to open the PDF.
                </p>
              </div>

              {/* Owner Password */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-300">
                  Owner Password (Optional)
                </label>
                <input
                  type="password"
                  placeholder="Enter password for permissions (optional)"
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2.5"
                  value={ownerPassword}
                  onChange={(e) => setOwnerPassword(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  If provided, usage restrictions will be applied. Leave empty
                  for no restrictions.
                </p>
              </div>

              {/* Encryption Info */}
              <div className="p-4 bg-gray-900 rounded-lg border border-gray-700">
                <h3 className="text-sm font-semibold text-white mb-2">
                  Encryption Details:
                </h3>
                <ul className="text-xs text-gray-400 space-y-1 list-disc list-inside">
                  <li>256-bit AES encryption (highest security)</li>
                  <li>User password required to open PDF</li>
                  <li>Owner password enables usage restrictions</li>
                  <li>Without owner password: no restrictions applied</li>
                </ul>
              </div>

              {/* Encrypt Button */}
              <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200">
                Encrypt PDF
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
