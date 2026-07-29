import { supabase } from "@/lib/supabase";
import { StaffMember } from "../types/staff";

export const staffMembers: StaffMember[] = [
  {
    id: "manager-1",
    name: "المدير",
    role: "manager",
    active: true,
  },
  {
    id: "waiter-1",
    name: "موظف 1",
    role: "waiter",
    active: true,
  },
  {
    id: "waiter-2",
    name: "موظف 2",
    role: "waiter",
    active: true,
  },
  {
    id: "cashier-1",
    name: "الكاشير",
    role: "cashier",
    active: true,
  },
  {
    id: "kitchen-1",
    name: "المطبخ",
    role: "kitchen",
    active: true,
  },
];

export async function getServiceRequests() {
  const { data, error } = await supabase
    .from("service_requests")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data ?? [];
}

export async function completeServiceRequest(id: number) {
  const { error } = await supabase
    .from("service_requests")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw error;
}