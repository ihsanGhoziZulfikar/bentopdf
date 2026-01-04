'use client';

import React, { useState, useRef, ChangeEvent } from 'react';
import Link from 'next/link';
import Navbar from '@/app/components/navbar';
import ToolsFooter from '../../components/footer/tools-footer';
import Image from 'next/image';
import { jsPDF } from 'jspdf'; // Import library jsPDF

export default function WebPToPdf() {
  // --- STATE MANAGEMENT ---
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [quality, setQuality] = useState('medium');
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [uploadingFiles, setUploadingFiles] = useState<
    { name: string; size: number; progress: number }[]
  >([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null); // State untuk menyimpan Blob PDF

  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- HELPER: Baca File jadi Data URL (Base64) ---
  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // --- HELPER: Ambil Dimensi Gambar ---
  const getImageDimensions = (
    url: string
  ): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.onload = () => resolve({ width: img.width, height: img.height });
      img.onerror = reject;
      img.src = url;
    });
  };

  // --- HANDLERS ---

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);

      // VALIDASI: Filter khusus WebP
      const webpFiles = newFiles.filter(
        (f) => f.type === 'image/webp' || f.name.toLowerCase().endsWith('.webp')
      );

      if (webpFiles.length !== newFiles.length) {
        setErrorMsg(
          'Some files were skipped because they are not WebP images.'
        );
      } else {
        setErrorMsg(null);
      }

      if (webpFiles.length === 0) return;

      setIsUploading(true);

      const uploadFiles = webpFiles.map((f) => ({
        name: f.name,
        size: f.size,
        progress: 0,
      }));

      setUploadingFiles(uploadFiles);

      // Simulasi Upload Progress (Hanya visual karena client-side)
      webpFiles.forEach((file, index) => {
        let progress = 0;
        const interval = setInterval(() => {
          progress += 20; // Lebih cepat karena lokal
          setUploadingFiles((prev) => {
            const updated = [...prev];
            if (updated[index]) updated[index].progress = progress;
            return updated;
          });

          if (progress >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              if (index === webpFiles.length - 1) {
                setIsUploading(false);
                setSelectedFiles((prev) => [...prev, ...webpFiles]);
                setUploadingFiles([]);
              }
            }, 200);
          }
        }, 50);
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
      [newFiles[index], newFiles[newIndex]] = [
        newFiles[newIndex],
        newFiles[index],
      ];
      setSelectedFiles(newFiles);
    }
  };

  // --- LOGIKA UTAMA KONVERSI CLIENT-SIDE ---
  const handleConvert = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (selectedFiles.length === 0) {
      setErrorMsg('Please select at least 1 WebP file to convert.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      // 1. Inisialisasi jsPDF (Default A4)
      // Unit 'mm' memudahkan perhitungan ukuran kertas standar
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Loop setiap file
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];

        // Baca file jadi Base64
        const imgData = await readFileAsDataURL(file);
        const { width: imgRawWidth, height: imgRawHeight } =
          await getImageDimensions(imgData);

        // Hitung rasio aspek agar gambar muat di A4 (dengan margin sedikit)
        const margin = 10;
        const availableWidth = pageWidth - margin * 2;
        const availableHeight = pageHeight - margin * 2;

        const ratio = Math.min(
          availableWidth / imgRawWidth,
          availableHeight / imgRawHeight
        );

        const imgWidth = imgRawWidth * ratio;
        const imgHeight = imgRawHeight * ratio;

        // Posisi tengah (center)
        const x = (pageWidth - imgWidth) / 2;
        const y = (pageHeight - imgHeight) / 2;

        // Tambahkan halaman baru jika bukan gambar pertama
        if (i > 0) {
          pdf.addPage();
        }

        // Tentukan kompresi berdasarkan state quality
        let compression: 'FAST' | 'MEDIUM' | 'SLOW' | 'NONE' = 'FAST';
        if (quality === 'high') compression = 'NONE';
        if (quality === 'medium') compression = 'MEDIUM'; // Default jspdf biasanya JPEG
        if (quality === 'low') compression = 'FAST';

        // Tambahkan gambar ke PDF
        pdf.addImage(
          imgData,
          'WEBP',
          x,
          y,
          imgWidth,
          imgHeight,
          undefined,
          compression
        );
      }

      // 2. Generate Blob URL
      const blob = pdf.output('blob');
      const url = URL.createObjectURL(blob);

      setPdfBlob(blob); // Simpan blob untuk download manual jika perlu
      setDownloadUrl(url);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Conversion failed:', error);
      setShowErrorModal(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTryAgain = () => {
    setShowErrorModal(false);
    setErrorMsg(null);
  };

  const handleNext = () => {
    setShowSuccessModal(false);
    // Bersihkan URL lama untuk mencegah memory leak
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setDownloadUrl(null);
    setPdfBlob(null);
    setSelectedFiles([]);
  };

  const handleDownload = () => {
    if (downloadUrl) {
      // Buat elemen anchor temporary untuk trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = 'converted-images.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Navbar />

      {/* Main Content */}
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
          {/* Upload Area */}
          <div className="lg:col-span-2 order-1 lg:order-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              {/* Drop Zone */}
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
                  Drag and drop your WebP files here to start.
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
                    multiple
                    accept="image/webp, .webp"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                <div className="mt-4 sm:mt-6 flex items-center justify-center text-xs sm:text-sm text-blue-600 px-2">
                  <svg
                    className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Supported formats: WebP (Processed in Browser)
                </div>
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div className="mt-4 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs sm:text-sm">
                  {errorMsg}
                </div>
              )}

              {/* Uploading Files Progress */}
              {isUploading && uploadingFiles.length > 0 && (
                <div className="mt-4 space-y-3">
                  {uploadingFiles.map((file, index) => (
                    <div
                      key={`uploading-${index}`}
                      className="p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                          {/* Icon WebP (Green tinted) */}
                          <svg
                            className="w-6 h-6 sm:w-8 sm:h-8 text-green-500 flex-shrink-0"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <div className="flex-1 min-w-0">
                            <p className="text-gray-900 truncate font-medium text-sm sm:text-base">
                              {file.name}
                            </p>
                            <p className="text-gray-500 text-xs sm:text-sm">
                              {(file.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${file.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Success Message Inline (Optional, since we have modal) */}
              {downloadUrl && !isUploading && !showSuccessModal && (
                <div className="mt-4 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 font-semibold mb-3 flex items-center text-sm sm:text-base">
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Conversion Successful!
                  </p>
                  <button
                    onClick={handleDownload}
                    className="inline-block px-4 sm:px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors text-sm sm:text-base"
                  >
                    Download PDF
                  </button>
                  <button
                    onClick={handleNext}
                    className="ml-2 sm:ml-3 text-xs sm:text-sm text-gray-600 hover:text-gray-900 underline"
                  >
                    Reset
                  </button>
                </div>
              )}

              {/* Uploaded Files Grid */}
              {!isUploading && selectedFiles.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                      Files to Convert ({selectedFiles.length})
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {selectedFiles.map((file, index) => (
                      <div
                        key={`file-${index}`}
                        className="relative group bg-gray-50 rounded-lg border border-gray-200 p-3 hover:border-gray-300 transition-colors"
                      >
                        {/* Thumbnail Preview */}
                        <div className="aspect-square bg-gray-200 rounded mb-2 flex items-center justify-center overflow-hidden relative">
                          {/* Real Preview using URL.createObjectURL */}
                          <img
                            src={URL.createObjectURL(file)}
                            alt={file.name}
                            className="w-full h-full object-cover"
                            onLoad={(e) =>
                              URL.revokeObjectURL(
                                (e.target as HTMLImageElement).src
                              )
                            }
                          />
                        </div>

                        {/* File Info */}
                        <p className="text-xs text-gray-900 truncate font-medium mb-1">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(file.size / 1024).toFixed(1)} KB
                        </p>

                        {/* Action Buttons - Show on Hover */}
                        <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 rounded p-1">
                          <button
                            onClick={() => moveFile(index, 'up')}
                            disabled={index === 0}
                            className="p-1 bg-white rounded shadow-sm text-gray-600 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Move up"
                          >
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M5 15l7-7 7 7"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => moveFile(index, 'down')}
                            disabled={index === selectedFiles.length - 1}
                            className="p-1 bg-white rounded shadow-sm text-gray-600 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Move down"
                          >
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => removeFile(index)}
                            className="p-1 bg-white rounded shadow-sm text-red-500 hover:text-red-700"
                            title="Remove file"
                          >
                            <svg
                              className="w-3 h-3"
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

                        {/* Order Badge */}
                        <div className="absolute top-1 left-1 bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded shadow">
                          {index + 1}
                        </div>
                      </div>
                    ))}

                    {/* Add More Button */}
                    <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50/30 transition-colors flex flex-col items-center justify-center p-3">
                      <svg
                        className="w-8 h-8 text-gray-400 mb-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      <span className="text-xs text-gray-600 font-medium text-center">
                        Add more
                      </span>
                      <input
                        type="file"
                        multiple
                        accept="image/webp, .webp"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Info Panel */}
          <div className="lg:col-span-1 order-1 lg:order-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 sticky top-20">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                WebP to PDF
              </h2>
              <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
                Convert your WebP images into a single PDF file securely in your
                browser.
              </p>

              {/* Quality Settings */}
              {selectedFiles.length > 0 && !isUploading && (
                <div className="mb-4 sm:mb-6">
                  <label
                    htmlFor="quality"
                    className="block mb-2 text-sm font-medium text-gray-700"
                  >
                    PDF Quality
                  </label>
                  <select
                    id="quality"
                    value={quality}
                    onChange={(e) => setQuality(e.target.value)}
                    className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    <option value="high">High Quality (Original Size)</option>
                    <option value="medium">Medium Quality (Optimized)</option>
                    <option value="low">Low Quality (Smallest File)</option>
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    Controls image compression when embedding into PDF
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={handleConvert}
                disabled={
                  selectedFiles.length === 0 || isUploading || isProcessing
                }
                className="w-full py-2.5 sm:py-3 px-4 sm:px-6 bg-blue-700 text-white rounded-3xl hover:bg-blue-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center font-medium text-sm sm:text-base"
              >
                {isProcessing ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 text-white"
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
                    Convert to PDF
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5 ml-2"
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
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full text-center animate-in fade-in zoom-in duration-300">
            {/* Success Icon */}
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-green-100 p-4">
                <svg
                  className="w-16 h-16 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Success!</h2>

            {/* Message */}
            <p className="text-gray-600 mb-2">
              Your PDF is ready. The download should start automatically.
            </p>
            <p className="text-gray-600 mb-6 text-sm">
              If not, click{' '}
              <button
                onClick={handleDownload}
                className="text-blue-600 font-semibold hover:underline"
              >
                Download PDF
              </button>{' '}
              to save manually.
            </p>

            {/* Button */}
            <button
              onClick={handleNext}
              className="block mx-auto w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-full transition-colors flex items-center justify-center gap-2"
            >
              Convert More Files
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
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center animate-in fade-in zoom-in duration-300">
            {/* Error Icon */}
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-red-100 p-4">
                <svg
                  className="w-16 h-16 text-red-600"
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
              </div>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Failed!</h2>

            {/* Message */}
            <p className="text-gray-600 mb-6">
              Unable to convert the file. Please check if your WebP files are
              valid and try again.
            </p>

            {/* Button */}
            <button
              onClick={handleTryAgain}
              className="block mx-auto w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-full transition-colors flex items-center justify-center gap-2"
            >
              Try Again
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
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <ToolsFooter />
    </div>
  );
}
