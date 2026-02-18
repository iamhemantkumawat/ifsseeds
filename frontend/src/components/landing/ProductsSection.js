import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Filter, ShoppingCart, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import axios from "axios";
import { API } from "../../App";
import { toast } from "sonner";

export default function ProductsSection({ onAddToCart }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(["All"]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API}/products`);
      setProducts(res.data);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API}/categories`);
      setCategories(res.data.categories);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const filteredProducts = activeCategory === "All"
    ? products
    : products.filter(p => p.category === activeCategory);

  const handleAddToCart = (product) => {
    if (product.variants && product.variants.length > 0) {
      onAddToCart(product, product.variants[0]);
      toast.success(`${product.name} added to cart!`);
    }
  };

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-b from-white to-green-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-center">
            <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="products" className="py-20 bg-gradient-to-b from-white to-green-50" data-testid="products-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-green-600 font-semibold text-sm uppercase tracking-wider">Our Products</span>
          <h2 className="text-4xl md:text-5xl font-semibold text-stone-900 mt-2 tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Premium Quality Seeds
          </h2>
          <p className="text-stone-600 mt-4">
            Carefully selected and lab-tested seeds for maximum yield and quality. 
            First choice of farmers across Gujarat and Rajasthan.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
          <Filter className="w-5 h-5 text-stone-400" />
          {categories.map((category) => (
            <Button
              key={category}
              variant={activeCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory(category)}
              className={activeCategory === category 
                ? "bg-green-700 hover:bg-green-800 text-white rounded-full" 
                : "border-stone-300 text-stone-600 hover:border-green-500 hover:text-green-600 rounded-full"
              }
              data-testid={`category-filter-${category.toLowerCase().replace(' ', '-')}`}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
          ))}
        </div>

        {/* Summer Offer Banner */}
        <div className="mt-16 bg-gradient-to-r from-green-700 to-green-800 rounded-2xl p-8 md:p-12 text-white text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-60 h-60 bg-white rounded-full translate-x-1/2 translate-y-1/2" />
          </div>
          <div className="relative z-10">
            <span className="inline-block bg-amber-500 text-white px-4 py-1 rounded-full text-sm font-bold mb-4">
              Limited Time Offer
            </span>
            <h3 className="text-2xl md:text-3xl font-bold mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>Summer Sale - Up to 50% Off!</h3>
            <p className="text-green-100 mb-6 max-w-xl mx-auto">
              Get the best deals on premium seeds. Perfect time to stock up for the upcoming Rabi season.
            </p>
            <Link to="/shop">
              <Button size="lg" className="bg-white text-green-700 hover:bg-green-50 rounded-full px-8">
                Shop Now
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProductCard({ product, onAddToCart }) {
  const discount = product.variants?.[0] 
    ? Math.round((1 - product.variants[0].price / product.variants[0].original_price) * 100)
    : 0;

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-stone-100 hover:border-green-200" data-testid={`product-card-${product.id}`}>
      {/* Image Container */}
      <div className="relative overflow-hidden aspect-square bg-gradient-to-br from-green-50 to-amber-50">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Discount Badge */}
        {discount > 0 && (
          <Badge className="absolute top-4 left-4 bg-red-500 hover:bg-red-600 text-white text-sm font-bold px-3 py-1">
            {discount}% OFF
          </Badge>
        )}

        {/* Category Badge */}
        <Badge variant="secondary" className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-stone-700">
          {product.category}
        </Badge>

        {/* Quick View Overlay */}
        <Link
          to={`/product/${product.id}`}
          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
        >
          <Button variant="secondary" size="sm" className="gap-2 rounded-full">
            <Eye className="w-4 h-4" />
            View Details
          </Button>
        </Link>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Product Info */}
        <div>
          <p className="text-xs text-green-600 font-semibold uppercase tracking-wider mb-1">
            Variety: {product.variety}
          </p>
          <Link to={`/product/${product.id}`}>
            <h3 className="text-lg font-bold text-stone-900 group-hover:text-green-700 transition-colors" style={{ fontFamily: 'Outfit, sans-serif' }}>
              {product.name}
            </h3>
          </Link>
          <p className="text-sm text-stone-500 mt-1">{product.variants?.[0]?.weight}</p>
        </div>

        {/* Features Preview */}
        <div className="flex flex-wrap gap-1">
          {product.features?.slice(0, 2).map((feature, index) => (
            <span
              key={index}
              className="text-xs bg-lime-100 text-lime-800 px-2 py-1 rounded-full"
            >
              {feature}
            </span>
          ))}
        </div>

        {/* Price & Action */}
        <div className="flex items-center justify-between pt-4 border-t border-stone-100">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-stone-900">₹{product.variants?.[0]?.price}</span>
            {product.variants?.[0]?.original_price > product.variants?.[0]?.price && (
              <span className="text-sm text-stone-400 line-through">₹{product.variants?.[0]?.original_price}</span>
            )}
          </div>
          
          <Button
            size="sm"
            className="bg-green-700 hover:bg-green-800 text-white gap-2 shadow-md shadow-green-700/20 rounded-full"
            onClick={() => onAddToCart(product)}
            data-testid={`add-to-cart-${product.id}`}
          >
            <ShoppingCart className="w-4 h-4" />
            Add
          </Button>
        </div>
      </div>
    </div>
  );
}
