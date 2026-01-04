'use client';

import React, { useState, useRef, useEffect, ChangeEvent } from 'react';
import Link from 'next/link';
import Navbar from '@/app/components/navbar';
import ToolsFooter from '../../components/footer/tools-footer';
import Image from 'next/image';
import { jsPDF } from 'jspdf';
import { Trash2, Loader2, ArrowLeft, Check, ImageIcon, UploadCloud } from 'lucide-react';

export default function HeicToPdf() {
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

  useEffect(() => {
    setMounted(true);
  }, []);

  // --- HANDLERS (SOLUSI SEKALI UPLOAD LANGSUNG MASUK) ---
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newFiles = Array.from(files);
      const heicFiles = newFiles.filter(
        (f) => f.type === 'image/heic' || f.type === 'image/heif' || 
               f.name.toLowerCase().endsWith('.heic') || f.name.toLowerCase().endsWith('.heif')
      );

      if (heicFiles.length !== newFiles.length) {
        setErrorMsg('Beberapa file dilewati karena bukan format HEIC.');
      } else {
        setErrorMsg(null);
      }

      if (heicFiles.length === 0) return;

      // 1. LANGSUNG MASUKKAN KE STATE agar UI langsung merespon
      setSelectedFiles(prev => [...prev, ...heicFiles]);
      setIsUploading(true);
      setDownloadUrl(null);
      
      const uploadFilesState = heicFiles.map((f) => ({ name: f.name, size: f.size, progress: 0 }));
      setUploadingFiles(uploadFilesState);

      // 2. RESET INPUT VALUE agar bisa upload file yang sama berulang kali
      if (e.target) e.target.value = '';

      // 3. Simulasi Progress (UX Visual)
      heicFiles.forEach((file, index) => {
        let progress = 0;
        const interval = setInterval(() => {
          progress += 20;
          setUploadingFiles((prev) => {
            const updated = [...prev];
            if (updated[index]) updated[index].progress = progress;
            return updated;
          });
          if (progress >= 100) {
            clearInterval(interval);
            if (index === heicFiles.length - 1) {
              setTimeout(() => {
                setIsUploading(false);
                setUploadingFiles([]);
              }, 300);
            }
          }
        }, 80);
      });
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // --- LOGIKA KONVERSI (TETAP SAMA) ---
  const handleConvert = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (selectedFiles.length === 0) return;

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const heic2anyModule = await import('heic2any');
      const heic2any = heic2anyModule.default;

      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'px',
        format: 'a4'
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        let imageUrl: string | null = null;
        
        try {
          const convertedBlob = await heic2any({
            blob: file,
            toType: 'image/jpeg',
            quality: 0.7
          });

          const blobToUse = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
          if (!blobToUse) throw new Error("Conversion failed");

          imageUrl = URL.createObjectURL(blobToUse);

          const imgProps = await new Promise<{ width: number; height: number }>((resolve, reject) => {
            const img = new window.Image();
            img.onload = () => resolve({ width: img.width, height: img.height });
            img.onerror = () => reject(new Error("Image Load Failed"));
            img.src = imageUrl!;
          });
          
          const ratio = Math.min(pageWidth / imgProps.width, pageHeight / imgProps.height);
          const imgWidth = imgProps.width * ratio;
          const imgHeight = imgProps.height * ratio;
          const xOffset = (pageWidth - imgWidth) / 2;
          const yOffset = (pageHeight - imgHeight) / 2;

          if (i > 0) pdf.addPage();
          pdf.addImage(imageUrl, 'JPEG', xOffset, yOffset, imgWidth, imgHeight);
          
        } catch (innerError) {
          console.warn(`Skipped file ${i}:`, innerError);
        } finally {
          if (imageUrl) URL.revokeObjectURL(imageUrl);
        }
      }

      const pdfBlob = pdf.output('blob');
      if (pdfBlob.size < 1000) throw new Error("PDF generation failed");

      setDownloadUrl(URL.createObjectURL(pdfBlob));
      setShowSuccessModal(true);

    } catch (err) {
      console.error(err);
      setShowErrorModal(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (downloadUrl) {
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = 'BentoPDF_HEIC_Converted.pdf';
      link.click();
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
          {/* AREA KIRI: Upload */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
              
              <div 
                onClick={() => !isProcessing && fileInputRef.current?.click()}
                className="border-2 border-dashed border-blue-200 rounded-2xl p-12 bg-blue-50/30 hover:bg-blue-50/60 transition-all cursor-pointer group"
              >
                <div className="flex justify-center mb-6">
                  <div className="relative w-24 h-24 group-hover:scale-110 transition-transform">
                    <img src="/asset/images/upload.svg" alt="upload" className="w-full h-full object-contain" />
                  </div>
                </div>
                <p className="text-gray-700 text-xl font-bold mb-2">Pilih foto HEIC iPhone Anda</p>
                <p className="text-gray-500 mb-8 text-sm italic">Ubah banyak foto HEIC sekaligus menjadi satu file PDF</p>
                
                <input ref={fileInputRef} type="file" multiple accept=".heic, .heif" onChange={handleFileChange} className="hidden" />
                
                <div className="inline-flex items-center px-10 py-3.5 bg-blue-600 text-white rounded-full shadow-lg font-bold text-sm">
                  <UploadCloud className="w-5 h-5 mr-2" />
                  Browse Files
                </div>
              </div>

              {/* Progress Bar simulasi */}
              {isUploading && (
                <div className="mt-8 space-y-4">
                  {uploadingFiles.map((f, i) => (
                    <div key={i} className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-left animate-in fade-in">
                      <div className="flex justify-between text-xs font-bold mb-2 uppercase text-gray-400 tracking-wider">
                        <span className="truncate max-w-[200px]">{f.name}</span>
                        <span>{f.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-blue-600 h-full transition-all duration-300" style={{ width: `${f.progress}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Grid File Terpilih */}
              {selectedFiles.length > 0 && (
                <div className="mt-8 animate-in slide-in-from-top-2">
                  <h3 className="text-left text-base font-bold text-gray-900 mb-4 uppercase tracking-wider">File Terpilih</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {selectedFiles.map((file, idx) => (
                      <div key={idx} className="relative p-4 bg-blue-50 rounded-xl border-2 border-transparent hover:border-blue-400 group transition-all shadow-sm">
                        <div className="aspect-square bg-white rounded-lg flex items-center justify-center text-blue-500 mb-2">
                          <ImageIcon className="w-8 h-8" />
                        </div>
                        <p className="text-[10px] truncate font-bold text-gray-600">{file.name}</p>
                        <button 
                          onClick={(e) => { e.stopPropagation(); removeFile(idx); }} 
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* AREA KANAN: Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 sticky top-24 h-fit">
              <h2 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-2">
                <ImageIcon className="text-blue-500 w-7 h-7" /> HEIC to PDF
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-8">
                Konversi foto iPhone (HEIC) Anda ke dokumen PDF secara instan tanpa mengurangi kualitas gambar secara drastis.
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
            <p className="text-gray-500 mb-8 text-sm">Foto HEIC Anda telah digabungkan ke dalam satu file PDF.</p>
            <div className="space-y-3">
              <button onClick={handleDownload} className="w-full py-4 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 shadow-lg">Download PDF</button>
              <button onClick={() => { setShowSuccessModal(false); setSelectedFiles([]); }} className="w-full py-3 text-gray-400 font-bold hover:text-gray-900 transition-colors">Konversi Lainnya</button>
            </div>
          </div>
        </div>
      )}

      <ToolsFooter />
    </div>
  );
}