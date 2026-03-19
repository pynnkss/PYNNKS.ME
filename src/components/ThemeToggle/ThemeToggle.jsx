import { useTheme } from '../../context/ThemeContext';
import styles from './ThemeToggle.module.css';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button className={styles.btn} onClick={toggleTheme} aria-label="Toggle theme">
      [{theme === 'dark' ? 'DARK' : 'LITE'}]
    </button>
  );
}
