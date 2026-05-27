# Architecture Mapping: Family Dashboard

## Overview
This project follows **Hexagonal (Ports & Adapters) Architecture** combined with **Domain-Driven Design (DDD)**. The goal is to isolate the core business logic (The Domain) from external technical details (Infrastructure/UI).

## The Hexagonal Layers

### 1. Domain Layer (`/src/domain`)
- **Responsibility:** Contains the "Ubiquitous Language" of the family dashboard.
- **Components:** Aggregates, Entities, Value Objects, Domain Services, and Repository Interfaces (Ports).
- **Constraint:** Zero dependencies on external frameworks or other layers.
- **Pattern:** "Parse, Don't Validate" using Zod.

### 2. Application Layer (`/src/application`)
- **Responsibility:** Implements business use cases.
- **Components:** Command/Query Handlers, Use Case implementations.
- **Constraint:** Depends only on the Domain layer.

### 3. Infrastructure Layer (`/src/infrastructure`)
- **Responsibility:** Technical implementations of Domain/Application ports.
- **Components:** Database adapters, Home Assistant bridges, external API clients.
- **Constraint:** Depends on the Domain (to implement interfaces).

### 4. Presentation Layer (`/src/presentation`)
- **Responsibility:** The entry point for the user or external triggers.
- **Components:** REST controllers, CLI commands, Dashboard UI components.
- **Constraint:** Depends on Application (to trigger use cases).

## Dependency Rule
Dependencies must always point **inwards** toward the Domain.
- `Presentation` -> `Application` -> `Domain`
- `Infrastructure` -> `Domain` (Interfaces) / `Application`

## Error Handling
Exceptions are forbidden for control flow. All cross-boundary communication must use the `Result<T, E>` pattern via `neverthrow`.
