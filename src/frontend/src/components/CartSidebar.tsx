import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/context/CartContext";
import { usePlaceOrder } from "@/hooks/useQueries";
import { Loader2, MapPin, ShoppingCart, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface CartSidebarProps {
  open: boolean;
  onClose: () => void;
  onOrderPlaced: (orderId: string) => void;
}

export default function CartSidebar({
  open,
  onClose,
  onOrderPlaced,
}: CartSidebarProps) {
  const { items, removeItem, updateQty, total, clearCart } = useCart();
  const placeOrder = usePlaceOrder();
  const [checkout, setCheckout] = useState(false);
  const [form, setForm] = useState({ name: "", address: "", phone: "" });
  const [gpsLoading, setGpsLoading] = useState(false);

  const handlePlaceOrder = async () => {
    if (!form.name || !form.address || !form.phone) {
      toast.error("Please fill all fields");
      return;
    }
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    try {
      const cartItems: Array<[bigint, bigint]> = items.map((item) => [
        item.product.id,
        BigInt(item.quantity),
      ]);
      const orderId = await placeOrder.mutateAsync({
        name: form.name,
        address: form.address,
        phone: form.phone,
        cartItems,
      });
      clearCart();
      onClose();
      onOrderPlaced(orderId.toString());
      toast.success(`Order placed! ID: ${orderId}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to place order. Please try again.");
    }
  };

  const handleUseGPS = () => {
    if (!navigator.geolocation) {
      toast.error("GPS not supported on this device");
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setForm((p) => ({
          ...p,
          address: `${p.address ? `${p.address} | ` : ""}GPS: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
        }));
        setGpsLoading(false);
        toast.success("Location captured!");
      },
      (err) => {
        setGpsLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          toast.error("Location permission denied. Please allow access.");
        } else {
          toast.error("Could not get location. Please enter address manually.");
        }
      },
      { timeout: 10000 },
    );
  };

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 z-50"
        onClick={onClose}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
        role="presentation"
      />
      <div
        className="fixed right-0 top-0 h-full w-full max-w-md bg-card shadow-2xl z-50 flex flex-col"
        data-ocid="cart.modal"
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-primary" />
            Your Cart ({items.length})
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-muted rounded"
            data-ocid="cart.close_button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {items.length === 0 ? (
          <div
            className="flex-1 flex flex-col items-center justify-center gap-3 text-muted-foreground"
            data-ocid="cart.empty_state"
          >
            <ShoppingCart className="w-12 h-12 opacity-30" />
            <p>Your cart is empty</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {items.map((item, idx) => (
                <div
                  key={item.product.id.toString()}
                  className="flex gap-3"
                  data-ocid={`cart.item.${idx + 1}`}
                >
                  <img
                    src={
                      item.product.imageUrl ||
                      `https://picsum.photos/seed/${item.product.id}/60/60`
                    }
                    alt={item.product.name}
                    className="w-14 h-14 rounded-lg object-cover border border-border"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {item.product.name}
                    </p>
                    <p className="text-primary font-bold text-sm">
                      ${item.product.price.toFixed(2)}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <button
                        type="button"
                        className="w-6 h-6 rounded border border-border flex items-center justify-center text-sm hover:bg-muted"
                        onClick={() =>
                          updateQty(item.product.id, item.quantity - 1)
                        }
                      >
                        -
                      </button>
                      <span className="text-sm w-6 text-center">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        className="w-6 h-6 rounded border border-border flex items-center justify-center text-sm hover:bg-muted"
                        onClick={() =>
                          updateQty(item.product.id, item.quantity + 1)
                        }
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.product.id)}
                    className="p-1 text-muted-foreground hover:text-destructive"
                    data-ocid={`cart.delete_button.${idx + 1}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-border space-y-4">
              {!checkout ? (
                <>
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-primary">${total.toFixed(2)}</span>
                  </div>
                  <Button
                    className="w-full bg-primary text-primary-foreground"
                    onClick={() => setCheckout(true)}
                    data-ocid="cart.primary_button"
                  >
                    Proceed to Checkout
                  </Button>
                </>
              ) : (
                <div className="space-y-3" data-ocid="checkout.modal">
                  <h3 className="font-semibold">Delivery Details</h3>
                  <div className="space-y-1">
                    <Label htmlFor="cust-name">Full Name</Label>
                    <Input
                      id="cust-name"
                      value={form.name}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, name: e.target.value }))
                      }
                      placeholder="Your full name"
                      data-ocid="checkout.input"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="cust-addr">Delivery Address</Label>
                    <div className="flex gap-2">
                      <Input
                        id="cust-addr"
                        value={form.address}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, address: e.target.value }))
                        }
                        placeholder="Street, Tole, Ward..."
                        className="flex-1"
                        data-ocid="checkout.input"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={handleUseGPS}
                        disabled={gpsLoading}
                        title="Use my current GPS location"
                        className="shrink-0"
                      >
                        {gpsLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <MapPin className="w-4 h-4 text-primary" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Tap <MapPin className="inline w-3 h-3" /> to auto-fill
                      your GPS location
                    </p>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="cust-phone">Phone</Label>
                    <Input
                      id="cust-phone"
                      value={form.phone}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, phone: e.target.value }))
                      }
                      placeholder="+977 98XXXXXXXX"
                      data-ocid="checkout.input"
                    />
                  </div>
                  <Separator />
                  <div className="flex justify-between text-sm font-medium">
                    <span>Total</span>
                    <span className="text-primary font-bold">
                      ${total.toFixed(2)}
                    </span>
                  </div>
                  <Button
                    className="w-full bg-primary text-primary-foreground"
                    onClick={handlePlaceOrder}
                    disabled={placeOrder.isPending}
                    data-ocid="checkout.submit_button"
                  >
                    {placeOrder.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Placing Order...
                      </>
                    ) : (
                      "Confirm Order"
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => setCheckout(false)}
                    data-ocid="checkout.cancel_button"
                  >
                    Back to Cart
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
