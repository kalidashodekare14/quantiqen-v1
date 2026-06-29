# AGENTS.md

# Project Information

- **Project Name:** QUANTIQEN V1
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **State Management:** TanStack React Query
- **HTTP Client:** Axios
- **Charts:** Recharts
- **Icons:** Lucide React
- **Animation:** Framer Motion
- **Package Manager:** npm

---

# Project Goal

Build a scalable, maintainable, reusable, and responsive Enterprise Dashboard using modern frontend architecture and clean code principles.

---

# Architecture Rules

- Always use Next.js App Router.
- Follow Feature-Based Architecture.
- Keep `app/` only for routing.
- Keep business logic inside `features/`.
- Shared UI belongs inside `components/`.
- Keep UI and business logic separated.
- Never modify the existing architecture unless explicitly requested.
- Prefer reusable solutions over duplicate implementations.

---

# Folder Structure

```text
src/
├── app/
├── assets/
├── components/
├── constants/
├── features/
├── hooks/
├── lib/
├── mock/
├── providers/
├── services/
├── store/
├── styles/
├── types/
└── utils/
```

---

# Folder Decision Rules

Before creating any new file or component:

1. Determine whether it is **Shared** or **Feature-specific**.
2. If it will be reused by two or more features, place it inside `components/`.
3. Otherwise, place it inside the appropriate `features/` directory.
4. Never duplicate an existing component.

---

# Component Rules

- Follow the Single Responsibility Principle.
- Keep components small and focused.
- Prefer composition over inheritance.
- Shared components belong inside `components/`.
- Feature-specific components belong inside `features/`.
- Before creating a new component, always check whether a reusable component already exists.
- Do not create unnecessary wrapper components.
- Keep components predictable and easy to reuse.

---

# TypeScript Rules

- Never use `any`.
- Always define interfaces or types.
- Prefer explicit typing.
- Reuse existing types whenever possible.
- Export reusable types from dedicated files.
- Avoid duplicate type definitions.

---

# Data Fetching Rules

- Use TanStack React Query for server state.
- Never fetch data directly inside UI components.
- Use the Service Layer for API communication.
- Keep query hooks inside the related feature whenever appropriate.
- Reuse existing query hooks before creating new ones.

---

# Styling Rules

- Use Tailwind CSS.
- Use shadcn/ui components whenever possible.
- Avoid custom CSS unless necessary.
- Never hardcode colors.
- Always use theme variables.
- Support both Light and Dark themes.
- Build responsive layouts by default.
- Maintain consistent spacing and sizing.

---

# UI Guidelines

- Follow the UI requirements provided in the prompt.
- Preserve the existing design language.
- Maintain visual consistency across all pages.
- Prefer reusable cards, charts, tables and widgets.
- Do not invent new layouts when extending an existing feature.
- If design information is missing, ask for clarification instead of making assumptions.

---

# Code Style

- Write clean and readable code.
- Use meaningful names.
- Prefer early returns.
- Avoid deeply nested logic.
- Remove unused imports and dead code.
- Keep functions focused.
- Keep components easy to understand.

---

# Import Order

1. React / Next.js
2. Third-party libraries
3. Internal modules
4. Components
5. Hooks
6. Services
7. Types
8. Utilities
9. Styles

---

# Naming Convention

- Components → PascalCase
- Hooks → useSomething
- Functions → camelCase
- Constants → UPPER_SNAKE_CASE
- Types → PascalCase
- Interfaces → PascalCase
- Files → kebab-case
- Routes → lowercase

---

# Development Workflow

Before implementing any feature:

1. Understand the requirement.
2. Analyze the existing architecture.
3. Check for reusable components.
4. Decide whether the implementation belongs to Shared or Feature.
5. Explain the approach if the task is complex.
6. Implement the solution.
7. Keep the implementation consistent with the existing project.

---

# Existing Code Rules

- Respect the current codebase.
- Never rewrite working code unless requested.
- Avoid unnecessary refactoring.
- Extend existing components instead of replacing them.
- Modify only the files relevant to the requested task.

---

# Code Generation Rules

Whenever generating code:

- Keep it production-ready.
- Keep it scalable.
- Keep it maintainable.
- Follow Feature-Based Architecture.
- Follow the existing project conventions.
- Prefer reusable solutions.
- Avoid unnecessary complexity.
- Avoid duplicate code.
- Reuse existing components whenever possible.
- Generate TypeScript-first code.
- Do not introduce new dependencies unless explicitly requested.
- Do not change the project architecture.
- Keep code compatible with the existing project.

---

# AI Behavior

- Never make architectural decisions on your own.
- Never rename existing folders or files unless requested.
- Never move files unless requested.
- Never modify unrelated files.
- Preserve the existing project structure.
- Follow the project's ESLint and Prettier configuration.
- If multiple implementation approaches exist, choose the one that best matches the existing architecture.
- If requirements are ambiguous, do not guess. Ask for clarification.

---

# AI Checklist

Before finishing any implementation, verify:

- Is there an existing reusable component?
- Is this Shared or Feature-specific?
- Does it follow the current architecture?
- Is the code responsive?
- Does it support Light and Dark themes?
- Are theme variables used instead of hardcoded colors?
- Is TypeScript properly typed?
- Is the code clean and maintainable?
- Is unnecessary complexity avoided?
- Is the implementation production-ready?
