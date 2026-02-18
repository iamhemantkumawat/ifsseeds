import { useState } from "react";
import { Filter } from "lucide-react";
import { Button } from "@/react-app/components/ui/button";
import ProductCard from "@/react-app/components/ProductCard";
import { products, categories, type Product } from "@/react-app/data/products";

interface ProductsSectionProps {
  onAddToCart?: (product: Product) => void;
}

export default function ProductsSection({ onAddToCart }: ProductsSectionProps) {
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredProducts = activeCategory === "All"
    ? products
    : products.filter(p => p.category === activeCategory);

  return (
    <section id="products" className="py-20 bg-gradient-to-b from-white to-green-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-green-600 font-semibold text-sm uppercase tracking-wider">Our Products</span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">
            Premium Quality Seeds
          </h2>
          <p className="text-gray-600 mt-4">
            Carefully selected and lab-tested seeds for maximum yield and quality. 
            First choice of farmers across Gujarat and Rajasthan.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
          <Filter className="w-5 h-5 text-gray-400" />
          {categories.map((category) => (
            <Button
              key={category}
              variant={activeCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory(category)}
              className={activeCategory === category 
                ? "bg-green-600 hover:bg-green-700 text-white" 
                : "border-gray-300 text-gray-600 hover:border-green-500 hover:text-green-600"
              }
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>

        {/* Summer Offer Banner */}
        <div className="mt-16 bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-8 md:p-12 text-white text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-60 h-60 bg-white rounded-full translate-x-1/2 translate-y-1/2" />
          </div>
          <div className="relative z-10">
            <span className="inline-block bg-amber-400 text-amber-900 px-4 py-1 rounded-full text-sm font-bold mb-4">
              Limited Time Offer
            </span>
            <h3 className="text-2xl md:text-3xl font-bold mb-2">Summer Sale - Up to 50% Off!</h3>
            <p className="text-green-100 mb-6 max-w-xl mx-auto">
              Get the best deals on premium seeds. Perfect time to stock up for the upcoming Rabi season.
            </p>
            <Button size="lg" className="bg-white text-green-700 hover:bg-green-50">
              Shop Now
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
