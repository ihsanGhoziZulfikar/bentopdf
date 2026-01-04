'use client';

import React, { useState, useEffect } from 'react';
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
  Image as ImageIcon,
} from 'lucide-react';

// --- LIBRARY IMPORTS ---
import * as pdfjsLib from 'pdfjs-dist';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';

// Setup PDF.js Worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

export default function PdfToPng() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scale, setScale] = useState(2.0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Menghindari Hydration Mismatch pada Next.js
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  // --- LOGIKA KONVERSI ---
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
        const viewport = page.getViewport({ scale });

        // Buat canvas sementara untuk rendering
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        if (!context) continue;

        // Atur resolusi canvas sesuai viewport
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // PERBAIKAN: Menambahkan properti 'canvas' yang diwajibkan oleh PDF.js v4+
        const renderContext = {
          canvasContext: context,
          viewport: viewport,
          canvas: canvas, // Properti ini wajib ada sekarang
        };

        // Render PDF ke Canvas
        await page.render(renderContext).promise;

        // Ubah Canvas ke Data URL (PNG)
        const imageData = canvas.toDataURL('image/png');
        // Bersihkan prefix data URL untuk dimasukkan ke ZIP
        const base64Data = imageData.replace(
          /^data:image\/(png|jpg);base64,/,
          ''
        );

        // Tambahkan ke ZIP sebagai file PNG
        zip.file(`page-${i}.png`, base64Data, { base64: true });

        // Bersihkan canvas dari memori (optional)
        canvas.width = 0;
        canvas.height = 0;
      }

      // Generate & Save ZIP
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(
        content,
        `BentoPDF-PNG-${selectedFile.name.replace('.pdf', '')}.zip`
      );
    } catch (error) {
      console.error('Error converting PDF:', error);
      alert('Gagal mengonversi PDF. Silakan coba lagi.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!mounted) return null;

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
      <div className="min-h-screen flex flex-col items-center justify-start py-12 p-4 bg-gray-900">
        <div className="bg-gray-800 rounded-xl shadow-xl px-4 py-8 md:p-8 max-w-2xl w-full text-gray-200 border border-gray-700">
          <Link href="/tools" className="inline-flex">
            <button className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 mb-6 font-semibold transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Tools</span>
            </button>
          </Link>

          <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
            <ImageIcon className="text-indigo-400 w-6 h-6" /> PDF to PNG
          </h1>
          <p className="text-gray-400 mb-6 text-sm italic">
            Konversi halaman PDF menjadi gambar PNG berkualitas tinggi secara
            lokal di browser Anda.
          </p>

          {/* Drop Zone */}
          <div className="relative flex flex-col items-center justify-center w-full h-48 md:h-64 border-2 border-dashed border-gray-600 rounded-xl cursor-pointer bg-gray-900 hover:bg-gray-700 transition-all duration-300 group">
            <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
              <UploadCloud className="w-10 h-10 mb-3 text-gray-400 group-hover:text-indigo-400 transition-colors" />
              <p className="mb-2 text-sm text-gray-400 font-medium">
                <span className="text-indigo-400">Klik untuk pilih file</span>{' '}
                atau drag and drop
              </p>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                Privasi Terjamin: File tidak diupload ke server
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
            <div className="mt-4 p-4 bg-gray-900/50 rounded-lg border border-gray-700 flex justify-between items-center animate-in fade-in duration-300">
              <div className="flex items-center gap-3 overflow-hidden">
                <FileText className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                <span className="text-sm truncate font-medium text-gray-300">
                  {selectedFile.name}
                </span>
              </div>
              <button
                onClick={removeFile}
                className="text-red-400 hover:text-red-300 p-1 transition-colors"
                disabled={isProcessing}
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Options Panel */}
          {selectedFile && (
            <div className="mt-6 space-y-6 animate-in slide-in-from-bottom-2 duration-500">
              <div className="bg-gray-900/30 p-4 rounded-lg border border-gray-700">
                <div className="flex justify-between items-center mb-3">
                  <label
                    htmlFor="png-scale"
                    className="text-xs font-bold uppercase tracking-wider text-gray-400"
                  >
                    Resolusi Gambar
                  </label>
                  <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-400 text-xs rounded-md font-bold">
                    {scale.toFixed(1)}x
                  </span>
                </div>
                <input
                  type="range"
                  id="png-scale"
                  min="1.0"
                  max="3.0"
                  step="0.1"
                  value={scale}
                  onChange={(e) => setScale(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <div className="flex justify-between text-[10px] text-gray-500 mt-2 font-medium">
                  <span>Standard (Cepat)</span>
                  <span>High-Res (Tajam)</span>
                </div>
              </div>

              <button
                onClick={handleConvert}
                disabled={isProcessing}
                className="w-full py-4 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing
                  ? 'Sedang Mengonversi...'
                  : 'Konversi & Download ZIP'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* --- FOOTER --- */}
      <footer className="mt-16 border-t border-gray-700 py-8 bg-gray-900 text-white">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center">
            <img
              src="/images/favicon.svg"
              alt="Bento PDF Logo"
              className="h-6 w-6 mr-2"
            />
            <span className="font-bold">BentoPDF</span>
          </div>
          <p className="text-gray-500 text-xs">
            &copy; 2026 BentoPDF. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Loader Modal */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 p-8 rounded-2xl flex flex-col items-center gap-4 border border-gray-700 shadow-2xl text-center max-w-xs w-full">
            <div className="w-12 h-12 border-4 border-gray-600 border-t-indigo-500 rounded-full animate-spin"></div>
            <div className="space-y-1">
              <p className="text-white text-lg font-medium">
                Memproses Halaman...
              </p>
              <p className="text-gray-400 text-xs italic">
                Mengubah vektor menjadi pixel. Harap tunggu.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
