import * as React from "react";
import styles from './react-ticker.module.scss'; // Import the SCSS module

interface TickerProps {
  speed?: number;
  isMove: boolean;
  children: React.ReactNode;
}

const Ticker: React.FC<TickerProps> = ({ speed = 5, isMove, children }) => {
  const tickerRef = React.useRef<HTMLDivElement | null>(null);
  const [tickerWidth, setTickerWidth] = React.useState<number>(0);
  const [containerWidth, setContainerWidth] = React.useState<number>(0);

  React.useEffect(() => {
    if (tickerRef.current) {
      const updateDimensions = () => {
        setTickerWidth(tickerRef.current!.scrollWidth);
        setContainerWidth(tickerRef.current!.clientWidth);
      };

      updateDimensions(); // Set initial dimensions

      // Add window resize listener for responsiveness
      window.addEventListener('resize', updateDimensions);

      // Cleanup on component unmount
      return () => window.removeEventListener('resize', updateDimensions);
    }
  }, [children]); // Recalculate dimensions when children change

  const animationDuration = React.useMemo(() => {
    if (tickerWidth === 0 || containerWidth === 0) return 'none'; // Avoid division by zero

    const totalDuration = tickerWidth > containerWidth
      ? speed * (tickerWidth / containerWidth)
      : speed * 5; // Minimum duration for small content

    return isMove ? `${totalDuration}s` : "none";
  }, [isMove, speed, tickerWidth, containerWidth]);

  return (
    <div className={styles.tickerContainer}>
      <div
        ref={tickerRef}
        className={styles.tickerContent}
        style={{ 
          animation: isMove ? `ticker ${animationDuration} linear infinite` : "none"
        }}
      >
        {children}
      </div>
      <style>{`
        @keyframes ticker {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
      `}</style>
    </div>
  );
};

export default Ticker;
