'use client';

import React, { useState, useRef, ChangeEvent, DragEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/app/components/navbar';
import ToolsFooter from '@/app/components/footer/tools-footer';

export default function PdfToJpg() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [quality, setQuality] = useState(0.9);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // UI States untuk interaksi
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- 1. Logic Upload & Validasi ---
  const handleFileSelection = (file: File) => {
    // Validasi tipe file
    if (file.type !== 'application/pdf') {
      setErrorMsg('Please select a valid PDF file.');
      return;
    }

    setErrorMsg(null);
    setIsUploading(true);
    setUploadProgress(0);

    // Simulasi Progress Bar
    let progress = 0;
    const interval = setInterval(() => {
      progress += 15;
      setUploadProgress((prev) => (prev >= 90 ? 90 : progress));

      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setIsUploading(false);
          setSelectedFile(file);
          setUploadProgress(0);
        }, 400);
      }
    }, 100);

    setDownloadUrl(null);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelection(e.target.files[0]);
    }
  };

  // --- 2. Logic Drag & Drop ---
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  // --- 3. Manage File ---
  const removeFile = () => {
    setSelectedFile(null);
    setDownloadUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // --- 4. Logic Convert ---
  const handleConvert = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsProcessing(true);
    setErrorMsg(null);

    // Simulasi proses backend
    setTimeout(() => {
      setIsProcessing(false);
      const isSuccess = true; // Demo: selalu sukses

      if (isSuccess) {
        setDownloadUrl('#');
        setShowSuccessModal(true);
      } else {
        setShowErrorModal(true);
      }
    }, 2000);
  };

  const handleDownload = () => {
    alert("Downloading ZIP file...");
  };

  const handleNext = () => {
    setShowSuccessModal(false);
    setDownloadUrl(null);
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleTryAgain = () => {
    setShowErrorModal(false);
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        
        {/* Back Link */}
        <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4 sm:mb-8 text-sm sm:text-base">
          <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Tools
        </Link>

        {/* Layout Utama */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 items-start">

          {/* --- KOLOM KIRI: Upload & Display File --- */}
          <div className="lg:col-span-2 order-1 lg:order-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">

              {/* Drop Zone Area */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-6 sm:p-12 text-center transition-colors ${
                  isDragging ? 'border-blue-500 bg-blue-100' : 'border-blue-300 bg-blue-50/30'
                }`}
              >
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
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Browse
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                <div className="mt-4 sm:mt-6 text-xs sm:text-sm text-blue-600 px-2">
                  Supported formats: PDF (Max. 50 MB)
                </div>
              </div>

              {/* Error Alert */}
              {errorMsg && (
                <div className="mt-4 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs sm:text-sm">
                  {errorMsg}
                </div>
              )}

              {/* Uploading Progress Bar */}
              {isUploading && (
                <div className="mt-4 space-y-3">
                  <div className="p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-900 font-medium text-sm">Uploading...</span>
                      </div>
                      <span className="text-xs text-gray-500">{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Success Result Banner */}
              {downloadUrl && !isUploading && !showSuccessModal && (
                <div className="mt-4 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg animate-in fade-in">
                  <p className="text-green-800 font-semibold mb-3 flex items-center text-sm sm:text-base">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Conversion Successful!
                  </p>
                  <button onClick={handleDownload} className="inline-block px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium mr-3 hover:bg-green-700 transition">Download ZIP</button>
                  <button onClick={removeFile} className="text-sm text-gray-600 underline hover:text-gray-900">Convert Another</button>
                </div>
              )}

              {/* Selected File (Grid Style) */}
              {!isUploading && selectedFile && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                      Selected File
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 animate-in fade-in slide-in-from-bottom-2">
                    
                    {/* File Card Item */}
                    <div className="relative group bg-gray-50 rounded-lg border border-gray-200 p-2 hover:border-blue-300 transition-colors">
                      <div className="aspect-square bg-gray-200 rounded mb-2 flex items-center justify-center overflow-hidden">
                        <svg className="w-10 h-10 sm:w-12 sm:h-12 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                        </svg>
                      </div>

                      <p className="text-xs text-gray-900 truncate font-medium mb-1" title={selectedFile.name}>
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>

                      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={removeFile}
                          className="p-1 bg-white rounded shadow-sm text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                          title="Remove file"
                        >
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Change File Button */}
                    <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50/30 transition-colors flex flex-col items-center justify-center p-3 group">
                      <svg className="w-8 h-8 text-gray-400 group-hover:text-blue-500 mb-1 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span className="text-xs text-gray-600 group-hover:text-blue-600 font-medium text-center transition-colors">Change File</span>
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>

                  </div>
                </div>
              )}
            </div>
          </div>

          {/* --- KOLOM KANAN: Settings & Action (Sticky) --- */}
          <div className="lg:col-span-1 order-1 lg:order-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 sticky top-24 z-10">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">PDF to JPG</h2>
              <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
                Convert each page of a PDF file into high-quality JPG images wrapped in a ZIP file.
              </p>

              {selectedFile && !isUploading && (
                <div className="mb-4 sm:mb-6 animate-in fade-in">
                  <label htmlFor="quality" className="block mb-2 text-sm font-medium text-gray-700">
                    Image Quality
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      id="quality"
                      min="0.1"
                      max="1.0"
                      step="0.05"
                      value={quality}
                      onChange={(e) => setQuality(parseFloat(e.target.value))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-900"
                    />
                    <span className="text-gray-900 font-medium w-12 text-right text-sm">
                      {Math.round(quality * 100)}%
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Higher quality = larger file size</p>
                </div>
              )}

              <button
                type="button"
                onClick={handleConvert}
                disabled={!selectedFile || isUploading || isProcessing}
                className="w-full py-2.5 sm:py-3 px-4 sm:px-6 bg-gray-900 text-white rounded-3xl hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center font-medium text-sm sm:text-base"
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Converting...
                  </>
                ) : (
                  <>
                    Convert to JPG
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>

        </div>
      </main>

      {/* --- MODALS --- */}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-auto text-center animate-in fade-in zoom-in duration-300">
            <div className="flex justify-center">
              <Image className="w-50 h-50 text-white" src="/asset/images/success-modal.svg" alt="success" width={50} height={50} />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-3">Success!</h2>
            <p className="text-gray-600 mb-2">The download will start automatically.</p>
            <p className="text-gray-600 mb-6">
              If not, click <button onClick={handleDownload} className="text-yellow-400 font-semibold hover:underline">Download</button> to manually save the file.
            </p>

            <button
              onClick={handleNext}
              className="block mx-auto w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-full transition-colors flex items-center justify-center gap-2"
            >
              Next
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center animate-in fade-in zoom-in duration-300">
            <div className="flex justify-center">
              <Image className="w-50 h-50 text-white" src="/asset/images/failed-modal.svg" alt="success" width={50} height={50} />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-3">Failed!</h2>
            <p className="text-gray-600 mb-6">Unable to convert the file to PDF. Please try again.</p>

            <button
              onClick={handleTryAgain}
              className="block mx-auto w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-full transition-colors flex items-center justify-center gap-2"
            >
              Try Again
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <ToolsFooter />
    </div>
  );
}