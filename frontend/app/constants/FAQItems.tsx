'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

type FAQItemProps = {
  question: string;
  answer: string;
};

export default function FAQItem({ question, answer }: FAQItemProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center text-left p-6"
      >
        <span className="text-lg font-semibold text-white">{question}</span>

        <ChevronDown
          className={`w-6 h-6 text-gray-400 transition-transform duration-300 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          open ? 'max-h-96' : 'max-h-0'
        }`}
      >
        <p className="p-6 pt-0 text-gray-400">{answer}</p>
      </div>
    </div>
  );
}
