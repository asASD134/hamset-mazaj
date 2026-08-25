import { supabase } from "@/lib/supabase-browser";
import { getClientCafeId } from "@/lib/cafe-context-client";
import { KitchenOrder } from "../types/kitchen";
export async function getKitchenOrders(): Promise<KitchenOrder[]> {
  const cafeId=await getClientCafeId();
  const {data,error}=await supabase.from("orders").select(`id,order_number,total_price,notes,status,created_at,tables(table_number),order_items(quantity,price,menu(id,name_ar))`).eq("cafe_id",cafeId).eq("status","pending").order("created_at",{ascending:false});
  if(error)throw error; return (data??[]).filter((o:any)=>o.order_items?.length).map((o:any)=>({id:o.id,orderNumber:o.order_number,tableNumber:o.tables?.table_number??0,items:o.order_items.map((i:any)=>({id:i.menu?.id??0,name:i.menu?.name_ar??"",quantity:i.quantity,price:i.price})),totalPrice:o.total_price,notes:o.notes??"",status:o.status,createdAt:o.created_at}));
}
export async function addKitchenOrder(){throw new Error("غير مستخدمة");}
export async function updateKitchenOrderStatus(id:number,status:KitchenOrder["status"]){const cafeId=await getClientCafeId();const {error}=await supabase.from("orders").update({status}).eq("id",id).eq("cafe_id",cafeId);if(error)throw error;}
