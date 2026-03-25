import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useIsAdmin } from "@/hooks/useQueries";
import {
  LayoutDashboard,
  ShoppingBag,
  ShoppingCart,
  Truck,
  User,
} from "lucide-react";

interface HeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onCartOpen: () => void;
}

export default function Header({
  currentPage,
  onNavigate,
  onCartOpen,
}: HeaderProps) {
  const { count } = useCart();
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const { data: isAdmin } = useIsAdmin();
  const isLoggedIn = loginStatus === "success" && !!identity;

  return (
    <header className="bg-card border-b border-border sticky top-0 z-40 shadow-xs">
      {/* Row 1 */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
        <button
          type="button"
          onClick={() => onNavigate("home")}
          className="flex items-center gap-2 font-bold text-xl text-primary"
          data-ocid="nav.link"
        >
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <ShoppingBag className="w-5 h-5 text-primary-foreground" />
          </div>
          <span>Emetropasal</span>
        </button>

        <div className="flex-1 max-w-lg mx-auto">
          <div className="relative">
            <input
              type="search"
              placeholder="Search products..."
              className="w-full px-4 py-2 pl-10 bg-muted border border-border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              data-ocid="header.search_input"
            />
            <svg
              aria-hidden="true"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCartOpen}
            className="relative p-2 hover:bg-muted rounded-lg transition-colors"
            data-ocid="cart.open_modal_button"
          >
            <ShoppingCart className="w-5 h-5" />
            {count > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-primary text-primary-foreground text-xs">
                {count}
              </Badge>
            )}
          </button>

          {isLoggedIn ? (
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <Button
                variant="outline"
                size="sm"
                onClick={clear}
                data-ocid="auth.button"
              >
                Sign Out
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              onClick={login}
              disabled={loginStatus === "logging-in"}
              className="bg-[oklch(0.22_0.04_250)] text-white hover:bg-[oklch(0.28_0.04_250)]"
              data-ocid="auth.button"
            >
              Sign In
            </Button>
          )}
        </div>
      </div>

      {/* Row 2 - Nav */}
      <div className="max-w-7xl mx-auto px-4 pb-2 flex gap-6 text-sm font-medium">
        <button
          type="button"
          onClick={() => onNavigate("home")}
          className={`flex items-center gap-1.5 py-1 border-b-2 transition-colors ${
            currentPage === "home"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
          data-ocid="nav.shop.link"
        >
          <ShoppingBag className="w-4 h-4" />
          Shop
        </button>

        <button
          type="button"
          onClick={() => onNavigate("track")}
          className={`flex items-center gap-1.5 py-1 border-b-2 transition-colors ${
            currentPage === "track"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
          data-ocid="nav.track.link"
        >
          <Truck className="w-4 h-4" />
          Track Order
        </button>

        {(isAdmin || isLoggedIn) && (
          <button
            type="button"
            onClick={() => onNavigate("admin")}
            className={`flex items-center gap-1.5 py-1 border-b-2 transition-colors ${
              currentPage === "admin"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
            data-ocid="nav.admin.link"
          >
            <LayoutDashboard className="w-4 h-4" />
            Admin Dashboard
          </button>
        )}
      </div>
    </header>
  );
}
