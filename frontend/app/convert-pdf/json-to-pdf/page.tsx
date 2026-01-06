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
import { Trash2, FileJson, Loader2, ArrowLeft, Check, UploadCloud } from 'lucide-react';

export default function JsonToPdf() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadBlob, setDownloadBlob] = useState<Blob | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [uploadingFiles, setUploadingFiles] = useState<{ name: string; size: number; progress: number }[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setMounted(true); }, []);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      const jsonFiles = newFiles.filter(f => f.name.toLowerCase().endsWith('.json'));

      if (jsonFiles.length === 0) return;

      setSelectedFiles(prev => [...prev, ...jsonFiles]);
      setIsUploading(true);
      setErrorMsg(null);

      let progress = 0;
      const interval = setInterval(() => {
        progress += 25;
        setUploadingFiles(jsonFiles.map(f => ({ name: f.name, size: f.size, progress })));
        if (progress >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          setUploadingFiles([]);
          if (e.target) e.target.value = '';
        }
      }, 100);
    }
  };

  // --- LOGIKA PERBAIKAN (SMART RENDERING) ---
  const handleConvert = async () => {
    if (selectedFiles.length === 0) return;
    setIsProcessing(true);
    const zip = new JSZip();

    try {
      for (const file of selectedFiles) {
        const text = await file.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch (e) {
          throw new Error(`File ${file.name} bukan format JSON yang valid.`);
        }

        const doc = new jsPDF({ unit: 'pt', format: 'a4' });
        const margin = 40;
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        // LOGIKA 1: Jika JSON hasil ekstraksi PDF (memiliki koordinat transform)
        if (data.pages && Array.isArray(data.pages)) {
          data.pages.forEach((page: any, pageIdx: number) => {
            if (pageIdx > 0) doc.addPage();
            if (page.items) {
              page.items.forEach((item: any) => {
                const x = item.transform ? item.transform[4] : margin;
                const y = item.transform ? (pageHeight - item.transform[5]) : margin;
                doc.setFontSize(item.height || 10);
                doc.text(item.str || item.text || "", x, y);
              });
            }
          });
        } 
        // LOGIKA 2: Jika JSON adalah data objek biasa (Fallback)
        else {
          doc.setFont("courier", "normal");
          doc.setFontSize(10);
          
          // Format JSON agar rapi (identasi 2 spasi)
          const jsonString = JSON.stringify(data, null, 2);
          
          // Memecah teks agar muat dalam lebar kertas A4 (Line Wrapping)
          const splitText = doc.splitTextToSize(jsonString, pageWidth - (margin * 2));
          
          let y = margin;
          splitText.forEach((line: string) => {
            // Cek apakah teks sudah mencapai batas bawah kertas
            if (y > pageHeight - margin) {
              doc.addPage();
              y = margin;
            }
            doc.text(line, margin, y);
            y += 12; // Jarak antar baris
          });
        }

        const pdfOutput = doc.output('blob');
        zip.file(file.name.replace('.json', '.pdf'), pdfOutput);
      }

      const content = await zip.generateAsync({ type: "blob" });
      setDownloadBlob(content);
      setShowSuccessModal(true);
      saveAs(content, `BentoPDF-JSON-Export.zip`);
    } catch (err: any) {
      console.error(err);
      alert(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const removeFile = (idx: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== idx));
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8 flex-grow w-full text-gray-900">
        <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-8 font-semibold transition-colors">
          <ArrowLeft className="w-5 h-5 mr-1" /> Back to Tools
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
              {selectedFiles.length === 0 ? (
                <div 
                  onClick={() => !isProcessing && fileInputRef.current?.click()}
                  className="border-2 border-dashed border-blue-200 rounded-2xl p-16 bg-blue-50/30 hover:bg-blue-50/60 transition-all cursor-pointer group"
                >
                  <FileJson className="w-16 h-16 text-blue-500 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                  <p className="text-gray-700 text-xl font-bold mb-2">Pilih file JSON</p>
                  <p className="text-gray-400 text-sm italic">Data Anda akan dikonversi menjadi dokumen PDF yang rapi</p>
                  <input ref={fileInputRef} type="file" multiple accept=".json" onChange={handleFileChange} className="hidden" />
                  <div className="mt-6 inline-flex items-center px-10 py-3 bg-blue-600 text-white rounded-full shadow-lg font-bold text-sm">
                    <UploadCloud className="w-5 h-5 mr-2" /> Browse File
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {selectedFiles.map((file, idx) => (
                    <div key={idx} className="relative p-4 bg-blue-50 rounded-xl border border-blue-100 group animate-in zoom-in">
                      <div className="aspect-square flex items-center justify-center text-blue-600 font-black text-xl bg-white rounded-lg shadow-sm mb-2 uppercase">json</div>
                      <p className="text-[10px] truncate font-bold text-gray-600">{file.name}</p>
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
              <h2 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-2">
                <FileJson className="text-blue-500" /> JSON to PDF
              </h2>
              <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                Konversi data JSON Anda menjadi file PDF yang terformat. Sangat berguna untuk dokumentasi data atau pencetakan *log*.
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

      {/* SUCCESS MODAL */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-3xl p-10 max-w-sm w-full text-center shadow-2xl animate-in zoom-in">
            <Check className="w-16 h-16 bg-green-100 text-green-600 rounded-full p-4 mx-auto mb-6" />
            <h2 className="text-2xl font-black text-gray-900 mb-2">Berhasil!</h2>
            <p className="text-gray-500 mb-8 text-sm">File PDF Anda telah siap diunduh dalam format ZIP.</p>
            <div className="space-y-3">
              <button onClick={() => saveAs(downloadBlob!, 'BentoPDF-JSON-Export.zip')} className="w-full py-4 bg-blue-600 text-white rounded-full font-bold shadow-lg hover:bg-blue-700 transition-all">Download ZIP</button>
              <button onClick={() => { setShowSuccessModal(false); setSelectedFiles([]); }} className="w-full py-3 text-gray-400 font-bold hover:text-gray-900 transition-colors">Konversi Lainnya</button>
            </div>
          </div>
        </div>
      )}

      <ToolsFooter />
    </div>
  );
}