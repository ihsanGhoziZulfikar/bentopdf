'use client';

import React, { useState, useRef, useEffect, ChangeEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/app/components/navbar';
import ToolsFooter from '@/app/components/footer/tools-footer';
import { ArrowLeft, Trash2, ImageIcon, Loader2, UploadCloud, Check, Settings } from 'lucide-react';

// --- LIBRARY IMPORTS ---
import * as pdfjsLib from 'pdfjs-dist';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';

// Setup PDF.js Worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

export default function PdfToBmp() {
  // --- STATE MANAGEMENT ---
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [scale, setScale] = useState(2.0); // Resolusi
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // --- HANDLERS ---
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];

      if (file.type !== 'application/pdf') {
        setErrorMsg('Silakan pilih file PDF yang valid.');
        if (e.target) e.target.value = '';
        return;
      }

      // LANGSUNG SET FILE
      setSelectedFile(file);
      setErrorMsg(null);
      setDownloadUrl(null);
      setIsUploading(true);
      setUploadProgress(0);

      if (e.target) e.target.value = '';

      let progress = 0;
      const interval = setInterval(() => {
        progress += 25;
        setUploadProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
          setIsUploading(false);
        }
      }, 100);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setDownloadUrl(null);
    setUploadProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // --- LOGIKA KONVERSI PDF KE GAMBAR BMP ---
  const handleConvert = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsProcessing(true);
    setErrorMsg(null);
    const zip = new JSZip();

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: scale });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        if (!context) continue;

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // Render PDF ke Canvas
        await page.render({
          canvasContext: context,
          viewport: viewport,
          canvas: canvas, 
        }).promise;

        // Convert Canvas ke Blob BMP (Browser default to PNG/JPG, kita bungkus jadi BMP)
        const blob = await new Promise<Blob | null>((resolve) => 
            canvas.toBlob((b) => resolve(b), 'image/bmp')
        );

        if (blob) {
          zip.file(`halaman-${i}.bmp`, blob);
        }

        canvas.width = 0;
        canvas.height = 0;
      }

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);

      setDownloadUrl(url);
      setIsProcessing(false);
      setShowSuccessModal(true);

      saveAs(content, `BentoPDF-BMP-${selectedFile.name.replace('.pdf', '')}.zip`);

    } catch (error) {
      console.error('BMP Conversion Error:', error);
      setIsProcessing(false);
      setShowErrorModal(true);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8 flex-grow w-full">
        <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-8 font-semibold transition-colors">
          <ArrowLeft className="w-5 h-5 mr-1" />
          <span>Back to Tools</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* KOLOM KIRI: Upload */}
          <div className="lg:col-span-2 order-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-8 text-center">
              <div 
                onClick={() => !isProcessing && fileInputRef.current?.click()}
                className="border-2 border-dashed border-blue-200 rounded-2xl p-12 bg-blue-50/30 hover:bg-blue-50/60 transition-all cursor-pointer group"
              >
                <div className="flex justify-center mb-6">
                  <div className="relative w-24 h-24 group-hover:scale-110 transition-transform">
                    <img src="/asset/images/upload.svg" alt="upload" className="w-full h-full object-contain" />
                  </div>
                </div>
                <p className="text-gray-700 text-lg font-bold mb-2">Pilih file PDF Anda</p>
                <p className="text-gray-500 mb-8 text-sm italic">Ubah halaman PDF menjadi gambar BMP tanpa kompresi</p>
                <input ref={fileInputRef} type="file" accept="application/pdf" onChange={handleFileChange} className="hidden" />
                <div className="inline-flex items-center px-10 py-3.5 bg-blue-600 text-white rounded-full shadow-lg font-bold text-sm">
                  <UploadCloud className="w-5 h-5 mr-2" />
                  Browse File
                </div>
              </div>

              {isUploading && (
                <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-100 animate-in fade-in">
                  <div className="flex justify-between text-xs font-bold mb-2 uppercase text-gray-400">
                    <span>Membaca PDF...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>
              )}

              {selectedFile && (
                <div className="mt-8 animate-in slide-in-from-top-2">
                  <h3 className="text-left text-base font-bold text-gray-900 mb-4 uppercase tracking-wider">File Terpilih</h3>
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex justify-between items-center shadow-sm">
                    <div className="flex items-center gap-4 truncate">
                      <div className="bg-indigo-600 text-white px-3 py-2 rounded-lg font-black text-[10px] tracking-widest uppercase">BMP</div>
                      <span className="text-sm font-bold text-gray-900 truncate">{selectedFile.name}</span>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); removeFile(); }} className="text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* KOLOM KANAN: Sidebar */}
          <div className="lg:col-span-1 order-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 sticky top-24 h-fit">
              <h2 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-2">
                <Settings className="text-blue-600 w-7 h-7" /> Settings
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-8 font-medium">
                Sesuaikan resolusi gambar BMP yang dihasilkan. BMP memberikan kualitas gambar asli tanpa kompresi.
              </p>

              {selectedFile && !isUploading && (
                <div className="mb-8 p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Resolusi</label>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-bold">{scale.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min="1.0"
                    max="3.0"
                    step="0.1"
                    value={scale}
                    onChange={(e) => setScale(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>
              )}

              <button
                onClick={handleConvert}
                disabled={!selectedFile || isUploading || isProcessing}
                className="w-full py-4 bg-gray-900 text-white rounded-full font-black text-lg hover:bg-black disabled:bg-gray-100 disabled:text-gray-300 transition-all flex items-center justify-center gap-3 shadow-xl"
              >
                {isProcessing ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Merender...</>
                ) : (
                  "Mulai Konversi"
                )}
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* SUCCESS MODAL */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-3xl p-10 max-w-sm w-full text-center shadow-2xl animate-in zoom-in duration-300">
            <Image src="/asset/images/success-modal.svg" alt="success" width={100} height={100} className="mx-auto mb-6" />
            <h2 className="text-2xl font-black text-gray-900 mb-2">Berhasil!</h2>
            <button onClick={() => saveAs(downloadUrl!, 'BentoPDF-Result.zip')} className="w-full py-4 bg-blue-600 text-white rounded-full font-bold mb-3 shadow-lg hover:bg-blue-700 transition-all">Download ZIP</button>
            <button onClick={() => {setShowSuccessModal(false); setSelectedFile(null);}} className="w-full py-3 text-gray-400 font-bold hover:text-gray-900">Konversi Lagi</button>
          </div>
        </div>
      )}

      <ToolsFooter />
    </div>
  );
}