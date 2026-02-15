# CLAUDE.md — Quill

## Project Overview

Quill is a native macOS Electron app for voice dictation with a whiteboard overlay. It records audio, transcribes via Whisper (cloud or local), optionally cleans up text with an LLM, and persists sessions with diagrams.

**Tech stack:** Electron 33, React 19, TypeScript 5.7, Vite 6, Tailwind 4, Zustand 5, tldraw 4.3, better-sqlite3, Pino logging

## Architecture

```
src/main/          Electron main process (windows, IPC, audio, voice, LLM, storage)
src/renderer/      React frontend (components, hooks, stores, lib)
src/preload/       Context bridge exposing window.api
src/shared/        Shared types, constants, logger
tests/             Unit (vitest), E2E (playwright), integration
```

- **Routing:** hash-based — `#/overlay`, `#/settings`, `#/library`
- **State:** Zustand stores — `recording.ts`, `overlay.ts`, `sessions.ts`
- **IPC:** typed channels in `src/shared/types/ipc.ts`, handlers in `src/main/ipc/handlers.ts`
- **Storage:** SQLite with WAL mode, FTS5 search, migrations in `src/main/storage/`
- **Settings:** electron-store with encrypted API keys via safeStorage

## Development Philosophy

You are a senior software engineer pushing WORKING code to production for HUMANS.

- Before every commit, run `bun run dev` and use Playwright to verify the UI works for a human user
- Maintain high uptime — minimal bugs pushed to main
- Code must be modular, well-organised, and well-tested
- Aim for high code coverage
- Deep testing + logging enables self-iteration: if you encounter a bug while building a feature, proactively fix it
- Never commit broken code

## Commands

```
bun run dev            Start dev server
bun run build          Production build
bun run package        Build macOS DMG

bun run test           Run all unit tests
bun run test:unit      Unit tests only
bun run test:watch     Watch mode
bun run test:e2e       Playwright E2E tests

bun run lint           Lint
bun run lint:fix       Lint + autofix
bun run format         Format code
bun run format:check   Check formatting
bun run typecheck      Type check
```

## Code Conventions

- No semicolons, single quotes, trailing comma: none, 100 char line width
- PascalCase components, camelCase files, `use*` hooks, `*Store` stores
- Path aliases: `@` -> `src/renderer`, `@shared` -> `src/shared`
- Factory pattern for voice backends (`src/main/voice/factory.ts`) and LLM processors (`src/main/llm/factory.ts`)
- Feature-based component organization: `overlay/`, `settings/`, `library/`
- Shared UI components in `src/renderer/components/ui/`

## Testing

- 36 test files, 207+ tests
- Vitest with jsdom for unit/component tests
- Playwright for E2E (framework ready, tests to be expanded)
- Mock `window.api` via `tests/setup.ts` for renderer tests
- Coverage via v8 with text + HTML reporters
- Pre-commit: lint-staged + unit tests with --bail

## Pre-Commit Workflow

1. Run `bun run test` — verify no regressions
2. Run `bun run lint` — check for issues
3. Run `bun run dev` and visually verify UI works via Playwright
4. Only then commit

## Key Files

| Area    | Files                                                                         |
| ------- | ----------------------------------------------------------------------------- |
| Entry   | `src/main/index.ts`, `src/renderer/main.tsx`, `src/renderer/App.tsx`          |
| IPC     | `src/shared/types/ipc.ts`, `src/main/ipc/handlers.ts`, `src/preload/index.ts` |
| Storage | `src/main/storage/database.ts`, `src/main/storage/sessions.ts`                |
| Types   | `src/shared/types/session.ts`, `src/shared/types/settings.ts`                 |
| Config  | `electron.vite.config.ts`, `vitest.config.ts`, `playwright.config.ts`         |
