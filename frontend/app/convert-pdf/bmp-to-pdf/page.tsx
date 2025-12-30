'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  UploadCloud,
  Instagram,
  Linkedin,
  Menu,
  X,
  Plus,
  Trash2,
  FileImage, // Menggunakan icon FileImage untuk BMP
  FileCheck,
} from 'lucide-react';

export default function BmpToPdf() {
  // --- STATE MANAGEMENT ---
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [quality, setQuality] = useState('medium');
  const [isProcessing, setIsProcessing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- HANDLERS ---

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);

      // Filter khusus BMP
      const bmpFiles = newFiles.filter(
        (f) => f.type === 'image/bmp' || f.name.toLowerCase().endsWith('.bmp')
      );

      if (bmpFiles.length !== newFiles.length) {
        alert('Some files were skipped because they are not BMP images.');
      }

      setFiles((prev) => [...prev, ...bmpFiles]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const clearAllFiles = () => {
    setFiles([]);
  };

  const handleConvert = () => {
    if (files.length === 0) return;

    setIsProcessing(true);

    // Simulasi proses konversi
    setTimeout(() => {
      setIsProcessing(false);
      // Di sini logika download PDF yang sebenarnya akan berjalan
      alert(`Successfully converted ${files.length} BMP images to PDF!`);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 antialiased font-sans flex flex-col">
      {/* --- NAVIGATION --- */}
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

            {/* Desktop Menu */}
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
                href="/tools"
                className="hover:text-indigo-400 transition-colors"
              >
                All Tools
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button
                type="button"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 transition-colors"
              >
                <span className="sr-only">Open main menu</span>
                {!isMenuOpen ? (
                  <Menu className="block h-6 w-6" />
                ) : (
                  <X className="block h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMenuOpen && (
          <div className="md:hidden bg-gray-800 border-t border-gray-700">
            <div className="px-2 pt-2 pb-3 space-y-1 text-center flex flex-col">
              <Link
                href="/"
                className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-gray-700"
              >
                Home
              </Link>
              <Link
                href="/about"
                className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-gray-700"
              >
                About
              </Link>
              <Link
                href="/contact"
                className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-gray-700"
              >
                Contact
              </Link>
              <Link
                href="/tools"
                className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-gray-700"
              >
                All Tools
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* --- MAIN CONTENT --- */}
      <div className="flex-grow flex items-start justify-center py-12 p-4 bg-gray-900">
        <div className="bg-gray-800 rounded-xl shadow-xl px-4 py-8 md:p-8 max-w-2xl w-full text-gray-200 border border-gray-700">
          <Link href="/tools" className="inline-flex">
            <button className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 mb-6 font-semibold transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Tools</span>
            </button>
          </Link>

          <h1 className="text-2xl font-bold text-white mb-2">BMP to PDF</h1>
          <p className="text-gray-400 mb-6">
            Convert one or more BMP images into a single PDF file.
          </p>

          {/* DROP ZONE */}
          <div
            onClick={triggerFileInput}
            className="relative flex flex-col items-center justify-center w-full h-48 md:h-64 border-2 border-dashed border-gray-600 rounded-xl cursor-pointer bg-gray-900 hover:bg-gray-700 transition-colors duration-300 group"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <UploadCloud className="w-10 h-10 mb-3 text-gray-400 group-hover:text-indigo-400 transition-colors" />
              <p className="mb-2 text-sm text-gray-400">
                <span className="font-semibold text-gray-300">
                  Click to select BMP files
                </span>{' '}
                or drag and drop
              </p>
              <p className="text-xs text-gray-500">BMP Images</p>
              <p className="text-xs text-gray-500">
                Your files never leave your device.
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              multiple
              accept="image/bmp,.bmp" // Spesifik BMP
              onChange={handleFileChange}
            />
          </div>

          {/* FILE CONTROLS (Only show if files exist) */}
          {files.length > 0 && (
            <div className="mt-6 animate-in fade-in slide-in-from-top-4 duration-300">
              {/* Action Buttons */}
              <div className="flex gap-3 mb-4">
                <button
                  onClick={triggerFileInput}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add More
                </button>
                <button
                  onClick={clearAllFiles}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors"
                >
                  <X className="w-4 h-4" /> Clear All
                </button>
              </div>

              {/* File List */}
              <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-2 mb-6">
                {files.map((file, index) => (
                  <div
                    key={`${file.name}-${index}`}
                    className="flex justify-between items-center bg-gray-900 p-3 rounded border border-gray-600"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="bg-gray-800 p-2 rounded">
                        <FileImage className="w-5 h-5 text-indigo-400" />
                      </div>
                      <div className="flex flex-col truncate">
                        <span className="text-sm text-gray-200 truncate font-medium">
                          {file.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="text-gray-500 hover:text-red-400 p-1 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* SETTINGS & CONVERT */}
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <div className="mb-4">
                  <label
                    htmlFor="quality"
                    className="block mb-2 text-sm font-medium text-gray-300"
                  >
                    PDF Quality
                  </label>
                  <select
                    id="quality"
                    value={quality}
                    onChange={(e) => setQuality(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2.5 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="high">High Quality (Larger file)</option>
                    <option value="medium">Medium Quality (Balanced)</option>
                    <option value="low">Low Quality (Smaller file)</option>
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    Controls compression (important for large BMP files)
                  </p>
                </div>

                <button
                  onClick={handleConvert}
                  className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-lg transition-all shadow-lg flex justify-center items-center gap-2"
                >
                  <FileCheck className="w-5 h-5" />
                  Convert to PDF
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* --- LOADER MODAL --- */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 p-8 rounded-xl flex flex-col items-center gap-4 border border-gray-700 shadow-2xl">
            {/* Simple CSS Spinner */}
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-white text-lg font-medium animate-pulse">
              Processing...
            </p>
          </div>
        </div>
      )}

      {/* --- FOOTER --- */}
      <footer className="mt-auto border-t-2 border-gray-700 py-8 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center md:text-left">
            <div className="mb-8 md:mb-0">
              <div className="flex items-center justify-center md:justify-start mb-4">
                <img
                  src="/images/favicon.svg"
                  alt="Bento PDF Logo"
                  className="h-10 w-10 mr-3"
                />
                <span className="text-xl font-bold text-white">BentoPDF</span>
              </div>
              <p className="text-gray-400 text-sm">
                &copy; 2025 BentoPDF. All rights reserved.
              </p>
              <p className="text-gray-500 text-xs mt-2">Version 1.0.0</p>
            </div>
            <div>
              <h3 className="font-bold text-white mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/about" className="hover:text-indigo-400">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="hover:text-indigo-400">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-indigo-400">
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-white mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/licensing" className="hover:text-indigo-400">
                    Licensing
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-indigo-400">
                    Terms and Conditions
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-indigo-400">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-white mb-4">Follow Us</h3>
              <div className="flex justify-center md:justify-start space-x-4 text-gray-400">
                <a
                  href="https://github.com/alam00000/bentopdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-indigo-400"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
                <a
                  href="https://discord.gg/Bgq3Ay3f2w"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-indigo-400"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
                  </svg>
                </a>
                <a
                  href="https://www.instagram.com/thebentopdf/"
                  className="hover:text-indigo-400"
                >
                  <Instagram className="w-6 h-6" />
                </a>
                <a
                  href="https://www.linkedin.com/company/bentopdf/"
                  className="hover:text-indigo-400"
                >
                  <Linkedin className="w-6 h-6" />
                </a>
                <a
                  href="https://x.com/BentoPDF"
                  className="hover:text-indigo-400"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
