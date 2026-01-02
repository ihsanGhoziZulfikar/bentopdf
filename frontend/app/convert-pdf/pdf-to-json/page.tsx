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
  Loader2,
  Download
} from 'lucide-react';

// Library pendukung
import * as pdfjsLib from 'pdfjs-dist';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';

// Setup Worker (Menggunakan Unpkg agar stabil di Client-Side)
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

export default function PdfToJson() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | '', message: string }>({ type: '', message: '' });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...newFiles]);
      setStatus({ type: '', message: '' }); // Reset status
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  // --- LOGIC KONVERSI ---
  const handleConvert = async () => {
    if (files.length === 0) return;
    
    setIsProcessing(true);
    setStatus({ type: '', message: 'Processing your files...' });
    
    const zip = new JSZip();

    try {
      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        
        const pdfData: any = {
          metadata: { fileName: file.name, totalPages: pdf.numPages },
          pages: []
        };

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const items = textContent.items.map((item: any) => ({
            text: item.str,
            transform: item.transform,
            width: item.width,
            height: item.height
          }));

          pdfData.pages.push({ pageNumber: i, content: items });
        }

        // Tambahkan file JSON ke dalam ZIP
        const jsonString = JSON.stringify(pdfData, null, 2);
        zip.file(`${file.name.replace('.pdf', '')}.json`, jsonString);
      }

      // Generate ZIP dan Download
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, 'BentoPDF_Converted_JSON.zip');
      
      setStatus({ type: 'success', message: 'Success! All files converted.' });
      setFiles([]); // Opsional: bersihkan list file setelah sukses
    } catch (error) {
      console.error(error);
      setStatus({ type: 'error', message: 'Failed to convert files. Check console for details.' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 antialiased font-sans">
      {/* --- NAVIGATION (Sama seperti punya Anda) --- */}
      <nav className="bg-gray-800 border-b border-gray-700 sticky top-0 z-30">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0 flex items-center cursor-pointer">
              <img src="/images/favicon.svg" alt="Bento PDF Logo" className="h-8 w-8" />
              <span className="text-white font-bold text-xl ml-2">
                <Link href="/">BentoPDF</Link>
              </span>
            </div>
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8 text-white">
              <Link href="/" className="hover:text-indigo-400">Home</Link>
              <Link href="/about" className="hover:text-indigo-400">About</Link>
              <Link href="/contact" className="hover:text-indigo-400">Contact</Link>
              <Link href="/tools" className="hover:text-indigo-400">All Tools</Link>
            </div>
            {/* Mobile Button */}
            <div className="md:hidden flex items-center">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-gray-400 hover:text-white">
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* --- MAIN CONTENT --- */}
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-900">
        <div className="bg-gray-800 rounded-xl shadow-xl p-8 max-w-2xl w-full text-gray-200 border border-gray-700">
          <Link href="/tools" className="inline-flex">
            <button className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 mb-6 font-semibold transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Tools</span>
            </button>
          </Link>

          <h1 className="text-2xl font-bold text-white mb-2">PDF to JSON Converter</h1>
          <p className="text-gray-400 mb-6">
            Upload multiple PDF files to convert them all to JSON format. Files
            will be downloaded as a ZIP archive.
          </p>

          <div className="upload-section mb-6">
            {/* Drop Zone */}
            <div className="relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-600 rounded-xl cursor-pointer bg-gray-700 hover:bg-gray-600 transition-colors group">
              <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                <UploadCloud className="w-10 h-10 mb-3 text-gray-400 group-hover:text-indigo-400" />
                <p className="mb-2 text-sm text-gray-300">
                  <span className="font-semibold">Click to select files</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500 italic">Your files never leave your device (Pure Client-Side).</p>
              </div>
              <input
                type="file"
                id="pdfFiles"
                accept="application/pdf"
                multiple
                className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleFileChange}
                disabled={isProcessing}
              />
            </div>

            {/* File List */}
            {files.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm text-gray-400 mb-2 font-medium">Selected Files ({files.length}):</p>
                <div className="max-h-40 overflow-y-auto pr-2 custom-scrollbar space-y-2">
                  {files.map((file, index) => (
                    <div key={`${file.name}-${index}`} className="flex justify-between items-center bg-gray-900 p-2 rounded border border-gray-600">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <FileText className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                        <span className="text-sm truncate text-gray-300">{file.name}</span>
                      </div>
                      <button onClick={() => removeFile(index)} className="text-red-400 hover:text-red-300 p-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Status Message */}
            {status.message && (
              <div className={`mt-4 p-3 rounded-lg text-sm ${status.type === 'error' ? 'bg-red-900/30 text-red-400 border border-red-800' : 'bg-indigo-900/30 text-indigo-400 border border-indigo-800'}`}>
                {status.message}
              </div>
            )}

            {/* Convert Button */}
            <button
              onClick={handleConvert}
              disabled={files.length === 0 || isProcessing}
              className={`w-full mt-6 py-3 px-4 font-bold rounded-lg transition-all shadow-lg flex items-center justify-center gap-2 ${
                files.length === 0 || isProcessing
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white'
              }`}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Converting...</span>
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  <span>Convert to JSON</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* --- FOOTER (Sama seperti punya Anda) --- */}
      <footer className="mt-16 border-t-2 border-gray-700 py-8 bg-gray-900">
        {/* ... (Footer content dari kode Anda) ... */}
      </footer>
    </div>
  );
}