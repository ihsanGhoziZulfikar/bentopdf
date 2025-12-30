'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  UploadCloud,
  Menu,
  X,
  FileText,
  Trash2,
  Instagram,
  Linkedin,
  Twitter,
  Github,
} from 'lucide-react';

export default function WordCount() {
  // --- STATE MANAGEMENT ---
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- HANDLERS ---

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];

      // Validasi PDF
      if (
        selectedFile.type !== 'application/pdf' &&
        !selectedFile.name.endsWith('.pdf')
      ) {
        alert('Please upload a valid PDF file.');
        return;
      }

      setFile(selectedFile);
    }
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleCountWords = () => {
    if (!file) return;

    setIsProcessing(true);

    // Simulasi proses hitung kata
    setTimeout(() => {
      setIsProcessing(false);
      alert(`Word count completed for ${file.name}! (Simulation)`);
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
            <button className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 mb-4 font-semibold transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Tools</span>
            </button>
          </Link>

          <h1 className="text-2xl font-bold text-white mb-1">Word Count</h1>
          <p className="text-gray-400 mb-8">Count PDF words</p>

          <div className="space-y-6">
            {/* Upload Area */}
            {!file && (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-600 rounded-xl cursor-pointer bg-gray-900/50 hover:bg-gray-900 hover:border-indigo-500 transition-all duration-300 group"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <UploadCloud className="w-12 h-12 mb-4 text-gray-500 group-hover:text-indigo-400 transition-colors" />
                  <p className="mb-2 text-lg text-gray-300 font-medium">
                    Click to select a file or drag and drop
                  </p>
                  <p className="text-sm text-gray-500">A single PDF file</p>
                  <p className="text-xs text-gray-600 mt-2">
                    Your files never leave your device.
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            )}

            {/* File Selected Display - Solid Style (Matching Summarize PDF) */}
            {file && (
              <div className="bg-[#374151] p-4 rounded-lg flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4 overflow-hidden">
                  <div className="bg-gray-600/50 p-2 rounded">
                    <FileText className="w-8 h-8 text-indigo-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-white font-medium truncate">
                      {file.name}
                    </p>
                    <p className="text-sm text-gray-400">
                      {formatFileSize(file.size)} •{' '}
                      <span className="text-gray-400">Calculated pages...</span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={removeFile}
                  className="p-2 text-red-400 hover:text-red-300 hover:bg-gray-600/50 rounded transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Action Button */}
            <button
              onClick={handleCountWords}
              disabled={!file || isProcessing}
              className={`w-full py-4 px-4 rounded-lg font-bold text-lg transition-all shadow-lg flex justify-center items-center gap-2 ${
                !file || isProcessing
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20'
              }`}
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Counting Words...
                </>
              ) : (
                'Count Words'
              )}
            </button>
          </div>
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
                  <Github className="w-6 h-6" />
                </a>
                <a href="#" className="hover:text-indigo-400">
                  <Twitter className="w-6 h-6" />
                </a>
                <a href="#" className="hover:text-indigo-400">
                  <Instagram className="w-6 h-6" />
                </a>
                <a href="#" className="hover:text-indigo-400">
                  <Linkedin className="w-6 h-6" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
