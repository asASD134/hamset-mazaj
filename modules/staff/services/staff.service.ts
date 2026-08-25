import { supabase } from "@/lib/supabase-browser";
import { getClientCafeId } from "@/lib/cafe-context-client";
import { StaffMember } from "../types/staff";

export async function getServiceRequests() {
  const cafeId = await getClientCafeId();
  const { data, error } = await supabase.from("service_requests").select("*").eq("cafe_id", cafeId).order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function completeServiceRequest(id: number) {
  const cafeId = await getClientCafeId();
  const { error } = await supabase.from("service_requests").update({ status: "completed", completed_at: new Date().toISOString() }).eq("id", id).eq("cafe_id", cafeId);
  if (error) throw error;
}

export const staffMembers: StaffMember[] = [];
