export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  timeAvailable: string;
  description: string;
}

export interface CartItem extends MenuItem {
  quantity: number;
  notes: string;
}

export interface AdminSettings {
  isOpen: boolean;
  message: string;
  authorizedIPs: string[];
}

export interface OrderDetails {
  id?: string;
  name: string;
  isTakeaway: boolean;
  pickupTime: string;
  items: CartItem[];
  orderedAt: number;
  total: number;
  discount: number;
}

export interface OrderSummaryProps {
  items: CartItem[];
  updateQuantity: (id: string, quantity: number) => void;
  updateNotes: (id: string, notes: string) => void;
  removeItem: (id: string) => void;
  currencySymbol?: string;  // Adding the currencySymbol property
}
