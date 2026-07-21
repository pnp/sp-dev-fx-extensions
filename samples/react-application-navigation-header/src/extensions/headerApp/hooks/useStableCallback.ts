import * as React from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useStableCallback<T extends (...args: any[]) => any>(callback: T): T {
  const ref = React.useRef<T>(callback);

  React.useLayoutEffect(() => {
    ref.current = callback;
  });

  return React.useCallback(
    (...args: Parameters<T>): ReturnType<T> => ref.current(...args) as ReturnType<T>,
    []
  ) as T;
}