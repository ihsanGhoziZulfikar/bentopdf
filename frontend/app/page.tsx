'use client';

import React, { useState } from 'react';
import { ChevronRight, ChevronDown, File, Scissors, Minimize2, Edit, Image, FileText, CircleCheck } from 'lucide-react';

export default function BentoPDFLanding() {
  const [openFaq, setOpenFaq] = useState(0);

  const tools = [
    {
      icon: <File className="w-6 h-6" />,
      title: "Merge PDF",
      description: "Combine multiple PDF files into a single, well-organized document",
      color: "bg-red-100 text-red-600"
    },
    {
      icon: <Scissors className="w-6 h-6" />,
      title: "Split PDF",
      description: "Separate a PDF file into multiple documents by the pages you choose",
      color: "bg-pink-100 text-pink-600"
    },
    {
      icon: <Minimize2 className="w-6 h-6" />,
      title: "Compress PDF",
      description: "Reduce PDF file size while maintaining readable quality",
      color: "bg-red-100 text-red-600"
    },
    {
      icon: <Edit className="w-6 h-6" />,
      title: "PDF Editor",
      description: "Annotate, highlight, redact, comment, add text and images, search and view PDFs",
      color: "bg-green-100 text-green-600"
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: "OCR PDF",
      description: "Extract editable text from scanned or image-based PDF files",
      color: "bg-orange-100 text-orange-600"
    },
    {
      icon: <Image className="w-6 h-6" />,
      title: "JPG to PDF",
      description: "Combine JPG images into a single, well-structured PDF document",
      color: "bg-orange-100 text-orange-600"
    },
    {
      icon: <Image className="w-6 h-6" />,
      title: "PNG to PDF",
      description: "Convert PNG images into a PDF while maintaining image quality and transparency",
      color: "bg-yellow-100 text-yellow-600"
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Word to PDF",
      description: "Convert Word documents into PDF files for secure and consistent document sharing",
      color: "bg-orange-100 text-orange-600"
    },
    {
      icon: <Image className="w-6 h-6" />,
      title: "PDF to JPG",
      description: "Convert PDF pages into JPG images that are easy to view, share, and use on any device",
      color: "bg-blue-100 text-blue-600"
    },
    {
      icon: <Image className="w-6 h-6" />,
      title: "PDF to PNG",
      description: "Export PDF pages as high-quality PNG images with better clarity and transparency support",
      color: "bg-blue-100 text-blue-600"
    }
  ];

  const faqs = [
    {
      question: "Is BentoPDF really free?",
      answer: "Yes, absolutely. All tools on BentoPDF are 100% free to use, with no file limits, no sign-ups, and no watermarks. We believe everyone deserves access to simple, powerful PDF tools without a paywall."
    },
    {
      question: "Are my files secure? Where are they processed?",
      answer: "Your files are processed securely in your browser using client-side technology. This means your documents never leave your device, ensuring complete privacy and security."
    },
    {
      question: "Do you store or track any of my files?",
      answer: "No, we do not store, track, or have access to any of your files. All processing happens locally in your browser, and files are automatically deleted after processing."
    },
    {
      question: "What makes BentoPDF different from other PDF tools?",
      answer: "BentoPDF is completely browser-based, requiring no downloads or installations. It's 100% free with no limitations, works offline, and prioritizes your privacy with client-side processing."
    },
    {
      question: "How does browser-based processing keep me safe?",
      answer: "Browser-based processing means all operations happen on your device. Your files never get uploaded to any server, eliminating the risk of data breaches or unauthorized access."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            {/* Logo - Left */}
            <div className="flex items-center flex-shrink-0">
              <img 
                src="/asset/images/logo-bento.svg" 
                alt="BentoPDF Logo" 
                className="h-8 w-auto"
              />
            </div>
            
            {/* Navigation - Center */}
            <nav className="hidden md:flex items-center space-x-8 absolute left-1/2 transform -translate-x-1/2">
              <button className="text-gray-700 hover:text-blue-600 flex items-center font-medium transition-colors">
                Home 
              </button>
              <a href="/all-tools" className="hidden md:flex items-center text-gray-700 hover:text-blue-600 font-medium transition-colors">
                All Tools <ChevronDown className="w-4 h-4 ml-1" />
              </a>
            </nav>
            
            {/* Language Selector - Right */}
            <button className="text-blue-600 hover:text-blue-700 flex items-center font-medium transition-colors flex-shrink-0">
              English <ChevronDown className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="relative">
            <div className="relativee py-6">
              <img src="/asset/images/logo.svg" alt="logo" />
            </div>
          </div>

          <div>
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              All-in-One <span className="text-blue-600">PDF Toolkit</span>
            </h1>
            <p className="text-xl text-gray-600 mb-6">
              Manage, convert, and edit PDF files easily without installing any software.
            </p>
            <div className="flex flex-wrap gap-4 mb-8">
              <span className="flex bg-blue-100 rounded-2xl p-1 border border-blue-200 items-center text-blue-600 font-semibold">
                <CircleCheck className="w-4 h-4 ml-1 mx-1" />
                No Signups 
              </span>
              <span className="flex bg-blue-100 rounded-2xl p-1 border border-blue-200 items-center text-blue-600 font-semibold">
                <CircleCheck className="w-4 h-4 ml-1 mx-1" />
                Unlimited Use
              </span>
              <span className="flex bg-blue-100 rounded-2xl p-1 border border-blue-200 items-center text-blue-600 font-semibold">
                <CircleCheck className="w-4 h-4 ml-1 mx-1" />
                Works Offline 
              </span>
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-3xl font-semibold flex items-center shadow-lg transition-all">
              Get Started <ChevronRight className="w-5 h-5 ml-2" />
            </button>
          </div>
        </div>
      </section>

      {/* PDF Tools Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">PDF Tools You Need</h2>
          <p className="text-lg text-gray-600">
            All essential tools to create, convert, edit, and manage your PDF files quickly and securely in one place.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {tools.map((tool, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
            >
              <div className={`w-12 h-12 ${tool.color} rounded-lg flex items-center justify-center mb-4`}>
                {tool.icon}
              </div>
              <h3 className="font-bold text-gray-900 mb-2 flex items-center justify-between">
                {tool.title}
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
              </h3>
              <p className="text-sm text-gray-600">{tool.description}</p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <button className="text-blue-600 hover:text-blue-700 font-semibold flex items-center mx-auto border-2 border-blue-600 px-6 py-3 rounded-3xl hover:bg-blue-50 transition-all">
            View All PDF Tools <ChevronRight className="w-5 h-5 ml-2" />
          </button>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
              <p className="text-lg text-gray-600 mb-8">
                Find quick answers to common questions about BentoPDF.
              </p>
              <div className="relative w-[410px] h-[276px]">
                <img src="/asset/images/faq.svg" alt="faq" />
              </div>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-blue-50 rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? -1 : index)}
                    className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-blue-100 transition-colors"
                  >
                    <span className="font-semibold text-gray-900">{faq.question}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-gray-600 transition-transform ${
                        openFaq === index ? 'transform rotate-180' : ''
                      }`}
                    />
                  </button>
                  {openFaq === index && (
                    <div className="px-6 pb-4 text-gray-700">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 text-gray-600 py-12 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex items-center flex-shrink-0">
                  <img 
                    src="/asset/images/logo-bento.svg" 
                    alt="BentoPDF Logo" 
                    className="h-8 w-auto"
                  />
                </div>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">
                A web-based platform to manage and process PDF files quickly, easily, and securely—no installation required.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Features</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-600 hover:text-gray-900">Merge PDF</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900">Split PDF</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900">PNG to PDF</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900">PDF to PNG</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Support & Resources</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-600 hover:text-gray-900">How it works</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900">Help Center</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900">API Documentation</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900">Contact Us</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Company & Legal</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-600 hover:text-gray-900">Terms of Service</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900">Cookie Policy</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-500">
              © 2025 PT. Padepokan Tujuh Sembilan | All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}