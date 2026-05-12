# Development Notes

## Test Environment

The route/API tests use `request(app)` against the Express app exported from
`src/app.ts`. The tests do not call `app.listen()` directly.

Some restricted sandboxes may block Supertest's internal ephemeral listener
binding with `EPERM`. That is an environment limitation rather than an
application issue. The test suite runs successfully in a normal local Node.js
environment.

## Prompt Log

### Initial Scaffold

```text
Use the attached SPEC-A-architecture.md and SPEC-B-api.md as the source of truth.

Implement only the initial project skeleton for the Telecom Cart Experience API.

Requirements:
- TypeScript on Node 20+
- Use Express as the minimal HTTP framework
- Jest for unit tests
- Zod for request validation.
- No database
- No authentication
- In-memory state only

Generate:
- package.json
- tsconfig.json
- folder structure
- domain types
- error types
- SalesforceCartClient interface
- in-memory SalesforceCartClient implementation skeleton
- app bootstrap
- placeholder route registration

Do not implement business logic yet.
Do not add features beyond the specs.
Do not introduce repositories, CQRS, event sourcing, or infrastructure abstractions.

The implementation must remain intentionally small and cohesive.
```

Implementation notes: created the TypeScript/Express/Jest/Zod skeleton, app bootstrap,
domain and error types, Salesforce client interface, in-memory client shell, and
placeholder route registration.

### Salesforce Client Behavior

```text
Using SPEC-A-architecture.md and SPEC-B-api.md as the source of truth, review the current scaffold and implement the in-memory SalesforceCartClient behavior only.

Scope:
- Implement create cart context
- Implement get cart
- Implement add item
- Implement update item quantity
- Implement remove item
- Keep all cart state in memory
- Generate contextId and itemId deterministically enough for tests
- Assign expiresAt at context creation using the centralized TTL config
- Use an injectable clock or equivalent deterministic time provider
- Distinguish missing context from expired context
- Expired contexts must return CART_CONTEXT_EXPIRED behavior and must not be silently recreated or mutated
- Totals must be derived from items, not independently mutable

Do not implement HTTP route logic in this step.
Do not add persistence, auth, queues, repositories, observability, or production infrastructure.
Do not expand the API surface beyond SPEC-B.

After implementation, add or update only focused unit tests for the SalesforceCartClient behavior:
- create context
- retrieve valid context
- missing context
- expired context
- add/update/remove item while valid
- mutation rejected after expiry without sleeping

Keep the implementation small and cohesive.
```

Implementation notes: implemented process-local in-memory cart contexts, monotonic IDs,
TTL expiry, derived totals, lifecycle error codes, and focused Salesforce client
unit tests.

### HTTP/API Layer

```text
Review the current implementation and align the HTTP/API layer with SPEC-B-api.md.

Focus only on:
- route behavior,
- request validation,
- deterministic error mapping,
- and integration with the existing SalesforceCartClient.

Requirements:
- Keep route handlers thin
- Do not duplicate lifecycle logic already handled by InMemorySalesforceCartClient
- Map CartApiError codes to stable HTTP responses from SPEC-B
- Ensure:
  - CART_CONTEXT_NOT_FOUND -> 404
  - CART_CONTEXT_EXPIRED -> 410
  - CART_ITEM_NOT_FOUND -> 404
  - VALIDATION_ERROR -> 400
- Preserve deterministic JSON response shapes
- Use Zod validation consistently
- Do not add middleware abstractions, repositories, services, auth, persistence, or extra infrastructure
- Keep implementation intentionally small and cohesive

After implementation:
- add focused route/API tests for critical paths only
- verify responses match SPEC-B-api.md
- avoid broad integration-test expansion
```

Implementation notes: registered SPEC-B routes, added Zod body validation, mapped
`CartApiError` codes to deterministic JSON responses, added conventional
Express/Supertest route tests, and kept `server.ts` as the only listener.

### Supertest Constraint

```text
Keep Supertest.
Do not install node-mocks-http.
Add a note that the sandbox blocked ephemeral listener binding, but the test approach remains standard Express/Supertest.
```

Implementation notes: retained Supertest, did not add `node-mocks-http`, and noted the
sandbox listener limitation.

```text
Do not replace route tests with direct handler tests.

Keep the route tests in standard Supertest style against the Express app instance.

Requirements:
- app.ts exports the Express app without calling listen()
- server.ts is the only file that calls listen()
- tests import app from app.ts
- tests use request(app)
- tests must not call app.listen()
- tests must not use request("http://...")
- do not add node-mocks-http or any request/response mock library
- do not write custom direct-handler tests

If the sandbox blocks Supertest’s internal ephemeral listener, leave the tests in conventional Supertest form and document this as a sandbox limitation. The repository should prioritize clean, reviewer-runnable tests over sandbox-specific workarounds.
```

Implementation notes: kept route tests in conventional `request(app)` form, did not add
request/response mock libraries, and documented the sandbox listener limitation.

```text
Yes. Keep the conventional Supertest tests as-is and run the Jest suite outside the sandbox.

Do not replace Supertest tests with handler mocks.
Do not add node-mocks-http.
Do not change app/server structure further unless the tests reveal a real project issue.

Expected structure:
- app.ts exports the Express app
- server.ts is the only file that calls listen()
- route tests import app.ts and use request(app)

If build passes but route tests only fail inside the sandbox due to EPERM on ephemeral binding, document that in PROMPTS.md/README notes as an environment limitation, not an implementation limitation.
```

Implementation notes: left the app/server/test structure intact, ran the Supertest
suite outside the sandbox, and documented the environment limitation.

### Cleanup Review

```text
Review the current implementation against SPEC-A-architecture.md and SPEC-B-api.md.

Do not add new features.

Focus only on:
- removing unused code,
- simplifying any overbuilt abstractions,
- ensuring route responses match SPEC-B,
- ensuring error codes/status codes are stable,
- ensuring README.md documents setup/run/test commands,
- documenting tradeoffs and known gaps,
- updating PROMPTS.md with the exact prompts used and short notes about accepted edits.

Keep the implementation intentionally small and cohesive.

After cleanup, run:
- npm run build
- npm test
```

Implementation notes: removed unused/duplicated error status storage, added README
setup/run/build/test documentation, and recorded accepted prompt-driven changes.

### Duplicate Product Documentation

```text
The user proposed a few optional improvement suggestions:
- add an inline comment documenting duplicate productId behavior,
- add a focused test proving duplicate productIds append distinct line items,
- clarify the Supertest sandbox/environment note.

After review, the user instructed Claude to proceed and update the docs.
```

Implementation notes: documented duplicate `productId` behavior inline, added a
focused Salesforce client test proving duplicate products append distinct line
items, and clarified the README Supertest environment note.
