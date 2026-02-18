import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart, useAuth } from "../App";
import Navbar from "../components/landing/Navbar";
import Footer from "../components/landing/Footer";

export default function CartPage() {
  const navigate = useNavigate();
  const { cartItems, updateCartQuantity, removeFromCart, cartTotal, cartCount } = useCart();
  const { user } = useAuth();
  
  const shipping = cartTotal >= 500 ? 0 : 50;
  const total = cartTotal + shipping;

  const handleCheckout = () => {
    if (user) {
      navigate("/checkout");
    } else {
      navigate("/login?redirect=/checkout");
    }
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar cartCount={cartCount} />
      
      <main className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/shop" className="inline-flex items-center gap-2 text-stone-600 hover:text-green-700 mb-8">
            <ArrowLeft className="w-4 h-4" />
            Continue Shopping
          </Link>

          <h1 className="text-3xl md:text-4xl font-bold text-stone-900 mb-8" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Shopping Cart
          </h1>

          {cartItems.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-stone-100">
              <ShoppingBag className="w-16 h-16 text-stone-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-stone-900 mb-2">Your cart is empty</h3>
              <p className="text-stone-500 mb-6">Add some premium seeds to get started!</p>
              <Link to="/shop">
                <Button className="bg-green-700 hover:bg-green-800 rounded-full px-8">
                  Browse Products
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={`${item.product_id}-${item.variant_id}`}
                    className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100 flex gap-4"
                    data-testid={`cart-page-item-${item.product_id}`}
                  >
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-24 h-24 object-cover rounded-xl"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <div>
                          <Link to={`/product/${item.product_id}`}>
                            <h3 className="font-semibold text-stone-900 hover:text-green-700">
                              {item.product.name}
                            </h3>
                          </Link>
                          <p className="text-sm text-stone-500">{item.variant.weight}</p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.product_id, item.variant_id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center border border-stone-200 rounded-lg overflow-hidden">
                          <button
                            onClick={() => updateCartQuantity(item.product_id, item.variant_id, item.quantity - 1)}
                            className="p-2 hover:bg-stone-100"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-10 text-center font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateCartQuantity(item.product_id, item.variant_id, item.quantity + 1)}
                            className="p-2 hover:bg-stone-100"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-stone-900">₹{item.variant.price * item.quantity}</p>
                          <p className="text-sm text-stone-500">₹{item.variant.price} each</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 sticky top-24">
                  <h3 className="text-lg font-bold text-stone-900 mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    Order Summary
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-stone-600">
                      <span>Subtotal ({cartCount} items)</span>
                      <span>₹{cartTotal}</span>
                    </div>
                    <div className="flex justify-between text-stone-600">
                      <span>Shipping</span>
                      <span>{shipping === 0 ? <span className="text-green-600">FREE</span> : `₹${shipping}`}</span>
                    </div>
                    {cartTotal < 500 && (
                      <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-xl">
                        Add ₹{500 - cartTotal} more for free shipping!
                      </p>
                    )}
                    <div className="border-t border-stone-200 pt-3">
                      <div className="flex justify-between text-xl font-bold">
                        <span>Total</span>
                        <span className="text-green-700">₹{total}</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    className="w-full mt-6 bg-green-700 hover:bg-green-800 rounded-full h-12 text-lg gap-2"
                    onClick={handleCheckout}
                    data-testid="checkout-btn"
                  >
                    Proceed to Checkout
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                  <p className="text-xs text-center text-stone-500 mt-4">
                    Secure checkout powered by Razorpay
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
