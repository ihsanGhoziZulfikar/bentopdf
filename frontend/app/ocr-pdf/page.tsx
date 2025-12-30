'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  UploadCloud,
  ChevronDown,
  ClipboardCopy,
  Instagram,
  Linkedin,
} from 'lucide-react';

export default function OcrPDF() {
  // State sederhana untuk UI (Logic backend akan menyusul)
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 antialiased font-sans">
      {/* --- NAVIGATION --- 
          Catatan: Idealnya Navigasi ditaruh di layout.tsx, 
          tapi saya masukkan di sini sesuai request copy-paste HTML lama. 
      */}
      <nav className="bg-gray-800 border-b border-gray-700 sticky top-0 z-30">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div
              className="flex-shrink-0 flex items-center cursor-pointer"
              id="home-logo"
            >
              {/* Pastikan file gambar ada di folder public/images/ */}
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
                {/* Icon Menu Hamburger / Close Switch */}
                {!isMenuOpen ? (
                  <svg
                    className="block h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
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
                    className="block h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
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

      {/* --- MAIN CONTENT (UPLOADER) --- */}
      <div
        id="uploader"
        className="min-h-screen flex flex-col items-center justify-start py-12 p-4 bg-gray-900"
      >
        <div
          id="tool-uploader"
          className="bg-gray-800 rounded-xl shadow-xl px-4 py-8 md:p-8 max-w-2xl w-full text-gray-200 border border-gray-700"
        >
          <button
            id="back-to-tools"
            className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 mb-6 font-semibold transition-colors"
          >
            <ArrowLeft className="w-5 h-5 cursor-pointer" />
            <span className="cursor-pointer">Back to Tools</span>
          </button>

          <h1 className="text-2xl font-bold text-white mb-2">OCR PDF</h1>
          <p className="text-gray-400 mb-6">
            Convert scanned PDFs into searchable documents. Select one or more
            languages present in your file for the best results.
          </p>

          {/* How it works info box */}
          <div className="p-3 bg-gray-900 rounded-lg border border-gray-700 mb-6">
            <p className="text-sm text-gray-300">
              <strong className="text-white">How it works:</strong>
            </p>
            <ul className="list-disc list-inside text-xs text-gray-400 mt-1 space-y-1">
              <li>
                <strong className="text-white">Extract Text:</strong> Uses OCR
                logic to recognize text from scanned images or PDFs.
              </li>
              <li>
                <strong className="text-white">Searchable Output:</strong>{' '}
                Creates a new PDF with an invisible text layer.
              </li>
              <li>
                <strong className="text-white">Character Filtering:</strong> Use
                whitelists to filter out unwanted characters.
              </li>
              <li>
                <strong className="text-white">Multi-language Support:</strong>{' '}
                Select multiple languages for documents containing mixed
                language content.
              </li>
            </ul>
          </div>

          {/* Drop Zone */}
          <div
            id="drop-zone"
            className="relative flex flex-col items-center justify-center w-full h-48 md:h-64 border-2 border-dashed border-gray-600 rounded-xl cursor-pointer bg-gray-900 hover:bg-gray-700 transition-colors duration-300 group"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <UploadCloud className="w-10 h-10 mb-3 text-gray-400 group-hover:text-indigo-400 transition-colors" />
              <p className="mb-2 text-sm text-gray-400">
                <span className="font-semibold">Click to select PDF</span> or
                drag and drop
              </p>
              <p className="text-xs text-gray-500">
                Your files never leave your device.
              </p>
            </div>
            <input
              id="file-input"
              type="file"
              className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
              accept="application/pdf"
            />
          </div>

          <div id="file-display-area" className="mt-4 space-y-2"></div>

          {/* OCR Options (Hidden by default in original HTML, shown here for structure) */}
          <div id="tool-options" className="mt-6 space-y-4">
            {/* Note: logic to show/hide this based on file upload needs to be added with React State later */}

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-300">
                Languages in Document
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="lang-search"
                  className="w-full bg-gray-900 border border-gray-600 text-white rounded-lg p-2.5 mb-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Search for languages..."
                />
                <div
                  id="lang-list"
                  className="max-h-48 overflow-y-auto border border-gray-600 rounded-lg p-2 bg-gray-900 hidden"
                >
                  {/* Language checkboxes will be populated here via JS/React */}
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Selected:{' '}
                <span id="selected-langs-display" className="font-semibold">
                  None
                </span>
              </p>
            </div>

            {/* Advanced settings */}
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-3">
              <button
                onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                className="w-full text-sm font-medium text-gray-300 cursor-pointer flex items-center justify-between focus:outline-none"
              >
                <span>Advanced Settings (Recommended to improve accuracy)</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${isAdvancedOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {isAdvancedOpen && (
                <div className="mt-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* Resolution */}
                  <div>
                    <label
                      htmlFor="ocr-resolution"
                      className="block mb-1 text-xs font-medium text-gray-400"
                    >
                      Resolution
                    </label>
                    <select
                      id="ocr-resolution"
                      defaultValue="3.0"
                      className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="2.0">Standard (192 DPI)</option>
                      <option value="3.0">High (288 DPI)</option>
                      <option value="4.0">Ultra (384 DPI)</option>
                    </select>
                  </div>
                  {/* Binarization */}
                  <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                    <input
                      type="checkbox"
                      id="ocr-binarize"
                      className="w-4 h-4 rounded text-indigo-600 bg-gray-700 border-gray-600 focus:ring-indigo-500"
                    />
                    Binarize Image (Enhance Contrast for Clean Scans)
                  </label>
                  {/* Whitelist Presets */}
                  <div>
                    <label
                      htmlFor="whitelist-preset"
                      className="block mb-1 text-xs font-medium text-gray-400"
                    >
                      Character Whitelist Preset
                    </label>
                    <select
                      id="whitelist-preset"
                      defaultValue=""
                      className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2 text-sm mb-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">None (All characters)</option>
                      <option value="alphanumeric">
                        Alphanumeric + Basic Punctuation
                      </option>
                      <option value="numbers-currency">
                        Numbers + Currency Symbols
                      </option>
                      <option value="letters-only">
                        Letters Only (A-Z, a-z)
                      </option>
                      <option value="numbers-only">Numbers Only (0-9)</option>
                      <option value="invoice">
                        Invoice/Receipt (Numbers, $, ., -, /)
                      </option>
                      <option value="forms">
                        Forms (Alphanumeric + Common Symbols)
                      </option>
                      <option value="custom">Custom...</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Only these characters will be recognized. Leave empty for
                      all characters.
                    </p>
                  </div>
                  {/* Whitelist Input */}
                  <div>
                    <label
                      htmlFor="ocr-whitelist"
                      className="block mb-1 text-xs font-medium text-gray-400"
                    >
                      Character Whitelist (Optional)
                    </label>
                    <input
                      type="text"
                      id="ocr-whitelist"
                      className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="e.g., abcdefghijklmnopqrstuvwxyz0123456789$.,"
                    />
                  </div>
                </div>
              )}
            </div>

            <button
              id="process-btn"
              className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-lg transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              disabled
            >
              Start OCR
            </button>
          </div>

          {/* Progress Section */}
          <div
            id="ocr-progress"
            className="hidden mt-6 p-4 bg-gray-900 border border-gray-700 rounded-lg"
          >
            <p id="progress-status" className="text-white mb-2">
              Initializing...
            </p>
            <div className="w-full bg-gray-700 rounded-full h-4">
              <div
                id="progress-bar"
                className="bg-indigo-600 h-4 rounded-full transition-all duration-300"
                style={{ width: '0%' }}
              ></div>
            </div>
            <pre
              id="progress-log"
              className="mt-4 text-xs text-gray-400 max-h-32 overflow-y-auto bg-black p-2 rounded-md font-mono"
            ></pre>
          </div>

          {/* Results Section */}
          <div id="ocr-results" className="hidden mt-6">
            <h3 className="text-xl font-bold text-white mb-2">OCR Complete</h3>
            <p className="mb-4 text-gray-400">
              Your searchable PDF is ready. You can also copy or download the
              extracted text below.
            </p>
            <div className="relative">
              <textarea
                id="ocr-text-output"
                rows={10}
                className="w-full bg-gray-900 border border-gray-600 text-gray-300 rounded-lg p-2.5 font-sans focus:ring-indigo-500 focus:border-indigo-500"
                readOnly
              ></textarea>
              <button
                id="copy-text-btn"
                className="absolute top-2 right-2 bg-gray-700 hover:bg-gray-600 p-2 rounded-md transition-colors"
                title="Copy to Clipboard"
              >
                <ClipboardCopy className="w-4 h-4 text-gray-300" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <button
                id="download-txt-btn"
                className="w-full bg-gray-700 text-white font-semibold py-3 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Download as .txt
              </button>
              <button
                id="download-searchable-pdf"
                className="w-full bg-green-600 text-white font-semibold py-3 rounded-lg hover:bg-green-700 transition-colors"
              >
                Download Searchable PDF
              </button>
            </div>
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
                  href="https://github.com/nicholaschen09/BentoPDF"
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

      {/* Loader & Alert Modals 
          (Sebaiknya dibuat sebagai komponen terpisah dan dikontrol oleh State, 
          tapi diletakkan di sini agar struktur HTML tetap utuh)
      */}
      <div
        id="loader-modal"
        className="hidden fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
      >
        <div className="bg-gray-800 p-8 rounded-lg flex flex-col items-center gap-4 border border-gray-700 shadow-xl">
          <div className="solid-spinner border-4 border-t-indigo-500 w-12 h-12 rounded-full animate-spin"></div>
          <p id="loader-text" className="text-white text-lg font-medium">
            Processing...
          </p>
        </div>
      </div>
    </div>
  );
}
