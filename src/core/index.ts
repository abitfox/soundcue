/**
 * Framework-free entry: re-exports the engine and a semantic slot API.
 * The default pack uses these slot names; override via config to re-map.
 */

import { playSlot as playSlotSlot } from "./engine";

export {
  createSoundcue,
  getDefaultSoundcue,
  unlockSoundcue,
  playSlot,
  setMasterVolume,
  setSoundConfig,
  resolvePreset,
  isThrottled,
  DEFAULT_CONFIG,
} from "./engine";
export type {
  Soundcue,
  SoundcueOptions,
  SoundConfig,
  SoundPreset,
  SoundLayer,
  OscWave,
} from "./engine";

/* ---- Semantic slots of the default pack ---- */

/** Typewriter tick (per-glyph; throttled inside the slot) */
export const playTypeTick = () => playSlotSlot("typeTick");
/** Keyboard click */
export const playKeyClick = () => playSlotSlot("keyClick");
/** Terminal welcome/banner line print */
export const playTerminalPrint = () => playSlotSlot("terminalPrint");
/** Boot stage: rectangle fades in */
export const playBootBlip = () => playSlotSlot("bootBlip");
/** Boot stage: rectangle expands to full frame */
export const playBootSweep = () => playSlotSlot("bootSweep");
/** Boot stage: overlay dissolves, panels revealed */
export const playBootEngage = () => playSlotSlot("bootEngage");
/** Generic button click */
export const playUiClick = () => playSlotSlot("uiClick");
/** Panel/section expand reveal */
export const playPanelExpand = () => playSlotSlot("panelExpand");
/** Task/success confirmation (rising) */
export const playTaskPass = () => playSlotSlot("taskPass");
/** Task/fail rejection (falling) */
export const playTaskFail = () => playSlotSlot("taskFail");
