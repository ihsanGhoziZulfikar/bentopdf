'use client';

import React, { useState, ChangeEvent } from 'react';
import Link from 'next/link';
import Navbar from '../components/navbar';
import ToolsFooter from '../components/footer/tools-footer';
import {
  CircleArrowUp,
  FileText,
  Lock,
  ShieldCheck,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
} from 'lucide-react';

// Tipe data untuk file
interface UploadingFile {
  file: File;
  progress: number;
  id: string;
}

export default function EncryptPDF() {
  // --- STATE ---
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // State Password
  const [userPassword, setUserPassword] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('');
  const [showUserPass, setShowUserPass] = useState(false);
  const [showOwnerPass, setShowOwnerPass] = useState(false);

  // State PENTING: Untuk menangani gambar error
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
    setUserPassword('');
    setOwnerPassword('');
  };

  // --- BACKEND REQUEST ---
  const handleEncrypt = async () => {
    if (isProcessing) return;
    if (selectedFiles.length === 0 || !userPassword) return;

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFiles[0]);
      formData.append('userPassword', userPassword);
      if (ownerPassword) formData.append('ownerPassword', ownerPassword);

      const response = await fetch('http://localhost:5000/api/pdf/encrypt', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || 'Encrypt failed');
      }

      // ✅ TUNGGU FILE 100% SELESAI
      const buffer = await response.arrayBuffer();
      const blob = new Blob([buffer], { type: 'application/pdf' });

      const url = window.URL.createObjectURL(blob);
      setDownloadUrl(url);

      const a = document.createElement('a');
      a.href = url;
      a.download = `protected_${selectedFiles[0].name}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error(err);
      setErrorMsg(err instanceof Error ? err.message : 'Encrypt failed');
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
          className="inline-flex items-center text-gray-500 hover:text-indigo-600 mb-8 transition-colors text-sm font-medium"
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
                  <ShieldCheck className="w-4 h-4 text-indigo-500" />
                  Upload PDF to Encrypt
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
                          ? 'border-indigo-500 bg-indigo-50/50 scale-[0.99]'
                          : 'border-gray-300 bg-gray-50 hover:bg-gray-100/50 hover:border-gray-400'
                      }
                    `}
                  >
                    {/* --- LOGIKA GAMBAR ANTI-ERROR --- */}
                    <div className="mb-6 relative w-32 h-32 flex items-center justify-center">
                      {!imageError ? (
                        <img
                          src="/asset/images/security.svg" // Ganti path ini jika ada gambar lain
                          alt="Security Illustration"
                          className="w-full h-full object-contain drop-shadow-sm animate-in fade-in zoom-in duration-300"
                          onError={() => setImageError(true)} // Jika error, trigger state
                        />
                      ) : (
                        // TAMPILKAN INI JIKA GAMBAR ERROR / HILANG
                        <div className="w-24 h-24 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center ring-4 ring-indigo-50/50">
                          <Lock className="w-10 h-10" />
                        </div>
                      )}
                    </div>
                    {/* -------------------------------- */}

                    <p className="text-xl font-medium text-gray-700 mb-2">
                      Drag & Drop PDF here
                    </p>
                    <p className="text-gray-400 text-sm mb-6">
                      Protect your file with a password
                    </p>

                    <label className="relative overflow-hidden group inline-flex items-center px-8 py-3 bg-indigo-600 text-white rounded-full cursor-pointer hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
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
                        <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText className="w-6 h-6 text-indigo-500" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between mb-1">
                            <span className="font-medium text-gray-700 text-sm truncate max-w-[200px]">
                              {file.file.name}
                            </span>
                            <span className="text-xs text-indigo-600 font-bold">
                              {file.progress}%
                            </span>
                          </div>
                          <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-indigo-500 transition-all duration-200 ease-out"
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
                        className="bg-white border border-indigo-200 shadow-md shadow-indigo-50 rounded-xl p-5 flex items-center justify-between animate-in fade-in"
                      >
                        <div className="flex items-center gap-4 overflow-hidden">
                          <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Lock className="w-6 h-6" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-gray-900 font-medium truncate">
                              {file.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatFileSize(file.size)} • Ready to encrypt
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
                      <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 flex items-start gap-3 text-sm">
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
                              File Encrypted!
                            </h4>
                            <p className="text-sm text-green-700">
                              Your PDF is now password protected.
                            </p>
                          </div>
                        </div>
                        <a
                          href={downloadUrl}
                          download={`protected_${selectedFiles[0]?.name}`}
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
                Encrypt PDF
              </h2>
              <p className="text-gray-500 text-sm mb-6">
                Set a password to protect your PDF file from unauthorized
                access.
              </p>

              {/* Form Input Password */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    User Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showUserPass ? 'text' : 'password'}
                      value={userPassword}
                      onChange={(e) => setUserPassword(e.target.value)}
                      placeholder="Required to open PDF"
                      className="w-full pl-3 pr-10 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowUserPass(!showUserPass)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showUserPass ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Owner Password{' '}
                    <span className="text-gray-400 font-normal">
                      (Optional)
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type={showOwnerPass ? 'text' : 'password'}
                      value={ownerPassword}
                      onChange={(e) => setOwnerPassword(e.target.value)}
                      placeholder="Permissions password"
                      className="w-full pl-3 pr-10 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOwnerPass(!showOwnerPass)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showOwnerPass ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Prevents printing or editing.
                  </p>
                </div>
              </div>

              <button
                onClick={handleEncrypt}
                disabled={
                  selectedFiles.length === 0 || !userPassword || isProcessing
                }
                className={`
                    w-full py-3.5 px-6 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all shadow-md
                    ${
                      selectedFiles.length === 0 ||
                      !userPassword ||
                      isProcessing
                        ? 'bg-gray-300 cursor-not-allowed text-gray-500 shadow-none'
                        : 'bg-indigo-600 hover:bg-indigo-700 hover:-translate-y-0.5 hover:shadow-lg'
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
                    Encrypting...
                  </span>
                ) : (
                  <>
                    Encrypt PDF Now <Lock className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Tips Section */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                  Security Features
                </h4>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    256-bit AES Encryption
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    File is processed securely
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
