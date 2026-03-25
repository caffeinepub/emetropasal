import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { OrderStatus, Product } from "../backend.d";
import { useActor } from "./useActor";

export function useProducts() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getProducts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useProductsByCategory(category: string) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["products", "category", category],
    queryFn: async () => {
      if (!actor) return [];
      if (category === "All") return actor.getProducts();
      return actor.getProductsByCategory(category);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCategories() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCategories();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useOrders() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getOrders();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useOrder(id: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["order", id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getOrder(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useDeliveryTracking(orderId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["tracking", orderId?.toString()],
    queryFn: async () => {
      if (!actor || orderId === null) return null;
      return actor.getDeliveryTracking(orderId);
    },
    enabled: !!actor && !isFetching && orderId !== null,
    refetchInterval: 3000,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function usePlaceOrder() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      name: string;
      address: string;
      phone: string;
      cartItems: Array<[bigint, bigint]>;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.placeOrder(
        params.name,
        params.address,
        params.phone,
        params.cartItems,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["orders"] }),
  });
}

export function useAddProduct() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (product: Product) => {
      if (!actor) throw new Error("Not connected");
      return actor.addProduct(product);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useUpdateProduct() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { id: bigint; product: Product }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateProduct(params.id, params.product);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useDeleteProduct() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteProduct(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useUpdateOrderStatus() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { id: bigint; status: OrderStatus }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateOrderStatus(params.id, params.status);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["orders"] }),
  });
}

export function useUpdateDeliveryLocation() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      orderId: bigint;
      lat: number;
      lng: number;
      estimatedMinutes: bigint;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateDeliveryLocation(
        params.orderId,
        params.lat,
        params.lng,
        params.estimatedMinutes,
      );
    },
    onSuccess: (_, vars) =>
      qc.invalidateQueries({ queryKey: ["tracking", vars.orderId.toString()] }),
  });
}

export function useAddCategory() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (category: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.addCategory(category);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
}
