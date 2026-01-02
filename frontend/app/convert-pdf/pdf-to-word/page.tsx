'use client';

import React, { useState } from 'react';
import Navbar from '../../components/navbar'; // Sesuaikan path
import Footer from '../../components/footer/main-footer'; // Sesuaikan path
import { FileText, Download, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import * as pdfjsLib from 'pdfjs-dist';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';

// Konfigurasi Worker PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
export default function PdfToWordPage() {
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  const convertToWord = async () => {
    if (!file) return;
    setLoading(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const docSections = [];

      // Ekstraksi teks dari setiap halaman
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        
        // Mengelompokkan teks sederhana
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');

        docSections.push({
          properties: {},
          children: [
            new Paragraph({
              children: [new TextRun({ text: pageText, size: 24 })],
            }),
          ],
        });
      }

      // Generate file Word
      const doc = new Document({ sections: docSections });
      const blob = await Packer.toBlob(doc);
      
      // Download file
      saveAs(blob, `${file.name.replace('.pdf', '')}.docx`);
    } catch (error) {
      console.error("Conversion failed", error);
      alert("Gagal mengonversi file. Pastikan PDF tidak terenkripsi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-20">
        <Link href="/" className="flex items-center text-blue-600 mb-8 hover:underline">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Tools
        </Link>

        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-center">
          <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <FileText className="w-10 h-10 text-blue-600" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">PDF to Word</h1>
          <p className="text-gray-600 mb-8">Ubah file PDF Anda menjadi dokumen Word yang dapat diedit secara instan.</p>

          <div className="max-w-md mx-auto">
            <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <p className="mb-2 text-sm text-gray-500 font-semibold">
                  {file ? file.name : "Klik untuk unggah atau seret file"}
                </p>
                <p className="text-xs text-gray-400">PDF (Max 10MB)</p>
              </div>
              <input type="file" className="hidden" accept=".pdf" onChange={handleFileChange} />
            </label>

            <button
              onClick={convertToWord}
              disabled={!file || loading}
              className={`w-full mt-6 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                !file || loading 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Memproses...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" /> Konversi ke Word
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