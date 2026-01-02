'use client';

import React, { useState } from 'react';
import Navbar from '../../components/navbar';
import Footer from '../../components/footer/main-footer';
import { Download, Loader2, ArrowLeft, AlignLeft } from 'lucide-react';
import Link from 'next/link';
import { saveAs } from 'file-saver';

export default function PdfToTextPage() {
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  const convertToText = async () => {
    if (!file) return;
    setLoading(true);

    try {
      // ✅ IMPORT DINAMIS PDFJS (FIX DOMMatrix)
      const pdfjsLib = await import('pdfjs-dist');

      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      let fullText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();

        const pageText = textContent.items
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((item: any) => item.str)
          .join(' ');

        fullText += `--- Halaman ${i} ---\n${pageText}\n\n`;
      }

      const blob = new Blob([fullText], {
        type: 'text/plain;charset=utf-8',
      });

      saveAs(blob, `${file.name.replace('.pdf', '')}.txt`);
    } catch (error) {
      console.error('Conversion failed:', error);
      alert('Gagal mengekstrak teks. Pastikan PDF tidak terenkripsi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-20">
        <Link
          href="/"
          className="flex items-center text-blue-600 mb-8 hover:underline"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Tools
        </Link>

        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-center">
          <div className="w-20 h-20 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlignLeft className="w-10 h-10 text-orange-600" />
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">PDF to Text</h1>
          <p className="text-gray-600 mb-8">
            Ekstrak semua teks dari dokumen PDF Anda menjadi file teks murni
            (.txt).
          </p>

          <div className="max-w-md mx-auto">
            <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <p className="mb-2 text-sm text-gray-500 font-semibold">
                  {file ? file.name : 'Klik untuk unggah atau seret file PDF'}
                </p>
                <p className="text-xs text-gray-400">
                  Hanya mendukung format .pdf
                </p>
              </div>
              <input
                type="file"
                className="hidden"
                accept=".pdf"
                onChange={handleFileChange}
              />
            </label>

            <button
              onClick={convertToText}
              disabled={!file || loading}
              className={`w-full mt-6 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                !file || loading
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-orange-500 text-white hover:bg-orange-600 shadow-lg shadow-orange-100'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Mengekstrak...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" /> Unduh File Text
                </>
              )}
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
