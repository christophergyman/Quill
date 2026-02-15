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

bun run clean:test-processes  Kill orphaned Vitest/Electron processes
bun run lint           Lint
bun run lint:fix       Lint + autofix
bun run format         Format code
bun run format:check   Check formatting
bun run typecheck      Type check
bun run validate       Run all checks (lint + typecheck + tests)
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
- Pre-commit: cleanup orphaned processes + lint-staged + unit tests with --bail
- `pretest` hooks auto-kill orphaned Vitest/Electron processes before every test run
- Vitest uses `pool: 'forks'` with `maxForks: 2` to limit worker memory

## Troubleshooting & Gotchas

### better-sqlite3 native binary issues

- better-sqlite3 compiles a native `.node` binary that must match the runtime (Electron vs Node)
- `bun run test` (vitest) uses **Node**, `bun run dev` uses **Electron** — they need different binaries
- The `scripts/ensure-electron-native.mjs` script auto-restores the Electron binary before dev/build/package via pre-hooks
- If tests fail with `NODE_MODULE_VERSION mismatch`, run `bun install` to restore the Node binary, then `bun run test`
- The binary cache lives in `node_modules/.cache/e2e-rebuild/` — delete it to force a full rebuild

### Environment variables

- Copy `.env.example` to `.env` for local development
- `OPENAI_API_KEY` — required for cloud Whisper transcription and OpenAI LLM cleanup
- `OLLAMA_URL` — defaults to `http://localhost:11434`, only needed if using local LLM
- API keys in production are encrypted via Electron's `safeStorage` and stored via `electron-store`

### macOS permissions

- **Microphone access:** required for audio recording — macOS will prompt on first use
- **Screen Recording:** required for overlay window — must be granted in System Settings > Privacy
- If permissions are denied, the app won't crash but recording/overlay features will silently fail

### Orphaned test processes

- Interrupted test runs (Ctrl+C, terminal closed) can leave Vitest workers and Electron instances behind (~4GB RAM each)
- `bun run clean:test-processes` finds and kills orphans scoped to this project's path, plus cleans stale `quill-test-*` temp dirs
- This runs automatically before every `bun run test`, `test:unit`, and `test:e2e` via `pretest` hooks
- Also runs in the pre-commit hook before lint-staged

### Common pitfalls

- Zustand stores persist between tests if not reset in `beforeEach` — always call `store.setState(initialState)`
- The preload bridge (`window.api`) is mocked globally in `tests/setup.ts` — renderer tests get this automatically
- tldraw components require canvas support — `@napi-rs/canvas` is installed as a dev dependency for jsdom
- IPC channels are string constants in `src/shared/types/ipc.ts` — always use the `IpcChannel` enum, never raw strings
- Database migrations run automatically on app start — add new migrations in `src/main/storage/migrations.ts`

### Test factories

- Use `tests/helpers/factories.ts` for creating mock data (Session, Diagram, Settings, etc.)
- Factories accept `Partial<T>` overrides and generate unique IDs automatically

## Pre-Commit Workflow

1. Run `bun run validate` — runs lint, typecheck, and all tests
2. Run `bun run dev` and visually verify UI works via Playwright
3. Only then commit

## Key Files

| Area    | Files                                                                         |
| ------- | ----------------------------------------------------------------------------- |
| Entry   | `src/main/index.ts`, `src/renderer/main.tsx`, `src/renderer/App.tsx`          |
| IPC     | `src/shared/types/ipc.ts`, `src/main/ipc/handlers.ts`, `src/preload/index.ts` |
| Storage | `src/main/storage/database.ts`, `src/main/storage/sessions.ts`                |
| Types   | `src/shared/types/session.ts`, `src/shared/types/settings.ts`                 |
| Config  | `electron.vite.config.ts`, `vitest.config.ts`, `playwright.config.ts`         |
| Scripts | `scripts/ensure-electron-native.mjs`, `scripts/clean-test-processes.mjs`      |
