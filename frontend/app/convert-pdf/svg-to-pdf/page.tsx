'use client';

import React, { useState, useRef, ChangeEvent, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/app/components/navbar';
import ToolsFooter from '../../components/footer/tools-footer';
import Image from 'next/image';

// --- IMPORT LIBRARIES ---
import { jsPDF } from 'jspdf';
import { svg2pdf } from 'svg2pdf.js';
import { Trash2, Loader2, ArrowLeft, Check, FileCode } from 'lucide-react';

export default function SvgToPdf() {
  // --- STATE MANAGEMENT ---
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [uploadingFiles, setUploadingFiles] = useState<{ name: string; size: number; progress: number }[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mencegah error SSR
  useEffect(() => {
    setMounted(true);
  }, []);

  // --- HANDLERS ---
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      const svgFiles = newFiles.filter(f => f.type === 'image/svg+xml' || f.name.toLowerCase().endsWith('.svg'));

      if (svgFiles.length !== newFiles.length) {
        setErrorMsg('Beberapa file dilewati karena bukan format SVG.');
      } else {
        setErrorMsg(null);
      }

      if (svgFiles.length === 0) return;

      setIsUploading(true);
      setUploadingFiles(svgFiles.map(f => ({ name: f.name, size: f.size, progress: 0 })));

      svgFiles.forEach((file, index) => {
        let progress = 0;
        const interval = setInterval(() => {
          progress += 20;
          setUploadingFiles(prev => {
            const updated = [...prev];
            if (updated[index]) updated[index].progress = progress;
            return updated;
          });
          if (progress >= 100) {
            clearInterval(interval);
            if (index === svgFiles.length - 1) {
              setTimeout(() => {
                setIsUploading(false);
                setSelectedFiles(prev => [...prev, ...svgFiles]);
                setUploadingFiles([]);
              }, 300);
            }
          }
        }, 100);
      });
    }
  };

  const handleConvert = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (selectedFiles.length === 0) return;

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      // Points (pt) adalah unit terbaik untuk render vektor agar tetap tajam
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'pt',
        format: 'a4'
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const svgText = await file.text();

        // 1. Parse string SVG menjadi DOM Element di memori
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
        const svgElement = svgDoc.documentElement;

        if (svgElement.tagName.toLowerCase() !== 'svg') {
          throw new Error(`File ${file.name} bukan merupakan SVG yang valid.`);
        }

        // 2. Tambah halaman baru mulai dari file kedua
        if (i > 0) pdf.addPage();

        // 3. Render SVG ke PDF
        // Properti width & height otomatis menjaga aspek rasio pada versi terbaru
        await svg2pdf(svgElement, pdf, {
          x: 20,
          y: 20,
          width: pageWidth - 40,
          height: pageHeight - 40,
        });
      }

      const pdfBlob = pdf.output('blob');
      const url = URL.createObjectURL(pdfBlob);
      setDownloadUrl(url);
      setIsProcessing(false);
      setShowSuccessModal(true);

    } catch (err) {
      console.error('SVG to PDF Error:', err);
      setIsProcessing(false);
      setShowErrorModal(true);
    }
  };

  const handleDownload = () => {
    if (downloadUrl) {
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `BentoPDF_SVG_Converted.pdf`;
      link.click();
    }
  };

  const removeFile = (index: number) => setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  const handleNext = () => { setShowSuccessModal(false); setDownloadUrl(null); setSelectedFiles([]); };
  const handleTryAgain = () => { setShowErrorModal(false); };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 py-8 flex-grow w-full">
        <Link href="/tools" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-8 font-semibold">
          <ArrowLeft className="w-5 h-5 mr-1" />
          <span>Back to Tools</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* SISI KIRI: Upload Area */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
              {selectedFiles.length === 0 ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-orange-200 rounded-2xl p-16 bg-orange-50/30 hover:bg-orange-50/60 transition-all cursor-pointer group"
                >
                  <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm group-hover:scale-110 transition-transform">
                    <FileCode className="w-10 h-10 text-orange-500" />
                  </div>
                  <p className="text-gray-700 text-xl font-bold mb-2">Upload file SVG Anda</p>
                  <p className="text-gray-500 text-sm mb-8">Gambar vektor akan tetap tajam saat menjadi PDF</p>
                  <button className="px-8 py-3 bg-gray-900 text-white rounded-full font-bold shadow-lg hover:bg-black transition-colors">
                    Browse Files
                  </button>
                  <input ref={fileInputRef} type="file" multiple accept=".svg" onChange={handleFileChange} className="hidden" />
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {selectedFiles.map((file, idx) => (
                    <div key={idx} className="relative p-4 bg-gray-50 rounded-xl border-2 border-transparent hover:border-orange-400 group transition-all animate-in fade-in">
                      <div className="aspect-square bg-orange-100 rounded-lg flex items-center justify-center text-orange-700 font-black text-xl mb-2">
                        SVG
                      </div>
                      <p className="text-[11px] truncate font-bold text-gray-600">{file.name}</p>
                      <button onClick={() => removeFile(idx)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {isUploading && (
                <div className="mt-8 space-y-4">
                  {uploadingFiles.map((f, i) => (
                    <div key={i} className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-left">
                      <div className="flex justify-between text-xs font-bold mb-2 uppercase text-gray-400">
                        <span className="truncate max-w-[200px]">{f.name}</span>
                        <span>{f.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-orange-500 h-full transition-all duration-300" style={{ width: `${f.progress}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* SISI KANAN: Settings Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 sticky top-24">
              <h2 className="text-2xl font-black text-gray-900 mb-4">SVG to PDF</h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-8">
                Konversi gambar vektor SVG menjadi dokumen PDF. Kualitas gambar akan tetap maksimal (tidak pecah) karena diproses sebagai data vektor.
              </p>

              {errorMsg && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium flex items-center gap-2">
                  <Check className="w-4 h-4 bg-red-600 text-white rounded-full p-0.5" />
                  {errorMsg}
                </div>
              )}

              <button
                onClick={handleConvert}
                disabled={selectedFiles.length === 0 || isProcessing || isUploading}
                className="w-full py-4 bg-gray-900 text-white rounded-full font-bold hover:bg-black disabled:bg-gray-100 disabled:text-gray-400 transition-all flex items-center justify-center gap-3 shadow-xl"
              >
                {isProcessing ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Mengonversi...</>
                ) : (
                  "Konversi Sekarang"
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
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10" strokeWidth={3} />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">Berhasil!</h2>
            <p className="text-gray-500 mb-8 text-sm">File SVG Anda telah digabungkan ke dalam satu file PDF.</p>
            <div className="space-y-3">
              <button 
                onClick={handleDownload}
                className="w-full py-4 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all"
              >
                Download PDF
              </button>
              <button 
                onClick={handleNext}
                className="w-full py-3 text-gray-400 font-bold hover:text-gray-600 transition-colors"
              >
                Konversi Lainnya
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ERROR MODAL */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-3xl p-10 max-w-sm w-full text-center shadow-2xl">
            <Image src="/asset/images/failed-modal.svg" alt="failed" width={80} height={80} className="mx-auto mb-4" />
            <h2 className="text-2xl font-black text-gray-900 mb-2">Gagal!</h2>
            <p className="text-gray-500 mb-8 text-sm">Terjadi kesalahan saat memproses file SVG. Pastikan file tidak korup.</p>
            <button onClick={handleTryAgain} className="w-full py-4 bg-red-600 text-white rounded-full font-bold">Coba Lagi</button>
          </div>
        </div>
      )}

      <ToolsFooter />
    </div>
  );
}