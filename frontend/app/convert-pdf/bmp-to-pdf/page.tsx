'use client';

import React, { useState, useRef, ChangeEvent } from 'react';
import Link from 'next/link';
import Navbar from '@/app/components/navbar';
import ToolsFooter from '@/app/components/footer/tools-footer';
import Image from 'next/image';
// --- IMPORT JSPDF ---
import { jsPDF } from 'jspdf';

export default function BmpToPdf() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [orientation, setOrientation] = useState('auto'); // Mengubah 'quality' menjadi 'orientation'
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [uploadingFiles, setUploadingFiles] = useState<{ name: string; size: number; progress: number }[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      const bmpFiles = newFiles.filter(
        (f) => f.type === 'image/bmp' || f.type === 'image/x-windows-bmp' || f.name.toLowerCase().endsWith('.bmp')
      );

      if (bmpFiles.length !== newFiles.length) {
        setErrorMsg('Some files were skipped because they are not BMP images.');
      } else {
        setErrorMsg(null);
      }

      if (bmpFiles.length === 0) return;

      setIsUploading(true);
      const uploadFiles = bmpFiles.map((f) => ({ name: f.name, size: f.size, progress: 0 }));
      setUploadingFiles(uploadFiles);

      bmpFiles.forEach((file, index) => {
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
            if (index === bmpFiles.length - 1) {
              setTimeout(() => {
                setIsUploading(false);
                setSelectedFiles((prev) => [...prev, ...bmpFiles]);
                setUploadingFiles([]);
              }, 500);
            }
          }
        }, 100);
      });
      setDownloadUrl(null);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const moveFile = (index: number, direction: 'up' | 'down') => {
    const newFiles = [...selectedFiles];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex >= 0 && newIndex < selectedFiles.length) {
      [newFiles[index], newFiles[newIndex]] = [newFiles[newIndex], newFiles[index]];
      setSelectedFiles(newFiles);
    }
  };

  // --- LOGIKA KONVERSI NYATA ---
  const handleConvert = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (selectedFiles.length === 0) return;

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const pdf = new jsPDF({
        orientation: orientation === 'landscape' ? 'l' : 'p',
        unit: 'px',
      });

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const imageData = await readFileAsDataURL(file);
        
        // Dapatkan dimensi gambar untuk menyesuaikan ukuran halaman
        const imgProps = await getImageDimensions(imageData);
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        let finalOrientation = orientation;
        if (orientation === 'auto') {
          finalOrientation = imgProps.width > imgProps.height ? 'landscape' : 'portrait';
        }

        if (i > 0) pdf.addPage([imgProps.width, imgProps.height], finalOrientation === 'landscape' ? 'l' : 'p');
        else {
            // Set halaman pertama sesuai ukuran gambar
            pdf.deletePage(1);
            pdf.addPage([imgProps.width, imgProps.height], finalOrientation === 'landscape' ? 'l' : 'p');
        }

        pdf.addImage(imageData, 'BMP', 0, 0, imgProps.width, imgProps.height);
      }

      const blob = pdf.output('blob');
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setIsProcessing(false);
      setShowSuccessModal(true);
    } catch (err) {
      console.error(err);
      setIsProcessing(false);
      setShowErrorModal(true);
    }
  };

  // Helper untuk membaca file
  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Helper untuk mendapatkan dimensi gambar
  const getImageDimensions = (url: string): Promise<{ width: number; height: number }> => {
    return new Promise((resolve) => {
      const img = new window.Image();
      img.onload = () => resolve({ width: img.width, height: img.height });
      img.src = url;
    });
  };

  const handleDownload = () => {
    if (downloadUrl) {
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = 'converted_images.pdf';
      link.click();
    }
  };

  const handleNext = () => {
    setShowSuccessModal(false);
    setDownloadUrl(null);
    setSelectedFiles([]);
  };

  const handleTryAgain = () => {
    setShowErrorModal(false);
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4 sm:mb-8 text-sm sm:text-base">
          <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Tools
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          <div className="lg:col-span-2 order-2 lg:order-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 sm:p-12 text-center bg-blue-50/30">
                <div className="flex justify-center mb-4 sm:mb-6">
                  <div className="relative w-24 h-24 sm:w-32 sm:h-32">
                    <img src="/asset/images/upload.svg" alt="upload" className="w-full h-full object-contain" />
                  </div>
                </div>
                <p className="text-gray-700 text-base sm:text-lg font-medium mb-2 px-2">Drag and drop your BMP files here.</p>
                <label className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-blue-50 text-blue-600 rounded-full cursor-pointer hover:bg-blue-100 transition-colors border border-blue-200 text-sm sm:text-base">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Browse Files
                  <input ref={fileInputRef} type="file" multiple accept=".bmp, image/bmp" onChange={handleFileChange} className="hidden" />
                </label>
              </div>

              {/* Uploading Progress */}
              {isUploading && (
                <div className="mt-4 space-y-3">
                  {uploadingFiles.map((file, idx) => (
                    <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="truncate max-w-[200px]">{file.name}</span>
                        <span>{file.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div className="bg-blue-600 h-1.5 rounded-full transition-all" style={{ width: `${file.progress}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Selected Files Grid */}
              {!isUploading && selectedFiles.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-base font-semibold mb-3">Selected BMPs ({selectedFiles.length})</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="relative group bg-gray-50 rounded-lg border p-2 shadow-sm">
                        <div className="aspect-square bg-gray-200 rounded flex items-center justify-center text-blue-500 font-bold text-xs uppercase">
                          BMP
                        </div>
                        <div className="mt-2 text-[10px] truncate px-1">{file.name}</div>
                        <button 
                          onClick={() => removeFile(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor font-bold"><path d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1 order-1 lg:order-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 sticky top-4">
              <h2 className="text-xl font-bold mb-2">BMP to PDF</h2>
              <p className="text-gray-600 mb-6 text-sm">Convert multiple BMP images into a single PDF document.</p>

              <div className="mb-6">
                <label className="block mb-2 text-sm font-medium text-gray-700">Orientation</label>
                <select 
                  value={orientation} 
                  onChange={(e) => setOrientation(e.target.value)}
                  className="w-full border rounded-lg p-2 text-sm outline-blue-500"
                >
                  <option value="auto">Auto Detect</option>
                  <option value="portrait">Portrait</option>
                  <option value="landscape">Landscape</option>
                </select>
              </div>

              <button
                disabled={selectedFiles.length === 0 || isProcessing || isUploading}
                onClick={handleConvert}
                className="w-full py-3 bg-blue-700 text-white rounded-full hover:bg-blue-800 disabled:bg-gray-300 font-semibold transition-all flex justify-center items-center"
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </div>
                ) : 'Convert Now'}
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center">
            <Image src="/asset/images/success-modal.svg" alt="success" width={60} height={60} className="mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Success!</h2>
            <p className="text-gray-600 mb-6 text-sm">Your PDF is ready to download.</p>
            <button onClick={handleDownload} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-full mb-3">
              Download PDF
            </button>
            <button onClick={handleNext} className="text-gray-500 text-sm hover:underline">Convert Another</button>
          </div>
        </div>
      )}

      <ToolsFooter />
    </div>
  );
}