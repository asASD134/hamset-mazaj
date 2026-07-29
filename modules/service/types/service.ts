export type ServiceType =
  | "water"
  | "charcoal"
  | "call_waiter"
  | "bill"
  | "clean_table"
  | "help";

export interface ServiceRequest {
  id: string;
  tableNumber: number;
  type: ServiceType;
  status: "pending" | "completed";
  createdAt: string;
}

export const serviceTypes: {
  id: ServiceType;
  label: string;
}[] = [
  {
    id: "water",
    label: "💧 طلب ماء",
  },
  {
    id: "charcoal",
    label: "🔥 طلب فحم",
  },
  {
    id: "call_waiter",
    label: "👨‍🍳 استدعاء موظف",
  },
  {
    id: "bill",
    label: "🧾 طلب فاتورة",
  },
  {
    id: "clean_table",
    label: "🧹 تنظيف الطاولة",
  },
  {
    id: "help",
    label: "🆘 طلب مساعدة",
  },
];