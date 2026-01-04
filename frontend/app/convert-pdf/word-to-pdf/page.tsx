'use client';

import React, { useState, useRef, ChangeEvent } from 'react';
import Link from 'next/link';
import Navbar from '@/app/components/navbar';
import ToolsFooter from '../../components/footer/tools-footer';
import Image from 'next/image';

export default function WordToPdf() {
  // --- STATE MANAGEMENT ---
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [layout, setLayout] = useState('auto'); // Opsi tambahan yang relevan untuk Word
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [uploadingFiles, setUploadingFiles] = useState<
    { name: string; size: number; progress: number }[]
  >([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- HANDLERS ---

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);

      // VALIDASI: Filter khusus Word (.doc, .docx)
      const wordFiles = newFiles.filter(
        (f) =>
          f.type === 'application/msword' ||
          f.type ===
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
          f.name.toLowerCase().endsWith('.doc') ||
          f.name.toLowerCase().endsWith('.docx')
      );

      if (wordFiles.length !== newFiles.length) {
        setErrorMsg(
          'Some files were skipped because they are not Word documents.'
        );
      } else {
        setErrorMsg(null);
      }

      setIsUploading(true);

      const uploadFiles = wordFiles.map((f) => ({
        name: f.name,
        size: f.size,
        progress: 0,
      }));

      setUploadingFiles(uploadFiles);

      // Simulasi Upload Progress
      wordFiles.forEach((file, index) => {
        let progress = 0;
        const interval = setInterval(() => {
          progress += 10;
          setUploadingFiles((prev) => {
            const updated = [...prev];
            if (updated[index]) updated[index].progress = progress;
            return updated;
          });

          if (progress >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              if (index === wordFiles.length - 1) {
                setIsUploading(false);
                setSelectedFiles((prev) => [...prev, ...wordFiles]);
                setUploadingFiles([]);
              }
            }, 200);
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
      setErrorMsg('Please select at least 1 Word file to convert.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);

    // Simulasi proses konversi
    setTimeout(() => {
      setIsProcessing(false);
      const isSuccess = Math.random() > 0.1; // 90% success rate

      if (isSuccess) {
        setDownloadUrl('#download-url');
        setShowSuccessModal(true);
      } else {
        setShowErrorModal(true);
      }
    }, 2500);
  };

  const handleTryAgain = () => {
    setShowErrorModal(false);
    setErrorMsg(null);
  };

  const handleNext = () => {
    setShowSuccessModal(false);
    setDownloadUrl(null);
    setSelectedFiles([]);
  };

  const handleDownload = () => {
    alert('Downloading PDF...');
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
          {/* Left Column: Upload Area */}
          <div className="lg:col-span-2 order-1 lg:order-1">
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
                  Drag and drop your Word documents here.
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
                  Browse Files
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".doc, .docx, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document"
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
                  Supported formats: DOC, DOCX
                </div>
              </div>

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
                          {/* Word Icon Blue */}
                          <svg
                            className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500 flex-shrink-0"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
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

              {/* File List Grid */}
              {!isUploading && selectedFiles.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">
                    Documents to Convert ({selectedFiles.length})
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {selectedFiles.map((file, index) => (
                      <div
                        key={`file-${index}`}
                        className="relative group bg-gray-50 rounded-lg border border-gray-200 p-3 hover:border-blue-300 transition-colors"
                      >
                        <div className="aspect-square bg-blue-50 rounded mb-2 flex items-center justify-center overflow-hidden">
                          <svg
                            className="w-12 h-12 text-blue-400"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                          </svg>
                        </div>
                        <p className="text-xs text-gray-900 truncate font-medium mb-1">
                          {file.name}
                        </p>
                        <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => removeFile(index)}
                            className="p-1 bg-white rounded shadow-sm text-red-500 hover:text-red-700"
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
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Sidebar */}
          <div className="lg:col-span-1 order-1 lg:order-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                Word to PDF
              </h2>
              <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
                Easily convert your DOC and DOCX files to high-quality PDF
                documents.
              </p>

              {selectedFiles.length > 0 && !isUploading && (
                <div className="mb-4 sm:mb-6">
                  <label
                    htmlFor="layout"
                    className="block mb-2 text-sm font-medium text-gray-700"
                  >
                    Page Layout
                  </label>
                  <select
                    id="layout"
                    value={layout}
                    onChange={(e) => setLayout(e.target.value)}
                    className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="auto">Auto Detect</option>
                    <option value="portrait">Always Portrait</option>
                    <option value="landscape">Always Landscape</option>
                  </select>
                </div>
              )}

              <button
                type="button"
                onClick={handleConvert}
                disabled={
                  selectedFiles.length === 0 || isUploading || isProcessing
                }
                className="w-full py-2.5 sm:py-3 px-4 bg-blue-700 text-white rounded-3xl hover:bg-blue-800 disabled:bg-gray-300 transition-colors flex items-center justify-center font-medium text-sm sm:text-base"
              >
                {isProcessing ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                    Converting Word...
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
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-auto text-center animate-in fade-in zoom-in duration-300">
            <div className="flex justify-center">
              <Image
                src="/asset/images/success-modal.svg"
                alt="success"
                width={50}
                height={50}
              />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Success!</h2>
            <p className="text-gray-600 mb-6">
              Your Word document has been converted to PDF.
            </p>
            <button
              onClick={handleDownload}
              className="mx-auto bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-full flex items-center gap-2 transition-colors mb-4"
            >
              Download PDF
            </button>
            <button
              onClick={handleNext}
              className="text-gray-500 hover:text-gray-700 text-sm font-medium"
            >
              Convert Another Document
            </button>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center animate-in fade-in zoom-in duration-300">
            <div className="flex justify-center">
              <Image
                src="/asset/images/failed-modal.svg"
                alt="error"
                width={50}
                height={50}
              />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Failed!</h2>
            <p className="text-gray-600 mb-6">
              Unable to process the document. Please ensure it's not password
              protected.
            </p>
            <button
              onClick={handleTryAgain}
              className="mx-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-full transition-colors"
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
