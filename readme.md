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

captured from `docker run --rm wd40:latest`. the sandbox is pre-seeded with a real `rust:bookworm` toolchain, `ripgrep` / `fd` / `bat` / `tokei` / `sd` / `hyperfine` / `zoxide` installed via `cargo binstall`, `rustfmt` / `clippy` / `rust-analyzer` via rustup, plus a buildable `cargo new` project at `/opt/scratch/scattered` with a live `target/` dir.

```
                                              _
__      __      _   _  _     ___            |=|
\ \    / / __| |  | || |    / _ \         .-----.
 \ \/\/ / / _  | | || |_   | | | |        | WD  |
  \_/\_/ | (_| | |__   _|  | |_| |        |-----|
          \__,_|    |_|     \___/         |  40 |
                                          |_____|

f u c k i n g   u p   a l l   t h e   r u s t   o n   t h e   m a c h i n e

VAPORIZED: 5 total (4 dirs, 1 files) | ERRORS: 11

[DELETED] /root/.cargo/bin/rustfmt
[wd40] fuck your memory safety
[FAIL]    /root/.cargo/bin/rustc         (FileNotFound)
[FAIL]    /root/.cargo/bin/rustdoc       (FileNotFound)
[FAIL]    /root/.cargo/bin/rls           (FileNotFound)
[FAIL]    /root/.cargo/bin/cargo         (FileNotFound)
[FAIL]    /root/.cargo/bin/cargo-clippy  (FileNotFound)
[FAIL]    /root/.cargo/bin/rustup        (FileNotFound)
[FAIL]    /root/.cargo/bin/clippy-driver (FileNotFound)
[FAIL]    /root/.cargo/bin/rust-gdb      (FileNotFound)
[FAIL]    /root/.cargo/bin/cargo-fmt     (FileNotFound)
[FAIL]    /root/.cargo/bin/rust-analyzer (FileNotFound)
[FAIL]    /root/.cargo/bin/rust-lldb     (FileNotFound)
[DELETED] /root/.cargo
[DELETED] /root/.rustup
[DELETED] /opt/scratch/scattered/target
[DELETED] /opt/scratch/scattered
[wd40] ferris wheel of destruction

[wd40] MISSION ACCOMPLISHED. ALL RUST HAS BEEN OBLITERATED.
Total items destroyed: 5
```

the 11 `FileNotFound`s are a race, not a bug: four worker threads pull from a shared queue, and whichever worker grabs `/root/.cargo` first tree-deletes the whole thing — the other workers then pull the individual `.cargo/bin/*` shims that were enqueued by the `$PATH` scan and find them already gone. `total` counts what actually got vaporized (1 file + 4 directories = 5); the cargo-installed binaries and rustup toolchain all die inside the `/root/.cargo` and `/root/.rustup` tree-deletes, so they don't each get their own `[DELETED]` line.

## warning

this tool is **destructive by design**. it deletes files and directories permanently without confirmation. it is intended as a joke, a proof of concept, and a docker-contained demonstration. **do not run this on a machine where you care about your Rust projects.**

## license

wtfpl — do whatever the fuck you want.

---

<p align="center">
  <em>Rust has no chance.</em>
</p>
