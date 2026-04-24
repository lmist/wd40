# wd40

<p align="center">
  <img src="assets/banner.png" alt="ziggy the annihilator - wd40 banner" />
</p>

<p align="center">
  <strong>zero Rust. maximum clean.</strong>
</p>

<p align="center">
  <a href="https://github.com/lmist/wd40/actions"><img src="https://img.shields.io/github/actions/workflow/status/lmist/wd40/ci.yml?style=for-the-badge&logo=github&label=ci" alt="ci" /></a>
  <a href="https://github.com/lmist/wd40/releases"><img src="https://img.shields.io/github/v/release/lmist/wd40?style=for-the-badge&logo=github&label=release" alt="release" /></a>
  <a href="https://ziglang.org"><img src="https://img.shields.io/badge/built%20with-Zig-F7A41D?style=for-the-badge&logo=zig&logoColor=white" alt="built with Zig" /></a>
  <img src="https://img.shields.io/badge/target-Rust-red?style=for-the-badge&logo=rust" alt="target: Rust" />
  <img src="https://img.shields.io/badge/license-wtfpl-blue?style=for-the-badge" alt="license" />
</p>

---

## what the hell is this?

`wd40` is an **unhinged, zero-confirmation Rust annihilator** written in Zig. when it starts, it seizes your terminal, prints a sick ascii banner, and recursively hunts down every trace of Rust on your machine — then **obliterates it without asking**.

no prompts. no `--force` flags. no survivors.

> *"i don't fix Rust. i delete it."* — ziggy the annihilator

## features

- **terminal hijack**: clears the screen, hides the cursor, and splits the display into a static header (1/3) and a live scrolling log (2/3)
- **aggressive scanning**: recursively searches for `Cargo.toml`, `target/`, `.cargo`, `.rustup`, and known Rust binaries
- **4 worker threads**: parallel deletion queue for maximum carnage
- **zero confirmation**: starts killing immediately. no questions asked.
- **random insults**: injects sporadic verbal abuse toward rustaceans into the log stream
- **docker proof of concept**: includes a dockerfile that pre-installs Rust garbage, then `wd40`s it

## quick start

### docker (recommended — safe playground)

```bash
# build the image (infests it with Rust, then arms wd40)
docker build -f dockerfile -t wd40:latest .

# run the chaos in an interactive terminal
docker run -it --rm wd40:latest
```

### build from source

```bash
# requires Zig 0.13+
zig build -Doptimize=ReleaseFast

# run at your own risk
./zig-out/bin/wd40
```

## what it destroys

| target | description |
|--------|-------------|
| `~/.cargo` | cargo registry, caches, installed binaries |
| `~/.rustup` | rustup toolchains and metadata |
| `target/` | build artifacts in any Rust project |
| `Cargo.toml` dirs | entire project directories (source + build) |
| `rustc`, `cargo`, `rustup`, etc. | Rust binaries found in `$PATH` |
| `rustfmt`, `clippy-driver`, `rust-analyzer` | all the little friends too |

## demo

captured from `docker run --rm wd40:latest` — 22 deletions, 2 expected `FileNotFound` misses on `~/.cargo` / `~/.rustup` in the sandbox's `$HOME`.

```
__      __      _      _  _      ___          _
\ \    / /   __| |    | || |    / _ \        [_]
 \ \/\/ /   / _  |    | || |_  | | | |     .-----.
  \_/\_/   | (_| |    |__   _| | |_| |     | W D |
           \__,_|       |_|     \___/      | -4- |
                                           | 0   |
                                           |_____|

f u c k i n g   u p   a l l   t h e   r u s t   o n   t h e   m a c h i n e

VAPORIZED: 22 total (0 dirs, 0 files) | ERRORS: 2

[DELETED] /opt/fake-bin/rustc
[DELETED] /opt/fake-bin/cargo
[wd40] no std? no problem. no rust.
[DELETED] /usr/local/cargo/bin/rustfmt
[wd40] fuck your memory safety
[DELETED] /usr/local/cargo/bin/rustdoc
[DELETED] /usr/local/cargo/bin/rustc
[DELETED] /usr/local/cargo/bin/rls
[DELETED] /usr/local/cargo/bin/rust-lldb
[DELETED] /usr/local/cargo/bin/cargo
[DELETED] /usr/local/cargo/bin/rustup
[wd40] your unsafe code is now safe... in /dev/null
[DELETED] /usr/local/cargo/bin/cargo-clippy
[wd40] rustc? rust-see-ya-later
[DELETED] /usr/local/cargo/bin/clippy-driver
[DELETED] /usr/local/cargo/bin/cargo-fmt
[DELETED] /usr/local/cargo/bin/rust-analyzer
[DELETED] /usr/local/cargo/bin/rust-gdb
[DELETED] /opt/demo/scattered/target
[DELETED] /opt/demo/scattered
[wd40] unsafe? unexistent.
[DELETED] /opt/demo/fd/target
[DELETED] /opt/demo/fd
[wd40] memory safety cant save you now
[DELETED] /opt/demo/ripgrep
[DELETED] /opt/demo/ripgrep/target
[wd40] ferris wheel of destruction
[DELETED] /opt/demo/bat
[DELETED] /opt/demo/bat/target

[wd40] MISSION ACCOMPLISHED. ALL RUST HAS BEEN OBLITERATED.
Total items destroyed: 22
```

## warning

this tool is **destructive by design**. it deletes files and directories permanently without confirmation. it is intended as a joke, a proof of concept, and a docker-contained demonstration. **do not run this on a machine where you care about your Rust projects.**

## license

wtfpl — do whatever the fuck you want.

---

<p align="center">
  <em>Rust has no chance.</em>
</p>
