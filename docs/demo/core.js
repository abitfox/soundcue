// src/core/engine.ts
var DEFAULT_CONFIG = {
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
    taskFail: "W2"
  },
  presets: {
    T1: { name: "Hard teletype", group: "typeTick", throttle: 40, layers: [{ kind: "noise", filter: { type: "bandpass", freq: 4e3, q: 2 }, dur: 0.018, gain: 0.07, attack: 1e-3 }, { kind: "osc", wave: "square", freq: 1900, dur: 0.012, gain: 0.02, attack: 1e-3 }] },
    T2: { name: "Classic terminal beep", group: "typeTick", throttle: 40, layers: [{ kind: "osc", wave: "square", freq: 1040, dur: 0.022, gain: 0.025, attack: 4e-3 }] },
    T3: { name: "Soft tick", group: "typeTick", throttle: 40, layers: [{ kind: "osc", wave: "sine", freq: 1250, freqEnd: 850, dur: 0.03, gain: 0.03, attack: 3e-3 }] },
    T4: { name: "Rising bubble", group: "typeTick", throttle: 40, layers: [{ kind: "osc", wave: "sine", freq: 420, freqEnd: 820, dur: 0.028, gain: 0.035, attack: 3e-3 }] },
    K1: { name: "Mechanical click", group: "keyClick", layers: [{ kind: "noise", filter: { type: "bandpass", freq: 3200, q: 0.9 }, dur: 0.03, gain: 0.1, attack: 1e-3 }, { kind: "osc", wave: "sine", freq: 170, freqEnd: 110, dur: 0.03, gain: 0.08, attack: 1e-3 }] },
    K2: { name: "Membrane tap", group: "keyClick", layers: [{ kind: "noise", filter: { type: "bandpass", freq: 2100, q: 1.2 }, dur: 0.015, gain: 0.05, attack: 1e-3 }, { kind: "osc", wave: "sine", freq: 240, dur: 0.012, gain: 0.03, attack: 1e-3 }] },
    K3: { name: "Vintage typewriter", group: "keyClick", layers: [{ kind: "noise", filter: { type: "bandpass", freq: 1400, q: 0.8 }, dur: 0.04, gain: 0.14, attack: 1e-3 }, { kind: "osc", wave: "sine", freq: 120, freqEnd: 70, dur: 0.05, gain: 0.12, attack: 1e-3 }] },
    P1: { name: "Six-tick riser", group: "terminalPrint", layers: [{ kind: "osc", wave: "square", freq: 880, at: 0, dur: 0.04, gain: 0.028, attack: 3e-3 }, { kind: "osc", wave: "square", freq: 940, at: 0.075, dur: 0.04, gain: 0.028, attack: 3e-3 }, { kind: "osc", wave: "square", freq: 1e3, at: 0.15, dur: 0.04, gain: 0.028, attack: 3e-3 }, { kind: "osc", wave: "square", freq: 1060, at: 0.225, dur: 0.04, gain: 0.028, attack: 3e-3 }, { kind: "osc", wave: "square", freq: 1120, at: 0.3, dur: 0.04, gain: 0.028, attack: 3e-3 }, { kind: "osc", wave: "square", freq: 1180, at: 0.375, dur: 0.04, gain: 0.028, attack: 3e-3 }] },
    P2: { name: "Print-head sweep", group: "terminalPrint", layers: [{ kind: "noise", filter: { type: "bandpass", freq: 2600, q: 1.5 }, at: 0, dur: 0.04, gain: 0.05, attack: 3e-3 }, { kind: "noise", filter: { type: "bandpass", freq: 2600, q: 1.5 }, at: 0.06, dur: 0.04, gain: 0.05, attack: 3e-3 }, { kind: "noise", filter: { type: "bandpass", freq: 2600, q: 1.5 }, at: 0.12, dur: 0.04, gain: 0.05, attack: 3e-3 }] },
    B1: { name: "Falling blip", group: "bootBlip", layers: [{ kind: "osc", wave: "sine", freq: 1240, freqEnd: 620, dur: 0.12, gain: 0.06, attack: 0.01 }] },
    B3: { name: "Rising droplet", group: "bootBlip", layers: [{ kind: "osc", wave: "sine", freq: 700, freqEnd: 1500, dur: 0.1, gain: 0.05, attack: 5e-3 }] },
    S1: { name: "Saw power sweep", group: "bootSweep", layers: [{ kind: "osc", wave: "sawtooth", freq: 140, freqEnd: 980, dur: 0.55, gain: 0.07, attack: 0.02, filter: { type: "lowpass", freq: 900, freqEnd: 4200, q: 1 } }] },
    S2: { name: "Pure sine slide", group: "bootSweep", layers: [{ kind: "osc", wave: "sine", freq: 220, freqEnd: 920, dur: 0.5, gain: 0.08, attack: 0.02 }] },
    E1: { name: "Low thud + metal ping", group: "bootEngage", layers: [{ kind: "osc", wave: "sine", freq: 95, freqEnd: 42, dur: 0.3, gain: 0.16, attack: 8e-3 }, { kind: "osc", wave: "sine", freq: 1560, at: 0.06, dur: 0.22, gain: 0.05, attack: 6e-3 }] },
    E3: { name: "Metal chime", group: "bootEngage", layers: [{ kind: "osc", wave: "sine", freq: 880, dur: 0.8, gain: 0.06, attack: 3e-3 }, { kind: "osc", wave: "sine", freq: 884, dur: 0.8, gain: 0.05, attack: 3e-3 }, { kind: "osc", wave: "sine", freq: 1320, at: 0.02, dur: 0.6, gain: 0.03, attack: 3e-3 }] },
    C1: { name: "Short square blip", group: "uiClick", layers: [{ kind: "osc", wave: "square", freq: 660, dur: 0.04, gain: 0.04, attack: 3e-3 }] },
    C2: { name: "Soft dual-tone", group: "uiClick", layers: [{ kind: "osc", wave: "sine", freq: 520, freqEnd: 760, dur: 0.06, gain: 0.05, attack: 4e-3 }] },
    C3: { name: "Mechanical clack", group: "uiClick", layers: [{ kind: "noise", filter: { type: "bandpass", freq: 1500, q: 2 }, dur: 0.02, gain: 0.08, attack: 1e-3 }, { kind: "osc", wave: "sine", freq: 900, dur: 0.015, gain: 0.02, attack: 1e-3 }] },
    X1: { name: "Fast slide-open", group: "panelExpand", layers: [{ kind: "osc", wave: "sine", freq: 300, freqEnd: 900, dur: 0.12, gain: 0.06, attack: 8e-3 }] },
    X2: { name: "Airy pop", group: "panelExpand", layers: [{ kind: "noise", filter: { type: "highpass", freq: 1200, q: 1 }, dur: 0.08, gain: 0.05, attack: 2e-3 }, { kind: "osc", wave: "sine", freq: 520, freqEnd: 900, at: 0.06, dur: 0.08, gain: 0.05, attack: 4e-3 }] },
    W1: { name: "Decode success", group: "taskPass", layers: [{ kind: "osc", wave: "sine", freq: 660, dur: 0.09, gain: 0.055, attack: 4e-3 }, { kind: "osc", wave: "sine", freq: 880, at: 0.09, dur: 0.09, gain: 0.055, attack: 4e-3 }, { kind: "osc", wave: "sine", freq: 1320, at: 0.18, dur: 0.26, gain: 0.05, attack: 4e-3 }, { kind: "osc", wave: "triangle", freq: 2640, at: 0.2, dur: 0.16, gain: 0.018, attack: 4e-3 }] },
    W2: { name: "Decode rejected", group: "taskFail", layers: [{ kind: "osc", wave: "square", freq: 220, freqEnd: 116, dur: 0.3, gain: 0.05, attack: 6e-3, filter: { type: "lowpass", freq: 900, freqEnd: 420, q: 1.2 } }, { kind: "osc", wave: "square", freq: 180, freqEnd: 96, at: 0.16, dur: 0.26, gain: 0.04, attack: 6e-3, filter: { type: "lowpass", freq: 720, freqEnd: 360, q: 1.2 } }] }
  }
};
function resolvePreset(config, slot) {
  const id = config.slots[slot];
  return id ? config.presets[id] ?? null : null;
}
function isThrottled(preset, lastPlayedAt, now) {
  const throttle = (preset.throttle ?? 0) / 1e3;
  return throttle > 0 && now - (lastPlayedAt ?? -Infinity) < throttle;
}
function createSoundcue(options = {}) {
  let cfg = options.config ?? DEFAULT_CONFIG;
  let ctx = null;
  let configFetched = false;
  const lastPlayed = {};
  const sampleCache = /* @__PURE__ */ new Map();
  const samplePending = /* @__PURE__ */ new Set();
  let masterGain = null;
  let masterCtx = null;
  function createCtx() {
    if (typeof window === "undefined") return null;
    try {
      const AC = window.AudioContext ?? window.webkitAudioContext;
      return AC ? new AC() : null;
    } catch {
      return null;
    }
  }
  function fetchConfigOnce() {
    if (configFetched || !options.configUrl || typeof window === "undefined") return;
    configFetched = true;
    fetch(options.configUrl).then((r) => r.ok ? r.json() : null).then((j) => {
      if (j && j.slots && j.presets) {
        cfg = j;
        applyMasterVolume();
      }
    }).catch(() => {
    });
  }
  function getRunningCtx() {
    fetchConfigOnce();
    if (!ctx) ctx = createCtx();
    return ctx && ctx.state === "running" ? ctx : null;
  }
  function masterOut(c) {
    if (!masterGain || masterCtx !== c) {
      masterCtx = c;
      masterGain = c.createGain();
      const comp = c.createDynamicsCompressor();
      comp.threshold.value = -12;
      comp.knee.value = 24;
      comp.ratio.value = 6;
      comp.attack.value = 3e-3;
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
  function loadSample(c, url) {
    if (sampleCache.has(url) || samplePending.has(url)) return;
    samplePending.add(url);
    fetch(url).then((r) => {
      if (!r.ok) throw new Error(String(r.status));
      return r.arrayBuffer();
    }).then((ab) => c.decodeAudioData(ab)).then((buf) => {
      sampleCache.set(url, buf);
      samplePending.delete(url);
    }).catch(() => {
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
  function playSample(c, at, p) {
    const url = p.sample;
    const buf = sampleCache.get(url);
    if (!buf) {
      loadSample(c, url);
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
    g.gain.exponentialRampToValueAtTime(1e-4, at + dur / rate);
    src.connect(g).connect(masterOut(c));
    src.start(at, offset, dur / rate);
  }
  function renderLayer(c, t0, l) {
    const at = t0 + (l.at ?? 0);
    const attack = l.attack ?? 5e-3;
    const gain = c.createGain();
    gain.gain.setValueAtTime(1e-4, at);
    gain.gain.exponentialRampToValueAtTime(Math.max(l.gain, 2e-4), at + attack);
    gain.gain.exponentialRampToValueAtTime(1e-4, at + l.dur);
    let node;
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
      f.type = l.filter.type;
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
      }
      preloadSamples();
    },
    play(slot) {
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
    setMasterVolume(v) {
      cfg.masterVolume = Math.max(0, v);
      applyMasterVolume();
    },
    setConfig(config) {
      cfg = config;
      applyMasterVolume();
    },
    getConfig() {
      return cfg;
    }
  };
}
var defaultInstance = null;
function getDefaultSoundcue() {
  if (!defaultInstance) defaultInstance = createSoundcue();
  return defaultInstance;
}
function unlockSoundcue() {
  getDefaultSoundcue().unlock();
}
function playSlot(slot) {
  getDefaultSoundcue().play(slot);
}
function setMasterVolume(v) {
  getDefaultSoundcue().setMasterVolume(v);
}
function setSoundConfig(config) {
  getDefaultSoundcue().setConfig(config);
}

// src/core/index.ts
var playTypeTick = () => playSlot("typeTick");
var playKeyClick = () => playSlot("keyClick");
var playTerminalPrint = () => playSlot("terminalPrint");
var playBootBlip = () => playSlot("bootBlip");
var playBootSweep = () => playSlot("bootSweep");
var playBootEngage = () => playSlot("bootEngage");
var playUiClick = () => playSlot("uiClick");
var playPanelExpand = () => playSlot("panelExpand");
var playTaskPass = () => playSlot("taskPass");
var playTaskFail = () => playSlot("taskFail");
export {
  DEFAULT_CONFIG,
  createSoundcue,
  getDefaultSoundcue,
  isThrottled,
  playBootBlip,
  playBootEngage,
  playBootSweep,
  playKeyClick,
  playPanelExpand,
  playSlot,
  playTaskFail,
  playTaskPass,
  playTerminalPrint,
  playTypeTick,
  playUiClick,
  resolvePreset,
  setMasterVolume,
  setSoundConfig,
  unlockSoundcue
};
//# sourceMappingURL=core.js.map