'use client';

import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import Link from 'next/link';
import Navbar from '../components/navbar';
import ToolsFooter from '../components/footer/tools-footer';
import {
  CircleArrowUp,
  FileText,
  ArrowLeft,
  Download,
  Trash2,
  Loader2,
} from 'lucide-react';

export default function EditPDF() {
  // --- STATE ---
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // WebViewer Refs
  const viewerDiv = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [instance, setInstance] = useState<any>(null);

  // --- HANDLERS: FILE UPLOAD & DROP ---
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
      } else {
        alert('Please upload a valid PDF file.');
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
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'application/pdf') {
        setFile(droppedFile);
      } else {
        alert('Please upload a valid PDF file.');
      }
    }
  };

  const clearFile = () => {
    setFile(null);
    setInstance(null);
  };

  // --- WEBVIEWER INIT ---
  useEffect(() => {
    if (file && viewerDiv.current) {
      import('@pdftron/webviewer').then((pdftron) => {
        pdftron
          .default(
            {
              path: '/webviewer/lib',
              initialDoc: '',
              licenseKey: 'DEMO', // Ganti dengan key production jika ada
              fullAPI: true,
            },
            viewerDiv.current as HTMLDivElement
          )
          .then((inst) => {
            setInstance(inst);
            const { UI } = inst;

            // Load dokumen
            const reader = new FileReader();
            reader.onload = (e) => {
              if (e.target?.result) {
                inst.UI.loadDocument(e.target.result as string | Blob, {
                  filename: file.name,
                });
              }
            };
            reader.readAsArrayBuffer(file);

            // UI Customization untuk tampilan lebih bersih
            // Menonaktifkan header default WebViewer jika ingin custom header sendiri,
            // atau biarkan default tapi sesuaikan theme.
            UI.setTheme('light');
            UI.enableElements(['Panel', 'ToolsHeader']);
          });
      });
    }
  }, [file]);

  // --- HANDLER: DOWNLOAD ---
  const handleDownload = async () => {
    if (instance) {
      setIsSaving(true);
      try {
        const { documentViewer, annotationManager } = instance.Core;
        const doc = documentViewer.getDocument();
        const xfdfString = await annotationManager.exportAnnotations();

        const data = await doc.getFileData({
          xfdfString,
          flatten: true,
        });

        const arr = new Uint8Array(data);
        const blob = new Blob([arr], { type: 'application/pdf' });

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `edited_${file?.name}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Error downloading:', error);
        alert('Failed to download PDF.');
      } finally {
        setIsSaving(false);
      }
    }
  };

  // Format File Size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      {/* Header */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Breadcrumb / Back Link */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Tools
          </Link>
        </div>

        {!file ? (
          // ================= VIEW: UPLOAD STATE (GRID LAYOUT) =================
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Left Column: Dropzone */}
            <div className="lg:col-span-2 order-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8 h-full">
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`h-64 sm:h-80 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center transition-all duration-200 ${
                    isDragging
                      ? 'border-blue-500 bg-blue-50/50 scale-[1.01]'
                      : 'border-blue-200 bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <img
                      src="/asset/images/upload.svg"
                      alt="Upload"
                      className="w-12 h-12 sm:w-14 sm:h-14 opacity-90"
                    />
                  </div>
                  <p className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
                    Drag & Drop PDF here
                  </p>
                  <p className="text-gray-500 mb-6 text-sm">
                    or click to browse from your computer
                  </p>

                  <label className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full cursor-pointer shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 font-medium">
                    <CircleArrowUp className="w-5 h-5 mr-2" />
                    Select PDF File
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>

                  <p className="mt-4 text-xs text-gray-400">
                    Supported formats: PDF (Max. 100 MB)
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Info Panel */}
            <div className="lg:col-span-1 order-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8 sticky top-24">
                <h1 className="text-2xl font-bold text-gray-900 mb-3">
                  PDF Editor
                </h1>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Annotate, highlight, redact, add comments, or insert shapes
                  directly into your PDF document using our advanced web-based
                  editor.
                </p>

                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                      <span className="text-green-600 font-bold text-sm">
                        1
                      </span>
                    </div>
                    <p className="ml-3 text-sm text-gray-600">
                      Upload your file securely.
                    </p>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
                      <span className="text-blue-600 font-bold text-sm">2</span>
                    </div>
                    <p className="ml-3 text-sm text-gray-600">
                      Edit using the full suite of tools.
                    </p>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mt-0.5">
                      <span className="text-purple-600 font-bold text-sm">
                        3
                      </span>
                    </div>
                    <p className="ml-3 text-sm text-gray-600">
                      Download the flattened PDF instantly.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // ================= VIEW: EDITOR STATE (FULL WIDTH) =================
          <div className="w-full bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden flex flex-col h-[85vh]">
            {/* Custom Toolbar / Header for Editor */}
            <div className="bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center z-10 shadow-sm">
              <div className="flex items-center gap-4 overflow-hidden">
                <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0 text-red-500">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3
                    className="font-semibold text-gray-900 truncate max-w-xs sm:max-w-md"
                    title={file.name}
                  >
                    {file.name}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={clearFile}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  title="Discard changes and upload new file"
                >
                  <Trash2 className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Change File</span>
                </button>

                <button
                  onClick={handleDownload}
                  disabled={!instance || isSaving}
                  className="inline-flex items-center px-4 py-2 text-sm font-bold text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-sm transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4 mr-2" />
                  )}
                  {isSaving ? 'Saving...' : 'Download PDF'}
                </button>
              </div>
            </div>

            {/* WebViewer Container */}
            <div className="relative flex-grow bg-gray-100">
              <div
                ref={viewerDiv}
                className="absolute inset-0 w-full h-full"
              ></div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <ToolsFooter />
    </div>
  );
}
