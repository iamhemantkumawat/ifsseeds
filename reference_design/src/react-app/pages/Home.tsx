import { useState } from "react";
import Navbar from "@/react-app/components/Navbar";
import HeroSection from "@/react-app/components/HeroSection";
import ProductsSection from "@/react-app/components/ProductsSection";
import AboutSection from "@/react-app/components/AboutSection";
import TeamSection from "@/react-app/components/TeamSection";
import ContactSection from "@/react-app/components/ContactSection";
import Footer from "@/react-app/components/Footer";
import CartSidebar, { type CartItem } from "@/react-app/components/CartSidebar";
import type { Product } from "@/react-app/data/products";

export default function HomePage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const handleAddToCart = (product: Product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCartItems((prev) => prev.filter((item) => item.id !== productId));
    } else {
      setCartItems((prev) =>
        prev.map((item) =>
          item.id === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const handleRemoveItem = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== productId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen">
      <Navbar cartCount={totalItems} onCartClick={() => setIsCartOpen(true)} />
      <HeroSection />
      <ProductsSection onAddToCart={handleAddToCart} />
      <AboutSection />
      <TeamSection />
      <ContactSection />
      <Footer />
      
      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
      />
    </div>
  );
}
