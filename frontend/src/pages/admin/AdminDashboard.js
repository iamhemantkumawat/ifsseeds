import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Package, 
  ShoppingCart, 
  Users, 
  IndianRupee,
  AlertTriangle,
  TrendingUp,
  Clock,
  Truck,
  CheckCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import axios from "axios";
import { API } from "../../App";
import AdminLayout from "@/components/AdminLayout";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API}/admin/dashboard/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(res.data);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const statusColors = {
    pending: "bg-amber-100 text-amber-700",
    confirmed: "bg-blue-100 text-blue-700",
    shipped: "bg-purple-100 text-purple-700",
    delivered: "bg-green-100 text-green-700"
  };

  if (loading) {
    return (
      <AdminLayout title="Dashboard">
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Dashboard">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <IndianRupee className="w-6 h-6" />
              <span className="text-3xl font-bold">{stats?.total_revenue?.toLocaleString() || 0}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-stone-500">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-6 h-6 text-blue-600" />
              <span className="text-3xl font-bold text-stone-900">{stats?.total_orders || 0}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-stone-500">Total Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="w-6 h-6 text-purple-600" />
              <span className="text-3xl font-bold text-stone-900">{stats?.total_customers || 0}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-stone-500">Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Package className="w-6 h-6 text-amber-600" />
              <span className="text-3xl font-bold text-stone-900">{stats?.total_products || 0}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order Status & Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Order Status Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-amber-50 rounded-xl">
                <div className="flex items-center gap-2 text-amber-700">
                  <Clock className="w-5 h-5" />
                  <span className="font-semibold">Pending</span>
                </div>
                <p className="text-2xl font-bold mt-2">{stats?.pending_orders || 0}</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-xl">
                <div className="flex items-center gap-2 text-blue-700">
                  <Package className="w-5 h-5" />
                  <span className="font-semibold">Confirmed</span>
                </div>
                <p className="text-2xl font-bold mt-2">{stats?.confirmed_orders || 0}</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-xl">
                <div className="flex items-center gap-2 text-purple-700">
                  <Truck className="w-5 h-5" />
                  <span className="font-semibold">Shipped</span>
                </div>
                <p className="text-2xl font-bold mt-2">{stats?.shipped_orders || 0}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-xl">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-semibold">Delivered</span>
                </div>
                <p className="text-2xl font-bold mt-2">{stats?.delivered_orders || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              Inventory Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.low_stock_count > 0 ? (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
                <AlertTriangle className="w-12 h-12 text-amber-600 mx-auto mb-3" />
                <p className="text-2xl font-bold text-amber-700">{stats.low_stock_count}</p>
                <p className="text-amber-600">Items with low stock (less than 10 units)</p>
                <Link
                  to="/admin/inventory"
                  className="inline-block mt-4 text-amber-700 font-semibold hover:underline"
                >
                  View Inventory →
                </Link>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                <p className="text-green-700 font-semibold">All items are well stocked!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Orders</CardTitle>
            <Link to="/admin/orders" className="text-green-600 text-sm font-semibold hover:underline">
              View All →
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {stats?.recent_orders?.length > 0 ? (
            <div className="space-y-3">
              {stats.recent_orders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 bg-stone-50 rounded-xl"
                >
                  <div>
                    <p className="font-mono font-semibold text-stone-900">#{order.id.slice(0, 8)}</p>
                    <p className="text-sm text-stone-500">{order.address?.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-stone-900">₹{order.total}</p>
                    <Badge className={statusColors[order.order_status]}>
                      {order.order_status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-stone-500 py-8">No orders yet</p>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
