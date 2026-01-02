'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  UploadCloud,
  Instagram,
  Linkedin,
  Menu,
  X,
  FileText,
  Trash2,
} from 'lucide-react';

// --- LIBRARY IMPORTS ---
import * as pdfjsLib from 'pdfjs-dist';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';

// Setup PDF.js Worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

export default function PdfToBmp() {
  // --- STATE MANAGEMENT ---
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Handler saat file dipilih
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Hapus file
  const removeFile = () => {
    setSelectedFile(null);
  };

  // --- LOGIC KONVERSI ---
  const handleConvert = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    const zip = new JSZip();

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;

      // Loop setiap halaman PDF
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);

        // Atur resolusi (Scale 2.0 = Kualitas Bagus)
        const viewport = page.getViewport({ scale: 2.0 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        if (context) {
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          // Render halaman PDF ke Canvas (Penting: Kirim objek canvas, bukan context untuk v4+)
          await page.render({
            canvas: canvas,
            viewport: viewport,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any).promise;

          // Ambil data gambar sebagai BMP
          const imageData = canvas.toDataURL('image/bmp').split(',')[1];

          // Masukkan ke ZIP
          zip.file(`page-${i}.bmp`, imageData, { base64: true });
        }
      }

      // Generate ZIP dan Download
      const zipContent = await zip.generateAsync({ type: 'blob' });
      saveAs(
        zipContent,
        `BentoPDF-${selectedFile.name.replace('.pdf', '')}-BMP.zip`
      );
    } catch (error) {
      console.error('Conversion error:', error);
      alert('Gagal memproses file PDF.');
    } finally {
      setIsProcessing(false);
    }
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
                className="p-2 text-gray-400 hover:text-white transition-colors"
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
      </nav>

      {/* --- MAIN CONTENT --- */}
      <div className="min-h-screen flex flex-col items-center justify-start py-12 p-4 bg-gray-900 text-white">
        <div className="bg-gray-800 rounded-xl shadow-xl px-4 py-8 md:p-8 max-w-2xl w-full text-gray-200 border border-gray-700">
          <Link href="/tools" className="inline-flex">
            <button className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 mb-6 font-semibold transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Tools</span>
            </button>
          </Link>

          <h1 className="text-2xl font-bold text-white mb-2">PDF to BMP</h1>
          <p className="text-gray-400 mb-6">
            Convert each page of a PDF file into a BMP image.
          </p>

          {/* Drop Zone */}
          <div className="relative flex flex-col items-center justify-center w-full h-48 md:h-64 border-2 border-dashed border-gray-600 rounded-xl cursor-pointer bg-gray-900 hover:bg-gray-700 transition-colors duration-300 group">
            <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
              <UploadCloud className="w-10 h-10 mb-3 text-gray-400 group-hover:text-indigo-400" />
              <p className="mb-2 text-sm text-gray-400">
                <span className="font-semibold text-indigo-400">
                  Click to select a file
                </span>{' '}
                or drag and drop
              </p>
              <p className="text-xs text-gray-500 italic">
                Processing happens entirely in your browser.
              </p>
            </div>
            <input
              type="file"
              className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
              accept="application/pdf"
              onChange={handleFileChange}
              disabled={isProcessing}
            />
          </div>

          {/* File Display Area */}
          {selectedFile && (
            <div className="mt-4 p-3 bg-gray-900 rounded-lg border border-gray-700 flex justify-between items-center animate-fade-in transition-all">
              <div className="flex items-center gap-3 overflow-hidden">
                <FileText className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                <span className="text-sm truncate font-medium">
                  {selectedFile.name}
                </span>
              </div>
              <button
                onClick={removeFile}
                className="text-red-400 hover:text-red-300"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Download Button */}
          {selectedFile && (
            <div className="mt-6">
              <button
                onClick={handleConvert}
                disabled={isProcessing}
                className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-lg transition-all shadow-lg active:scale-95 disabled:opacity-50"
              >
                {isProcessing ? 'Processing...' : 'Download All as ZIP'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* --- FOOTER --- */}
      <footer className="mt-16 border-t-2 border-gray-700 py-8 bg-gray-900 text-white">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center">
            <img
              src="/images/favicon.svg"
              alt="Bento PDF Logo"
              className="h-8 w-8 mr-2"
            />
            <span className="font-bold">BentoPDF</span>
          </div>
          <p className="text-gray-500 text-sm">
            © 2026 BentoPDF. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Loader Modal Terintegrasi */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-8 rounded-lg flex flex-col items-center gap-4 border border-gray-700 shadow-xl">
            <div className="solid-spinner border-4 border-gray-600 border-t-indigo-500 w-12 h-12 rounded-full animate-spin"></div>
            <p className="text-white text-lg font-medium">
              Creating BMP images...
            </p>
            <p className="text-gray-400 text-xs">
              Your files never leave your device.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
