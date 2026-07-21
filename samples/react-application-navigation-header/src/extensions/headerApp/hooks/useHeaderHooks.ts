import * as React from 'react';

export function useLazyReady(): boolean {
  const [isReady, setIsReady] = React.useState<boolean>(false);

  React.useEffect(() => {
    let frameHandle: number | undefined;
    let timeoutHandle: number | undefined;

    frameHandle = window.requestAnimationFrame(() => {
      if (timeoutHandle !== undefined) {
        window.clearTimeout(timeoutHandle);
        timeoutHandle = undefined;
      }
      setIsReady(true);
    });

    timeoutHandle = window.setTimeout(() => {
      if (frameHandle !== undefined) {
        window.cancelAnimationFrame(frameHandle);
        frameHandle = undefined;
      }
      setIsReady(true);
    }, 200);

    return () => {
      if (frameHandle !== undefined) {
        window.cancelAnimationFrame(frameHandle);
      }
      if (timeoutHandle !== undefined) {
        window.clearTimeout(timeoutHandle);
      }
    };
  }, []);

  return isReady;
}

export function useScrollCondensed(threshold: number = 24): boolean {
  const [isCondensed, setIsCondensed] = React.useState<boolean>(false);

  React.useEffect(() => {
    let scrollFrame: number | undefined;

    const handleScroll = (): void => {
      if (scrollFrame !== undefined) {
        return;
      }

      scrollFrame = window.requestAnimationFrame(() => {
        scrollFrame = undefined;
        setIsCondensed(window.scrollY > threshold);
      });
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);

      if (scrollFrame !== undefined) {
        window.cancelAnimationFrame(scrollFrame);
      }
    };
  }, [threshold]);

  return isCondensed;
}

export function useDocumentTitle(): string {
  const [title, setTitle] = React.useState<string>(() => (typeof document !== 'undefined' ? document.title : ''));

  React.useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    setTitle(document.title);

    let observer: MutationObserver | undefined;
    let retryTimer: number | undefined;

    const attach = (target: Element): void => {
      observer = new MutationObserver(() => {
        setTitle(document.title);
      });
      observer.observe(target, {
        childList: true,
        characterData: true,
        subtree: true
      });
    };

    const titleElement = document.querySelector('title');
    if (titleElement) {
      attach(titleElement);
    } else {

      retryTimer = window.setTimeout(() => {
        retryTimer = undefined;
        const laterTitle = document.querySelector('title');
        if (laterTitle) {
          attach(laterTitle);
        }
      }, 500);
    }

    return () => {
      if (retryTimer !== undefined) {
        window.clearTimeout(retryTimer);
      }
      observer?.disconnect();
    };
  }, []);

  return title;
}
