'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function PrivacyPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-300 font-sans antialiased">
      {/* Navigation */}
      <nav className="bg-gray-800 border-b border-gray-700 sticky top-0 z-30">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div
              className="flex-shrink-0 flex items-center cursor-pointer"
              id="home-logo"
            >
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
            Privacy Policy
          </h1>
          <p className="text-center text-gray-500">
            Last Updated: September 14, 2025
          </p>

          <div className="legal-content mt-12 space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">
                1. Our Commitment to Privacy
              </h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                BentoPDF ("we", "us", "our") is fundamentally a privacy-focused
                service. This Privacy Policy outlines our unwavering commitment
                to protecting your privacy. Our core principle is simple:
                <strong className="text-white ml-1">
                  your files are your files
                </strong>
                . We do not and cannot view, access, store, or share your
                documents. All PDF processing occurs entirely on your own
                computer, within your web browser (client-side).
              </p>

              <h3 className="text-xl font-semibold text-white mb-2 mt-6">
                1.1 The Client-Side Principle
              </h3>
              <p className="text-gray-300 leading-relaxed">
                Unlike other online PDF services, BentoPDF does not upload your
                files to a server for processing. The tools you use are powered
                by JavaScript and WebAssembly libraries that run directly on
                your device. This means your data never leaves your computer,
                providing you with the highest level of privacy and security.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-4">
                2. Information We Do Not Collect
              </h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                Because of our client-side architecture, we are technically
                incapable of collecting the following information:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-300">
                <li>
                  The content of your PDF files or any other documents you use
                  with our tools.
                </li>
                <li>Any personal data contained within your documents.</li>
                <li>Filenames of your documents.</li>
                <li>
                  Any derived information or metadata from your files, beyond
                  what is necessary for the tool to function during your active
                  session (and this is immediately discarded).
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-4">
                3. Information We May Collect (Non-Personal Data)
              </h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                To improve our website and services, we may collect anonymous,
                non-personally identifiable information. This type of data helps
                us understand how users interact with our site, which tools are
                most popular, and how we can improve the user experience. This
                includes:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-300 mb-4">
                <li>
                  <strong>Usage Analytics:</strong> Anonymized data such as
                  which tools are used, how often they are used, and which
                  features are accessed. This is aggregated and cannot be tied
                  back to an individual user or document.
                </li>
                <li>
                  <strong>Performance Data:</strong> Anonymized error reports or
                  performance metrics to help us identify and fix bugs. This
                  data contains no personal information or file content.
                </li>
              </ul>
              <p className="text-gray-300 leading-relaxed">
                We use privacy-respecting analytics platforms for this purpose.
                Specifically, we use{' '}
                <a
                  href="https://simpleanalytics.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-400 hover:underline"
                >
                  Simple Analytics
                </a>{' '}
                to track anonymous visit counts. This means we can see how many
                users visit our site, but{' '}
                <strong className="text-white">
                  we never collect personal information or identify individual
                  users
                </strong>
                . Simple Analytics is fully GDPR-compliant and respects user
                privacy. We do not use tracking cookies for advertising or
                cross-site profiling.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-4">
                4. Third-Party Libraries
              </h2>
              <p className="text-gray-300 leading-relaxed">
                BentoPDF is built using powerful, open-source libraries like
                PDF-lib.js and PDF.js. These libraries are trusted by developers
                worldwide and operate under the same client-side principle.
                While we have vetted these libraries, we encourage you to review
                their respective privacy policies for your own peace of mind.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-4">
                5. Security
              </h2>
              <p className="text-gray-300 leading-relaxed">
                Since your files are never transmitted over the internet to our
                servers, you are protected from potential data breaches during
                transit or storage on a server. The security of your documents
                is in your hands and protected by the security of your own
                computer and web browser.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-4">
                6. Children's Privacy
              </h2>
              <p className="text-gray-300 leading-relaxed">
                Our services are not directed at individuals under the age of
                13. We do not knowingly collect any personal information from
                children. If you believe a child has provided us with personal
                information, please contact us, and we will take steps to delete
                such information.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-4">
                7. Changes to This Privacy Policy
              </h2>
              <p className="text-gray-300 leading-relaxed">
                We may update this Privacy Policy from time to time. We will
                notify you of any changes by posting the new policy on this page
                and updating the "Last Updated" date at the top. You are advised
                to review this Privacy Policy periodically for any changes.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-4">
                8. Contact Us
              </h2>
              <p className="text-gray-300 leading-relaxed">
                If you have any questions about this Privacy Policy, please
                contact us at{' '}
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
                  {/* SVG Instagram */}
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
                  {/* SVG LinkedIn */}
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
