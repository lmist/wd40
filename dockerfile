# Stage 1: Build wd40 in a controlled Zig environment
FROM alpine:3.19 AS builder

RUN apk add --no-cache curl tar xz
RUN curl -L https://ziglang.org/download/0.13.0/zig-linux-x86_64-0.13.0.tar.xz -o /tmp/zig.tar.xz && \
    tar -xf /tmp/zig.tar.xz -C /usr/local && \
    ln -s /usr/local/zig-linux-x86_64-0.13.0/zig /usr/local/bin/zig && \
    rm /tmp/zig.tar.xz

WORKDIR /build
COPY build.zig build.zig.zon* ./
COPY src/ ./src/
RUN zig build -Dtarget=x86_64-linux-gnu -Doptimize=ReleaseFast

# Stage 2: Rust-infested target machine
FROM rust:bookworm

# Relocate cargo + rustup state into $HOME so wd40's canonical ~/.cargo / ~/.rustup
# scan paths actually hit something. The base image points CARGO_HOME and
# RUSTUP_HOME at /usr/local/{cargo,rustup}; move them to /root/.{cargo,rustup}.
ENV HOME=/root
ENV CARGO_HOME=/root/.cargo
ENV RUSTUP_HOME=/root/.rustup
RUN mv /usr/local/cargo /root/.cargo && \
    mv /usr/local/rustup /root/.rustup
ENV PATH="/root/.cargo/bin:${PATH}"

# Install cargo-binstall (prebuilt) so we can pull real Rust CLIs without
# compiling them from source (minutes -> seconds).
RUN ARCH=$(uname -m) && \
    case "$ARCH" in \
      aarch64|arm64) TRIPLE=aarch64-unknown-linux-gnu ;; \
      x86_64|amd64)  TRIPLE=x86_64-unknown-linux-gnu ;; \
      *) echo "unsupported arch $ARCH" >&2; exit 1 ;; \
    esac && \
    curl -fL "https://github.com/cargo-bins/cargo-binstall/releases/latest/download/cargo-binstall-${TRIPLE}.tgz" \
        | tar -xz -C /root/.cargo/bin/

# Pull a pile of famously-Rust CLIs as real ELF binaries.
RUN cargo binstall --no-confirm \
        ripgrep \
        fd-find \
        bat \
        tokei \
        sd \
        hyperfine \
        zoxide

# Toolchain satellite binaries that wd40 explicitly looks for.
RUN rustup component add rustfmt clippy rust-analyzer

# One real Cargo project with a real target/ dir in an arbitrary location,
# to exercise the recursive-scan / Cargo.toml detection codepath.
RUN mkdir -p /opt/scratch && cd /opt/scratch && \
    cargo new --vcs none --bin scattered && \
    cd scattered && \
    cargo build

# Drop the wd40 binary into a non-Rust location
COPY --from=builder /build/zig-out/bin/wd40 /usr/local/bin/wd40
RUN chmod +x /usr/local/bin/wd40

ENTRYPOINT ["/usr/local/bin/wd40"]
