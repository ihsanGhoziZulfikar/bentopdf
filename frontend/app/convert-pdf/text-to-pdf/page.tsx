'use client';

import React, { useState, useRef, ChangeEvent, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/app/components/navbar';
import ToolsFooter from '../../components/footer/tools-footer';
import { jsPDF } from 'jspdf'; // --- IMPORT JSPDF ---
import {
  Trash2,
  Settings,
  Type,
  FileText,
  Check,
  UploadCloud,
} from 'lucide-react';

const LANGUAGES = ['English', 'Indonesian', 'Spanish', 'French', 'German'];

export default function TextToPdf() {
  const [mode, setMode] = useState<'upload' | 'text'>('upload');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [textContent, setTextContent] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [uploadingFiles, setUploadingFiles] = useState<{ name: string; size: number; progress: number }[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [settings, setSettings] = useState({
    language: 'English',
    fontSize: 12,
    pageSize: 'a4',
    textColor: '#000000',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setMounted(true); }, []);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      const txtFiles = newFiles.filter(f => f.type === 'text/plain' || f.name.endsWith('.txt'));

      if (txtFiles.length !== newFiles.length) setErrorMsg('Only .txt files are supported.');
      else setErrorMsg(null);

      if (txtFiles.length === 0) return;

      setIsUploading(true);
      setUploadingFiles(txtFiles.map(f => ({ name: f.name, size: f.size, progress: 0 })));

      txtFiles.forEach((file, index) => {
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
            if (index === txtFiles.length - 1) {
              setTimeout(() => {
                setIsUploading(false);
                setSelectedFiles(prev => [...prev, ...txtFiles]);
                setUploadingFiles([]);
              }, 300);
            }
          }
        }, 100);
      });
    }
  };

  // --- LOGIKA KONVERSI TEXT KE PDF ---
  const handleConvert = async () => {
    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const doc = new jsPDF({
        format: settings.pageSize,
        unit: 'mm'
      });

      let finalRawText = "";

      if (mode === 'upload') {
        // Baca semua file .txt yang diunggah
        const textPromises = selectedFiles.map(file => file.text());
        const contents = await Promise.all(textPromises);
        finalRawText = contents.join("\n\n---\n\n");
      } else {
        finalRawText = textContent;
      }

      // Konfigurasi Font
      doc.setFont("helvetica");
      doc.setFontSize(settings.fontSize);
      doc.setTextColor(settings.textColor);

      // Margin dan Wrapping
      const margin = 20;
      const pageWidth = doc.internal.pageSize.width;
      const maxWidth = pageWidth - (margin * 2);
      
      // Membagi teks otomatis agar tidak keluar halaman
      const lines = doc.splitTextToSize(finalRawText, maxWidth);
      
      let cursorY = margin;
      const lineHeight = settings.fontSize * 0.5; // Estimasi spasi antar baris

      lines.forEach((line: string) => {
        if (cursorY > doc.internal.pageSize.height - margin) {
          doc.addPage();
          cursorY = margin;
        }
        doc.text(line, margin, cursorY);
        cursorY += lineHeight;
      });

      const blob = doc.output('blob');
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setShowSuccessModal(true);
    } catch (err) {
      console.error(err);
      setShowErrorModal(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (downloadUrl) {
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = mode === 'upload' ? 'BentoPDF_Converted_Text.pdf' : 'BentoPDF_Typed_Text.pdf';
      a.click();
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Link href="/tools" className="inline-flex items-center text-indigo-600 mb-8 font-medium">
          <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor font-bold"><path d="M15 19l-7-7 7-7" /></svg>
          Back to Tools
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="flex border-b">
                <button onClick={() => setMode('upload')} className={`flex-1 py-4 text-sm font-bold flex justify-center items-center gap-2 ${mode === 'upload' ? 'bg-indigo-50 text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}><UploadCloud className="w-4 h-4" /> Upload .txt</button>
                <button onClick={() => setMode('text')} className={`flex-1 py-4 text-sm font-bold flex justify-center items-center gap-2 ${mode === 'text' ? 'bg-indigo-50 text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}><Type className="w-4 h-4" /> Type Text</button>
              </div>

              <div className="p-6">
                {mode === 'upload' ? (
                  <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-indigo-100 rounded-xl p-12 text-center bg-indigo-50/20 hover:bg-indigo-50/50 cursor-pointer transition-all">
                    <FileText className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
                    <p className="text-gray-700 font-bold">Drag and drop text files here</p>
                    <input ref={fileInputRef} type="file" multiple accept=".txt" onChange={handleFileChange} className="hidden" />
                  </div>
                ) : (
                  <textarea value={textContent} onChange={(e) => setTextContent(e.target.value)} placeholder="Tulis sesuatu di sini..." className="w-full h-80 p-5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none font-mono text-sm" />
                )}

                {/* File List */}
                {selectedFiles.length > 0 && mode === 'upload' && !isUploading && (
                  <div className="mt-6 space-y-2">
                    {selectedFiles.map((f, i) => (
                      <div key={i} className="flex justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 animate-in fade-in">
                        <span className="text-sm font-medium truncate max-w-xs">{f.name}</span>
                        <button onClick={() => setSelectedFiles(selectedFiles.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Settings Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-24">
              <div className="flex items-center gap-2 mb-6 font-bold text-gray-800"><Settings className="w-5 h-5 text-indigo-600" /> PDF Settings</div>
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Page Size</label>
                  <select value={settings.pageSize} onChange={(e) => setSettings({...settings, pageSize: e.target.value})} className="w-full p-3 bg-gray-50 border rounded-xl text-sm font-bold">
                    <option value="a4">A4 Standard</option>
                    <option value="letter">Letter</option>
                    <option value="a5">A5 Small</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Font Size</label>
                    <input type="number" value={settings.fontSize} onChange={(e) => setSettings({...settings, fontSize: Number(e.target.value)})} className="w-full p-3 bg-gray-50 border rounded-xl text-sm font-bold" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Color</label>
                    <input type="color" value={settings.textColor} onChange={(e) => setSettings({...settings, textColor: e.target.value})} className="w-full h-11 p-1 bg-gray-50 border rounded-xl" />
                  </div>
                </div>
                <button onClick={handleConvert} disabled={isProcessing} className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex justify-center items-center gap-2">
                  {isProcessing ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "Create PDF"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6"><Check className="w-10 h-10" /></div>
            <h3 className="text-2xl font-bold mb-2">PDF Created!</h3>
            <p className="text-gray-500 mb-8">Dokumen teks Anda telah berhasil dikonversi.</p>
            <div className="space-y-3">
              <button onClick={handleDownload} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all">Download PDF</button>
              <button onClick={() => {setShowSuccessModal(false); setSelectedFiles([]); setTextContent('');}} className="w-full py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200">Convert Another</button>
            </div>
          </div>
        </div>
      )}
      <ToolsFooter />
    </div>
  );
}