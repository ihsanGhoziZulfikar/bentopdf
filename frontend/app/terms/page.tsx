'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image'; // Opsional: Gunakan jika sudah config next.config.js, atau pakai <img> biasa

export default function TermsPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-300 font-sans antialiased">
      {/* NOTE: Idealnya Navbar dan Footer dipindahkan ke file layout.tsx 
        agar tidak perlu ditulis ulang di setiap halaman.
      */}

      {/* Navigation */}
      <nav className="bg-gray-800 border-b border-gray-700 sticky top-0 z-30">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div
              className="flex-shrink-0 flex items-center cursor-pointer"
              id="home-logo"
            >
              {/* Menggunakan <img> standar agar aset langsung jalan. Bisa diganti <Image> next/image */}
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
                className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Home
              </Link>
              <Link
                href="/about"
                className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                About
              </Link>
              <Link
                href="/contact"
                className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Contact
              </Link>
              <Link
                href="/licensing"
                className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Licensing
              </Link>
              <Link
                href="/#tools-header"
                className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                All Tools
              </Link>
            </div>

            {/* Mobile Hamburger Button */}
            <div className="md:hidden flex items-center">
              <button
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 transition-colors"
                aria-controls="mobile-menu"
                aria-expanded={isMobileMenuOpen}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <span className="sr-only">Open main menu</span>
                {/* Hamburger Icon */}
                <svg
                  className={`${isMobileMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
                {/* Close Icon */}
                <svg
                  className={`${isMobileMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div
            id="mobile-menu"
            className="md:hidden bg-gray-800 border-t border-gray-700"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 text-center">
              <Link
                href="/"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
              >
                Home
              </Link>
              <Link
                href="/about"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
              >
                About
              </Link>
              <Link
                href="/contact"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
              >
                Contact
              </Link>
              <Link
                href="/licensing"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
              >
                Licensing
              </Link>
              <Link
                href="/#tools-header"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
              >
                All Tools
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <div id="app" className="container mx-auto p-4 md:p-8">
        <section className="max-w-4xl mx-auto py-12">
          <h1 className="text-4xl md:text-5xl font-bold text-center text-white mb-4">
            Terms and Conditions
          </h1>
          <p className="text-center text-gray-500">
            Last Updated: September 14, 2025
          </p>

          <div className="legal-content mt-12 space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">
                1. Acceptance of Terms
              </h2>
              <p className="text-gray-300 leading-relaxed">
                By accessing and using Bentopdf (the "Service"), you accept and
                agree to be bound by the terms and provision of this agreement.
                If you do not agree to abide by these terms, please do not use
                this service.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-4">
                2. Description of Service
              </h2>
              <p className="text-gray-300 leading-relaxed">
                Bentopdf provides a suite of client-side tools for processing
                and manipulating Portable Document Format (PDF) files. All
                operations performed by the Service are executed locally within
                your web browser.
                <strong className="text-white ml-1">
                  No files or data are uploaded to or stored on our servers.
                </strong>
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-4">
                3. User Conduct and Responsibilities
              </h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                You are solely responsible for the content of the files you
                process with our Service. You agree not to use the Service for
                any unlawful purpose, including but not limited to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-300">
                <li>
                  Processing any material that infringes on the copyright,
                  trademark, or intellectual property rights of others.
                </li>
                <li>
                  Processing any material that is defamatory, libelous, obscene,
                  or otherwise illegal.
                </li>
                <li>
                  Attempting to reverse-engineer, decompile, or otherwise
                  disrupt the functionality of the Service.
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-4">
                4. Disclaimer of Warranties
              </h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                The Service is provided "as is" and "as available" without any
                warranties of any kind, express or implied. We do not warrant
                that the service will be error-free, uninterrupted, or that the
                results obtained from using the tools will be accurate,
                complete, or reliable. You acknowledge that you use the Service
                at your own risk.
              </p>
              <p className="text-gray-300 leading-relaxed">
                Specifically, we do not guarantee that file conversions,
                compressions, or modifications will be perfect. Data loss or
                corruption, while unlikely, is a possibility. It is your
                responsibility to maintain backups of your original files.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-4">
                5. Limitation of Liability
              </h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                To the fullest extent permitted by applicable law, in no event
                shall Bentopdf, its developers, or its affiliates be liable for
                any indirect, incidental, special, consequential, or punitive
                damages, including but not limited to, loss of profits, data,
                use, goodwill, or other intangible losses, resulting from:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-300 mb-4">
                <li>
                  Your access to or use of or inability to access or use the
                  Service.
                </li>
                <li>
                  Any conduct or content of any third party on the Service.
                </li>
                <li>Any content obtained from the Service.</li>
                <li>
                  Unauthorized access, use, or alteration of your transmissions
                  or content.
                </li>
              </ul>
              <p className="text-gray-300 leading-relaxed">
                Our total liability to you for any and all claims arising out of
                your use of this free service shall not exceed the amount of
                zero dollars ($0.00).
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-4">
                6. Intellectual Property
              </h2>
              <p className="text-gray-300 leading-relaxed">
                The visual interfaces, graphics, design, compilation,
                information, computer code, products, software, services, and
                all other elements of the Service provided by Bentopdf are
                protected by intellectual property and other laws. All materials
                contained on the Service are the property of Bentopdf or our
                third-party licensors.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-4">
                7. Governing Law
              </h2>
              <p className="text-gray-300 leading-relaxed">
                These Terms shall be governed and construed in accordance with
                the laws of India, without regard to its conflict of law
                provisions.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-4">
                8. Changes to Terms
              </h2>
              <p className="text-gray-300 leading-relaxed">
                We reserve the right, at our sole discretion, to modify or
                replace these Terms at any time. We will provide notice of
                changes by updating the "Last Updated" date at the top of this
                page. By continuing to access or use our Service after those
                revisions become effective, you agree to be bound by the revised
                terms.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-4">
                9. Contact Us
              </h2>
              <p className="text-gray-300 leading-relaxed">
                If you have any questions about these Terms, please contact us
                at{' '}
                <a
                  href="mailto:contact@bentopdf.com"
                  className="text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  contact@bentopdf.com
                </a>
                .
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="mt-16 border-t-2 border-gray-700 py-8">
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
              <p className="text-gray-500 text-xs mt-2">
                Version <span id="app-version">1.0.0</span>
              </p>
            </div>

            <div>
              <h3 className="font-bold text-white mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link
                    href="/about"
                    className="hover:text-indigo-400 transition-colors"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/faq"
                    className="hover:text-indigo-400 transition-colors"
                  >
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="hover:text-indigo-400 transition-colors"
                  >
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-white mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link
                    href="/licensing"
                    className="hover:text-indigo-400 transition-colors"
                  >
                    Licensing
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="hover:text-indigo-400 transition-colors"
                  >
                    Terms and Conditions
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="hover:text-indigo-400 transition-colors"
                  >
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
                  className="text-gray-400 hover:text-indigo-400 transition-colors"
                  title="GitHub"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
                <a
                  href="https://discord.gg/Bgq3Ay3f2w"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-indigo-400 transition-colors"
                  title="Discord"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
                  </svg>
                </a>
                <a
                  href="https://www.instagram.com/thebentopdf/"
                  className="text-gray-400 hover:text-indigo-400 transition-colors"
                  title="Instagram"
                >
                  {/* Replaced <i data-lucide="instagram"></i> with SVG */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-instagram"
                  >
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                  </svg>
                </a>
                <a
                  href="https://www.linkedin.com/company/bentopdf/"
                  className="text-gray-400 hover:text-indigo-400 transition-colors"
                  title="LinkedIn"
                >
                  {/* Replaced <i data-lucide="linkedin"></i> with SVG */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-linkedin"
                  >
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                    <rect width="4" height="12" x="2" y="9" />
                    <circle cx="4" cy="4" r="2" />
                  </svg>
                </a>
                <a
                  href="https://x.com/BentoPDF"
                  className="text-gray-400 hover:text-indigo-400 transition-colors"
                  title="X (Twitter)"
                >
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
