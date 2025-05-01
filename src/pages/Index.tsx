
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { menuItems, categories } from "../data/menuData";
import { CartItem, MenuItem } from "../types/menu";
import MenuSection from "../components/MenuSection";
import OrderSummary from "../components/OrderSummary";
import CheckoutForm from "../components/CheckoutForm";

const Index = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [orderStatus, setOrderStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
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

  const handleSubmitOrder = (pickupTime: string, studentInfo: { name: string; id: string }) => {
    setOrderStatus("processing");
    
    // Simulate order processing
    setTimeout(() => {
      try {
        // In a real app, here you'd:
        // 1. Send the order to your backend
        // 2. Process balance
        // 3. Send WhatsApp message
        
        const orderSummary = cartItems.map(item => `${item.quantity}x ${item.name} ${item.notes ? `(${item.notes})` : ''}`).join('\n');
        
        console.log({
          orderSummary,
          pickupTime,
          studentInfo,
          totalAmount: cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
        });
        
        setOrderStatus("success");
        setCartItems([]);
        setIsCheckoutOpen(false);
        
        toast({
          title: "Order placed successfully",
          description: `Your order will be ready at ${pickupTime}`,
        });
      } catch (error) {
        setOrderStatus("error");
        toast({
          title: "Order failed",
          description: "There was an error processing your order. Please try again.",
          variant: "destructive",
        });
      }
    }, 1500);
  };

  const filteredItems = selectedCategory 
    ? menuItems.filter(item => item.category === selectedCategory)
    : menuItems;
  
  const timeAvailable = selectedCategory === "Breakfast" ? "7-11am" : 
                        selectedCategory === "Lunch" ? "11am-5pm" : 
                        selectedCategory === "Dinner" ? "5-9pm" : "7am-9pm";

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Uni Cafeteria</h1>
          <Button 
            variant="outline" 
            onClick={() => setIsCartOpen(true)}
            className="relative"
          >
            Order
            {cartItemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {cartItemCount}
              </span>
            )}
          </Button>
        </div>
      </header>

      {/* Category Navigation */}
      <div className="bg-white border-b sticky top-16 z-10">
        <div className="container mx-auto px-4 overflow-x-auto">
          <div className="flex space-x-2 py-3">
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                className="whitespace-nowrap"
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
            <SheetTitle>Your Order</SheetTitle>
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
                  className="w-full"
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
            <DialogTitle>Complete Your Order</DialogTitle>
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
