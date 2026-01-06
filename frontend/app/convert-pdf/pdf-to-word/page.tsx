'use client';

import React, { useState, useRef, useEffect, ChangeEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '../../components/navbar';
import ToolsFooter from '@/app/components/footer/tools-footer';
import { ArrowLeft, Trash2, FileText, Loader2, UploadCloud } from 'lucide-react';
import { Document, Packer, Paragraph, ImageRun, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';

export default function PdfToWordPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [conversionProgress, setConversionProgress] = useState(0);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [mounted, setMounted] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const selectedFile = files[0];
      
      if (selectedFile.type !== 'application/pdf') {
        alert('Hanya file PDF yang diperbolehkan.');
        if (e.target) e.target.value = '';
        return;
      }

      setFile(selectedFile);
      setIsUploading(true);
      setUploadProgress(0);

      if (e.target) e.target.value = '';

      let progress = 0;
      const interval = setInterval(() => {
        progress += 25;
        setUploadProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
          setIsUploading(false);
        }
      }, 150);
    }
  };

  const removeFile = () => {
    setFile(null);
    setUploadProgress(0);
    setIsUploading(false);
    setConversionProgress(0);
  };

  // Convert canvas to blob
  const canvasToBlob = (canvas: HTMLCanvasElement): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to convert canvas to blob'));
        }
      }, 'image/png');
    });
  };

  // Convert blob to array buffer
  const blobToArrayBuffer = (blob: Blob): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result instanceof ArrayBuffer) {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to read blob'));
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(blob);
    });
  };

  const convertToWord = async () => {
    if (!file) return;
    
    setLoading(true);
    setErrorMessage('');
    setConversionProgress(0);

    try {
      console.log('🚀 Starting PDF to Word conversion (Image Method)...');
      console.log('📄 File:', file.name, '(' + (file.size / 1024).toFixed(2) + ' KB)');

      // Load PDF.js
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

      // Load PDF
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const totalPages = pdf.numPages;

      console.log('📖 Total pages:', totalPages);

      const sections = [];
      
      // Process each page
      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        console.log(`\n📄 Processing page ${pageNum}/${totalPages}...`);
        
        // Update progress
        setConversionProgress(Math.round((pageNum / totalPages) * 100));

        const page = await pdf.getPage(pageNum);
        
        // Get page dimensions
        const viewport = page.getViewport({ scale: 2.0 }); // 2x for better quality
        console.log(`  📏 Page dimensions: ${viewport.width}x${viewport.height}`);

        // Create canvas
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        if (!context) {
          console.error('  ❌ Failed to get canvas context');
          continue;
        }

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        // Render PDF page to canvas
        console.log('  🎨 Rendering page to canvas...');
        await page.render({
          canvasContext: context,
          viewport: viewport,
          canvas: canvas
        }).promise;

        console.log('  ✅ Page rendered');

        // Convert canvas to blob
        console.log('  📸 Converting to image...');
        const blob = await canvasToBlob(canvas);
        console.log(`  💾 Image size: ${(blob.size / 1024).toFixed(2)} KB`);

        // Convert blob to ArrayBuffer for docx
        const imageBuffer = await blobToArrayBuffer(blob);

        // Calculate dimensions for Word (A4 page)
        // A4 = 210mm x 297mm = 595pt x 842pt
        const pageWidthPt = 595;
        const pageHeightPt = 842;
        const marginPt = 36; // 0.5 inch margins

        const availableWidth = pageWidthPt - (2 * marginPt);
        const availableHeight = pageHeightPt - (2 * marginPt);

        // Calculate scale to fit
        const scaleX = availableWidth / viewport.width;
        const scaleY = availableHeight / viewport.height;
        const scale = Math.min(scaleX, scaleY);

        const imageWidth = viewport.width * scale;
        const imageHeight = viewport.height * scale;

        console.log(`  📐 Word dimensions: ${imageWidth.toFixed(2)}x${imageHeight.toFixed(2)} pt`);

        // Create paragraph with image
        const imageParagraph = new Paragraph({
          children: [
            new ImageRun({
              data: new Uint8Array(imageBuffer),
              transformation: {
                width: imageWidth,
                height: imageHeight,
              },
              type: 'png',
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: {
            before: 0,
            after: 0,
          },
        });

        // Add section (each page is a new section with page break)
        sections.push({
          properties: {
            page: {
              margin: {
                top: marginPt * 20, // Convert to twips (1pt = 20 twips)
                right: marginPt * 20,
                bottom: marginPt * 20,
                left: marginPt * 20,
              },
              pageNumbers: {
                start: pageNum,
              },
            },
          },
          children: [imageParagraph],
        });

        // Cleanup canvas
        canvas.width = 0;
        canvas.height = 0;

        console.log(`  ✅ Page ${pageNum} processed`);
      }

      console.log('\n📦 Creating Word document...');

      // Create Word document
      const doc = new Document({
        sections: sections,
      });

      console.log('💾 Generating DOCX file...');
      const blob = await Packer.toBlob(doc);
      
      console.log('✅ DOCX created:', (blob.size / 1024).toFixed(2), 'KB');

      // Save file
      const fileName = file.name.replace('.pdf', '') + '_converted.docx';
      saveAs(blob, fileName);
      
      console.log('🎉 Conversion completed successfully!');
      setShowSuccessModal(true);

    } catch (error: any) {
      console.error('❌ Conversion failed:', error);
      setErrorMessage(error.message || 'Gagal mengonversi file. Pastikan PDF tidak terenkripsi.');
      setShowErrorModal(true);
    } finally {
      setLoading(false);
      setConversionProgress(0);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-8 flex-grow w-full">
        <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-8 font-semibold transition-colors">
          <ArrowLeft className="w-5 h-5 mr-1" />
          <span>Back to Tools</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 order-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-8 text-center">
              
              <div 
                onClick={() => !loading && fileInputRef.current?.click()}
                className="border-2 border-dashed border-blue-200 rounded-2xl p-12 bg-blue-50/30 hover:bg-blue-50/60 transition-all cursor-pointer group"
              >
                <div className="flex justify-center mb-6">
                  <div className="relative w-24 h-24 group-hover:scale-110 transition-transform">
                    <img src="/asset/images/upload.svg" alt="upload" className="w-full h-full object-contain" />
                  </div>
                </div>
                <p className="text-gray-700 text-lg font-bold mb-2">Pilih file PDF untuk dikonversi</p>
                <p className="text-gray-500 mb-8 text-sm italic">PDF akan dikonversi sebagai gambar - semua elemen tetap sama persis</p>
                
                <input 
                  ref={fileInputRef} 
                  type="file" 
                  accept="application/pdf" 
                  onChange={handleFileChange} 
                  className="hidden" 
                />
                
                <div className="inline-flex items-center px-10 py-3.5 bg-blue-600 text-white rounded-full shadow-lg font-bold text-sm transition-all hover:bg-blue-700">
                  <UploadCloud className="w-5 h-5 mr-2" />
                  Browse File
                </div>
              </div>

              {isUploading && (
                <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-100 animate-in fade-in">
                  <div className="flex justify-between text-xs font-bold mb-2 uppercase text-gray-400">
                    <span>Membaca PDF...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>
              )}

              {loading && conversionProgress > 0 && (
                <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-100 animate-in fade-in">
                  <div className="flex justify-between text-xs font-bold mb-2 uppercase text-blue-600">
                    <span>Converting to Word...</span>
                    <span>{conversionProgress}%</span>
                  </div>
                  <div className="w-full bg-blue-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full transition-all duration-300" style={{ width: `${conversionProgress}%` }} />
                  </div>
                  <p className="text-xs text-blue-600 mt-2 text-center">Rendering halaman {Math.ceil(conversionProgress / 100 * (file ? 10 : 1))}...</p>
                </div>
              )}

              {file && (
                <div className="mt-8 animate-in slide-in-from-top-2">
                  <h3 className="text-left text-base font-bold text-gray-900 mb-4 uppercase tracking-wider">File Terpilih</h3>
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex justify-between items-center shadow-sm">
                    <div className="flex items-center gap-4 truncate">
                      <div className="bg-red-600 text-white px-3 py-2 rounded-lg font-black text-[10px] tracking-widest uppercase">PDF</div>
                      <div className="text-left">
                        <p className="text-sm font-bold text-gray-900 truncate">{file.name}</p>
                        <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                      </div>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); removeFile(); }} 
                      className="text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors"
                      disabled={loading}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Info Box */}
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl text-left">
                <p className="text-xs font-bold text-green-800 mb-2">✅ Keunggulan Metode Ini:</p>
                <ul className="text-xs text-green-700 space-y-1 list-disc list-inside">
                  <li><strong>100% Identik:</strong> Semua elemen (teks, gambar, grafik) tetap sama persis</li>
                  <li><strong>Format Terjaga:</strong> Layout, warna, font, spacing tidak berubah</li>
                  <li><strong>Gambar Tetap Ada:</strong> Semua visual element terkonversi</li>
                  <li><strong>Hasil Bersih:</strong> Tidak ada elemen yang hilang atau berantakan</li>
                </ul>
              </div>

              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-left">
                <p className="text-xs font-bold text-yellow-800 mb-2">⚠️ Catatan:</p>
                <ul className="text-xs text-yellow-700 space-y-1 list-disc list-inside">
                  <li>Setiap halaman PDF menjadi gambar di Word (tidak bisa edit teks)</li>
                  <li>Cocok untuk preservasi visual, bukan untuk editing konten</li>
                  <li>File Word akan lebih besar dari PDF original</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 order-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 sticky top-24 h-fit">
              <h2 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="text-blue-500 w-7 h-7" /> PDF to Word
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-8 font-medium">
                Konversi PDF ke Word dengan mempertahankan 100% tampilan visual original - semua teks, gambar, dan format tetap identik.
              </p>

              <button
                onClick={convertToWord}
                disabled={!file || isUploading || loading}
                className="w-full py-4 bg-gray-900 text-white rounded-full font-black text-lg hover:bg-black disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 shadow-xl"
              >
                {loading ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Converting...</>
                ) : (
                  "Convert to Word"
                )}
              </button>

              {loading && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-600 text-center">
                    ⏳ Processing page by page...
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-3xl p-10 max-w-sm w-full text-center shadow-2xl animate-in zoom-in duration-300">
            <Image src="/asset/images/success-modal.svg" alt="success" width={100} height={100} className="mx-auto mb-6" />
            <h2 className="text-2xl font-black text-gray-900 mb-2">Berhasil! 🎉</h2>
            <p className="text-gray-600 mb-6 text-sm">
              PDF telah dikonversi ke Word dan otomatis terunduh. Semua elemen visual tetap sama persis dengan PDF original!
            </p>
            <div className="bg-green-50 rounded-lg p-4 mb-6 text-left">
              <p className="text-xs font-bold text-green-700 mb-2">✅ Hasil:</p>
              <ul className="text-xs text-green-600 space-y-1 list-disc list-inside">
                <li>Layout 100% identik</li>
                <li>Gambar semua terkonversi</li>
                <li>Formatting terjaga sempurna</li>
                <li>Ready untuk dicetak atau dishare</li>
              </ul>
            </div>
            <div className="space-y-3">
              <button 
                onClick={() => setShowSuccessModal(false)}
                className="w-full py-4 bg-blue-600 text-white rounded-full font-black text-lg hover:bg-blue-700 shadow-lg transition-all"
              >
                Close
              </button>
              <button 
                onClick={() => {setShowSuccessModal(false); removeFile();}}
                className="w-full py-3 text-gray-400 font-bold hover:text-gray-900 transition-colors text-sm"
              >
                Convert Another
              </button>
            </div>
          </div>
        </div>
      )}

      {showErrorModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-3xl p-10 max-w-md w-full text-center shadow-2xl">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">❌</span>
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-3">Conversion Failed</h2>
            <p className="text-gray-600 mb-4 text-sm leading-relaxed">{errorMessage}</p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <p className="text-xs font-bold text-gray-700 mb-2">💡 Solusi:</p>
              <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
                <li>Pastikan PDF tidak terenkripsi (ada password)</li>
                <li>Coba buka PDF di viewer untuk memastikan bisa dibuka</li>
                <li>Check Console (F12) untuk detail error</li>
                <li>File PDF mungkin corrupt - coba file lain</li>
              </ul>
            </div>
            <button 
              onClick={() => setShowErrorModal(false)} 
              className="w-full py-4 bg-gray-900 text-white rounded-full font-bold hover:bg-black transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <ToolsFooter />
    </div>
  );
}