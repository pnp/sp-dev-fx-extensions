import * as React from "react";
import DOMPurify from 'dompurify';
import { MessageBar, MessageBarType, DefaultPalette } from '@fluentui/react';
import { PlayRegular, PauseRegular } from '@fluentui/react-icons';
import INewsTickerProps from "./INewsTickerProps";
import Constants from "../helpers/Constants";
import styles from './NewsTicker.module.scss';
import Ticker from "./react-ticker";
import { News } from "../models/News";

const NewsTicker: React.FC<INewsTickerProps> = React.memo(({
  bgColor = DefaultPalette.themePrimary,
  textColor = DefaultPalette.white,
  items,
  speed = 20,
  direction = 'left',
  pauseOnHover = true,
  showDate = true,
  dateFormat = 'short',
  maxItems = 10,
  onClick,
  locale = navigator.language || 'en-US',
  respectMotionPreference = true
}) => {
  const [isMove, setIsMove] = React.useState<boolean>(true);
  const [isPaused, setIsPaused] = React.useState<boolean>(false);
  
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState<boolean>(false);
  
  React.useEffect(() => {
    if (!respectMotionPreference) {
      setPrefersReducedMotion(false);
      return;
    }
    
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    
    setPrefersReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [respectMotionPreference]);

  const formatDate = React.useCallback((date: Date): string => {
    if (!showDate) return '';
    
    let options: Intl.DateTimeFormatOptions;
    switch (dateFormat) {
      case 'short':
        options = { month: 'numeric', day: 'numeric', year: 'numeric' };
        break;
      case 'medium':
        options = { month: 'short', day: 'numeric', year: 'numeric' };
        break;
      case 'long':
        options = { month: 'long', day: 'numeric', year: 'numeric' };
        break;
      default:
        options = { month: 'numeric', day: 'numeric', year: 'numeric' };
        break;
    }
    
    return new Intl.DateTimeFormat(locale, options).format(date);
  }, [showDate, dateFormat, locale]);
  
  const sanitizeContent = React.useCallback((content: string): string => {
    return DOMPurify.sanitize(content, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
  }, []);

  const handleMouseEnter = React.useCallback(() => {
    if (pauseOnHover && !prefersReducedMotion) {
      setIsMove(false);
    }
  }, [pauseOnHover, prefersReducedMotion]);
  
  const handleMouseLeave = React.useCallback(() => {
    if (pauseOnHover && !isPaused) {
      setIsMove(true);
    }
  }, [pauseOnHover, isPaused]);
  
  
  const handleNewsClick = React.useCallback((news: News) => {
    if (onClick) {
      onClick(news);
    }
  }, [onClick]);

  const displayItems = React.useMemo(() => {
    return items?.slice(0, maxItems) || [];
  }, [items, maxItems]);
  
  const containerStyle = React.useMemo(() => ({
    '--bg-color': bgColor,
    '--text-color': textColor,
    backgroundColor: bgColor,
    color: textColor
  } as React.CSSProperties), [bgColor, textColor]);

  if (!displayItems.length) {
    return (
      <MessageBar messageBarType={MessageBarType.info}>
        No news items to display
      </MessageBar>
    );
  }
  
  return (
    <div
      id={Constants.ROOT_ID}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={styles.container}
      style={containerStyle}
    >
      <div className={styles.tickerWrapper}>
        <Ticker 
          isMove={isMove && !prefersReducedMotion} 
          speed={prefersReducedMotion ? 0 : speed}
          direction={direction}
        >
          {displayItems.map((news, index) => (
            <React.Fragment key={`${news.title}-${index}`}>
              {index > 0 && (
                <span className={styles.tickerSeparator}>
                  |
                </span>
              )}
              <span 
                className={`${styles.tickerItem} ${onClick ? styles.clickable : ''}`}
                onClick={() => handleNewsClick(news)}
              >
                {showDate && (
                  <>
                    <strong>{formatDate(news.publishDate)}</strong>
                    <span>: </span>
                  </>
                )}
                <span>{sanitizeContent(news.content)}</span>
              </span>
            </React.Fragment>
          ))}
        </Ticker>
      </div>
      
      {!prefersReducedMotion && (
        <button 
          className={styles.controlButton}
          onClick={() => {
            setIsPaused(prev => {
              const newPaused = !prev;
              setIsMove(!newPaused);
              return newPaused;
            });
          }}
          title={isPaused ? 'Play' : 'Pause'}
        >
          {isPaused ? <PlayRegular /> : <PauseRegular />}
        </button>
      )}
    </div>
  );
});

NewsTicker.displayName = 'NewsTicker';

export default NewsTicker;
