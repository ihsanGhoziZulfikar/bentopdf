'use client';

import React, { useState, ChangeEvent, useEffect } from 'react';
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

interface UploadingFile {
  file: File;
  progress: number;
  id: string;
}

interface ApiError {
  message: string;
}

export default function DecryptPDF() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    return () => {
      if (downloadUrl) window.URL.revokeObjectURL(downloadUrl);
    };
  }, [downloadUrl]);

  const simulateUpload = (file: File) => {
    const fileId = `${file.name}-${Date.now()}`;
    const newUploadingFile: UploadingFile = { file, progress: 0, id: fileId };
    setUploadingFiles((prev) => [...prev, newUploadingFile]);

    const interval = setInterval(() => {
      setUploadingFiles((prev) => {
        const updated = prev.map((uf) => {
          if (uf.id === fileId)
            return { ...uf, progress: Math.min(uf.progress + 20, 100) };
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

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.type === 'application/pdf') simulateUpload(file);
      else setErrorMsg('Please select a valid PDF file.');
    }
    e.target.value = '';
  };

  const handleDecrypt = async (): Promise<void> => {
    if (selectedFiles.length === 0 || !password.trim()) {
      setErrorMsg('Please select a file and enter the password.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);
    setDownloadUrl(null);

    try {
      const formData = new FormData();
      formData.append('password', password.trim());
      formData.append('file', selectedFiles[0]);

      // PASTIKAN BACKEND SUDAH RUNNING DI PORT 5000
      const response = await fetch('http://localhost:5000/api/decrypt', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        let errorMessage = 'Failed to decrypt PDF.';
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = (await response.json()) as ApiError;
          errorMessage = errorData.message || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const blob: Blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      setDownloadUrl(url);

      const a = document.createElement('a');
      a.href = url;
      a.download = `unlocked_${selectedFiles[0].name}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err: unknown) {
      // Perbaikan: Menangani error tanpa 'any'
      if (err instanceof Error) {
        // Jika backend mati, fetch akan melempar error 'Failed to fetch'
        const message =
          err.message === 'Failed to fetch'
            ? 'Cannot connect to server. Please check if your Backend is running on port 5000.'
            : err.message;
        setErrorMsg(message);
      } else {
        setErrorMsg('An unexpected error occurred.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // --- SISA TAMPILAN (JSX) TETAP SAMA SEPERTI MILIK ANDA ---
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
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
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      if (e.dataTransfer.files[0])
                        simulateUpload(e.dataTransfer.files[0]);
                    }}
                    className={`relative flex flex-col items-center justify-center min-h-[320px] rounded-xl border-2 border-dashed transition-all duration-200 ${isDragging ? 'border-orange-500 bg-orange-50/50' : 'border-gray-300 bg-gray-50'}`}
                  >
                    <div className="mb-6 relative w-32 h-32 flex items-center justify-center">
                      {!imageError ? (
                        <img
                          src="/asset/images/unlock.svg"
                          alt="Unlock"
                          className="w-full h-full object-contain"
                          onError={() => setImageError(true)}
                        />
                      ) : (
                        <div className="w-24 h-24 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center">
                          <Unlock className="w-10 h-10" />
                        </div>
                      )}
                    </div>
                    <p className="text-xl font-medium text-gray-700 mb-2">
                      Drag & Drop Locked PDF here
                    </p>
                    <label className="px-8 py-3 bg-orange-600 text-white rounded-full cursor-pointer hover:bg-orange-700 transition-all shadow-lg">
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
                    {uploadingFiles.map((file) => (
                      <div
                        key={file.id}
                        className="bg-white border border-gray-100 shadow-sm rounded-xl p-4 flex items-center gap-4"
                      >
                        <FileText className="w-6 h-6 text-orange-500" />
                        <div className="flex-1">
                          <div className="flex justify-between text-xs mb-1">
                            <span>{file.file.name}</span>
                            <span className="font-bold">{file.progress}%</span>
                          </div>
                          <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-orange-500 transition-all"
                              style={{ width: `${file.progress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    {selectedFiles.map((file, idx) => (
                      <div
                        key={idx}
                        className="bg-white border border-orange-200 shadow-md rounded-xl p-5 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-4">
                          <Key className="w-6 h-6 text-orange-600" />
                          <div>
                            <p className="text-gray-900 font-medium">
                              {file.name}
                            </p>
                            <p className="text-xs text-gray-500">Locked</p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedFiles([]);
                            setDownloadUrl(null);
                          }}
                          className="p-2 text-gray-400 hover:text-red-500"
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
                    {errorMsg && (
                      <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <span>{errorMsg}</span>
                      </div>
                    )}
                    {downloadUrl && (
                      <div className="p-5 bg-green-50 border border-green-200 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-6 h-6 text-green-600" />
                          <div>
                            <h4 className="font-bold text-green-800">
                              PDF Unlocked!
                            </h4>
                            <p className="text-sm text-green-700">
                              Ready to download.
                            </p>
                          </div>
                        </div>
                        <a
                          href={downloadUrl}
                          download={`unlocked_${selectedFiles[0]?.name}`}
                          className="px-5 py-2 bg-green-600 text-white rounded-lg"
                        >
                          Download Now
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Unlock PDF
              </h2>
              <p className="text-gray-500 text-sm mb-6">
                Enter the password to remove restrictions.
              </p>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Enter PDF Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      className="w-full pl-3 pr-10 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-orange-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
              <button
                onClick={handleDecrypt}
                disabled={
                  selectedFiles.length === 0 || !password || isProcessing
                }
                className={`w-full py-3.5 rounded-xl font-semibold text-white flex items-center justify-center gap-2 ${isProcessing || !password ? 'bg-gray-300' : 'bg-orange-600 hover:bg-orange-700'}`}
              >
                {isProcessing ? 'Unlocking...' : 'Unlock PDF Now'}
              </button>
            </div>
          </div>
        </div>
      </main>
      <ToolsFooter />
    </div>
  );
}
