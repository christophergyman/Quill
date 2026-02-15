# Quill

Voice Dictation + Whiteboard Overlay for macOS

![macOS](https://img.shields.io/badge/macOS-000000?logo=apple&logoColor=white)
![Electron](https://img.shields.io/badge/Electron_33-47848F?logo=electron&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript_5.7-3178C6?logo=typescript&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

Quill is a native macOS app that combines voice dictation with a transparent whiteboard overlay. Record audio, transcribe it via Whisper (cloud or local), optionally clean up text with an LLM, and persist sessions with diagrams.

## Features

- **Voice dictation** — hold a shortcut to record, release to transcribe
- **Whiteboard overlay** — draw, annotate, and diagram on a transparent overlay powered by tldraw
- **Transcription backends** — OpenAI Whisper API (cloud) or local Whisper models
- **LLM text cleanup** — optionally post-process transcriptions with OpenAI or Ollama
- **Session library** — browse, search, and revisit past sessions with full-text search (FTS5)
- **SQLite storage** — sessions, transcripts, and diagrams persisted locally with WAL mode
- **Global shortcuts** — configurable keyboard shortcuts for overlay, drawing, and recording
- **Menu bar app** — lives in your system tray, out of the way until you need it

## Screenshots

<!-- TODO: Add screenshots of the overlay, recording, and library views -->

## Getting Started

### Prerequisites

- **macOS** (Apple Silicon or Intel)
- **Node.js** 18+
- **[Bun](https://bun.sh)** (package manager and script runner)

### Install

```bash
git clone https://github.com/your-username/quill.git
cd quill
bun install
```

### Configuration

For cloud transcription, you'll need an OpenAI API key. You can configure this in the app's Settings view after launching, or set it in advance:

1. Launch the app with `bun run dev`
2. Open Settings (`#/settings`)
3. Enter your OpenAI API key under Voice settings

For local transcription, select the `whisper-local` backend in Settings and choose a model.

For LLM text cleanup, enable it in Settings and configure either OpenAI or Ollama as the backend.

### Run

```bash
bun run dev
```

## Usage

### Default Shortcuts

| Action         | Shortcut              |
| -------------- | --------------------- |
| Toggle overlay | `Cmd + Shift + Space` |
| Toggle drawing | `Cmd + Shift + D`     |
| Hold to record | `Cmd + Shift + ;`     |

### Workflow

1. **Toggle the overlay** to bring up the transparent whiteboard
2. **Hold to record** — speak your thoughts while the overlay is active
3. **Draw and annotate** — switch to drawing mode to sketch diagrams
4. **Release to transcribe** — your audio is sent to Whisper and the transcript appears
5. **Browse sessions** — open the Library to search and revisit past sessions

## Architecture

```
src/
  main/             Electron main process
    audio/           Audio recording and processing
    ipc/             IPC channel handlers
    llm/             LLM text cleanup (OpenAI, Ollama)
    storage/         SQLite database, migrations, sessions
    voice/           Whisper transcription backends
    windows/         Window management
  renderer/          React frontend
    components/      UI components (overlay/, settings/, library/, ui/)
    hooks/           Custom React hooks
    stores/          Zustand state stores
    lib/             Utility functions
  preload/           Context bridge (window.api)
  shared/            Shared types, constants, logger
tests/               Unit (Vitest), E2E (Playwright)
```

- **Routing** — hash-based: `#/overlay`, `#/settings`, `#/library`
- **State** — Zustand stores: `recording.ts`, `overlay.ts`, `sessions.ts`
- **IPC** — typed channels in `src/shared/types/ipc.ts`, handlers in `src/main/ipc/handlers.ts`
- **Storage** — SQLite with WAL mode, FTS5 full-text search, schema migrations
- **Settings** — electron-store with encrypted API keys via Electron safeStorage

## Tech Stack

| Technology     | Version | Purpose                           |
| -------------- | ------- | --------------------------------- |
| Electron       | 33      | Native macOS app shell            |
| React          | 19      | UI framework                      |
| TypeScript     | 5.7     | Type safety                       |
| Vite           | 6       | Build tooling (via electron-vite) |
| Tailwind CSS   | 4       | Styling                           |
| Zustand        | 5       | State management                  |
| tldraw         | 4.3     | Whiteboard / drawing engine       |
| better-sqlite3 | 11      | Local SQLite database             |
| Pino           | 9       | Structured logging                |

## Development

```bash
bun run dev            # Start dev server with hot reload
bun run build          # Production build
bun run package        # Build macOS DMG

bun run test           # Run all unit tests
bun run test:unit      # Unit tests only
bun run test:watch     # Watch mode
bun run test:e2e       # Playwright E2E tests

bun run lint           # Lint
bun run lint:fix       # Lint + autofix
bun run format         # Format code
bun run format:check   # Check formatting
bun run typecheck      # Type check
```

## Testing

- **Unit & component tests** — Vitest with jsdom, 36 test files, 207+ tests
- **E2E tests** — Playwright for Electron
- **Coverage** — v8 provider with text and HTML reporters
- **Pre-commit** — lint-staged runs linting and unit tests with `--bail`

```bash
bun run test           # Run all unit tests
bun run test:e2e       # Run E2E tests
```

## License

[MIT](LICENSE)
