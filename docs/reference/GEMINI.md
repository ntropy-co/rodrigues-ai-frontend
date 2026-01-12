# Verity Agro - Frontend Context for Gemini

This file provides context for the Gemini AI agent to understand the Verity Agro Frontend project.

## 1. Project Overview

**Verity Agro Frontend** is a modern web application built with **Next.js 15** that serves as the interface for an AI-powered agricultural credit specialist. It features an AI chat interface (Gemini-based) and structured workflows for CPR (Cédula de Produto Rural) analysis and creation.

### Key Features
*   **AI Chat:** "Gemini-style" interface with streaming responses and document upload.
*   **CPR Workflows:** Structured flows for analyzing and creating CPRs, utilizing LangGraph on the backend.
*   **Authentication:** JWT-based auth with HttpOnly cookies and automatic token refresh.
*   **Observability:** Integrated with Sentry (errors) and PostHog (analytics).

## 2. Technology Stack

*   **Framework:** Next.js 15 (App Router)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS, shadcn/ui, Framer Motion
*   **State Management:** Zustand
*   **Forms:** React Hook Form + Zod
*   **Testing:** Vitest (Unit), Playwright (E2E)
*   **Package Manager:** pnpm (inferred from `package.json`, though `npm` scripts exist)

## 3. Architecture

The project follows a **BFF (Backend for Frontend)** pattern:

*   **Frontend (Next.js):** Handles UI, client state (Zustand), and proxies requests to the backend via API Routes.
*   **BFF Layer (`src/app/api/`):** Next.js API routes act as a secure proxy. They attach authentication headers (from HttpOnly cookies) before forwarding requests to the FastAPI backend.
*   **Backend (FastAPI):** Handles business logic, AI orchestration (LangGraph/Gemini), and database interactions.

**Data Flow:**
`UI Component` -> `Custom Hook` -> `Next.js API Route (BFF)` -> `FastAPI Backend`

## 4. Key Commands

| Command | Description |
| :--- | :--- |
| `pnpm dev` | Start the development server (http://localhost:3000) |
| `pnpm build` | Build the application for production |
| `pnpm start` | Start the production server |
| `pnpm lint` | Run ESLint |
| `pnpm format` | Check formatting with Prettier |
| `pnpm typecheck` | Run TypeScript type checking |
| `pnpm test` | Run unit tests with Vitest |
| `pnpm test:e2e` | Run E2E tests with Playwright |

## 5. Current Focus & Critical Context

**⚠️ ONGOING REFACTOR: Authentication & Token Handling**

There is an active effort to migrate from exposing JWT tokens in client-side JS to using **HttpOnly cookies**.

*   **Problem:** Many hooks currently try to access `token` from `useAuth()`, but it returns `null` because the token is now in a secure cookie.
*   **Solution:**
    1.  Replace `const { token } = useAuth()` with `const { isAuthenticated } = useAuth()`.
    2.  Replace direct `fetch()` calls with `fetchWithRefresh()` (from `@/lib/auth/token-refresh`).
    3.  **DO NOT** manually add `Authorization: Bearer ...` headers in client-side code; the BFF layer handles this.

**Status (as of Jan 2026):**
*   Refactor is ~42% complete.
*   **Pending Fixes:** `useRiskCalculator.ts`, `useContracts.ts`, `useAudit.ts`, and features hooks in `src/features/`.
*   **Reference:** See `PLANO_CORRECOES.md` for the detailed checklist.

## 6. Directory Structure

*   `src/app/` - Next.js App Router pages and API routes (BFF).
*   `src/components/ui/` - Reusable UI components (shadcn/ui).
*   `src/components/v2/` - Feature-specific components.
*   `src/hooks/` - Custom React hooks (business logic).
*   `src/features/` - Feature-based modules (hooks, components, utils).
*   `src/lib/` - Utilities (auth, API helpers).
*   `src/store.ts` - Zustand global store configuration.
*   `docs/` - Comprehensive project documentation.

## 7. Documentation Map

*   `docs/architecture/OVERVIEW.md` - High-level architectural diagrams.
*   `docs/onboarding/STACK.md` - Detailed tech stack and versions.
*   `PLANO_CORRECOES.md` - **CRITICAL:** Status of the auth refactor.
*   `README.md` - General quick start and overview.
