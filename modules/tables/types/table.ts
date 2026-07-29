export interface CafeTable {
  id: number;
  number: number;
  name: string;
  status: "available" | "occupied" | "reserved";
}