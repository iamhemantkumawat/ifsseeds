import React from "react";
import { Link } from "react-router-dom";
import { X, Minus, Plus, ShoppingBag, Trash2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "../../App";
import { toAssetUrl } from "@/lib/assets";

export default function CartSidebar({ isOpen, onClose }) {
  const { cartItems, updateCartQuantity, removeFromCart, cartTotal, cartCount } = useCart();

  const shipping = cartTotal >= 500 ? 0 : 50;
  const total = cartTotal + shipping;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        data-testid="cart-sidebar"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-stone-200">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-green-600" />
              <h2 className="text-lg font-semibold text-stone-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Your Cart ({cartCount})
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-stone-100 rounded-xl transition-colors"
              data-testid="close-cart-btn"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <ShoppingBag className="w-16 h-16 text-stone-300 mb-4" />
                <h3 className="text-lg font-medium text-stone-900 mb-2">
                  Your cart is empty
                </h3>
                <p className="text-stone-500 mb-6">
                  Add some premium seeds to get started!
                </p>
                <Button onClick={onClose} className="bg-green-700 hover:bg-green-800 rounded-full">
                  Browse Products
                </Button>
              </div>
            ) : (
              <div className="p-4 space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={`${item.product_id}-${item.variant_id}`}
                    className="flex gap-4 p-3 bg-stone-50 rounded-2xl"
                    data-testid={`cart-item-${item.product_id}`}
                  >
                    <img
                      src={toAssetUrl(item.product.image)}
                      alt={item.product.name}
                      className="w-20 h-20 object-cover rounded-xl"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-stone-900 truncate">
                        {item.product.name}
                      </h4>
                      <p className="text-sm text-stone-500">{item.variant.weight}</p>
                      <p className="text-green-600 font-semibold mt-1">
                        ₹{item.variant.price}
                      </p>

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              updateCartQuantity(item.product_id, item.variant_id, item.quantity - 1)
                            }
                            className="w-7 h-7 flex items-center justify-center bg-white border border-stone-200 rounded-lg hover:bg-stone-100 transition-colors"
                            data-testid={`decrease-qty-${item.product_id}`}
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateCartQuantity(item.product_id, item.variant_id, item.quantity + 1)
                            }
                            className="w-7 h-7 flex items-center justify-center bg-white border border-stone-200 rounded-lg hover:bg-stone-100 transition-colors"
                            data-testid={`increase-qty-${item.product_id}`}
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.product_id, item.variant_id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          data-testid={`remove-item-${item.product_id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {cartItems.length > 0 && (
            <div className="border-t border-stone-200 p-4 space-y-4 bg-white">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-stone-600">Subtotal</span>
                  <span className="font-medium">₹{cartTotal}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-stone-600">Shipping</span>
                  <span className="font-medium">
                    {shipping === 0 ? (
                      <span className="text-green-600">FREE</span>
                    ) : (
                      `₹${shipping}`
                    )}
                  </span>
                </div>
                {cartTotal < 500 && (
                  <p className="text-xs text-stone-500">
                    Add ₹{500 - cartTotal} more for free shipping
                  </p>
                )}
                <div className="flex justify-between text-lg font-semibold pt-2 border-t border-stone-100">
                  <span>Total</span>
                  <span className="text-green-600">₹{total}</span>
                </div>
              </div>

              <Link to="/checkout" onClick={onClose}>
                <Button
                  className="w-full bg-green-700 hover:bg-green-800 h-12 text-base rounded-full"
                  data-testid="proceed-checkout-btn"
                >
                  Proceed to Checkout
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
