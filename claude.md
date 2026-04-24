# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`wd40` is a joke/proof-of-concept CLI written in Zig that recursively finds and deletes every Rust toolchain artifact it can reach (`~/.cargo`, `~/.rustup`, `target/` dirs, any dir containing `Cargo.toml`, and Rust binaries on `$PATH`) with **no confirmation**. Intended to be run inside the provided Docker sandbox — running it on a real machine will destroy data.

## Hard rule: never execute wd40 outside Docker

Do **not** run the `wd40` binary, `zig build run`, or any equivalent on the host — not in this repo, not in a worktree, not "just to see what happens". It will recursively delete `~/.cargo`, `~/.rustup`, every directory containing a `Cargo.toml`, every `target/` dir reachable from `/`, and Rust binaries on `$PATH`, with no confirmation and no dry-run flag. There is no safe-mode.

The only acceptable way to execute it is inside the provided container:

```bash
docker build -f dockerfile -t wd40:latest .
docker run -it --rm wd40:latest
```

`zig build` (compile only) on the host is fine. Anything that *runs* the produced binary must happen in the container. If a task seems to require executing it on the host, stop and ask the user first.

## Build / run

Requires Zig **0.13** (pinned in CI via `mlugg/setup-zig@v1`). The Dockerfile is lowercase (`dockerfile`) so `docker build` needs `-f dockerfile` on case-sensitive hosts.

```bash
zig build -Doptimize=ReleaseFast                 # produces ./zig-out/bin/wd40
docker build -f dockerfile -t wd40:latest .      # safe sandbox: installs Rust, then wd40s it
docker run -it --rm wd40:latest                  # run inside container
```

There are no tests and no lint config. CI (`.github/workflows/ci.yml`) just builds the binary and runs the Docker image, grepping stdout for `MISSION ACCOMPLISHED`.

## Architecture (all in `src/main.zig`, ~390 LOC)

Single-file program with three coordinated pieces:

1. **Terminal hijack** (`setupTerminal` / ANSI escapes). On startup it clears the screen, hides the cursor, and sets a DECSTBM scroll region so the top ~1/3 of the terminal is a static header (banner + live stats line) while the bottom ~2/3 scrolls deletion log lines. All writes go through `termWrite` / `termPrint` guarded by `g_term_mutex` because 4 worker threads print concurrently. `\x1B7`/`\x1B8` (save/restore cursor) is how header updates avoid disturbing the scroll region. If you add output, route it through these helpers or you'll corrupt the display.

2. **Producer**: `scanDirectory` (recursive walk from `/`, skipping `SKIP_PATHS`, `node_modules`, `.git`) + `findRustBinaries` (iterates `$PATH`) + hardcoded `~/.cargo` and `~/.rustup` pushes in `main`. Producers enqueue absolute paths into a single shared `Queue`.

3. **Consumers**: 4 worker threads (`workerThread`) pop paths, call `deletePath` (tries file delete, falls back to `deleteTree`, then to opening parent dir and deleting via basename), update `Stats`, and occasionally print an `INSULTS` line. `queue.setDone()` after the scan finishes causes `pop()` to return `null` and workers to exit.

Key invariants when editing:
- Paths pushed onto the queue are allocated with the GPA and are currently **leaked** (never freed by the worker). If you add ownership tracking, every `queue.push` site and the `scanDirectory`/`findRustBinaries` loops need to agree.
- `Queue.pop` blocks on a condvar until either an item is available or `done` is set — don't push after `setDone()`.
- `SKIP_PATHS` is the only safety net protecting `/proc`, `/sys`, `/dev`, `/run`. Anything destructive you add should also consult `shouldSkipPath`.
- The ASCII banner in `ASCII_ART` uses `\\` in Zig multiline string literals — those are literal backslashes, not escapes.
