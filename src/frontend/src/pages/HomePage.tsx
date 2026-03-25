import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/context/CartContext";
import { useCategories, useProducts } from "@/hooks/useQueries";
import {
  ChevronRight,
  Clock,
  Shield,
  ShoppingCart,
  Star,
  Truck,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Product } from "../backend.d";

const CATEGORY_STYLES: Record<string, { bg: string; emoji: string }> = {
  Fruits: { bg: "bg-[oklch(0.93_0.05_160)]", emoji: "🍎" },
  Vegetables: { bg: "bg-[oklch(0.93_0.06_140)]", emoji: "🥦" },
  Dairy: { bg: "bg-[oklch(0.93_0.04_220)]", emoji: "🥛" },
  Bakery: { bg: "bg-[oklch(0.93_0.04_260)]", emoji: "🍞" },
  Beverages: { bg: "bg-[oklch(0.93_0.05_0)]", emoji: "🧃" },
  Snacks: { bg: "bg-[oklch(0.93_0.04_60)]", emoji: "🍿" },
};

const FALLBACK_PRODUCTS: Product[] = [
  {
    id: BigInt(1),
    name: "Organic Bananas",
    category: "Fruits",
    price: 1.99,
    description: "Ripe organic bananas",
    imageUrl: "https://picsum.photos/seed/banana/300/200",
    inStock: true,
  },
  {
    id: BigInt(2),
    name: "Fresh Spinach",
    category: "Vegetables",
    price: 2.49,
    description: "Baby spinach leaves",
    imageUrl: "https://picsum.photos/seed/spinach/300/200",
    inStock: true,
  },
  {
    id: BigInt(3),
    name: "Whole Milk 1L",
    category: "Dairy",
    price: 1.79,
    description: "Fresh whole milk",
    imageUrl: "https://picsum.photos/seed/milk/300/200",
    inStock: true,
  },
  {
    id: BigInt(4),
    name: "Sourdough Bread",
    category: "Bakery",
    price: 3.99,
    description: "Artisan sourdough",
    imageUrl: "https://picsum.photos/seed/bread/300/200",
    inStock: true,
  },
  {
    id: BigInt(5),
    name: "Orange Juice",
    category: "Beverages",
    price: 3.49,
    description: "Freshly squeezed",
    imageUrl: "https://picsum.photos/seed/oj/300/200",
    inStock: true,
  },
  {
    id: BigInt(6),
    name: "Mixed Nuts",
    category: "Snacks",
    price: 5.99,
    description: "Roasted mixed nuts",
    imageUrl: "https://picsum.photos/seed/nuts/300/200",
    inStock: true,
  },
  {
    id: BigInt(7),
    name: "Red Apples",
    category: "Fruits",
    price: 2.29,
    description: "Crisp red apples",
    imageUrl: "https://picsum.photos/seed/apple/300/200",
    inStock: true,
  },
  {
    id: BigInt(8),
    name: "Cheddar Cheese",
    category: "Dairy",
    price: 4.49,
    description: "Aged cheddar",
    imageUrl: "https://picsum.photos/seed/cheese/300/200",
    inStock: true,
  },
];

const FALLBACK_CATEGORIES = [
  "All",
  "Fruits",
  "Vegetables",
  "Dairy",
  "Bakery",
  "Beverages",
  "Snacks",
];

export default function HomePage({
  onTrackOrder,
}: { onTrackOrder: (id: string) => void }) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const { data: products, isLoading: productsLoading } = useProducts();
  const { data: backendCategories } = useCategories();
  const { addItem } = useCart();

  const allProducts =
    products && products.length > 0 ? products : FALLBACK_PRODUCTS;
  const categories = [
    "All",
    ...(backendCategories && backendCategories.length > 0
      ? backendCategories
      : FALLBACK_CATEGORIES.slice(1)),
  ];

  const filtered =
    selectedCategory === "All"
      ? allProducts
      : allProducts.filter((p) => p.category === selectedCategory);

  const handleAdd = (product: Product) => {
    addItem(product);
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <main>
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 pt-8 pb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-[oklch(0.95_0.03_176)] rounded-2xl overflow-hidden"
        >
          <div className="grid md:grid-cols-2 gap-6 p-8 md:p-12">
            <div className="flex flex-col justify-center gap-4">
              <Badge className="w-fit bg-primary/10 text-primary border-0 font-medium">
                🚀 Free delivery on orders over $30
              </Badge>
              <h1 className="text-4xl md:text-5xl font-extrabold leading-tight text-foreground">
                Fresh Groceries,
                <br />
                <span className="text-primary">Delivered Fast</span>
              </h1>
              <p className="text-muted-foreground text-base">
                Shop thousands of fresh items and track your delivery in
                real-time. Farm to doorstep in under 2 hours.
              </p>
              <div className="flex gap-3 flex-wrap">
                <Button
                  className="bg-primary text-primary-foreground rounded-full px-6"
                  data-ocid="hero.primary_button"
                >
                  Shop Now <ChevronRight className="ml-1 w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  className="rounded-full px-6"
                  onClick={() => onTrackOrder("")}
                  data-ocid="hero.secondary_button"
                >
                  Track Order
                </Button>
              </div>
              <div className="flex gap-6 text-sm text-muted-foreground pt-2">
                <span className="flex items-center gap-1">
                  <Truck className="w-4 h-4 text-primary" /> Fast Delivery
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-primary" /> Live Tracking
                </span>
                <span className="flex items-center gap-1">
                  <Shield className="w-4 h-4 text-primary" /> Fresh Guarantee
                </span>
              </div>
            </div>
            <div className="hidden md:flex items-center justify-center">
              <img
                src="/assets/generated/hero-groceries.dim_600x400.jpg"
                alt="Fresh groceries"
                className="rounded-xl w-full max-w-sm object-cover shadow-lg"
              />
            </div>
          </div>
        </motion.div>
      </section>

      {/* Category tiles */}
      <section className="max-w-7xl mx-auto px-4 py-6">
        <h2 className="text-2xl font-bold mb-4">Shop by Category</h2>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat) => {
            const style = CATEGORY_STYLES[cat] || {
              bg: "bg-muted",
              emoji: "🛒",
            };
            const isSelected = selectedCategory === cat;
            return (
              <button
                type="button"
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`flex flex-col items-center gap-1.5 px-5 py-4 rounded-xl flex-shrink-0 transition-all border-2 ${
                  isSelected
                    ? "border-primary shadow-md scale-105"
                    : "border-transparent hover:border-border"
                } ${cat === "All" ? "bg-primary/10" : style.bg}`}
                data-ocid="nav.tab"
              >
                <span className="text-2xl">
                  {cat === "All" ? "🛒" : CATEGORY_STYLES[cat]?.emoji || "🛍️"}
                </span>
                <span className="text-xs font-semibold text-foreground whitespace-nowrap">
                  {cat}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Products */}
      <section className="max-w-7xl mx-auto px-4 py-4 pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Featured Products</h2>
          <span className="text-sm text-muted-foreground">
            {filtered.length} items
          </span>
        </div>

        {productsLoading ? (
          <div
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
            data-ocid="products.loading_state"
          >
            {Array.from({ length: 8 }, (_, i) => i).map((i) => (
              <div
                key={`skeleton-${i}`}
                className="bg-card rounded-xl border border-border p-3 space-y-3"
              >
                <Skeleton className="w-full h-40 rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-9 w-full" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div
            className="text-center py-16 text-muted-foreground"
            data-ocid="products.empty_state"
          >
            <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No products in this category</p>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
          >
            {filtered.map((product, idx) => (
              <motion.div
                key={product.id.toString()}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
                className="bg-card rounded-xl border border-border shadow-xs hover:shadow-card transition-shadow overflow-hidden group"
                data-ocid={`products.item.${idx + 1}`}
              >
                <div className="relative overflow-hidden">
                  <img
                    src={
                      product.imageUrl ||
                      `https://picsum.photos/seed/${product.id}/300/200`
                    }
                    alt={product.name}
                    className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <Badge className="absolute top-2 left-2 bg-[oklch(0.93_0.05_160)] text-foreground border-0 text-xs">
                    {product.category}
                  </Badge>
                  {!product.inStock && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Badge variant="destructive">Out of Stock</Badge>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="font-semibold text-sm mb-1 line-clamp-1">
                    {product.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
                    {product.description}
                  </p>
                  <div className="flex items-center gap-1 mb-3">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3 h-3 ${s <= 4 ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`}
                      />
                    ))}
                    <span className="text-xs text-muted-foreground ml-1">
                      (24)
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-primary text-lg">
                      ${product.price.toFixed(2)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      per unit
                    </span>
                  </div>
                  <Button
                    className="w-full bg-primary text-primary-foreground text-xs h-9"
                    onClick={() => handleAdd(product)}
                    disabled={!product.inStock}
                    data-ocid={`products.button.${idx + 1}`}
                  >
                    <ShoppingCart className="w-3.5 h-3.5 mr-1.5" />
                    Add to Cart
                  </Button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>
    </main>
  );
}
