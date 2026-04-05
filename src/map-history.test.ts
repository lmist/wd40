import { describe, it, expect } from "vitest";
import { rememberPreviousMap, swapToPreviousMap } from "./map-history";

describe("rememberPreviousMap", () => {
  it("stores the current map before moving to a different map", () => {
    expect(rememberPreviousMap("alpha", "bravo")).toBe("alpha");
  });

  it("preserves the previous map when there is no change", () => {
    expect(rememberPreviousMap("alpha", "alpha", "bravo")).toBe("bravo");
  });
});

describe("swapToPreviousMap", () => {
  it("swaps the active and previous map ids", () => {
    expect(swapToPreviousMap("alpha", "bravo")).toEqual({
      activeMapId: "bravo",
      previousMapId: "alpha",
    });
  });

  it("returns null when no previous map exists", () => {
    expect(swapToPreviousMap("alpha", "")).toBeNull();
  });
});
