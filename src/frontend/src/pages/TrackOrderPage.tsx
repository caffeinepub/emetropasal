import LeafletMap from "@/components/LeafletMap";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useDeliveryTracking, useOrder } from "@/hooks/useQueries";
import { CheckCircle, Clock, Home, Package, Search, Truck } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { OrderStatus } from "../backend.d";

const STATUS_STEPS = [
  { key: OrderStatus.pending, label: "Order Placed", icon: Package },
  { key: OrderStatus.confirmed, label: "Confirmed", icon: CheckCircle },
  { key: OrderStatus.out_for_delivery, label: "Out for Delivery", icon: Truck },
  { key: OrderStatus.delivered, label: "Delivered", icon: Home },
];

function getStepIndex(status: OrderStatus) {
  return STATUS_STEPS.findIndex((s) => s.key === status);
}

export default function TrackOrderPage({
  initialOrderId,
}: { initialOrderId?: string }) {
  const [inputId, setInputId] = useState(initialOrderId || "");
  const [searchId, setSearchId] = useState<bigint | null>(
    initialOrderId ? BigInt(initialOrderId) : null,
  );

  const {
    data: order,
    isLoading: orderLoading,
    error: orderError,
  } = useOrder(searchId);
  const { data: tracking } = useDeliveryTracking(
    order?.status === OrderStatus.out_for_delivery ? searchId : null,
  );

  const handleSearch = () => {
    const trimmed = inputId.trim();
    if (!trimmed) return;
    try {
      setSearchId(BigInt(trimmed));
    } catch {
      setSearchId(null);
    }
  };

  const currentStep = order ? getStepIndex(order.status) : -1;

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-extrabold mb-2">Track Your Order</h1>
        <p className="text-muted-foreground mb-8">
          Enter your order ID to see live status and driver location.
        </p>

        {/* Search */}
        <div className="flex gap-3 mb-8" data-ocid="track.section">
          <Input
            placeholder="Enter Order ID (e.g. 1)"
            value={inputId}
            onChange={(e) => setInputId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="max-w-xs"
            data-ocid="track.input"
          />
          <Button
            onClick={handleSearch}
            className="bg-primary text-primary-foreground"
            data-ocid="track.primary_button"
          >
            <Search className="w-4 h-4 mr-2" /> Track
          </Button>
        </div>

        {/* Loading */}
        {orderLoading && (
          <div
            className="text-center py-12 text-muted-foreground"
            data-ocid="track.loading_state"
          >
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Loading order...
          </div>
        )}

        {/* Error */}
        {orderError && (
          <div
            className="bg-destructive/10 text-destructive rounded-xl p-4"
            data-ocid="track.error_state"
          >
            Order not found. Please check your Order ID.
          </div>
        )}

        {/* Order Details */}
        {order && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-card rounded-2xl border border-border shadow-card overflow-hidden"
          >
            {/* Status bar */}
            <div className="bg-primary/5 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Order #{order.id.toString()}
                  </p>
                  <p className="font-bold text-lg">{order.customerName}</p>
                  <p className="text-sm text-muted-foreground">
                    {order.customerAddress}
                  </p>
                </div>
                <Badge
                  className={`${
                    order.status === OrderStatus.delivered
                      ? "bg-primary/10 text-primary"
                      : order.status === OrderStatus.out_for_delivery
                        ? "bg-amber-100 text-amber-700"
                        : "bg-muted text-muted-foreground"
                  } border-0 font-medium`}
                >
                  {order.status
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (c) => c.toUpperCase())}
                </Badge>
              </div>

              {/* Progress steps */}
              <div className="flex items-center">
                {STATUS_STEPS.map((step, idx) => {
                  const Icon = step.icon;
                  const done = idx <= currentStep;
                  const active = idx === currentStep;
                  return (
                    <div key={step.key} className="flex items-center flex-1">
                      <div className="flex flex-col items-center gap-1">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                            done
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          } ${active ? "ring-4 ring-primary/20" : ""}`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <span
                          className={`text-xs text-center font-medium ${done ? "text-primary" : "text-muted-foreground"}`}
                        >
                          {step.label}
                        </span>
                      </div>
                      {idx < STATUS_STEPS.length - 1 && (
                        <div
                          className={`flex-1 h-1 mx-2 rounded-full ${idx < currentStep ? "bg-primary" : "bg-muted"}`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-6 grid md:grid-cols-2 gap-6">
              {/* Map */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-primary" />
                  {order.status === OrderStatus.out_for_delivery
                    ? "Live Driver Location"
                    : "Delivery Map"}
                </h3>
                <LeafletMap
                  lat={tracking?.driverLat ?? 40.7128}
                  lng={tracking?.driverLng ?? -74.006}
                  className="h-64 w-full rounded-xl"
                />
                {tracking && (
                  <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    ETA: ~{tracking.estimatedMinutes.toString()} minutes
                  </p>
                )}
              </div>

              {/* Timeline */}
              <div>
                <h3 className="font-semibold mb-4">Order Summary</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Customer</span>
                    <span className="font-medium">{order.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phone</span>
                    <span className="font-medium">{order.customerPhone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Address</span>
                    <span className="font-medium text-right max-w-[200px]">
                      {order.customerAddress}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Items</span>
                    <span className="font-medium">
                      {order.items.length} item(s)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total</span>
                    <span className="font-bold text-primary">
                      ${order.totalAmount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Placed</span>
                    <span className="font-medium">
                      {new Date(
                        Number(order.createdAt) / 1_000_000,
                      ).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {order.status === OrderStatus.out_for_delivery && (
                  <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <p className="text-amber-700 text-sm font-medium flex items-center gap-2">
                      <Truck className="w-4 h-4" />
                      Your order is on the way! Map updates every 3s.
                    </p>
                  </div>
                )}

                {order.status === OrderStatus.delivered && (
                  <div className="mt-4 p-3 bg-primary/10 rounded-lg">
                    <p className="text-primary text-sm font-medium flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Order delivered successfully!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {!searchId && (
          <div
            className="text-center py-16 text-muted-foreground"
            data-ocid="track.empty_state"
          >
            <Package className="w-14 h-14 mx-auto mb-3 opacity-20" />
            <p className="text-lg font-medium">
              Enter an Order ID to start tracking
            </p>
            <p className="text-sm">
              You'll receive your Order ID after placing an order
            </p>
          </div>
        )}
      </motion.div>
    </main>
  );
}
