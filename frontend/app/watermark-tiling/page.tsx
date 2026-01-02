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

export default function WatermarkTiling() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // --- Watermark Settings States ---
  const [watermarkType, setWatermarkType] = useState<'text' | 'image'>('text');
  const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL');
  const [fontSize, setFontSize] = useState(48);
  const [color, setColor] = useState('#9ca3af');
  const [opacity, setOpacity] = useState(0.3);
  const [angle, setAngle] = useState(-45);
  const [gap, setGap] = useState(2);

  // UI States
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Logic Upload ---
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

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!isUploading) setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (
      !isUploading &&
      e.dataTransfer.files &&
      e.dataTransfer.files.length > 0
    ) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleProcess = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setShowSuccessModal(true);
    }, 2000);
  };

  const handleDownload = () => {
    alert('Downloading PDF with Tiled Watermark...');
  };

  const handleNext = () => {
    setShowSuccessModal(false);
    removeFile();
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 items-start">
          {/* --- KOLOM KIRI (Upload & Preview) --- */}
          <div className="lg:col-span-2 order-1 lg:order-1 flex flex-col gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              {/* LOGIC PERUBAHAN:
                  Dropzone tetap dirender selama (!selectedFile).
                  Di dalamnya, kita cek apakah (isUploading) atau tidak untuk menentukan kontennya.
              */}
              {!selectedFile && (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => !isUploading && fileInputRef.current?.click()}
                  className={`relative flex flex-col items-center justify-center min-h-[250px] border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 ${
                    isUploading
                      ? 'border-gray-300 bg-gray-50 cursor-default'
                      : isDragging
                        ? 'border-blue-500 bg-blue-50 cursor-pointer'
                        : 'border-blue-300 bg-blue-50/30 hover:bg-blue-50 cursor-pointer'
                  }`}
                >
                  {isUploading ? (
                    // --- TAMPILAN SAAT LOADING (DI DALAM KOTAK) ---
                    <div className="w-full max-w-sm animate-in fade-in zoom-in duration-300">
                      <div className="flex justify-center mb-4">
                        {/* Loading Icon Animasi */}
                        <div className="relative">
                          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                          <div className="absolute inset-0 flex items-center justify-center font-bold text-xs text-blue-600">
                            PDF
                          </div>
                        </div>
                      </div>
                      <h3 className="text-gray-900 font-semibold text-lg mb-2">
                        Uploading File...
                      </h3>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2 overflow-hidden">
                        <div
                          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-500">
                        {uploadProgress}% Complete
                      </p>
                    </div>
                  ) : (
                    // --- TAMPILAN SAAT STANDBY (DI DALAM KOTAK) ---
                    <div className="animate-in fade-in duration-300">
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
                        Drag and drop your PDF file here.
                      </p>
                      <p className="text-gray-500 mb-4 sm:mb-6 text-sm sm:text-base">
                        or
                      </p>
                      <div className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors border border-blue-200 text-sm sm:text-base">
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
                      </div>
                      <div className="mt-4 sm:mt-6 text-xs sm:text-sm text-blue-600 px-2">
                        Supported formats: PDF
                      </div>
                    </div>
                  )}

                  {/* Hidden Input tetap ada */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={isUploading}
                  />
                </div>
              )}

              {/* State C: File Selected (Preview Watermark) */}
              {selectedFile && !isUploading && (
                <div className="animate-in fade-in">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Preview
                    </h3>
                    <button
                      onClick={removeFile}
                      className="text-sm text-red-600 hover:text-red-700 font-medium hover:underline"
                    >
                      Change File
                    </button>
                  </div>

                  <div className="relative w-full h-[600px] overflow-hidden bg-gray-100 border border-gray-300 rounded-lg flex items-center justify-center shadow-inner">
                    {/* Background PDF Placeholder */}
                    <div className="bg-white w-[80%] h-[90%] shadow-lg p-8 relative overflow-hidden flex flex-col gap-4">
                      <div className="h-4 bg-gray-200 w-3/4 rounded"></div>
                      <div className="h-4 bg-gray-200 w-full rounded"></div>
                      <div className="h-4 bg-gray-200 w-full rounded"></div>
                      <div className="h-4 bg-gray-200 w-5/6 rounded"></div>
                      <div className="h-32 bg-gray-100 w-full rounded mt-4"></div>
                      <div className="h-4 bg-gray-200 w-full rounded mt-4"></div>
                      <div className="h-4 bg-gray-200 w-4/5 rounded"></div>

                      {/* Watermark Overlay */}
                      <div
                        className="absolute inset-0 pointer-events-none flex flex-wrap content-center justify-center overflow-hidden opacity-50 z-10"
                        style={{
                          gap: `${gap}rem`,
                          transform: `rotate(${angle}deg) scale(1.2)`,
                        }}
                      >
                        {Array.from({ length: 40 }).map((_, i) => (
                          <div
                            key={i}
                            style={{
                              fontSize: `${fontSize / 2}px`,
                              color: color,
                              opacity: opacity,
                              whiteSpace: 'nowrap',
                              fontWeight: 'bold',
                              userSelect: 'none',
                            }}
                          >
                            {watermarkType === 'text'
                              ? watermarkText
                              : '[LOGO]'}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <p className="mt-2 text-xs text-gray-500 text-center">
                    *Preview is an approximation. Final result may vary.
                  </p>
                </div>
              )}

              {errorMsg && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs sm:text-sm">
                  {errorMsg}
                </div>
              )}
            </div>
          </div>

          {/* --- KOLOM KANAN (Sticky Control Panel) --- */}
          <div className="lg:col-span-1 order-1 lg:order-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 sticky top-24 z-10">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                Watermark Tiling
              </h2>
              <p className="text-gray-600 mb-6 text-sm sm:text-base">
                Add a repeating watermark pattern to protect your PDF documents.
              </p>

              {/* SETTINGS FORM */}
              {selectedFile && !isUploading && (
                <div className="space-y-5 animate-in fade-in">
                  {/* 1. Watermark Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="type"
                          checked={watermarkType === 'text'}
                          onChange={() => setWatermarkType('text')}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Text</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="type"
                          checked={watermarkType === 'image'}
                          onChange={() => setWatermarkType('image')}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Image</span>
                      </label>
                    </div>
                  </div>

                  {/* 2. Content Input */}
                  {watermarkType === 'text' ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Text
                      </label>
                      <input
                        type="text"
                        value={watermarkText}
                        onChange={(e) => setWatermarkText(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="Enter watermark text"
                      />
                    </div>
                  ) : (
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-500 text-center">
                      Image upload feature coming soon.
                    </div>
                  )}

                  {/* 3. Appearance */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Font Size
                      </label>
                      <input
                        type="number"
                        value={fontSize}
                        onChange={(e) => setFontSize(Number(e.target.value))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Color
                      </label>
                      <div className="flex items-center gap-2 h-[38px] border border-gray-300 rounded-lg px-2 bg-white">
                        <input
                          type="color"
                          value={color}
                          onChange={(e) => setColor(e.target.value)}
                          className="w-6 h-6 border-none p-0 cursor-pointer bg-transparent"
                        />
                        <span className="text-xs text-gray-500 uppercase">
                          {color}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 4. Sliders */}
                  <div className="space-y-4 pt-2 border-t border-gray-100">
                    <div>
                      <div className="flex justify-between mb-1">
                        <label className="text-xs font-medium text-gray-700">
                          Opacity
                        </label>
                        <span className="text-xs text-gray-500">
                          {Math.round(opacity * 100)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={opacity}
                        onChange={(e) => setOpacity(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <label className="text-xs font-medium text-gray-700">
                          Rotation
                        </label>
                        <span className="text-xs text-gray-500">{angle}°</span>
                      </div>
                      <input
                        type="range"
                        min="-180"
                        max="180"
                        value={angle}
                        onChange={(e) => setAngle(Number(e.target.value))}
                        className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <label className="text-xs font-medium text-gray-700">
                          Spacing (Gap)
                        </label>
                        <span className="text-xs text-gray-500">{gap}x</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        step="0.5"
                        value={gap}
                        onChange={(e) => setGap(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                    </div>
                  </div>

                  {/* Process Button */}
                  <button
                    onClick={handleProcess}
                    disabled={isProcessing}
                    className="w-full py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors font-semibold shadow-sm flex items-center justify-center gap-2 mt-4"
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
                        Applying Watermark...
                      </>
                    ) : (
                      'Apply Watermark'
                    )}
                  </button>
                </div>
              )}

              {/* Fallback info */}
              {(!selectedFile || isUploading) && (
                <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded-lg border border-gray-100">
                  Upload a PDF to customize watermark settings.
                </div>
              )}
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
            <p className="text-gray-600 mb-2">Watermark added successfully.</p>
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
              Watermark Another PDF
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
