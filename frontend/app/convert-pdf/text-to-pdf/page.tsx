'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  UploadCloud,
  Menu,
  X,
  Plus,
  Trash2,
  FileText,
  Type,
  ChevronDown,
  Check,
  Instagram,
  Linkedin,
} from 'lucide-react';

// Daftar bahasa simulasi
const LANGUAGES = [
  'English (Default)',
  'Spanish',
  'French',
  'German',
  'Indonesian',
  'Japanese',
  'Chinese',
  'Russian',
  'Portuguese',
  'Arabic',
  'Hindi',
];

export default function TextToPdf() {
  // --- STATE MANAGEMENT ---
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Mode: 'upload' atau 'text'
  const [mode, setMode] = useState<'upload' | 'text'>('upload');

  // Upload Mode State
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Text Mode State
  const [textContent, setTextContent] = useState('');

  // Settings State
  const [settings, setSettings] = useState({
    language: 'English (Default)',
    fontSize: 12,
    pageSize: 'A4',
    orientation: 'portrait',
    customWidth: 595,
    customHeight: 842,
    textColor: '#000000',
  });

  // Language Dropdown Logic
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [langSearch, setLangSearch] = useState('');
  const langDropdownRef = useRef<HTMLDivElement>(null);

  // --- HANDLERS ---

  // Handle click outside language dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        langDropdownRef.current &&
        !langDropdownRef.current.contains(event.target as Node)
      ) {
        setIsLangOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      const validFiles = newFiles.filter(
        (f) => f.type === 'text/plain' || f.name.endsWith('.txt')
      );

      if (validFiles.length !== newFiles.length) {
        alert('Only .txt files are allowed.');
      }
      setFiles((prev) => [...prev, ...validFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleCreatePdf = () => {
    // Validasi input
    if (mode === 'upload' && files.length === 0) {
      alert('Please upload at least one text file.');
      return;
    }
    if (mode === 'text' && textContent.trim() === '') {
      alert('Please enter some text.');
      return;
    }

    setIsProcessing(true);

    // Simulasi proses
    setTimeout(() => {
      setIsProcessing(false);
      alert('PDF Created Successfully! (Simulation)');
    }, 2000);
  };

  // Filter Bahasa
  const filteredLanguages = LANGUAGES.filter((lang) =>
    lang.toLowerCase().includes(langSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 antialiased font-sans flex flex-col">
      {/* --- NAVIGATION --- */}
      <nav className="bg-gray-800 border-b border-gray-700 sticky top-0 z-30">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0 flex items-center cursor-pointer">
              <img
                src="/images/favicon.svg"
                alt="Bento PDF Logo"
                className="h-8 w-8"
              />
              <span className="text-white font-bold text-xl ml-2">
                <Link href="/">BentoPDF</Link>
              </span>
            </div>

            <div className="hidden md:flex items-center space-x-8 text-white">
              <Link
                href="/"
                className="hover:text-indigo-400 transition-colors"
              >
                Home
              </Link>
              <Link
                href="/about"
                className="hover:text-indigo-400 transition-colors"
              >
                About
              </Link>
              <Link
                href="/contact"
                className="hover:text-indigo-400 transition-colors"
              >
                Contact
              </Link>
              <Link
                href="/tools"
                className="hover:text-indigo-400 transition-colors"
              >
                All Tools
              </Link>
            </div>

            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-400 hover:text-white hover:bg-gray-700 p-2 rounded-md"
              >
                {!isMenuOpen ? (
                  <Menu className="h-6 w-6" />
                ) : (
                  <X className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden bg-gray-800 border-t border-gray-700 p-2 space-y-1">
            <Link
              href="/"
              className="block px-3 py-2 rounded-md text-white hover:bg-gray-700"
            >
              Home
            </Link>
            <Link
              href="/about"
              className="block px-3 py-2 rounded-md text-white hover:bg-gray-700"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="block px-3 py-2 rounded-md text-white hover:bg-gray-700"
            >
              Contact
            </Link>
            <Link
              href="/tools"
              className="block px-3 py-2 rounded-md text-white hover:bg-gray-700"
            >
              All Tools
            </Link>
          </div>
        )}
      </nav>

      {/* --- MAIN CONTENT --- */}
      <div className="flex-grow flex items-start justify-center py-12 p-4 bg-gray-900">
        <div className="bg-gray-800 rounded-xl shadow-xl px-4 py-8 md:p-8 max-w-2xl w-full text-gray-200 border border-gray-700">
          <Link href="/tools">
            <button className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 mb-6 font-semibold transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Tools</span>
            </button>
          </Link>

          <h1 className="text-2xl font-bold text-white mb-2">Text to PDF</h1>
          <p className="text-gray-400 mb-6">
            Upload one or more text files, or type/paste text below to convert
            to PDF with custom formatting.
          </p>

          {/* --- MODE TOGGLE --- */}
          <div className="flex gap-2 p-1 rounded-lg bg-gray-900 border border-gray-700 mb-6">
            <button
              onClick={() => setMode('upload')}
              className={`flex-1 font-semibold py-2 rounded-md transition-colors flex justify-center items-center gap-2 ${
                mode === 'upload'
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
              }`}
            >
              <UploadCloud className="w-4 h-4" /> Upload Files
            </button>
            <button
              onClick={() => setMode('text')}
              className={`flex-1 font-semibold py-2 rounded-md transition-colors flex justify-center items-center gap-2 ${
                mode === 'text'
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
              }`}
            >
              <Type className="w-4 h-4" /> Type Text
            </button>
          </div>

          {/* --- UPLOAD PANEL --- */}
          {mode === 'upload' && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="relative flex flex-col items-center justify-center w-full h-48 md:h-64 border-2 border-dashed border-gray-600 rounded-xl cursor-pointer bg-gray-900 hover:bg-gray-700 transition-colors duration-300 group"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <UploadCloud className="w-10 h-10 mb-3 text-gray-400 group-hover:text-indigo-400 transition-colors" />
                  <p className="mb-2 text-sm text-gray-400">
                    <span className="font-semibold text-gray-300">
                      Click to select files
                    </span>{' '}
                    or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">Text files (.txt)</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  multiple
                  accept="text/plain,.txt"
                  onChange={handleFileChange}
                />
              </div>

              {/* File List */}
              {files.length > 0 && (
                <div className="mt-4 space-y-3">
                  <div className="flex gap-3 mb-2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Add More
                    </button>
                    <button
                      onClick={() => setFiles([])}
                      className="text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded flex items-center gap-1"
                    >
                      <X className="w-3 h-3" /> Clear All
                    </button>
                  </div>
                  <div className="max-h-48 overflow-y-auto custom-scrollbar space-y-2">
                    {files.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center bg-gray-900 p-3 rounded border border-gray-600"
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <FileText className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                          <span className="text-sm text-gray-200 truncate">
                            {file.name}
                          </span>
                        </div>
                        <button
                          onClick={() => removeFile(idx)}
                          className="text-gray-500 hover:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* --- TEXT INPUT PANEL --- */}
          {mode === 'text' && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <textarea
                rows={12}
                className="w-full bg-gray-900 border border-gray-600 text-gray-300 rounded-lg p-3 font-sans focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-y"
                placeholder="Start typing or paste your text here..."
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
              ></textarea>
            </div>
          )}

          {/* --- FORMATTING OPTIONS --- */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Language Selector */}
            <div className="relative" ref={langDropdownRef}>
              <label className="block mb-2 text-sm font-medium text-gray-300">
                Select Language
              </label>
              <button
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2.5 text-left flex justify-between items-center text-sm"
              >
                <span className="truncate">{settings.language}</span>
                <ChevronDown className="w-4 h-4" />
              </button>

              {isLangOpen && (
                <div className="absolute z-10 w-full bg-gray-800 border border-gray-600 rounded-lg mt-1 max-h-60 overflow-hidden shadow-xl flex flex-col">
                  <div className="p-2 border-b border-gray-700 bg-gray-800 sticky top-0">
                    <input
                      type="text"
                      className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1 text-sm focus:outline-none focus:border-indigo-500"
                      placeholder="Search..."
                      value={langSearch}
                      onChange={(e) => setLangSearch(e.target.value)}
                      autoFocus
                    />
                  </div>
                  <div className="overflow-y-auto flex-1 p-1">
                    {filteredLanguages.map((lang) => (
                      <div
                        key={lang}
                        onClick={() => {
                          setSettings({ ...settings, language: lang });
                          setIsLangOpen(false);
                          setLangSearch('');
                        }}
                        className="px-3 py-2 hover:bg-gray-700 cursor-pointer text-sm text-gray-300 rounded flex justify-between items-center"
                      >
                        {lang}
                        {settings.language === lang && (
                          <Check className="w-3 h-3 text-indigo-400" />
                        )}
                      </div>
                    ))}
                    {filteredLanguages.length === 0 && (
                      <div className="px-3 py-2 text-gray-500 text-sm">
                        No language found
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Font Size */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-300">
                Font Size
              </label>
              <input
                type="number"
                value={settings.fontSize}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    fontSize: parseInt(e.target.value) || 12,
                  })
                }
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2.5 text-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Page Size */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-300">
                Page Size
              </label>
              <select
                value={settings.pageSize}
                onChange={(e) =>
                  setSettings({ ...settings, pageSize: e.target.value })
                }
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2.5 text-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                <optgroup label="ISO A Series">
                  <option value="A4">A4 (210 x 297 mm)</option>
                  <option value="A3">A3 (297 x 420 mm)</option>
                  <option value="A5">A5 (148 x 210 mm)</option>
                </optgroup>
                <optgroup label="North American">
                  <option value="Letter">Letter (8.5 x 11 in)</option>
                  <option value="Legal">Legal (8.5 x 14 in)</option>
                </optgroup>
                <option value="Custom">Custom Size</option>
              </select>
            </div>

            {/* Orientation */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-300">
                Orientation
              </label>
              <select
                value={settings.orientation}
                onChange={(e) =>
                  setSettings({ ...settings, orientation: e.target.value })
                }
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2.5 text-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="portrait">Portrait</option>
                <option value="landscape">Landscape</option>
              </select>
            </div>

            {/* Custom Size Inputs (Conditional) */}
            {settings.pageSize === 'Custom' && (
              <div className="col-span-2 grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-1">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">
                    Width (pt)
                  </label>
                  <input
                    type="number"
                    value={settings.customWidth}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        customWidth: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">
                    Height (pt)
                  </label>
                  <input
                    type="number"
                    value={settings.customHeight}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        customHeight: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-2.5 text-sm"
                  />
                </div>
              </div>
            )}

            {/* Text Color */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-300">
                Text Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={settings.textColor}
                  onChange={(e) =>
                    setSettings({ ...settings, textColor: e.target.value })
                  }
                  className="w-full h-[42px] bg-gray-700 border border-gray-600 rounded-lg p-1 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* --- PROCESS BUTTON --- */}
          <button
            onClick={handleCreatePdf}
            className="w-full mt-8 py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-lg transition-all shadow-lg flex justify-center items-center gap-2"
          >
            Create PDF
          </button>
        </div>
      </div>

      {/* --- LOADER MODAL --- */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 p-8 rounded-xl flex flex-col items-center gap-4 border border-gray-700 shadow-2xl">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-white text-lg font-medium animate-pulse">
              Processing...
            </p>
          </div>
        </div>
      )}

      {/* --- FOOTER --- */}
      <footer className="mt-auto border-t-2 border-gray-700 py-8 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center md:text-left">
            <div className="mb-8 md:mb-0">
              <div className="flex items-center justify-center md:justify-start mb-4">
                <img
                  src="/images/favicon.svg"
                  alt="Bento PDF Logo"
                  className="h-10 w-10 mr-3"
                />
                <span className="text-xl font-bold text-white">BentoPDF</span>
              </div>
              <p className="text-gray-400 text-sm">
                &copy; 2025 BentoPDF. All rights reserved.
              </p>
              <p className="text-gray-500 text-xs mt-2">Version 1.0.0</p>
            </div>
            {/* Links Sections... (Simplified for brevity, same as previous files) */}
            <div>
              <h3 className="font-bold text-white mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/about" className="hover:text-indigo-400">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-indigo-400">
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-white mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/terms" className="hover:text-indigo-400">
                    Terms
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-indigo-400">
                    Privacy
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-white mb-4">Follow Us</h3>
              <div className="flex justify-center md:justify-start space-x-4 text-gray-400">
                <a href="#" className="hover:text-indigo-400">
                  <Instagram className="w-6 h-6" />
                </a>
                <a href="#" className="hover:text-indigo-400">
                  <Linkedin className="w-6 h-6" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
