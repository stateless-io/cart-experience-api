import type { Express, RequestHandler, Response } from "express";
import { CartApiError, ErrorCode, errorMessages } from "../domain/errors";
import { validateBody } from "../http/validation";
import type { SalesforceCartClient } from "../salesforce/SalesforceCartClient";
import { addCartItemSchema, updateCartItemQuantitySchema } from "./cartSchemas";

type CartRouteDependencies = {
  salesforceCartClient: SalesforceCartClient;
};

export function registerCartRoutes(
  app: Express,
  { salesforceCartClient }: CartRouteDependencies,
): void {
  app.post(
    "/cart-contexts",
    handle(async (_req, res) => {
      const result = await salesforceCartClient.createCartContext();

      res.status(201).json(result);
    }),
  );

  app.get(
    "/cart-contexts/:contextId/cart",
    handle(async (req, res) => {
      const result = await salesforceCartClient.getCart(req.params.contextId);

      res.status(200).json(result);
    }),
  );

  app.post(
    "/cart-contexts/:contextId/cart/items",
    validateBody(addCartItemSchema),
    handle(async (req, res) => {
      const result = await salesforceCartClient.addCartItem(
        req.params.contextId,
        req.body,
      );

      res.status(201).json(result);
    }),
  );

  app.patch(
    "/cart-contexts/:contextId/cart/items/:itemId",
    validateBody(updateCartItemQuantitySchema),
    handle(async (req, res) => {
      const result = await salesforceCartClient.updateCartItemQuantity(
        req.params.contextId,
        req.params.itemId,
        req.body,
      );

      res.status(200).json(result);
    }),
  );

  app.delete(
    "/cart-contexts/:contextId/cart/items/:itemId",
    handle(async (req, res) => {
      const result = await salesforceCartClient.removeCartItem(
        req.params.contextId,
        req.params.itemId,
      );

      res.status(200).json(result);
    }),
  );
}

function handle(handler: RequestHandler): RequestHandler {
  return async (req, res, next) => {
    try {
      await handler(req, res, next);
    } catch (error) {
      if (!sendError(res, error)) {
        next(error);
      }
    }
  };
}

function sendError(res: Response, error: unknown): boolean {
  if (error instanceof CartApiError) {
    res.status(statusFor(error.code)).json({
      error: {
        code: error.code,
        message: errorMessages[error.code],
      },
    });
    return true;
  }

  return false;
}

function statusFor(code: ErrorCode): number {
  switch (code) {
    case ErrorCode.CartContextExpired:
      return 410;
    case ErrorCode.CartContextNotFound:
    case ErrorCode.CartItemNotFound:
      return 404;
    case ErrorCode.ValidationError:
      return 400;
  }
}
