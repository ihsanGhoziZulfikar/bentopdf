'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/app/components/navbar';
import ToolsFooter from '@/app/components/footer/tools-footer';
import Image from 'next/image';

// --- IMPORT LIBRARIES ---
import UTIF from 'utif';
import { jsPDF } from 'jspdf';

export default function TiffToPdf() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [compression, setCompression] = useState('medium');
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      const tiffFiles = newFiles.filter(
        (f) => f.type === 'image/tiff' || f.name.toLowerCase().endsWith('.tiff') || f.name.toLowerCase().endsWith('.tif')
      );

      if (tiffFiles.length !== newFiles.length) setErrorMsg('Some files were skipped because they are not TIFF images.');
      else setErrorMsg(null);

      if (tiffFiles.length === 0) return;

      setIsUploading(true);
      const uploadFiles = tiffFiles.map((f) => ({ name: f.name, size: f.size, progress: 0 }));
      setUploadingFiles(uploadFiles);

      tiffFiles.forEach((file, index) => {
        let progress = 0;
        const interval = setInterval(() => {
          progress += 25;
          setUploadingFiles((prev) => {
            const updated = [...prev];
            if (updated[index]) updated[index].progress = progress;
            return updated;
          });
          if (progress >= 100) {
            clearInterval(interval);
            if (index === tiffFiles.length - 1) {
              setTimeout(() => {
                setIsUploading(false);
                setSelectedFiles((prev) => [...prev, ...tiffFiles]);
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
      const pdf = new jsPDF({ orientation: 'p', unit: 'px', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let isFirstPage = true;

      for (const file of selectedFiles) {
        const arrayBuffer = await file.arrayBuffer();
        const ifds = UTIF.decode(arrayBuffer); 
        
        for (let i = 0; i < ifds.length; i++) {
          UTIF.decodeImage(arrayBuffer, ifds[i]); 
          const rgba = UTIF.toRGBA8(ifds[i]); 
          
          // --- FIX: VALIDATE DIMENSIONS ---
          const w = ifds[i].width;
          const h = ifds[i].height;

          if (!w || !h || w <= 0 || h <= 0) {
            console.warn(`Skipping frame ${i} of ${file.name}: Invalid dimensions.`);
            continue;
          }

          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (!ctx) continue;

          const imgData = ctx.createImageData(w, h);
          imgData.data.set(rgba);
          ctx.putImageData(imgData, 0, 0);

          const qualityValue = compression === 'high' ? 1.0 : compression === 'medium' ? 0.7 : 0.4;
          const jpegUrl = canvas.toDataURL('image/jpeg', qualityValue);

          // Calculate fit-to-page ratio
          const ratio = Math.min(pageWidth / w, pageHeight / h);
          const imgWidth = w * ratio;
          const imgHeight = h * ratio;
          const xOffset = (pageWidth - imgWidth) / 2;
          const yOffset = (pageHeight - imgHeight) / 2;

          if (!isFirstPage) {
            // Add page with orientation detection
            pdf.addPage([pageWidth, pageHeight], w > h ? 'l' : 'p');
          } else {
            isFirstPage = false;
          }

          pdf.addImage(jpegUrl, 'JPEG', xOffset, yOffset, imgWidth, imgHeight);
          
          // Cleanup canvas memory
          canvas.width = 0;
          canvas.height = 0;
        }
      }

      const pdfBlob = pdf.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      setDownloadUrl(pdfUrl);
      setShowSuccessModal(true);
    } catch (err) {
      console.error('TIFF Conversion Error:', err);
      setShowErrorModal(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (downloadUrl) {
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = 'BentoPDF_Converted_TIFF.pdf';
      link.click();
    }
  };

  const removeFile = (index: number) => setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  const handleNext = () => { setShowSuccessModal(false); setSelectedFiles([]); setDownloadUrl(null); };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Link href="/" className="inline-flex items-center text-blue-600 mb-8 font-semibold hover:underline">
          <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M15 19l-7-7 7-7" /></svg>
          Back to Tools
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              {selectedFiles.length === 0 ? (
                <div className="border-2 border-dashed border-blue-200 rounded-2xl p-12 text-center bg-blue-50/30 hover:bg-blue-50/50 transition-all cursor-pointer">
                   <div className="flex justify-center mb-6">
                    <Image src="/asset/images/upload.svg" alt="upload" width={80} height={80} />
                  </div>
                  <p className="text-gray-700 text-xl font-bold mb-4">Upload TIFF files to convert</p>
                  <label className="px-10 py-4 bg-blue-600 text-white rounded-full cursor-pointer font-bold hover:bg-blue-700 shadow-lg inline-block">
                    Select Files
                    <input ref={fileInputRef} type="file" multiple accept=".tiff, .tif" onChange={handleFileChange} className="hidden" />
                  </label>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                  {selectedFiles.map((file, idx) => (
                    <div key={idx} className="relative p-4 bg-gray-50 rounded-xl border-2 border-transparent hover:border-blue-400 group transition-all">
                      <div className="aspect-square bg-blue-100 rounded-lg flex items-center justify-center text-blue-700 font-black text-lg">TIFF</div>
                      <p className="text-xs mt-3 truncate font-bold text-gray-700">{file.name}</p>
                      <button onClick={() => removeFile(idx)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 sticky top-6">
              <h2 className="text-2xl font-black mb-4 text-gray-900">Conversion Settings</h2>
              <div className="mb-8">
                <label className="block text-sm font-bold text-gray-600 mb-3">Compression Level</label>
                <select value={compression} onChange={(e) => setCompression(e.target.value)} className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-xl text-sm font-bold focus:border-blue-500 outline-none transition-all">
                  <option value="high">HD Quality (No Compression)</option>
                  <option value="medium">Standard (Balanced)</option>
                  <option value="low">Small File (High Compression)</option>
                </select>
              </div>
              <button
                onClick={handleConvert}
                disabled={selectedFiles.length === 0 || isProcessing || isUploading}
                className="w-full py-5 bg-gray-900 text-white rounded-full font-black text-lg hover:bg-black disabled:bg-gray-200 disabled:text-gray-400 transition-all shadow-2xl flex items-center justify-center gap-3"
              >
                {isProcessing ? <><div className="w-5 h-5 border-4 border-white border-t-transparent rounded-full animate-spin"></div> Processing...</> : "Start Conversion"}
              </button>
            </div>
          </div>
        </div>
      </main>

      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-3xl p-10 max-w-sm w-full text-center shadow-2xl scale-in-center">
            <Image src="/asset/images/success-modal.svg" alt="success" width={100} height={100} className="mx-auto mb-6" />
            <h2 className="text-3xl font-black text-gray-900 mb-4">Done!</h2>
            <p className="text-gray-500 mb-10 font-medium">Your TIFF images have been merged into a PDF.</p>
            <button onClick={handleDownload} className="w-full py-5 bg-blue-600 text-white rounded-full font-black text-lg hover:bg-blue-700 shadow-xl mb-4 transition-all">Download PDF</button>
            <button onClick={handleNext} className="w-full text-gray-400 font-bold hover:text-gray-600">Start New Task</button>
          </div>
        </div>
      )}
      
      <ToolsFooter />
    </div>
  );
}