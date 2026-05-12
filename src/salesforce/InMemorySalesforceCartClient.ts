import { DEFAULT_CART_CONTEXT_TTL_MS } from "../config/cartContext";
import type {
  AddCartItemInput,
  CartContext,
  CreateCartContextResult,
  UpdateCartItemQuantityInput
} from "../domain/cart";
import type { SalesforceCartClient } from "./SalesforceCartClient";

type Clock = () => Date;

export class InMemorySalesforceCartClient implements SalesforceCartClient {
  private readonly contexts = new Map<string, CartContext>();

  constructor(
    private readonly clock: Clock = () => new Date(),
    private readonly ttlMs: number = DEFAULT_CART_CONTEXT_TTL_MS
  ) {}

  async createCartContext(): Promise<CreateCartContextResult> {
    void this.contexts;
    void this.clock;
    void this.ttlMs;
    throw new Error("Not implemented yet.");
  }

  async getCart(contextId: string): Promise<CreateCartContextResult> {
    void contextId;
    throw new Error("Not implemented yet.");
  }

  async addCartItem(
    contextId: string,
    item: AddCartItemInput
  ): Promise<CreateCartContextResult> {
    void contextId;
    void item;
    throw new Error("Not implemented yet.");
  }

  async updateCartItemQuantity(
    contextId: string,
    itemId: string,
    update: UpdateCartItemQuantityInput
  ): Promise<CreateCartContextResult> {
    void contextId;
    void itemId;
    void update;
    throw new Error("Not implemented yet.");
  }

  async removeCartItem(
    contextId: string,
    itemId: string
  ): Promise<CreateCartContextResult> {
    void contextId;
    void itemId;
    throw new Error("Not implemented yet.");
  }
}
