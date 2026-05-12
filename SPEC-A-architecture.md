---
sourceDocument: prd.md
artifactType: architecture
project_name: Telecom Cart Experience API
date: '2026-05-12'
status: draft
---

# SPEC-A - Architecture

## Purpose

This document defines the implementation architecture for a small telecom cart Experience API. The design is intentionally constrained to the assignment slice: TypeScript on Node 20+, minimal HTTP framework, in-memory state, no real Salesforce integration, and deterministic lifecycle behavior.

The central architectural concern is cart-context lifecycle correctness. API behavior must be explicit when a context is valid, missing, or expired.

## Architectural Goals

- Keep the API small, readable, and contract-driven.
- Preserve a clear boundary between HTTP handling and cart-domain behavior.
- Model Salesforce-style non-persistent cart context through an in-process test double.
- Make expiry behavior deterministic and easy to test.
- Avoid production platform concerns that are outside the assignment, including databases, authentication, queues, observability platforms, deployment infrastructure, and real Salesforce connectivity.

## System Context

```text
Client
  |
  | HTTP JSON
  v
Experience API
  |
  | Cart operations through interface
  v
SalesforceCartClient test double
  |
  | In-memory cart contexts with expiry metadata
  v
Process memory
```

## Components

### HTTP API Layer

Responsibilities:

- Parse JSON request bodies.
- Validate required path and body fields.
- Map domain results to deterministic HTTP responses.
- Keep routing thin; business behavior should live outside route handlers where practical.

Non-responsibilities:

- No persistence decisions.
- No direct mutation of cart storage outside the cart client abstraction.
- No authentication or authorization.

### Cart Application Service

Responsibilities:

- Express core use cases in terms of cart operations.
- Normalize validation and error results.
- Keep expiry handling consistent across read and mutation flows.

Expected operations:

- Create cart context.
- Retrieve cart.
- Add item.
- Update item quantity.
- Remove item.

### SalesforceCartClient Test Double

Responsibilities:

- Encapsulate all Salesforce-like cart behavior.
- Store cart contexts in memory.
- Assign expiry metadata at context creation.
- Return explicit expired-context results after expiry.
- Avoid persisting expired contexts as recoverable production state.

This client is not a mock of the HTTP API. It is the in-process adapter standing in for Salesforce cart-context behavior.

## Data Model

### Cart Context

```ts
type CartContext = {
  contextId: string;
  cart: Cart;
  createdAt: string;
  expiresAt: string;
};
```

### Cart

```ts
type Cart = {
  contextId: string;
  items: CartItem[];
  totals: CartTotals;
};
```

### Cart Item

```ts
type CartItem = {
  itemId: string;
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
};
```

### Cart Totals

```ts
type CartTotals = {
  itemCount: number;
  subtotal: number;
};
```

Totals are derived from cart items. They should not be independently mutable.

## Lifecycle Semantics

### Creation

- Creating a cart context returns a new `contextId`, empty cart state, and expiry metadata.
- The implementation may use a short default TTL suitable for tests, but the value must be centralized and deterministic.

### Valid Context

For an existing, unexpired context:

- Retrieve returns current cart state.
- Add item appends a new item or applies the documented merge behavior from `SPEC-B-api.md`.
- Update quantity changes an existing item quantity.
- Remove item removes an existing item.

### Missing Context

For an unknown `contextId`:

- API returns a deterministic not-found response.
- Missing context is distinct from expired context.

### Expired Context

For an expired `contextId`:

- Read and mutation operations return a deterministic expired-context response.
- Expired contexts cannot be revived by mutation.
- Recovery path is to create a new cart context.
- This behavior must be identical across retrieve, add, update, and remove operations.

## Error Model

Use stable machine-readable error codes so tests and consumers do not depend on prose.

Required error codes:

- `VALIDATION_ERROR`
- `CART_CONTEXT_NOT_FOUND`
- `CART_CONTEXT_EXPIRED`
- `CART_ITEM_NOT_FOUND`

## Testing Strategy

Unit tests should cover the critical path rather than broad platform behavior:

- cart context creation returns context and expiry metadata,
- retrieval works while context is valid,
- add/update/remove work while context is valid,
- expired contexts return `CART_CONTEXT_EXPIRED` consistently,
- unknown contexts return `CART_CONTEXT_NOT_FOUND`,
- invalid request bodies return `VALIDATION_ERROR`.

Time-dependent expiry tests should use an injectable clock or equivalent deterministic control rather than sleeping.

## Implementation Constraints

- Runtime: Node 20+.
- Language: TypeScript.
- HTTP framework: minimal.
- Persistence: in-memory only.
- External integrations: none.
- Salesforce behavior: in-process `SalesforceCartClient` test double only.

## Deliberately Out of Scope

- Real Salesforce API calls.
- Database persistence.
- Distributed cache/session storage.
- Authentication and authorization.
- Multi-tenant account model.
- Production deployment, logging, tracing, or metrics platform.
- Promotions, taxes, inventory, shipping, payment, and order submission.

