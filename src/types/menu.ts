
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
  name: string;
  isTakeaway: boolean;
  pickupTime: string;
  items: CartItem[];
  orderedAt: number;
  total: number;
}
