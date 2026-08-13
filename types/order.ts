export type OrderStatus =
  | "pending"
  | "accepted"
  | "preparing"
  | "ready"
  | "served"
  | "completed"
  | "cancelled";

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;

  table_number: number;

  status: OrderStatus;

  total: number;

  created_at: string;

  items: OrderItem[];
}