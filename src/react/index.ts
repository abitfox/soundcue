/**
 * SoundCue React entry.
 *
 * `useSoundcue()` returns the shared engine and installs the early-unlock
 * gesture listeners on first mount (browsers suspend new AudioContexts until
 * a user gesture; unlocking early means the first click already sounds).
 */

import { useEffect, useState } from "react";
import {
  createSoundcue,
  getDefaultSoundcue,
  unlockSoundcue,
  type Soundcue,
  type SoundcueOptions,
  type SoundConfig,
} from "../core/engine";

export function useSoundcue(): Soundcue {
  useEffect(() => {
    unlockSoundcue();
    const unlock = () => unlockSoundcue();
    window.addEventListener("pointerdown", unlock);
    window.addEventListener("keydown", unlock);
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);
  return getDefaultSoundcue();
}

/**
 * Create an isolated engine (not the shared default) — useful for
 * sound-pack previews or multi-scene apps. Options are read once.
 */
export function useSoundcueInstance(options: SoundcueOptions): Soundcue {
  const [engine] = useState(() => createSoundcue(options));
  useEffect(() => {
    engine.unlock();
    const unlock = () => engine.unlock();
    window.addEventListener("pointerdown", unlock);
    window.addEventListener("keydown", unlock);
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, [engine]);
  return engine;
}

/** Replace the shared engine's config (e.g. after fetching your own pack). */
export function useSoundConfig(config: SoundConfig): void {
  useEffect(() => {
    getDefaultSoundcue().setConfig(config);
  }, [config]);
}

export type { Soundcue, SoundConfig, SoundPreset, SoundLayer } from "../core/engine";
