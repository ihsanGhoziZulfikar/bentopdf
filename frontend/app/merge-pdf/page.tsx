'use client';

import React, { useState, ChangeEvent } from 'react';
import Link from 'next/link';
import Navbar from '../components/navbar';
import ToolsFooter from '../components/footer/tools-footer';
import { CircleArrowUp, X, FileText } from 'lucide-react';

interface UploadingFile {
  file: File;
  progress: number;
  id: string;
}

export default function MergePDF() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // --- STATE ---
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [isMerging, setIsMerging] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Simulasi upload dengan progress
  const simulateUpload = (file: File) => {
    const fileId = `${file.name}-${Date.now()}`;
    const newUploadingFile: UploadingFile = {
      file,
      progress: 0,
      id: fileId
    };

    setUploadingFiles(prev => [...prev, newUploadingFile]);

    const interval = setInterval(() => {
      setUploadingFiles(prev => {
        const updated = prev.map(uf => {
          if (uf.id === fileId) {
            const newProgress = Math.min(uf.progress + 10, 100);
            return { ...uf, progress: newProgress };
          }
          return uf;
        });

        // Check if this file is complete
        const completedFile = updated.find(uf => uf.id === fileId && uf.progress === 100);
        if (completedFile) {
          clearInterval(interval);
          // Move to selectedFiles after a brief delay
          setTimeout(() => {
            setSelectedFiles(current => [...current, completedFile.file]);
            setUploadingFiles(current => current.filter(uf => uf.id !== fileId));
          }, 300);
        }

        return updated;
      });
    }, 100);
  };

  // 1. Fungsi saat user memilih file
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      filesArray.forEach(file => {
        if (file.type === 'application/pdf' && file.size <= 50 * 1024 * 1024) {
          simulateUpload(file);
        }
      });
      setDownloadUrl(null);
      setErrorMsg(null);
    }
    // Reset input
    e.target.value = '';
  };

  // Handle drag and drop
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
      const filesArray = Array.from(e.dataTransfer.files);
      filesArray.forEach(file => {
        if (file.type === 'application/pdf' && file.size <= 50 * 1024 * 1024) {
          simulateUpload(file);
        }
      });
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

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
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
              {selectedFiles.length === 0 && uploadingFiles.length === 0 ? (
                <div 
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-lg p-6 sm:p-12 text-center transition-colors ${
                    isDragging 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-blue-300 bg-blue-50/30'
                  }`}
                >
                  <div className="flex justify-center mb-4 sm:mb-6">
                    <div className="relative w-24 h-24 sm:w-32 sm:h-32">
                      <img src="/asset/images/upload.svg" alt="upload" className="w-full h-full object-contain" />
                    </div>
                  </div>
                  <p className="text-gray-700 text-base sm:text-lg font-medium mb-2 px-2">
                    Drag and drop your files here to start.
                  </p>
                  <p className="text-gray-500 mb-4 sm:mb-6 text-sm sm:text-base">or</p>
                  <label className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-blue-100 text-blue-600 rounded-full cursor-pointer hover:bg-blue-200 transition-colors text-sm sm:text-base">
                    <CircleArrowUp className='w-4 h-4 mx-2'/>
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

                  {/* Uploading Files with Progress */}
                  {uploadingFiles.map((uploadingFile) => (
                    <div
                      key={uploadingFile.id}
                      className="flex items-start p-3 sm:p-4 bg-white rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                        <div className="w-10 h-10 bg-blue-100 rounded flex items-center justify-center flex-shrink-0">
                          <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-900 truncate font-medium text-sm sm:text-base">
                            {uploadingFile.file.name}
                          </p>
                          <p className="text-gray-500 text-xs sm:text-sm">
                            {formatFileSize(uploadingFile.file.size)}
                          </p>
                          <div className="mt-2">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${uploadingFile.progress}%` }}
                              />
                            </div>
                            <div className="text-right text-xs text-gray-500 mt-1">
                              {uploadingFile.progress}%
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Completed Files */}
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
                          <p className="text-gray-500 text-xs sm:text-sm">{formatFileSize(file.size)}</p>
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
      <ToolsFooter />
    </div>
  );
}