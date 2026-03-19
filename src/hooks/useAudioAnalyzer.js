import { useRef, useCallback } from 'react';

export default function useAudioAnalyzer(audioRef) {
  const analyserRef  = useRef(null);
  const dataArrayRef = useRef(null);
  const isSetupRef   = useRef(false);
  const ctxRef       = useRef(null);

  const setup = useCallback(() => {
    if (isSetupRef.current) return;
    const el = audioRef?.current;
    if (!el) return;

    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      ctxRef.current = ctx;

      // Resume AudioContext (required by autoplay policy)
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.55;

      const source = ctx.createMediaElementSource(el);
      source.connect(analyser);
      analyser.connect(ctx.destination);

      analyserRef.current  = analyser;
      dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);
      isSetupRef.current   = true;
    } catch (e) {
      console.warn('AudioAnalyzer setup failed:', e);
    }
  }, [audioRef]);

  const getFrequencyData = useCallback(() => {
    const analyser = analyserRef.current;
    const data     = dataArrayRef.current;

    if (!analyser || !data) {
      return { bass: 0, mids: 0, highs: 0, energy: 0 };
    }

    // Ensure context is running
    if (ctxRef.current && ctxRef.current.state === 'suspended') {
      ctxRef.current.resume();
    }

    analyser.getByteFrequencyData(data);

    // Bass: bins 0-10, Mids: bins 10-60, Highs: bins 60-128
    let bass = 0, mids = 0, highs = 0;
    for (let i = 0; i < 10; i++) bass += data[i];
    for (let i = 10; i < 60; i++) mids += data[i];
    for (let i = 60; i < 128; i++) highs += data[i];

    bass  = bass  / (10 * 255);
    mids  = mids  / (50 * 255);
    highs = highs / (68 * 255);
    const energy = (bass + mids + highs) / 3;

    return { bass, mids, highs, energy };
  }, []);

  return { setup, getFrequencyData };
}
