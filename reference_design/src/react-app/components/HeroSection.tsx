import { ArrowRight, Leaf, Award, TrendingUp } from "lucide-react";
import { Button } from "@/react-app/components/ui/button";

export default function HeroSection() {
  return (
    <section id="home" className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-white to-amber-50">
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2322c55e' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full text-green-700 text-sm font-medium">
              <Award className="w-4 h-4" />
              Trusted by 5000+ Farmers since 2021
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Your Trusted Source for{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-green-500">
                Quality Seeds
              </span>
            </h1>

            <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-xl">
              Empowering farmers with innovative seeds for higher yields, lower costs, 
              and a prosperous future. Premium varieties for Gujarat and Rajasthan.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/30 group">
                Browse Seeds
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="outline" className="border-green-600 text-green-700 hover:bg-green-50">
                Contact Us
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-gray-200">
              <div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <span className="text-2xl font-bold text-gray-900">25%</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">Higher Yields</p>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Leaf className="w-5 h-5 text-green-600" />
                  <span className="text-2xl font-bold text-gray-900">10+</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">Seed Varieties</p>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-green-600" />
                  <span className="text-2xl font-bold text-gray-900">98%</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">Germination Rate</p>
              </div>
            </div>
          </div>

          {/* Right Content - Product Showcase */}
          <div className="relative">
            <div className="relative z-10">
              <img
                src="https://ifsseeds.com/wp-content/uploads/2023/05/manish-stall10.jpg"
                alt="IFS Seeds Product"
                className="w-full max-w-md mx-auto rounded-2xl shadow-2xl shadow-green-900/20"
              />
              
              {/* Floating Badge */}
              <div className="absolute -top-4 -right-4 bg-amber-400 text-amber-900 px-4 py-2 rounded-full font-bold text-sm shadow-lg animate-pulse">
                Up to 50% OFF
              </div>

              {/* Floating Card */}
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-xl border border-green-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Leaf className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Premium Quality</p>
                    <p className="text-xs text-gray-500">Lab Tested Seeds</p>
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
