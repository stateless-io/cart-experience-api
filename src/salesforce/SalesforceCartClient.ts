import type {
  AddCartItemInput,
  CreateCartContextResult,
  UpdateCartItemQuantityInput,
} from "../domain/cart";

export interface SalesforceCartClient {
  createCartContext(): Promise<CreateCartContextResult>;
  getCart(contextId: string): Promise<CreateCartContextResult>;
  addCartItem(
    contextId: string,
    item: AddCartItemInput,
  ): Promise<CreateCartContextResult>;
  updateCartItemQuantity(
    contextId: string,
    itemId: string,
    update: UpdateCartItemQuantityInput,
  ): Promise<CreateCartContextResult>;
  removeCartItem(
    contextId: string,
    itemId: string,
  ): Promise<CreateCartContextResult>;
}
