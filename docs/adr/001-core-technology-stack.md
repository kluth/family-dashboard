# ADR-001: Core Technology Stack

## Status
Accepted

## Context
The Family Dashboard requires high availability, maintainability, and strict domain correctness. The project must be technology-agnostic but requires a concrete stack for implementation. Key requirements include:
- Making illegal states unrepresentable.
- Exception-free error handling.
- Rich ecosystem for home automation (Home Assistant).

## Decision
We will use **TypeScript (Node.js)** as the primary technology stack.

### Key Libraries:
- **Runtime Validation:** `zod` for implementing the "Parse, Don't Validate" pattern.
- **Error Handling:** `neverthrow` to enforce monadic `Result` patterns and ban exceptions for control flow.
- **Testing:** `jest` for unit testing, `fast-check` for property-based testing, and `Stryker` for mutation testing.
- **Observability:** `OpenTelemetry` SDKs for tracing and metrics.
- **Linter:** `ESLint` with `eslint-plugin-complexity` to cap McCabe scores at 10.

## Consequences
- **Pros:** Shared domain logic across potential TS frontends; massive community support for IoT; strong type system for DDD.
- **Cons:** Runtime type safety requires discipline (enforced via Zod); higher memory footprint than Rust/Go.
- **Rules:** 100% type coverage required; no `any` types; no `throw` keywords.
