
export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  timeAvailable: string;
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
