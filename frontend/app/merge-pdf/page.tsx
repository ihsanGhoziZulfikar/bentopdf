'use client';

import React, { useState, ChangeEvent } from 'react';
import Link from 'next/link';
import Navbar from '../components/navbar';

export default function MergePDF() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // --- STATE ---
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isMerging, setIsMerging] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 1. Fungsi saat user memilih file
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles(filesArray);
      setDownloadUrl(null);
      setErrorMsg(null);
    }
  };

  // 2. Fungsi Utama: Kirim ke Backend Express
  const handleMerge = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (selectedFiles.length < 2) {
      setErrorMsg('Please select at least 2 PDF files to merge.');
      return;
    }

    setIsMerging(true);
    setErrorMsg(null);

    try {
      const formData = new FormData();
      selectedFiles.forEach((file) => {
        formData.append('files', file);
      });

      const response = await fetch('http://localhost:5000/api/merge', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = (await response.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(errorData.error || 'Merge process failed on server.');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = 'bento-merged.pdf';
      document.body.appendChild(a);
      a.click();

      a.remove();
      window.URL.revokeObjectURL(url);

      setDownloadUrl(url);
    } catch (error) {
      console.error('Frontend Error:', error);

      let message = 'Failed to connect to server or merge files.';
      if (error instanceof Error) {
        message = error.message;
      }

      setErrorMsg(message);
    } finally {
      setIsMerging(false);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const moveFile = (index: number, direction: 'up' | 'down') => {
    const newFiles = [...selectedFiles];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex >= 0 && newIndex < selectedFiles.length) {
      [newFiles[index], newFiles[newIndex]] = [newFiles[newIndex], newFiles[index]];
      setSelectedFiles(newFiles);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Navbar />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4 sm:mb-8 text-sm sm:text-base">
          <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Tools
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Upload Area */}
          <div className="lg:col-span-2 order-1 lg:order-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              {selectedFiles.length === 0 ? (
                <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 sm:p-12 text-center bg-blue-50/30">
                  <div className="flex justify-center mb-4 sm:mb-6">
                    <div className="relative w-24 h-24 sm:w-32 sm:h-32">
                      <img src="/asset/images/upload.svg" alt="upload" className="w-full h-full object-contain" />
                    </div>
                  </div>
                  <p className="text-gray-700 text-base sm:text-lg font-medium mb-2 px-2">
                    Drag and drop your files here to start.
                  </p>
                  <p className="text-gray-500 mb-4 sm:mb-6 text-sm sm:text-base">or</p>
                  <label className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-blue-50 text-blue-600 rounded-full cursor-pointer hover:bg-blue-100 transition-colors border border-blue-200 text-sm sm:text-base">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Browse
                    <input
                      type="file"
                      multiple
                      accept="application/pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  <div className="mt-4 sm:mt-6 flex items-center justify-center text-xs sm:text-sm text-blue-600 px-2">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    Supported formats: PDF (Max. 50 MB)
                  </div>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
                    Files to Merge ({selectedFiles.length})
                  </h3>
                  
                  {errorMsg && (
                    <div className="p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs sm:text-sm">
                      {errorMsg}
                    </div>
                  )}

                  {downloadUrl && (
                    <div className="p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-green-800 font-semibold mb-3 flex items-center text-sm sm:text-base">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Merge Successful!
                      </p>
                      <a
                        href={downloadUrl}
                        download="bento-merged.pdf"
                        className="inline-block px-4 sm:px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors text-sm sm:text-base"
                      >
                        Download Merged PDF
                      </a>
                      <button
                        onClick={() => {
                          setDownloadUrl(null);
                          setSelectedFiles([]);
                        }}
                        className="ml-2 sm:ml-3 text-xs sm:text-sm text-gray-600 hover:text-gray-900 underline"
                      >
                        Merge Another File
                      </button>
                    </div>
                  )}

                  {selectedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                    >
                      <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                        <svg className="w-6 h-6 sm:w-8 sm:h-8 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                        </svg>
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-900 truncate font-medium text-sm sm:text-base">{file.name}</p>
                          <p className="text-gray-500 text-xs sm:text-sm">{(file.size / 1024).toFixed(1)} KB</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 sm:space-x-2 ml-2 sm:ml-4">
                        <button
                          onClick={() => moveFile(index, 'up')}
                          disabled={index === 0}
                          className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Move up"
                        >
                          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                          </svg>
                        </button>
                        <button
                          onClick={() => moveFile(index, 'down')}
                          disabled={index === selectedFiles.length - 1}
                          className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Move down"
                        >
                          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        <button
                          onClick={() => removeFile(index)}
                          className="p-1.5 sm:p-2 text-red-500 hover:text-red-700"
                          title="Remove file"
                        >
                          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}

                  <label className="flex items-center justify-center w-full p-3 sm:p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50/30 transition-colors">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="text-gray-600 font-medium text-sm sm:text-base">Add more files</span>
                    <input
                      type="file"
                      multiple
                      accept="application/pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Info Panel */}
          <div className="lg:col-span-1 order-1 lg:order-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                Merge PDF
              </h2>
              <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
                Combine multiple PDF files into a single, well-organized document.
              </p>
              <button
                type="button"
                onClick={handleMerge}
                disabled={selectedFiles.length < 2 || isMerging}
                className="w-full py-2.5 sm:py-3 px-4 sm:px-6 bg-gray-900 text-white rounded-3xl hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center font-medium text-sm sm:text-base"
              >
                {isMerging ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Merging...
                  </>
                ) : (
                  <>
                    Merge
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

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-8 sm:mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-center sm:text-left">
              <img src="/asset/images/logo-bento.svg" alt="logo" className='w-24 sm:w-30' />
              <span className="text-gray-500 text-xs sm:text-sm">
                © 2025 PT. Padepokan Tujuh Sembilan | All rights reserved.
              </span>
            </div>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
              <Link href="#" className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-semibold">
                How it works
              </Link>
              <Link href="#" className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-semibold">
                Help Center
              </Link>
              <Link href="#" className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-semibold">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}