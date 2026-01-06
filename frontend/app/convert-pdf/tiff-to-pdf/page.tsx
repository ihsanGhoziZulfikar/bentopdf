'use client';

import React, { useState, useRef, useEffect, ChangeEvent } from 'react';
import Link from 'next/link';
import Navbar from '@/app/components/navbar';
import ToolsFooter from '../../components/footer/tools-footer';
import Image from 'next/image';

// --- IMPORT LIBRARIES ---
import UTIF from 'utif';
import { jsPDF } from 'jspdf';
import { Trash2, Loader2, ArrowLeft, Check, ImageIcon, UploadCloud } from 'lucide-react';

export default function TiffToPdf() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [compression, setCompression] = useState('medium');
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [uploadingFiles, setUploadingFiles] = useState<{ name: string; size: number; progress: number }[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [mounted, setMounted] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      const tiffFiles = newFiles.filter(
        (f) => f.type === 'image/tiff' || f.name.toLowerCase().endsWith('.tiff') || f.name.toLowerCase().endsWith('.tif')
      );

      if (tiffFiles.length === 0) return;

      setSelectedFiles(prev => [...prev, ...tiffFiles]);
      setIsUploading(true);
      
      const uploadState = tiffFiles.map(f => ({ name: f.name, size: f.size, progress: 0 }));
      setUploadingFiles(uploadState);

      if (e.target) e.target.value = '';

      tiffFiles.forEach((file, index) => {
        let progress = 0;
        const interval = setInterval(() => {
          progress += 25;
          setUploadingFiles(prev => {
            const updated = [...prev];
            if (updated[index]) updated[index].progress = progress;
            return updated;
          });
          if (progress >= 100) {
            clearInterval(interval);
            if (index === tiffFiles.length - 1) {
              setTimeout(() => {
                setIsUploading(false);
                setUploadingFiles([]);
              }, 300);
            }
          }
        }, 80);
      });
    }
  };

  // Helper function: Convert TIFF page to canvas
  const tiffPageToCanvas = async (arrayBuffer: ArrayBuffer, pageIndex: number): Promise<HTMLCanvasElement | null> => {
    try {
      console.log(`  🔄 Method 1: Using UTIF decode...`);
      
      const ifds = UTIF.decode(arrayBuffer);
      if (!ifds || ifds.length === 0) {
        console.warn('  ⚠️  No IFDs found');
        return null;
      }

      if (pageIndex >= ifds.length) {
        console.warn(`  ⚠️  Page ${pageIndex} not found (total: ${ifds.length})`);
        return null;
      }

      const ifd = ifds[pageIndex];
      UTIF.decodeImage(arrayBuffer, ifd);

      const width = ifd.width;
      const height = ifd.height;

      console.log(`  📏 Dimensions: ${width}x${height}`);

      if (!width || !height) {
        console.warn('  ⚠️  Invalid dimensions');
        return null;
      }

      const rgba = UTIF.toRGBA8(ifd);
      
      if (!rgba || rgba.length === 0) {
        console.warn('  ⚠️  No RGBA data');
        return null;
      }

      console.log(`  🎨 RGBA buffer length: ${rgba.length} (expected: ${width * height * 4})`);

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d', { willReadFrequently: false });

      if (!ctx) {
        console.warn('  ⚠️  Cannot get canvas context');
        return null;
      }

      const imageData = ctx.createImageData(width, height);
      
      // Copy RGBA data
      for (let i = 0; i < rgba.length; i++) {
        imageData.data[i] = rgba[i];
      }

      ctx.putImageData(imageData, 0, 0);
      
      console.log('  ✅ Canvas created successfully');
      return canvas;

    } catch (error) {
      console.error('  ❌ Error in tiffPageToCanvas:', error);
      return null;
    }
  };

  // Alternative method: Direct image load
  const tiffToCanvasViaImage = async (file: File): Promise<HTMLCanvasElement | null> => {
    return new Promise((resolve) => {
      try {
        console.log(`  🔄 Method 2: Using Image load...`);
        
        const url = URL.createObjectURL(file);
        const img = new window.Image();
        
        img.onload = () => {
          console.log(`  📏 Image loaded: ${img.width}x${img.height}`);
          
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            URL.revokeObjectURL(url);
            resolve(null);
            return;
          }
          
          ctx.drawImage(img, 0, 0);
          URL.revokeObjectURL(url);
          console.log('  ✅ Canvas created via Image');
          resolve(canvas);
        };
        
        img.onerror = (err) => {
          console.warn('  ⚠️  Image load failed:', err);
          URL.revokeObjectURL(url);
          resolve(null);
        };
        
        img.src = url;
        
      } catch (error) {
        console.error('  ❌ Error in tiffToCanvasViaImage:', error);
        resolve(null);
      }
    });
  };

  // Main conversion function
  const handleConvert = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (selectedFiles.length === 0) return;

    setIsProcessing(true);
    setErrorMessage('');

    try {
      console.log('🚀 Starting conversion...');
      console.log('📁 Files to convert:', selectedFiles.length);

      const pdf = new jsPDF({ 
        orientation: 'portrait', 
        unit: 'pt',
        format: 'a4',
        compress: compression !== 'high'
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      console.log('📄 PDF Page Size:', pageWidth, 'x', pageHeight);

      let pageCount = 0;
      let firstPage = true;

      for (let fileIndex = 0; fileIndex < selectedFiles.length; fileIndex++) {
        const file = selectedFiles[fileIndex];
        console.log(`\n📂 Processing file ${fileIndex + 1}/${selectedFiles.length}: ${file.name}`);
        console.log(`📦 File size: ${(file.size / 1024).toFixed(2)} KB`);

        try {
          const arrayBuffer = await file.arrayBuffer();
          console.log('📦 ArrayBuffer loaded:', arrayBuffer.byteLength, 'bytes');

          // Try to decode TIFF
          let ifds;
          let pageCountInFile = 0;
          
          try {
            ifds = UTIF.decode(arrayBuffer);
            pageCountInFile = ifds ? ifds.length : 0;
            console.log('🖼️  TIFF pages detected:', pageCountInFile);
          } catch (decodeError) {
            console.error('❌ UTIF decode failed:', decodeError);
            console.log('🔄 Trying alternative method...');
            
            // Try alternative method
            const canvas = await tiffToCanvasViaImage(file);
            if (canvas) {
              ifds = null;
              pageCountInFile = 1;
              console.log('✅ Loaded via Image element');
            } else {
              console.error('❌ All methods failed for this file');
              continue;
            }
          }

          // Process pages
          if (pageCountInFile === 0) {
            console.warn('⚠️  No pages found in file');
            continue;
          }

          for (let pageIndex = 0; pageIndex < pageCountInFile; pageIndex++) {
            console.log(`\n  📄 Processing page ${pageIndex + 1}/${pageCountInFile}`);

            let canvas: HTMLCanvasElement | null = null;

            // Try UTIF method first
            if (ifds && ifds.length > 0) {
              canvas = await tiffPageToCanvas(arrayBuffer, pageIndex);
            }

            // If UTIF failed, try Image method
            if (!canvas && pageIndex === 0) {
              canvas = await tiffToCanvasViaImage(file);
            }

            if (!canvas) {
              console.warn(`  ⚠️  Failed to create canvas for page ${pageIndex + 1}`);
              continue;
            }

            const width = canvas.width;
            const height = canvas.height;

            console.log(`  📐 Canvas: ${width}x${height}`);

            // Set quality
            let quality = 0.92;
            if (compression === 'high') quality = 0.98;
            else if (compression === 'medium') quality = 0.85;
            else if (compression === 'low') quality = 0.65;

            // Convert to data URL
            const imgDataUrl = canvas.toDataURL('image/jpeg', quality);
            console.log(`  📸 Data URL length: ${imgDataUrl.length}`);

            if (imgDataUrl.length < 100) {
              console.warn('  ⚠️  Image data seems invalid');
              canvas.remove();
              continue;
            }

            // Calculate PDF dimensions
            const margin = 40;
            const availableWidth = pageWidth - (2 * margin);
            const availableHeight = pageHeight - (2 * margin);

            const scale = Math.min(
              availableWidth / width,
              availableHeight / height
            );

            const finalWidth = width * scale;
            const finalHeight = height * scale;

            const x = (pageWidth - finalWidth) / 2;
            const y = (pageHeight - finalHeight) / 2;

            console.log(`  📐 PDF placement: [${x.toFixed(1)}, ${y.toFixed(1)}, ${finalWidth.toFixed(1)}, ${finalHeight.toFixed(1)}]`);

            // Add page
            if (!firstPage) {
              pdf.addPage();
              console.log('  ➕ New page added');
            }
            firstPage = false;

            // Add image
            try {
              pdf.addImage(
                imgDataUrl,
                'JPEG',
                x,
                y,
                finalWidth,
                finalHeight,
                `page_${pageCount}`,
                'FAST'
              );
              console.log('  ✅ Image added to PDF');
              pageCount++;
            } catch (addImageError) {
              console.error('  ❌ Failed to add image to PDF:', addImageError);
            }

            // Cleanup
            canvas.remove();
          }

        } catch (fileError) {
          console.error(`❌ Error processing ${file.name}:`, fileError);
        }
      }

      console.log(`\n📊 Total pages converted: ${pageCount}`);

      if (pageCount === 0) {
        throw new Error('Tidak ada halaman yang berhasil dikonversi. File TIFF mungkin corrupt atau tidak didukung. Coba dengan file TIFF lain atau konversi file ini ke format lain terlebih dahulu.');
      }

      // Generate PDF
      const pdfBlob = pdf.output('blob');
      console.log('📦 PDF blob size:', (pdfBlob.size / 1024).toFixed(2), 'KB');

      if (pdfBlob.size < 1000) {
        throw new Error('PDF yang dihasilkan terlalu kecil, kemungkinan gagal.');
      }

      // Cleanup old URL
      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl);
      }

      const newUrl = URL.createObjectURL(pdfBlob);
      setDownloadUrl(newUrl);
      setShowSuccessModal(true);
      console.log('✅ Conversion completed successfully!');

    } catch (err: any) {
      console.error('❌ Fatal error:', err);
      setErrorMessage(err.message || 'Terjadi kesalahan saat konversi');
      setShowErrorModal(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (downloadUrl) {
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = 'BentoPDF_TIFF_Result.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const removeFile = (index: number) => setSelectedFiles(prev => prev.filter((_, i) => i !== index));

  useEffect(() => {
    return () => {
      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl);
      }
    };
  }, [downloadUrl]);

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
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
              <div 
                onClick={() => !isProcessing && fileInputRef.current?.click()}
                className="border-2 border-dashed border-blue-200 rounded-2xl p-12 bg-blue-50/30 hover:bg-blue-50/60 transition-all cursor-pointer group"
              >
                <div className="flex justify-center mb-6">
                    <img src="/asset/images/upload.svg" alt="upload" className="w-20 h-20" />
                </div>
                <p className="text-gray-700 text-lg font-bold mb-2">Pilih file TIFF</p>
                <p className="text-sm text-gray-500 mb-4">Mendukung file .tif dan .tiff</p>
                <input ref={fileInputRef} type="file" multiple accept=".tiff, .tif, image/tiff" onChange={handleFileChange} className="hidden" />
                <div className="inline-flex items-center px-10 py-3.5 bg-blue-600 text-white rounded-full shadow-lg font-bold text-sm">
                  <UploadCloud className="w-5 h-5 mr-2" />
                  Browse Files
                </div>
              </div>

              {selectedFiles.length > 0 && (
                <div className="mt-8 animate-in slide-in-from-top-2">
                  <h3 className="text-left text-base font-bold text-gray-900 mb-4 uppercase tracking-wider">File Terpilih ({selectedFiles.length})</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
                    {selectedFiles.map((file, idx) => (
                      <div key={idx} className="relative p-4 bg-orange-50 rounded-xl border border-orange-100 flex flex-col items-center group shadow-sm transition-all hover:border-orange-300">
                        <ImageIcon className="w-8 h-8 text-orange-500 mb-2" />
                        <span className="text-[10px] font-bold text-gray-700 truncate w-full text-center" title={file.name}>{file.name}</span>
                        <span className="text-[9px] text-gray-500">{(file.size / 1024).toFixed(1)} KB</span>
                        <button 
                          onClick={(e) => { e.stopPropagation(); removeFile(idx); }} 
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 sticky top-24 h-fit">
              <h2 className="text-2xl font-black text-gray-900 mb-4">TIFF to PDF</h2>
              <div className="mb-8">
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Kualitas Output</label>
                <select value={compression} onChange={(e) => setCompression(e.target.value)} className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-xl text-sm font-bold focus:border-blue-500 outline-none transition-all">
                  <option value="high">High Quality (File besar)</option>
                  <option value="medium">Standard (Seimbang)</option>
                  <option value="low">Compact (File kecil)</option>
                </select>
              </div>

              <button
                onClick={handleConvert}
                disabled={selectedFiles.length === 0 || isProcessing}
                className="w-full py-4 bg-gray-900 text-white rounded-full font-black text-lg hover:bg-black disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 shadow-xl"
              >
                {isProcessing ? <><Loader2 className="w-5 h-5 animate-spin" /> Memproses...</> : "Mulai Konversi"}
              </button>
              
              {isProcessing && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-600 text-center">
                    ⏳ Sedang memproses... Buka Console (F12) untuk detail
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
            <p className="text-gray-600 mb-6">PDF berhasil dibuat dari {selectedFiles.length} file TIFF</p>
            <button onClick={handleDownload} className="w-full py-4 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 shadow-lg transition-colors mb-2">
              Download PDF
            </button>
            <button onClick={() => { setShowSuccessModal(false); setSelectedFiles([]); setDownloadUrl(null); }} className="w-full py-3 text-gray-400 font-bold hover:text-gray-900 transition-colors">
              Konversi Lainnya
            </button>
          </div>
        </div>
      )}

      {showErrorModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-3xl p-10 max-w-md w-full text-center shadow-2xl">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">❌</span>
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-3">Konversi Gagal</h2>
            <p className="text-gray-600 mb-4 text-sm leading-relaxed">{errorMessage}</p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <p className="text-xs font-bold text-gray-700 mb-2">💡 Solusi:</p>
              <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
                <li>Pastikan file TIFF valid dan tidak corrupt</li>
                <li>Coba buka file di image viewer terlebih dahulu</li>
                <li>Konversi ke PNG/JPG dulu jika perlu</li>
                <li>Cek Console (F12) untuk detail error</li>
              </ul>
            </div>
            <button onClick={() => setShowErrorModal(false)} className="w-full py-4 bg-gray-900 text-white rounded-full font-bold hover:bg-black transition-colors">
              Tutup
            </button>
          </div>
        </div>
      )}

      <ToolsFooter />
    </div>
  );
}