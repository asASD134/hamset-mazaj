"use client";

interface Props {
  name: string;
  setName: React.Dispatch<React.SetStateAction<string>>;
  sortOrder: number;
  setSortOrder: React.Dispatch<React.SetStateAction<number>>;
}

export default function CategoryForm({
  name,
  setName,
  sortOrder,
  setSortOrder,
}: Props) {
  return (
    <div className="space-y-5">
      <div>
        <label className="mb-2 block text-sm text-gray-300">
          اسم التصنيف
        </label>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="مثال: القهوة الساخنة"
          className="w-full rounded-xl bg-zinc-800 p-3 outline-none focus:ring-2 focus:ring-yellow-500"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm text-gray-300">
          ترتيب التصنيف
        </label>

        <input
          type="number"
          value={sortOrder}
          onChange={(e) => setSortOrder(Number(e.target.value))}
          className="w-full rounded-xl bg-zinc-800 p-3 outline-none focus:ring-2 focus:ring-yellow-500"
        />
      </div>
    </div>
  );
}