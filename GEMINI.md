# AI Audit Ledger: Family Dashboard

This file is the immutable, machine-readable chronologue of all AI actions for the Family Dashboard project. It tracks architectural decisions, executed commands, and verification proofs.

## [2026-05-27] Project Initialization

### 1. Workspace Scaffolding
- **Action:** Bootstrapped repository structure.
- **Commands:**
  - `mkdir -p /home/matthias/projects/family-dashboard/src/{domain,application,infrastructure,presentation}`
  - `mkdir -p /home/matthias/projects/family-dashboard/docs/adr`
  - `git init`
- **Architectural Intent:** Implement Hexagonal / Clean Architecture from commit zero. Directories represent bounded contexts and layers, not frameworks.

### 2. Strategic Foundation
- **Architecture:** Hexagonal / Clean Architecture.
- **Core Decision:** TypeScript/Node.js selected as the primary stack (ADR-001).
- **Verification Mandate:** TDD, McCabe < 10, Result Pattern error handling.

### 4. Phase 2: Calendar Bounded Context - TimeSpan & CalendarEvent
- **Issue:** Resolved #1.
- **Branch:** `feature/1-calendar-timespan`.
- **Status:** Verified via TDD and Mutation Testing.
- **Implementation:** 
  - `src/domain/calendar/TimeSpan.ts` (89.5% mutation score).
  - `src/domain/calendar/CalendarEvent.ts` (90.5% mutation score).
- **Architectural Proof:** Aggregate Root pattern established with strongly typed IDs and "Parse, Don't Validate" title VO.
