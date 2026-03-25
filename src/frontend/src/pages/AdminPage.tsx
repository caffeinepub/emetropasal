import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import {
  useAddProduct,
  useDeleteProduct,
  useIsAdmin,
  useOrders,
  useProducts,
  useUpdateDeliveryLocation,
  useUpdateOrderStatus,
  useUpdateProduct,
} from "@/hooks/useQueries";
import {
  Edit,
  Loader2,
  Package,
  Plus,
  RefreshCw,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { OrderStatus } from "../backend.d";
import type { Product } from "../backend.d";

const EMPTY_PRODUCT: Omit<Product, "id"> = {
  name: "",
  description: "",
  category: "Fruits",
  price: 0,
  imageUrl: "",
  inStock: true,
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  [OrderStatus.pending]: "bg-muted text-muted-foreground",
  [OrderStatus.confirmed]: "bg-blue-100 text-blue-700",
  [OrderStatus.out_for_delivery]: "bg-amber-100 text-amber-700",
  [OrderStatus.delivered]: "bg-primary/10 text-primary",
};

export default function AdminPage() {
  const { login, loginStatus, identity } = useInternetIdentity();
  const { data: isAdmin, isLoading: checkingAdmin } = useIsAdmin();
  const { data: products } = useProducts();
  const { data: orders } = useOrders();

  const addProduct = useAddProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const updateStatus = useUpdateOrderStatus();
  const updateLocation = useUpdateDeliveryLocation();

  const [productDialog, setProductDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] =
    useState<Omit<Product, "id">>(EMPTY_PRODUCT);

  const [locationDialog, setLocationDialog] = useState(false);
  const [locationForm, setLocationForm] = useState({
    orderId: "",
    lat: "",
    lng: "",
    eta: "15",
  });

  const isLoggedIn = loginStatus === "success" && !!identity;

  if (!isLoggedIn) {
    return (
      <div
        className="max-w-md mx-auto px-4 py-20 text-center"
        data-ocid="admin.section"
      >
        <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-40" />
        <h2 className="text-2xl font-bold mb-2">Admin Access Required</h2>
        <p className="text-muted-foreground mb-6">
          Please sign in to access the admin dashboard.
        </p>
        <Button
          className="bg-primary text-primary-foreground px-8"
          onClick={login}
          disabled={loginStatus === "logging-in"}
          data-ocid="admin.primary_button"
        >
          {loginStatus === "logging-in" ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign In"
          )}
        </Button>
      </div>
    );
  }

  if (checkingAdmin) {
    return (
      <div
        className="flex items-center justify-center py-20"
        data-ocid="admin.loading_state"
      >
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div
        className="max-w-md mx-auto px-4 py-20 text-center"
        data-ocid="admin.error_state"
      >
        <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
        <p className="text-muted-foreground">
          You don't have admin privileges.
        </p>
      </div>
    );
  }

  const openAddDialog = () => {
    setEditingProduct(null);
    setProductForm(EMPTY_PRODUCT);
    setProductDialog(true);
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description,
      category: product.category,
      price: product.price,
      imageUrl: product.imageUrl,
      inStock: product.inStock,
    });
    setProductDialog(true);
  };

  const handleSaveProduct = async () => {
    if (!productForm.name || !productForm.category) {
      toast.error("Please fill required fields");
      return;
    }
    try {
      if (editingProduct) {
        await updateProduct.mutateAsync({
          id: editingProduct.id,
          product: { ...productForm, id: editingProduct.id },
        });
        toast.success("Product updated!");
      } else {
        await addProduct.mutateAsync({ ...productForm, id: BigInt(0) });
        toast.success("Product added!");
      }
      setProductDialog(false);
    } catch {
      toast.error("Failed to save product");
    }
  };

  const handleDeleteProduct = async (id: bigint) => {
    if (!confirm("Delete this product?")) return;
    try {
      await deleteProduct.mutateAsync(id);
      toast.success("Product deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleUpdateStatus = async (id: bigint, status: OrderStatus) => {
    try {
      await updateStatus.mutateAsync({ id, status });
      toast.success("Status updated!");
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleUpdateLocation = async () => {
    try {
      await updateLocation.mutateAsync({
        orderId: BigInt(locationForm.orderId),
        lat: Number.parseFloat(locationForm.lat),
        lng: Number.parseFloat(locationForm.lng),
        estimatedMinutes: BigInt(locationForm.eta),
      });
      toast.success("Location updated!");
      setLocationDialog(false);
    } catch {
      toast.error("Failed to update location");
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Manage products, orders, and deliveries
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setLocationDialog(true)}
              data-ocid="admin.secondary_button"
            >
              <RefreshCw className="w-4 h-4 mr-2" /> Update Driver Location
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "Total Products",
              value: products?.length || 0,
              icon: ShoppingBag,
              color: "text-primary",
            },
            {
              label: "Total Orders",
              value: orders?.length || 0,
              icon: Package,
              color: "text-blue-600",
            },
            {
              label: "Pending Orders",
              value:
                orders?.filter((o) => o.status === OrderStatus.pending)
                  .length || 0,
              icon: Package,
              color: "text-amber-600",
            },
            {
              label: "Delivered",
              value:
                orders?.filter((o) => o.status === OrderStatus.delivered)
                  .length || 0,
              icon: Package,
              color: "text-primary",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-card border border-border rounded-xl p-4 shadow-xs"
            >
              <stat.icon className={`w-5 h-5 mb-2 ${stat.color}`} />
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        <Tabs defaultValue="products" data-ocid="admin.panel">
          <TabsList className="mb-6">
            <TabsTrigger value="products" data-ocid="admin.tab">
              Products
            </TabsTrigger>
            <TabsTrigger value="orders" data-ocid="admin.tab">
              Orders
            </TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg">Product Management</h2>
              <Button
                className="bg-primary text-primary-foreground"
                onClick={openAddDialog}
                data-ocid="products.open_modal_button"
              >
                <Plus className="w-4 h-4 mr-2" /> Add Product
              </Button>
            </div>

            {!products?.length ? (
              <div
                className="text-center py-12 text-muted-foreground"
                data-ocid="products.empty_state"
              >
                <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No products yet. Add your first product!</p>
              </div>
            ) : (
              <div className="bg-card rounded-xl border border-border overflow-hidden">
                <Table data-ocid="products.table">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product, idx) => (
                      <TableRow
                        key={product.id.toString()}
                        data-ocid={`products.row.${idx + 1}`}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <img
                              src={
                                product.imageUrl ||
                                `https://picsum.photos/seed/${product.id}/40/40`
                              }
                              alt={product.name}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                            <div>
                              <p className="font-medium text-sm">
                                {product.name}
                              </p>
                              <p className="text-xs text-muted-foreground line-clamp-1">
                                {product.description}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {product.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-bold text-primary">
                          ${product.price.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              product.inStock
                                ? "bg-primary/10 text-primary border-0"
                                : "bg-destructive/10 text-destructive border-0"
                            }
                          >
                            {product.inStock ? "In Stock" : "Out of Stock"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditDialog(product)}
                              data-ocid={`products.edit_button.${idx + 1}`}
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteProduct(product.id)}
                              data-ocid={`products.delete_button.${idx + 1}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <h2 className="font-bold text-lg mb-4">Order Management</h2>
            {!orders?.length ? (
              <div
                className="text-center py-12 text-muted-foreground"
                data-ocid="orders.empty_state"
              >
                <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No orders yet</p>
              </div>
            ) : (
              <div className="bg-card rounded-xl border border-border overflow-hidden">
                <Table data-ocid="orders.table">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Update Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order, idx) => (
                      <TableRow
                        key={order.id.toString()}
                        data-ocid={`orders.row.${idx + 1}`}
                      >
                        <TableCell className="font-mono text-sm">
                          #{order.id.toString()}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm">
                              {order.customerName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {order.customerPhone}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="font-bold text-primary">
                          ${order.totalAmount.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`${STATUS_COLORS[order.status]} border-0 text-xs`}
                          >
                            {order.status.replace(/_/g, " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={order.status}
                            onValueChange={(v) =>
                              handleUpdateStatus(order.id, v as OrderStatus)
                            }
                          >
                            <SelectTrigger
                              className="w-40 h-8 text-xs"
                              data-ocid={`orders.select.${idx + 1}`}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={OrderStatus.pending}>
                                Pending
                              </SelectItem>
                              <SelectItem value={OrderStatus.confirmed}>
                                Confirmed
                              </SelectItem>
                              <SelectItem value={OrderStatus.out_for_delivery}>
                                Out for Delivery
                              </SelectItem>
                              <SelectItem value={OrderStatus.delivered}>
                                Delivered
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Product Dialog */}
      <Dialog open={productDialog} onOpenChange={setProductDialog}>
        <DialogContent className="max-w-lg" data-ocid="products.dialog">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? "Edit Product" : "Add New Product"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="prod-name">Name *</Label>
                <Input
                  id="prod-name"
                  value={productForm.name}
                  onChange={(e) =>
                    setProductForm((p) => ({ ...p, name: e.target.value }))
                  }
                  data-ocid="products.input"
                />
              </div>
              <div className="space-y-1">
                <Label>Category *</Label>
                <Select
                  value={productForm.category}
                  onValueChange={(v) =>
                    setProductForm((p) => ({ ...p, category: v }))
                  }
                >
                  <SelectTrigger data-ocid="products.select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      "Fruits",
                      "Vegetables",
                      "Dairy",
                      "Bakery",
                      "Beverages",
                      "Snacks",
                    ].map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="prod-desc">Description</Label>
              <Textarea
                id="prod-desc"
                value={productForm.description}
                onChange={(e) =>
                  setProductForm((p) => ({ ...p, description: e.target.value }))
                }
                rows={2}
                data-ocid="products.textarea"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="prod-price">Price ($)</Label>
                <Input
                  id="prod-price"
                  type="number"
                  value={productForm.price}
                  onChange={(e) =>
                    setProductForm((p) => ({
                      ...p,
                      price: Number.parseFloat(e.target.value) || 0,
                    }))
                  }
                  data-ocid="products.input"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="prod-img">Image URL</Label>
                <Input
                  id="prod-img"
                  value={productForm.imageUrl}
                  onChange={(e) =>
                    setProductForm((p) => ({ ...p, imageUrl: e.target.value }))
                  }
                  placeholder="https://..."
                  data-ocid="products.input"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={productForm.inStock}
                onCheckedChange={(v) =>
                  setProductForm((p) => ({ ...p, inStock: v }))
                }
                data-ocid="products.switch"
              />
              <Label>In Stock</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setProductDialog(false)}
              data-ocid="products.cancel_button"
            >
              Cancel
            </Button>
            <Button
              className="bg-primary text-primary-foreground"
              onClick={handleSaveProduct}
              disabled={addProduct.isPending || updateProduct.isPending}
              data-ocid="products.save_button"
            >
              {addProduct.isPending || updateProduct.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Product"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Driver Location Dialog */}
      <Dialog open={locationDialog} onOpenChange={setLocationDialog}>
        <DialogContent data-ocid="location.dialog">
          <DialogHeader>
            <DialogTitle>Update Driver Location</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label htmlFor="loc-order">Order ID</Label>
              <Input
                id="loc-order"
                value={locationForm.orderId}
                onChange={(e) =>
                  setLocationForm((p) => ({ ...p, orderId: e.target.value }))
                }
                placeholder="e.g. 1"
                data-ocid="location.input"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="loc-lat">Latitude</Label>
                <Input
                  id="loc-lat"
                  value={locationForm.lat}
                  onChange={(e) =>
                    setLocationForm((p) => ({ ...p, lat: e.target.value }))
                  }
                  placeholder="40.7128"
                  data-ocid="location.input"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="loc-lng">Longitude</Label>
                <Input
                  id="loc-lng"
                  value={locationForm.lng}
                  onChange={(e) =>
                    setLocationForm((p) => ({ ...p, lng: e.target.value }))
                  }
                  placeholder="-74.006"
                  data-ocid="location.input"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="loc-eta">ETA (minutes)</Label>
              <Input
                id="loc-eta"
                type="number"
                value={locationForm.eta}
                onChange={(e) =>
                  setLocationForm((p) => ({ ...p, eta: e.target.value }))
                }
                data-ocid="location.input"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setLocationDialog(false)}
              data-ocid="location.cancel_button"
            >
              Cancel
            </Button>
            <Button
              className="bg-primary text-primary-foreground"
              onClick={handleUpdateLocation}
              disabled={updateLocation.isPending}
              data-ocid="location.save_button"
            >
              {updateLocation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Update Location
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
