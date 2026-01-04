'use client';

import React, { useState, useRef, ChangeEvent, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/app/components/navbar';
import ToolsFooter from '../../components/footer/tools-footer';
import Image from 'next/image';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

// Import mammoth secara dinamis untuk menghindari error SSR
const mammoth = typeof window !== "undefined" ? require("mammoth") : null;

export default function WordToPdf() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [uploadingFiles, setUploadingFiles] = useState<{ name: string; size: number; progress: number }[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLDivElement>(null); // Jembatan render

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      const wordFiles = newFiles.filter(f => 
        f.name.toLowerCase().endsWith('.docx') || f.name.toLowerCase().endsWith('.doc')
      );

      if (wordFiles.length !== newFiles.length) {
        setErrorMsg('Beberapa file dilewati karena bukan format .docx (Word).');
      } else {
        setErrorMsg(null);
      }

      if (wordFiles.length === 0) return;

      setIsUploading(true);
      setUploadingFiles(wordFiles.map(f => ({ name: f.name, size: f.size, progress: 0 })));

      wordFiles.forEach((file, index) => {
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
            if (index === wordFiles.length - 1) {
              setTimeout(() => {
                setIsUploading(false);
                setSelectedFiles(prev => [...prev, ...wordFiles]);
                setUploadingFiles([]);
              }, 300);
            }
          }
        }, 100);
      });
    }
  };

  const handleConvert = async () => {
    if (selectedFiles.length === 0) return;
    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const arrayBuffer = await file.arrayBuffer();

        // 1. Convert Word ke HTML menggunakan Mammoth
        const result = await mammoth.convertToHtml({ arrayBuffer });
        const htmlContent = result.value;

        // 2. Render HTML ke elemen tersembunyi
        if (previewRef.current) {
          previewRef.current.innerHTML = `<div style="padding: 40px; font-family: Arial;">${htmlContent}</div>`;
          
          // 3. Ubah HTML menjadi Canvas
          const canvas = await html2canvas(previewRef.current, {
            scale: 2, // Kualitas HD
            useCORS: true
          });

          const imgData = canvas.toDataURL('image/png');
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

          if (i > 0) pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
          
          previewRef.current.innerHTML = ""; // Bersihkan memori
        }
      }

      const pdfBlob = pdf.output('blob');
      const url = URL.createObjectURL(pdfBlob);
      setDownloadUrl(url);
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
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `BentoPDF_Word_Converted.pdf`;
      a.click();
    }
  };

  const handleNext = () => {
    setShowSuccessModal(false);
    setSelectedFiles([]);
    setDownloadUrl(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hidden Render Area */}
      <div 
        ref={previewRef} 
        className="fixed top-0 left-0 -z-50 opacity-0" 
        style={{ width: '800px', backgroundColor: 'white' }} 
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-8 font-medium">
          <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M15 19l-7-7 7-7" strokeWidth="2" /></svg>
          Back to Tools
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
              {selectedFiles.length === 0 ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-blue-200 rounded-xl p-12 bg-blue-50/30 cursor-pointer hover:bg-blue-50/50"
                >
                  <Image src="/asset/images/upload.svg" alt="upload" width={80} height={80} className="mx-auto mb-4" />
                  <p className="font-bold text-gray-700">Drag & Drop Word file (.docx)</p>
                  <input ref={fileInputRef} type="file" multiple accept=".docx" onChange={handleFileChange} className="hidden" />
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {selectedFiles.map((file, idx) => (
                    <div key={idx} className="p-4 bg-gray-50 border rounded-xl flex flex-col items-center group relative">
                      <div className="text-blue-600 font-bold mb-2">WORD</div>
                      <p className="text-xs truncate w-full text-center">{file.name}</p>
                      <button 
                        onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== idx))}
                        className="absolute top-1 right-1 p-1 bg-red-100 text-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-4">
              <h2 className="text-xl font-bold mb-4">Word to PDF</h2>
              <p className="text-gray-500 text-sm mb-6">Convert .docx documents to PDF while preserving content structure.</p>
              
              {errorMsg && <p className="text-red-500 text-xs mb-4">{errorMsg}</p>}

              <button
                onClick={handleConvert}
                disabled={selectedFiles.length === 0 || isProcessing || isUploading}
                className="w-full py-3 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 disabled:bg-gray-200 transition-all flex items-center justify-center gap-2"
              >
                {isProcessing ? "Converting..." : "Convert Now"}
              </button>
            </div>
          </div>
        </div>
      </main>

      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
            <Image src="/asset/images/success-modal.svg" alt="success" width={80} height={80} className="mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Success!</h2>
            <p className="text-gray-500 mb-8 text-sm">File Word berhasil dikonversi ke PDF.</p>
            <button onClick={handleDownload} className="w-full py-3 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 mb-4">Download PDF</button>
            <button onClick={handleNext} className="w-full py-2 text-gray-400 font-medium">Convert More</button>
          </div>
        </div>
      )}

      <ToolsFooter />
    </div>
  );
}