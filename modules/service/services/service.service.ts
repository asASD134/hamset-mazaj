import { supabase } from "@/lib/supabase";
import {
  ServiceRequest,
  ServiceType,
} from "../types/service";

export async function getServiceRequests(): Promise<ServiceRequest[]> {
  const { data, error } = await supabase
    .from("service_requests")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((item) => ({
    id: item.id,
    tableNumber: item.table_number,
    type: item.service_type as ServiceType,
    status: item.status,
    createdAt: item.created_at,
  }));
}

export async function createServiceRequest(
  tableNumber: number,
  type: ServiceType
): Promise<ServiceRequest> {
  const { data, error } = await supabase
    .from("service_requests")
    .insert({
      table_number: tableNumber,
      service_type: type,
      status: "pending",
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return {
    id: data.id,
    tableNumber: data.table_number,
    type: data.service_type as ServiceType,
    status: data.status,
    createdAt: data.created_at,
  };
}

export async function completeServiceRequest(
  id: string
): Promise<void> {
  const { error } = await supabase
    .from("service_requests")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    throw error;
  }
}