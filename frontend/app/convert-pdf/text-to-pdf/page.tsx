'use client';

import React, { useState, useRef, ChangeEvent, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/app/components/navbar';
import ToolsFooter from '../../components/footer/tools-footer';
import { jsPDF } from 'jspdf';
import {
  Trash2,
  Settings,
  Type,
  FileText,
  Check,
  UploadCloud,
  Loader2,
  ArrowLeft,
} from 'lucide-react';

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
        const textPromises = selectedFiles.map(file => file.text());
        const contents = await Promise.all(textPromises);
        finalRawText = contents.join("\n\n---\n\n");
      } else {
        finalRawText = textContent;
      }

      doc.setFont("helvetica");
      doc.setFontSize(settings.fontSize);
      doc.setTextColor(settings.textColor);

      const margin = 20;
      const pageWidth = doc.internal.pageSize.width;
      const maxWidth = pageWidth - (margin * 2);
      const lines = doc.splitTextToSize(finalRawText, maxWidth);
      
      let cursorY = margin;
      const lineHeight = settings.fontSize * 0.5;

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
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8 flex-grow w-full text-gray-900">
        <Link href="/tools" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-8 font-semibold transition-colors">
          <ArrowLeft className="w-5 h-5 mr-1" />
          <span>Back to Tools</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN: Main Interaction Area */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Mode Switcher Tabs */}
              <div className="flex border-b border-gray-100">
                <button 
                  onClick={() => setMode('upload')} 
                  className={`flex-1 py-4 text-sm font-bold flex justify-center items-center gap-2 transition-all ${mode === 'upload' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  <UploadCloud className="w-4 h-4" /> Upload .txt
                </button>
                <button 
                  onClick={() => setMode('text')} 
                  className={`flex-1 py-4 text-sm font-bold flex justify-center items-center gap-2 transition-all ${mode === 'text' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  <Type className="w-4 h-4" /> Type Text
                </button>
              </div>

              <div className="p-8">
                {mode === 'upload' ? (
                  <div 
                    onClick={() => fileInputRef.current?.click()} 
                    className="border-2 border-dashed border-blue-100 rounded-2xl p-16 text-center bg-blue-50/20 hover:bg-blue-50/50 cursor-pointer transition-all group"
                  >
                    <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:scale-110 transition-transform">
                        <FileText className="w-8 h-8 text-blue-500" />
                    </div>
                    <p className="text-gray-700 font-bold text-lg mb-1">Pilih atau Seret file .txt</p>
                    <p className="text-gray-400 text-sm italic">File teks Anda akan diproses secara lokal</p>
                    <input ref={fileInputRef} type="file" multiple accept=".txt" onChange={handleFileChange} className="hidden" />
                  </div>
                ) : (
                  <textarea 
                    value={textContent} 
                    onChange={(e) => setTextContent(e.target.value)} 
                    placeholder="Masukkan teks yang ingin dikonversi menjadi dokumen PDF..." 
                    className="w-full h-80 p-5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none font-sans text-sm leading-relaxed transition-all" 
                  />
                )}

                {/* Display Progress while uploading */}
                {isUploading && (
                  <div className="mt-8 space-y-3">
                    {uploadingFiles.map((f, i) => (
                      <div key={i} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="flex justify-between text-xs font-bold mb-2 uppercase text-gray-400 tracking-wider">
                          <span className="truncate max-w-[200px]">{f.name}</span>
                          <span>{f.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-blue-600 h-full transition-all duration-300" style={{ width: `${f.progress}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* File List After Upload */}
                {selectedFiles.length > 0 && mode === 'upload' && !isUploading && (
                  <div className="mt-8 animate-in slide-in-from-top-2 duration-300">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Selected Files</h3>
                    <div className="space-y-3">
                      {selectedFiles.map((f, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-blue-50/50 rounded-xl border border-blue-100 shadow-sm">
                          <div className="flex items-center gap-3">
                            <div className="bg-blue-600 text-white px-2 py-1 rounded text-[10px] font-black uppercase">TXT</div>
                            <span className="text-sm font-bold text-gray-700 truncate max-w-xs">{f.name}</span>
                          </div>
                          <button onClick={() => setSelectedFiles(selectedFiles.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-all">
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

          {/* RIGHT COLUMN: Settings Sidebar (PDF TO JPG STYLE) */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 sticky top-24 h-fit">
              <div className="flex items-center gap-2 mb-6 font-black text-gray-900 text-xl tracking-tight">
                <Settings className="w-6 h-6 text-blue-600" /> PDF Settings
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Page Size</label>
                  <select 
                    value={settings.pageSize} 
                    onChange={(e) => setSettings({...settings, pageSize: e.target.value})} 
                    className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer"
                  >
                    <option value="a4">A4 Standard</option>
                    <option value="letter">Letter</option>
                    <option value="a5">A5 Small</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Font Size</label>
                    <input 
                        type="number" 
                        value={settings.fontSize} 
                        onChange={(e) => setSettings({...settings, fontSize: Number(e.target.value)})} 
                        className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Text Color</label>
                    <input 
                        type="color" 
                        value={settings.textColor} 
                        onChange={(e) => setSettings({...settings, textColor: e.target.value})} 
                        className="w-full h-[52px] p-2 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer" 
                    />
                  </div>
                </div>

                <button 
                  onClick={handleConvert} 
                  disabled={isProcessing || (mode === 'upload' && selectedFiles.length === 0) || (mode === 'text' && !textContent)} 
                  className="w-full py-4 bg-gray-900 text-white rounded-full font-black text-lg hover:bg-black disabled:bg-gray-100 disabled:text-gray-400 transition-all flex justify-center items-center gap-3 shadow-xl shadow-gray-200 mt-4"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" /> Merender...
                    </>
                  ) : (
                    "Mulai Konversi"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* SUCCESS MODAL */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-10 max-w-sm w-full text-center shadow-2xl animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10" strokeWidth={3} />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-2">Berhasil!</h3>
            <p className="text-gray-500 mb-8 text-sm">Dokumen teks Anda telah berhasil dikonversi menjadi file PDF berkualitas tinggi.</p>
            <div className="space-y-3">
              <button 
                onClick={handleDownload} 
                className="w-full py-4 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all"
              >
                Download PDF
              </button>
              <button 
                onClick={() => {setShowSuccessModal(false); setSelectedFiles([]); setTextContent('');}} 
                className="w-full py-3 text-gray-400 font-bold hover:text-gray-600 transition-colors"
              >
                Konversi Lainnya
              </button>
            </div>
          </div>
        </div>
      )}
      <ToolsFooter />
    </div>
  );
}