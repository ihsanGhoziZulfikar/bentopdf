'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  UploadCloud,
  Menu,
  X,
  FileJson,
  Trash2,
  Instagram,
  Linkedin,
} from 'lucide-react';

export default function JsonToPdf() {
  // --- STATE MANAGEMENT ---
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- HANDLERS ---

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      const validFiles = newFiles.filter(
        (f) => f.type === 'application/json' || f.name.endsWith('.json')
      );

      if (validFiles.length !== newFiles.length) {
        alert('Only JSON files are allowed.');
      }

      setFiles((prev) => [...prev, ...validFiles]);
      setStatusMessage(null); // Reset status on new upload
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleConvert = () => {
    if (files.length === 0) return;

    setIsProcessing(true);
    setStatusMessage(null);

    // Simulasi proses konversi
    setTimeout(() => {
      setIsProcessing(false);
      setStatusMessage({
        type: 'success',
        text: 'Conversion successful! Downloading ZIP archive... (Simulation)',
      });
      // Di sini logika download file sebenarnya akan berjalan
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

            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-400 hover:text-white hover:bg-gray-700 p-2 rounded-md"
              >
                {!isMenuOpen ? (
                  <Menu className="h-6 w-6" />
                ) : (
                  <X className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-gray-800 border-t border-gray-700 p-2 space-y-1">
            <Link
              href="/"
              className="block px-3 py-2 rounded-md text-white hover:bg-gray-700"
            >
              Home
            </Link>
            <Link
              href="/about"
              className="block px-3 py-2 rounded-md text-white hover:bg-gray-700"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="block px-3 py-2 rounded-md text-white hover:bg-gray-700"
            >
              Contact
            </Link>
            <Link
              href="/tools"
              className="block px-3 py-2 rounded-md text-white hover:bg-gray-700"
            >
              All Tools
            </Link>
          </div>
        )}
      </nav>

      {/* --- MAIN CONTENT --- */}
      <div className="flex-grow flex items-center justify-center p-4 bg-gray-900">
        <div className="bg-gray-800 rounded-xl shadow-xl p-8 max-w-2xl w-full text-gray-200 border border-gray-700">
          <Link href="/tools">
            <button className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 mb-6 font-semibold transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Tools</span>
            </button>
          </Link>

          <h1 className="text-2xl font-bold text-white mb-2">
            JSON to PDF Converter
          </h1>
          <p className="text-gray-400 mb-6">
            Upload multiple JSON files to convert them all to PDF format. Files
            will be downloaded as a ZIP archive.
          </p>

          {/* Warning Note */}
          <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-4 mb-6">
            <p className="text-yellow-200 text-sm">
              <strong>Note:</strong> Only JSON files created by the PDF-to-JSON
              converter tool are supported. Standard JSON files from other tools
              will not work.
            </p>
          </div>

          <div className="upload-section mb-6">
            {/* Drop Zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-600 rounded-xl cursor-pointer bg-gray-700 hover:bg-gray-600 transition-colors duration-300 group"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <UploadCloud className="w-10 h-10 mb-3 text-gray-400 group-hover:text-indigo-400 transition-colors" />
                <p className="mb-2 text-sm text-gray-300">
                  <span className="font-semibold">Click to select files</span>{' '}
                  or drag and drop
                </p>
                <p className="text-xs text-gray-500">Multiple JSON files</p>
                <p className="text-xs text-gray-500 mt-1">
                  Your files never leave your device.
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {/* File Display Area */}
            {files.length > 0 && (
              <div className="mt-4 space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                {files.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center bg-gray-900 p-3 rounded border border-gray-600 animate-in fade-in slide-in-from-top-1"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <FileJson className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                      <span className="text-sm text-gray-200 truncate">
                        {file.name}
                      </span>
                    </div>
                    <button
                      onClick={() => removeFile(idx)}
                      className="text-gray-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Convert Button */}
            <button
              onClick={handleConvert}
              disabled={files.length === 0 || isProcessing}
              className={`w-full mt-6 py-3 px-4 rounded-lg font-bold transition-all shadow-lg flex justify-center items-center gap-2 ${
                files.length === 0 || isProcessing
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white'
              }`}
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : (
                'Convert to PDF'
              )}
            </button>
          </div>

          {/* Status Message */}
          {statusMessage && (
            <div
              className={`mt-4 p-3 rounded-lg text-sm border ${
                statusMessage.type === 'success'
                  ? 'bg-green-900/30 border-green-700 text-green-200'
                  : 'bg-red-900/30 border-red-700 text-red-200'
              }`}
            >
              {statusMessage.text}
            </div>
          )}
        </div>
      </div>

      {/* --- FOOTER --- */}
      <footer className="mt-16 border-t-2 border-gray-700 py-8 bg-gray-900">
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
            {/* Links Sections... */}
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
                <a href="#" className="hover:text-indigo-400">
                  <Instagram className="w-6 h-6" />
                </a>
                <a href="#" className="hover:text-indigo-400">
                  <Linkedin className="w-6 h-6" />
                </a>
                {/* Icons lainnya disederhanakan */}
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
