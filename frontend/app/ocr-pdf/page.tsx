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
  // --- STATE MANAGEMENT ---
  const [file, setFile] = useState<File | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  // State Proses
  const [isLoading, setIsLoading] = useState(false);
  const [ocrResult, setOcrResult] = useState<{
    text: string;
    pdfUrl: string;
  } | null>(null);
  const [statusMessage, setStatusMessage] = useState('Initializing...');

  // Handle Select File
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setOcrResult(null); // Reset hasil lama
    }
  };

  // Handle OCR API Call
  const handleStartOCR = async () => {
    if (!file) return;

    setIsLoading(true);
    setStatusMessage('Uploading and Processing PDF...');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('language', 'eng+ind'); // Default dual language

      const response = await fetch('http://localhost:5000/api/pdf/ocr', {
        method: 'POST',
        body: formData,
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.message || 'Gagal melakukan OCR');
      }

      // Set Hasil
      setOcrResult({
        text: json.data.text,
        pdfUrl: json.data.searchable_pdf,
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Terjadi kesalahan server');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper Copy Text
  const copyToClipboard = () => {
    if (ocrResult?.text) {
      navigator.clipboard.writeText(ocrResult.text);
      alert('Text copied to clipboard!');
    }
  };

  // Helper Download Text
  const downloadTextFile = () => {
    if (!ocrResult?.text) return;
    const element = document.createElement('a');
    const fileBlob = new Blob([ocrResult.text], { type: 'text/plain' });
    element.href = URL.createObjectURL(fileBlob);
    element.download = 'ocr_result.txt';
    document.body.appendChild(element);
    element.click();
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 antialiased font-sans">
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
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button
                type="button"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-400 hover:text-white hover:bg-gray-700 p-2 rounded-md"
              >
                <span className="sr-only">Open main menu</span>
                {!isMenuOpen ? (
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
                    className="block h-6 w-6"
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
          <div className="md:hidden bg-gray-800 border-t border-gray-700 p-2 space-y-1">
            <Link
              href="/"
              className="block px-3 py-2 text-white hover:bg-gray-700 rounded"
            >
              Home
            </Link>
            <Link
              href="/tools"
              className="block px-3 py-2 text-white hover:bg-gray-700 rounded"
            >
              All Tools
            </Link>
          </div>
        )}
      </nav>

      {/* --- MAIN CONTENT --- */}
      <div className="min-h-screen flex flex-col items-center justify-start py-12 p-4 bg-gray-900">
        <div className="bg-gray-800 rounded-xl shadow-xl px-4 py-8 md:p-8 max-w-2xl w-full text-gray-200 border border-gray-700">
          <Link
            href="/"
            className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 mb-6 font-semibold transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Tools</span>
          </Link>

          <h1 className="text-2xl font-bold text-white mb-2">OCR PDF</h1>
          <p className="text-gray-400 mb-6">
            Convert scanned PDFs into searchable documents. Select one or more
            languages present in your file.
          </p>

          {/* How it works info box */}
          <div className="p-3 bg-gray-900 rounded-lg border border-gray-700 mb-6">
            <p className="text-sm text-gray-300">
              <strong className="text-white">How it works:</strong>
            </p>
            <ul className="list-disc list-inside text-xs text-gray-400 mt-1 space-y-1">
              <li>
                <strong className="text-white">Extract Text:</strong> Uses OCR
                logic to recognize text.
              </li>
              <li>
                <strong className="text-white">Searchable Output:</strong>{' '}
                Creates text data from images.
              </li>
            </ul>
          </div>

          {/* DROP ZONE */}
          {!file && (
            <div className="relative flex flex-col items-center justify-center w-full h-48 md:h-64 border-2 border-dashed border-gray-600 rounded-xl cursor-pointer bg-gray-900 hover:bg-gray-700 transition-colors duration-300 group">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <UploadCloud className="w-10 h-10 mb-3 text-gray-400 group-hover:text-indigo-400 transition-colors" />
                <p className="mb-2 text-sm text-gray-400">
                  <span className="font-semibold">Click to select PDF</span> or
                  drag and drop
                </p>
              </div>
              <input
                type="file"
                className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                accept="application/pdf"
                onChange={handleFileChange}
              />
            </div>
          )}

          {/* FILE SELECTED DISPLAY */}
          {file && (
            <div className="bg-gray-900 border border-gray-600 rounded-lg p-4 flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-900 p-2 rounded text-indigo-300 font-bold text-xs">
                  PDF
                </div>
                <div>
                  <p className="text-sm font-medium text-white truncate max-w-[200px]">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setFile(null);
                  setOcrResult(null);
                }}
                className="text-red-400 hover:text-red-300 text-sm font-semibold"
              >
                Change
              </button>
            </div>
          )}

          {/* OPTIONS & PROCESS BUTTON */}
          {file && !ocrResult && !isLoading && (
            <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
              {/* Advanced settings (Visual Only for now) */}
              <div className="bg-gray-900 border border-gray-700 rounded-lg p-3">
                <button
                  onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                  className="w-full text-sm font-medium text-gray-300 cursor-pointer flex items-center justify-between focus:outline-none"
                >
                  <span>Advanced Settings</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${isAdvancedOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                {isAdvancedOpen && (
                  <div className="mt-4 p-2 text-xs text-gray-500">
                    Settings like Resolution and Whitelist are auto-optimized
                    for this version.
                  </div>
                )}
              </div>

              <button
                onClick={handleStartOCR}
                className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-lg transition-all shadow-lg"
              >
                Start OCR Processing
              </button>
            </div>
          )}

          {/* RESULTS SECTION */}
          {ocrResult && (
            <div
              id="ocr-results"
              className="mt-6 animate-in fade-in zoom-in duration-300"
            >
              <h3 className="text-xl font-bold text-white mb-2">
                OCR Complete
              </h3>
              <p className="mb-4 text-gray-400 text-sm">
                Text extracted successfully. Copy or download below.
              </p>

              <div className="relative">
                <textarea
                  rows={10}
                  className="w-full bg-gray-900 border border-gray-600 text-gray-300 rounded-lg p-2.5 font-sans focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  readOnly
                  value={ocrResult.text}
                ></textarea>
                <button
                  onClick={copyToClipboard}
                  className="absolute top-2 right-2 bg-gray-700 hover:bg-gray-600 p-2 rounded-md transition-colors"
                  title="Copy to Clipboard"
                >
                  <ClipboardCopy className="w-4 h-4 text-gray-300" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <button
                  onClick={downloadTextFile}
                  className="w-full bg-gray-700 text-white font-semibold py-3 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Download as .txt
                </button>
                <a
                  href={ocrResult.pdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="block w-full"
                >
                  <button className="w-full bg-green-600 text-white font-semibold py-3 rounded-lg hover:bg-green-700 transition-colors">
                    Download Result PDF
                  </button>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* --- FOOTER --- */}
      <footer className="mt-16 border-t-2 border-gray-700 py-8 bg-gray-900">
        <div className="container mx-auto px-4 text-center text-gray-400 text-sm">
          &copy; 2025 BentoPDF. All rights reserved.
        </div>
      </footer>

      {/* --- LOADER MODAL --- */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-8 rounded-lg flex flex-col items-center gap-4 border border-gray-700 shadow-xl">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-indigo-500 border-opacity-75"></div>
            <p className="text-white text-lg font-medium">{statusMessage}</p>
            <p className="text-gray-400 text-xs text-center max-w-xs">
              Analyzing document structure and recognizing text...
              <br />
              This might take a moment.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
