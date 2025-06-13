import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { menuItems, categories } from "../data/menuData";
import { CartItem, MenuItem, AdminSettings, OrderDetails } from "../types/menu";
import MenuSection from "../components/MenuSection";
import OrderSummary from "../components/OrderSummary";
import { sendWhatsAppMessage } from "../utils/whatsAppService";
import { saveOrder, getRecentOrders } from "../utils/orderStorage";
import { NotificationService } from "../utils/notificationService";
import { useNavigate } from "react-router-dom";
import { Check, Clock, ShoppingBag, Bell, BellOff } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

const Index = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [orderStatus, setOrderStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [adminSettings, setAdminSettings] = useState<AdminSettings>({
    isOpen: true,
    message: "Welcome to the University Cafeteria!",
    authorizedIPs: []
  });
  const [customerName, setCustomerName] = useState("");
  const [isTakeaway, setIsTakeaway] = useState(false);
  const [pickupTime, setPickupTime] = useState("");
  const [recentOrders, setRecentOrders] = useState<OrderDetails[]>([]);
  const [isOrderHistoryOpen, setIsOrderHistoryOpen] = useState(false);
  const [discountCode, setDiscountCode] = useState("");
  const [discountApplied, setDiscountApplied] = useState<number>(0);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);

  useEffect(() => {
    // Initialize notification service
    const initNotifications = async () => {
      const notificationService = NotificationService.getInstance();
      const enabled = await notificationService.initialize();
      setNotificationsEnabled(enabled);
      
      // Show notification prompt if not enabled and user hasn't seen it
      if (!enabled && !localStorage.getItem('notificationPromptShown')) {
        setShowNotificationPrompt(true);
      }
    };
    initNotifications();

    // Load admin settings from localStorage
    const savedSettings = localStorage.getItem("adminSettings");
    if (savedSettings) {
      setAdminSettings(JSON.parse(savedSettings));
    }

    // Get current time to determine default category
    const now = new Date();
    const hours = now.getHours();
    
    if (hours >= 7 && hours < 11) {
      setSelectedCategory("Breakfast");
    } else if (hours >= 11 && hours < 17) {
      setSelectedCategory("Lunch");
    } else if (hours >= 17 && hours < 21) {
      setSelectedCategory("Dinner");
    } else {
      setSelectedCategory("Breakfast"); // Default to breakfast
    }

    // Load recent orders
    setRecentOrders(getRecentOrders());
  }, []);

  const addItemToCart = (item: MenuItem) => {
    if (!adminSettings.isOpen) {
      return;
    }
    
    setCartItems(prevItems => {
      const existingItem = prevItems.find(i => i.id === item.id);
      
      if (existingItem) {
        return prevItems.map(i => 
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      } else {
        return [...prevItems, { ...item, quantity: 1, notes: "" }];
      }
    });
  };

  const enableNotifications = async () => {
    const notificationService = NotificationService.getInstance();
    const enabled = await notificationService.requestPermission();
    setNotificationsEnabled(enabled);
    setShowNotificationPrompt(false);
    localStorage.setItem('notificationPromptShown', 'true');
    
    if (enabled) {
      // Test notification to confirm it works
      await notificationService.testNotification();
    }
  };

  const dismissNotificationPrompt = () => {
    setShowNotificationPrompt(false);
    localStorage.setItem('notificationPromptShown', 'true');
  };

  const updateItemQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItemFromCart(id);
      return;
    }
    
    setCartItems(prevItems => 
      prevItems.map(item => 
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const updateItemNotes = (id: string, notes: string) => {
    setCartItems(prevItems => 
      prevItems.map(item => 
        item.id === id ? { ...item, notes } : item
      )
    );
  };

  const removeItemFromCart = (id: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  const applyDiscount = (code: string) => {
    const upperCode = code.toUpperCase();
    if (upperCode === "STAFF") {
      setDiscountApplied(50);
    } else if (upperCode === "STUDENT") {
      setDiscountApplied(5);
    } else {
      setDiscountApplied(0);
    }
  };

  const handleSubmitOrder = async () => {
    if (!customerName.trim() || !pickupTime) {
      return;
    }

    setOrderStatus("processing");
    
    // Generate order summary for message
    const orderSummary = cartItems.map(item => 
      `${item.quantity}x ${item.name} ${item.notes ? `(${item.notes})` : ''}`
    ).join('\n');
    
    const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discountedTotal = discountApplied > 0 
      ? totalAmount * (1 - discountApplied/100) 
      : totalAmount;
    
    try {
      // Send message
      const sentSuccessfully = await sendWhatsAppMessage(
        orderSummary,
        { name: customerName, isTakeaway },
        pickupTime,
        discountedTotal,
        discountApplied
      );
      
      if (sentSuccessfully) {
        setOrderStatus("success");
        
        // Save order to local storage
        const orderDetails: OrderDetails = {
          name: customerName,
          isTakeaway,
          pickupTime,
          items: [...cartItems],
          orderedAt: Date.now(),
          total: discountedTotal,
          discount: discountApplied
        };
        
        const savedOrder = saveOrder(orderDetails);
        setRecentOrders(getRecentOrders());

        // Schedule pickup notification at exact pickup time
        if (notificationsEnabled) {
          const notificationService = NotificationService.getInstance();
          await notificationService.schedulePickupReminder(pickupTime, savedOrder.id, customerName);
        }
        
        setCartItems([]);
        setIsCheckoutOpen(false);
        setDiscountCode("");
        setDiscountApplied(0);
      } else {
        throw new Error("Failed to send message");
      }
    } catch (error) {
      setOrderStatus("error");
    }
  };

  const filteredItems = selectedCategory 
    ? menuItems.filter(item => item.category === selectedCategory)
    : menuItems;
  
  const timeAvailable = selectedCategory === "Breakfast" ? "7-11am" : 
                        selectedCategory === "Lunch" ? "11am-5pm" : 
                        selectedCategory === "Dinner" ? "5-9pm" : "7am-9pm";

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountedTotal = discountApplied > 0 
    ? totalAmount * (1 - discountApplied/100) 
    : totalAmount;

  // Format date for display
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // If cafeteria is closed, show a message
  if (!adminSettings.isOpen) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header className="bg-navy-800 text-white shadow-sm">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <img 
                src="/lovable-uploads/c9d55398-6bfd-4b70-a7c1-38820dd1fe40.png" 
                alt="University Logo" 
                className="h-10"
              />
              <h1 className="text-xl font-bold">ND Oasis Lounge</h1>
            </div>
            <Button 
              variant="outline" 
              onClick={() => navigate("/admin")}
              className="text-white border-white hover:bg-navy-900"
            >
              Admin
            </Button>
          </div>
        </header>
        
        <div className="flex-grow flex items-center justify-center p-4">
          <div className="max-w-md text-center">
            <img 
              src="/lovable-uploads/c9d55398-6bfd-4b70-a7c1-38820dd1fe40.png" 
              alt="University Logo" 
              className="h-32 mx-auto mb-6"
            />
            <h2 className="text-2xl font-bold text-navy-800 mb-4">Cafeteria Currently Closed</h2>
            <p className="text-gray-600 mb-6">{adminSettings.message}</p>
            <Button onClick={() => navigate("/admin")} className="bg-navy-800 hover:bg-navy-900">
              Admin Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notification Permission Prompt */}
      {showNotificationPrompt && (
        <div className="bg-blue-50 border-b border-blue-200 p-3">
          <div className="container mx-auto px-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bell className="h-5 w-5 text-blue-600" />
              <p className="text-sm text-blue-800">
                Enable notifications to get alerts when your meal is ready!
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                size="sm" 
                onClick={enableNotifications}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Enable
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={dismissNotificationPrompt}
                className="text-blue-600 hover:bg-blue-100"
              >
                Not now
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-navy-800 text-white shadow-sm sticky top-0 z-20">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <img 
              src="/lovable-uploads/c9d55398-6bfd-4b70-a7c1-38820dd1fe40.png" 
              alt="University Logo" 
              className="h-10"
            />
            <h1 className="text-xl font-bold">ND Oasis Lounge</h1>
          </div>
          <div className="flex items-center space-x-3">
            {/* Notification Status Indicator */}
            <div className="flex items-center space-x-1">
              {notificationsEnabled ? (
                <Bell className="h-4 w-4 text-green-400" />
              ) : (
                <BellOff className="h-4 w-4 text-gray-400" />
              )}
            </div>
            
            {recentOrders.length > 0 && (
              <Button 
                variant="ghost" 
                onClick={() => setIsOrderHistoryOpen(true)}
                className="relative text-white hover:bg-navy-900"
                size="sm"
              >
                <Clock className="mr-1 h-4 w-4" />
                <span className="hidden sm:inline">Recent Orders</span>
                <span className="absolute -top-2 -right-2 bg-white text-navy-800 text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {recentOrders.length}
                </span>
              </Button>
            )}
            <Button 
              variant="ghost" 
              onClick={() => navigate("/admin")}
              className="text-white hover:bg-navy-900"
              size="sm"
            >
              Admin
            </Button>
            <Button 
              onClick={() => setIsCartOpen(true)}
              className="relative text-white border-white hover:bg-navy-900"
              variant="outline"
            >
              <ShoppingBag className="h-5 w-5 sm:mr-1" />
              <span className="hidden sm:inline">Order</span>
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-white text-navy-800 text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Category Navigation */}
      <div className="bg-white border-b sticky top-[73px] z-10">
        <div className="container mx-auto px-4 overflow-x-auto">
          <div className="flex space-x-2 py-3">
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                className={`whitespace-nowrap ${selectedCategory === category ? 'bg-navy-800 hover:bg-navy-900' : ''}`}
                size="sm"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-navy-800 mb-1">{selectedCategory || "Menu"}</h2>
          <p className="text-gray-500">Available {timeAvailable}</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <div key={item.id} className="h-full">
              <Card className="h-full flex flex-col overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex flex-col h-full">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-navy-800 mb-1">{item.name}</h3>
                    <p className="text-sm text-gray-600 mt-2 flex-grow">{item.description}</p>
                  </div>
                  <div className="mt-auto pt-2 flex items-center justify-between">
                    <p className="font-semibold text-navy-800">₪{item.price.toFixed(2)}</p>
                    <Button 
                      onClick={() => addItemToCart(item)}
                      size="sm"
                      className="transition-transform hover:scale-105"
                    >
                      Add to Order
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </main>

      {/* Cart Drawer */}
      <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader className="border-b pb-4">
            <div className="flex items-center">
              <img 
                src="/lovable-uploads/c9d55398-6bfd-4b70-a7c1-38820dd1fe40.png" 
                alt="University Logo" 
                className="h-8 mr-2"
              />
              <SheetTitle>Your Order</SheetTitle>
            </div>
          </SheetHeader>
          <div className="mt-6 flex flex-col h-[calc(100vh-10rem)]">
            <div className="flex-grow overflow-auto">
              {cartItems.length === 0 ? (
                <div className="text-center py-10">
                  <ShoppingBag className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="font-medium text-lg mb-1">Your cart is empty</h3>
                  <p className="text-gray-500">Add items from the menu to start your order</p>
                </div>
              ) : (
                <OrderSummary 
                  items={cartItems}
                  updateQuantity={updateItemQuantity}
                  updateNotes={updateItemNotes}
                  removeItem={removeItemFromCart}
                  currencySymbol="₪"
                />
              )}
            </div>
            
            {cartItems.length > 0 && (
              <div className="pt-4 border-t mt-auto">
                <div className="flex justify-between font-bold mb-4">
                  <span>Total</span>
                  <span>₪{totalAmount.toFixed(2)}</span>
                </div>
                <Button 
                  onClick={() => {
                    setIsCartOpen(false);
                    setIsCheckoutOpen(true);
                  }}
                  className="w-full bg-navy-800 hover:bg-navy-900"
                >
                  Checkout
                </Button>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Checkout Dialog */}
      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-center mb-2">
              <img 
                src="/lovable-uploads/c9d55398-6bfd-4b70-a7c1-38820dd1fe40.png" 
                alt="University Logo" 
                className="h-10 mr-2"
              />
              <DialogTitle>Complete Your Order</DialogTitle>
            </div>
          </DialogHeader>
          
          <div className="mt-6 space-y-4">
            <div>
              <Label htmlFor="name" className="text-sm font-medium">Your Name</Label>
              <Input
                id="name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter your name"
                className="mt-1"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="takeaway" 
                checked={isTakeaway} 
                onCheckedChange={(checked) => setIsTakeaway(checked === true)}
              />
              <Label htmlFor="takeaway" className="text-sm font-medium">Takeaway Order</Label>
            </div>
            
            <div>
              <Label htmlFor="pickup-time" className="text-sm font-medium">Pickup Time</Label>
              <Input
                id="pickup-time"
                type="time"
                value={pickupTime}
                onChange={(e) => setPickupTime(e.target.value)}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="discount-code" className="text-sm font-medium">Discount Code</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="discount-code"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                  placeholder="Enter code (STAFF/STUDENT)"
                  className="flex-grow"
                />
                <Button 
                  onClick={() => applyDiscount(discountCode)}
                  variant="outline"
                >
                  Apply
                </Button>
              </div>
              {discountApplied > 0 && (
                <p className="text-green-600 text-sm mt-1">
                  {discountApplied}% discount applied
                </p>
              )}
            </div>
            
            <div className="pt-4 border-t">
              {discountApplied > 0 && (
                <div className="flex justify-between text-sm mb-2">
                  <span>Subtotal</span>
                  <span>₪{totalAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold mb-4">
                <span>Total{discountApplied > 0 ? ` (${discountApplied}% off)` : ""}</span>
                <span>₪{discountedTotal.toFixed(2)}</span>
              </div>
              <Button 
                onClick={handleSubmitOrder}
                className="w-full bg-navy-800 hover:bg-navy-900"
                disabled={orderStatus === "processing"}
              >
                {orderStatus === "processing" ? "Processing..." : "Place Order"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Recent Orders Dialog */}
      <Dialog open={isOrderHistoryOpen} onOpenChange={setIsOrderHistoryOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Your Recent Orders</DialogTitle>
          </DialogHeader>
          
          <div className="max-h-[70vh] overflow-y-auto pr-2">
            {recentOrders.map((order, index) => (
              <Card key={index} className="mb-4 overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium">{formatDate(order.orderedAt)}</h3>
                      <p className="text-sm text-gray-500 flex items-center">
                        {order.isTakeaway ? (
                          <>
                            <ShoppingBag className="h-3 w-3 mr-1" />
                            Takeaway
                          </>
                        ) : (
                          <>
                            <Check className="h-3 w-3 mr-1" />
                            Dine-in
                          </>
                        )}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">₪{order.total.toFixed(2)}</p>
                      <p className="text-xs text-gray-500">Ready at {order.pickupTime}</p>
                    </div>
                  </div>
                  
                  <div className="border-t pt-2 mt-2">
                    <p className="text-xs text-gray-700 font-medium mb-1">Order Items:</p>
                    <ul className="text-sm">
                      {order.items.map((item, i) => (
                        <li key={i} className="pb-1">
                          <span className="font-medium">{item.quantity}x</span> {item.name}
                          {item.notes && <span className="text-gray-500 text-xs"> ({item.notes})</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
