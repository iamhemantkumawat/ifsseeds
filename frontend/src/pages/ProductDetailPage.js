import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ShoppingCart, Minus, Plus, Check, ArrowLeft, Truck, Shield, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import axios from "axios";
import { API, useCart } from "../App";
import Navbar from "../components/landing/Navbar";
import Footer from "../components/landing/Footer";
import CartSidebar from "../components/landing/CartSidebar";
import { toast } from "sonner";
import { toAssetUrl } from "@/lib/assets";

export default function ProductDetailPage() {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { cartCount, addToCart } = useCart();

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const res = await axios.get(`${API}/products/${productId}`);
      setProduct(res.data);
      if (res.data.variants?.length > 0) {
        setSelectedVariant(res.data.variants[0]);
      }
    } catch (error) {
      console.error("Failed to fetch product:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (product && selectedVariant) {
      addToCart(product, selectedVariant, quantity);
      toast.success(`${product.name} added to cart!`);
      setIsCartOpen(true);
    }
  };

  const discount = selectedVariant 
    ? Math.round((1 - selectedVariant.price / selectedVariant.original_price) * 100)
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-stone-50">
        <Navbar cartCount={cartCount} onCartClick={() => setIsCartOpen(true)} />
        <div className="pt-24 text-center py-20">
          <h1 className="text-2xl font-bold text-stone-900">Product not found</h1>
          <Link to="/shop">
            <Button className="mt-4 bg-green-700 hover:bg-green-800 rounded-full">
              Back to Shop
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar cartCount={cartCount} onCartClick={() => setIsCartOpen(true)} />
      
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <Link to="/shop" className="inline-flex items-center gap-2 text-stone-600 hover:text-green-700 mb-8">
            <ArrowLeft className="w-4 h-4" />
            Back to Shop
          </Link>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Image */}
            <div className="relative">
              <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-green-50 to-amber-50">
                <img
                  src={toAssetUrl(product.image)}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              {discount > 0 && (
                <Badge className="absolute top-4 left-4 bg-red-500 text-white text-lg font-bold px-4 py-2">
                  {discount}% OFF
                </Badge>
              )}
            </div>

            {/* Details */}
            <div className="space-y-6">
              <div>
                <Badge variant="secondary" className="mb-2">{product.category}</Badge>
                <h1 className="text-3xl md:text-4xl font-bold text-stone-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {product.name}
                </h1>
                <p className="text-green-600 font-semibold mt-1">Variety: {product.variety}</p>
              </div>

              <p className="text-stone-600 leading-relaxed">{product.description}</p>

              {/* Features */}
              <div className="space-y-2">
                <h3 className="font-semibold text-stone-900">Key Features</h3>
                <div className="grid grid-cols-2 gap-2">
                  {product.features?.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-stone-600">
                      <Check className="w-4 h-4 text-green-600" />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>

              {/* Variants */}
              <div className="space-y-3">
                <h3 className="font-semibold text-stone-900">Select Pack Size</h3>
                <div className="flex flex-wrap gap-3">
                  {product.variants?.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant)}
                      className={`px-4 py-3 rounded-xl border-2 transition-all ${
                        selectedVariant?.id === variant.id
                          ? "border-green-600 bg-green-50 text-green-700"
                          : "border-stone-200 hover:border-green-300"
                      }`}
                      data-testid={`variant-${variant.id}`}
                    >
                      <span className="font-semibold">{variant.weight}</span>
                      <span className="ml-2 text-stone-500">₹{variant.price}</span>
                      {variant.stock < 10 && variant.stock > 0 && (
                        <span className="ml-2 text-xs text-amber-600">Only {variant.stock} left</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-stone-900">₹{selectedVariant?.price}</span>
                {selectedVariant?.original_price > selectedVariant?.price && (
                  <span className="text-xl text-stone-400 line-through">₹{selectedVariant?.original_price}</span>
                )}
                {discount > 0 && (
                  <Badge className="bg-green-100 text-green-700">Save ₹{selectedVariant?.original_price - selectedVariant?.price}</Badge>
                )}
              </div>

              {/* Quantity & Add to Cart */}
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-stone-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:bg-stone-100 transition-colors"
                    data-testid="decrease-product-qty"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <span className="w-12 text-center font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-3 hover:bg-stone-100 transition-colors"
                    data-testid="increase-product-qty"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <Button
                  size="lg"
                  className="flex-1 bg-green-700 hover:bg-green-800 text-white rounded-full h-14 text-lg gap-2"
                  onClick={handleAddToCart}
                  disabled={!selectedVariant || selectedVariant.stock === 0}
                  data-testid="add-to-cart-btn"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {selectedVariant?.stock === 0 ? "Out of Stock" : "Add to Cart"}
                </Button>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-stone-200">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2">
                    <Shield className="w-6 h-6 text-green-600" />
                  </div>
                  <span className="text-sm font-medium text-stone-700">Lab Tested</span>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                    <Truck className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-stone-700">Fast Delivery</span>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-2">
                    <Award className="w-6 h-6 text-amber-600" />
                  </div>
                  <span className="text-sm font-medium text-stone-700">Premium Quality</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}
