'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Code2,
  CheckCircle,
  AlertCircle,
  Briefcase,
  Lock,
  ShieldCheck,
  Zap,
  FileCheck,
  Infinity as InfinityIcon,
  Check,
  ShoppingCart,
  FileText,
  Code,
  CheckCircle2,
  GitBranch,
  XCircle,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

// Komponen Helper untuk Item FAQ
const FaqItem = ({
  question,
  answer,
}: {
  question: string;
  answer: React.ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-left p-6 focus:outline-none"
      >
        <span className="text-lg font-semibold text-white">{question}</span>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>
      <div
        className={`px-6 pb-6 text-gray-400 leading-relaxed transition-all duration-300 ease-in-out ${
          isOpen
            ? 'max-h-96 opacity-100'
            : 'max-h-0 opacity-0 overflow-hidden pb-0'
        }`}
      >
        {answer}
      </div>
    </div>
  );
};

export default function LicensingPage() {
  return (
    <div id="app" className="min-h-screen container mx-auto p-4 md:p-8">
      {/* Hero Section */}
      <section id="licensing-hero" className="text-center py-16 md:py-24">
        <h1 className="text-3xl md:text-6xl font-bold text-white mb-4">
          <span data-i18n="licensing.title">Licensing for </span>
          {/* Pastikan class marker-slanted ada di global css Anda */}
          <span className="marker-slanted text-indigo-500 italic relative px-2">
            BentoPDF
          </span>
        </h1>
        <p
          className="text-lg md:text-xl text-gray-400"
          data-i18n="licensing.subtitle"
        >
          Choose the license that fits your needs.
        </p>
      </section>

      {/* Divider */}
      <div className="border-t border-gray-800 my-8"></div>

      {/* Licensing Options */}
      <section id="licensing-options" className="py-16 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Open Source License */}
          <div className="bg-gray-800 rounded-xl p-8 border border-gray-700 flex flex-col">
            <div className="flex items-center gap-4 mb-6">
              <Code2 className="w-12 h-12 text-green-400 flex-shrink-0" />
              <h2 className="text-3xl font-bold text-white">Open Source</h2>
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed">
              BentoPDF is licensed under the{' '}
              <strong className="text-white">
                GNU Affero General Public License v3.0 (AGPL-3.0)
              </strong>
              . You are free to use, modify, and distribute BentoPDF in your
              open-source projects.
            </p>
            <div className="space-y-4 flex-grow">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-white font-semibold mb-1">Free to Use</h3>
                  <p className="text-gray-400 text-sm">
                    Use BentoPDF for free in open-source projects where you make
                    your source code publicly available.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-white font-semibold mb-1">
                    Modify & Distribute
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Modify the source code and distribute your version, as long
                    as you comply with AGPL-3.0 requirements.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-white font-semibold mb-1">Share Alike</h3>
                  <p className="text-gray-400 text-sm">
                    Any modifications or derivative works must also be licensed
                    under AGPL-3.0 and made publicly available.
                  </p>
                </div>
              </div>
            </div>
            <a
              href="https://github.com/alam00000/bentopdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-8 px-6 py-3 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors text-center"
            >
              View on GitHub
            </a>
          </div>

          {/* Commercial License */}
          <div className="bg-gray-800 rounded-xl p-8 border border-indigo-500 flex flex-col">
            <div className="flex items-center gap-4 mb-6">
              <Briefcase className="w-12 h-12 text-indigo-400 flex-shrink-0" />
              <h2 className="text-3xl font-bold text-white">Commercial</h2>
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed">
              If you want to use BentoPDF in a{' '}
              <strong className="text-white">
                closed-source or proprietary application
              </strong>{' '}
              without sharing your source code, you must purchase a commercial
              license.
            </p>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Lock className="w-6 h-6 text-indigo-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-white font-semibold mb-1">
                    Proprietary Use
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Use BentoPDF in closed-source applications without the
                    obligation to disclose your source code.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-6 h-6 text-indigo-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-white font-semibold mb-1">
                    Enterprise Support
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Get priority support, custom features, and assistance with
                    integration.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Zap className="w-6 h-6 text-indigo-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-white font-semibold mb-1">
                    Early Access to New Features
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Commercial license holders get early access to new features
                    and updates.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FileCheck className="w-6 h-6 text-indigo-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-white font-semibold mb-1">
                    Flexible Terms
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Licensing terms tailored to your business needs and project
                    requirements.
                  </p>
                </div>
              </div>
            </div>

            {/* Pricing Box */}
            <div className="mt-8 bg-gradient-to-r from-indigo-900/40 to-purple-900/40 rounded-lg p-6 border border-indigo-500/50">
              <div className="text-center">
                <div className="inline-block bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-3 animate-pulse">
                  LIMITED TIME OFFER
                </div>
                <p className="text-white text-2xl font-bold mb-2">
                  Lifetime License
                </p>
                <div className="flex items-center justify-center gap-3 mb-3">
                  <span className="text-gray-400 text-2xl line-through">
                    $99
                  </span>
                  <span className="text-indigo-300 text-4xl font-bold">
                    $49
                  </span>
                  <span className="text-lg font-normal text-gray-400">
                    one-time
                  </span>
                </div>
                <p className="text-gray-300 text-sm mb-4">
                  Includes all feature updates forever
                </p>

                {/* Unlimited Usage Info */}
                <div className="bg-indigo-900/30 rounded-lg p-4 mb-4 border border-indigo-500/30">
                  <div className="flex items-start gap-3 text-left">
                    <InfinityIcon className="w-6 h-6 text-indigo-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-white font-semibold text-sm mb-2">
                        Unlimited Usage
                      </h4>
                      <p className="text-gray-300 text-xs leading-relaxed">
                        The BentoPDF commercial license permits use on an{' '}
                        <strong className="text-white">
                          unrestricted, unlimited number of devices, servers,
                          and user machines
                        </strong>{' '}
                        within your organization. There are{' '}
                        <strong className="text-white">
                          no per-user, per-machine, or per-seat limitations
                        </strong>
                        . Once you purchase the license, all your internal users
                        may use BentoPDF through your browser-based system
                        without requiring additional licenses.
                      </p>
                    </div>
                  </div>
                </div>

                <a
                  href="https://ko-fi.com/s/f32ca4cb75"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-8 py-3 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-indigo-500/50 transform hover:scale-105 duration-200"
                >
                  Purchase Lifetime License
                </a>
              </div>
            </div>
            <p className="mt-4 text-sm text-gray-400 italic text-center">
              💡 Custom requests and development are available for separate
              charges.{' '}
              <Link href="/contact" className="text-indigo-400 hover:underline">
                Contact us
              </Link>{' '}
              for details.
            </p>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-gray-800 my-8"></div>

      {/* Comparison Table */}
      <section id="license-comparison" className="py-16 max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-4">
          Do I Need a{' '}
          <span className="text-indigo-500 italic">Commercial License?</span>
        </h2>
        <p className="text-center text-gray-400 mb-12 max-w-3xl mx-auto">
          Use this quick reference chart to determine if your use case requires
          a commercial license.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
            <thead>
              <tr className="bg-gray-700">
                <th className="px-6 py-4 text-left text-white font-semibold border-b border-gray-600">
                  Use Case
                </th>
                <th className="px-6 py-4 text-center text-white font-semibold border-b border-gray-600 w-48">
                  License Required
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {[
                {
                  case: 'Personal use (not hosting as a service)',
                  type: 'AGPL',
                  icon: 'check',
                  color: 'green',
                },
                {
                  case: 'Open-source project with publicly available source code',
                  type: 'AGPL',
                  icon: 'check',
                  color: 'green',
                },
                {
                  case: 'Public website where you share your full modified source code under AGPL',
                  type: 'AGPL',
                  icon: 'check',
                  color: 'green',
                },
                {
                  case: 'Educational/research project with publicly shared code',
                  type: 'AGPL',
                  icon: 'check',
                  color: 'green',
                },
                {
                  case: 'SaaS or web application (closed-source)',
                  type: 'Commercial',
                  icon: 'cart',
                  color: 'red',
                },
                {
                  case: 'Internal company tool/dashboard (source not shared with users)',
                  type: 'Commercial',
                  icon: 'cart',
                  color: 'red',
                },
                {
                  case: 'Commercial product (keeping source code private)',
                  type: 'Commercial',
                  icon: 'cart',
                  color: 'red',
                },
                {
                  case: 'Network service where source code is not accessible to users',
                  type: 'Commercial',
                  icon: 'cart',
                  color: 'red',
                },
                {
                  case: 'Any app where you want to keep modifications private',
                  type: 'Commercial',
                  icon: 'cart',
                  color: 'red',
                },
              ].map((item, index) => (
                <tr
                  key={index}
                  className={`transition-colors ${
                    item.color === 'red'
                      ? 'bg-red-900/10 hover:bg-red-900/20'
                      : 'hover:bg-gray-750'
                  }`}
                >
                  <td
                    className={`px-6 py-4 ${item.color === 'red' ? 'text-gray-300 font-medium' : 'text-gray-300'}`}
                  >
                    {item.case}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${
                        item.color === 'green'
                          ? 'bg-green-900/30 text-green-400'
                          : 'bg-red-900/30 text-red-400'
                      }`}
                    >
                      {item.icon === 'check' ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <ShoppingCart className="w-4 h-4" />
                      )}
                      {item.type} {item.type === 'AGPL' && '(Free)'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-400 text-sm">
            Still not sure?{' '}
            <Link
              href="/contact"
              className="text-indigo-400 hover:underline font-semibold"
            >
              Contact us
            </Link>{' '}
            to discuss your specific use case.
          </p>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-gray-800 my-8"></div>

      {/* AGPL Requirements */}
      <section id="agpl-requirements" className="py-16 max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-12">
          AGPL <span className="text-indigo-500 italic">Requirements</span>
        </h2>
        <div className="bg-gray-800 rounded-xl p-8 border border-gray-700 mb-8">
          <p className="text-gray-300 mb-6 leading-relaxed">
            When using BentoPDF under AGPL-3.0, you must comply with the
            following requirements:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <FileText className="w-6 h-6 text-indigo-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-white font-semibold mb-2">
                  Producer Line & Copyright
                </h3>
                <p className="text-gray-400 text-sm">
                  You should mention our open-source and include AGPL license
                  details in the PDF metadata. You should also retain the
                  producer line in all PDFs created or modified using our
                  open-source.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Code className="w-6 h-6 text-indigo-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-white font-semibold mb-2">
                  Code Modifications
                </h3>
                <p className="text-gray-400 text-sm">
                  Any modifications to our open-source must be disclosed under
                  the AGPL. This includes sharing the modified code with any
                  users interacting with it.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-indigo-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-white font-semibold mb-2">
                  AGPL-Compliant Environments Only
                </h3>
                <p className="text-gray-400 text-sm">
                  Usage of our open-source Community Edition must be limited to
                  AGPL-compliant environments, where all AGPL requirements are
                  fully respected.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <GitBranch className="w-6 h-6 text-indigo-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-white font-semibold mb-2">
                  Source Code Disclosure
                </h3>
                <p className="text-gray-400 text-sm">
                  You cannot deploy our open-source as part of a server-based
                  application or service without disclosing your own
                  application's full source code under AGPL to any users
                  interacting with it.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-gray-800 my-8"></div>

      {/* AGPL Compliance Checklist */}
      <section id="agpl-compliance" className="py-16 max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-12">
          What is{' '}
          <span className="text-indigo-500 italic">AGPL-Compliant?</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Compliant */}
          <div className="bg-green-900/20 border-2 border-green-500/30 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-8 h-8 text-green-400" />
              <h3 className="text-2xl font-bold text-white">AGPL-Compliant</h3>
            </div>
            <ul className="space-y-3">
              {[
                'Open-source projects where you share your full source code publicly',
                "Personal use where you're not distributing or hosting it as a service",
                'Publicly hosted tools where you provide the complete source code (including modifications) under AGPL',
                'Educational or research projects that make all code publicly available',
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300 text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Not Compliant */}
          <div className="bg-red-900/20 border-2 border-red-500/30 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <XCircle className="w-8 h-8 text-red-400" />
              <h3 className="text-2xl font-bold text-white">
                NOT AGPL-Compliant
              </h3>
            </div>
            <ul className="space-y-3">
              {[
                'Proprietary/closed-source SaaS applications',
                'Internal company tools where source code is not shared with users',
                "Commercial products that don't disclose the full source code",
                "Network services that don't provide source code access to users",
                'Any application where you want to keep your source code private',
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <X className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300 text-sm">{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-yellow-400 italic">
              ⚠️ These use cases require a commercial license.
            </p>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-gray-800 my-8"></div>

      {/* FAQ Section */}
      <section id="licensing-faq" className="py-16 max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-12">
          Licensing <span className="text-indigo-500 italic">FAQs</span>
        </h2>
        <div id="faq-accordion" className="space-y-4">
          <FaqItem
            question="Do I need a commercial license if I'm using BentoPDF on my private server or Intranet?"
            answer={
              <>
                Yes. If you are using BentoPDF in a corporate environment
                (intranet, internal dashboards, private servers) and you do not
                wish to release the source code of your internal applications to
                all users (employees) under the AGPL, you need a commercial
                license. The AGPL considers users interacting with the software
                over a network as users entitled to the source code.
              </>
            }
          />
          <FaqItem
            question="Can I use the Open Source version for a commercial project?"
            answer={
              <>
                Yes, but with a strict condition: You must open-source your
                entire commercial application under the AGPL license. If you are
                not willing to share your application's source code publicly,
                you cannot use the Open Source version and must purchase a
                Commercial License.
              </>
            }
          />
          <FaqItem
            question="Is the license fee one-time or recurring?"
            answer={
              <>
                The current Limited Time Offer is a{' '}
                <strong>one-time payment</strong> for a Lifetime License. This
                includes all future updates and versions of BentoPDF without any
                recurring subscription fees.
              </>
            }
          />
        </div>
      </section>
    </div>
  );
}
