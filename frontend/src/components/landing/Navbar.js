import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, ShoppingCart, User, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth, useCart } from "../../App";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SITE_ASSETS, toAssetUrl } from "@/lib/assets";

export default function Navbar({ cartCount = 0, onCartClick }) {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Products", href: "/shop" },
    { name: "About", href: "/#about", sectionId: "about" },
    { name: "Contact", href: "/#contact", sectionId: "contact" },
  ];

  const handleSectionNavigation = (e, link) => {
    if (!link.sectionId) return;
    e.preventDefault();

    if (location.pathname === "/") {
      const section = document.getElementById(link.sectionId);
      if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
        window.history.replaceState(null, "", link.href);
      }
    } else {
      navigate(link.href);
    }
    setIsOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-stone-200/50 shadow-sm" data-testid="navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2" data-testid="logo-link">
            <img 
              src={toAssetUrl(SITE_ASSETS.logo)} 
              alt="IFS Seeds Logo" 
              className="h-12 w-auto object-contain"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              link.sectionId ? (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleSectionNavigation(e, link)}
                  className="text-stone-600 hover:text-green-700 font-medium transition-colors"
                  data-testid={`nav-link-${link.name.toLowerCase()}`}
                >
                  {link.name}
                </a>
              ) : (
                <Link
                  key={link.name}
                  to={link.href}
                  className="text-stone-600 hover:text-green-700 font-medium transition-colors"
                  data-testid={`nav-link-${link.name.toLowerCase()}`}
                >
                  {link.name}
                </Link>
              )
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Cart */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative"
              onClick={onCartClick}
              data-testid="cart-button"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-600 text-white text-xs rounded-full flex items-center justify-center animate-pulse-green">
                  {cartCount}
                </span>
              )}
            </Button>

            {/* User Menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2" data-testid="user-menu-trigger">
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">{user.name}</span>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link to="/my-orders" data-testid="my-orders-link">My Orders</Link>
                  </DropdownMenuItem>
                  {user.role === "admin" && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin" data-testid="admin-link">Admin Panel</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} data-testid="logout-button">
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/login">
                <Button className="bg-green-700 hover:bg-green-800 text-white rounded-full px-6" data-testid="login-button">
                  Login
                </Button>
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setIsOpen(!isOpen)}
              data-testid="mobile-menu-toggle"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-stone-200 animate-fade-in">
            {navLinks.map((link) => (
              link.sectionId ? (
                <a
                  key={link.name}
                  href={link.href}
                  className="block py-3 text-stone-600 hover:text-green-700 font-medium"
                  onClick={(e) => handleSectionNavigation(e, link)}
                >
                  {link.name}
                </a>
              ) : (
                <Link
                  key={link.name}
                  to={link.href}
                  className="block py-3 text-stone-600 hover:text-green-700 font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </Link>
              )
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
