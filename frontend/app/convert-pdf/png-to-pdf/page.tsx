'use client';

import React, { useState, useRef, ChangeEvent } from 'react';
import Link from 'next/link';
import Navbar from '@/app/components/navbar';
import ToolsFooter from '../../components/footer/tools-footer';
import Image from 'next/image';
import jsPDF from 'jspdf'; // Import jsPDF

export default function PngToPdf() {
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

  // Ref untuk menyimpan instance PDF agar bisa didownload manual jika perlu
  const pdfBlobUrlRef = useRef<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- HELPER FUNCTIONS ---

  // Konversi File ke Data URL (base64)
  const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        resolve(event.target?.result as string);
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  // Memuat gambar untuk mendapatkan dimensi asli (width/height)
  const loadImage = (url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = document.createElement('img'); // Gunakan native img element bukan Next Image
      img.src = url;
      img.onload = () => resolve(img);
      img.onerror = (err) => reject(err);
    });
  };

  // --- HANDLERS ---

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);

      // VALIDASI: Filter khusus PNG
      const pngFiles = newFiles.filter(
        (f) => f.type === 'image/png' || f.name.toLowerCase().endsWith('.png')
      );

      if (pngFiles.length !== newFiles.length) {
        setErrorMsg('Some files were skipped because they are not PNG images.');
      } else {
        setErrorMsg(null);
      }

      if (pngFiles.length === 0) return;

      setIsUploading(true);

      const uploadFiles = pngFiles.map((f) => ({
        name: f.name,
        size: f.size,
        progress: 0,
      }));

      setUploadingFiles(uploadFiles);

      // Simulasi Upload Progress (Hanya visual karena processing di client-side sangat cepat)
      pngFiles.forEach((file, index) => {
        let progress = 0;
        const interval = setInterval(() => {
          progress += 20; // Lebih cepat
          setUploadingFiles((prev) => {
            const updated = [...prev];
            if (updated[index])
              updated[index].progress = Math.min(progress, 100);
            return updated;
          });

          if (progress >= 100) {
            clearInterval(interval);
            // Jika ini file terakhir, selesai
            if (index === pngFiles.length - 1) {
              setTimeout(() => {
                setIsUploading(false);
                setSelectedFiles((prev) => [...prev, ...pngFiles]);
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
      [newFiles[index], newFiles[newIndex]] = [
        newFiles[newIndex],
        newFiles[index],
      ];
      setSelectedFiles(newFiles);
    }
  };

  const handleConvert = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (selectedFiles.length === 0) {
      setErrorMsg('Please select at least 1 PNG file to convert.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      // 1. Inisialisasi jsPDF (Portrait, mm, A4)
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 10; // Margin 10mm
      const usableWidth = pageWidth - margin * 2;
      const usableHeight = pageHeight - margin * 2;

      // 2. Loop setiap file
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];

        // Baca file menjadi Base64
        const imgData = await fileToDataUri(file);

        // Load image object untuk dapat dimensi asli
        const imgObj = await loadImage(imgData);

        // Hitung rasio aspek
        const imgRatio = imgObj.width / imgObj.height;
        const pageRatio = usableWidth / usableHeight;

        let finalWidth, finalHeight;

        // Logika Scaling (Fit to Page - Contain)
        if (imgRatio > pageRatio) {
          // Gambar lebih lebar dari area halaman
          finalWidth = usableWidth;
          finalHeight = usableWidth / imgRatio;
        } else {
          // Gambar lebih tinggi dari area halaman
          finalHeight = usableHeight;
          finalWidth = usableHeight * imgRatio;
        }

        // Posisi tengah (Centering)
        const x = (pageWidth - finalWidth) / 2;
        const y = (pageHeight - finalHeight) / 2;

        // Tambahkan halaman baru jika bukan gambar pertama
        if (i > 0) {
          doc.addPage();
        }

        // Tentukan Kompresi berdasarkan State 'Quality'
        // 'FAST' = Less compression (larger file), 'SLOW' = More compression
        let compression: 'FAST' | 'MEDIUM' | 'SLOW' = 'MEDIUM';
        if (quality === 'high') compression = 'FAST'; // PNG asli jika mungkin / less compression
        if (quality === 'low') compression = 'SLOW'; // Max compression

        // Tambahkan gambar ke PDF
        // Format 'PNG' menjaga transparansi. Jika 'JPEG', background jadi hitam.
        // Kita gunakan 'PNG' agar aman untuk PngToPdf tool.
        doc.addImage(
          imgData,
          'PNG',
          x,
          y,
          finalWidth,
          finalHeight,
          undefined,
          compression
        );
      }

      // 3. Generate Blob URL untuk download
      const pdfBlob = doc.output('blob');
      const blobUrl = URL.createObjectURL(pdfBlob);

      pdfBlobUrlRef.current = blobUrl; // Simpan di ref
      setDownloadUrl(blobUrl); // Simpan di state untuk tombol download
      setShowSuccessModal(true);
    } catch (err) {
      console.error('Conversion failed:', err);
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
    setDownloadUrl(null);
    setSelectedFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = '';

    // Revoke URL lama agar hemat memori
    if (pdfBlobUrlRef.current) {
      URL.revokeObjectURL(pdfBlobUrlRef.current);
      pdfBlobUrlRef.current = null;
    }
  };

  const handleDownload = () => {
    // Tombol manual download di dalam modal
    if (downloadUrl) {
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `converted-${Date.now()}.pdf`;
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
                    <Image
                      src="/asset/images/upload.svg"
                      alt="upload"
                      width={128}
                      height={128}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
                <p className="text-gray-700 text-base sm:text-lg font-medium mb-2 px-2">
                  Drag and drop your PNG files here to start.
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
                    accept="image/png, .png"
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
                  Supported formats: PNG (Max. 10 MB)
                </div>
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div className="mt-4 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs sm:text-sm">
                  {errorMsg}
                </div>
              )}

              {/* Uploading Progress */}
              {isUploading && uploadingFiles.length > 0 && (
                <div className="mt-4 space-y-3">
                  {uploadingFiles.map((file, index) => (
                    <div
                      key={`uploading-${index}`}
                      className="p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                          <svg
                            className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500 flex-shrink-0"
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

              {/* Success Message Inline (Optional) */}
              {downloadUrl && !isUploading && !showSuccessModal && (
                <div className="mt-4 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 font-semibold mb-3 flex items-center text-sm sm:text-base">
                    Conversion Successful!
                  </p>
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
                        <div className="aspect-square bg-gray-200 rounded mb-2 flex items-center justify-center overflow-hidden relative">
                          {/* Menggunakan URL.createObjectURL untuk preview thumbnail */}
                          <Image
                            src={URL.createObjectURL(file)}
                            alt={file.name}
                            fill
                            className="object-contain p-1"
                            onLoad={(e) =>
                              URL.revokeObjectURL(
                                (e.target as HTMLImageElement).src
                              )
                            }
                          />
                        </div>

                        <p className="text-xs text-gray-900 truncate font-medium mb-1">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(file.size / 1024).toFixed(1)} KB
                        </p>

                        {/* Controls */}
                        <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                          <button
                            onClick={() => moveFile(index, 'up')}
                            disabled={index === 0}
                            className="p-1 bg-white rounded shadow-sm text-gray-600 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            ▲
                          </button>
                          <button
                            onClick={() => moveFile(index, 'down')}
                            disabled={index === selectedFiles.length - 1}
                            className="p-1 bg-white rounded shadow-sm text-gray-600 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            ▼
                          </button>
                          <button
                            onClick={() => removeFile(index)}
                            className="p-1 bg-white rounded shadow-sm text-red-500 hover:text-red-700"
                          >
                            ✕
                          </button>
                        </div>
                        <div className="absolute top-1 left-1 bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded z-10">
                          {index + 1}
                        </div>
                      </div>
                    ))}

                    {/* Add More */}
                    <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50/30 transition-colors flex flex-col items-center justify-center p-3">
                      <span className="text-2xl text-gray-400 mb-1">+</span>
                      <span className="text-xs text-gray-600 font-medium text-center">
                        Add more
                      </span>
                      <input
                        type="file"
                        multiple
                        accept="image/png, .png"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Info Panel / Sidebar */}
          <div className="lg:col-span-1 order-1 lg:order-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 sticky top-24">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                PNG to PDF
              </h2>
              <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
                Convert your PNG images into a single PDF file with custom
                quality settings.
              </p>

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
                    <option value="high">High Quality (Original)</option>
                    <option value="medium">Medium Quality (Standard)</option>
                    <option value="low">Low Quality (Smallest File)</option>
                  </select>
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
                    Converting...
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
      {showSuccessModal && downloadUrl && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-auto text-center animate-in fade-in zoom-in duration-300">
            <div className="flex justify-center mb-4">
              <Image
                className="text-green-500"
                src="/asset/images/success-modal.svg"
                alt="success"
                width={80}
                height={80}
              />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-3">Success!</h2>

            <p className="text-gray-600 mb-2">Your PDF is ready.</p>
            <p className="text-gray-600 mb-6">
              Click{' '}
              <a
                href={downloadUrl}
                download="converted-images.pdf"
                className="text-blue-600 font-semibold hover:underline"
              >
                Download
              </a>{' '}
              to save the file.
            </p>

            <button
              onClick={handleNext}
              className="block mx-auto w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-full transition-colors flex items-center justify-center gap-2"
            >
              Start Over
            </button>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center animate-in fade-in zoom-in duration-300">
            <div className="flex justify-center mb-4">
              <Image
                src="/asset/images/failed-modal.svg"
                alt="failed"
                width={80}
                height={80}
              />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-3">Failed!</h2>

            <p className="text-gray-600 mb-6">
              Unable to convert the file to PDF. Please try again or check if
              the files are valid PNGs.
            </p>

            <button
              onClick={handleTryAgain}
              className="block mx-auto w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-full transition-colors flex items-center justify-center gap-2"
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
