'use client';

import React, { useState, useRef, ChangeEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/app/components/navbar';
import ToolsFooter from '@/app/components/footer/tools-footer';

// --- LIBRARY IMPORTS ---
import * as pdfjsLib from 'pdfjs-dist';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';

// Setup Worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

export default function PdfToJson() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).filter(
        (file) => file.type === 'application/pdf'
      );

      if (newFiles.length === 0) {
        setErrorMsg('Please select valid PDF files.');
        return;
      }

      setErrorMsg(null);
      setIsUploading(true);
      setUploadProgress(0);

      // Simulasi progress bar
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setUploadProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsUploading(false);
            setSelectedFiles((prev) => [...prev, ...newFiles]);
            setUploadProgress(0);
          }, 200);
        }
      }, 100);

      setDownloadUrl(null);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    if (selectedFiles.length <= 1) setDownloadUrl(null);
  };

  const handleConvert = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (selectedFiles.length === 0) return;

    setIsProcessing(true);
    setErrorMsg(null);
    const zip = new JSZip();

    try {
      for (const file of selectedFiles) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const pdfData: any = {
          metadata: { fileName: file.name, totalPages: pdf.numPages },
          pages: [],
        };

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const items = textContent.items.map((item: any) => ({
            text: item.str,
            transform: item.transform,
            width: item.width,
            height: item.height,
          }));

          pdfData.pages.push({ pageNumber: i, content: items });
        }

        const jsonString = JSON.stringify(pdfData, null, 2);
        zip.file(`${file.name.replace('.pdf', '')}.json`, jsonString);
      }

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);

      setDownloadUrl(url);
      setIsProcessing(false);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('JSON Conversion Error:', error);
      setIsProcessing(false);
      setShowErrorModal(true);
    }
  };

  const handleDownload = () => {
    if (downloadUrl) {
      saveAs(downloadUrl, `BentoPDF_JSON_Export.zip`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
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
          <div className="lg:col-span-2 order-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 sm:p-12 text-center bg-blue-50/30">
                <div className="flex justify-center mb-4">
                  <div className="relative w-24 h-24 sm:w-32 sm:h-32">
                    <img
                      src="/asset/images/upload.svg"
                      alt="upload"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
                <p className="text-gray-700 text-base sm:text-lg font-medium mb-2">
                  Extract text and structure to JSON format.
                </p>
                <label className="inline-flex items-center px-6 py-3 bg-blue-50 text-blue-600 rounded-full cursor-pointer hover:bg-blue-100 transition-colors border border-blue-200 mt-4 font-semibold">
                  Browse PDF Files
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>

              {isUploading && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {selectedFiles.length > 0 && (
                <div className="mt-4 space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {selectedFiles.map((file, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex justify-between items-center animate-in fade-in"
                    >
                      <div className="flex items-center space-x-3 truncate">
                        <svg
                          className="w-6 h-6 text-red-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                        </svg>
                        <span className="text-sm font-medium truncate">
                          {file.name}
                        </span>
                      </div>
                      <button
                        onClick={() => removeFile(idx)}
                        className="text-red-500 hover:bg-red-50 p-1 rounded"
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
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1 order-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-2">Convert to Data</h2>
              <p className="text-gray-600 mb-6 text-sm">
                Perfect for developers. This tool extracts text, coordinates,
                and metadata into a structured JSON file.
              </p>

              <button
                onClick={handleConvert}
                disabled={
                  selectedFiles.length === 0 || isProcessing || isUploading
                }
                className="w-full py-3 px-4 bg-gray-900 text-white rounded-3xl hover:bg-gray-800 disabled:bg-gray-300 transition-all font-semibold flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>{' '}
                    Extracting...
                  </>
                ) : (
                  <>
                    Convert to JSON{' '}
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
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
          <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-2xl animate-in fade-in zoom-in duration-300">
            <Image
              src="/asset/images/success-modal.svg"
              alt="success"
              width={60}
              height={60}
              className="mx-auto mb-4"
            />
            <h2 className="text-2xl font-bold mb-2">Extraction Complete!</h2>
            <p className="text-gray-600 mb-6 text-sm">
              JSON data has been successfully generated for all files.
            </p>
            <button
              onClick={handleDownload}
              className="text-blue-600 font-semibold hover:underline mb-6 block w-full text-sm"
            >
              Download ZIP manually
            </button>
            <button
              onClick={() => {
                setShowSuccessModal(false);
                setSelectedFiles([]);
              }}
              className="w-full bg-blue-600 text-white font-semibold py-3 rounded-full hover:bg-blue-700 transition-colors"
            >
              Finish
            </button>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-2xl animate-in fade-in zoom-in duration-300">
            <Image
              src="/asset/images/failed-modal.svg"
              alt="failed"
              width={60}
              height={60}
              className="mx-auto mb-4"
            />
            <h2 className="text-2xl font-bold mb-2">Oops! Failed</h2>
            <p className="text-gray-600 mb-6">
              We couldn't parse the PDF text content. Please ensure the file
              isn't corrupted or encrypted.
            </p>
            <button
              onClick={() => setShowErrorModal(false)}
              className="w-full bg-blue-600 text-white font-semibold py-3 rounded-full hover:bg-blue-700"
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
