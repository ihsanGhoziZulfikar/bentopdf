export default function Footer() {
    return (
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
              <ul className="space-y-2 text-sm break-words">
                <li><a href="#" className="text-gray-600 hover:text-gray-900">Merge PDF</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900">Split PDF</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900">PNG to PDF</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900">PDF to PNG</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Support & Resources</h3>
              <ul className="space-y-2 text-sm break-words">
                <li><a href="#" className="text-gray-600 hover:text-gray-900">How it works</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900">Help Center</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900">API Documentation</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900">Contact Us</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Company & Legal</h3>
              <ul className="space-y-2 text-sm break-words">
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
    )
}