import React from "react";
import { Link } from "react-router-dom";
import { Facebook, Instagram, MessageCircle } from "lucide-react";

const LOGO_URL = "https://019c6f48-94c7-7a6c-843e-4138d52fc944.mochausercontent.com/ifslogop.png";
const WHATSAPP_NUMBER = "+919950279664";
const INSTAGRAM_URL = "https://www.instagram.com/ifsseeds";

export default function Footer() {
  const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER.replace(/[^0-9]/g, '')}?text=Hi! I'm interested in IFS Seeds products.`;
  
  return (
    <footer className="bg-stone-900 text-white" data-testid="footer">
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
            <p className="text-stone-400 text-sm max-w-md">
              Your trusted source for quality seeds. Empowering farmers with innovative 
              seeds for higher yields, lower costs, and a prosperous future.
            </p>
            <div className="flex gap-4 mt-6">
              <a href="#" className="w-10 h-10 bg-stone-800 hover:bg-green-600 rounded-xl flex items-center justify-center transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-stone-800 hover:bg-gradient-to-br hover:from-purple-600 hover:to-pink-500 rounded-xl flex items-center justify-center transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-stone-800 hover:bg-green-500 rounded-xl flex items-center justify-center transition-colors">
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>Quick Links</h4>
            <ul className="space-y-3">
              <li><Link to="/" className="text-stone-400 hover:text-green-400 transition-colors text-sm">Home</Link></li>
              <li><Link to="/shop" className="text-stone-400 hover:text-green-400 transition-colors text-sm">Products</Link></li>
              <li><a href="/#about" className="text-stone-400 hover:text-green-400 transition-colors text-sm">About Us</a></li>
              <li><a href="/#contact" className="text-stone-400 hover:text-green-400 transition-colors text-sm">Contact</a></li>
            </ul>
          </div>

          {/* Seeds & Contact */}
          <div>
            <h4 className="font-semibold text-white mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>Contact Us</h4>
            <ul className="space-y-3">
              <li>
                <a 
                  href={whatsappLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-stone-400 hover:text-green-400 transition-colors text-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp: {WHATSAPP_NUMBER}
                </a>
              </li>
              <li>
                <a 
                  href={INSTAGRAM_URL} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-stone-400 hover:text-green-400 transition-colors text-sm"
                >
                  <Instagram className="w-4 h-4" />
                  @ifsseeds
                </a>
              </li>
            </ul>
            <h4 className="font-semibold text-white mb-4 mt-6" style={{ fontFamily: 'Outfit, sans-serif' }}>Our Seeds</h4>
            <ul className="space-y-3">
              <li><Link to="/shop" className="text-stone-400 hover:text-green-400 transition-colors text-sm">Chickpea Seeds</Link></li>
              <li><Link to="/shop" className="text-stone-400 hover:text-green-400 transition-colors text-sm">Mustard Seeds</Link></li>
              <li><Link to="/shop" className="text-stone-400 hover:text-green-400 transition-colors text-sm">Cluster Bean Seeds</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-stone-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-stone-400 text-sm">
            © {new Date().getFullYear()} IFS Seeds. All rights reserved.
          </p>
          <p className="text-stone-500 text-xs">
            Sikar, Rajasthan, India | First Choice of Farmers
          </p>
        </div>
      </div>
    </footer>
  );
}
