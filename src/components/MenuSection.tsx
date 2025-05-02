
import { useState } from "react";
import { MenuItem } from "../types/menu";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface MenuSectionProps {
  title: string;
  items: MenuItem[];
  timeAvailable: string;
  onAddItem: (item: MenuItem) => void;
}

const MenuSection = ({ title, items, timeAvailable, onAddItem }: MenuSectionProps) => {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-2xl font-bold">{title}</h2>
        <span className="text-sm text-gray-500">Available: {timeAvailable}</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item) => (
          <div 
            key={item.id} 
            className="border rounded-lg p-4 flex justify-between items-center hover:bg-gray-50"
          >
            <div>
              <h3 className="font-medium">{item.name}</h3>
              <p className="text-gray-700">₪{item.price.toFixed(2)}</p>
            </div>
            <Button 
              onClick={() => onAddItem(item)}
              variant="outline"
              size="sm"
              className="rounded-full"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MenuSection;
