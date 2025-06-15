import { useState, useEffect, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { useAdminSettings } from "@/hooks/useAdminSettings";

const Admin = () => {
  const navigate = useNavigate();
  const { adminSettings, updateAdminSettings } = useAdminSettings();
  const [currentIP, setCurrentIP] = useState<string>("");
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [password, setPassword] = useState<string>("");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [localSettings, setLocalSettings] = useState(adminSettings);
  
  // For demo purposes, we'll use a simple password
  const ADMIN_PASSWORD = "admin123";
  
  useEffect(() => {
    // Update local settings when adminSettings change
    setLocalSettings(adminSettings);
  }, [adminSettings]);
  
  useEffect(() => {
    // Load authorized IPs from localStorage (keeping this local since it's just for demo)
    const savedAuthorizedIPs = localStorage.getItem("authorizedIPs");
    if (savedAuthorizedIPs) {
      const authorizedIPs = JSON.parse(savedAuthorizedIPs);
      setLocalSettings(prev => ({ ...prev, authorizedIPs }));
    }
    
    // Get current IP address (in a real app, this would be server-side)
    fetch('https://api.ipify.org?format=json')
      .then(response => response.json())
      .then(data => {
        setCurrentIP(data.ip);
        
        // Check if IP is authorized
        const savedAuthorizedIPs = localStorage.getItem("authorizedIPs");
        if (savedAuthorizedIPs) {
          const authorizedIPs = JSON.parse(savedAuthorizedIPs);
          if (authorizedIPs.includes(data.ip)) {
            setIsAuthorized(true);
          }
        }
      })
      .catch(error => {
        console.error("Error fetching IP:", error);
        setCurrentIP("Unable to fetch IP");
      });
  }, []);
  
  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      toast({
        title: "Logged in successfully",
        description: "You now have admin access",
      });
    } else {
      toast({
        title: "Authentication failed",
        description: "Invalid password",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleLogin();
  };
  
  const handleSaveSettings = async () => {
    try {
      await updateAdminSettings({
        isOpen: localSettings.isOpen,
        message: localSettings.message
      });
      
      // Save authorized IPs to localStorage (keeping this local)
      localStorage.setItem("authorizedIPs", JSON.stringify(localSettings.authorizedIPs));
      
      toast({
        title: "Settings saved",
        description: "Cafeteria settings have been updated for all users",
      });
    } catch (error) {
      toast({
        title: "Error saving settings",
        description: "There was an error updating the settings",
        variant: "destructive",
      });
    }
  };
  
  const handleAddCurrentIP = () => {
    if (currentIP && !localSettings.authorizedIPs.includes(currentIP)) {
      const updatedIPs = [...localSettings.authorizedIPs, currentIP];
      setLocalSettings({...localSettings, authorizedIPs: updatedIPs});
      setIsAuthorized(true);
      toast({
        title: "IP Added",
        description: `${currentIP} has been added to authorized IPs`,
      });
    }
  };
  
  const handleRemoveIP = (ip: string) => {
    const updatedIPs = localSettings.authorizedIPs.filter(item => item !== ip);
    setLocalSettings({...localSettings, authorizedIPs: updatedIPs});
    
    if (ip === currentIP) {
      setIsAuthorized(false);
    }
  };
  
  // If not authenticated, show login form
  if (!isAuthenticated && !isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
          <div className="flex justify-center mb-6">
            <img 
              src="/lovable-uploads/c9d55398-6bfd-4b70-a7c1-38820dd1fe40.png" 
              alt="University Logo" 
              className="h-20"
            />
          </div>
          <h1 className="text-2xl font-bold text-center mb-6 text-navy-800">Admin Login</h1>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full"
              />
            </div>
            
            <Button type="submit" className="w-full bg-navy-800 hover:bg-navy-900">
              Login
            </Button>
            
            <div className="text-center">
              <Button 
                variant="link" 
                onClick={() => navigate("/")}
                className="text-navy-800"
              >
                Return to Menu
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }
  
  // Admin dashboard
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-navy-800 text-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <img 
              src="/lovable-uploads/c9d55398-6bfd-4b70-a7c1-38820dd1fe40.png" 
              alt="University Logo" 
              className="h-10"
            />
            <h1 className="text-xl font-bold">Cafeteria Admin</h1>
          </div>
          <Button 
            variant="outline" 
            onClick={() => navigate("/")}
            className="text-white border-white hover:bg-navy-900"
          >
            View Menu
          </Button>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-6 text-navy-800">Cafeteria Settings</h2>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="font-medium">Cafeteria Status</h3>
                <p className="text-sm text-gray-500">Enable or disable ordering from the cafeteria</p>
              </div>
              <Switch
                checked={localSettings.isOpen}
                onCheckedChange={(checked) => setLocalSettings({...localSettings, isOpen: checked})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="message">Status Message</Label>
              <Textarea
                id="message"
                value={localSettings.message}
                onChange={(e) => setLocalSettings({...localSettings, message: e.target.value})}
                placeholder="Enter a message to display when the cafeteria is closed"
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Authorized IP Addresses</Label>
              <p className="text-sm text-gray-500">IPs that can access admin without password</p>
              
              <div className="flex items-center space-x-2">
                <div className="flex-grow">
                  <Input value={currentIP} disabled />
                </div>
                <Button onClick={handleAddCurrentIP} disabled={localSettings.authorizedIPs.includes(currentIP)}>
                  Add Current IP
                </Button>
              </div>
              
              <div className="mt-2 space-y-2">
                {localSettings.authorizedIPs.length > 0 ? (
                  localSettings.authorizedIPs.map(ip => (
                    <div key={ip} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <span>{ip} {ip === currentIP && "(Current)"}</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleRemoveIP(ip)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        Remove
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No IPs authorized yet</p>
                )}
              </div>
            </div>
            
            <Button onClick={handleSaveSettings} className="w-full bg-navy-800 hover:bg-navy-900">
              Save Settings
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Admin;
