'use client';

import React, { useState, useRef, ChangeEvent, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/app/components/navbar';
import ToolsFooter from '@/app/components/footer/tools-footer';
import Image from 'next/image';

// --- LIBRARY IMPORTS ---
import { jsPDF } from 'jspdf';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { Trash2, FileJson, Loader2, ArrowLeft, Check, AlertCircle } from 'lucide-react';

export default function JsonToPdf() {
  // --- STATE MANAGEMENT ---
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadBlob, setDownloadBlob] = useState<Blob | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [uploadingFiles, setUploadingFiles] = useState<{ name: string; size: number; progress: number }[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  // --- REFS ---
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Hydration fix
  useEffect(() => {
    setMounted(true);
  }, []);

  // --- HANDLERS ---
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      const jsonFiles = newFiles.filter(f => f.type === 'application/json' || f.name.endsWith('.json'));

      if (jsonFiles.length !== newFiles.length) {
        setErrorMsg('Beberapa file dilewati. Hanya file .json yang didukung.');
      } else {
        setErrorMsg(null);
      }

      if (jsonFiles.length === 0) return;

      setIsUploading(true);
      setUploadingFiles(jsonFiles.map(f => ({ name: f.name, size: f.size, progress: 0 })));

      jsonFiles.forEach((file, index) => {
        let progress = 0;
        const interval = setInterval(() => {
          progress += 25;
          setUploadingFiles(prev => {
            const updated = [...prev];
            if (updated[index]) updated[index].progress = progress;
            return updated;
          });
          if (progress >= 100) {
            clearInterval(interval);
            if (index === jsonFiles.length - 1) {
              setTimeout(() => {
                setIsUploading(false);
                setSelectedFiles(prev => [...prev, ...jsonFiles]);
                setUploadingFiles([]);
              }, 300);
            }
          }
        }, 100);
      });
    }
  };

  const removeFile = (idx: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== idx));
    if (selectedFiles.length <= 1) setDownloadBlob(null);
  };

  const handleConvert = async () => {
    if (selectedFiles.length === 0) return;
    setIsProcessing(true);
    setErrorMsg(null);
    const zip = new JSZip();

    try {
      for (const file of selectedFiles) {
        const text = await file.text();
        const data = JSON.parse(text);

        if (!data.pages || !Array.isArray(data.pages)) {
          throw new Error(`Format JSON pada file ${file.name} tidak valid.`);
        }

        const doc = new jsPDF({ unit: 'pt', format: 'a4' });
        const pageHeight = doc.internal.pageSize.height;

        data.pages.forEach((page: any, pageIdx: number) => {
          if (pageIdx > 0) doc.addPage();
          
          if (page.items && Array.isArray(page.items)) {
            page.items.forEach((item: any) => {
              const x = item.transform[4];
              const y = pageHeight - item.transform[5];
              
              const fontSize = item.height || 10;
              doc.setFontSize(fontSize);
              doc.text(item.str, x, y);
            });
          }
        });

        const pdfOutput = doc.output('blob');
        zip.file(file.name.replace('.json', '.pdf'), pdfOutput);
      }

      const content = await zip.generateAsync({ type: "blob" });
      setDownloadBlob(content);
      setShowSuccessModal(true);
    } catch (err) {
      console.error(err);
      setShowErrorModal(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (downloadBlob) {
      saveAs(downloadBlob, `BentoPDF-JSON-Result-${Date.now()}.zip`);
    }
  };

  // --- FUNGSI RESET / NEXT ---
  const handleNext = () => {
    setShowSuccessModal(false);
    setSelectedFiles([]);
    setDownloadBlob(null);
    setErrorMsg(null);
  };

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
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              {selectedFiles.length === 0 ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-blue-200 rounded-2xl p-16 text-center bg-blue-50/30 hover:bg-blue-50/60 transition-all cursor-pointer group"
                >
                  <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm group-hover:scale-110 transition-transform">
                    <FileJson className="w-10 h-10 text-blue-500" />
                  </div>
                  <p className="text-gray-700 text-xl font-bold mb-2">Pilih file JSON untuk dikonversi</p>
                  <input 
                    ref={fileInputRef} 
                    type="file" 
                    multiple 
                    accept=".json" 
                    onChange={handleFileChange} 
                    className="hidden" 
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {selectedFiles.map((file, idx) => (
                    <div key={idx} className="relative p-4 bg-amber-50 rounded-xl border border-amber-200 group animate-in fade-in zoom-in duration-200">
                      <div className="aspect-square flex items-center justify-center text-amber-600 font-black text-xl bg-white rounded-lg shadow-sm mb-2">
                        JSON
                      </div>
                      <p className="text-[11px] truncate font-bold text-amber-900">{file.name}</p>
                      <button onClick={() => removeFile(idx)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 sticky top-24">
              <h2 className="text-2xl font-black text-gray-900 mb-4">JSON to PDF</h2>
              <button
                onClick={handleConvert}
                disabled={selectedFiles.length === 0 || isProcessing || isUploading}
                className="w-full py-4 bg-gray-900 text-white rounded-full font-bold hover:bg-gray-800 disabled:bg-gray-100 disabled:text-gray-400 transition-all flex items-center justify-center gap-3 shadow-xl"
              >
                {isProcessing ? <><Loader2 className="w-5 h-5 animate-spin" /> Merender...</> : "Mulai Konversi"}
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
            <h2 className="text-2xl font-black text-gray-900 mb-2">Siap Diunduh!</h2>
            <div className="space-y-3">
              <button onClick={handleDownload} className="w-full py-4 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 shadow-lg transition-all">Download ZIP</button>
              <button onClick={handleNext} className="w-full py-3 text-gray-400 font-bold hover:text-gray-600 transition-colors">Konversi Lainnya</button>
            </div>
          </div>
        </div>
      )}

      {/* ERROR MODAL */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-3xl p-10 max-w-sm w-full text-center shadow-2xl animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">Gagal!</h2>
            <button onClick={() => setShowErrorModal(false)} className="w-full py-4 bg-red-600 text-white rounded-full font-bold hover:bg-red-700 transition-all">Coba Lagi</button>
          </div>
        </div>
      )}

      <ToolsFooter />
    </div>
  );
}