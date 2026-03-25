import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface DeliveryTracking {
    lastUpdated: bigint;
    orderId: bigint;
    driverLat: number;
    driverLng: number;
    estimatedMinutes: bigint;
}
export interface Order {
    id: bigint;
    customerName: string;
    status: OrderStatus;
    customerPhone: string;
    createdAt: bigint;
    customerAddress: string;
    totalAmount: number;
    customerId: Principal;
    items: Array<OrderItem>;
}
export interface Product {
    id: bigint;
    inStock: boolean;
    name: string;
    description: string;
    imageUrl: string;
    category: string;
    price: number;
}
export interface OrderItem {
    productId: bigint;
    quantity: bigint;
}
export enum OrderStatus {
    pending = "pending",
    out_for_delivery = "out_for_delivery",
    delivered = "delivered",
    confirmed = "confirmed"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addCategory(category: string): Promise<void>;
    addProduct(product: Product): Promise<bigint>;
    addToCart(productId: bigint, quantity: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteCategory(category: string): Promise<void>;
    deleteProduct(id: bigint): Promise<void>;
    getCallerUserRole(): Promise<UserRole>;
    getCart(): Promise<Array<[bigint, bigint]>>;
    getCategories(): Promise<Array<string>>;
    getDeliveryTracking(orderId: bigint): Promise<DeliveryTracking>;
    getMyOrders(): Promise<Array<Order>>;
    getOrder(id: bigint): Promise<Order>;
    getOrders(): Promise<Array<Order>>;
    getProduct(id: bigint): Promise<Product>;
    getProducts(): Promise<Array<Product>>;
    getProductsByCategory(category: string): Promise<Array<Product>>;
    isCallerAdmin(): Promise<boolean>;
    placeOrder(customerName: string, customerAddress: string, customerPhone: string): Promise<bigint>;
    removeFromCart(productId: bigint): Promise<void>;
    updateDeliveryLocation(orderId: bigint, driverLat: number, driverLng: number, estimatedMinutes: bigint): Promise<void>;
    updateOrderStatus(id: bigint, status: OrderStatus): Promise<void>;
    updateProduct(id: bigint, product: Product): Promise<void>;
}
