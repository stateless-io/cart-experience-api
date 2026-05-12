import { ErrorCode } from "../domain/errors";
import { InMemorySalesforceCartClient } from "./InMemorySalesforceCartClient";

describe("InMemorySalesforceCartClient", () => {
  const ttlMs = 60_000;
  let now: Date;
  let client: InMemorySalesforceCartClient;

  beforeEach(() => {
    now = new Date("2026-05-12T18:00:00.000Z");
    client = new InMemorySalesforceCartClient(() => now, ttlMs);
  });

  it("creates a cart context with deterministic ids and expiry metadata", async () => {
    const result = await client.createCartContext();

    expect(result).toEqual({
      contextId: "ctx_1",
      expiresAt: "2026-05-12T18:01:00.000Z",
      cart: {
        contextId: "ctx_1",
        items: [],
        totals: {
          itemCount: 0,
          subtotal: 0,
        },
      },
    });
  });

  it("retrieves a valid cart context", async () => {
    const created = await client.createCartContext();

    await expect(client.getCart(created.contextId)).resolves.toEqual(created);
  });

  it("distinguishes a missing context from an expired context", async () => {
    await expect(client.getCart("ctx_missing")).rejects.toMatchObject({
      code: ErrorCode.CartContextNotFound,
    });
  });

  it("returns expired-context errors after expiry", async () => {
    const created = await client.createCartContext();
    now = new Date("2026-05-12T18:01:00.000Z");

    await expect(client.getCart(created.contextId)).rejects.toMatchObject({
      code: ErrorCode.CartContextExpired,
    });
  });

  it("adds, updates, and removes items while the context is valid", async () => {
    const created = await client.createCartContext();

    const added = await client.addCartItem(created.contextId, {
      productId: "internet-1gb",
      name: "1Gb Fiber Internet",
      quantity: 1,
      unitPrice: 80,
    });

    expect(added.cart.items).toEqual([
      {
        itemId: "item_1",
        productId: "internet-1gb",
        name: "1Gb Fiber Internet",
        quantity: 1,
        unitPrice: 80,
      },
    ]);
    expect(added.cart.totals).toEqual({ itemCount: 1, subtotal: 80 });

    const updated = await client.updateCartItemQuantity(
      created.contextId,
      "item_1",
      { quantity: 2 },
    );

    expect(updated.cart.items[0]).toMatchObject({ quantity: 2 });
    expect(updated.cart.totals).toEqual({ itemCount: 2, subtotal: 160 });

    const removed = await client.removeCartItem(created.contextId, "item_1");

    expect(removed.cart.items).toEqual([]);
    expect(removed.cart.totals).toEqual({ itemCount: 0, subtotal: 0 });
  });

  it("rejects mutations after expiry without mutating cart state", async () => {
    const created = await client.createCartContext();
    const added = await client.addCartItem(created.contextId, {
      productId: "internet-1gb",
      name: "1Gb Fiber Internet",
      quantity: 1,
      unitPrice: 80,
    });

    now = new Date("2026-05-12T18:01:00.000Z");

    await expect(
      client.addCartItem(created.contextId, {
        productId: "mobile-unlimited",
        name: "Unlimited Mobile",
        quantity: 1,
        unitPrice: 45,
      }),
    ).rejects.toMatchObject({
      code: ErrorCode.CartContextExpired,
    });
    await expect(
      client.updateCartItemQuantity(created.contextId, "item_1", {
        quantity: 3,
      }),
    ).rejects.toMatchObject({
      code: ErrorCode.CartContextExpired,
    });
    await expect(
      client.removeCartItem(created.contextId, "item_1"),
    ).rejects.toMatchObject({
      code: ErrorCode.CartContextExpired,
    });

    now = new Date("2026-05-12T18:00:30.000Z");

    await expect(client.getCart(created.contextId)).resolves.toEqual(added);
  });

  it("returns item-not-found errors for missing items in a valid context", async () => {
    const created = await client.createCartContext();

    await expect(
      client.updateCartItemQuantity(created.contextId, "item_missing", {
        quantity: 2,
      }),
    ).rejects.toMatchObject({
      code: ErrorCode.CartItemNotFound,
    });
    await expect(
      client.removeCartItem(created.contextId, "item_missing"),
    ).rejects.toMatchObject({
      code: ErrorCode.CartItemNotFound,
    });
  });
});
