import React, { useState, useEffect } from "react";
import { Boxes, AlertTriangle, CheckCircle, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import axios from "axios";
import { API } from "../../App";
import AdminLayout from "../../components/AdminLayout";
import { toast } from "sonner";

export default function AdminInventory() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingStock, setEditingStock] = useState({});

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API}/admin/inventory`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInventory(res.data);
    } catch (error) {
      console.error("Failed to fetch inventory:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStock = async (productId, variantId) => {
    const key = `${productId}-${variantId}`;
    const newStock = editingStock[key];
    if (newStock === undefined) return;

    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API}/admin/inventory/${productId}/${variantId}`, 
        { stock: parseInt(newStock) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Stock updated successfully");
      fetchInventory();
      setEditingStock(prev => {
        const updated = { ...prev };
        delete updated[key];
        return updated;
      });
    } catch (error) {
      toast.error("Failed to update stock");
    }
  };

  const lowStockCount = inventory.filter(item => item.low_stock).length;

  return (
    <AdminLayout title="Inventory">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <p className="text-stone-600">{inventory.length} items</p>
          {lowStockCount > 0 && (
            <Badge className="bg-amber-100 text-amber-700 gap-1">
              <AlertTriangle className="w-3 h-3" />
              {lowStockCount} low stock
            </Badge>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : inventory.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl">
          <Boxes className="w-16 h-16 text-stone-300 mx-auto mb-4" />
          <p className="text-stone-500">No inventory data</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-200">
          <table className="w-full">
            <thead className="bg-stone-50">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-stone-600">Product</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-stone-600">Variant</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-stone-600">Weight</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-stone-600">SKU</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-stone-600">Stock</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-stone-600">Status</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-stone-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {inventory.map((item) => {
                const key = `${item.product_id}-${item.variant_id}`;
                const isEditing = editingStock[key] !== undefined;
                return (
                  <tr 
                    key={key} 
                    className={`hover:bg-stone-50 ${item.low_stock ? 'bg-amber-50' : ''}`}
                    data-testid={`inventory-row-${item.product_id}`}
                  >
                    <td className="px-6 py-4 font-medium text-stone-900">{item.product_name}</td>
                    <td className="px-6 py-4 text-stone-600">{item.variant_name}</td>
                    <td className="px-6 py-4 text-stone-600">{item.weight}</td>
                    <td className="px-6 py-4 font-mono text-sm text-stone-500">{item.sku || "-"}</td>
                    <td className="px-6 py-4">
                      <Input
                        type="number"
                        value={isEditing ? editingStock[key] : item.stock}
                        onChange={(e) => setEditingStock({ ...editingStock, [key]: e.target.value })}
                        className="w-24 h-9"
                        min="0"
                      />
                    </td>
                    <td className="px-6 py-4">
                      {item.low_stock ? (
                        <Badge className="bg-amber-100 text-amber-700 gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Low Stock
                        </Badge>
                      ) : (
                        <Badge className="bg-green-100 text-green-700 gap-1">
                          <CheckCircle className="w-3 h-3" />
                          In Stock
                        </Badge>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {isEditing && (
                        <Button
                          size="sm"
                          onClick={() => updateStock(item.product_id, item.variant_id)}
                          className="bg-green-700 hover:bg-green-800"
                        >
                          <Save className="w-4 h-4 mr-1" />
                          Save
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
