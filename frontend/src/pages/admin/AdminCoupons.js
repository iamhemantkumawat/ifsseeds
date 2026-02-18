import React, { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
import AdminLayout from "@/components/AdminLayout";
import { toast } from "sonner";

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    discount_type: "percentage",
    discount_value: "",
    min_order_value: "0",
    max_discount: "",
    usage_limit: "",
    valid_from: "",
    valid_until: "",
    is_active: true
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API}/admin/coupons`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCoupons(res.data);
    } catch (error) {
      console.error("Failed to fetch coupons:", error);
    } finally {
      setLoading(false);
    }
  };

  const openNewDialog = () => {
    const now = new Date();
    const threeMonthsLater = new Date(now.setMonth(now.getMonth() + 3));
    setFormData({
      code: "",
      discount_type: "percentage",
      discount_value: "",
      min_order_value: "0",
      max_discount: "",
      usage_limit: "",
      valid_from: new Date().toISOString().split('T')[0],
      valid_until: threeMonthsLater.toISOString().split('T')[0],
      is_active: true
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const payload = {
        ...formData,
        discount_value: parseFloat(formData.discount_value),
        min_order_value: parseFloat(formData.min_order_value) || 0,
        max_discount: formData.max_discount ? parseFloat(formData.max_discount) : null,
        usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null,
        valid_from: new Date(formData.valid_from).toISOString(),
        valid_until: new Date(formData.valid_until).toISOString()
      };
      await axios.post(`${API}/admin/coupons`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Coupon created successfully");
      setIsDialogOpen(false);
      fetchCoupons();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to create coupon");
    }
  };

  const handleDelete = async (couponId) => {
    if (!window.confirm("Are you sure you want to delete this coupon?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API}/admin/coupons/${couponId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Coupon deleted successfully");
      fetchCoupons();
    } catch (error) {
      toast.error("Failed to delete coupon");
    }
  };

  return (
    <AdminLayout title="Coupons">
      <div className="flex justify-between items-center mb-6">
        <p className="text-stone-600">{coupons.length} coupons</p>
        <Button
          onClick={openNewDialog}
          className="bg-green-700 hover:bg-green-800 rounded-xl gap-2"
          data-testid="add-coupon-btn"
        >
          <Plus className="w-4 h-4" />
          Add Coupon
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : coupons.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl">
          <p className="text-stone-500">No coupons created yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-200">
          <table className="w-full">
            <thead className="bg-stone-50">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-stone-600">Code</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-stone-600">Discount</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-stone-600">Min Order</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-stone-600">Usage</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-stone-600">Valid Until</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-stone-600">Status</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-stone-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {coupons.map((coupon) => (
                <tr key={coupon.id} className="hover:bg-stone-50" data-testid={`coupon-row-${coupon.id}`}>
                  <td className="px-6 py-4 font-mono font-bold text-green-700">{coupon.code}</td>
                  <td className="px-6 py-4">
                    {coupon.discount_type === "percentage" 
                      ? `${coupon.discount_value}%`
                      : `₹${coupon.discount_value}`
                    }
                    {coupon.max_discount && (
                      <span className="text-sm text-stone-500 ml-1">(max ₹{coupon.max_discount})</span>
                    )}
                  </td>
                  <td className="px-6 py-4">₹{coupon.min_order_value}</td>
                  <td className="px-6 py-4">
                    {coupon.usage_count} / {coupon.usage_limit || "∞"}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {new Date(coupon.valid_until).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <Badge className={coupon.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                      {coupon.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(coupon.id)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Coupon Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Coupon</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Coupon Code *</Label>
              <Input
                value={formData.code}
                onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                required
                className="mt-1 font-mono"
                placeholder="e.g., SUMMER20"
                data-testid="coupon-code-input"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Discount Type</Label>
                <Select
                  value={formData.discount_type}
                  onValueChange={(value) => setFormData({...formData, discount_type: value})}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixed">Fixed Amount (₹)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Discount Value *</Label>
                <Input
                  type="number"
                  value={formData.discount_value}
                  onChange={(e) => setFormData({...formData, discount_value: e.target.value})}
                  required
                  className="mt-1"
                  placeholder={formData.discount_type === "percentage" ? "e.g., 20" : "e.g., 100"}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Min Order Value</Label>
                <Input
                  type="number"
                  value={formData.min_order_value}
                  onChange={(e) => setFormData({...formData, min_order_value: e.target.value})}
                  className="mt-1"
                  placeholder="0"
                />
              </div>
              <div>
                <Label>Max Discount (for %)</Label>
                <Input
                  type="number"
                  value={formData.max_discount}
                  onChange={(e) => setFormData({...formData, max_discount: e.target.value})}
                  className="mt-1"
                  placeholder="Optional"
                />
              </div>
            </div>

            <div>
              <Label>Usage Limit</Label>
              <Input
                type="number"
                value={formData.usage_limit}
                onChange={(e) => setFormData({...formData, usage_limit: e.target.value})}
                className="mt-1"
                placeholder="Leave empty for unlimited"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Valid From *</Label>
                <Input
                  type="date"
                  value={formData.valid_from}
                  onChange={(e) => setFormData({...formData, valid_from: e.target.value})}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Valid Until *</Label>
                <Input
                  type="date"
                  value={formData.valid_until}
                  onChange={(e) => setFormData({...formData, valid_until: e.target.value})}
                  required
                  className="mt-1"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
              />
              <Label>Active</Label>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1 bg-green-700 hover:bg-green-800" data-testid="create-coupon-btn">
                Create Coupon
              </Button>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
