'use client';

import { ArrowLeft, UploadCloud, Trash2, Code, Loader2 } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/app/components/navbar';
import ToolsFooter from '@/app/components/footer/tools-footer';

// --- LIBRARY IMPORTS ---
import * as pdfjsLib from 'pdfjs-dist';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export default function PdfToSvg() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    // Setup Worker secara global di client-side
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.type !== 'application/pdf') return;

      setIsUploading(true);
      setUploadProgress(0);

      let progress = 0;
      const interval = setInterval(() => {
        progress += 25;
        setUploadProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          setSelectedFile(file);
        }
      }, 150);
    }
  };

  // Fungsi helper untuk convert canvas ke SVG
  const canvasToSVG = (canvas: HTMLCanvasElement): string => {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context not available');

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');

    svg.setAttribute('width', canvas.width.toString());
    svg.setAttribute('height', canvas.height.toString());
    svg.setAttribute('viewBox', `0 0 ${canvas.width} ${canvas.height}`);
    svg.setAttribute('xmlns', svgNS);

    // Embed canvas sebagai image dalam SVG
    const image = document.createElementNS(svgNS, 'image');
    image.setAttribute('width', canvas.width.toString());
    image.setAttribute('height', canvas.height.toString());
    image.setAttribute('href', canvas.toDataURL('image/png'));

    svg.appendChild(image);

    const serializer = new XMLSerializer();
    return serializer.serializeToString(svg);
  };

  const handleConvert = async () => {
    if (!selectedFile) return;
    setIsProcessing(true);
    const zip = new JSZip();

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;

      // Proses setiap halaman
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);

        // Scale untuk kualitas tinggi (bisa disesuaikan)
        const scale = 2.0;
        const viewport = page.getViewport({ scale });

        // Buat canvas
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        if (!context) {
          throw new Error('Cannot get canvas context');
        }

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        // Render PDF page ke canvas
        const renderContext = {
          canvasContext: context,
          viewport: viewport,
          canvas: canvas,
        };

        await page.render(renderContext).promise;

        // Convert canvas ke SVG
        const svgString = canvasToSVG(canvas);

        // Tambahkan ke ZIP
        zip.file(`halaman-${i}.svg`, svgString);
      }

      // Generate & Download ZIP
      const zipContent = await zip.generateAsync({ type: 'blob' });
      saveAs(
        zipContent,
        `BentoPDF-SVG-${selectedFile.name.replace('.pdf', '')}.zip`
      );
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Conversion error:', error);
      alert(
        error instanceof Error ? error.message : 'Gagal memproses PDF ke SVG.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8 flex-grow w-full">
        <Link
          href="/tools"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-8 font-semibold"
        >
          <ArrowLeft className="w-5 h-5 mr-1" />
          <span>Back to Tools</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="border-2 border-dashed border-blue-200 rounded-2xl p-12 text-center bg-blue-50/30 hover:bg-blue-50/50 transition-all cursor-pointer relative group">
              <UploadCloud className="w-16 h-16 mx-auto mb-4 text-blue-400 group-hover:scale-110 transition-transform" />
              <p className="text-gray-700 font-bold mb-2 text-lg">
                Upload PDF to Extract SVG
              </p>
              <label className="inline-flex items-center px-8 py-3 bg-blue-600 text-white rounded-full cursor-pointer hover:bg-blue-700 shadow-md transition-all font-bold text-sm">
                Select File
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>

            {selectedFile && !isUploading && (
              <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100 flex justify-between items-center animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center gap-3">
                  <div className="bg-orange-500 text-white p-2 rounded-lg font-bold text-[10px] shadow-sm tracking-widest">
                    SVG
                  </div>
                  <span className="text-sm font-semibold text-gray-900 truncate max-w-[200px] md:max-w-xs">
                    {selectedFile.name}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedFile(null)}
                  className="text-red-500 hover:text-red-700 p-1"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-200 p-8 h-fit">
            <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              <Code className="text-indigo-500" /> PDF to SVG
            </h2>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">
              Ekstrak konten dari PDF Anda ke format SVG. Hasil dapat dibuka dan
              diedit di berbagai software desain.
            </p>
            <button
              onClick={handleConvert}
              disabled={!selectedFile || isProcessing || isUploading}
              className="w-full py-4 bg-gray-900 text-white rounded-full font-bold hover:bg-gray-800 disabled:bg-gray-200 transition-all flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Processing...
                </>
              ) : (
                'Mulai Konversi'
              )}
            </button>
          </div>
        </div>
      </main>

      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-10 max-w-sm w-full text-center shadow-2xl animate-in zoom-in duration-300">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
              <svg
                className="w-8 h-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="3"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Success!</h2>
            <p className="text-gray-500 mb-8 text-sm leading-relaxed">
              SVG berhasil diekstrak ke folder ZIP.
            </p>
            <button
              onClick={() => {
                setShowSuccessModal(false);
                setSelectedFile(null);
              }}
              className="w-full py-4 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 shadow-md"
            >
              Selesai
            </button>
          </div>
        </div>
      )}

      <ToolsFooter />
    </div>
  );
}
