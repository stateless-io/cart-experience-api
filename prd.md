---
stepsCompleted:
  - step-01-init
  - step-02-discovery
  - step-02b-vision
  - step-02c-executive-summary
  - step-03-success
  - step-04-journeys
  - step-05-domain
  - fast-close
inputDocuments:
  - Inline assignment brief provided in chat (goal, deliverables, constraints for telecom Experience API)
workflowType: prd
project_name: Telecom Cart Experience API
date: "2026-05-12"
classification:
  projectType: api_backend
  domain: general
  complexity: medium
  projectContext: greenfield
workflowStatus: closed-intentionally
closureReason: Assignment scope is intentionally constrained; remaining PRD workflow steps were skipped to avoid roadmap/platform expansion.
---

# Product Requirements Document - Telecom Cart Experience API

Author: Chad Chaya
**Date:** 2026-05-12

## Executive Summary

This project delivers a small Experience API for a telecom cart use case. The API sits on top of a non-persistent Salesforce-style cart context and focuses on explicit lifecycle behavior, particularly cart-context expiry handling.

The implementation follows a spec-first workflow:

- architecture and API contracts are defined up front,
- implementation is constrained to those contracts,
- tests focus on the critical lifecycle and mutation paths.

### Implementation Scope

The scope is intentionally limited to:

- cart creation and retrieval,
- cart mutation operations,
- explicit expiration handling,
- deterministic API responses,
- critical-path tests.

Non-essential production concerns such as persistence, authentication, distributed coordination, and deployment infrastructure are intentionally excluded to keep the assignment focused on API correctness, abstraction boundaries, and lifecycle semantics.

## Project Classification

- **Project Type:** API / backend (`api_backend`)
- **Domain:** General software domain with telecom cart business context
- **Complexity:** Medium (small domain surface with non-trivial lifecycle/expiry semantics)
- **Project Context:** Greenfield

## Success Criteria

### User Success

- A reviewer can read `SPEC-A-architecture.md` and `SPEC-B-api.md` and clearly understand intended cart lifecycle behavior, especially context expiry semantics.
- A developer can implement the required slice directly from specs with minimal ambiguity.
- API consumers can execute core cart operations with deterministic and predictable responses.

### Business Success

- All required deliverables are complete and internally consistent:
  - `SPEC-A-architecture.md`
  - `SPEC-B-api.md`
  - `PROMPTS.md`
  - implementation in `src/`
  - unit tests in `tests/`
  - `README.md`
- The submission demonstrates assignment intent: correctness and clarity under constraints, not platform breadth.
- Specs and implementation align cleanly, making evaluation straightforward.

### Technical Success

- API remains intentionally small and cohesive.
- Cart lifecycle behavior is explicit and testable, including clear context-expiry handling.
- `SalesforceCartClient` is implemented as a realistic non-persistent test double.
- No database is introduced; in-memory state only.
- Core logic uses pure functions where practical.
- Critical-path tests verify:
  - active context behavior,
  - expired context behavior,
  - core mutation and retrieval operations,
  - consistent API responses.

### Measurable Outcomes

- `npm test` passes with all critical-path tests green.
- Endpoint behavior matches `SPEC-B-api.md` contracts.
- Expiry semantics are validated through explicit tests.
- Deliverables checklist is 100% complete.

## Product Scope

### Implementation Scope

- Produce concise, implementation-ready `SPEC-A-architecture.md`.
- Produce concrete endpoint contract spec in `SPEC-B-api.md`.
- Implement the defined Node 20+ TypeScript API slice only.
- Implement in-memory `SalesforceCartClient` test double with context lifecycle + expiry behavior.
- Add unit tests for lifecycle and mutation critical paths.
- Document setup/run/test, decisions/tradeoffs, and known gaps in `README.md`.
- Record exact prompts and follow-ups in `PROMPTS.md`.

## User Journeys

### Journey 1 — Normal Cart Lifecycle Flow

A client application starts a cart session by creating a cart context and receiving a context identifier with expiry metadata.
Using that context, it performs core cart operations in normal conditions: retrieve cart state, add line items, update quantities, and remove items.
Each response is deterministic and aligned to the API contract, so behavior is predictable for both implementation and validation.

Success state: the full core lifecycle operates correctly while the context is valid.

### Journey 2 — Expired Cart Context Flow

A client attempts to read or mutate cart state after the cart context has expired.
The API returns explicit, deterministic expiry behavior as defined by contract, rather than ambiguous or silent failure behavior.
The client can reliably detect expiration and recover by creating a new cart context before continuing operations.

Success state: expired-context handling is explicit, consistent, and contract-correct.

### Journey Requirements Summary

These two journeys require:

- explicit cart context lifecycle management (creation, validity window, expiration),
- deterministic API behavior for both valid and expired context states,
- complete contract definition for core cart retrieval and mutation operations,
- implementation and tests that prove lifecycle semantics match the documented API contracts.

## Domain-Specific Requirements

### Technical Constraints

- Maintain assignment constraints: TypeScript on Node 20+, minimal HTTP framework, in-memory state only, no real Salesforce integration.
- Keep implementation intentionally small and cohesive; avoid introducing production platform concerns not required by the assignment.
- Ensure deterministic API behavior that is directly traceable to documented contracts.

### Lifecycle Semantics

- Cart context lifecycle behavior must be explicit and stable: valid context operations vs expired-context behavior.
- Expiration semantics must be unambiguous in contracts and reflected exactly in implementation behavior.
- Recovery path after expiration must be explicit: create a new cart context before continuing operations.

### Integration Boundaries

- All Salesforce-like behavior is encapsulated behind an in-process `SalesforceCartClient` test double.
- No external persistence or third-party runtime dependencies are introduced for core cart behavior.
- Boundary between API layer and cart-context abstraction remains clear and spec-driven.

### Scope and Risk Control

- Scope is limited to required cart lifecycle and mutation flows; no roadmap expansion.
- Primary risk is ambiguity or drift between specs and implementation.
- Mitigation: keep SPEC-A, SPEC-B, code, and tests tightly aligned around the same lifecycle rules.
- Primary quality bar is critical-path correctness, not production platform breadth.

## PRD Workflow Closeout

The remaining PRD workflow steps are intentionally skipped. The planning value needed for this assignment is already captured: scope, success criteria, constrained journeys, lifecycle semantics, integration boundaries, and quality expectations.

Next artifacts should be generated directly from this PRD:

- `SPEC-A-architecture.md`
- `SPEC-B-api.md`
