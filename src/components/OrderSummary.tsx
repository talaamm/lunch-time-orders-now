
import React from "react";
import { CartItem } from "../types/menu";
import OrderItem from "./OrderItem";

interface OrderSummaryProps {
  items: CartItem[];
  updateQuantity: (id: string, quantity: number) => void;
  updateNotes: (id: string, notes: string) => void;
  removeItem: (id: string) => void;
  currencySymbol?: string;
}

const OrderSummary = ({ items, updateQuantity, updateNotes, removeItem, currencySymbol = "₪" }: OrderSummaryProps) => {
  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity, 
    0
  );

  if (items.length === 0) {
    return (
      <div className="text-center p-6 text-gray-500">
        <p>Your order is empty</p>
        <p className="text-sm">Add items from the menu to get started</p>
      </div>
    );
  }

  return (
    <div>
      <div className="max-h-80 overflow-y-auto">
        {items.map((item) => (
          <OrderItem
            key={item.id}
            item={item}
            updateQuantity={updateQuantity}
            updateNotes={updateNotes}
            removeItem={removeItem}
          />
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t">
        <div className="flex justify-between font-medium">
          <span>Total</span>
          <span>{currencySymbol}{total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
