'use client';

import React, { useState, useRef, ChangeEvent } from 'react';
import Link from 'next/link';
import Navbar from '../../components/navbar'; // Pastikan path sesuai struktur folder Anda
import ToolsFooter from '../../components/footer/main-footer'; // Sesuaikan jika menggunakan ToolsFooter
import { FileText, Download, Loader2, ArrowLeft, UploadCloud, CheckCircle, XCircle, Trash2, FileType } from 'lucide-react';

import * as pdfjsLib from 'pdfjs-dist';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';

// Konfigurasi Worker PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

export default function PdfToWordPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- LOGIC UTAMA (TIDAK DIHAPUS) ---
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
        setErrorMsg(null);
      } else {
        setErrorMsg('Please upload a valid PDF file.');
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'application/pdf') {
        setFile(droppedFile);
        setErrorMsg(null);
      } else {
        setErrorMsg('Please upload a valid PDF file.');
      }
    }
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const convertToWord = async () => {
    if (!file) return;
    setLoading(true);
    setErrorMsg(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const docSections = [];

      // Ekstraksi teks dari setiap halaman
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        
        // Mengelompokkan teks sederhana
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');

        docSections.push({
          properties: {},
          children: [
            new Paragraph({
              children: [new TextRun({ text: pageText, size: 24 })],
            }),
          ],
        });
      }

      // Generate file Word
      const doc = new Document({ sections: docSections });
      const blob = await Packer.toBlob(doc);
      
      // Trigger download
      saveAs(blob, `${file.name.replace('.pdf', '')}.docx`);
      
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Conversion failed", error);
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };
  // --- END LOGIC ---

  const handleNext = () => {
    setShowSuccessModal(false);
    setFile(null);
  };

  const handleTryAgain = () => {
    setShowErrorModal(false);
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Back Button */}
        <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4 sm:mb-8 text-sm sm:text-base transition-colors">
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-1" />
          Back to Tools
        </Link>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          
          {/* LEFT COLUMN: Upload Area */}
          <div className="lg:col-span-2 order-1 lg:order-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              
              {/* Drop Zone */}
              <div 
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-6 sm:p-12 text-center transition-colors ${
                  file ? 'border-green-300 bg-green-50/30' : 'border-blue-300 bg-blue-50/30'
                }`}
              >
                <div className="flex justify-center mb-4 sm:mb-6">
                  <div className="relative w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center bg-white rounded-full shadow-sm">
                    {file ? (
                       <FileText className="w-12 h-12 sm:w-16 sm:h-16 text-green-500" />
                    ) : (
                       <UploadCloud className="w-12 h-12 sm:w-16 sm:h-16 text-blue-500" />
                    )}
                  </div>
                </div>
                
                <p className="text-gray-700 text-base sm:text-lg font-medium mb-2 px-2">
                  {file ? "File ready to convert" : "Drag and drop your PDF file here"}
                </p>
                
                {!file && (
                  <>
                    <p className="text-gray-500 mb-4 sm:mb-6 text-sm sm:text-base">or</p>
                    <label className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-blue-50 text-blue-600 rounded-full cursor-pointer hover:bg-blue-100 transition-colors border border-blue-200 text-sm sm:text-base font-medium">
                      <UploadCloud className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      Browse File
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  </>
                )}
                
                <div className="mt-4 sm:mt-6 flex items-center justify-center text-xs sm:text-sm text-blue-600 px-2">
                  <FileType className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                  Supported format: PDF (Max. 10 MB)
                </div>
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div className="mt-4 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs sm:text-sm flex items-center">
                  <XCircle className="w-4 h-4 mr-2" /> {errorMsg}
                </div>
              )}

              {/* Selected File Card */}
              {file && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                      Selected File
                    </h3>
                  </div>
                  
                  <div className="relative group bg-gray-50 rounded-lg border border-gray-200 p-4 hover:border-blue-300 transition-all flex items-center justify-between">
                    <div className="flex items-center gap-4 overflow-hidden">
                      <div className="w-12 h-12 bg-white rounded-lg border border-gray-200 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-6 h-6 text-red-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                        <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>

                    <button
                      onClick={removeFile}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-white rounded-full transition-all"
                      title="Remove file"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Info Panel & Action */}
          <div className="lg:col-span-1 order-1 lg:order-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 sticky top-24">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                PDF to Word
              </h2>
              <p className="text-gray-600 mb-6 text-sm sm:text-base leading-relaxed">
                Convert your PDF documents into editable Word (.docx) files instantly. Preserves text and basic layout.
              </p>

              <button
                type="button"
                onClick={convertToWord}
                disabled={!file || loading}
                className={`w-full py-3 px-6 rounded-full flex items-center justify-center font-semibold text-sm sm:text-base transition-all shadow-md hover:shadow-lg ${
                  !file || loading
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-5 w-5" />
                    Converting...
                  </>
                ) : (
                  <>
                    Convert to Word
                    <Download className="w-5 h-5 ml-2" />
                  </>
                )}
              </button>
              
              {!file && (
                <p className="text-xs text-center text-gray-400 mt-3">
                  Please select a file to enable conversion
                </p>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full text-center animate-in fade-in zoom-in duration-300">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                 <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-3">Success!</h2>
            <p className="text-gray-600 mb-8">
              Your file has been converted and downloaded successfully.
            </p>

            <button
              onClick={handleNext}
              className="mx-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-full transition-colors flex items-center justify-center gap-2"
            >
              Convert Another File
              <ArrowLeft className="w-5 h-5 rotate-180" />
            </button>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center animate-in fade-in zoom-in duration-300">
            <div className="flex justify-center mb-6">
               <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                 <XCircle className="w-10 h-10 text-red-600" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-3">Conversion Failed</h2>
            <p className="text-gray-600 mb-8">
              Unable to convert the file. Please ensure the PDF is not password protected and try again.
            </p>

            <button
              onClick={handleTryAgain}
              className="mx-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-full transition-colors flex items-center justify-center gap-2"
            >
              Try Again
              <ArrowLeft className="w-5 h-5 rotate-180" />
            </button>
          </div>
        </div>
      )}

      <ToolsFooter />
    </div>
  );
}