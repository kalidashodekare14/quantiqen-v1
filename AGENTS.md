# AGENTS.md

## Project Information

Project Name: QUANTIQEN V1

Framework: Next.js (App Router)

Language: TypeScript

Styling: Tailwind CSS + shadcn/ui

State Management: TanStack React Query

HTTP Client: Axios

Charts: Recharts

Icons: Lucide React

Animation: Framer Motion

Package Manager: npm

---

## Project Goal

Build a scalable, reusable, responsive enterprise dashboard following modern frontend architecture and clean code principles.

---

## Architecture Rules

- Always use Next.js App Router.
- Use the src directory.
- Follow feature-based architecture.
- Keep business logic separate from UI.
- Prefer reusable components over duplication.
- Use the Service Layer for all data access.
- Never access mock data or APIs directly from components.

---

## Folder Structure

src/

- app/
- assets/
- components/
- constants/
- features/
- hooks/
- lib/
- mock-data/
- providers/
- services/
- styles/
- types/
- utils/

---

## Component Rules

- Keep components small.
- Single Responsibility Principle.
- Reusable first.
- No duplicated UI.
- Prefer composition over large components.
- Shared UI goes into components/.
- Feature-specific UI stays inside features/.

---

## TypeScript Rules

- Never use any.
- Always define proper interfaces or types.
- Prefer explicit typing.
- Reuse existing types whenever possible.

---

## React Query Rules

- Use React Query for server state.
- Keep UI state local.
- Never fetch data directly inside UI components.
- Use the Service Layer.

---

## Styling Rules

- Use Tailwind CSS.
- Use shadcn/ui components whenever possible.
- Avoid custom CSS unless necessary.
- Build responsive layouts by default.

---

## Code Style

- Use meaningful variable names.
- Write readable code.
- Avoid nested logic.
- Remove dead code.
- Keep functions focused.

---

## Import Order

1. Next.js / React

2. Third-party libraries

3. Internal modules

4. Components

5. Hooks

6. Services

7. Types

8. Utilities

9. Styles

---

## Naming Convention

Components → PascalCase

Hooks → useSomething

Functions → camelCase

Constants → UPPER_SNAKE_CASE

Types → PascalCase

Interfaces → PascalCase

---

## Development Process

Always think before writing code.

Do not jump directly into implementation.

If a feature is complex:

1. Explain the approach.
2. Explain the architecture.
3. Then write the implementation.

---

## Code Generation Rules

Whenever generating code:

- Keep it production-ready.
- Keep it scalable.
- Avoid unnecessary complexity.
- Prefer reusable solutions.
- Follow clean architecture.
- Match the existing project structure.