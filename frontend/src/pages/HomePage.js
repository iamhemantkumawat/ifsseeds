import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { API, useCart } from "../App";
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
  const location = useLocation();

  useEffect(() => {
    // Seed initial data
    axios.post(`${API}/seed-initial-data`).catch(() => {});
  }, []);

  useEffect(() => {
    const hash = location.hash?.replace("#", "");
    if (!hash) return;

    let attempts = 0;
    const maxAttempts = 12;
    const interval = setInterval(() => {
      const element = document.getElementById(hash);
      if (element) {
        const navOffset = 80;
        const y = element.getBoundingClientRect().top + window.pageYOffset - navOffset;
        window.scrollTo({ top: y, behavior: "smooth" });
        clearInterval(interval);
      }
      attempts += 1;
      if (attempts >= maxAttempts) {
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [location.hash]);

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
