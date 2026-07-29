export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export type OrderStatus =
  | "pending"
  | "accepted"
  | "preparing"
  | "ready"
  | "served"
  | "completed"
  | "cancelled";

export interface Order {
  id: number;
  orderNumber?: string;
  tableNumber: number;
  items: OrderItem[];
  total: number;
  notes?: string | null;
  status: OrderStatus;
  createdAt: string;
}