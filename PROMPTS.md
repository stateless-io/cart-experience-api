# Development Notes

## Test Environment

The route/API tests use the conventional Express and Supertest pattern:
`request(app)` against the app exported from `src/app.ts`. The tests do not
call `app.listen()` directly.

Some restricted sandboxes may block Supertest's internal ephemeral listener
binding with `EPERM`. That is an environment limitation, not an implementation
limitation. Run the Jest suite in a normal local environment to execute the
route tests.
