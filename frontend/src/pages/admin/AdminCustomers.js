import React, { useState, useEffect } from "react";
import { Users, ShoppingCart, IndianRupee, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import axios from "axios";
import { API } from "../../App";
import AdminLayout from "@/components/AdminLayout";
import { toast } from "sonner";

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API}/admin/customers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCustomers(res.data);
    } catch (error) {
      console.error("Failed to fetch customers:", error);
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (customer) => {
    setEditingCustomer(customer);
    setEditForm({
      name: customer.name || "",
      email: customer.email || "",
      phone: customer.phone || "",
    });
    setEditDialogOpen(true);
  };

  const handleSaveCustomer = async () => {
    if (!editingCustomer) return;
    if (!editForm.name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!editForm.email.trim()) {
      toast.error("Email is required");
      return;
    }

    setSavingEdit(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API}/admin/customers/${editingCustomer.id}`,
        {
          name: editForm.name.trim(),
          email: editForm.email.trim(),
          phone: editForm.phone.trim() || null,
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      toast.success("User updated successfully");
      setEditDialogOpen(false);
      setEditingCustomer(null);
      fetchCustomers();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to update user");
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <AdminLayout title="Customers">
      <div className="flex justify-between items-center mb-6">
        <p className="text-stone-600">{customers.length} customers</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : customers.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl">
          <Users className="w-16 h-16 text-stone-300 mx-auto mb-4" />
          <p className="text-stone-500">No customers yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-200">
          <table className="w-full">
            <thead className="bg-stone-50">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-stone-600">Customer</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-stone-600">Email</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-stone-600">Phone</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-stone-600">Joined</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-stone-600">Orders</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-stone-600">Total Spent</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-stone-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-stone-50" data-testid={`customer-row-${customer.id}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold">
                        {customer.name?.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-stone-900">{customer.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-stone-600">{customer.email}</td>
                  <td className="px-6 py-4 text-stone-600">{customer.phone || "-"}</td>
                  <td className="px-6 py-4 text-sm text-stone-500">
                    {new Date(customer.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="secondary" className="gap-1">
                      <ShoppingCart className="w-3 h-3" />
                      {customer.order_count}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1 font-semibold text-green-700">
                      <IndianRupee className="w-4 h-4" />
                      {customer.total_spent?.toLocaleString() || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(customer)}>
                      <Pencil className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open);
          if (!open) setEditingCustomer(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Name *</Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Enter full name"
              />
            </div>
            <div>
              <Label htmlFor="edit-email">Email *</Label>
              <Input
                id="edit-email"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="Enter email address"
              />
            </div>
            <div>
              <Label htmlFor="edit-phone">Phone</Label>
              <Input
                id="edit-phone"
                value={editForm.phone}
                onChange={(e) => setEditForm((prev) => ({ ...prev, phone: e.target.value }))}
                placeholder="Enter phone number"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                className="flex-1 bg-green-700 hover:bg-green-800"
                onClick={handleSaveCustomer}
                disabled={savingEdit}
              >
                {savingEdit ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
