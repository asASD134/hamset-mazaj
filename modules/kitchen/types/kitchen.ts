export type KitchenStatus =
  | "pending"
  | "preparing"
  | "ready"
  | "served"
  | "completed";

export interface KitchenOrderItem {
  id: string;
  name: string;
  quantity: number;
}

export interface KitchenOrder {
  id: number;
  orderNumber?: string;
  tableNumber: number;
  items: KitchenOrderItem[];
  totalPrice?: number;
  notes?: string | null;
  status: KitchenStatus;
  createdAt: string;
}