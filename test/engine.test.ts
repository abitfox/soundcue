import { describe, expect, it } from "vitest";
import { DEFAULT_CONFIG, isThrottled, resolvePreset, type SoundConfig } from "../src/core/engine";

describe("resolvePreset", () => {
  it("resolves a slot to its preset", () => {
    expect(resolvePreset(DEFAULT_CONFIG, "typeTick")?.group).toBe("typeTick");
    expect(resolvePreset(DEFAULT_CONFIG, "taskFail")).toBeTruthy();
  });

  it("returns null for unknown slots or dangling preset ids", () => {
    expect(resolvePreset(DEFAULT_CONFIG, "nope")).toBeNull();
    const broken: SoundConfig = { slots: { x: "MISSING" }, presets: {} };
    expect(resolvePreset(broken, "x")).toBeNull();
  });
});

describe("isThrottled", () => {
  it("throttles rapid re-triggers inside the throttle window", () => {
    const p = resolvePreset(DEFAULT_CONFIG, "typeTick")!; // throttle: 40ms
    expect(isThrottled(p, 1.0, 1.02)).toBe(true); // 20ms later
    expect(isThrottled(p, 1.0, 1.05)).toBe(false); // 50ms later
  });

  it("never throttles presets without a throttle setting", () => {
    const p = { layers: [] };
    expect(isThrottled(p, 1.0, 1.0001)).toBe(false);
    expect(isThrottled(p, undefined, 1.0)).toBe(false);
  });

  it("does not throttle the first trigger", () => {
    const p = resolvePreset(DEFAULT_CONFIG, "typeTick")!;
    expect(isThrottled(p, undefined, 42)).toBe(false);
  });
});

describe("default pack integrity", () => {
  it("maps every slot to an existing preset", () => {
    for (const [slot, id] of Object.entries(DEFAULT_CONFIG.slots)) {
      expect(DEFAULT_CONFIG.presets[id], `slot ${slot} -> ${id}`).toBeTruthy();
    }
  });

  it("keeps every layer within sane bounds", () => {
    for (const [id, p] of Object.entries(DEFAULT_CONFIG.presets)) {
      for (const l of p.layers) {
        expect(l.dur, `${id} layer dur`).toBeGreaterThan(0);
        expect(l.gain, `${id} layer gain`).toBeGreaterThan(0);
      }
    }
  });
});
