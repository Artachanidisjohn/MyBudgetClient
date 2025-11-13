import { Category } from "./category-model";

export interface Expense {
  id: number;
  description: string;
  amount: number | null;
  categoryId: number;
  category?: Category; 
  date: string;
}