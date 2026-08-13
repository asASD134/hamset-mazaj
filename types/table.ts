export type TableStatus =
  | "available"
  | "occupied"
  | "reserved"
  | "disabled";

export interface Table {
  id: string;
  number: number;
  name: string;
  seats: number;
  status: TableStatus;
  qr_code: string | null;
  created_at: string;
}

export interface CreateTable {
  number: number;
  name: string;
  seats?: number;
  status?: TableStatus;
}

export interface UpdateTable {
  id: string;
  number: number;
  name: string;
  seats?: number;
  status: TableStatus;
}