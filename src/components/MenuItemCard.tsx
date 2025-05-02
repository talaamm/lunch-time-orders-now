
import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { MenuItem } from '../types/menu';

interface MenuItemCardProps {
  item: MenuItem;
  onAddItem: (item: MenuItem) => void;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, onAddItem }) => {
  return (
    <Card className="h-full flex flex-col overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-navy-800">{item.name}</CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Available {item.timeAvailable}
        </CardDescription>
      </CardHeader>
      <CardContent className="py-2 flex-grow">
        <p className="text-sm text-gray-600">{item.description}</p>
      </CardContent>
      <CardFooter className="pt-2 flex items-center justify-between">
        <p className="font-semibold text-navy-800">₪{item.price.toFixed(2)}</p>
        <Button 
          onClick={() => onAddItem(item)}
          size="sm"
        >
          Add to Order
        </Button>
      </CardFooter>
    </Card>
  );
};

export default MenuItemCard;
