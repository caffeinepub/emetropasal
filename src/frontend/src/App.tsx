import CartSidebar from "@/components/CartSidebar";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { Toaster } from "@/components/ui/sonner";
import { CartProvider } from "@/context/CartContext";
import AdminPage from "@/pages/AdminPage";
import HomePage from "@/pages/HomePage";
import TrackOrderPage from "@/pages/TrackOrderPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

const queryClient = new QueryClient();

export default function App() {
  const [page, setPage] = useState("home");
  const [cartOpen, setCartOpen] = useState(false);
  const [trackOrderId, setTrackOrderId] = useState("");

  const handleTrackOrder = (id: string) => {
    setTrackOrderId(id);
    setPage("track");
  };

  const handleOrderPlaced = (orderId: string) => {
    handleTrackOrder(orderId);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <div className="min-h-screen bg-background flex flex-col">
          <Header
            currentPage={page}
            onNavigate={(p) => {
              setPage(p);
              if (p === "home") setTrackOrderId("");
            }}
            onCartOpen={() => setCartOpen(true)}
          />

          <div className="flex-1">
            {page === "home" && <HomePage onTrackOrder={handleTrackOrder} />}
            {page === "track" && (
              <TrackOrderPage initialOrderId={trackOrderId} />
            )}
            {page === "admin" && <AdminPage />}
          </div>

          <Footer />

          <CartSidebar
            open={cartOpen}
            onClose={() => setCartOpen(false)}
            onOrderPlaced={handleOrderPlaced}
          />

          <Toaster richColors position="top-right" />
        </div>
      </CartProvider>
    </QueryClientProvider>
  );
}
