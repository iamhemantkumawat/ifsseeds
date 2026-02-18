import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Filter, ShoppingCart, Eye, Search, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { API, useCart } from "../App";
import Navbar from "../components/landing/Navbar";
import Footer from "../components/landing/Footer";
import CartSidebar from "../components/landing/CartSidebar";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ShopPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(["All"]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [loading, setLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { cartCount, addToCart } = useCart();

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

  const filteredProducts = products
    .filter(p => activeCategory === "All" || p.category === activeCategory)
    .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                 p.variety.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return (a.variants?.[0]?.price || 0) - (b.variants?.[0]?.price || 0);
        case "price-high":
          return (b.variants?.[0]?.price || 0) - (a.variants?.[0]?.price || 0);
        case "discount":
          const discA = a.variants?.[0] ? (1 - a.variants[0].price / a.variants[0].original_price) : 0;
          const discB = b.variants?.[0] ? (1 - b.variants[0].price / b.variants[0].original_price) : 0;
          return discB - discA;
        default:
          return a.name.localeCompare(b.name);
      }
    });

  const handleAddToCart = (product) => {
    if (product.variants && product.variants.length > 0) {
      addToCart(product, product.variants[0]);
      toast.success(`${product.name} added to cart!`);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar cartCount={cartCount} onCartClick={() => setIsCartOpen(true)} />
      
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-stone-900 tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Our Products
            </h1>
            <p className="text-stone-600 mt-4 max-w-2xl mx-auto">
              Browse our complete collection of premium quality seeds. 
              All varieties are lab-tested and suited for Gujarat & Rajasthan climate.
            </p>
          </div>

          {/* Filters & Search */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 mb-8">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              {/* Search */}
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                <Input
                  placeholder="Search seeds..."
                  className="pl-10 rounded-xl h-12"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  data-testid="search-input"
                />
              </div>

              {/* Sort */}
              <div className="flex items-center gap-4 w-full md:w-auto">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full md:w-48 rounded-xl h-12" data-testid="sort-select">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name (A-Z)</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="discount">Best Discount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-stone-100">
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
                  data-testid={`shop-category-${category.toLowerCase().replace(' ', '-')}`}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-stone-500 text-lg">No products found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}

function ProductCard({ product, onAddToCart }) {
  const discount = product.variants?.[0] 
    ? Math.round((1 - product.variants[0].price / product.variants[0].original_price) * 100)
    : 0;

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-stone-100 hover:border-green-200">
      {/* Image Container */}
      <div className="relative overflow-hidden aspect-square bg-gradient-to-br from-green-50 to-amber-50">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {discount > 0 && (
          <Badge className="absolute top-3 left-3 bg-red-500 hover:bg-red-600 text-white text-xs font-bold px-2 py-1">
            {discount}% OFF
          </Badge>
        )}

        <Badge variant="secondary" className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-stone-700 text-xs">
          {product.category}
        </Badge>

        <Link
          to={`/product/${product.id}`}
          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
        >
          <Button variant="secondary" size="sm" className="gap-2 rounded-full">
            <Eye className="w-4 h-4" />
            View
          </Button>
        </Link>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div>
          <p className="text-xs text-green-600 font-semibold uppercase tracking-wider mb-1">
            {product.variety}
          </p>
          <Link to={`/product/${product.id}`}>
            <h3 className="text-base font-bold text-stone-900 group-hover:text-green-700 transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>
          <p className="text-sm text-stone-500">{product.variants?.[0]?.weight}</p>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-stone-100">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-stone-900">₹{product.variants?.[0]?.price}</span>
            {product.variants?.[0]?.original_price > product.variants?.[0]?.price && (
              <span className="text-xs text-stone-400 line-through">₹{product.variants?.[0]?.original_price}</span>
            )}
          </div>
          
          <Button
            size="sm"
            className="bg-green-700 hover:bg-green-800 text-white rounded-full px-4 gap-1"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onAddToCart(product);
            }}
            data-testid={`shop-add-to-cart-${product.id}`}
          >
            <ShoppingCart className="w-4 h-4" />
            Add
          </Button>
        </div>
      </div>
    </div>
  );
}
