import React, { useState, useEffect } from "react";
import { Package, Truck, CheckCircle, Clock, XCircle, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axios from "axios";
import { API } from "../../App";
import AdminLayout from "../../components/AdminLayout";
import { toast } from "sonner";

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

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const url = statusFilter === "all" 
        ? `${API}/admin/orders`
        : `${API}/admin/orders?status=${statusFilter}`;
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(res.data);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API}/admin/orders/${orderId}/status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Order status updated to ${newStatus}`);
      fetchOrders();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => ({ ...prev, order_status: newStatus }));
      }
    } catch (error) {
      toast.error("Failed to update order status");
    }
  };

  return (
    <AdminLayout title="Orders">
      <div className="flex justify-between items-center mb-6">
        <p className="text-stone-600">{orders.length} orders</p>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48" data-testid="order-status-filter">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Orders</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl">
          <Package className="w-16 h-16 text-stone-300 mx-auto mb-4" />
          <p className="text-stone-500">No orders found</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-200">
          <table className="w-full">
            <thead className="bg-stone-50">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-stone-600">Order ID</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-stone-600">Customer</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-stone-600">Date</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-stone-600">Total</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-stone-600">Payment</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-stone-600">Status</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-stone-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {orders.map((order) => {
                const StatusIcon = statusIcons[order.order_status] || Clock;
                return (
                  <tr key={order.id} className="hover:bg-stone-50" data-testid={`order-row-${order.id}`}>
                    <td className="px-6 py-4 font-mono text-sm font-semibold">
                      #{order.id.slice(0, 8)}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-stone-900">{order.address?.name}</p>
                      <p className="text-sm text-stone-500">{order.address?.phone}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-stone-600">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-bold text-stone-900">₹{order.total}</td>
                    <td className="px-6 py-4">
                      <Badge className={order.payment_status === "paid" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}>
                        {order.payment_status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Select
                        value={order.order_status}
                        onValueChange={(value) => updateOrderStatus(order.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <Badge className={`${statusColors[order.order_status]} gap-1`}>
                            <StatusIcon className="w-3 h-3" />
                            {order.order_status}
                          </Badge>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="shipped">Shipped</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-6 py-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Order #{selectedOrder?.id.slice(0, 8)}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-stone-700 mb-2">Customer Details</h4>
                <div className="bg-stone-50 p-4 rounded-xl text-sm">
                  <p className="font-medium">{selectedOrder.address?.name}</p>
                  <p>{selectedOrder.address?.phone}</p>
                  {selectedOrder.address?.email && <p>{selectedOrder.address?.email}</p>}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-stone-700 mb-2">Delivery Address</h4>
                <div className="bg-stone-50 p-4 rounded-xl text-sm">
                  <p>{selectedOrder.address?.address}</p>
                  <p>{selectedOrder.address?.city}, {selectedOrder.address?.state} - {selectedOrder.address?.pincode}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-stone-700 mb-2">Items</h4>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between bg-stone-50 p-3 rounded-xl">
                      <div>
                        <p className="font-medium">{item.product_name}</p>
                        <p className="text-sm text-stone-500">{item.weight} × {item.quantity}</p>
                      </div>
                      <p className="font-semibold">₹{item.price * item.quantity}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>₹{selectedOrder.subtotal}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount ({selectedOrder.coupon_code})</span>
                    <span>-₹{selectedOrder.discount}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>{selectedOrder.shipping === 0 ? "FREE" : `₹${selectedOrder.shipping}`}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Total</span>
                  <span className="text-green-700">₹{selectedOrder.total}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Badge className={selectedOrder.payment_status === "paid" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}>
                  Payment: {selectedOrder.payment_status}
                </Badge>
                <Badge className={statusColors[selectedOrder.order_status]}>
                  Status: {selectedOrder.order_status}
                </Badge>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
