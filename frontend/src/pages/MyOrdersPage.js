import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Package, Truck, CheckCircle, Clock, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import axios from "axios";
import { API, useCart } from "../App";
import Navbar from "../components/landing/Navbar";
import Footer from "../components/landing/Footer";

const statusIcons = {
  pending: Clock,
  confirmed: Package,
  shipped: Truck,
  delivered: CheckCircle,
  cancelled: XCircle
};

const statusColors = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700"
};

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { cartCount } = useCart();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API}/orders/my-orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(res.data);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar cartCount={cartCount} />
      
      <main className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/" className="inline-flex items-center gap-2 text-stone-600 hover:text-green-700 mb-8">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <h1 className="text-3xl md:text-4xl font-bold text-stone-900 mb-8" style={{ fontFamily: 'Outfit, sans-serif' }}>
            My Orders
          </h1>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-stone-100">
              <Package className="w-16 h-16 text-stone-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-stone-900 mb-2">No orders yet</h3>
              <p className="text-stone-500 mb-6">Start shopping to see your orders here!</p>
              <Link to="/shop">
                <Button className="bg-green-700 hover:bg-green-800 rounded-full px-8">
                  Browse Products
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => {
                const StatusIcon = statusIcons[order.order_status] || Clock;
                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100"
                    data-testid={`order-${order.id}`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                      <div>
                        <p className="text-sm text-stone-500">Order ID</p>
                        <p className="font-mono font-semibold text-stone-900">{order.id.slice(0, 8)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-stone-500">Date</p>
                        <p className="text-stone-900">{new Date(order.created_at).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-stone-500">Total</p>
                        <p className="text-xl font-bold text-green-700">₹{order.total}</p>
                      </div>
                      <Badge className={`${statusColors[order.order_status]} gap-1`}>
                        <StatusIcon className="w-4 h-4" />
                        {order.order_status.charAt(0).toUpperCase() + order.order_status.slice(1)}
                      </Badge>
                    </div>

                    <div className="border-t border-stone-100 pt-4">
                      <h4 className="font-semibold text-stone-700 mb-2">Items</h4>
                      <div className="space-y-2">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span className="text-stone-600">
                              {item.product_name} ({item.weight}) × {item.quantity}
                            </span>
                            <span className="font-medium">₹{item.price * item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-stone-100 pt-4 mt-4">
                      <h4 className="font-semibold text-stone-700 mb-2">Delivery Address</h4>
                      <p className="text-sm text-stone-600">
                        {order.address.name}<br />
                        {order.address.address}<br />
                        {order.address.city}, {order.address.state} - {order.address.pincode}<br />
                        Phone: {order.address.phone}
                      </p>
                    </div>

                    {order.payment_status === "paid" && (
                      <div className="mt-4 flex items-center gap-2 text-green-600 text-sm">
                        <CheckCircle className="w-4 h-4" />
                        Payment Completed
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

// Add missing Button import
function Button({ children, className, ...props }) {
  return (
    <button
      className={`inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
