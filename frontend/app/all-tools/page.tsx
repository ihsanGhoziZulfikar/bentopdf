'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '../components/navbar';
import Footer from '../components/footer/main-footer';
import { ChevronRight, FileImage, FileType, Globe, Code, FileText, Image, File, Folder, FilePlus, Scissors, Archive, Wrench, Edit, PenTool, Droplet, Lock, Unlock, Scan, FileSearch, Hash } from 'lucide-react';

interface ToolCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  color?: string;
  link: string;
}

const ToolCard: React.FC<ToolCardProps> = ({ icon: Icon, title, description, color, link }) => {
  const colorClass = `bg-${color}-100 text-${color}-600`;
  return (
    <Link href={link}>
      <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all cursor-pointer group border border-gray-100">
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-14 h-14 ${colorClass} rounded-xl flex items-center justify-center flex-shrink-0`}>
            <Icon className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-gray-900 text-base flex-1">
            {title}
          </h3>
          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform flex-shrink-0" />
        </div>
        <p className="text-sm text-gray-600 leading-relaxed">
          {description}
        </p>
      </div>
    </Link>
  );
};

export default function BentoPDFTools() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Navbar />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Explore Available <span className="text-blue-600">Tools</span>
          </h1>
          <p className="text-gray-600 mb-6">Choose a tool to begin working with your files</p>
          <div className="max-w-md mx-auto">
            <input
              type="text"
              placeholder="Search"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Convert from PDF */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Convert from PDF</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
            <ToolCard icon={FileImage} title="PDF to JPG" description="Convert PDF pages into JPG images that you can share, post, and use on any device." color="blue" link="/convert-pdf/pdf-to-jpg" />
            <ToolCard icon={Image} title="PDF to PNG" description="Export PDF pages as high-quality PNG images with better clarity and transparency support." color="blue" link="/convert-pdf/pdf-to-png" />
            <ToolCard icon={Globe} title="PDF to WebP" description="Convert PDF pages to WebP format with optimized image quality." color="blue" link="/convert-pdf/pdf-to-webp" />
            <ToolCard icon={Code} title="PDF to SVG" description="Transform PDF content into scalable vector graphics for design and vector-based editing." color="blue" link="/convert-pdf/pdf-to-svg" />
            <ToolCard icon={FileImage} title="PDF to BMP" description="Convert PDF pages into BMP images for high detail image output." color="blue" link="/convert-pdf/pdf-to-bmp" />
            <ToolCard icon={FileImage} title="PDF to HEIC" description="Convert PDF pages into HEIC format for efficient and modern image compression." color="blue" link="/convert-pdf/pdf-to-heic" />
            <ToolCard icon={FileType} title="PDF to TIFF" description="Export PDF pages as TIFF files, ideal for high-quality professional workflows." color="blue" link="/convert-pdf/pdf-to-tiff" />
            <ToolCard icon={FileText} title="PDF to Text" description="Extract readable text from PDF files for editing, copying, or analysis." color="blue" link="/convert-pdf/pdf-to-text" />
            <ToolCard icon={Code} title="PDF to JSON" description="Extract readable text from PDF into a structured and readable JSON document." color="blue" link="/convert-pdf/pdf-to-json" />
            <ToolCard icon={File} title="PDF to Word" description="Turn PDF documents into editable Word files to change layout and content effectively." color="blue" link="/convert-pdf/pdf-to-word" />
          </div>
        </section>

        {/* Convert to PDF */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Convert to PDF</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
            <ToolCard icon={FileImage} title="JPG to PDF" description="Combine JPG images into a single, well-structured PDF document." color="orange" link="/convert-pdf/jpg-to-pdf" />
            <ToolCard icon={Image} title="PNG to PDF" description="Convert PNG images into a PDF with high-quality and transparency." color="orange" link="/convert-pdf/png-to-pdf" />
            <ToolCard icon={Globe} title="WebP to PDF" description="Turn WebP images into PDF format for easier sharing and document archiving." color="orange" link="/convert-pdf/webp-to-pdf" />
            <ToolCard icon={Code} title="SVG to PDF" description="Convert SVG vector graphics into PDF files without losing sharpness or quality." color="orange" link="/convert-pdf/svg-to-pdf" />
            <ToolCard icon={FileImage} title="BMP to PDF" description="Transform BMP images into PDF format with full image detail preservation." color="orange" link="/convert-pdf/bmp-to-pdf" />
            <ToolCard icon={FileImage} title="HEIC to PDF" description="Convert HEIC images into PDF for broader compatibility across devices and platforms." color="orange" link="/convert-pdf/heic-to-pdf" />
            <ToolCard icon={FileType} title="TIFF to PDF" description="Transform TIFF images into PDF for broader compatibility across devices and platforms." color="orange" link="/convert-pdf/tiff-to-pdf" />
            <ToolCard icon={FileText} title="Text to PDF" description="Convert plain text documents directly from text files into clean and readable formatting." color="orange" link="/convert-pdf/text-to-pdf" />
            <ToolCard icon={Code} title="JSON to PDF" description="Transform JSON data into a structured and readable PDF document." color="orange" link="/convert-pdf/json-to-pdf" />
            <ToolCard icon={File} title="Word to PDF" description="Convert Word documents into PDF files for secure and consistent document sharing." color="orange" link="/convert-pdf/word-to-pdf" />
          </div>
        </section>

        {/* Organize PDF */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Organize PDF</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
            <ToolCard icon={FilePlus} title="Merge PDF" description="Combine multiple PDF files into a single, well-organized document." color="red" link="/merge-pdf" />
            <ToolCard icon={Scissors} title="Split PDF" description="Separate a PDF file into smaller files—extract the pages you choose." color="red" link="/split-pdf" />
            <ToolCard icon={Archive} title="Compress PDF" description="Reduce PDF file size while maintaining readability and quality." color="red" link="/compress-pdf" />
            <ToolCard icon={Wrench} title="Repair PDF" description="Reduce PDF file size while maintaining readability and quality." color="red" link="/repair-pdf" />
          </div>
        </section>

        {/* Edit PDF */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit PDF</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
            <ToolCard icon={Edit} title="PDF Editor" description="Modify, annotate, redact, comment, add shapes/images, reorder, and view PDFs." color="green" link="/pdf-editor" />
            <ToolCard icon={PenTool} title="Sign PDF" description="Add electronic signatures to PDF documents quickly and securely." color="green" link="/sign-pdf" />
            <ToolCard icon={Droplet} title="Watermark Tiling" description="Insert text or image watermarks to protect and brand your PDF files." color="green" link="/watermark-tiling" />
          </div>
        </section>

        {/* Security PDF */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Security PDF</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
            <ToolCard icon={Lock} title="Encrypt PDF" description="Protect PDF files with a password for secure and restricted access." color="blue" link="/encrypt-pdf" />
            <ToolCard icon={Unlock} title="Decrypt PDF" description="Remove password protection from PDF files when permitted." color="blue" link="/decrypt-pdf" />
          </div>
        </section>

        {/* Analyze PDF */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Analyze PDF</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
            <ToolCard icon={Scan} title="OCR PDF" description="Extract accurate text from scanned or image-based PDF files." color="orange" link="/ocr-pdf" />
            <ToolCard icon={FileSearch} title="Summarize PDF" description="Generate a concise summary to quickly understand PDF content." color="orange" link="/summarize-pdf" />
            <ToolCard icon={Hash} title="Word Count PDF" description="Quickly view the total word count of your PDF." color="orange" link="/word-count-pdf" />
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}