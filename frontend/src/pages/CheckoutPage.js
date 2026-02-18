import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, Tag, CreditCard, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "axios";
import { API, useCart, useAuth } from "../App";
import Navbar from "../components/landing/Navbar";
import Footer from "../components/landing/Footer";
import { toast } from "sonner";
import { SITE_ASSETS, toAssetUrl } from "@/lib/assets";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const WHATSAPP_NUMBER = "+919950279664";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cartItems, cartTotal, cartCount, clearCart } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [razorpayKey, setRazorpayKey] = useState("");
  const [siteSettings, setSiteSettings] = useState({ razorpay_enabled: true, whatsapp_number: WHATSAPP_NUMBER });

  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    email: user?.email || "",
    address: "",
    city: "",
    state: "Rajasthan",
    pincode: ""
  });

  useEffect(() => {
    fetchRazorpayConfig();
    fetchSiteSettings();
  }, []);

  const fetchSiteSettings = async () => {
    try {
      const res = await axios.get(`${API}/settings/site`);
      setSiteSettings(res.data);
    } catch (error) {
      console.error("Failed to fetch site settings:", error);
    }
  };

  const fetchRazorpayConfig = async () => {
    try {
      const res = await axios.get(`${API}/razorpay/config`);
      setRazorpayKey(res.data.key_id);
    } catch (error) {
      console.error("Failed to fetch Razorpay config:", error);
    }
  };

  const shipping = cartTotal >= 500 ? 0 : 50;
  const total = cartTotal - couponDiscount + shipping;

  const applyCoupon = async () => {
    if (!couponCode) return;
    try {
      const res = await axios.post(`${API}/coupons/validate`, {
        code: couponCode,
        subtotal: cartTotal
      });
      setCouponDiscount(res.data.discount);
      setAppliedCoupon(res.data.coupon);
      toast.success(`Coupon applied! You save ₹${res.data.discount}`);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Invalid coupon code");
      setCouponDiscount(0);
      setAppliedCoupon(null);
    }
  };

  const removeCoupon = () => {
    setCouponCode("");
    setCouponDiscount(0);
    setAppliedCoupon(null);
    toast.info("Coupon removed");
  };

  const handleWhatsAppOrder = () => {
    // Validate form
    if (!formData.name || !formData.phone || !formData.address || !formData.city || !formData.pincode) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Create order message
    const orderItems = cartItems.map(item => 
      `• ${item.product.name} (${item.variant.weight}) x ${item.quantity} = ₹${item.variant.price * item.quantity}`
    ).join('\n');

    const message = `🌾 *New Order from IFS Seeds Website*\n\n` +
      `*Customer Details:*\n` +
      `Name: ${formData.name}\n` +
      `Phone: ${formData.phone}\n` +
      `Email: ${formData.email || 'Not provided'}\n\n` +
      `*Delivery Address:*\n` +
      `${formData.address}\n` +
      `${formData.city}, ${formData.state} - ${formData.pincode}\n\n` +
      `*Order Items:*\n${orderItems}\n\n` +
      `*Order Summary:*\n` +
      `Subtotal: ₹${cartTotal}\n` +
      `${couponDiscount > 0 ? `Discount (${appliedCoupon?.code}): -₹${couponDiscount}\n` : ''}` +
      `Shipping: ${shipping === 0 ? 'FREE' : `₹${shipping}`}\n` +
      `*Total: ₹${total}*\n\n` +
      `Please confirm my order. Thank you! 🙏`;

    const whatsappNumber = siteSettings.whatsapp_number?.replace(/[^0-9]/g, '') || WHATSAPP_NUMBER.replace(/[^0-9]/g, '');
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    
    window.open(whatsappUrl, '_blank');
    toast.success("Redirecting to WhatsApp...");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const orderData = {
        items: cartItems.map(item => ({
          product_id: item.product_id,
          variant_id: item.variant_id,
          quantity: item.quantity
        })),
        address: formData,
        coupon_code: appliedCoupon?.code
      };

      const res = await axios.post(`${API}/orders/create`, orderData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const order = res.data;
      setOrderId(order.id);

      // Initialize Razorpay
      const options = {
        key: razorpayKey,
        amount: order.total * 100,
        currency: "INR",
        name: "IFS Seeds",
        description: `Order #${order.id.slice(0, 8)}`,
        order_id: order.razorpay_order_id,
        handler: async (response) => {
          try {
            await axios.post(`${API}/orders/${order.id}/verify-payment`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            }, {
              headers: { Authorization: `Bearer ${token}` }
            });
            setOrderSuccess(true);
            clearCart();
            toast.success("Payment successful! Order placed.");
          } catch (error) {
            toast.error("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone
        },
        theme: {
          color: "#15803d"
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to create order");
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0 && !orderSuccess) {
    navigate("/cart");
    return null;
  }

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-stone-50">
        <Navbar cartCount={0} />
        <main className="pt-24 pb-16">
          <div className="max-w-lg mx-auto px-4 text-center">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-stone-100">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-stone-900 mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Order Placed Successfully!
              </h1>
              <p className="text-stone-600 mb-4">
                Thank you for your order, {formData.name}!
              </p>
              <p className="text-sm text-stone-500 mb-6">
                Order ID: <span className="font-mono font-semibold">{orderId.slice(0, 8)}</span>
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-left">
                <p className="text-amber-800 text-sm">
                  We'll contact you at {formData.phone} to confirm delivery details.<br />
                  Expected Delivery: 3-5 business days
                </p>
              </div>
              <div className="flex gap-4">
                <Button
                  onClick={() => navigate("/my-orders")}
                  className="flex-1 bg-green-700 hover:bg-green-800 rounded-full"
                >
                  View Orders
                </Button>
                <Button
                  onClick={() => navigate("/shop")}
                  variant="outline"
                  className="flex-1 rounded-full"
                >
                  Continue Shopping
                </Button>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar cartCount={cartCount} />
      
      <main className="pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate("/cart")}
            className="inline-flex items-center gap-2 text-stone-600 hover:text-green-700 mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Cart
          </button>

          <h1 className="text-3xl md:text-4xl font-bold text-stone-900 mb-8" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Checkout
          </h1>

          <form onSubmit={handleSubmit}>
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Shipping Form */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
                  <h2 className="text-lg font-bold text-stone-900 mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    Shipping Information
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        className="mt-1 rounded-xl h-12"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        required
                        data-testid="checkout-name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        className="mt-1 rounded-xl h-12"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        required
                        data-testid="checkout-phone"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Label htmlFor="email">Email (Optional)</Label>
                      <Input
                        id="email"
                        type="email"
                        className="mt-1 rounded-xl h-12"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        data-testid="checkout-email"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Label htmlFor="address">Delivery Address *</Label>
                      <Input
                        id="address"
                        className="mt-1 rounded-xl h-12"
                        placeholder="House no., Street, Landmark"
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                        required
                        data-testid="checkout-address"
                      />
                    </div>
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        className="mt-1 rounded-xl h-12"
                        value={formData.city}
                        onChange={(e) => setFormData({...formData, city: e.target.value})}
                        required
                        data-testid="checkout-city"
                      />
                    </div>
                    <div>
                      <Label htmlFor="pincode">Pincode *</Label>
                      <Input
                        id="pincode"
                        className="mt-1 rounded-xl h-12"
                        value={formData.pincode}
                        onChange={(e) => setFormData({...formData, pincode: e.target.value})}
                        required
                        data-testid="checkout-pincode"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Label htmlFor="state">State</Label>
                      <Select
                        value={formData.state}
                        onValueChange={(value) => setFormData({...formData, state: value})}
                      >
                        <SelectTrigger className="mt-1 rounded-xl h-12" data-testid="checkout-state">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Rajasthan">Rajasthan</SelectItem>
                          <SelectItem value="Gujarat">Gujarat</SelectItem>
                          <SelectItem value="Maharashtra">Maharashtra</SelectItem>
                          <SelectItem value="Madhya Pradesh">Madhya Pradesh</SelectItem>
                          <SelectItem value="Uttar Pradesh">Uttar Pradesh</SelectItem>
                          <SelectItem value="Haryana">Haryana</SelectItem>
                          <SelectItem value="Punjab">Punjab</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Coupon */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
                  <h2 className="text-lg font-bold text-stone-900 mb-4 flex items-center gap-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    <Tag className="w-5 h-5 text-green-600" />
                    Apply Coupon
                  </h2>
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between bg-green-50 p-4 rounded-xl">
                      <div>
                        <p className="font-semibold text-green-700">{appliedCoupon.code}</p>
                        <p className="text-sm text-green-600">You save ₹{couponDiscount}</p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={removeCoupon} className="text-red-500">
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      <Input
                        placeholder="Enter coupon code"
                        className="rounded-xl h-12"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        data-testid="coupon-input"
                      />
                      <Button
                        type="button"
                        onClick={applyCoupon}
                        className="bg-green-700 hover:bg-green-800 rounded-xl px-6"
                        data-testid="apply-coupon-btn"
                      >
                        Apply
                      </Button>
                    </div>
                  )}
                  <p className="text-sm text-stone-500 mt-2">Try: WELCOME20 for 20% off</p>
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 sticky top-24">
                  <h2 className="text-lg font-bold text-stone-900 mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    Order Summary
                  </h2>
                  
                  <div className="space-y-3 mb-4">
                    {cartItems.map((item) => (
                      <div key={`${item.product_id}-${item.variant_id}`} className="flex justify-between text-sm">
                        <span className="text-stone-600">
                          {item.product.name} ({item.variant.weight}) × {item.quantity}
                        </span>
                        <span className="font-medium">₹{item.variant.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-stone-200 pt-4 space-y-2">
                    <div className="flex justify-between text-stone-600">
                      <span>Subtotal</span>
                      <span>₹{cartTotal}</span>
                    </div>
                    {couponDiscount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount</span>
                        <span>-₹{couponDiscount}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-stone-600">
                      <span>Shipping</span>
                      <span>{shipping === 0 ? <span className="text-green-600">FREE</span> : `₹${shipping}`}</span>
                    </div>
                    <div className="border-t border-stone-200 pt-2">
                      <div className="flex justify-between text-xl font-bold">
                        <span>Total</span>
                        <span className="text-green-700">₹{total}</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Options */}
                  <div className="space-y-3 mt-6">
                    <p className="text-sm font-medium text-stone-700 text-center">Choose Payment Method</p>
                    
                    {/* Razorpay Payment */}
                    {siteSettings.razorpay_enabled && (
                      <Button
                        type="submit"
                        className="w-full bg-green-700 hover:bg-green-800 rounded-full h-12 text-base gap-2"
                        disabled={loading}
                        data-testid="pay-now-btn"
                      >
                        {loading ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <CreditCard className="w-5 h-5" />
                            Pay Online ₹{total}
                          </>
                        )}
                      </Button>
                    )}
                    
                    {/* WhatsApp Order */}
                    <Button
                      type="button"
                      onClick={handleWhatsAppOrder}
                      className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white rounded-full h-12 text-base gap-2"
                      data-testid="whatsapp-order-btn"
                    >
                      <MessageCircle className="w-5 h-5" />
                      Order via WhatsApp
                    </Button>
                  </div>
                  
                  {siteSettings.razorpay_enabled && (
                    <div className="flex items-center justify-center gap-2 mt-4">
                      <img src={toAssetUrl(SITE_ASSETS.razorpayLogo)} alt="Razorpay" className="h-5" />
                      <span className="text-xs text-stone-500">Secure Payment</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
