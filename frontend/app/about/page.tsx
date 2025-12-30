'use client';

import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';

import {
  Rocket,
  ShieldCheck,
  Zap,
  BadgeDollarSign,
  UserPlus,
  Code2,
  Instagram,
  Linkedin,
  Menu,
  X as XIcon,
  Github,
  Twitter,
} from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-300 antialiased font-sans flex flex-col">
      {/* --- NAVIGATION (Manual Implementation) --- */}
      {/* Sebaiknya dipisah jadi components/Navbar.tsx nanti */}
      <Navigation />

      {/* --- MAIN CONTENT --- */}
      <main className="flex-grow container mx-auto p-4 md:p-8">
        {/* Hero Section */}
        <section id="about-hero" className="text-center py-16 md:py-24">
          <h1 className="text-3xl md:text-6xl font-bold text-white mb-4">
            <span>We believe PDF tools should be </span>
            <span className="relative inline-block">
              {/* Efek marker slanted CSS bisa ditambahkan di globals.css atau inline style */}
              <span className="relative z-10">fast, private, and free.</span>
              <span className="absolute bottom-1 left-0 w-full h-3 bg-indigo-600/50 -rotate-1 -z-0"></span>
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-400">No compromises.</p>
        </section>

        {/* Divider */}
        <div className="w-full h-px bg-gray-800 my-8"></div>

        {/* Mission Section */}
        <section id="mission-section" className="py-16 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <Rocket className="w-16 h-16 text-indigo-400" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Our Mission
            </h2>
            <p className="text-lg text-gray-400 leading-relaxed">
              To provide the most comprehensive PDF toolbox that respects your
              privacy and never asks for payment. We believe essential document
              tools should be accessible to everyone, everywhere, without
              barriers.
            </p>
          </div>
        </section>

        {/* Philosophy Section */}
        <div className="bg-gray-800 rounded-xl p-8 md:p-12 my-16 border border-gray-700 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="text-center md:text-left">
              <span className="text-indigo-400 font-bold uppercase tracking-wider text-sm">
                Our Core Philosophy
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-white mt-2 mb-4">
                Privacy First. Always.
              </h2>
              <p className="text-gray-400 leading-relaxed">
                In an era where data is a commodity, we take a different
                approach. All processing for Bentopdf tools happens locally in
                your browser. This means your files never touch our servers, we
                never see your documents, and we don't track what you do. Your
                documents remain completely and unequivocally private. It's not
                just a feature; it's our foundation.
              </p>
            </div>
            <div className="flex justify-center">
              <div className="relative w-48 h-48 flex items-center justify-center">
                <div className="absolute inset-0 bg-indigo-500 rounded-full opacity-20 animate-pulse"></div>
                <div className="absolute inset-4 bg-indigo-500 rounded-full opacity-30 animate-pulse delay-500"></div>
                <ShieldCheck className="w-32 h-32 text-indigo-400 relative z-10" />
              </div>
            </div>
          </div>
        </div>

        {/* Why BentoPDF Section */}
        <section id="why-Bentopdf" className="py-16">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-12">
            <span>Why </span>
            <span className="relative inline-block">
              <span className="relative z-10">BentoPDF?</span>
              <span className="absolute bottom-1 left-0 w-full h-3 bg-indigo-600/50 -rotate-1 -z-0"></span>
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Feature 1 */}
            <div className="bg-gray-800 p-6 rounded-lg flex items-start gap-4 border border-gray-700 hover:border-indigo-500/50 transition-colors">
              <Zap className="w-10 h-10 text-indigo-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold text-white">
                  Built for Speed
                </h3>
                <p className="text-gray-400 mt-2">
                  No waiting for uploads or downloads to a server. By processing
                  files directly in your browser using modern web technologies
                  like WebAssembly, we offer unparalleled speed for all our
                  tools.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-gray-800 p-6 rounded-lg flex items-start gap-4 border border-gray-700 hover:border-indigo-500/50 transition-colors">
              <BadgeDollarSign className="w-10 h-10 text-indigo-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold text-white">
                  Completely Free
                </h3>
                <p className="text-gray-400 mt-2">
                  No trials, no subscriptions, no hidden fees, and no "premium"
                  features held hostage. We believe powerful PDF tools should be
                  a public utility, not a profit center.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-gray-800 p-6 rounded-lg flex items-start gap-4 border border-gray-700 hover:border-indigo-500/50 transition-colors">
              <UserPlus className="w-10 h-10 text-indigo-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold text-white">
                  No Account Required
                </h3>
                <p className="text-gray-400 mt-2">
                  Start using any tool immediately. We don't need your email, a
                  password, or any personal information. Your workflow should be
                  frictionless and anonymous.
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="bg-gray-800 p-6 rounded-lg flex items-start gap-4 border border-gray-700 hover:border-indigo-500/50 transition-colors">
              <Code2 className="w-10 h-10 text-indigo-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold text-white">
                  Open Source Spirit
                </h3>
                <p className="text-gray-400 mt-2">
                  Built with transparency in mind. We leverage incredible
                  open-source libraries like PDF-lib and PDF.js, and believe in
                  the community-driven effort to make powerful tools accessible
                  to everyone.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="w-full h-px bg-gray-800 my-8"></div>

        {/* CTA Section */}
        <section id="cta-section" className="text-center py-16">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to get started?
          </h2>
          <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
            Join thousands of users who trust BentoPDF for their daily document
            needs. Experience the difference that privacy and performance can
            make.
          </p>
          <Link
            href="/tools"
            className="inline-block px-8 py-3 rounded-full bg-gradient-to-b from-indigo-500 to-indigo-600 text-white font-semibold hover:shadow-xl hover:shadow-indigo-500/30 transition-all duration-200 transform hover:-translate-y-1"
          >
            Explore All Tools
          </Link>
        </section>
      </main>

      {/* --- FOOTER --- */}
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

                {/* Custom SVG for Discord (Lucide doesn't always have brand icons) */}
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
    </div>
  );
}

// Komponen Navigasi Lokal (Agar file bisa langsung jalan tanpa error import)
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
            <Link href="/about" className="text-white font-semibold">
              About
            </Link>
            <Link
              href="/contact"
              className="text-gray-300 hover:text-white transition-colors"
            >
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
              className="block px-3 py-2 rounded-md text-base font-medium text-white bg-gray-900"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700"
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
