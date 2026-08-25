"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type TableContextType = {
  tableNumber: number | null;
  cafeSlug: string | null;
  hasTable: boolean;
  setTableNumber: React.Dispatch<React.SetStateAction<number | null>>;
};

const TableContext = createContext<TableContextType>({tableNumber:null,cafeSlug:null,hasTable:false,setTableNumber:()=>{}});
export function TableProvider({children}:{children:ReactNode}){
  const [tableNumber,setTableNumber]=useState<number|null>(null);
  const [cafeSlug,setCafeSlug]=useState<string|null>(null);
  useEffect(()=>{
    const params=new URLSearchParams(window.location.search);
    const table=params.get("table");
    const cafe=params.get("cafe");
    setTableNumber(table && !Number.isNaN(Number(table)) ? Number(table) : null);
    setCafeSlug(cafe || null);
  },[]);
  return <TableContext.Provider value={{tableNumber,cafeSlug,hasTable:tableNumber!==null,setTableNumber}}>{children}</TableContext.Provider>;
}
export function useTable(){return useContext(TableContext);}
