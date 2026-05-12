export type CartTotals = {
  itemCount: number;
  subtotal: number;
};

export type CartItem = {
  itemId: string;
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
};

export type Cart = {
  contextId: string;
  items: CartItem[];
  totals: CartTotals;
};

export type CartContext = {
  contextId: string;
  cart: Cart;
  createdAt: string;
  expiresAt: string;
};

export type CreateCartContextResult = {
  contextId: string;
  expiresAt: string;
  cart: Cart;
};

export type AddCartItemInput = {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
};

export type UpdateCartItemQuantityInput = {
  quantity: number;
};
