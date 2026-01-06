'use client';

import React, { useState, useRef, useEffect, ChangeEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '../../components/navbar';
import ToolsFooter from '@/app/components/footer/tools-footer';
import { ArrowLeft, Trash2, AlignLeft, Loader2, UploadCloud, Check } from 'lucide-react';
import { saveAs } from 'file-saver';

export default function PdfToTextPage() {
  // --- STATE MANAGEMENT ---
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // --- HANDLERS (PERBAIKAN UPLOAD INSTAN) ---

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const selectedFile = files[0];
      
      if (selectedFile.type !== 'application/pdf') {
        alert('Hanya file PDF yang diperbolehkan.');
        e.target.value = ''; // Reset input jika salah
        return;
      }

      // 1. LANGSUNG SET FILE (Ini yang membuat file langsung muncul di UI)
      setFile(selectedFile);
      setIsUploading(true);
      setUploadProgress(0);

      // 2. RESET INPUT DOM (Agar bisa upload file yang sama berkali-kali tanpa error)
      if (e.target) {
        e.target.value = '';
      }

      // 3. Jalankan Animasi Progress (Hanya untuk kosmetik/UX)
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
    setFile(null);
    setUploadProgress(0);
    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // --- LOGIKA ASLI ---
  const convertToText = async () => {
    if (!file) return;
    setLoading(true);

    try {
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        fullText += `--- Halaman ${i} ---\n${pageText}\n\n`;
      }

      const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
      saveAs(blob, `${file.name.replace('.pdf', '')}.txt`);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Conversion failed:', error);
      alert('Gagal mengekstrak teks.');
    } finally {
      setLoading(false);
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
          {/* AREA KIRI: Upload Area */}
          <div className="lg:col-span-2 order-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-8 text-center">
              
              <div 
                onClick={() => !loading && fileInputRef.current?.click()}
                className="border-2 border-dashed border-blue-200 rounded-2xl p-12 bg-blue-50/30 hover:bg-blue-50/60 transition-all cursor-pointer group"
              >
                <div className="flex justify-center mb-6">
                  <div className="relative w-24 h-24 group-hover:scale-110 transition-transform">
                    <img src="/asset/images/upload.svg" alt="upload" className="w-full h-full object-contain" />
                  </div>
                </div>
                <p className="text-gray-700 text-lg font-bold mb-2">Pilih file PDF Anda</p>
                <p className="text-gray-500 mb-8 text-sm italic">Ekstrak teks PDF menjadi file TXT secara instan</p>
                
                <input 
                  ref={fileInputRef} 
                  type="file" 
                  accept="application/pdf" 
                  onChange={handleFileChange} 
                  className="hidden" 
                />
                
                <div className="inline-flex items-center px-10 py-3.5 bg-blue-600 text-white rounded-full shadow-lg font-bold text-sm">
                  <UploadCloud className="w-5 h-5 mr-2" />
                  Browse File
                </div>
              </div>

              {/* Progress Bar Area */}
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

              {/* File Display (Muncul Sekali Klik) */}
              {file && (
                <div className="mt-8 animate-in slide-in-from-top-2">
                  <h3 className="text-left text-base font-bold text-gray-900 mb-4 uppercase tracking-wider">File Terpilih</h3>
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex justify-between items-center shadow-sm">
                    <div className="flex items-center gap-4 truncate">
                      <div className="bg-orange-600 text-white px-3 py-2 rounded-lg font-black text-[10px] tracking-widest uppercase">TXT</div>
                      <span className="text-sm font-bold text-gray-900 truncate">{file.name}</span>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); removeFile(); }} className="text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* AREA KANAN: Sidebar */}
          <div className="lg:col-span-1 order-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 sticky top-24 h-fit">
              <h2 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-2">
                <AlignLeft className="text-orange-500 w-7 h-7" /> PDF to Text
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-8">
                Konversi halaman PDF menjadi file teks murni yang bisa diedit.
              </p>

              <button
                onClick={convertToText}
                disabled={!file || isUploading || loading}
                className="w-full py-4 bg-gray-900 text-white rounded-full font-black text-lg hover:bg-black disabled:bg-gray-100 disabled:text-gray-400 transition-all flex items-center justify-center gap-3 shadow-xl"
              >
                {loading ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Mengekstrak...</>
                ) : (
                  "Mulai Ekstraksi"
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
            <p className="text-gray-500 mb-8 text-sm">File TXT telah berhasil dibuat dan diunduh.</p>
            <div className="space-y-3">
              <button 
                onClick={() => setShowSuccessModal(false)}
                className="w-full py-4 bg-blue-600 text-white rounded-full font-black text-lg hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all"
              >
                Tutup
              </button>
              <button 
                onClick={() => {setShowSuccessModal(false); removeFile();}}
                className="w-full py-3 text-gray-400 font-bold hover:text-gray-900 transition-colors text-sm"
              >
                Konversi Lagi
              </button>
            </div>
          </div>
        </div>
      )}

      <ToolsFooter />
    </div>
  );
}