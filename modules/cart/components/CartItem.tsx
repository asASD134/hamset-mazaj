type CartItemProps = {
  image: string;
  name: string;
  price: number;
  quantity: number;
  onRemove: () => void;
};

export default function CartItem({
  image,
  name,
  price,
  quantity,
  onRemove,
}: CartItemProps) {
  return (
    <div className="flex items-center justify-between bg-zinc-900 rounded-3xl p-5 border border-yellow-500/20">
      <div className="flex items-center gap-5">
        <img
          src={image}
          alt={name}
          className="w-24 h-24 object-cover rounded-2xl"
        />

        <div>
          <h2 className="text-xl font-bold text-yellow-400">
            {name}
          </h2>

          <p className="text-gray-300">
            العدد: {quantity}
          </p>

          <p className="text-white">
            {price} ريال
          </p>
        </div>
      </div>

      <button
        onClick={onRemove}
        className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-full font-bold"
      >
        حذف
      </button>
    </div>
  );
}