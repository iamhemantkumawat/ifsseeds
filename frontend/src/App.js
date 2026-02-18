import React, { useState, useEffect, createContext, useContext } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";
import { Toaster } from "@/components/ui/sonner";

// Pages
import HomePage from "./pages/HomePage";
import ShopPage from "./pages/ShopPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import MyOrdersPage from "./pages/MyOrdersPage";
import TeamMemberPage from "./pages/TeamMemberPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminCoupons from "./pages/admin/AdminCoupons";
import AdminCustomers from "./pages/admin/AdminCustomers";
import AdminInventory from "./pages/admin/AdminInventory";
import AdminSettings from "./pages/admin/AdminSettings";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

// Auth Context
export const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

// Cart Context
export const CartContext = createContext(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
};

// Protected Route
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (adminOnly && user.role !== "admin") {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios.get(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        setUser(res.data);
      })
      .catch(() => {
        localStorage.removeItem("token");
      })
      .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
    
    // Load cart from localStorage
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  const login = async (email, password) => {
    const res = await axios.post(`${API}/auth/login`, { email, password });
    localStorage.setItem("token", res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const register = async (name, email, phone, password) => {
    const res = await axios.post(`${API}/auth/register`, { name, email, phone, password });
    localStorage.setItem("token", res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const addToCart = (product, variant, quantity = 1) => {
    setCartItems(prev => {
      const existing = prev.find(
        item => item.product_id === product.id && item.variant_id === variant.id
      );
      if (existing) {
        return prev.map(item =>
          item.product_id === product.id && item.variant_id === variant.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, {
        product_id: product.id,
        variant_id: variant.id,
        product,
        variant,
        quantity
      }];
    });
  };

  const updateCartQuantity = (productId, variantId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId, variantId);
      return;
    }
    setCartItems(prev =>
      prev.map(item =>
        item.product_id === productId && item.variant_id === variantId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const removeFromCart = (productId, variantId) => {
    setCartItems(prev =>
      prev.filter(item => !(item.product_id === productId && item.variant_id === variantId))
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartTotal = cartItems.reduce(
    (sum, item) => sum + item.variant.price * item.quantity,
    0
  );

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      <CartContext.Provider value={{ 
        cartItems, 
        addToCart, 
        updateCartQuantity, 
        removeFromCart, 
        clearCart,
        cartTotal,
        cartCount 
      }}>
        <BrowserRouter>
          <Toaster richColors position="top-right" />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/product/:productId" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            } />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/team/:memberId" element={<TeamMemberPage />} />
            <Route path="/my-orders" element={
              <ProtectedRoute>
                <MyOrdersPage />
              </ProtectedRoute>
            } />
            
            {/* Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute adminOnly>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/products" element={
              <ProtectedRoute adminOnly>
                <AdminProducts />
              </ProtectedRoute>
            } />
            <Route path="/admin/orders" element={
              <ProtectedRoute adminOnly>
                <AdminOrders />
              </ProtectedRoute>
            } />
            <Route path="/admin/coupons" element={
              <ProtectedRoute adminOnly>
                <AdminCoupons />
              </ProtectedRoute>
            } />
            <Route path="/admin/customers" element={
              <ProtectedRoute adminOnly>
                <AdminCustomers />
              </ProtectedRoute>
            } />
            <Route path="/admin/inventory" element={
              <ProtectedRoute adminOnly>
                <AdminInventory />
              </ProtectedRoute>
            } />
            <Route path="/admin/settings" element={
              <ProtectedRoute adminOnly>
                <AdminSettings />
              </ProtectedRoute>
            } />
          </Routes>
        </BrowserRouter>
      </CartContext.Provider>
    </AuthContext.Provider>
  );
}

export default App;
