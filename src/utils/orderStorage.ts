import { OrderDetails } from "../types/menu";

const ORDERS_STORAGE_KEY = 'cafeteria_recent_orders';
const ORDER_EXPIRY_TIME = 6 * 60 * 60 * 1000; // 6 hours in milliseconds

export const saveOrder = (order: OrderDetails): OrderDetails & { id: string } => {
  try {
    // Get existing orders
    const existingOrdersJSON = localStorage.getItem(ORDERS_STORAGE_KEY);
    let orders: (OrderDetails & { id: string })[] = existingOrdersJSON ? JSON.parse(existingOrdersJSON) : [];
    
    // Generate a unique ID for the order
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Add new order with ID
    const orderWithId = {
      ...order,
      id: orderId,
      orderedAt: Date.now()
    };
    
    orders.push(orderWithId);
    
    // Store updated orders
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    
    return orderWithId;
  } catch (error) {
    console.error("Error saving order to local storage:", error);
    throw error;
  }
};

export const getRecentOrders = (): OrderDetails[] => {
  try {
    const now = Date.now();
    const ordersJSON = localStorage.getItem(ORDERS_STORAGE_KEY);
    
    if (!ordersJSON) return [];
    
    const allOrders: OrderDetails[] = JSON.parse(ordersJSON);
    
    // Filter out expired orders (older than 6 hours)
    const recentOrders = allOrders.filter(order => 
      now - order.orderedAt < ORDER_EXPIRY_TIME
    );
    
    // Update storage if we filtered out some orders
    if (recentOrders.length < allOrders.length) {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(recentOrders));
    }
    
    return recentOrders;
  } catch (error) {
    console.error("Error retrieving orders from local storage:", error);
    return [];
  }
};
