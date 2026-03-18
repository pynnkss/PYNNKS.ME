import { useState, useEffect, useRef } from 'react';
import styles from './MuteButton.module.css';

const DEFAULT_VOL = 0.4;

export default function MuteButton({ audioRef }) {
  const [muted, setMuted]       = useState(false);
  const [vol, setVol]           = useState(DEFAULT_VOL);
  const [expanded, setExpanded] = useState(false);
  const containerRef            = useRef(null);

  // Set default volume on mount
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = DEFAULT_VOL;
  }, [audioRef]);

  const toggleMute = () => {
    const next = !muted;
    if (audioRef.current) audioRef.current.muted = next;
    setMuted(next);
  };

  const handleVol = (e) => {
    const v = parseFloat(e.target.value);
    setVol(v);
    if (audioRef.current) {
      audioRef.current.volume = v;
      audioRef.current.muted  = v === 0;
    }
    setMuted(v === 0);
  };

  // Close panel when clicking outside
  useEffect(() => {
    const onClickOut = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setExpanded(false);
      }
    };
    document.addEventListener('mousedown', onClickOut);
    return () => document.removeEventListener('mousedown', onClickOut);
  }, []);

  const displayVol = muted ? 0 : vol;

  return (
    <div
      ref={containerRef}
      className={`${styles.container} ${expanded ? styles.open : ''}`}
    >
      {/* Volume slider panel — slides in when expanded */}
      <div className={styles.panel}>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={displayVol}
          onChange={handleVol}
          className={styles.slider}
          style={{ '--vol': displayVol }}
          aria-label="Volume"
        />
        <span className={styles.volLabel}>
          {Math.round(displayVol * 100)}
        </span>
      </div>

      {/* Mute / icon button */}
      <button
        className={styles.btn}
        onClick={toggleMute}
        onMouseEnter={() => setExpanded(true)}
        aria-label={muted ? 'Unmute music' : 'Mute music'}
      >
        <span className={`${styles.bars} ${muted || vol === 0 ? styles.muted : ''}`}>
          <span className={styles.bar} />
          <span className={styles.bar} />
          <span className={styles.bar} />
          <span className={styles.bar} />
        </span>
      </button>
    </div>
  );
}
