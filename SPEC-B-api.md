---
sourceDocument: prd.md
artifactType: api-contract
project_name: Telecom Cart Experience API
date: "2026-05-12"
status: draft
---

# SPEC-B - API Contract

## Purpose

This document defines the HTTP contract for the Telecom Cart Experience API. The contract is intentionally small and focused on cart context lifecycle, core cart mutations, and deterministic expired-context behavior.

All endpoints consume and produce JSON.

## Common Types

### Cart Response Shape

```json
{
  "contextId": "ctx_123",
  "expiresAt": "2026-05-12T18:30:00.000Z",
  "cart": {
    "contextId": "ctx_123",
    "items": [],
    "totals": {
      "itemCount": 0,
      "subtotal": 0
    }
  }
}
```

### Error Response Shape

```json
{
  "error": {
    "code": "CART_CONTEXT_EXPIRED",
    "message": "Cart context has expired. Create a new cart context to continue."
  }
}
```

Error `message` values should be human-readable but tests should assert primarily on `code`.

## Endpoints

### Create Cart Context

```http
POST /cart-contexts
```

Creates a new cart context with an empty cart.

#### Request

No body is required.

#### Success Response

Status: `201 Created`

```json
{
  "contextId": "ctx_123",
  "expiresAt": "2026-05-12T18:30:00.000Z",
  "cart": {
    "contextId": "ctx_123",
    "items": [],
    "totals": {
      "itemCount": 0,
      "subtotal": 0
    }
  }
}
```

### Get Cart

```http
GET /cart-contexts/{contextId}/cart
```

Returns cart state for a valid context.

#### Success Response

Status: `200 OK`

Returns the common cart response shape.

#### Error Responses

Status: `404 Not Found`

```json
{
  "error": {
    "code": "CART_CONTEXT_NOT_FOUND",
    "message": "Cart context was not found."
  }
}
```

Status: `410 Gone`

```json
{
  "error": {
    "code": "CART_CONTEXT_EXPIRED",
    "message": "Cart context has expired. Create a new cart context to continue."
  }
}
```

### Add Cart Item

```http
POST /cart-contexts/{contextId}/cart/items
```

Adds an item to the cart for a valid context.

#### Request Body

```json
{
  "productId": "internet-1gb",
  "name": "1Gb Fiber Internet",
  "quantity": 1,
  "unitPrice": 80
}
```

Validation rules:

- `productId` is required and must be a non-empty string.
- `name` is required and must be a non-empty string.
- `quantity` is required and must be a positive integer.
- `unitPrice` is required and must be a non-negative number.

#### Success Response

Status: `201 Created`

Returns the common cart response shape with the new item included.

If the same `productId` is added more than once, implementation must use one deterministic behavior and document it in code/tests. Preferred behavior: append a distinct line item with its own `itemId`.

#### Error Responses

Status: `400 Bad Request` with `VALIDATION_ERROR`.

Status: `404 Not Found` with `CART_CONTEXT_NOT_FOUND`.

Status: `410 Gone` with `CART_CONTEXT_EXPIRED`.

### Update Cart Item Quantity

```http
PATCH /cart-contexts/{contextId}/cart/items/{itemId}
```

Updates quantity for an existing cart item in a valid context.

#### Request Body

```json
{
  "quantity": 2
}
```

Validation rules:

- `quantity` is required and must be a positive integer.

#### Success Response

Status: `200 OK`

Returns the common cart response shape with updated totals.

#### Error Responses

Status: `400 Bad Request` with `VALIDATION_ERROR`.

Status: `404 Not Found` with either:

- `CART_CONTEXT_NOT_FOUND`
- `CART_ITEM_NOT_FOUND`

Status: `410 Gone` with `CART_CONTEXT_EXPIRED`.

### Remove Cart Item

```http
DELETE /cart-contexts/{contextId}/cart/items/{itemId}
```

Removes an existing cart item from a valid context.

#### Success Response

Status: `200 OK`

Returns the common cart response shape with updated totals.

#### Error Responses

Status: `404 Not Found` with either:

- `CART_CONTEXT_NOT_FOUND`
- `CART_ITEM_NOT_FOUND`

Status: `410 Gone` with `CART_CONTEXT_EXPIRED`.

## Expiry Contract

The expired-context contract is mandatory and uniform:

- Any read or mutation operation using an expired `contextId` returns `410 Gone`.
- The error code must be `CART_CONTEXT_EXPIRED`.
- Expired contexts are not silently recreated.
- Expired contexts are not mutated.
- Recovery requires `POST /cart-contexts` to create a new context.

This behavior applies to:

- `GET /cart-contexts/{contextId}/cart`
- `POST /cart-contexts/{contextId}/cart/items`
- `PATCH /cart-contexts/{contextId}/cart/items/{itemId}`
- `DELETE /cart-contexts/{contextId}/cart/items/{itemId}`

## Validation Contract

Validation failures return:

Status: `400 Bad Request`

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request body is invalid."
  }
}
```

Validation messages may be expanded with field-level details during implementation, but the stable top-level code must remain `VALIDATION_ERROR`.

## Determinism Requirements

- Response status codes must match this contract.
- Error codes must be stable.
- Totals must be derived consistently after each mutation.
- Expiry tests must not rely on wall-clock sleeping.
- Missing context and expired context must remain distinguishable.
