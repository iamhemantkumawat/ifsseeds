import { useParams, Link } from "react-router";
import { ArrowLeft, ShoppingCart, Check, Truck, Shield, Leaf, Star, Package } from "lucide-react";
import { Button } from "@/react-app/components/ui/button";
import { Badge } from "@/react-app/components/ui/badge";
import Navbar from "@/react-app/components/Navbar";
import Footer from "@/react-app/components/Footer";
import { products } from "@/react-app/data/products";

export default function ProductDetailPage() {
  const { productId } = useParams();
  const product = products.find((p) => p.id === productId);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center pt-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
            <Link to="/">
              <Button className="bg-green-600 hover:bg-green-700">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const relatedProducts = products.filter((p) => p.id !== product.id).slice(0, 2);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-16">
        {/* Breadcrumb */}
        <div className="bg-green-50 border-b border-green-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-2 text-sm">
              <Link to="/" className="text-gray-500 hover:text-green-600 transition-colors">Home</Link>
              <span className="text-gray-400">/</span>
              <Link to="/#products" className="text-gray-500 hover:text-green-600 transition-colors">Products</Link>
              <span className="text-gray-400">/</span>
              <span className="text-green-600 font-medium">{product.name}</span>
            </div>
          </div>
        </div>

        {/* Product Details */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Product Image */}
              <div className="relative">
                <div className="sticky top-24">
                  <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-green-50 to-amber-50 shadow-xl">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full aspect-square object-cover"
                    />
                    
                    {/* Discount Badge */}
                    {product.discount > 0 && (
                      <Badge className="absolute top-6 left-6 bg-red-500 hover:bg-red-600 text-white text-lg font-bold px-4 py-2">
                        {product.discount}% OFF
                      </Badge>
                    )}
                  </div>

                  {/* Trust Badges */}
                  <div className="grid grid-cols-3 gap-4 mt-6">
                    <div className="flex flex-col items-center p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                      <Shield className="w-6 h-6 text-green-600 mb-2" />
                      <span className="text-xs text-gray-600 text-center">Quality Assured</span>
                    </div>
                    <div className="flex flex-col items-center p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                      <Truck className="w-6 h-6 text-green-600 mb-2" />
                      <span className="text-xs text-gray-600 text-center">Fast Delivery</span>
                    </div>
                    <div className="flex flex-col items-center p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                      <Leaf className="w-6 h-6 text-green-600 mb-2" />
                      <span className="text-xs text-gray-600 text-center">Lab Tested</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Info */}
              <div className="space-y-8">
                {/* Header */}
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      {product.category}
                    </Badge>
                    <Badge variant="outline" className="border-amber-300 text-amber-700">
                      Variety: {product.variety}
                    </Badge>
                  </div>
                  
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                    {product.name}
                  </h1>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">Trusted by 500+ farmers</span>
                  </div>
                </div>

                {/* Price */}
                <div className="bg-gradient-to-r from-green-50 to-amber-50 rounded-2xl p-6 border border-green-100">
                  <div className="flex items-baseline gap-4">
                    <span className="text-4xl font-bold text-gray-900">₹{product.price}</span>
                    {product.originalPrice > product.price && (
                      <>
                        <span className="text-xl text-gray-400 line-through">₹{product.originalPrice}</span>
                        <Badge className="bg-red-500 text-white">Save ₹{product.originalPrice - product.price}</Badge>
                      </>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    <Package className="w-4 h-4 inline mr-1" />
                    Pack Size: {product.weight}
                  </p>
                </div>

                {/* Description */}
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-3">Description</h2>
                  <p className="text-gray-600 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                {/* Features */}
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Key Features</h2>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {product.features.map((feature, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 shadow-sm"
                      >
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Check className="w-5 h-5 text-green-600" />
                        </div>
                        <span className="text-gray-700 font-medium">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Growing Info */}
                <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100">
                  <h3 className="font-bold text-amber-900 mb-3">Growing Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-amber-700 font-medium">Season:</span>
                      <span className="text-amber-900 ml-2">Rabi (Winter)</span>
                    </div>
                    <div>
                      <span className="text-amber-700 font-medium">Region:</span>
                      <span className="text-amber-900 ml-2">Gujarat, Rajasthan</span>
                    </div>
                    <div>
                      <span className="text-amber-700 font-medium">Germination:</span>
                      <span className="text-amber-900 ml-2">98%+</span>
                    </div>
                    <div>
                      <span className="text-amber-700 font-medium">Purity:</span>
                      <span className="text-amber-900 ml-2">99%</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    size="lg"
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white gap-2 shadow-lg shadow-green-600/30"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Add to Cart
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="flex-1 border-green-600 text-green-700 hover:bg-green-50"
                  >
                    Buy Now
                  </Button>
                </div>

                {/* Stock Status */}
                <div className="flex items-center gap-2 text-green-600">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  <span className="font-medium">In Stock - Ready to Ship</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="py-12 bg-gradient-to-b from-white to-green-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">You May Also Like</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedProducts.map((relatedProduct) => (
                  <Link
                    key={relatedProduct.id}
                    to={`/product/${relatedProduct.id}`}
                    className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
                  >
                    <div className="aspect-video overflow-hidden bg-gradient-to-br from-green-50 to-amber-50">
                      <img
                        src={relatedProduct.image}
                        alt={relatedProduct.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                        {relatedProduct.name}
                      </h3>
                      <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-xl font-bold text-gray-900">₹{relatedProduct.price}</span>
                        {relatedProduct.originalPrice > relatedProduct.price && (
                          <span className="text-sm text-gray-400 line-through">₹{relatedProduct.originalPrice}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
