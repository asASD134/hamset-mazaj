"use client";

import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

import { useMenu } from "@/hooks/useMenu";
import MenuTable from "@/components/admin/menu/MenuTable";

export default function AdminMenuPage() {
  const router = useRouter();

  const {
    items,
    loading,
    toggle,
    remove,
  } = useMenu();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-xl">
        جاري تحميل المنيو...
      </div>
    );
  }

  return (
    <main className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-yellow-400">
            إدارة المنيو
          </h1>

          <p className="mt-2 text-zinc-400">
            إضافة وتعديل وإدارة منتجات المقهى
          </p>
        </div>

        <button
          onClick={() => router.push("/admin/menu/new")}
          className="flex items-center gap-2 rounded-xl bg-yellow-500 px-6 py-3 font-bold text-black hover:bg-yellow-400"
        >
          <Plus size={20} />
          إضافة منتج
        </button>
      </div>

      <MenuTable
        items={items}
        onToggle={toggle}
        onDelete={remove}
        onEdit={(id) => router.push(`/admin/menu/${id}`)}
      />
    </main>
  );
}