'use client';

import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Menu,
  X as XIcon,
  Instagram,
  Linkedin,
  Github,
  Twitter,
} from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-300 antialiased font-sans flex flex-col">
      {/* --- NAVIGATION --- */}
      {/* Idealnya: import Navbar from '@/components/Navbar'; */}
      <Navigation />

      {/* --- MAIN CONTENT --- */}
      <main className="flex-grow container mx-auto p-4 md:p-8">
        {/* Hero Section */}
        <section id="contact-hero" className="text-center py-16 md:py-24">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Get in Touch
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto">
            We'd love to hear from you. Whether you have a question, feedback,
            or a feature request, please don't hesitate to reach out.
          </p>
        </section>

        {/* Email Section */}
        <div className="max-w-2xl mx-auto text-center py-8 bg-gray-800/50 rounded-xl border border-gray-700 backdrop-blur-sm">
          <p className="text-lg text-gray-400">
            <span>You can reach us directly by email at: </span>
            <a
              href="mailto:contact@bentopdf.com"
              className="text-indigo-400 underline hover:text-indigo-300 font-medium transition-colors ml-1"
            >
              contact@bentopdf.com
            </a>
          </p>
        </div>
      </main>

      {/* --- FOOTER --- */}
      {/* Idealnya: import Footer from '@/components/Footer'; */}
      <Footer />
    </div>
  );
}

// --- KOMPONEN LOKAL (Navigation & Footer) ---
// Catatan: Sebaiknya pindahkan ini ke file terpisah di folder components/
// agar tidak duplikat kode di setiap halaman.

function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
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

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Home
            </Link>
            <Link
              href="/about"
              className="text-gray-300 hover:text-white transition-colors"
            >
              About
            </Link>
            <Link href="/contact" className="text-white font-semibold">
              Contact
            </Link>
            <Link
              href="/licensing"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Licensing
            </Link>
            <Link
              href="/tools"
              className="text-gray-300 hover:text-white transition-colors"
            >
              All Tools
            </Link>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {!isMenuOpen ? (
                <Menu className="block h-6 w-6" />
              ) : (
                <XIcon className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden bg-gray-800 border-t border-gray-700">
          <div className="px-2 pt-2 pb-3 space-y-1 text-center">
            <Link
              href="/"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700"
            >
              Home
            </Link>
            <Link
              href="/about"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="block px-3 py-2 rounded-md text-base font-medium text-white bg-gray-900"
            >
              Contact
            </Link>
            <Link
              href="/licensing"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700"
            >
              Licensing
            </Link>
            <Link
              href="/tools"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700"
            >
              All Tools
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

function Footer() {
  return (
    <footer className="mt-16 border-t-2 border-gray-700 py-8 bg-gray-900">
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

          <div>
            <h3 className="font-bold text-white mb-4">Company</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/about" className="hover:text-indigo-400">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-indigo-400">
                  FAQ
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
                <Link href="/licensing" className="hover:text-indigo-400">
                  Licensing
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-indigo-400">
                  Terms and Conditions
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-indigo-400">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-white mb-4">Follow Us</h3>
            <div className="flex justify-center md:justify-start space-x-4">
              <a
                href="https://github.com/alam00000/bentopdf"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-indigo-400"
              >
                <Github className="w-6 h-6" />
              </a>

              {/* Discord Icon */}
              <a
                href="https://discord.gg/Bgq3Ay3f2w"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-indigo-400"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
              </a>

              <a
                href="https://www.instagram.com/thebentopdf/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-indigo-400"
              >
                <Instagram className="w-6 h-6" />
              </a>

              <a
                href="https://www.linkedin.com/company/bentopdf/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-indigo-400"
              >
                <Linkedin className="w-6 h-6" />
              </a>

              <a
                href="https://x.com/BentoPDF"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-indigo-400"
              >
                <Twitter className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
