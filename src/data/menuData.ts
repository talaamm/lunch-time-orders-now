
import { MenuItem } from "../types/menu";

export const menuItems: MenuItem[] = [
  // Breakfast items
  { id: "eggs-toast", name: "Eggs & Toast", price: 3.50, category: "Breakfast", timeAvailable: "7-11am" },
  { id: "pancakes", name: "Pancakes", price: 4.00, category: "Breakfast", timeAvailable: "7-11am" },
  { id: "granola", name: "Granola Bowl", price: 2.80, category: "Breakfast", timeAvailable: "7-11am" },
  { id: "breakfast-sandwich", name: "Breakfast Sandwich", price: 3.20, category: "Breakfast", timeAvailable: "7-11am" },
  
  // Lunch items
  { id: "chicken-pasta", name: "Chicken Pasta", price: 4.90, category: "Lunch", timeAvailable: "11am-5pm" },
  { id: "beef-burger", name: "Beef Burger", price: 5.50, category: "Lunch", timeAvailable: "11am-5pm" },
  { id: "vegetable-curry", name: "Vegetable Curry", price: 4.20, category: "Lunch", timeAvailable: "11am-5pm" },
  { id: "caesar-salad", name: "Caesar Salad", price: 3.80, category: "Lunch", timeAvailable: "11am-5pm" },
  
  // Dinner items
  { id: "steak", name: "Steak & Potatoes", price: 6.50, category: "Dinner", timeAvailable: "5-9pm" },
  { id: "salmon", name: "Grilled Salmon", price: 6.20, category: "Dinner", timeAvailable: "5-9pm" },
  { id: "stir-fry", name: "Vegetable Stir Fry", price: 4.50, category: "Dinner", timeAvailable: "5-9pm" },
  { id: "lasagna", name: "Lasagna", price: 5.00, category: "Dinner", timeAvailable: "5-9pm" },
  
  // Drinks
  { id: "coffee", name: "Coffee", price: 1.50, category: "Drinks", timeAvailable: "7am-9pm" },
  { id: "tea", name: "Tea", price: 1.20, category: "Drinks", timeAvailable: "7am-9pm" },
  { id: "soda", name: "Soda", price: 1.80, category: "Drinks", timeAvailable: "7am-9pm" },
  { id: "water", name: "Water", price: 1.00, category: "Drinks", timeAvailable: "7am-9pm" },
  { id: "juice", name: "Juice", price: 2.00, category: "Drinks", timeAvailable: "7am-9pm" },
];

export const categories = ["Breakfast", "Lunch", "Dinner", "Drinks"];
