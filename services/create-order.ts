import { supabase } from "@/lib/supabase-browser";
import { getClientCafeId } from "@/lib/cafe-context-client";
export interface CreateOrderItem { id:string; name:string; quantity:number; price:number; }
interface CreateOrderParams { tableNumber:number; items:CreateOrderItem[]; total:number; }
export async function createOrder({tableNumber,items}:CreateOrderParams){const cafeId=await getClientCafeId();const clientRequestId=crypto.randomUUID();const {data,error}=await supabase.rpc("create_order_with_items",{p_cafe_id:cafeId,p_table_number:tableNumber,p_client_request_id:clientRequestId,p_items:items.map(i=>({menu_id:Number(i.id),quantity:Number(i.quantity)}))});if(error)throw error;return data;}
