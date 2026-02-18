import { useState } from "react";
import { X, Minus, Plus, ShoppingBag, Trash2, ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/react-app/components/ui/button";
import { Input } from "@/react-app/components/ui/input";
import { Label } from "@/react-app/components/ui/label";
import type { Product } from "@/react-app/data/products";

export interface CartItem extends Product {
  quantity: number;
}

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
}

type CheckoutStep = "cart" | "details" | "success";

export default function CartSidebar({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}: CartSidebarProps) {
  const [step, setStep] = useState<CheckoutStep>("cart");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "Rajasthan",
    pincode: "",
  });

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 500 ? 0 : 50;
  const total = subtotal + shipping;
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the order to your backend
    setStep("success");
  };

  const handleClose = () => {
    if (step === "success") {
      onClearCart();
      setStep("cart");
    }
    onClose();
  };

  const resetAndClose = () => {
    setStep("cart");
    setFormData({
      name: "",
      phone: "",
      email: "",
      address: "",
      city: "",
      state: "Rajasthan",
      pincode: "",
    });
    onClearCart();
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={handleClose}
      />

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-green-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                {step === "cart" && `Your Cart (${totalItems})`}
                {step === "details" && "Checkout"}
                {step === "success" && "Order Placed!"}
              </h2>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {step === "cart" && (
              <>
                {items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                    <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Your cart is empty
                    </h3>
                    <p className="text-gray-500 mb-6">
                      Add some premium seeds to get started!
                    </p>
                    <Button onClick={onClose} className="bg-green-600 hover:bg-green-700">
                      Browse Products
                    </Button>
                  </div>
                ) : (
                  <div className="p-4 space-y-4">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="flex gap-4 p-3 bg-gray-50 rounded-xl"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 truncate">
                            {item.name}
                          </h4>
                          <p className="text-sm text-gray-500">{item.weight}</p>
                          <p className="text-green-600 font-semibold mt-1">
                            ₹{item.price}
                          </p>

                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() =>
                                  onUpdateQuantity(item.id, item.quantity - 1)
                                }
                                className="w-7 h-7 flex items-center justify-center bg-white border border-gray-200 rounded-md hover:bg-gray-100 transition-colors"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-8 text-center font-medium">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  onUpdateQuantity(item.id, item.quantity + 1)
                                }
                                className="w-7 h-7 flex items-center justify-center bg-white border border-gray-200 rounded-md hover:bg-gray-100 transition-colors"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                            <button
                              onClick={() => onRemoveItem(item.id)}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {step === "details" && (
              <form onSubmit={handleSubmitOrder} className="p-4 space-y-4">
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      placeholder="Enter 10-digit mobile number"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email (Optional)</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="Enter your email"
                    />
                  </div>

                  <div>
                    <Label htmlFor="address">Delivery Address *</Label>
                    <Input
                      id="address"
                      required
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      placeholder="House no., Street, Landmark"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        required
                        value={formData.city}
                        onChange={(e) =>
                          setFormData({ ...formData, city: e.target.value })
                        }
                        placeholder="City"
                      />
                    </div>
                    <div>
                      <Label htmlFor="pincode">Pincode *</Label>
                      <Input
                        id="pincode"
                        required
                        value={formData.pincode}
                        onChange={(e) =>
                          setFormData({ ...formData, pincode: e.target.value })
                        }
                        placeholder="6-digit pincode"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="state">State</Label>
                    <select
                      id="state"
                      value={formData.state}
                      onChange={(e) =>
                        setFormData({ ...formData, state: e.target.value })
                      }
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                    >
                      <option value="Rajasthan">Rajasthan</option>
                      <option value="Gujarat">Gujarat</option>
                      <option value="Maharashtra">Maharashtra</option>
                      <option value="Madhya Pradesh">Madhya Pradesh</option>
                      <option value="Uttar Pradesh">Uttar Pradesh</option>
                      <option value="Haryana">Haryana</option>
                      <option value="Punjab">Punjab</option>
                    </select>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="bg-green-50 rounded-xl p-4 space-y-2">
                  <h4 className="font-medium text-gray-900 mb-3">Order Summary</h4>
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {item.name} × {item.quantity}
                      </span>
                      <span className="font-medium">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                  <div className="border-t border-green-200 pt-2 mt-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span>₹{subtotal}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Shipping</span>
                      <span>{shipping === 0 ? "FREE" : `₹${shipping}`}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg mt-2">
                      <span>Total</span>
                      <span className="text-green-600">₹{total}</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-gray-500 text-center">
                  Payment: Cash on Delivery (COD)
                </p>

                <Button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 h-12 text-base"
                >
                  Place Order
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </form>
            )}

            {step === "success" && (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Order Placed Successfully!
                </h3>
                <p className="text-gray-600 mb-2">
                  Thank you for your order, {formData.name}!
                </p>
                <p className="text-sm text-gray-500 mb-6">
                  We'll contact you at {formData.phone} to confirm your order and delivery details.
                </p>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 w-full">
                  <p className="text-amber-800 text-sm">
                    💰 Payment Mode: Cash on Delivery<br />
                    📦 Expected Delivery: 3-5 business days
                  </p>
                </div>
                <Button
                  onClick={resetAndClose}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Continue Shopping
                </Button>
              </div>
            )}
          </div>

          {/* Footer */}
          {step === "cart" && items.length > 0 && (
            <div className="border-t border-gray-200 p-4 space-y-4 bg-white">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">
                    {shipping === 0 ? (
                      <span className="text-green-600">FREE</span>
                    ) : (
                      `₹${shipping}`
                    )}
                  </span>
                </div>
                {subtotal < 500 && (
                  <p className="text-xs text-gray-500">
                    Add ₹{500 - subtotal} more for free shipping
                  </p>
                )}
                <div className="flex justify-between text-lg font-semibold pt-2 border-t border-gray-100">
                  <span>Total</span>
                  <span className="text-green-600">₹{total}</span>
                </div>
              </div>

              <Button
                onClick={() => setStep("details")}
                className="w-full bg-green-600 hover:bg-green-700 h-12 text-base"
              >
                Proceed to Checkout
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {step === "details" && (
            <div className="border-t border-gray-200 p-4 bg-white">
              <button
                onClick={() => setStep("cart")}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                ← Back to Cart
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
