"use client";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function AddMenuItemModal({
  open,
  onClose,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-zinc-900 rounded-2xl p-8 w-full max-w-2xl border border-yellow-500/20">

        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-yellow-400">
            إضافة منتج جديد
          </h2>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-2 gap-5">
          <input
            placeholder="الاسم بالعربية"
            className="bg-zinc-800 rounded-xl p-3"
          />

          <input
            placeholder="الاسم بالإنجليزية"
            className="bg-zinc-800 rounded-xl p-3"
          />

          <input
            placeholder="السعر"
            type="number"
            className="bg-zinc-800 rounded-xl p-3"
          />

          <input
            placeholder="عدد السعرات"
            type="number"
            className="bg-zinc-800 rounded-xl p-3"
          />

          <textarea
            placeholder="الوصف بالعربية"
            className="bg-zinc-800 rounded-xl p-3 col-span-2"
          />

          <textarea
            placeholder="الوصف بالإنجليزية"
            className="bg-zinc-800 rounded-xl p-3 col-span-2"
          />

          <input
            type="file"
            className="col-span-2"
          />
        </div>

        <div className="flex justify-end gap-4 mt-8">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-xl bg-zinc-700"
          >
            إلغاء
          </button>

          <button
            className="px-6 py-3 rounded-xl bg-yellow-500 text-black font-bold"
          >
            حفظ المنتج
          </button>
        </div>

      </div>
    </div>
  );
}