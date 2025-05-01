
import React from "react";
import { CartItem } from "../types/menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Minus, Plus } from "lucide-react";

interface OrderItemProps {
  item: CartItem;
  updateQuantity: (id: string, quantity: number) => void;
  updateNotes: (id: string, notes: string) => void;
  removeItem: (id: string) => void;
}

const OrderItem = ({ item, updateQuantity, updateNotes, removeItem }: OrderItemProps) => {
  return (
    <div className="border-b py-4">
      <div className="flex justify-between mb-2">
        <div>
          <h3 className="font-medium">{item.name}</h3>
          <p className="text-sm text-gray-500">{item.category} • €{item.price.toFixed(2)}</p>
        </div>
        <div className="flex items-center">
          <Button 
            variant="outline" 
            size="sm"
            className="h-8 w-8 p-0" 
            onClick={() => updateQuantity(item.id, item.quantity - 1)}
            disabled={item.quantity <= 1}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <span className="mx-2 w-6 text-center">{item.quantity}</span>
          <Button 
            variant="outline"
            size="sm" 
            className="h-8 w-8 p-0"
            onClick={() => updateQuantity(item.id, item.quantity + 1)}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </div>
      
      <div>
        <Input
          placeholder="Special instructions..."
          value={item.notes}
          onChange={(e) => updateNotes(item.id, e.target.value)}
          className="text-sm"
        />
      </div>
    </div>
  );
};

export default OrderItem;
