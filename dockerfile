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

ENV HOME=/root

# Scatter fake Rust projects with target/ dirs and Cargo.toml files
RUN mkdir -p /opt/demo/fd/target/release/deps && \
    mkdir -p /opt/demo/fd/target/debug/.fingerprint/fd-abc123 && \
    printf '[package]\nname = "fd-find"\nversion = "10.0.0"\nedition = "2021"\n' > /opt/demo/fd/Cargo.toml && \
    touch /opt/demo/fd/target/release/fd && \
    touch /opt/demo/fd/target/release/deps/libfd.rlib && \
    touch /opt/demo/fd/target/debug/.fingerprint/fd-abc123/lib-fd

RUN mkdir -p /opt/demo/bat/target/release/deps && \
    printf '[package]\nname = "bat"\nversion = "0.24.0"\nedition = "2021"\n' > /opt/demo/bat/Cargo.toml && \
    touch /opt/demo/bat/target/release/bat

RUN mkdir -p /opt/demo/ripgrep/target/release/deps && \
    printf '[package]\nname = "ripgrep"\nversion = "14.0.0"\nedition = "2021"\n' > /opt/demo/ripgrep/Cargo.toml && \
    touch /opt/demo/ripgrep/target/release/rg

RUN mkdir -p /opt/demo/scattered/target/debug /opt/demo/scattered/target/release && \
    printf '[package]\nname = "fake"\nversion = "0.1.0"\nedition = "2021"\n' > /opt/demo/scattered/Cargo.toml && \
    touch /opt/demo/scattered/target/debug/fake && \
    touch /opt/demo/scattered/target/release/fake

# Create a fake cargo-installed binary to test PATH scanning
RUN mkdir -p /opt/fake-bin && \
    cp $(which rustc) /opt/fake-bin/rustc && \
    cp $(which cargo) /opt/fake-bin/cargo
ENV PATH="/opt/fake-bin:${PATH}"

# Drop the wd40 binary into a non-Rust location
COPY --from=builder /build/zig-out/bin/wd40 /usr/local/bin/wd40
RUN chmod +x /usr/local/bin/wd40

ENTRYPOINT ["/usr/local/bin/wd40"]
