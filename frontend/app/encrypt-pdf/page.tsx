'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function EncryptPDF() {
  const [file, setFile] = useState<File | null>(null);
  const [userPassword, setUserPassword] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('');
  const [showOptions, setShowOptions] = useState(false);

  // State baru untuk loading
  const [isProcessing, setIsProcessing] = useState(false);

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

  // ==========================================
  // LOGIC KE BACKEND
  // ==========================================
  const handleEncrypt = async () => {
    if (!file || !userPassword) {
      alert('Mohon pilih file dan isi User Password.');
      return;
    }

    setIsProcessing(true);

    try {
      const formData = new FormData();

      // ===============================================
      // PERBAIKAN: Masukkan Text Fields DULUAN!
      // ===============================================
      formData.append('userPassword', userPassword);

      if (ownerPassword) {
        formData.append('ownerPassword', ownerPassword);
      }

      // ===============================================
      // FILE WAJIB DITARUH PALING TERAKHIR
      // ===============================================
      formData.append('file', file);

      // Fetch ke backend
      const response = await fetch('http://localhost:5000/api/pdf/encrypt', {
        method: 'POST',
        body: formData,
        // JANGAN set header 'Content-Type': 'multipart/form-data' secara manual!
        // Biarkan browser yang mengaturnya agar boundary-nya benar.
      });

      if (!response.ok) {
        // ... (kode error handling kamu yang tadi)
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.indexOf('application/json') !== -1) {
          const errData = await response.json();
          throw new Error(errData.message || 'Gagal mengenkripsi PDF');
        } else {
          const text = await response.text();
          throw new Error(
            `Server Error: ${response.status} ${response.statusText}`
          );
        }
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `protected_${file.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Terjadi kesalahan sistem.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 antialiased">
      {/* ... (NAVBAR SAMA SEPERTI KODEMU) ... */}
      <nav className="bg-gray-800 border-b border-gray-700 sticky top-0 z-30">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-white text-xl">
              <span className="text-indigo-500">Bento</span>PDF
            </div>
            {/* Link Navigasi singkat aja */}
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

          <h1 className="text-2xl font-bold text-white mb-2">Encrypt PDF</h1>
          <p className="text-gray-400 mb-6 text-sm">
            Protect your PDF with 256-bit AES encryption. Add password
            protection and set usage restrictions.
          </p>

          {/* ================= UPLOAD AREA ================= */}
          {!showOptions && (
            <div className="relative flex h-56 flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-600 bg-gray-900 hover:bg-gray-700 transition cursor-pointer">
              <div className="text-center px-4">
                <p className="text-sm text-gray-400">
                  <span className="font-semibold text-indigo-400">
                    Click to select PDF
                  </span>{' '}
                  or drag and drop
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
          )}

          {/* ================= FILE & OPTIONS ================= */}
          {file && (
            <>
              {/* File Info */}
              <div className="mt-4 flex justify-between items-center bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm">
                <span className="truncate">{file.name}</span>
                <div className="flex items-center">
                  <span className="text-xs text-gray-400 mr-3">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                  <button
                    onClick={clearFile}
                    className="text-red-500 hover:text-red-400 text-xs"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* Input Passwords */}
              <div className="mt-6 space-y-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">
                    User Password (Required){' '}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    placeholder="Enter password to open PDF"
                    className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={userPassword}
                    onChange={(e) => setUserPassword(e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This password will be required to open the PDF.
                  </p>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">
                    Owner Password (Optional)
                  </label>
                  <input
                    type="password"
                    placeholder="Enter password for permissions"
                    className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={ownerPassword}
                    onChange={(e) => setOwnerPassword(e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    If set, restricts editing/printing/copying.
                  </p>
                </div>

                <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                  <h3 className="text-sm font-semibold text-white mb-2">
                    Encryption Details:
                  </h3>
                  <ul className="text-xs text-gray-400 space-y-1 list-disc list-inside">
                    <li>256-bit AES encryption (highest security)</li>
                    <li>Owner password prevents editing & copying text.</li>
                  </ul>
                </div>

                {/* BUTTON ACTION */}
                <button
                  onClick={handleEncrypt}
                  disabled={isProcessing || !userPassword}
                  className={`w-full font-semibold py-3 px-4 rounded-lg transition-colors duration-200 ${
                    isProcessing || !userPassword
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-900/20'
                  }`}
                >
                  {isProcessing ? 'Encrypting PDF...' : 'Encrypt PDF Now'}
                </button>
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
