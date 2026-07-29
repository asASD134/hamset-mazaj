import { CartItem } from "../types/cart";

export function getCartTotal(items: CartItem[]) {
  return items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
}

export function getCartCount(items: CartItem[]) {
  return items.reduce(
    (count, item) => count + item.quantity,
    0
  );
}

export function isItemInCart(
  items: CartItem[],
  id: string
) {
  return items.some((item) => item.id === id);
}