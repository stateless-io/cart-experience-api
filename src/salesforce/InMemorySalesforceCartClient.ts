import { DEFAULT_CART_CONTEXT_TTL_MS } from "../config/cartContext";
import type {
  AddCartItemInput,
  Cart,
  CartContext,
  CartItem,
  CreateCartContextResult,
  UpdateCartItemQuantityInput,
} from "../domain/cart";
import { CartApiError, ErrorCode, errorMessages } from "../domain/errors";
import type { SalesforceCartClient } from "./SalesforceCartClient";

type Clock = () => Date;

export class InMemorySalesforceCartClient implements SalesforceCartClient {
  private readonly contexts = new Map<string, CartContext>();
  private nextContextNumber = 1;
  private nextItemNumber = 1;

  constructor(
    private readonly clock: Clock = () => new Date(),
    private readonly ttlMs: number = DEFAULT_CART_CONTEXT_TTL_MS,
  ) {}

  async createCartContext(): Promise<CreateCartContextResult> {
    const now = this.clock();
    const contextId = `ctx_${this.nextContextNumber++}`;
    const expiresAt = new Date(now.getTime() + this.ttlMs).toISOString();
    const context: CartContext = {
      contextId,
      createdAt: now.toISOString(),
      expiresAt,
      cart: {
        contextId,
        items: [],
        totals: deriveTotals([]),
      },
    };

    this.contexts.set(contextId, context);

    return toResult(context);
  }

  async getCart(contextId: string): Promise<CreateCartContextResult> {
    return toResult(this.getValidContext(contextId));
  }

  async addCartItem(
    contextId: string,
    item: AddCartItemInput,
  ): Promise<CreateCartContextResult> {
    const context = this.getValidContext(contextId);
    const cartItem: CartItem = {
      itemId: `item_${this.nextItemNumber++}`,
      ...item,
    };

    context.cart = withItems(context.cart, [...context.cart.items, cartItem]);

    return toResult(context);
  }

  async updateCartItemQuantity(
    contextId: string,
    itemId: string,
    update: UpdateCartItemQuantityInput,
  ): Promise<CreateCartContextResult> {
    const context = this.getValidContext(contextId);
    const itemExists = context.cart.items.some(
      (item) => item.itemId === itemId,
    );

    if (!itemExists) {
      throw cartError(ErrorCode.CartItemNotFound);
    }

    context.cart = withItems(
      context.cart,
      context.cart.items.map((item) =>
        item.itemId === itemId ? { ...item, quantity: update.quantity } : item,
      ),
    );

    return toResult(context);
  }

  async removeCartItem(
    contextId: string,
    itemId: string,
  ): Promise<CreateCartContextResult> {
    const context = this.getValidContext(contextId);
    const remainingItems = context.cart.items.filter(
      (item) => item.itemId !== itemId,
    );

    if (remainingItems.length === context.cart.items.length) {
      throw cartError(ErrorCode.CartItemNotFound);
    }

    context.cart = withItems(context.cart, remainingItems);

    return toResult(context);
  }

  private getValidContext(contextId: string): CartContext {
    const context = this.contexts.get(contextId);

    if (!context) {
      throw cartError(ErrorCode.CartContextNotFound);
    }

    if (this.clock().getTime() >= Date.parse(context.expiresAt)) {
      throw cartError(ErrorCode.CartContextExpired);
    }

    return context;
  }
}

function withItems(cart: Cart, items: CartItem[]): Cart {
  return {
    contextId: cart.contextId,
    items,
    totals: deriveTotals(items),
  };
}

function deriveTotals(items: CartItem[]) {
  return {
    itemCount: items.reduce((total, item) => total + item.quantity, 0),
    subtotal: items.reduce(
      (total, item) => total + item.quantity * item.unitPrice,
      0,
    ),
  };
}

function toResult(context: CartContext): CreateCartContextResult {
  return {
    contextId: context.contextId,
    expiresAt: context.expiresAt,
    cart: {
      contextId: context.cart.contextId,
      items: context.cart.items.map((item) => ({ ...item })),
      totals: { ...context.cart.totals },
    },
  };
}

function cartError(code: ErrorCode): CartApiError {
  return new CartApiError(code, errorMessages[code]);
}
