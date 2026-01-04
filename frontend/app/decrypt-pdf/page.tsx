'use client';

import React, { useState, ChangeEvent } from 'react';
import Link from 'next/link';
import Navbar from '../components/navbar';
import ToolsFooter from '../components/footer/tools-footer';
import {
  CircleArrowUp,
  FileText,
  Unlock,
  Key,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  ShieldAlert,
} from 'lucide-react';

// Tipe data untuk file
interface UploadingFile {
  file: File;
  progress: number;
  id: string;
}

export default function DecryptPDF() {
  // --- STATE ---
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // State khusus Decrypt
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // State Image Fallback
  const [imageError, setImageError] = useState(false);

  // --- LOGIC SIMULASI UPLOAD ---
  const simulateUpload = (file: File) => {
    const fileId = `${file.name}-${Date.now()}`;
    const newUploadingFile: UploadingFile = { file, progress: 0, id: fileId };

    setUploadingFiles((prev) => [...prev, newUploadingFile]);

    const interval = setInterval(() => {
      setUploadingFiles((prev) => {
        const updated = prev.map((uf) => {
          if (uf.id === fileId) {
            const newProgress = Math.min(uf.progress + 20, 100);
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
            setSelectedFiles([completedFile.file]);
            setUploadingFiles((current) =>
              current.filter((uf) => uf.id !== fileId)
            );
            setDownloadUrl(null);
            setErrorMsg(null);
          }, 400);
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
        setErrorMsg('Please select a valid PDF file.');
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
      if (file.type === 'application/pdf') simulateUpload(file);
    }
  };

  const removeFile = () => {
    setSelectedFiles([]);
    setDownloadUrl(null);
    setErrorMsg(null);
    setPassword('');
  };

  // --- BACKEND LOGIC ---
  const handleDecrypt = async () => {
    if (selectedFiles.length === 0 || !password) return;

    setIsProcessing(true);
    setErrorMsg(null);
    const fileToDecrypt = selectedFiles[0];

    try {
      const formData = new FormData();
      // Kirim password untuk membuka file
      formData.append('password', password);
      // Kirim file
      formData.append('file', fileToDecrypt);

      // Endpoint backend (Sesuaikan dengan backend Anda)
      const response = await fetch('http://localhost:5000/api/pdf/decrypt', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.indexOf('application/json') !== -1) {
          const errorData = await response.json();
          // Pesan error umum jika password salah
          throw new Error(
            errorData.message || 'Incorrect password or failed to unlock.'
          );
        } else {
          throw new Error('Server error occurred.');
        }
      }

      const blob = await response.blob();
      const pdfUrl = window.URL.createObjectURL(blob);
      setDownloadUrl(pdfUrl);

      // Auto download
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `unlocked_${fileToDecrypt.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error(error);
      setErrorMsg(
        error instanceof Error ? error.message : 'An unknown error occurred'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Breadcrumb */}
        <Link
          href="/"
          className="inline-flex items-center text-gray-500 hover:text-orange-600 mb-8 transition-colors text-sm font-medium"
        >
          <svg
            className="w-4 h-4 mr-1"
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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT COLUMN: Upload Area (8 cols) */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden h-full flex flex-col">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <h3 className="text-gray-700 font-semibold flex items-center gap-2">
                  <Unlock className="w-4 h-4 text-orange-500" />
                  Upload Locked PDF
                </h3>
              </div>

              <div className="p-6 flex-grow flex flex-col justify-center">
                {selectedFiles.length === 0 && uploadingFiles.length === 0 ? (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`
                      relative flex flex-col items-center justify-center 
                      min-h-[320px] rounded-xl border-2 border-dashed transition-all duration-200
                      ${
                        isDragging
                          ? 'border-orange-500 bg-orange-50/50 scale-[0.99]'
                          : 'border-gray-300 bg-gray-50 hover:bg-gray-100/50 hover:border-gray-400'
                      }
                    `}
                  >
                    {/* --- IMAGE FALLBACK LOGIC --- */}
                    <div className="mb-6 relative w-32 h-32 flex items-center justify-center">
                      {!imageError ? (
                        <img
                          src="/asset/images/unlock.svg" // Pastikan ada atau biarkan error agar fallback muncul
                          alt="Unlock Illustration"
                          className="w-full h-full object-contain drop-shadow-sm animate-in fade-in zoom-in duration-300"
                          onError={() => setImageError(true)}
                        />
                      ) : (
                        // Fallback Icon: Gembok Terbuka
                        <div className="w-24 h-24 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center ring-4 ring-orange-50/50">
                          <Unlock className="w-10 h-10" />
                        </div>
                      )}
                    </div>

                    <p className="text-xl font-medium text-gray-700 mb-2">
                      Drag & Drop Locked PDF here
                    </p>
                    <p className="text-gray-400 text-sm mb-6">
                      Remove password security permanently
                    </p>

                    <label className="relative overflow-hidden group inline-flex items-center px-8 py-3 bg-orange-600 text-white rounded-full cursor-pointer hover:bg-orange-700 transition-all shadow-lg shadow-orange-200">
                      <CircleArrowUp className="w-5 h-5 mr-2 group-hover:animate-bounce" />
                      <span className="font-semibold">Browse File</span>
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-4">
                    {/* Uploading Progress */}
                    {uploadingFiles.map((file) => (
                      <div
                        key={file.id}
                        className="bg-white border border-gray-100 shadow-sm rounded-xl p-4 flex items-center gap-4"
                      >
                        <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText className="w-6 h-6 text-orange-500" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between mb-1">
                            <span className="font-medium text-gray-700 text-sm truncate max-w-[200px]">
                              {file.file.name}
                            </span>
                            <span className="text-xs text-orange-600 font-bold">
                              {file.progress}%
                            </span>
                          </div>
                          <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-orange-500 transition-all duration-200 ease-out"
                              style={{ width: `${file.progress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* File Ready */}
                    {selectedFiles.map((file, idx) => (
                      <div
                        key={idx}
                        className="bg-white border border-orange-200 shadow-md shadow-orange-50 rounded-xl p-5 flex items-center justify-between animate-in fade-in"
                      >
                        <div className="flex items-center gap-4 overflow-hidden">
                          <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Key className="w-6 h-6" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-gray-900 font-medium truncate">
                              {file.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatFileSize(file.size)} • Locked
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={removeFile}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
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
                    ))}

                    {/* Error */}
                    {errorMsg && (
                      <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 flex items-start gap-3 text-sm animate-in slide-in-from-top-2">
                        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <span>{errorMsg}</span>
                      </div>
                    )}

                    {/* Success */}
                    {downloadUrl && (
                      <div className="p-5 bg-green-50 border border-green-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in zoom-in-95">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-100 rounded-full text-green-600">
                            <CheckCircle className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className="font-bold text-green-800">
                              PDF Unlocked!
                            </h4>
                            <p className="text-sm text-green-700">
                              Security has been removed successfully.
                            </p>
                          </div>
                        </div>
                        <a
                          href={downloadUrl}
                          download={`unlocked_${selectedFiles[0]?.name}`}
                          className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors whitespace-nowrap"
                        >
                          Download File
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Settings & Action (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Unlock PDF
              </h2>
              <p className="text-gray-500 text-sm mb-6">
                Remove password security and owner restrictions from your PDF
                file.
              </p>

              {/* Form Input Password */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Enter PDF Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter the correct password"
                      className="w-full pl-3 pr-10 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-2 flex items-start gap-1">
                    <ShieldAlert className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    We need the password to decrypt the file initially. It will
                    be removed in the download.
                  </p>
                </div>
              </div>

              <button
                onClick={handleDecrypt}
                disabled={
                  selectedFiles.length === 0 || !password || isProcessing
                }
                className={`
                    w-full py-3.5 px-6 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all shadow-md
                    ${
                      selectedFiles.length === 0 || !password || isProcessing
                        ? 'bg-gray-300 cursor-not-allowed text-gray-500 shadow-none'
                        : 'bg-orange-600 hover:bg-orange-700 hover:-translate-y-0.5 hover:shadow-lg'
                    }
                `}
              >
                {isProcessing ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5 text-white"
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
                    Unlocking...
                  </span>
                ) : (
                  <>
                    Unlock PDF Now <Unlock className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Features Section */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                  Why Unlock?
                </h4>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                    Remove printing restrictions
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                    Enable copy & edit text
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                    Create a password-free copy
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>

      <ToolsFooter />
    </div>
  );
}
