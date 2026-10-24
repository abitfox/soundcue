/**
 * SoundCue core — a config-driven Web Audio UI sound engine.
 *
 * Every sound is a preset described in plain JSON (oscillator/noise layers,
 * frequency slides, biquad filters, optional sample playback), and named
 * sound slots ("typeTick", "keyClick", ...) map onto presets. Swap the
 * config at runtime to re-skin the whole soundscape — no audio assets
 * required unless you want them.
 *
 * Ported from the HackerEnglish project's lib/sfx.ts (MIT).
 */

/* ============ Config schema ============ */

export type OscWave = "sine" | "square" | "sawtooth" | "triangle";

/** One synth layer: an oscillator burst or a filtered noise burst. */
export interface SoundLayer {
  /** "osc" (default) or "noise" */
  kind?: "osc" | "noise";
  /** Oscillator wave shape (osc layers only) */
  wave?: OscWave;
  /** Start frequency in Hz (osc layers; noise filters put their freq in filter.freq) */
  freq?: number;
  /** End frequency in Hz — linear-ramped slide when present */
  freqEnd?: number;
  /** Offset from the sound start, in seconds */
  at?: number;
  /** Layer duration in seconds */
  dur: number;
  /** Peak gain (0..1) */
  gain: number;
  /** Attack time in seconds (exponential ramp to peak) */
  attack?: number;
  /** Optional biquad filter applied to this layer */
  filter?: {
    type: string;
    freq: number;
    freqEnd?: number;
    q?: number;
  };
}

export interface SoundPreset {
  /** Human-readable name (shown in sound labs / pickers) */
  name?: string;
  /** Free-form group tag for tooling (e.g. "typeTick", "boot") */
  group?: string;
  /** Minimum interval between two triggers of the same slot, in ms (type-rate sounds) */
  throttle?: number;
  /** Sample file URL — when present, layers are ignored */
  sample?: string;
  /** Sample start offset in seconds (trim a click out of a longer recording) */
  sampleOffset?: number;
  /** Sample duration in seconds (default: play to end) */
  sampleDur?: number;
  /** Sample peak gain (0..1) */
  sampleGain?: number;
  /** Random playback-rate jitter amplitude (0..1, default 0.06) so rapid fires vary */
  jitter?: number;
  layers: SoundLayer[];
}

export interface SoundConfig {
  /** Global volume multiplier (1 = preset-native levels); a compressor guards against stacking */
  masterVolume?: number;
  /** Named sound slots → preset ids */
  slots: Record<string, string>;
  /** All available presets, keyed by id */
  presets: Record<string, SoundPreset>;
}

export interface SoundcueOptions {
  /** Initial config; falls back to the built-in default pack */
  config?: SoundConfig;
  /**
   * Optional URL of a JSON config fetched once on first use; a successful
   * fetch overrides the initial config (failures are silent).
   */
  configUrl?: string;
}

/* ============ Default pack (synth-only, zero assets) ============ */

export const DEFAULT_CONFIG: SoundConfig = {
  masterVolume: 1,
  slots: {
    typeTick: "T2",
    keyClick: "K1",
    terminalPrint: "P1",
    bootBlip: "B1",
    bootSweep: "S1",
    bootEngage: "E1",
    uiClick: "C2",
    panelExpand: "X1",
    taskPass: "W1",
    taskFail: "W2",
  },
  presets: {
    T1: { name: "Hard teletype", group: "typeTick", throttle: 40, layers: [{ kind: "noise", filter: { type: "bandpass", freq: 4000, q: 2 }, dur: 0.018, gain: 0.07, attack: 0.001 }, { kind: "osc", wave: "square", freq: 1900, dur: 0.012, gain: 0.02, attack: 0.001 }] },
    T2: { name: "Classic terminal beep", group: "typeTick", throttle: 40, layers: [{ kind: "osc", wave: "square", freq: 1040, dur: 0.022, gain: 0.025, attack: 0.004 }] },
    T3: { name: "Soft tick", group: "typeTick", throttle: 40, layers: [{ kind: "osc", wave: "sine", freq: 1250, freqEnd: 850, dur: 0.03, gain: 0.03, attack: 0.003 }] },
    T4: { name: "Rising bubble", group: "typeTick", throttle: 40, layers: [{ kind: "osc", wave: "sine", freq: 420, freqEnd: 820, dur: 0.028, gain: 0.035, attack: 0.003 }] },
    K1: { name: "Mechanical click", group: "keyClick", layers: [{ kind: "noise", filter: { type: "bandpass", freq: 3200, q: 0.9 }, dur: 0.03, gain: 0.1, attack: 0.001 }, { kind: "osc", wave: "sine", freq: 170, freqEnd: 110, dur: 0.03, gain: 0.08, attack: 0.001 }] },
    K2: { name: "Membrane tap", group: "keyClick", layers: [{ kind: "noise", filter: { type: "bandpass", freq: 2100, q: 1.2 }, dur: 0.015, gain: 0.05, attack: 0.001 }, { kind: "osc", wave: "sine", freq: 240, dur: 0.012, gain: 0.03, attack: 0.001 }] },
    K3: { name: "Vintage typewriter", group: "keyClick", layers: [{ kind: "noise", filter: { type: "bandpass", freq: 1400, q: 0.8 }, dur: 0.04, gain: 0.14, attack: 0.001 }, { kind: "osc", wave: "sine", freq: 120, freqEnd: 70, dur: 0.05, gain: 0.12, attack: 0.001 }] },
    P1: { name: "Six-tick riser", group: "terminalPrint", layers: [{ kind: "osc", wave: "square", freq: 880, at: 0, dur: 0.04, gain: 0.028, attack: 0.003 }, { kind: "osc", wave: "square", freq: 940, at: 0.075, dur: 0.04, gain: 0.028, attack: 0.003 }, { kind: "osc", wave: "square", freq: 1000, at: 0.15, dur: 0.04, gain: 0.028, attack: 0.003 }, { kind: "osc", wave: "square", freq: 1060, at: 0.225, dur: 0.04, gain: 0.028, attack: 0.003 }, { kind: "osc", wave: "square", freq: 1120, at: 0.3, dur: 0.04, gain: 0.028, attack: 0.003 }, { kind: "osc", wave: "square", freq: 1180, at: 0.375, dur: 0.04, gain: 0.028, attack: 0.003 }] },
    P2: { name: "Print-head sweep", group: "terminalPrint", layers: [{ kind: "noise", filter: { type: "bandpass", freq: 2600, q: 1.5 }, at: 0, dur: 0.04, gain: 0.05, attack: 0.003 }, { kind: "noise", filter: { type: "bandpass", freq: 2600, q: 1.5 }, at: 0.06, dur: 0.04, gain: 0.05, attack: 0.003 }, { kind: "noise", filter: { type: "bandpass", freq: 2600, q: 1.5 }, at: 0.12, dur: 0.04, gain: 0.05, attack: 0.003 }] },
    B1: { name: "Falling blip", group: "bootBlip", layers: [{ kind: "osc", wave: "sine", freq: 1240, freqEnd: 620, dur: 0.12, gain: 0.06, attack: 0.01 }] },
    B3: { name: "Rising droplet", group: "bootBlip", layers: [{ kind: "osc", wave: "sine", freq: 700, freqEnd: 1500, dur: 0.1, gain: 0.05, attack: 0.005 }] },
    S1: { name: "Saw power sweep", group: "bootSweep", layers: [{ kind: "osc", wave: "sawtooth", freq: 140, freqEnd: 980, dur: 0.55, gain: 0.07, attack: 0.02, filter: { type: "lowpass", freq: 900, freqEnd: 4200, q: 1 } }] },
    S2: { name: "Pure sine slide", group: "bootSweep", layers: [{ kind: "osc", wave: "sine", freq: 220, freqEnd: 920, dur: 0.5, gain: 0.08, attack: 0.02 }] },
    E1: { name: "Low thud + metal ping", group: "bootEngage", layers: [{ kind: "osc", wave: "sine", freq: 95, freqEnd: 42, dur: 0.3, gain: 0.16, attack: 0.008 }, { kind: "osc", wave: "sine", freq: 1560, at: 0.06, dur: 0.22, gain: 0.05, attack: 0.006 }] },
    E3: { name: "Metal chime", group: "bootEngage", layers: [{ kind: "osc", wave: "sine", freq: 880, dur: 0.8, gain: 0.06, attack: 0.003 }, { kind: "osc", wave: "sine", freq: 884, dur: 0.8, gain: 0.05, attack: 0.003 }, { kind: "osc", wave: "sine", freq: 1320, at: 0.02, dur: 0.6, gain: 0.03, attack: 0.003 }] },
    C1: { name: "Short square blip", group: "uiClick", layers: [{ kind: "osc", wave: "square", freq: 660, dur: 0.04, gain: 0.04, attack: 0.003 }] },
    C2: { name: "Soft dual-tone", group: "uiClick", layers: [{ kind: "osc", wave: "sine", freq: 520, freqEnd: 760, dur: 0.06, gain: 0.05, attack: 0.004 }] },
    C3: { name: "Mechanical clack", group: "uiClick", layers: [{ kind: "noise", filter: { type: "bandpass", freq: 1500, q: 2 }, dur: 0.02, gain: 0.08, attack: 0.001 }, { kind: "osc", wave: "sine", freq: 900, dur: 0.015, gain: 0.02, attack: 0.001 }] },
    X1: { name: "Fast slide-open", group: "panelExpand", layers: [{ kind: "osc", wave: "sine", freq: 300, freqEnd: 900, dur: 0.12, gain: 0.06, attack: 0.008 }] },
    X2: { name: "Airy pop", group: "panelExpand", layers: [{ kind: "noise", filter: { type: "highpass", freq: 1200, q: 1 }, dur: 0.08, gain: 0.05, attack: 0.002 }, { kind: "osc", wave: "sine", freq: 520, freqEnd: 900, at: 0.06, dur: 0.08, gain: 0.05, attack: 0.004 }] },
    W1: { name: "Decode success", group: "taskPass", layers: [{ kind: "osc", wave: "sine", freq: 660, dur: 0.09, gain: 0.055, attack: 0.004 }, { kind: "osc", wave: "sine", freq: 880, at: 0.09, dur: 0.09, gain: 0.055, attack: 0.004 }, { kind: "osc", wave: "sine", freq: 1320, at: 0.18, dur: 0.26, gain: 0.05, attack: 0.004 }, { kind: "osc", wave: "triangle", freq: 2640, at: 0.2, dur: 0.16, gain: 0.018, attack: 0.004 }] },
    W2: { name: "Decode rejected", group: "taskFail", layers: [{ kind: "osc", wave: "square", freq: 220, freqEnd: 116, dur: 0.3, gain: 0.05, attack: 0.006, filter: { type: "lowpass", freq: 900, freqEnd: 420, q: 1.2 } }, { kind: "osc", wave: "square", freq: 180, freqEnd: 96, at: 0.16, dur: 0.26, gain: 0.04, attack: 0.006, filter: { type: "lowpass", freq: 720, freqEnd: 360, q: 1.2 } }] },
  },
};

/* ============ Pure config resolution (unit-testable) ============ */

/** Resolve a slot name to its preset, or null when the slot/preset is missing. */
export function resolvePreset(config: SoundConfig, slot: string): SoundPreset | null {
  const id = config.slots[slot];
  return id ? (config.presets[id] ?? null) : null;
}

/** True when this preset would be throttled given the last-played timestamp (seconds) and now (seconds). */
export function isThrottled(
  preset: SoundPreset,
  lastPlayedAt: number | undefined,
  now: number,
): boolean {
  const throttle = (preset.throttle ?? 0) / 1000;
  return throttle > 0 && now - (lastPlayedAt ?? -Infinity) < throttle;
}

/* ============ Engine ============ */

export interface Soundcue {
  /** Unlock the AudioContext inside a user gesture (call as early as possible). */
  unlock(): void;
  /** Play the preset bound to a slot (silent no-op outside browsers / before unlock). */
  play(slot: string): void;
  /** Runtime master volume (<= 0 mutes). */
  setMasterVolume(v: number): void;
  /** Replace the active config (slot map + presets). */
  setConfig(config: SoundConfig): void;
  /** Snapshot of the current config. */
  getConfig(): SoundConfig;
}

interface AudioContextWindow extends Window {
  webkitAudioContext?: typeof AudioContext;
}

export function createSoundcue(options: SoundcueOptions = {}): Soundcue {
  let cfg: SoundConfig = options.config ?? DEFAULT_CONFIG;

  let ctx: AudioContext | null = null;
  let configFetched = false;
  const lastPlayed: Record<string, number> = {};
  const sampleCache = new Map<string, AudioBuffer>();
  const samplePending = new Set<string>();

  let masterGain: GainNode | null = null;
  let masterCtx: AudioContext | null = null;

  function createCtx(): AudioContext | null {
    if (typeof window === "undefined") return null;
    try {
      const AC =
        window.AudioContext ??
        (window as unknown as AudioContextWindow).webkitAudioContext;
      return AC ? new AC() : null;
    } catch {
      return null;
    }
  }

  function fetchConfigOnce() {
    if (configFetched || !options.configUrl || typeof window === "undefined") return;
    configFetched = true;
    fetch(options.configUrl)
      .then((r) => (r.ok ? r.json() : null))
      .then((j: SoundConfig | null) => {
        if (j && j.slots && j.presets) {
          cfg = j;
          applyMasterVolume();
        }
      })
      .catch(() => {
        /* keep the current config */
      });
  }

  function getRunningCtx(): AudioContext | null {
    fetchConfigOnce();
    if (!ctx) ctx = createCtx();
    return ctx && ctx.state === "running" ? ctx : null;
  }

  function masterOut(c: AudioContext): AudioNode {
    if (!masterGain || masterCtx !== c) {
      masterCtx = c;
      masterGain = c.createGain();
      const comp = c.createDynamicsCompressor();
      comp.threshold.value = -12;
      comp.knee.value = 24;
      comp.ratio.value = 6;
      comp.attack.value = 0.003;
      comp.release.value = 0.12;
      masterGain.connect(comp).connect(c.destination);
      applyMasterVolume();
    }
    return masterGain;
  }

  function applyMasterVolume() {
    const v = Math.max(0, cfg.masterVolume ?? 1);
    if (masterGain && masterCtx) {
      masterGain.gain.setTargetAtTime(v, masterCtx.currentTime, 0.02);
    }
  }

  function loadSample(c: AudioContext, url: string) {
    if (sampleCache.has(url) || samplePending.has(url)) return;
    samplePending.add(url);
    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.arrayBuffer();
      })
      .then((ab) => c.decodeAudioData(ab))
      .then((buf) => {
        sampleCache.set(url, buf);
        samplePending.delete(url);
      })
      .catch(() => {
        samplePending.delete(url);
      });
  }

  function preloadSamples() {
    const c = ctx;
    if (!c) return;
    for (const p of Object.values(cfg.presets)) {
      if (p.sample) loadSample(c, p.sample);
    }
  }

  function playSample(c: AudioContext, at: number, p: SoundPreset) {
    const url = p.sample!;
    const buf = sampleCache.get(url);
    if (!buf) {
      loadSample(c, url); // not ready yet: silent this time, fine after preload
      return;
    }
    const offset = p.sampleOffset ?? 0;
    const avail = buf.duration - offset;
    if (avail <= 0) return;
    const dur = Math.min(p.sampleDur ?? avail, avail);
    const jitter = p.jitter ?? 0.06;
    const rate = 1 + (Math.random() * 2 - 1) * jitter;
    const src = c.createBufferSource();
    src.buffer = buf;
    src.playbackRate.value = rate;
    const g = c.createGain();
    g.gain.setValueAtTime(p.sampleGain ?? 0.6, at);
    g.gain.exponentialRampToValueAtTime(0.0001, at + dur / rate);
    src.connect(g).connect(masterOut(c));
    src.start(at, offset, dur / rate);
  }

  function renderLayer(c: AudioContext, t0: number, l: SoundLayer) {
    const at = t0 + (l.at ?? 0);
    const attack = l.attack ?? 0.005;
    const gain = c.createGain();
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(Math.max(l.gain, 0.0002), at + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + l.dur);

    let node: AudioNode;
    if (l.kind === "noise") {
      const dur = l.dur + 0.05;
      const buffer = c.createBuffer(1, Math.ceil(c.sampleRate * dur), c.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      const src = c.createBufferSource();
      src.buffer = buffer;
      src.start(at);
      node = src;
    } else {
      const osc = c.createOscillator();
      osc.type = l.wave ?? "sine";
      osc.frequency.setValueAtTime(l.freq ?? 440, at);
      if (l.freqEnd && l.freqEnd > 0) {
        osc.frequency.exponentialRampToValueAtTime(l.freqEnd, at + l.dur);
      }
      osc.start(at);
      osc.stop(at + l.dur + 0.05);
      node = osc;
    }

    if (l.filter) {
      const f = c.createBiquadFilter();
      f.type = l.filter.type as BiquadFilterType;
      f.Q.value = l.filter.q ?? 1;
      f.frequency.setValueAtTime(l.filter.freq, at);
      if (l.filter.freqEnd && l.filter.freqEnd > 0) {
        f.frequency.exponentialRampToValueAtTime(l.filter.freqEnd, at + l.dur);
      }
      node.connect(f);
      f.connect(gain);
    } else {
      node.connect(gain);
    }
    gain.connect(masterOut(c));
  }

  return {
    unlock() {
      fetchConfigOnce();
      if (!ctx) ctx = createCtx();
      try {
        void ctx?.resume();
      } catch {
        /* ignore */
      }
      preloadSamples();
    },
    play(slot: string) {
      const c = getRunningCtx();
      if (!c) return;
      const preset = resolvePreset(cfg, slot);
      if (!preset) return;
      const now = c.currentTime;
      if (isThrottled(preset, lastPlayed[slot], now)) return;
      lastPlayed[slot] = now;
      if (preset.sample) {
        playSample(c, now, preset);
        return;
      }
      for (const layer of preset.layers) renderLayer(c, now, layer);
    },
    setMasterVolume(v: number) {
      cfg.masterVolume = Math.max(0, v);
      applyMasterVolume();
    },
    setConfig(config: SoundConfig) {
      cfg = config;
      applyMasterVolume();
    },
    getConfig() {
      return cfg;
    },
  };
}

/* ============ Default shared instance (the simple API) ============ */

let defaultInstance: Soundcue | null = null;

/** The default shared engine (created lazily; safe to import in SSR code). */
export function getDefaultSoundcue(): Soundcue {
  if (!defaultInstance) defaultInstance = createSoundcue();
  return defaultInstance;
}

/** Unlock the default engine inside a user gesture (call as early as possible). */
export function unlockSoundcue(): void {
  getDefaultSoundcue().unlock();
}

/** Play a slot on the default engine. */
export function playSlot(slot: string): void {
  getDefaultSoundcue().play(slot);
}

/** Set the default engine's master volume (<= 0 mutes). */
export function setMasterVolume(v: number): void {
  getDefaultSoundcue().setMasterVolume(v);
}

/** Replace the default engine's config (e.g. after fetching your own sounds.json). */
export function setSoundConfig(config: SoundConfig): void {
  getDefaultSoundcue().setConfig(config);
}
