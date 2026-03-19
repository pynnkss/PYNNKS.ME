import { useState, useRef } from 'react';
import Background from './components/Background/Background';
import Face from './components/Face/Face';
import EntryScreen from './components/EntryScreen/EntryScreen';
import Hero from './components/Hero/Hero';
import MuteButton from './components/MuteButton/MuteButton';
import SocialLinks from './components/SocialLinks/SocialLinks';
import Cursor from './components/Cursor/Cursor';
import Preloader from './components/Preloader/Preloader';
import ThemeToggle from './components/ThemeToggle/ThemeToggle';
import useAudioAnalyzer from './hooks/useAudioAnalyzer';

export default function App() {
  const [loaded, setLoaded] = useState(false);
  const [entered, setEntered] = useState(false);
  const audioRef = useRef(null);
  const { setup: setupAnalyzer } = useAudioAnalyzer(audioRef);

  const handleEnter = () => {
    // Setup audio analyzer BEFORE play — must be within user gesture context
    setupAnalyzer();
    setEntered(true);
    audioRef.current?.play().catch(() => {});
  };

  return (
    <>
      {/* Place your track at public/music.mp3 */}
      <audio ref={audioRef} src="/music.mp3" loop preload="auto" />

      {/* z-index 30: preloader — boot sequence */}
      {!loaded && <Preloader onComplete={() => setLoaded(true)} audioRef={audioRef} />}

      {/* z-index 0: CRT noise canvas            */}
      <Background />

      {/* z-index 1/2: globe + face — only after entering */}
      {entered && <Face />}

      {/* z-index 20: entry overlay              */}
      {loaded && !entered && <EntryScreen onEnter={handleEnter} />}

      {/* z-index 10: hero name — bottom-left    */}
      {entered && <Hero />}

      {/* z-index 100: UI chrome                 */}
      {entered && <MuteButton audioRef={audioRef} />}
      {entered && <SocialLinks />}
      <ThemeToggle />

      {/* z-index 9999: cursor                   */}
      <Cursor />
    </>
  );
}
