"use client";

import { useCart } from "@/context/CartContext";

type MenuCardProps = {
  name: string;
  description: string;
  price: string;
  icon: string;
  image: string;
  featured?: boolean;
};

export default function MenuCard({
  name,
  description,
  price,
  icon,
  image,
  featured = false,
}: MenuCardProps) {

  const { addToCart, items } = useCart();

  const priceNumber = Number(
    price.replace(/[^\d]/g, "")
  );

  const cartItem = items.find(
    (item) => item.id === name
  );

  function handleAddToCart() {
    addToCart({
      id: name,
      name,
      price: priceNumber,
      image,
      quantity: 1,
    });
  }

  return (
    <div className="relative overflow-hidden rounded-3xl bg-zinc-900 border border-yellow-500/20 hover:border-yellow-400 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-yellow-500/20">

      {featured && (
        <div className="absolute top-4 right-4 z-10 bg-yellow-400 text-black text-xs font-bold px-3 py-1 rounded-full">
          ⭐ الأكثر طلبًا
        </div>
      )}

      {cartItem && (
        <div className="absolute top-4 left-4 z-20 bg-green-600 text-white px-3 py-2 rounded-full font-bold text-sm">
          ✅ في السلة ({cartItem.quantity})
        </div>
      )}

      <img
        src={image}
        alt={name}
        className="w-full h-56 object-cover"
      />

      <div className="p-6">

        <div className="text-4xl mb-3">
          {icon}
        </div>

        <h3 className="text-2xl font-bold text-yellow-400 mb-3">
          {name}
        </h3>

        <p className="text-gray-300 mb-6 leading-7">
          {description}
        </p>

        <div className="flex justify-between items-center">

          <span className="text-2xl font-bold text-yellow-400">
            {price}
          </span>

          <button
            onClick={handleAddToCart}
            className="bg-yellow-400 hover:bg-yellow-300 text-black px-4 py-2 rounded-full font-bold transition"
          >
            🛒 إضافة للسلة
          </button>

        </div>

      </div>

    </div>
  );
}