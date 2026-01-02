'use client';

import React, { useState, ChangeEvent } from 'react';
import Link from 'next/link';
import Navbar from '../components/navbar'; // Pastikan path ini benar sesuai struktur folder Anda
import ToolsFooter from '../components/footer/tools-footer'; // Pastikan path ini benar
import {
  CircleArrowUp,
  FileText,
  Settings,
  Download,
  RefreshCw,
  CheckCircle,
} from 'lucide-react';

// Interface Data Response Backend
interface CompressResult {
  download_url: string;
  saved_size: string;
  original_size: string;
  compressed_size: string;
}

// Interface untuk simulasi upload UI
interface UploadingFile {
  file: File;
  progress: number;
  id: string;
}

export default function CompressPDF() {
  // --- STATE ---
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]); // Kita tampung array, tapi logic nanti ambil index 0
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // State Logic Kompresi
  const [compressionLevel, setCompressionLevel] = useState('recommended');
  const [algorithm, setAlgorithm] = useState('vector');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // State Hasil
  const [resultData, setResultData] = useState<CompressResult | null>(null);

  // --- HELPER: FORMAT SIZE ---
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  // --- SIMULASI UPLOAD (UX Merge PDF) ---
  const simulateUpload = (file: File) => {
    const fileId = `${file.name}-${Date.now()}`;
    const newUploadingFile: UploadingFile = {
      file,
      progress: 0,
      id: fileId,
    };

    setUploadingFiles((prev) => [...prev, newUploadingFile]);

    const interval = setInterval(() => {
      setUploadingFiles((prev) => {
        const updated = prev.map((uf) => {
          if (uf.id === fileId) {
            const newProgress = Math.min(uf.progress + 15, 100); // Lebih cepat sedikit
            return { ...uf, progress: newProgress };
          }
          return uf;
        });

        const completedFile = updated.find(
          (uf) => uf.id === fileId && uf.progress === 100
        );

        if (completedFile) {
          clearInterval(interval);
          setTimeout(() => {
            // Logic Kompresi biasanya 1 file, jadi kita reset selectedFiles sebelumnya
            setSelectedFiles([completedFile.file]);
            setUploadingFiles((current) =>
              current.filter((uf) => uf.id !== fileId)
            );
            // Reset hasil sebelumnya jika upload baru
            setResultData(null);
            setErrorMsg(null);
          }, 300);
        }

        return updated;
      });
    }, 100);
  };

  // --- HANDLERS ---
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.type === 'application/pdf') {
        simulateUpload(file);
      } else {
        setErrorMsg('Please upload a valid PDF file.');
      }
    }
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf') {
        simulateUpload(file);
      }
    }
  };

  const clearFiles = () => {
    setSelectedFiles([]);
    setResultData(null);
    setErrorMsg(null);
  };

  // --- CORE LOGIC: COMPRESS (Backend Fetch) ---
  const handleCompress = async () => {
    if (selectedFiles.length === 0) return;

    setIsLoading(true);
    setErrorMsg(null);
    setResultData(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFiles[0]); // Ambil file pertama
      formData.append('level', compressionLevel);
      formData.append('level', compressionLevel); // 'extreme', 'recommended', 'low'

      const response = await fetch('http://localhost:5000/api/compress', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || result.details || 'Failed to compress PDF.'
        );
      }

      setResultData(result.data);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'An error occurred during compression.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Header */}
      <Navbar />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-8 font-medium transition-colors"
        >
          <svg
            className="w-5 h-5 mr-2"
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN: Upload & Result Area */}
          <div className="lg:col-span-2 order-2 lg:order-1 space-y-6">
            {/* 1. Upload Area (Jika belum ada hasil) */}
            {!resultData && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                {/* Drag Drop Zone */}
                {selectedFiles.length === 0 && uploadingFiles.length === 0 ? (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 ${
                      isDragging
                        ? 'border-blue-500 bg-blue-50 scale-[1.01]'
                        : 'border-blue-200 bg-blue-50/30 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex justify-center mb-6">
                      <div className="p-4 bg-white rounded-full shadow-sm">
                        <img
                          src="/asset/images/upload.svg" // Pastikan asset ini ada, atau ganti icon
                          alt="upload"
                          className="w-16 h-16 object-contain opacity-80"
                          onError={(e) =>
                            (e.currentTarget.style.display = 'none')
                          }
                        />
                        {/* Fallback icon jika image tidak ada */}
                        <CircleArrowUp className="w-12 h-12 text-blue-500" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      Drop your PDF here
                    </h3>
                    <p className="text-gray-500 mb-6">
                      Combine high quality with small file size.
                    </p>

                    <label className="inline-flex items-center px-8 py-3 bg-blue-600 text-white rounded-full cursor-pointer hover:bg-blue-700 transition shadow-md hover:shadow-lg transform active:scale-95">
                      <span className="font-semibold">Select PDF File</span>
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                ) : (
                  /* File List Area */
                  <div className="space-y-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-600" />
                        Selected File
                      </h3>
                      <button
                        onClick={clearFiles}
                        className="text-sm text-red-500 hover:text-red-700 font-medium"
                      >
                        Remove
                      </button>
                    </div>

                    {/* Progress Bar Items */}
                    {uploadingFiles.map((file) => (
                      <div
                        key={file.id}
                        className="bg-gray-50 p-4 rounded-lg border border-gray-200"
                      >
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">
                            {file.file.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            {file.progress}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${file.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}

                    {/* Completed File Item */}
                    {selectedFiles.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center p-4 bg-blue-50/50 rounded-lg border border-blue-100"
                      >
                        <div className="p-3 bg-white rounded-lg shadow-sm mr-4">
                          <FileText className="w-8 h-8 text-red-500" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 truncate">
                            {file.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                        <div className="text-green-600 bg-green-100 px-2 py-1 rounded text-xs font-bold">
                          READY
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Error Message */}
                {errorMsg && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700">
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {errorMsg}
                  </div>
                )}
              </div>
            )}

            {/* 2. RESULT AREA (SUCCESS) */}
            {resultData && (
              <div className="bg-white rounded-xl shadow-lg border border-green-200 overflow-hidden">
                <div className="bg-green-50 p-6 border-b border-green-100 flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Compression Complete!
                  </h2>
                  <p className="text-green-700 mt-1">
                    Your PDF is now smaller and ready to download.
                  </p>
                </div>

                <div className="p-8">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                    <div className="p-4 bg-gray-50 rounded-xl text-center border border-gray-100">
                      <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">
                        Original Size
                      </p>
                      <p className="text-lg font-mono font-medium text-gray-700">
                        {resultData.original_size}
                      </p>
                    </div>

                    <div className="flex flex-col items-center justify-center">
                      <div className="hidden sm:block border-t-2 border-gray-200 w-full mb-2 relative">
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-gray-400">
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      </div>
                      <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                        SAVED {resultData.saved_size}
                      </span>
                    </div>

                    <div className="p-4 bg-green-50 rounded-xl text-center border border-green-200 shadow-sm">
                      <p className="text-xs text-green-600 uppercase font-bold tracking-wider mb-1">
                        New Size
                      </p>
                      <p className="text-2xl font-mono font-bold text-green-700">
                        {resultData.compressed_size}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <a
                      href={resultData.download_url}
                      download
                      target="_blank"
                      className="flex-1 inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-green-600 hover:bg-green-700 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      <Download className="w-5 h-5 mr-2" />
                      Download Compressed PDF
                    </a>
                    <button
                      onClick={clearFiles}
                      className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition"
                    >
                      <RefreshCw className="w-5 h-5 mr-2" />
                      Compress Another
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Settings Sidebar */}
          <div className="order-1 lg:order-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-4 mb-6">
                <Settings className="w-5 h-5 text-gray-500" />
                <h3 className="font-bold text-gray-900">
                  Compression Settings
                </h3>
              </div>

              {/* Form Options */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Compression Level
                  </label>
                  <div className="relative">
                    <select
                      value={compressionLevel}
                      onChange={(e) => setCompressionLevel(e.target.value)}
                      disabled={isLoading || selectedFiles.length === 0}
                      className="block w-full pl-3 pr-10 py-2.5 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg border bg-gray-50"
                    >
                      <option value="extreme">
                        Extreme (Low Quality - 72dpi)
                      </option>
                      <option value="recommended">
                        Recommended (Good - 150dpi)
                      </option>
                      <option value="low">Low (High Quality - 300dpi)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Processing Mode
                  </label>
                  <select
                    value={algorithm}
                    onChange={(e) => setAlgorithm(e.target.value)}
                    disabled={isLoading || selectedFiles.length === 0}
                    className="block w-full pl-3 pr-10 py-2.5 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg border bg-gray-50"
                  >
                    <option value="vector">Standard (Text & Vector)</option>
                    <option value="photon">Image Heavy (Scanned Docs)</option>
                  </select>
                  <p className="mt-2 text-xs text-gray-500 leading-relaxed">
                    Use <strong>Standard</strong> for clear text. Use{' '}
                    <strong>Image Heavy</strong> if the PDF contains mostly
                    photos or scans.
                  </p>
                </div>

                {/* Submit Button */}
                {!resultData && (
                  <button
                    onClick={handleCompress}
                    disabled={isLoading || selectedFiles.length === 0}
                    className={`w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white transition-all duration-200
                      ${
                        isLoading || selectedFiles.length === 0
                          ? 'bg-gray-300 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700 hover:shadow-md transform hover:-translate-y-0.5'
                      }
                    `}
                  >
                    {isLoading ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                        Compressing...
                      </>
                    ) : (
                      'Compress PDF Now'
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <ToolsFooter />
    </div>
  );
}
