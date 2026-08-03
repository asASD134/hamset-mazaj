"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

type TableContextType = {
  tableNumber: number | null;
  hasTable: boolean;
  setTableNumber: React.Dispatch<React.SetStateAction<number | null>>;
};

const TableContext = createContext<TableContextType>({
  tableNumber: null,
  hasTable: false,
  setTableNumber: () => {},
});

export function TableProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [tableNumber, setTableNumber] = useState<number | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const table = params.get("table");

    if (table && !isNaN(Number(table))) {
      setTableNumber(Number(table));
    } else {
      setTableNumber(null);
    }
  }, []);

  return (
    <TableContext.Provider
      value={{
        tableNumber,
        hasTable: tableNumber !== null,
        setTableNumber,
      }}
    >
      {children}
    </TableContext.Provider>
  );
}

export function useTable() {
  return useContext(TableContext);
}
