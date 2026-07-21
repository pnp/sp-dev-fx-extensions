import * as React from 'react';

export function useDebouncedCallback<T extends (...args: never[]) => unknown>(callback: T, delay: number): T {
  const callbackRef = React.useRef<T>(callback);
  const timeoutRef = React.useRef<number | undefined>(undefined);

  React.useEffect(() => {
    callbackRef.current = callback;
  });

  const debounced = React.useCallback(
    (...args: Parameters<T>): void => {
      if (timeoutRef.current !== undefined) {
        window.clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = window.setTimeout(() => {
        timeoutRef.current = undefined;
        callbackRef.current(...args);
      }, delay);
    },
    [delay]
  );

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current !== undefined) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debounced as T;
}