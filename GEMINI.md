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

### 4. Phase 2: Calendar Bounded Context - Domain Core
- **Issue:** Resolved #1.
- **Branch:** `feature/1-calendar-timespan`.
- **Status:** Verified via TDD and Mutation Testing.
- **Implementation:** 
  - `src/domain/calendar/TimeSpan.ts` (93.1% mutation score).
  - `src/domain/calendar/CalendarEvent.ts` (90.5% mutation score).
  - `src/domain/calendar/ConflictDetector.ts` (93.1% mutation score).

### 5. Phase 3: Multi-Context Domain Expansion & Application Layer
- **Provisioning Context:** Implemented `Ingredient` and `Recipe` with strict Vegan business invariant enforced at the type level.
- **Chores Context:** Implemented `Chore` and `Assignment` entities.
- **Application Layer:**
  - `ScheduleEventUseCase`: Orchestrates conflict detection and persistence.
  - `CreateRecipeUseCase`: Enforces domain invariants across aggregate boundaries.
- **Infrastructure:** established `CalendarRepository` and `RecipeRepository` ports with In-Memory adapters.
- **Verification:** 
  - 50+ tests passing (Unit + Property-Based).
  - Project-wide mutation score established at ~84%.
- **Integration:** Created `smoke-test.ts` proving full end-to-end integration of multiple bounded contexts.
