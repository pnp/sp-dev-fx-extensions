import * as React from 'react';
import { Button, Tooltip } from '@fluentui/react-components';
import { ArrowUp24Regular } from '@fluentui/react-icons';

import type { IHeaderStrings } from '../models/IHeaderStrings';
import { emitNavigationTelemetry } from '../utils/navigationTelemetry';
import styles from './Utility.module.scss';

export interface IBackToTopProps {
  strings: IHeaderStrings;
  threshold?: number;
}

const BackToTop: React.FC<IBackToTopProps> = (props) => {
  const { strings, threshold = 400 } = props;
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    let frame: number | undefined;

    const handleScroll = (): void => {
      if (frame !== undefined) {
        return;
      }

      frame = window.requestAnimationFrame(() => {
        frame = undefined;
        setIsVisible(window.scrollY > threshold);
      });
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (frame !== undefined) {
        window.cancelAnimationFrame(frame);
      }
    };
  }, [threshold]);

  if (!isVisible) {
    return null;
  }

  return (
    <Tooltip content={strings.BackToTopAriaLabel || 'Back to top'} relationship="label">
      <Button
        className={styles.backToTop}
        icon={<ArrowUp24Regular />}
        appearance="subtle"
        onClick={(): void => {
          emitNavigationTelemetry({
            action: 'back-to-top',
            level: 'service'
          });
          const prefersReducedMotion = typeof window !== 'undefined'
            && window.matchMedia
            && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
          window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
        }}
        title={strings.BackToTopAriaLabel || 'Back to top'}
      />
    </Tooltip>
  );
};

export default React.memo(BackToTop);
