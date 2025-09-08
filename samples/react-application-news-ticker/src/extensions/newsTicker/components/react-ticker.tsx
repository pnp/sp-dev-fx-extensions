import * as React from "react";
import styles from './react-ticker.module.scss';

interface TickerProps {
  speed?: number;
  isMove: boolean;
  direction?: 'left' | 'right';
  children: React.ReactNode;
}

const Ticker: React.FC<TickerProps> = React.memo(({ speed = 5, isMove, direction = 'left', children }) => {
  const tickerRef = React.useRef<HTMLDivElement | null>(null);
  const [tickerWidth, setTickerWidth] = React.useState<number>(0);
  const [containerWidth, setContainerWidth] = React.useState<number>(0);

  const updateDimensions = React.useCallback(() => {
    if (tickerRef.current) {
      setTickerWidth(tickerRef.current.scrollWidth);
      setContainerWidth(tickerRef.current.clientWidth);
    }
  }, []);
  
  React.useEffect(() => {
    updateDimensions();
    
    let resizeTimeout: number;
    const debouncedResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = window.setTimeout(updateDimensions, 100);
    };
    
    window.addEventListener('resize', debouncedResize);
    return () => {
      window.removeEventListener('resize', debouncedResize);
      clearTimeout(resizeTimeout);
    };
  }, [children, updateDimensions]);

  const animationStyles = React.useMemo(() => {
    const totalDuration = tickerWidth > containerWidth
      ? speed * (tickerWidth / containerWidth)
      : speed * 3;

    const playState = (tickerWidth === 0 || containerWidth === 0 || !isMove) ? 'paused' : 'running';

    return {
      '--animation-duration': `${totalDuration}s`,
      '--animation-direction': direction === 'right' ? 'reverse' : 'normal',
      '--animation-play-state': playState
    } as React.CSSProperties;
  }, [isMove, speed, tickerWidth, containerWidth, direction]);

  return (
    <div className={styles.tickerContainer}>
      <div
        ref={tickerRef}
        className={`${styles.tickerContent} ${!isMove ? styles.paused : ''}`}
        style={animationStyles}
      >
        {children}
      </div>
    </div>
  );
});

Ticker.displayName = 'Ticker';

export default Ticker;
