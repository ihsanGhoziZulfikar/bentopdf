'use client';

import React, { useState, ChangeEvent, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '../components/navbar';
import * as pdfjsLib from 'pdfjs-dist';

// Konfigurasi Worker PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

interface FileResult {
  name: string;
  pages: number;
  wordCount: number;
  charCount: number;
  readingTime: number;
}

export default function WordCountPDF() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<FileResult[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles(filesArray);
      setResults([]);
      setErrorMsg(null);
    }
  };

  const analyzePDF = async (file: File): Promise<FileResult> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      fullText += pageText + ' ';
    }

    const cleanText = fullText.trim();
    const words = cleanText ? cleanText.split(/\s+/).length : 0;
    const chars = cleanText.length;
    // Estimasi: 225 kata per menit
    const time = Math.ceil(words / 225);

    return {
      name: file.name,
      pages: pdf.numPages,
      wordCount: words,
      charCount: chars,
      readingTime: time,
    };
  };

  const handleCount = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (selectedFiles.length === 0) return;

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const analysisResults = await Promise.all(
        selectedFiles.map((file) => analyzePDF(file))
      );
      setResults(analysisResults);
    } catch (error) {
      console.error(error);
      setErrorMsg(
        'Gagal menganalisis file. Pastikan PDF berisi teks (bukan hasil scan gambar).'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-8 font-medium"
        >
          <svg
            className="w-5 h-5 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Tools
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Kiri: Upload & List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              {selectedFiles.length === 0 ? (
                <div className="border-2 border-dashed border-blue-200 rounded-xl p-12 text-center bg-blue-50/30">
                  <img
                    src="/asset/images/upload.svg"
                    alt="upload"
                    className="w-24 h-24 mx-auto mb-4"
                  />
                  <p className="text-gray-700 font-medium mb-4">
                    Pilih file PDF untuk dihitung jumlah katanya
                  </p>
                  <label className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-full cursor-pointer hover:bg-blue-700 transition-colors shadow-md">
                    Browse File
                    <input
                      type="file"
                      multiple
                      accept="application/pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedFiles.map((file, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100"
                    >
                      <div className="flex items-center gap-3 truncate">
                        <div className="bg-red-100 text-red-600 p-2 rounded text-xs font-bold">
                          PDF
                        </div>
                        <span className="text-sm font-medium truncate">
                          {file.name}
                        </span>
                      </div>
                      <button
                        onClick={() => setSelectedFiles([])}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor font-bold"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* HASIL ANALISIS */}
            {results.length > 0 && (
              <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-gray-900 px-6 py-4">
                  <h3 className="text-white font-bold text-lg">
                    Analysis Result
                  </h3>
                </div>
                <div className="p-6 space-y-8">
                  {results.map((res, index) => (
                    <div
                      key={index}
                      className="font-mono text-sm sm:text-base text-gray-800 leading-relaxed"
                    >
                      <div className="grid grid-cols-[100px_10px_1fr] gap-1">
                        <span>File</span>
                        <span>:</span>
                        <span className="font-bold text-blue-700">
                          {res.name}
                        </span>
                        <span>Pages</span>
                        <span>:</span>
                        <span>{res.pages}</span>
                        <span>Words</span>
                        <span>:</span>
                        <span>{res.wordCount.toLocaleString()}</span>
                        <span>Characters</span>
                        <span>:</span>
                        <span>{res.charCount.toLocaleString()}</span>
                        <span>Reading Time</span>
                        <span>:</span>
                        <span>±{res.readingTime} menit</span>
                      </div>
                      {index !== results.length - 1 && (
                        <hr className="my-6 border-dashed border-gray-300" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Kanan: Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-4">Word Count PDF</h2>
              <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                Hitung jumlah kata, karakter, dan estimasi waktu baca secara
                instan langsung di browser Anda.
              </p>

              {errorMsg && (
                <p className="text-red-500 text-xs mb-4 p-2 bg-red-50 rounded border border-red-100">
                  {errorMsg}
                </p>
              )}

              <button
                onClick={handleCount}
                disabled={selectedFiles.length === 0 || isProcessing}
                className="w-full py-3 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 disabled:bg-gray-200 transition-all flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Analyzing...
                  </>
                ) : (
                  'Count Words'
                )}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
