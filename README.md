# Telecom Cart Experience API

Small TypeScript/Express implementation of the cart-context slice described in
`SPEC-A-architecture.md` and `SPEC-B-api.md`.

## Setup

```sh
npm install
```

## Run

```sh
npm run dev
```

The API listens on `PORT` when set, otherwise `3000`.

## Build

```sh
npm run build
```

## Test

```sh
npm test
```

The route tests use the standard Express/Supertest pattern with `request(app)`.
Some restricted sandboxes block Supertest's internal ephemeral listener binding;
run the suite in a normal local environment if that occurs.

## Tradeoffs

- In-memory state only; carts are lost when the process exits.
- Context and item IDs are monotonic process-local counters to keep tests
  deterministic.
- Expiry uses a centralized TTL and an injectable clock in the Salesforce client.
- Route handlers intentionally stay thin and delegate cart lifecycle behavior to
  `SalesforceCartClient`.

## Known Gaps

- No database, authentication, external Salesforce integration, queues,
  observability platform, or production deployment setup.
- No promotions, taxes, inventory, shipping, payment, or order submission.
- Malformed JSON handling is left to Express defaults; Zod validation covers
  parsed request bodies for the SPEC-B mutation requests.

## Additional Notes

Additional planning notes used during the spec-definition phase are included in `prd.md`.
