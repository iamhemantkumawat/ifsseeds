import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { API, useCart, useAuth } from "../App";
import Navbar from "../components/landing/Navbar";
import HeroSection from "../components/landing/HeroSection";
import ProductsSection from "../components/landing/ProductsSection";
import AboutSection from "../components/landing/AboutSection";
import TeamSection from "../components/landing/TeamSection";
import ContactSection from "../components/landing/ContactSection";
import Footer from "../components/landing/Footer";
import CartSidebar from "../components/landing/CartSidebar";

export default function HomePage() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { cartCount, addToCart } = useCart();

  useEffect(() => {
    // Seed initial data
    axios.post(`${API}/seed-initial-data`).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar cartCount={cartCount} onCartClick={() => setIsCartOpen(true)} />
      <HeroSection />
      <ProductsSection onAddToCart={addToCart} />
      <AboutSection />
      <TeamSection />
      <ContactSection />
      <Footer />
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}
