
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { menuItems, categories } from "../data/menuData";
import { CartItem, MenuItem, AdminSettings } from "../types/menu";
import MenuSection from "../components/MenuSection";
import OrderSummary from "../components/OrderSummary";
import CheckoutForm from "../components/CheckoutForm";
import { sendWhatsAppMessage } from "../utils/whatsAppService";
import { useNavigate } from "react-router-dom";

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

  useEffect(() => {
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
  }, []);

  const addItemToCart = (item: MenuItem) => {
    if (!adminSettings.isOpen) {
      toast({
        title: "Cafeteria Closed",
        description: adminSettings.message,
        variant: "destructive",
      });
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
    
    toast({
      title: "Added to order",
      description: `${item.name} has been added to your order`,
    });
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

  const handleSubmitOrder = async (pickupTime: string, studentInfo: { name: string; id: string }) => {
    setOrderStatus("processing");
    
    // Generate order summary for WhatsApp message
    const orderSummary = cartItems.map(item => `${item.quantity}x ${item.name} ${item.notes ? `(${item.notes})` : ''}`).join('\n');
    const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    
    try {
      // Send WhatsApp message
      const sentSuccessfully = await sendWhatsAppMessage(
        orderSummary,
        studentInfo,
        pickupTime,
        totalAmount
      );
      
      if (sentSuccessfully) {
        setOrderStatus("success");
        setCartItems([]);
        setIsCheckoutOpen(false);
        
        toast({
          title: "Order placed successfully",
          description: `Your order will be ready at ${pickupTime}`,
        });
      } else {
        throw new Error("Failed to send WhatsApp message");
      }
    } catch (error) {
      setOrderStatus("error");
      toast({
        title: "Order failed",
        description: "There was an error processing your order. Please try again.",
        variant: "destructive",
      });
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
              <h1 className="text-xl font-bold">Uni Cafeteria</h1>
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
      {/* Header */}
      <header className="bg-navy-800 text-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <img 
              src="/lovable-uploads/c9d55398-6bfd-4b70-a7c1-38820dd1fe40.png" 
              alt="University Logo" 
              className="h-10"
            />
            <h1 className="text-xl font-bold">Uni Cafeteria</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              onClick={() => navigate("/admin")}
              className="text-white hover:bg-navy-900"
            >
              Admin
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setIsCartOpen(true)}
              className="relative text-white border-white hover:bg-navy-900"
            >
              Order
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
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <MenuSection 
          title={selectedCategory || "Menu"} 
          items={filteredItems}
          timeAvailable={timeAvailable}
          onAddItem={addItemToCart}
        />
      </main>

      {/* Cart Drawer */}
      <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
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
              <OrderSummary 
                items={cartItems}
                updateQuantity={updateItemQuantity}
                updateNotes={updateItemNotes}
                removeItem={removeItemFromCart}
              />
            </div>
            
            {cartItems.length > 0 && (
              <div className="pt-4 border-t mt-auto">
                <div className="flex justify-between font-bold mb-4">
                  <span>Total</span>
                  <span>€{totalAmount.toFixed(2)}</span>
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
          <div className="mt-4">
            <CheckoutForm 
              items={cartItems}
              onSubmitOrder={handleSubmitOrder}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
