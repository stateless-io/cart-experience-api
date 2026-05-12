export const ErrorCode = {
  ValidationError: "VALIDATION_ERROR",
  CartContextNotFound: "CART_CONTEXT_NOT_FOUND",
  CartContextExpired: "CART_CONTEXT_EXPIRED",
  CartItemNotFound: "CART_ITEM_NOT_FOUND"
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

export type ErrorResponse = {
  error: {
    code: ErrorCode;
    message: string;
  };
};

export class CartApiError extends Error {
  constructor(
    readonly code: ErrorCode,
    message: string,
    readonly statusCode: number
  ) {
    super(message);
    this.name = "CartApiError";
  }
}

export const errorMessages: Record<ErrorCode, string> = {
  [ErrorCode.ValidationError]: "Request body is invalid.",
  [ErrorCode.CartContextNotFound]: "Cart context was not found.",
  [ErrorCode.CartContextExpired]:
    "Cart context has expired. Create a new cart context to continue.",
  [ErrorCode.CartItemNotFound]: "Cart item was not found."
};
