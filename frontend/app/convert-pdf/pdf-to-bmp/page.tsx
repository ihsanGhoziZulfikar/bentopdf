'use client';

import React, { useState, useRef, ChangeEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/app/components/navbar';
import ToolsFooter from '@/app/components/footer/tools-footer';

// --- LIBRARY IMPORTS ---
import * as pdfjsLib from 'pdfjs-dist';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';

// Setup PDF.js Worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

export default function PdfToBmp() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [scale, setScale] = useState(2.0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];

      if (file.type !== 'application/pdf') {
        setErrorMsg('Please select a valid PDF file.');
        return;
      }

      setErrorMsg(null);
      setIsUploading(true);
      setUploadProgress(0);

      // Simulasi progress upload
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
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setDownloadUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleConvert = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (!selectedFile) {
      setErrorMsg('Please select a PDF file to convert.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);

    const zip = new JSZip();

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        if (!context) continue;

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
          canvas: canvas,
        };

        await page.render(renderContext).promise;

        // BMP conversion (via dataURL)
        const imageData = canvas.toDataURL('image/bmp');
        const base64Data = imageData.replace(/^data:image\/bmp;base64,/, '');

        zip.file(`page-${i}.bmp`, base64Data, { base64: true });

        // Cleanup memory
        canvas.width = 0;
        canvas.height = 0;
      }

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);

      setDownloadUrl(url);
      setIsProcessing(false);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error converting PDF to BMP:', error);
      setIsProcessing(false);
      setShowErrorModal(true);
    }
  };

  const handleDownload = () => {
    if (downloadUrl && selectedFile) {
      saveAs(
        downloadUrl,
        `BentoPDF-BMP-${selectedFile.name.replace('.pdf', '')}.zip`
      );
    }
  };

  const handleTryAgain = () => {
    setShowErrorModal(false);
    setErrorMsg(null);
  };

  const handleNext = () => {
    setShowSuccessModal(false);
    setDownloadUrl(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
          {/* Area Upload */}
          <div className="lg:col-span-2 order-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 sm:p-12 text-center bg-blue-50/30">
                <div className="flex justify-center mb-4 sm:mb-6">
                  <div className="relative w-24 h-24 sm:w-32 sm:h-32">
                    <img
                      src="/asset/images/upload.svg"
                      alt="upload"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
                <p className="text-gray-700 text-base sm:text-lg font-medium mb-2 px-2">
                  Drag and drop your PDF file to convert to BMP.
                </p>
                <p className="text-gray-500 mb-4 sm:mb-6 text-sm sm:text-base">
                  or
                </p>
                <label className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-blue-50 text-blue-600 rounded-full cursor-pointer hover:bg-blue-100 transition-colors border border-blue-200 text-sm sm:text-base">
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
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

              {errorMsg && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs sm:text-sm">
                  {errorMsg}
                </div>
              )}

              {isUploading && (
                <div className="mt-4 p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <svg
                        className="w-6 h-6 text-red-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                      </svg>
                      <span className="text-sm font-medium text-gray-900">
                        Uploading PDF...
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {!isUploading && selectedFile && (
                <div className="mt-4 p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200 flex justify-between items-center">
                  <div className="flex items-center space-x-3 truncate">
                    <svg
                      className="w-6 h-6 text-red-500 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {selectedFile.name}
                    </span>
                  </div>
                  <button
                    onClick={removeFile}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Panel Pengaturan */}
          <div className="lg:col-span-1 order-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                PDF to BMP
              </h2>
              <p className="text-gray-600 mb-6 text-sm">
                Convert PDF pages into uncompressed BMP format for high-fidelity
                imaging.
              </p>

              {selectedFile && !isUploading && (
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-gray-700">
                      Resolution
                    </label>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-bold">
                      {scale.toFixed(1)}x
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1.0"
                    max="3.0"
                    step="0.1"
                    value={scale}
                    onChange={(e) => setScale(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>
              )}

              <button
                onClick={handleConvert}
                disabled={!selectedFile || isUploading || isProcessing}
                className="w-full py-3 bg-gray-900 text-white rounded-3xl hover:bg-gray-800 disabled:bg-gray-300 transition-all font-medium flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>{' '}
                    Processing...
                  </>
                ) : (
                  <>
                    Convert to BMP{' '}
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-2xl animate-in fade-in zoom-in duration-300">
            <Image
              src="/asset/images/success-modal.svg"
              alt="success"
              width={60}
              height={60}
              className="mx-auto mb-4"
            />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              BMP Ready!
            </h2>
            <p className="text-gray-600 mb-6">
              Your PDF pages have been converted to BMP successfully.
            </p>
            <button
              onClick={handleDownload}
              className="text-blue-600 font-semibold hover:underline mb-6 block w-full text-sm"
            >
              Download ZIP manually
            </button>
            <button
              onClick={handleNext}
              className="w-full bg-blue-600 text-white font-semibold py-3 rounded-full hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              Finish{' '}
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M9 5l7 7-7 7" strokeWidth="2" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-2xl animate-in fade-in zoom-in duration-300">
            <Image
              src="/asset/images/failed-modal.svg"
              alt="failed"
              width={60}
              height={60}
              className="mx-auto mb-4"
            />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Failed!</h2>
            <p className="text-gray-600 mb-6">
              Something went wrong during the BMP conversion process.
            </p>
            <button
              onClick={handleTryAgain}
              className="w-full bg-blue-600 text-white font-semibold py-3 rounded-full hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      <ToolsFooter />
    </div>
  );
}
