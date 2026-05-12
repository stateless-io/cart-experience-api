import request from "supertest";
import app from "../app";
import { ErrorCode, errorMessages } from "../domain/errors";

describe("cart routes", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-05-12T18:00:00.000Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // These are conventional Express/Supertest route tests. Supertest may bind
  // an internal ephemeral listener, which some restricted sandboxes block.
  it("creates and retrieves a cart context using the SPEC-B response shape", async () => {
    const createResponse = await request(app)
      .post("/cart-contexts")
      .expect(201);
    const { contextId, expiresAt } = createResponse.body;

    expect(createResponse.body).toEqual({
      contextId,
      expiresAt,
      cart: {
        contextId,
        items: [],
        totals: {
          itemCount: 0,
          subtotal: 0,
        },
      },
    });
    expect(contextId).toMatch(/^ctx_\d+$/);
    expect(expiresAt).toBe("2026-05-12T18:15:00.000Z");

    await request(app)
      .get(`/cart-contexts/${contextId}/cart`)
      .expect(200)
      .expect(createResponse.body);
  });

  it("adds, updates, and removes an item through thin route handlers", async () => {
    const createResponse = await request(app)
      .post("/cart-contexts")
      .expect(201);
    const { contextId } = createResponse.body;

    const addResponse = await request(app)
      .post(`/cart-contexts/${contextId}/cart/items`)
      .send({
        productId: "internet-1gb",
        name: "1Gb Fiber Internet",
        quantity: 1,
        unitPrice: 80,
      })
      .expect(201);
    const { itemId } = addResponse.body.cart.items[0];

    expect(addResponse.body.cart.items).toEqual([
      {
        itemId,
        productId: "internet-1gb",
        name: "1Gb Fiber Internet",
        quantity: 1,
        unitPrice: 80,
      },
    ]);
    expect(addResponse.body.cart.totals).toEqual({
      itemCount: 1,
      subtotal: 80,
    });
    expect(itemId).toMatch(/^item_\d+$/);

    const updateResponse = await request(app)
      .patch(`/cart-contexts/${contextId}/cart/items/${itemId}`)
      .send({ quantity: 2 })
      .expect(200);

    expect(updateResponse.body.cart.items[0]).toMatchObject({ quantity: 2 });
    expect(updateResponse.body.cart.totals).toEqual({
      itemCount: 2,
      subtotal: 160,
    });

    const removeResponse = await request(app)
      .delete(`/cart-contexts/${contextId}/cart/items/${itemId}`)
      .expect(200);

    expect(removeResponse.body.cart.items).toEqual([]);
    expect(removeResponse.body.cart.totals).toEqual({
      itemCount: 0,
      subtotal: 0,
    });
  });

  it("returns VALIDATION_ERROR for invalid request bodies", async () => {
    const createResponse = await request(app)
      .post("/cart-contexts")
      .expect(201);
    const { contextId } = createResponse.body;

    await request(app)
      .post(`/cart-contexts/${contextId}/cart/items`)
      .send({
        productId: "",
        name: "1Gb Fiber Internet",
        quantity: 0,
        unitPrice: 80,
      })
      .expect(400)
      .expect({
        error: {
          code: ErrorCode.ValidationError,
          message: errorMessages[ErrorCode.ValidationError],
        },
      });
  });

  it("maps missing context and missing item errors to 404", async () => {
    await request(app)
      .get("/cart-contexts/ctx_missing/cart")
      .expect(404)
      .expect({
        error: {
          code: ErrorCode.CartContextNotFound,
          message: errorMessages[ErrorCode.CartContextNotFound],
        },
      });

    const createResponse = await request(app)
      .post("/cart-contexts")
      .expect(201);
    const { contextId } = createResponse.body;

    await request(app)
      .patch(`/cart-contexts/${contextId}/cart/items/item_missing`)
      .send({ quantity: 2 })
      .expect(404)
      .expect({
        error: {
          code: ErrorCode.CartItemNotFound,
          message: errorMessages[ErrorCode.CartItemNotFound],
        },
      });
  });

  it("maps expired context errors to 410 for reads and mutations", async () => {
    const createResponse = await request(app)
      .post("/cart-contexts")
      .expect(201);
    const { contextId } = createResponse.body;

    jest.setSystemTime(new Date("2026-05-12T18:15:00.000Z"));

    const expiredError = {
      error: {
        code: ErrorCode.CartContextExpired,
        message: errorMessages[ErrorCode.CartContextExpired],
      },
    };

    await request(app)
      .get(`/cart-contexts/${contextId}/cart`)
      .expect(410)
      .expect(expiredError);

    await request(app)
      .post(`/cart-contexts/${contextId}/cart/items`)
      .send({
        productId: "mobile-unlimited",
        name: "Unlimited Mobile",
        quantity: 1,
        unitPrice: 45,
      })
      .expect(410)
      .expect(expiredError);
  });
});
