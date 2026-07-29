type CartSummaryProps = {
  total: number;
  onClear: () => void;
};

export default function CartSummary({
  total,
  onClear,
}: CartSummaryProps) {
  return (
    <div className="mt-10 bg-zinc-900 rounded-3xl p-6 border border-yellow-500">
      <h2 className="text-3xl font-bold text-yellow-400">
        الإجمالي: {total} ريال
      </h2>

      <button
        onClick={onClear}
        className="mt-5 bg-yellow-400 text-black px-8 py-3 rounded-full font-bold"
      >
        إفراغ السلة
      </button>
    </div>
  );
}