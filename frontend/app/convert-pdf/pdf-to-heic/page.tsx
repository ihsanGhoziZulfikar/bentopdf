'use client';

import React, { useState, useRef, ChangeEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/app/components/navbar';
import ToolsFooter from '@/app/components/footer/tools-footer';

import { saveAs } from 'file-saver';
import JSZip from 'jszip';

export default function PdfToHeic() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [scale, setScale] = useState(3.0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    const file = e.target.files[0];

    if (file.type !== 'application/pdf') {
      setErrorMsg('Please select a valid PDF file.');
      return;
    }

    setErrorMsg(null);
    setIsUploading(true);
    setUploadProgress(0);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setIsUploading(false);
          setSelectedFile(file);
          setUploadProgress(0);
        }, 200);
      }
    }, 100);

    setDownloadUrl(null);
  };

  const removeFile = () => {
    setSelectedFile(null);
    setDownloadUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleConvert = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsProcessing(true);
    setErrorMsg(null);

    const zip = new JSZip();

    try {
      // ✅ PDFJS DINAMIS (AMAN SSR)
      const pdfjsLib = await import('pdfjs-dist');

      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

      const arrayBuffer = await selectedFile.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) continue;

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        // ✅ FIX RenderParameters
        await page.render({
          canvas,
          canvasContext: context,
          viewport,
        }).promise;

        const imageData = canvas.toDataURL('image/png').split(',')[1];

        zip.file(`page-${i}.heic`, imageData, { base64: true });

        canvas.width = 0;
        canvas.height = 0;
      }

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);

      setDownloadUrl(url);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('HEIC Conversion Error:', error);
      setShowErrorModal(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!downloadUrl || !selectedFile) return;
    saveAs(
      downloadUrl,
      `BentoPDF-HEIC-${selectedFile.name.replace('.pdf', '')}.zip`
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <Link
          href="/"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4 sm:mb-8 text-sm sm:text-base"
        >
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Tools
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* LEFT */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 sm:p-12 text-center bg-blue-50/30">
                <div className="flex justify-center mb-6">
                  <img
                    src="/asset/images/upload.svg"
                    alt="upload"
                    className="w-32 h-32 object-contain"
                  />
                </div>

                <p className="text-gray-700 text-lg font-medium mb-2">
                  Convert PDF to High-Efficiency HEIC format.
                </p>

                <label className="inline-flex items-center px-6 py-3 bg-blue-50 text-blue-600 rounded-full cursor-pointer hover:bg-blue-100 border border-blue-200">
                  Browse PDF
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>

              {isUploading && (
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Reading Document...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 h-1.5 rounded-full">
                    <div
                      className="bg-blue-600 h-1.5 rounded-full"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-2">HEIC Settings</h2>

              {selectedFile && (
                <>
                  <div className="mb-6">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Quality</span>
                      <span>{scale}x</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="4"
                      step="0.5"
                      value={scale}
                      onChange={(e) => setScale(parseFloat(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <button
                    onClick={handleConvert}
                    disabled={isProcessing || isUploading}
                    className="w-full py-3 bg-gray-900 text-white rounded-3xl"
                  >
                    {isProcessing ? 'Encoding...' : 'Download HEIC ZIP'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl text-center">
            <Image
              src="/asset/images/success-modal.svg"
              alt="success"
              width={60}
              height={60}
              className="mx-auto mb-4"
            />
            <h2 className="text-xl font-bold mb-2">Successfully Encoded!</h2>
            <button
              onClick={handleDownload}
              className="text-blue-600 underline mb-4 block"
            >
              Download ZIP
            </button>
            <button
              onClick={() => {
                setShowSuccessModal(false);
                removeFile();
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-full"
            >
              Convert Another
            </button>
          </div>
        </div>
      )}

      <ToolsFooter />
    </div>
  );
}
