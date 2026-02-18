import { Link } from "react-router";
import { ShoppingCart, Eye } from "lucide-react";
import { Button } from "@/react-app/components/ui/button";
import { Badge } from "@/react-app/components/ui/badge";
import type { Product } from "@/react-app/data/products";

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-green-200">
      {/* Image Container */}
      <div className="relative overflow-hidden aspect-square bg-gradient-to-br from-green-50 to-amber-50">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Discount Badge */}
        {product.discount > 0 && (
          <Badge className="absolute top-4 left-4 bg-red-500 hover:bg-red-600 text-white text-sm font-bold px-3 py-1">
            {product.discount}% OFF
          </Badge>
        )}

        {/* Category Badge */}
        <Badge variant="secondary" className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-gray-700">
          {product.category}
        </Badge>

        {/* Quick View Overlay */}
        <Link
          to={`/product/${product.id}`}
          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
        >
          <Button variant="secondary" size="sm" className="gap-2">
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
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-green-600 transition-colors">
              {product.name}
            </h3>
          </Link>
          <p className="text-sm text-gray-500 mt-1">{product.weight}</p>
        </div>

        {/* Features Preview */}
        <div className="flex flex-wrap gap-1">
          {product.features.slice(0, 2).map((feature, index) => (
            <span
              key={index}
              className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full"
            >
              {feature}
            </span>
          ))}
        </div>

        {/* Price & Action */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900">₹{product.price}</span>
            {product.originalPrice > product.price && (
              <span className="text-sm text-gray-400 line-through">₹{product.originalPrice}</span>
            )}
          </div>
          
          <Button
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white gap-2 shadow-md shadow-green-600/20"
            onClick={() => onAddToCart?.(product)}
          >
            <ShoppingCart className="w-4 h-4" />
            Add
          </Button>
        </div>
      </div>
    </div>
  );
}
