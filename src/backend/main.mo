import Map "mo:core/Map";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Float "mo:core/Float";
import Principal "mo:core/Principal";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Product Types
  type Product = {
    id : Nat;
    name : Text;
    description : Text;
    price : Float;
    category : Text;
    imageUrl : Text;
    inStock : Bool;
  };

  module Product {
    public func compare(product1 : Product, product2 : Product) : Order.Order {
      Nat.compare(product1.id, product2.id);
    };
  };

  type OrderItem = {
    productId : Nat;
    quantity : Nat;
  };

  type OrderStatus = {
    #pending;
    #confirmed;
    #out_for_delivery;
    #delivered;
  };

  type Order = {
    id : Nat;
    customerId : Principal;
    items : [OrderItem];
    status : OrderStatus;
    totalAmount : Float;
    customerName : Text;
    customerAddress : Text;
    customerPhone : Text;
    createdAt : Int;
  };

  module OrderModule {
    public func compare(order1 : Order, order2 : Order) : Order.Order {
      Nat.compare(order1.id, order2.id);
    };
  };

  type DeliveryTracking = {
    orderId : Nat;
    driverLat : Float;
    driverLng : Float;
    estimatedMinutes : Nat;
    lastUpdated : Int;
  };

  // Persistent State
  let products = Map.empty<Nat, Product>();
  var nextProductId = 1;

  let categories = Map.empty<Text, Bool>();

  let orders = Map.empty<Nat, Order>();
  var nextOrderId = 1;

  let deliveryTracking = Map.empty<Nat, DeliveryTracking>();

  // Kept for migration compatibility (cart is now managed on the frontend)
  let carts = Map.empty<Principal, [(Nat, Nat)]>();

  // Product Management
  public query ({ caller }) func getProducts() : async [Product] {
    products.values().toArray().sort();
  };

  public query ({ caller }) func getProductsByCategory(category : Text) : async [Product] {
    let productsArray = products.values().toArray().filter(
      func(product) { product.category == category }
    );
    productsArray.sort();
  };

  public query ({ caller }) func getProduct(id : Nat) : async Product {
    switch (products.get(id)) {
      case (null) { Runtime.trap("Product does not exist") };
      case (?product) { product };
    };
  };

  public shared ({ caller }) func addProduct(product : Product) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add products");
    };
    let newProduct : Product = {
      product with
      id = nextProductId;
    };
    products.add(nextProductId, newProduct);
    nextProductId += 1;
    newProduct.id;
  };

  public shared ({ caller }) func updateProduct(id : Nat, product : Product) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update products");
    };
    if (not products.containsKey(id)) { Runtime.trap("Product does not exist") };
    let updatedProduct : Product = {
      product with
      id;
    };
    products.add(id, updatedProduct);
  };

  public shared ({ caller }) func deleteProduct(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete products");
    };
    if (not products.containsKey(id)) { Runtime.trap("Product does not exist") };
    products.remove(id);
  };

  // Category Management
  public query ({ caller }) func getCategories() : async [Text] {
    categories.keys().toArray().sort();
  };

  public shared ({ caller }) func addCategory(category : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add categories");
    };
    if (categories.containsKey(category)) { Runtime.trap("Category already exists") };
    categories.add(category, true);
  };

  public shared ({ caller }) func deleteCategory(category : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete categories");
    };
    if (not categories.containsKey(category)) { Runtime.trap("Category does not exist") };
    categories.remove(category);
  };

  // Order Placement — items passed directly from frontend (cart is frontend-managed)
  public shared ({ caller }) func placeOrder(
    customerName : Text,
    customerAddress : Text,
    customerPhone : Text,
    cartItems : [(Nat, Nat)], // (productId, quantity)
  ) : async Nat {
    if (cartItems.size() == 0) { Runtime.trap("Cart is empty") };

    var totalAmount : Float = 0;

    for (item in cartItems.values()) {
      switch (products.get(item.0)) {
        case (null) { Runtime.trap("Product does not exist") };
        case (?product) {
          if (not product.inStock) { Runtime.trap("Product out of stock") };
          totalAmount += product.price * item.1.toFloat();
        };
      };
    };

    let order : Order = {
      id = nextOrderId;
      customerId = caller;
      items = cartItems.map(
        func(item) { { productId = item.0; quantity = item.1 } }
      );
      status = #pending;
      totalAmount;
      customerName;
      customerAddress;
      customerPhone;
      createdAt = 0;
    };

    orders.add(nextOrderId, order);
    nextOrderId += 1;
    order.id;
  };

  public query ({ caller }) func getOrders() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all orders");
    };
    orders.values().toArray().sort();
  };

  public query ({ caller }) func getMyOrders() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #guest))) {
      Runtime.trap("Unauthorized: Only users can view their orders");
    };
    orders.values().toArray().filter(
      func(order) {
        order.customerId == caller;
      }
    ).sort();
  };

  public query ({ caller }) func getOrder(id : Nat) : async Order {
    switch (orders.get(id)) {
      case (null) { Runtime.trap("Order does not exist") };
      case (?order) {
        // Only admin or order owner can view
        if (not (AccessControl.hasPermission(accessControlState, caller, #admin)) and order.customerId != caller) {
          Runtime.trap("Unauthorized: Can only view your own orders");
        };
        order;
      };
    };
  };

  public shared ({ caller }) func updateOrderStatus(id : Nat, status : OrderStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update order status");
    };
    switch (orders.get(id)) {
      case (null) { Runtime.trap("Order does not exist") };
      case (?order) {
        let updatedOrder : Order = {
          order with
          status;
        };
        orders.add(id, updatedOrder);
      };
    };
  };

  // Delivery Tracking
  public shared ({ caller }) func updateDeliveryLocation(orderId : Nat, driverLat : Float, driverLng : Float, estimatedMinutes : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update delivery location");
    };
    let tracking : DeliveryTracking = {
      orderId;
      driverLat;
      driverLng;
      estimatedMinutes;
      lastUpdated = 0;
    };
    deliveryTracking.add(orderId, tracking);
  };

  public query ({ caller }) func getDeliveryTracking(orderId : Nat) : async DeliveryTracking {
    switch (deliveryTracking.get(orderId)) {
      case (null) { Runtime.trap("Tracking not found") };
      case (?tracking) {
        switch (orders.get(orderId)) {
          case (null) { Runtime.trap("Order does not exist") };
          case (?order) {
            if (not (AccessControl.hasPermission(accessControlState, caller, #admin)) and order.customerId != caller) {
              Runtime.trap("Unauthorized: Can only track your own orders");
            };
          };
        };
        tracking;
      };
    };
  };
};
