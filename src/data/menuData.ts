
import { MenuItem } from "../types/menu";

export const menuItems: MenuItem[] = [
  // Breakfast items
  { id: "eggs-toast", name: "Eggs & Toast", price: 3.50, category: "Breakfast", timeAvailable: "7-11am", description: "Two eggs any style with buttered toast and jam" },
  { id: "pancakes", name: "Pancakes", price: 4.00, category: "Breakfast", timeAvailable: "7-11am", description: "Stack of fluffy pancakes with maple syrup and butter" },
  { id: "granola", name: "Granola Bowl", price: 2.80, category: "Breakfast", timeAvailable: "7-11am", description: "Greek yogurt topped with house-made granola, fresh berries and honey" },
  { id: "breakfast-sandwich", name: "Breakfast Sandwich", price: 3.20, category: "Breakfast", timeAvailable: "7-11am", description: "Egg, cheese and choice of bacon or avocado on a toasted brioche bun" },
  
  // Lunch items
  { id: "chicken-pasta", name: "Chicken Pasta", price: 4.90, category: "Lunch", timeAvailable: "11am-5pm", description: "Grilled chicken breast with creamy alfredo sauce and penne pasta" },
  { id: "beef-burger", name: "Beef Burger", price: 5.50, category: "Lunch", timeAvailable: "11am-5pm", description: "Juicy beef patty with lettuce, tomato, cheese and special sauce on a brioche bun" },
  { id: "vegetable-curry", name: "Vegetable Curry", price: 4.20, category: "Lunch", timeAvailable: "11am-5pm", description: "Mixed vegetables in a fragrant curry sauce served with basmati rice" },
  { id: "caesar-salad", name: "Caesar Salad", price: 3.80, category: "Lunch", timeAvailable: "11am-5pm", description: "Crisp romaine lettuce, parmesan cheese, croutons and caesar dressing" },
  
  // Dinner items
  { id: "steak", name: "Steak & Potatoes", price: 6.50, category: "Dinner", timeAvailable: "5-9pm", description: "Grilled sirloin steak with roasted potatoes and seasonal vegetables" },
  { id: "salmon", name: "Grilled Salmon", price: 6.20, category: "Dinner", timeAvailable: "5-9pm", description: "Herb-crusted salmon fillet with lemon butter sauce and wild rice" },
  { id: "stir-fry", name: "Vegetable Stir Fry", price: 4.50, category: "Dinner", timeAvailable: "5-9pm", description: "Fresh vegetables stir-fried in a savory sauce served with steamed rice" },
  { id: "lasagna", name: "Lasagna", price: 5.00, category: "Dinner", timeAvailable: "5-9pm", description: "Layers of pasta, rich meat sauce, and melted cheese, served with garlic bread" },
  
  // Drinks
  { id: "coffee", name: "Coffee", price: 1.50, category: "Drinks", timeAvailable: "7am-9pm", description: "Freshly brewed coffee, served hot" },
  { id: "tea", name: "Tea", price: 1.20, category: "Drinks", timeAvailable: "7am-9pm", description: "Choice of green, black, or herbal tea" },
  { id: "soda", name: "Soda", price: 1.80, category: "Drinks", timeAvailable: "7am-9pm", description: "Selection of carbonated soft drinks" },
  { id: "water", name: "Water", price: 1.00, category: "Drinks", timeAvailable: "7am-9pm", description: "Bottle of still or sparkling water" },
  { id: "juice", name: "Juice", price: 2.00, category: "Drinks", timeAvailable: "7am-9pm", description: "Fresh orange, apple, or mixed fruit juice" },
];

export const categories = ["Breakfast", "Lunch", "Dinner", "Drinks"];
