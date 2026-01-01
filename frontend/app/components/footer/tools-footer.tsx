import Link from 'next/link';

export default function ToolsFooter() {
    return (
        <footer className="bg-white border-t border-gray-200 mt-8 sm:mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-center sm:text-left">
              <img src="/asset/images/logo-bento.svg" alt="logo" className='w-24 sm:w-30' />
              <span className="text-gray-500 text-xs sm:text-sm">
                © 2025 PT. Padepokan Tujuh Sembilan | All rights reserved.
              </span>
            </div>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
              <Link href="#" className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-semibold">
                How it works
              </Link>
              <Link href="#" className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-semibold">
                Help Center
              </Link>
              <Link href="#" className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-semibold">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </footer>
    )
}