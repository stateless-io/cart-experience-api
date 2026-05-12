import type { Express } from "express";
import type { SalesforceCartClient } from "../salesforce/SalesforceCartClient";

type CartRouteDependencies = {
  salesforceCartClient: SalesforceCartClient;
};

export function registerCartRoutes(
  _app: Express,
  dependencies: CartRouteDependencies
): void {
  void dependencies;

  // Endpoint slots from SPEC-B-api.md. Handlers are intentionally deferred.
  // POST   /cart-contexts
  // GET    /cart-contexts/:contextId/cart
  // POST   /cart-contexts/:contextId/cart/items
  // PATCH  /cart-contexts/:contextId/cart/items/:itemId
  // DELETE /cart-contexts/:contextId/cart/items/:itemId
}
