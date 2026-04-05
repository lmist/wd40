# wd40 — Markdown Mindmap Desktop App
# Usage: just <recipe>

# Default: list available recipes
default:
    @just --list

# Install dependencies
install:
    pnpm install

# Start dev server (frontend only)
dev:
    pnpm vite

# Start Tauri app (frontend + native shell)
app:
    pnpm tauri dev

# Build for production
build:
    pnpm tauri build

# Build frontend only
build-web:
    tsc && pnpm vite build

# Run tests
test:
    pnpm vitest run

# Run tests in watch mode
watch:
    pnpm vitest

# Type-check without emitting
check:
    tsc --noEmit

# Preview production build
preview:
    pnpm vite preview

# Clean build artifacts
clean:
    rm -rf dist src-tauri/target
