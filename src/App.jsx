import { useState, useRef } from 'react';
import Background from './components/Background/Background';
import Face from './components/Face/Face';
import EntryScreen from './components/EntryScreen/EntryScreen';
import Hero from './components/Hero/Hero';
import MuteButton from './components/MuteButton/MuteButton';
import SocialLinks from './components/SocialLinks/SocialLinks';
import Cursor from './components/Cursor/Cursor';

export default function App() {
  const [entered, setEntered] = useState(false);
  const audioRef = useRef(null);

  // Called after the EntryScreen exit animation completes.
  // The user gesture (click) is still active at this point,
  // so browser autoplay policy allows audio.play().
  const handleEnter = () => {
    setEntered(true);
    audioRef.current?.play().catch(() => {
      // Silently ignore if no audio file is present yet
    });
  };

  return (
    <>
      {/* Place your track at public/music.mp3 */}
      <audio ref={audioRef} src="/music.mp3" loop preload="auto" />

      {/* z-index 0: CRT noise canvas            */}
      <Background />

      {/* z-index 1/2: globe + face — only after entering */}
      {entered && <Face />}

      {/* z-index 20: entry overlay              */}
      {!entered && <EntryScreen onEnter={handleEnter} />}

      {/* z-index 10: hero name — bottom-left    */}
      {entered && <Hero />}

      {/* z-index 100: UI chrome                 */}
      {entered && <MuteButton audioRef={audioRef} />}
      {entered && <SocialLinks />}

      {/* z-index 9999: cursor                   */}
      <Cursor />
    </>
  );
}
