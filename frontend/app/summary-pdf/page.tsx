'use client';

import React, { useState, ChangeEvent } from 'react';
import Link from 'next/link';
import Navbar from '../components/navbar';

export default function SummaryPDF() {
  // ================= STATE =================
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [summaryResult, setSummaryResult] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // ================= HANDLERS =================
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setSummaryResult(null);
      setErrorMsg(null);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setSummaryResult(null);
    setErrorMsg(null);
  };

  const handleSummarize = async () => {
    if (!selectedFile) {
      setErrorMsg('Please select a PDF file.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('http://localhost:5000/api/summarize', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to summarize PDF');
      }

      const data = await response.json();
      setSummaryResult(data.summary);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setErrorMsg(err.message || 'Server error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = () => {
    if (!summaryResult) return;
    navigator.clipboard.writeText(summaryResult);
    alert('Summary copied to clipboard!');
  };

  const handleDownload = () => {
    if (!summaryResult || !selectedFile) return;

    const blob = new Blob([summaryResult], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `summary-${selectedFile.name.replace('.pdf', '')}.txt`;
    link.click();
  };

  // ================= RENDER =================
  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <Navbar />

      {/* MAIN */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <Link
          href="/"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6"
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* UPLOAD AREA */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {!selectedFile ? (
                <div className="border-2 border-dashed border-blue-300 rounded-lg p-12 text-center bg-blue-50/30">
                  <div className="flex justify-center mb-6">
                    <img
                      src="/asset/images/upload.svg"
                      alt="upload"
                      className="w-32 h-32 object-contain"
                    />
                  </div>

                  <p className="text-gray-700 text-lg font-medium mb-2">
                    Drag and drop your PDF here
                  </p>
                  <p className="text-gray-500 mb-6">or</p>

                  <label className="inline-flex items-center px-6 py-3 bg-blue-50 text-blue-600 rounded-full cursor-pointer hover:bg-blue-100 border border-blue-200">
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
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    Browse PDF
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>

                  <div className="mt-6 text-sm text-blue-600">
                    Supported format: PDF (Max 50MB)
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Selected File</h3>

                  {errorMsg && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700">
                      {errorMsg}
                    </div>
                  )}

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded border">
                    <div className="flex items-center gap-3">
                      <svg
                        className="w-8 h-8 text-red-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <div>
                        <p className="font-medium">{selectedFile.name}</p>
                        <p className="text-sm text-gray-500">
                          {(selectedFile.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={removeFile}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>

                  {summaryResult && (
                    <div className="mt-6">
                      <h4 className="font-bold mb-2">Summary Result</h4>
                      <textarea
                        readOnly
                        value={summaryResult}
                        className="w-full h-64 p-3 border rounded resize-none"
                      />

                      <div className="flex gap-3 mt-3">
                        <button
                          onClick={handleCopy}
                          className="px-4 py-2 bg-blue-600 text-white rounded"
                        >
                          Copy
                        </button>
                        <button
                          onClick={handleDownload}
                          className="px-4 py-2 bg-green-600 text-white rounded"
                        >
                          Download TXT
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* INFO PANEL */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-2xl font-bold mb-2">Summary PDF</h2>
              <p className="text-gray-600 mb-6">
                Generate a concise summary to quickly understand your PDF
                document.
              </p>

              <button
                onClick={handleSummarize}
                disabled={!selectedFile || isProcessing}
                className="w-full py-3 px-6 bg-gray-900 text-white rounded-3xl disabled:bg-gray-300"
              >
                {isProcessing ? 'Summarizing...' : 'Get Summary'}
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src="/asset/images/logo-bento.svg"
              alt="logo"
              className="w-28"
            />
            <span className="text-gray-500 text-sm">
              © 2025 PT. Padepokan Tujuh Sembilan
            </span>
          </div>

          <div className="flex gap-6 text-sm font-semibold text-blue-600">
            <Link href="#">How it works</Link>
            <Link href="#">Help Center</Link>
            <Link href="#">Contact Us</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
