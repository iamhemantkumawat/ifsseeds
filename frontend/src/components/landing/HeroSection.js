import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Leaf, Award, TrendingUp, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SITE_ASSETS, toAssetUrl } from "@/lib/assets";

export default function HeroSection() {
  return (
    <section id="home" className="relative min-h-screen flex items-center pt-16 overflow-hidden" data-testid="hero-section">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-stone-50 to-amber-50">
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2322c55e' fill-opacity='0.12'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-lime-100 rounded-full text-lime-800 text-sm font-medium">
              <Award className="w-4 h-4" />
              Trusted by 5000+ Farmers since 2021
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-stone-900 leading-none tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Your Trusted Source for{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-700 to-green-500">
                Quality Seeds
              </span>
            </h1>

            <p className="text-lg md:text-xl text-stone-600 leading-relaxed max-w-xl">
              Empowering farmers with innovative seeds for higher yields, lower costs, 
              and a prosperous future. Premium varieties for Gujarat and Rajasthan.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/shop">
                <Button 
                  size="lg" 
                  className="bg-green-700 hover:bg-green-800 text-white shadow-lg shadow-green-700/30 group rounded-full px-8"
                  data-testid="browse-seeds-btn"
                >
                  Browse Seeds
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <a href="#contact">
                <Button size="lg" variant="outline" className="border-2 border-green-700 text-green-700 hover:bg-green-50 rounded-full px-8">
                  Contact Us
                </Button>
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-stone-200">
              <div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <span className="text-2xl font-bold text-stone-900" style={{ fontFamily: 'Syne, sans-serif' }}>25%</span>
                </div>
                <p className="text-sm text-stone-500 mt-1">Higher Yields</p>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Leaf className="w-5 h-5 text-green-600" />
                  <span className="text-2xl font-bold text-stone-900" style={{ fontFamily: 'Syne, sans-serif' }}>10+</span>
                </div>
                <p className="text-sm text-stone-500 mt-1">Seed Varieties</p>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-green-600" />
                  <span className="text-2xl font-bold text-stone-900" style={{ fontFamily: 'Syne, sans-serif' }}>98%</span>
                </div>
                <p className="text-sm text-stone-500 mt-1">Germination Rate</p>
              </div>
            </div>
          </div>

          {/* Right Content - Product Showcase */}
          <div className="relative animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="relative z-10">
              <img
                src={toAssetUrl(SITE_ASSETS.heroMain)}
                alt="IFS Seeds Product"
                className="w-full max-w-md mx-auto rounded-2xl shadow-2xl shadow-green-900/20 hover:-translate-y-2 transition-transform duration-500"
              />
              
              {/* Floating Badge */}
              <div className="absolute -top-4 -right-4 bg-amber-500 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg animate-bounce">
                Up to 50% OFF
              </div>

              {/* Floating Card */}
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl border border-stone-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-lime-100 rounded-full flex items-center justify-center">
                    <Leaf className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-stone-900">Premium Quality</p>
                    <p className="text-xs text-stone-500">Lab Tested Seeds</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Background Decoration */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-br from-green-200 to-amber-200 rounded-full blur-3xl opacity-50 -z-10" />
          </div>
        </div>
      </div>
    </section>
  );
}
