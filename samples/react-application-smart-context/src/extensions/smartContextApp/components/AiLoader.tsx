import * as React from 'react';
import { Text } from '@fluentui/react';
import styles from './AiLoader.module.scss';

export interface IAiLoaderProps {
  /** Optional custom messages to rotate through */
  messages?: string[];
}

const DEFAULT_MESSAGES = [
  "Analyzing page content...",
  "Connecting the dots across your organization...",
  "Finding relevant context from your emails and chats...",
  "Discovering related people and conversations...",
  "Gathering insights just for you...",
  "Understanding the bigger picture...",
  "Weaving together your personal context...",
  "Almost there, crafting your Smart Context..."
];

export const AiLoader: React.FC<IAiLoaderProps> = (props) => {
  const messages = props.messages || DEFAULT_MESSAGES;
  const [currentMessageIndex, setCurrentMessageIndex] = React.useState(0);
  const [isVisible, setIsVisible] = React.useState(true);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      
      setTimeout(() => {
        setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
        setIsVisible(true);
      }, 300);
    }, 3000);

    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <div className={styles.aiLoaderContainer}>
      {/* Solar System / Planetary Animation */}
      <div className={styles.solarSystem}>
        {/* Central AI Core (Sun) */}
        <div className={styles.aiCore}>
          <div className={styles.coreInner} />
          <div className={styles.coreGlow} />
        </div>
        
        {/* Orbiting Planets - Main Orbit */}
        <div className={styles.orbitRing}>
          {/* Planet 1 - Purple (Large) */}
          <div className={`${styles.planet} ${styles.planet1} ${styles.large}`}>
            <div className={styles.planetCore} />
          </div>
          
          {/* Planet 2 - Cyan (Large) */}
          <div className={`${styles.planet} ${styles.planet2} ${styles.large}`}>
            <div className={styles.planetCore} />
          </div>
          
          {/* Planet 3 - Pink (Large) */}
          <div className={`${styles.planet} ${styles.planet3} ${styles.large}`}>
            <div className={styles.planetCore} />
          </div>
        </div>
        
        {/* Inner Orbit - Smaller planets */}
        <div className={styles.innerOrbit}>
          {/* Small Planet 1 - Blue */}
          <div className={`${styles.planet} ${styles.planet4} ${styles.small}`}>
            <div className={styles.planetCore} />
          </div>
          
          {/* Small Planet 2 - Orange */}
          <div className={`${styles.planet} ${styles.planet5} ${styles.small}`}>
            <div className={styles.planetCore} />
          </div>
          
          {/* Small Planet 3 - Green */}
          <div className={`${styles.planet} ${styles.planet6} ${styles.small}`}>
            <div className={styles.planetCore} />
          </div>
        </div>
      </div>

      {/* Loading message with fade transition */}
      <div className={styles.messageContainer}>
        <Text 
          className={`${styles.message} ${isVisible ? styles.visible : styles.hidden}`}
          variant="mediumPlus"
        >
          {messages[currentMessageIndex]}
        </Text>
      </div>

      {/* Progress bar instead of dots */}
      <div className={styles.progressBar}>
        <div className={styles.progressFill} />
      </div>
    </div>
  );
};
