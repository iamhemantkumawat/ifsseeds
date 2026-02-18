import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Switch } from "@/components/ui/switch";
import axios from "axios";
import { API } from "../../App";
import AdminLayout from "@/components/AdminLayout";
import { toast } from "sonner";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    variety: "",
    category: "Legumes",
    description: "",
    image: "",
    features: [],
    variants: [],
    is_active: true
  });
  const [newFeature, setNewFeature] = useState("");
  const [newVariant, setNewVariant] = useState({
    name: "",
    weight: "",
    price: "",
    original_price: "",
    stock: "",
    sku: ""
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API}/products?active_only=false`);
      setProducts(res.data);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  const openNewDialog = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      variety: "",
      category: "Legumes",
      description: "",
      image: "",
      features: [],
      variants: [],
      is_active: true
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      variety: product.variety,
      category: product.category,
      description: product.description,
      image: product.image,
      features: product.features || [],
      variants: product.variants || [],
      is_active: product.is_active
    });
    setIsDialogOpen(true);
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }));
      setNewFeature("");
    }
  };

  const removeFeature = (index) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const addVariant = () => {
    if (newVariant.name && newVariant.weight && newVariant.price) {
      setFormData(prev => ({
        ...prev,
        variants: [...prev.variants, {
          id: `temp-${Date.now()}`,
          ...newVariant,
          price: parseFloat(newVariant.price),
          original_price: parseFloat(newVariant.original_price) || parseFloat(newVariant.price),
          stock: parseInt(newVariant.stock) || 0
        }]
      }));
      setNewVariant({ name: "", weight: "", price: "", original_price: "", stock: "", sku: "" });
    }
  };

  const removeVariant = (index) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      if (editingProduct) {
        await axios.put(`${API}/admin/products/${editingProduct.id}`, formData, { headers });
        toast.success("Product updated successfully");
      } else {
        await axios.post(`${API}/admin/products`, formData, { headers });
        toast.success("Product created successfully");
      }
      setIsDialogOpen(false);
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to save product");
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API}/admin/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Product deleted successfully");
      fetchProducts();
    } catch (error) {
      toast.error("Failed to delete product");
    }
  };

  return (
    <AdminLayout title="Products">
      <div className="flex justify-between items-center mb-6">
        <p className="text-stone-600">{products.length} products</p>
        <Button
          onClick={openNewDialog}
          className="bg-green-700 hover:bg-green-800 rounded-xl gap-2"
          data-testid="add-product-btn"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-200"
              data-testid={`product-item-${product.id}`}
            >
              <div className="relative h-48">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {!product.is_active && (
                  <Badge className="absolute top-2 right-2 bg-red-500">Inactive</Badge>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-bold text-stone-900">{product.name}</h3>
                <p className="text-sm text-stone-500">{product.variety} • {product.category}</p>
                <div className="flex gap-2 mt-2">
                  {product.variants?.slice(0, 2).map((v, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {v.weight}: ₹{v.price}
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(product)}
                    className="flex-1 rounded-lg"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(product.id)}
                    className="text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Product Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Product Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  className="mt-1"
                  data-testid="product-name-input"
                />
              </div>
              <div>
                <Label>Variety *</Label>
                <Input
                  value={formData.variety}
                  onChange={(e) => setFormData({...formData, variety: e.target.value})}
                  required
                  className="mt-1"
                  placeholder="e.g., SR-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({...formData, category: value})}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Legumes">Legumes</SelectItem>
                    <SelectItem value="Cash Crops">Cash Crops</SelectItem>
                    <SelectItem value="Spices">Spices</SelectItem>
                    <SelectItem value="Cereals">Cereals</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Image URL *</Label>
                <Input
                  value={formData.image}
                  onChange={(e) => setFormData({...formData, image: e.target.value})}
                  required
                  className="mt-1"
                  placeholder="https://..."
                />
              </div>
            </div>

            <div>
              <Label>Description *</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
                className="mt-1"
                rows={3}
              />
            </div>

            {/* Features */}
            <div>
              <Label>Features</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  placeholder="Add a feature"
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addFeature())}
                />
                <Button type="button" onClick={addFeature} variant="outline">Add</Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.features.map((f, i) => (
                  <Badge key={i} variant="secondary" className="gap-1">
                    {f}
                    <button type="button" onClick={() => removeFeature(i)}>
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Variants */}
            <div>
              <Label>Variants *</Label>
              <div className="grid grid-cols-6 gap-2 mt-1">
                <Input
                  placeholder="Name"
                  value={newVariant.name}
                  onChange={(e) => setNewVariant({...newVariant, name: e.target.value})}
                />
                <Input
                  placeholder="Weight"
                  value={newVariant.weight}
                  onChange={(e) => setNewVariant({...newVariant, weight: e.target.value})}
                />
                <Input
                  placeholder="Price"
                  type="number"
                  value={newVariant.price}
                  onChange={(e) => setNewVariant({...newVariant, price: e.target.value})}
                />
                <Input
                  placeholder="Original"
                  type="number"
                  value={newVariant.original_price}
                  onChange={(e) => setNewVariant({...newVariant, original_price: e.target.value})}
                />
                <Input
                  placeholder="Stock"
                  type="number"
                  value={newVariant.stock}
                  onChange={(e) => setNewVariant({...newVariant, stock: e.target.value})}
                />
                <Button type="button" onClick={addVariant} variant="outline">Add</Button>
              </div>
              <div className="space-y-2 mt-2">
                {formData.variants.map((v, i) => (
                  <div key={i} className="flex items-center justify-between bg-stone-50 p-2 rounded-lg">
                    <span className="text-sm">
                      {v.name} - {v.weight} - ₹{v.price} (MRP: ₹{v.original_price}) - Stock: {v.stock}
                    </span>
                    <button type="button" onClick={() => removeVariant(i)} className="text-red-500">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
              />
              <Label>Active (visible on store)</Label>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                className="flex-1 bg-green-700 hover:bg-green-800"
                disabled={formData.variants.length === 0}
                data-testid="save-product-btn"
              >
                {editingProduct ? "Update Product" : "Create Product"}
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
