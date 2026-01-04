'use client';

import React, { useState, useRef, useEffect, ChangeEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/app/components/navbar';
import ToolsFooter from '../../components/footer/tools-footer';
import { ArrowLeft, Trash2, Code, Loader2, UploadCloud } from 'lucide-react';

// --- LIBRARY IMPORTS ---
import * as pdfjsLib from 'pdfjs-dist';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export default function PdfToSvg() {
  // --- STATE MANAGEMENT ---
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
  }, []);

  // --- HANDLERS (Fungsi Asli Anda) ---

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.type !== 'application/pdf') return;

      setIsUploading(true);
      setUploadProgress(0);

      let progress = 0;
      const interval = setInterval(() => {
        progress += 25;
        setUploadProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsUploading(false);
            setSelectedFile(file);
          }, 150);
        }
      }, 150);
    }
  };

  const canvasToSVG = (canvas: HTMLCanvasElement): string => {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context not available');
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('width', canvas.width.toString());
    svg.setAttribute('height', canvas.height.toString());
    svg.setAttribute('viewBox', `0 0 ${canvas.width} ${canvas.height}`);
    svg.setAttribute('xmlns', svgNS);
    const image = document.createElementNS(svgNS, 'image');
    image.setAttribute('width', canvas.width.toString());
    image.setAttribute('height', canvas.height.toString());
    image.setAttribute('href', canvas.toDataURL('image/png'));
    svg.appendChild(image);
    const serializer = new XMLSerializer();
    return serializer.serializeToString(svg);
  };

  const handleConvert = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!selectedFile) return;
    setIsProcessing(true);
    const zip = new JSZip();

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const scale = 2.0;
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) throw new Error('Cannot get canvas context');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const renderContext = { canvasContext: context, viewport: viewport, canvas: canvas };
        await page.render(renderContext).promise;
        const svgString = canvasToSVG(canvas);
        zip.file(`halaman-${i}.svg`, svgString);
      }

      const zipContent = await zip.generateAsync({ type: 'blob' });
      setDownloadUrl(URL.createObjectURL(zipContent)); // Buat URL untuk modal sukses
      saveAs(zipContent, `BentoPDF-SVG-${selectedFile.name.replace('.pdf', '')}.zip`);
      setShowSuccessModal(true);
    } catch (error) {
      console.error(error);
      setShowErrorModal(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (downloadUrl) {
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `BentoPDF-SVG-Result.zip`;
      link.click();
    }
  };

  const handleNext = () => {
    setShowSuccessModal(false);
    setSelectedFile(null);
    setDownloadUrl(null);
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4 sm:mb-8 text-sm sm:text-base font-medium">
          <ArrowLeft className="w-5 h-5 mr-1" /> Back to Tools
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Upload Area (Layout JPG) */}
          <div className="lg:col-span-2 order-1 lg:order-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              
              {/* Drop Zone */}
              <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 sm:p-12 text-center bg-blue-50/30">
                <div className="flex justify-center mb-4 sm:mb-6">
                  <div className="relative w-24 h-24 sm:w-32 sm:h-32">
                    <img src="/asset/images/upload.svg" alt="upload" className="w-full h-full object-contain" />
                  </div>
                </div>
                <p className="text-gray-700 text-base sm:text-lg font-medium mb-2 px-2">
                  Drag and drop your PDF file here to start.
                </p>
                <p className="text-gray-500 mb-4 sm:mb-6 text-sm sm:text-base">or</p>
                <label className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-blue-50 text-blue-600 rounded-full cursor-pointer hover:bg-blue-100 transition-colors border border-blue-200 text-sm sm:text-base">
                  <UploadCloud className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Browse
                  <input ref={fileInputRef} type="file" accept="application/pdf" onChange={handleFileChange} className="hidden" />
                </label>
              </div>

              {/* Progress Bar (Layout JPG) */}
              {isUploading && (
                <div className="mt-4 space-y-3">
                  <div className="p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-gray-900 truncate font-medium text-sm">Uploading PDF...</p>
                      <span className="text-xs text-gray-500">{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Selected File (Layout JPG) */}
              {!isUploading && selectedFile && (
                <div className="mt-4">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">Selected File</h3>
                  <div className="p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200 flex justify-between items-center">
                    <div className="flex items-center gap-3 truncate">
                      <div className="bg-orange-500 text-white p-2 rounded-lg font-bold text-[10px] tracking-widest uppercase">SVG</div>
                      <span className="text-sm font-medium text-gray-900 truncate">{selectedFile.name}</span>
                    </div>
                    <button onClick={() => setSelectedFile(null)} className="text-red-500 hover:text-red-700">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Panel (Layout JPG) */}
          <div className="lg:col-span-1 order-1 lg:order-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 sticky top-24">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Code className="text-indigo-500 w-6 h-6" /> PDF to SVG
              </h2>
              <p className="text-gray-600 mb-6 text-sm sm:text-base">
                Extract content from your PDF into SVG format. Files can be opened in design software.
              </p>

              <button
                type="button"
                onClick={handleConvert}
                disabled={!selectedFile || isUploading || isProcessing}
                className="w-full py-2.5 sm:py-3 px-4 bg-gray-900 text-white rounded-3xl hover:bg-gray-800 disabled:bg-gray-300 font-bold transition-all flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Converting...</>
                ) : (
                  <>Mulai Konversi <Code className="w-4 h-4" /></>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Success Modal (Layout JPG) */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center animate-in fade-in zoom-in duration-300">
            <div className="flex justify-center mb-4">
              <Image src="/asset/images/success-modal.svg" alt="success" width={60} height={60} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Success!</h2>
            <p className="text-gray-600 mb-6 text-sm">
              SVG images extracted successfully into a ZIP file.
            </p>
            <button onClick={handleDownload} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full mb-3">
              Download ZIP
            </button>
            <button onClick={handleNext} className="w-full text-gray-500 hover:text-gray-700 font-medium">
              Next
            </button>
          </div>
        </div>
      )}

      {/* Error Modal (Layout JPG) */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center animate-in fade-in zoom-in duration-300">
            <div className="flex justify-center mb-4">
              <Image src="/asset/images/failed-modal.svg" alt="failed" width={60} height={60} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Failed!</h2>
            <p className="text-gray-600 mb-8 text-sm">Unable to process PDF to SVG. Please try again.</p>
            <button onClick={() => setShowErrorModal(false)} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-full">
              Try Again
            </button>
          </div>
        </div>
      )}

      <ToolsFooter />
    </div>
  );
}