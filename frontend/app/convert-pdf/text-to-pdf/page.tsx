'use client';

import React, { useState, useRef, ChangeEvent, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/app/components/navbar';
import ToolsFooter from '../../components/footer/tools-footer';
import {
  Plus,
  Trash2,
  Settings,
  Type,
  FileText,
  ChevronDown,
  Check,
  UploadCloud,
} from 'lucide-react';

// Simulasi Daftar Bahasa
const LANGUAGES = [
  'English (Default)',
  'Indonesian',
  'Spanish',
  'French',
  'German',
  'Japanese',
  'Chinese',
  'Russian',
  'Arabic',
  'Hindi',
];

export default function TextToPdf() {
  // --- STATE MANAGEMENT ---
  const [mode, setMode] = useState<'upload' | 'text'>('upload');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [textContent, setTextContent] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [uploadingFiles, setUploadingFiles] = useState<
    { name: string; size: number; progress: number }[]
  >([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);

  // Settings State
  const [settings, setSettings] = useState({
    language: 'English (Default)',
    fontSize: 12,
    pageSize: 'A4',
    orientation: 'portrait',
    textColor: '#000000',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- HANDLERS ---

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      const txtFiles = newFiles.filter(
        (f) => f.type === 'text/plain' || f.name.endsWith('.txt')
      );

      if (txtFiles.length !== newFiles.length) {
        setErrorMsg('Some files were skipped. Only .txt files are supported.');
      } else {
        setErrorMsg(null);
      }

      setIsUploading(true);
      const uploadFiles = txtFiles.map((f) => ({
        name: f.name,
        size: f.size,
        progress: 0,
      }));
      setUploadingFiles(uploadFiles);

      // Simulasi Progress
      txtFiles.forEach((file, index) => {
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
            if (index === txtFiles.length - 1) {
              setTimeout(() => {
                setIsUploading(false);
                setSelectedFiles((prev) => [...prev, ...txtFiles]);
                setUploadingFiles([]);
              }, 200);
            }
          }
        }, 100);
      });
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const handleConvert = async () => {
    if (mode === 'upload' && selectedFiles.length === 0) {
      setErrorMsg('Please upload at least one .txt file.');
      return;
    }
    if (mode === 'text' && textContent.trim() === '') {
      setErrorMsg('Please enter some text to convert.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);

    // Simulasi Proses Konversi
    setTimeout(() => {
      setIsProcessing(false);
      const isSuccess = Math.random() > 0.05; // 95% success rate

      if (isSuccess) {
        setDownloadUrl('#');
        setShowSuccessModal(true);
      } else {
        setShowErrorModal(true);
      }
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/tools"
          className="inline-flex items-center text-indigo-600 hover:text-indigo-700 mb-8 font-medium"
        >
          <svg
            className="w-5 h-5 mr-1"
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
          {/* LEFT COLUMN: Input Area */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Tabs Mode */}
              <div className="flex border-b border-gray-100">
                <button
                  onClick={() => setMode('upload')}
                  className={`flex-1 py-4 text-sm font-semibold flex justify-center items-center gap-2 transition-colors ${mode === 'upload' ? 'bg-indigo-50 text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  <UploadCloud className="w-4 h-4" /> Upload Files
                </button>
                <button
                  onClick={() => setMode('text')}
                  className={`flex-1 py-4 text-sm font-semibold flex justify-center items-center gap-2 transition-colors ${mode === 'text' ? 'bg-indigo-50 text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  <Type className="w-4 h-4" /> Type Text
                </button>
              </div>

              <div className="p-6">
                {mode === 'upload' ? (
                  /* Upload UI */
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-indigo-200 rounded-xl p-12 text-center bg-indigo-50/30 hover:bg-indigo-50/50 transition-colors cursor-pointer group"
                  >
                    <div className="flex justify-center mb-4">
                      <div className="p-4 bg-white rounded-full shadow-sm group-hover:scale-110 transition-transform">
                        <FileText className="w-10 h-10 text-indigo-500" />
                      </div>
                    </div>
                    <p className="text-gray-700 text-lg font-medium mb-1">
                      Drag and drop .txt files here
                    </p>
                    <p className="text-gray-500 text-sm mb-6">
                      Max file size 10MB
                    </p>
                    <span className="px-6 py-2.5 bg-indigo-600 text-white rounded-full text-sm font-semibold shadow-md hover:bg-indigo-700 transition-colors">
                      Browse Files
                    </span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept=".txt"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                ) : (
                  /* Text Editor UI */
                  <textarea
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    placeholder="Start typing or paste your content here..."
                    className="w-full h-80 p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none text-gray-700"
                  />
                )}

                {errorMsg && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm flex items-center gap-2">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {errorMsg}
                  </div>
                )}

                {/* File List Progress */}
                {(isUploading || selectedFiles.length > 0) &&
                  mode === 'upload' && (
                    <div className="mt-8">
                      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
                        Selected Files
                      </h3>
                      <div className="space-y-3">
                        {/* Uploading Status */}
                        {uploadingFiles.map((file, i) => (
                          <div
                            key={i}
                            className="p-4 bg-gray-50 rounded-xl border border-gray-200"
                          >
                            <div className="flex justify-between mb-2 text-sm">
                              <span className="font-medium text-gray-700 truncate max-w-[200px]">
                                {file.name}
                              </span>
                              <span className="text-indigo-600 font-bold">
                                {file.progress}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                              <div
                                className="bg-indigo-600 h-full transition-all duration-300"
                                style={{ width: `${file.progress}%` }}
                              />
                            </div>
                          </div>
                        ))}
                        {/* Completed Files */}
                        {!isUploading &&
                          selectedFiles.map((file, i) => (
                            <div
                              key={i}
                              className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 shadow-sm"
                            >
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                  <FileText className="w-5 h-5" />
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-gray-800 truncate max-w-[150px]">
                                    {file.name}
                                  </p>
                                  <p className="text-xs text-gray-400">
                                    {(file.size / 1024).toFixed(1)} KB
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={() => removeFile(i)}
                                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Settings */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-24">
              <div className="flex items-center gap-2 mb-6 text-gray-800">
                <Settings className="w-5 h-5 text-indigo-600" />
                <h2 className="font-bold text-lg">PDF Settings</h2>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                    Language
                  </label>
                  <select
                    value={settings.language}
                    onChange={(e) =>
                      setSettings({ ...settings, language: e.target.value })
                    }
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    {LANGUAGES.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                      Font Size
                    </label>
                    <input
                      type="number"
                      value={settings.fontSize}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          fontSize: parseInt(e.target.value),
                        })
                      }
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                      Text Color
                    </label>
                    <div className="flex items-center p-1.5 bg-gray-50 border border-gray-200 rounded-xl">
                      <input
                        type="color"
                        value={settings.textColor}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            textColor: e.target.value,
                          })
                        }
                        className="w-full h-8 cursor-pointer rounded-lg overflow-hidden border-none"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                    Page Layout
                  </label>
                  <select
                    value={settings.pageSize}
                    onChange={(e) =>
                      setSettings({ ...settings, pageSize: e.target.value })
                    }
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none"
                  >
                    <option value="A4">A4 Standard</option>
                    <option value="Letter">Letter</option>
                    <option value="A5">A5 Small</option>
                  </select>
                </div>

                <button
                  onClick={handleConvert}
                  disabled={isProcessing}
                  className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Converting...
                    </>
                  ) : (
                    'Create PDF Now'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <ToolsFooter />

      {/* --- MODALS (Success/Error/Loading) --- */}
      {isProcessing && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
            <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Converting Text
            </h3>
            <p className="text-gray-500">
              Generating your professional PDF document...
            </p>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Ready to Download!
            </h3>
            <p className="text-gray-500 mb-8">
              Your text has been successfully converted to PDF format.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  alert('Downloading...');
                }}
                className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors"
              >
                Download PDF
              </button>
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  setSelectedFiles([]);
                  setTextContent('');
                }}
                className="w-full py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-colors"
              >
                Convert Another
              </button>
            </div>
          </div>
        </div>
      )}

      {showErrorModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
            <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl font-bold">!</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Conversion Failed
            </h3>
            <p className="text-gray-500 mb-8">
              Something went wrong. Please check your file or try again.
            </p>
            <button
              onClick={() => setShowErrorModal(false)}
              className="w-full py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
