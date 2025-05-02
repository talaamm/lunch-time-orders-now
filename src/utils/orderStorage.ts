
import { OrderDetails } from "../types/menu";

const ORDERS_STORAGE_KEY = 'cafeteria_recent_orders';
const ORDER_EXPIRY_TIME = 6 * 60 * 60 * 1000; // 6 hours in milliseconds

export const saveOrder = (order: OrderDetails): void => {
  try {
    // Get existing orders
    const existingOrdersJSON = localStorage.getItem(ORDERS_STORAGE_KEY);
    let orders: OrderDetails[] = existingOrdersJSON ? JSON.parse(existingOrdersJSON) : [];
    
    // Add new order
    orders.push({
      ...order,
      orderedAt: Date.now()
    });
    
    // Store updated orders
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  } catch (error) {
    console.error("Error saving order to local storage:", error);
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
