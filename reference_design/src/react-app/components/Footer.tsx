import { Facebook, Instagram, Twitter } from "lucide-react";

const LOGO_URL = "https://019c6f48-94c7-7a6c-843e-4138d52fc944.mochausercontent.com/ifslogop.png";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <img 
                src={LOGO_URL} 
                alt="IFS Seeds Logo" 
                className="h-14 w-auto object-contain bg-white rounded-lg p-1"
              />
            </div>
            <p className="text-gray-400 text-sm max-w-md">
              Your trusted source for quality seeds. Empowering farmers with innovative 
              seeds for higher yields, lower costs, and a prosperous future.
            </p>
            <div className="flex gap-4 mt-6">
              <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-green-600 rounded-lg flex items-center justify-center transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-green-600 rounded-lg flex items-center justify-center transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-green-600 rounded-lg flex items-center justify-center transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-3">
              <li><a href="#home" className="text-gray-400 hover:text-green-400 transition-colors text-sm">Home</a></li>
              <li><a href="#products" className="text-gray-400 hover:text-green-400 transition-colors text-sm">Products</a></li>
              <li><a href="#about" className="text-gray-400 hover:text-green-400 transition-colors text-sm">About Us</a></li>
              <li><a href="#contact" className="text-gray-400 hover:text-green-400 transition-colors text-sm">Contact</a></li>
            </ul>
          </div>

          {/* Seeds */}
          <div>
            <h4 className="font-semibold text-white mb-4">Our Seeds</h4>
            <ul className="space-y-3">
              <li><a href="#products" className="text-gray-400 hover:text-green-400 transition-colors text-sm">Chickpea Seeds</a></li>
              <li><a href="#products" className="text-gray-400 hover:text-green-400 transition-colors text-sm">Mustard Seeds</a></li>
              <li><a href="#products" className="text-gray-400 hover:text-green-400 transition-colors text-sm">Cluster Bean Seeds</a></li>
              <li><a href="#products" className="text-gray-400 hover:text-green-400 transition-colors text-sm">More Varieties</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} IFS Seeds. All rights reserved.
          </p>
          <p className="text-gray-500 text-xs">
            Sikar, Rajasthan, India | First Choice of Farmers
          </p>
        </div>
      </div>
    </footer>
  );
}
