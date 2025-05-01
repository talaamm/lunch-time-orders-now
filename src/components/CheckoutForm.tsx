
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CartItem } from "../types/menu";

interface CheckoutFormProps {
  items: CartItem[];
  onSubmitOrder: (pickupTime: string, studentInfo: { name: string; id: string }) => void;
}

const CheckoutForm = ({ items, onSubmitOrder }: CheckoutFormProps) => {
  const [pickupTime, setPickupTime] = useState("");
  const [studentName, setStudentName] = useState("");
  const [studentId, setStudentId] = useState("");
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitOrder(pickupTime, { name: studentName, id: studentId });
  };

  const isFormValid = pickupTime && studentName && studentId && items.length > 0;
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="pickup-time">Pickup Time</Label>
        <Input
          id="pickup-time"
          type="time"
          value={pickupTime}
          onChange={(e) => setPickupTime(e.target.value)}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="student-name">Your Name</Label>
        <Input
          id="student-name"
          value={studentName}
          onChange={(e) => setStudentName(e.target.value)}
          placeholder="Enter your name"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="student-id">Student ID</Label>
        <Input
          id="student-id"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          placeholder="Enter your student ID"
          required
        />
      </div>
      
      <Button 
        type="submit" 
        className="w-full mt-6" 
        disabled={!isFormValid}
      >
        Place Order
      </Button>
    </form>
  );
};

export default CheckoutForm;
