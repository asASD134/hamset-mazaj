export type StaffRole =
  | "manager"
  | "waiter"
  | "cashier"
  | "kitchen";

export interface StaffMember {
  id: string;
  name: string;
  role: StaffRole;
  active: boolean;
}