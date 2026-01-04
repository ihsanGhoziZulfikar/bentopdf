'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/app/components/navbar';
import ToolsFooter from '../../components/footer/tools-footer';
import Image from 'next/image';
import { jsPDF } from 'jspdf';

export default function HeicToPdf() {
  // --- STATE MANAGEMENT ---
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [quality, setQuality] = useState('standard');
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [uploadingFiles, setUploadingFiles] = useState<{ name: string; size: number; progress: number }[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mencegah error SSR dengan memastikan komponen sudah mounted di browser
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
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

      setIsUploading(true);
      const uploadFiles = heicFiles.map((f) => ({ name: f.name, size: f.size, progress: 0 }));
      setUploadingFiles(uploadFiles);

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
                setSelectedFiles((prev) => [...prev, ...heicFiles]);
                setUploadingFiles([]);
              }, 200);
            }
          }
        }, 100);
      });
    }
  };

  const moveFile = (index: number, direction: 'up' | 'down') => {
    const newFiles = [...selectedFiles];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex >= 0 && newIndex < selectedFiles.length) {
      [newFiles[index], newFiles[newIndex]] = [newFiles[newIndex], newFiles[index]];
      setSelectedFiles(newFiles);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  // --- LOGIKA KONVERSI DENGAN DYNAMIC IMPORT ---
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
          // Konversi HEIC ke JPEG Blob
          const convertedBlob = await heic2any({
            blob: file,
            toType: 'image/jpeg',
            quality: 0.7
          });

          // PENTING: Ambil blob pertama jika hasilnya adalah array
          const blobToUse = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
          
          // Validasi apakah hasil konversi benar-benar ada
          if (!blobToUse) throw new Error("Conversion resulted in empty blob");

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
          // Hanya log jika error bukan objek kosong untuk mengurangi noise di console
          if (Object.keys(innerError as object).length > 0) {
            console.warn(`File index ${i} skipped:`, innerError);
          }
        } finally {
          // Pastikan URL selalu dibersihkan untuk menghemat RAM
          if (imageUrl) URL.revokeObjectURL(imageUrl);
        }
      }

      // Pastikan ada halaman yang berhasil dibuat sebelum download
      const pdfBlob = pdf.output('blob');
      if (pdfBlob.size < 1000) throw new Error("PDF file is too small/empty");

      const pdfUrl = URL.createObjectURL(pdfBlob);
      setDownloadUrl(pdfUrl);
      setShowSuccessModal(true);

    } catch (err) {
      console.error('Final Conversion Error:', err);
      setErrorMsg("Gagal mengonversi. Coba kurangi jumlah file atau gunakan ukuran yang lebih kecil.");
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

  // Jangan render apapun jika belum mounted untuk menghindari error window di server
  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-8 font-medium">
          <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Tools
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="border-2 border-dashed border-blue-200 rounded-lg p-12 text-center bg-blue-50/30">
                <Image src="/asset/images/upload.svg" alt="upload" width={100} height={100} className="mx-auto mb-6" />
                <p className="text-gray-700 text-lg font-medium mb-4">Pilih foto HEIC iPhone Anda</p>
                <label className="inline-flex items-center px-6 py-3 bg-blue-50 text-blue-600 rounded-full cursor-pointer hover:bg-blue-100 border border-blue-200 transition-colors">
                  Browse Files
                  <input ref={fileInputRef} type="file" multiple accept=".heic, .heif" onChange={handleFileChange} className="hidden" />
                </label>
              </div>

              {selectedFiles.length > 0 && !isUploading && (
                <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="relative group p-2 bg-gray-50 rounded-lg border">
                      <div className="aspect-square bg-blue-100 rounded flex items-center justify-center text-blue-600 font-bold text-xs">HEIC</div>
                      <p className="text-[10px] mt-2 truncate">{file.name}</p>
                      <button onClick={() => removeFile(index)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor font-bold"><path d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-4">
              <h2 className="text-xl font-bold mb-4">HEIC to PDF</h2>
              <button
                onClick={handleConvert}
                disabled={selectedFiles.length === 0 || isProcessing}
                className="w-full py-3.5 bg-blue-700 text-white rounded-full font-bold hover:bg-blue-800 disabled:bg-gray-300 transition-all flex justify-center items-center gap-2 shadow-lg"
              >
                {isProcessing ? "Converting..." : "Convert to PDF"}
              </button>
            </div>
          </div>
        </div>
      </main>

      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl animate-in zoom-in duration-300">
            <Image src="/asset/images/success-modal.svg" alt="success" width={80} height={80} className="mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Success!</h2>
            <button onClick={handleDownload} className="w-full py-3 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 shadow-md">Download PDF</button>
            <button onClick={() => {setShowSuccessModal(false); setSelectedFiles([]);}} className="w-full mt-4 text-gray-500 font-medium">Convert Another</button>
          </div>
        </div>
      )}

      <ToolsFooter />
    </div>
  );
}