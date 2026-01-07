# Architecture Decision Records (ADRs)

This directory contains Architecture Decision Records for the Rodrigues AI Frontend project.

## What is an ADR?

An ADR is a document that captures an important architectural decision made along with its context and consequences.

## ADR Index

| ID | Title | Status | Date |
|----|-------|--------|------|
| [0001](0001-bff-pattern.md) | Backend-for-Frontend (BFF) Pattern | Accepted | 2024-12-30 |
| [0002](0002-zustand-state-management.md) | Zustand for State Management | Accepted | 2024-12-30 |
| [0003](0003-react-query-data-fetching.md) | React Query for Data Fetching | Accepted | 2024-12-30 |
| [0004](0004-jwt-token-refresh.md) | JWT Token Refresh Strategy | Accepted | 2024-12-30 |
| [0005](0005-nextjs-app-router.md) | Next.js App Router Architecture | Accepted | 2024-12-30 |
| [0006](0006-tailwind-shadcn-design.md) | Tailwind CSS + Shadcn/ui Design System | Accepted | 2024-12-30 |
| [0007](0007-typescript-strict-mode.md) | TypeScript Strict Mode | Accepted | 2024-12-30 |
| [0008](0008-sentry-posthog-observability.md) | Sentry + PostHog Observability Stack | Accepted | 2024-12-30 |

## Template

When creating a new ADR, use this template:

```markdown
# ADR-XXXX: [Title]

## Status
[Proposed | Accepted | Deprecated | Superseded]

## Date
YYYY-MM-DD

## Context
[Describe the issue and why a decision is needed]

## Decision
[Describe the decision and rationale]

## Consequences
### Positive
- [List positive outcomes]

### Negative
- [List negative outcomes or trade-offs]

## References
- [Links to related resources]
```
