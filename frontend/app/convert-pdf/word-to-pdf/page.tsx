'use client';

import React, { useState, useRef, ChangeEvent, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/app/components/navbar';
import ToolsFooter from '../../components/footer/tools-footer';
import Image from 'next/image';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { ArrowLeft, Trash2, Loader2, UploadCloud, Check, FileText } from 'lucide-react';

// Import docx-preview secara dinamis
const docx = typeof window !== "undefined" ? require("docx-preview") : null;

export default function WordToPdf() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      const wordFiles = newFiles.filter(f => f.name.toLowerCase().endsWith('.docx'));

      if (wordFiles.length === 0) {
          setErrorMsg("Hanya file .docx yang didukung");
          return;
      }

      setSelectedFiles(prev => [...prev, ...wordFiles]);
      setIsUploading(true);
      setErrorMsg(null);

      let progress = 0;
      const interval = setInterval(() => {
        progress += 25;
        setUploadProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          if (e.target) e.target.value = '';
        }
      }, 100);
    }
  };

  const handleConvert = async () => {
    if (selectedFiles.length === 0 || !docx) return;
    setIsProcessing(true);

    try {
      // Inisialisasi PDF A4
      const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
      
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const arrayBuffer = await file.arrayBuffer();
        
        if (previewRef.current) {
          previewRef.current.innerHTML = '';
          
          // 1. Render Word ke HTML di container tersembunyi
          await docx.renderAsync(arrayBuffer, previewRef.current, null, {
            inWrapper: false,
            ignoreWidth: false,
            ignoreHeight: false,
          });

          // Tunggu render selesai
          await new Promise(resolve => setTimeout(resolve, 1000));

          // 2. Gunakan html2canvas untuk mengambil gambar seluruh konten
          const canvas = await html2canvas(previewRef.current, {
            scale: 2, // Resolusi tinggi
            useCORS: true,
            backgroundColor: '#ffffff',
          });

          const imgData = canvas.toDataURL('image/jpeg', 1.0);
          
          const imgWidth = 210; // Lebar A4 dalam mm
          const pageHeight = 297; // Tinggi A4 dalam mm
          const imgHeight = (canvas.height * imgWidth) / canvas.width; // Tinggi total gambar dalam mm
          let heightLeft = imgHeight;
          let position = 0;

          // 3. LOGIKA MULTI-PAGE: Pecah gambar jika lebih panjang dari satu halaman A4
          // Halaman pertama (jika ini bukan file pertama, tambah halaman baru)
          if (i > 0) pdf.addPage();
          
          pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
          heightLeft -= pageHeight;

          // Tambahkan halaman baru jika masih ada sisa konten (scroll vertikal)
          while (heightLeft >= 0) {
            position = heightLeft - imgHeight; // Geser posisi gambar ke atas
            pdf.addPage();
            pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
            heightLeft -= pageHeight;
          }
          
          previewRef.current.innerHTML = '';
        }
      }

      const pdfBlob = pdf.output('blob');
      setDownloadUrl(URL.createObjectURL(pdfBlob));
      setShowSuccessModal(true);
    } catch (err) {
      console.error(err);
      setErrorMsg("Gagal mengonversi file Word.");
    } finally {
      setIsProcessing(false);
    }
  };

  const removeFile = (idx: number) => setSelectedFiles(prev => prev.filter((_, i) => i !== idx));

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />
      
      {/* AREA RENDERING TERSEMBUNYI (PENTING) */}
      <div 
        ref={previewRef} 
        style={{ 
          position: 'fixed', 
          top: '0', 
          left: '-10000px', 
          width: '210mm', // Paksa lebar seukuran kertas A4
          backgroundColor: 'white',
          padding: '20mm' // Margin standar
        }} 
      />

      <main className="max-w-7xl mx-auto px-4 py-8 flex-grow w-full text-gray-900">
        <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-8 font-semibold">
          <ArrowLeft className="w-5 h-5 mr-1" /> Back to Tools
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
              <div 
                onClick={() => !isProcessing && fileInputRef.current?.click()}
                className="border-2 border-dashed border-blue-200 rounded-2xl p-16 bg-blue-50/30 hover:bg-blue-50/60 transition-all cursor-pointer group"
              >
                <UploadCloud className="w-16 h-16 text-blue-500 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <p className="text-gray-700 font-bold text-lg mb-2">Pilih file Word (.docx)</p>
                <p className="text-gray-400 text-sm italic">Mendukung dokumen panjang (banyak halaman)</p>
                <input ref={fileInputRef} type="file" accept=".docx" multiple onChange={handleFileChange} className="hidden" />
              </div>

              {selectedFiles.length > 0 && (
                <div className="mt-8 space-y-3">
                  {selectedFiles.map((f, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-blue-50/50 rounded-xl border border-blue-100 shadow-sm animate-in slide-in-from-top-2">
                      <div className="flex items-center gap-3">
                        <FileText className="text-blue-600 w-5 h-5" />
                        <span className="text-sm font-bold text-gray-700 truncate max-w-xs">{f.name}</span>
                      </div>
                      <button onClick={() => removeFile(i)} className="text-red-400 hover:text-red-600 transition-colors">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 sticky top-24">
              <h2 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-2">Word to PDF</h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-8">
                Konversi semua halaman dokumen Anda secara otomatis tanpa memotong bagian bawah.
              </p>
              <button
                onClick={handleConvert}
                disabled={selectedFiles.length === 0 || isProcessing}
                className="w-full py-4 bg-gray-900 text-white rounded-full font-black text-lg hover:bg-black disabled:bg-gray-100 disabled:text-gray-400 transition-all flex items-center justify-center gap-3 shadow-xl"
              >
                {isProcessing ? <><Loader2 className="w-5 h-5 animate-spin" /> Merender...</> : "Mulai Konversi"}
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* MODAL SUKSES */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-10 max-w-sm w-full text-center shadow-2xl animate-in zoom-in">
            <Image src="/asset/images/success-modal.svg" alt="success" width={100} height={100} className="mx-auto mb-6" />
            <h2 className="text-2xl font-black text-gray-900 mb-2">Berhasil!</h2>
            <button 
              onClick={() => {
                const a = document.createElement('a');
                a.href = downloadUrl!;
                a.download = 'BentoPDF_Word_Converted.pdf';
                a.click();
              }}
              className="w-full py-4 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 shadow-lg transition-all"
            >
              Download PDF
            </button>
            <button onClick={() => { setShowSuccessModal(false); setSelectedFiles([]); }} className="w-full py-3 text-gray-400 font-bold mt-2 hover:text-gray-900">Konversi Lagi</button>
          </div>
        </div>
      )}
      <ToolsFooter />
    </div>
  );
}