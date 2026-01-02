'use client';

import React, {
  useState,
  useRef,
  ChangeEvent,
  DragEvent,
  useEffect,
} from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/app/components/navbar';
import ToolsFooter from '@/app/components/footer/tools-footer';

export default function SignPdf() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [flatten, setFlatten] = useState(false);

  // UI States
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLDivElement>(null); // Ref untuk auto-scroll

  // --- Logic Upload & Validasi ---
  const handleFileSelection = (file: File) => {
    if (file.type !== 'application/pdf') {
      setErrorMsg('Please select a valid PDF file.');
      return;
    }

    setErrorMsg(null);
    setIsUploading(true);
    setUploadProgress(0);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
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
  };

  // Efek Auto-scroll saat file dipilih
  useEffect(() => {
    if (selectedFile && editorRef.current) {
      setTimeout(() => {
        editorRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 500);
    }
  }, [selectedFile]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelection(e.target.files[0]);
    }
  };

  // --- Drag & Drop ---
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

  // --- Manage File ---
  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // --- Logic Save (Simulasi) ---
  const handleSave = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setShowSuccessModal(true);
    }, 2000);
  };

  const handleDownload = () => {
    alert('Downloading signed PDF...');
  };

  const handleNext = () => {
    setShowSuccessModal(false);
    removeFile();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Back Link */}
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

        {/* Layout Grid 2 Kolom (Kiri: Main Content, Kanan: Sidebar) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 items-start">
          {/* --- KOLOM KIRI (Main Area) --- */}
          <div className="lg:col-span-2 order-1 lg:order-1 flex flex-col gap-6">
            {/* 1. SECTION UPLOAD / FILE INFO */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              {/* State A: Belum ada file (Tampilkan Dropzone Besar) */}
              {!selectedFile && !isUploading && (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-lg p-6 sm:p-12 text-center transition-colors ${
                    isDragging
                      ? 'border-blue-500 bg-blue-100'
                      : 'border-blue-300 bg-blue-50/30'
                  }`}
                >
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
                    Drag and drop your PDF file here to sign.
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
                    Supported formats: PDF
                  </div>
                </div>
              )}

              {/* State B: Sedang Upload */}
              {isUploading && (
                <div className="space-y-3">
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-900 font-medium text-sm">
                        Uploading...
                      </span>
                      <span className="text-xs text-gray-500">
                        {uploadProgress}%
                      </span>
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

              {/* State C: File Terpilih (Tampilkan Card Ringkas) */}
              {selectedFile && !isUploading && (
                <div className="animate-in fade-in">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base font-semibold text-gray-900">
                      Document Ready
                    </h3>
                  </div>
                  <div className="flex items-center justify-between p-3 sm:p-4 bg-blue-50 border border-blue-100 rounded-lg">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="flex-shrink-0 w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-blue-200">
                        <svg
                          className="w-6 h-6 text-red-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate max-w-[200px] sm:max-w-xs">
                          {selectedFile.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={removeFile}
                      className="text-sm text-red-600 hover:text-red-700 font-medium hover:bg-red-50 px-3 py-1.5 rounded-md transition-colors"
                    >
                      Change File
                    </button>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {errorMsg && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs sm:text-sm">
                  {errorMsg}
                </div>
              )}
            </div>

            {/* 2. SECTION EDITOR (MUNCUL DI BAWAH UPLOAD) */}
            {selectedFile && !isUploading && (
              <div
                ref={editorRef}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 animate-in slide-in-from-bottom-4 fade-in duration-500"
              >
                <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-4">
                  <h3 className="text-lg font-bold text-gray-900">
                    Sign Document
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                      Editor Active
                    </span>
                  </div>
                </div>

                {/* PDF Editor Canvas Container */}
                <div className="relative w-full h-[70vh] overflow-auto bg-gray-100 border border-gray-300 rounded-lg flex items-center justify-center shadow-inner">
                  <div className="text-center p-8">
                    <div className="mb-4 inline-block p-4 bg-white rounded-full shadow-sm">
                      <svg
                        className="w-12 h-12 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                        />
                      </svg>
                    </div>
                    <h4 className="text-lg font-medium text-gray-900">
                      PDF Editor Placeholder
                    </h4>
                    <p className="text-gray-500 mt-2 max-w-md mx-auto text-sm">
                      Implement your <strong>PDF.js</strong> or{' '}
                      <strong>React-PDF</strong> logic here. Canvas overlay for
                      drawing signatures goes on top of the PDF layer.
                    </p>
                  </div>
                </div>

                {/* Editor Controls Footer */}
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded text-blue-600 border-gray-300 focus:ring-blue-500"
                      checked={flatten}
                      onChange={(e) => setFlatten(e.target.checked)}
                    />
                    <span>
                      Flatten PDF{' '}
                      <span className="text-xs text-gray-500 font-normal">
                        (Prevents editing)
                      </span>
                    </span>
                  </label>

                  <button
                    onClick={handleSave}
                    disabled={isProcessing}
                    className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors font-semibold shadow-sm flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      <>
                        Save & Download
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
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                          />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* --- KOLOM KANAN (Sidebar Sticky) --- */}
          <div className="lg:col-span-1 order-1 lg:order-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 sticky top-24 z-10">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                Sign PDF
              </h2>
              <p className="text-gray-600 mb-4 text-sm sm:text-base">
                Upload a PDF document to add your digital signature easily and
                securely.
              </p>

              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-blue-800 text-sm mb-2">
                  How it works:
                </h3>
                <ol className="list-decimal list-inside text-sm text-blue-700 space-y-2">
                  <li>Upload your PDF file.</li>
                  <li>The editor will appear below.</li>
                  <li>Draw or type your signature.</li>
                  <li>Click "Save & Download".</li>
                </ol>
              </div>

              <div className="text-xs text-gray-500 pt-4 border-t border-gray-100">
                <p>
                  Your files are processed locally in your browser for maximum
                  privacy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* --- Success Modal --- */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full text-center animate-in fade-in zoom-in duration-300">
            <div className="flex justify-center mb-4">
              <Image
                className="w-24 h-24"
                src="/asset/images/success-modal.svg"
                alt="success"
                width={96}
                height={96}
              />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-3">Success!</h2>
            <p className="text-gray-600 mb-2">Your signed document is ready.</p>
            <p className="text-gray-600 mb-6">
              Click{' '}
              <button
                onClick={handleDownload}
                className="text-blue-600 font-semibold hover:underline"
              >
                Download
              </button>{' '}
              to save it.
            </p>

            <button
              onClick={handleNext}
              className="block mx-auto w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-full transition-colors flex items-center justify-center gap-2"
            >
              Sign Another PDF
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
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      <ToolsFooter />
    </div>
  );
}
