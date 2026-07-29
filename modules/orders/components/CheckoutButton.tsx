"use client";

type CheckoutButtonProps = {
  onCheckout: () => void;
};

export default function CheckoutButton({
  onCheckout,
}: CheckoutButtonProps) {
  return (
    <button
      onClick={onCheckout}
      className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-2xl font-bold text-lg transition"
    >
      ✅ إرسال الطلب
    </button>
  );
}