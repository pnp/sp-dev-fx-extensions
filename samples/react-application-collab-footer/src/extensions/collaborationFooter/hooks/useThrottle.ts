import { useRef, useCallback, useEffect } from 'react';

/**
 * Custom hook for throttling function calls
 * Ensures functions are called at most once per specified delay
 */
export const useThrottle = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): T => {
  const lastCallTimeRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Store the latest function in a ref to avoid recreating the callback
  const funcRef = useRef(func);
  
  // Update the ref when func changes
  useEffect(() => {
    funcRef.current = func;
  }, [func]);

  const throttledFunc = useCallback((...args: Parameters<T>) => {
    const now = Date.now();
    const timeSinceLastCall = now - lastCallTimeRef.current;

    if (timeSinceLastCall >= delay) {
      // If enough time has passed, call immediately
      lastCallTimeRef.current = now;
      return funcRef.current(...args);
    } else {
      // If not enough time has passed, schedule for later
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        lastCallTimeRef.current = Date.now();
        funcRef.current(...args);
        timeoutRef.current = null;
      }, delay - timeSinceLastCall);
    }
  }, [delay]) as T; // ✅ FIXED: Only depend on delay, not func

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  return throttledFunc;
};

/**
 * Custom hook for debouncing function calls
 * Delays function execution until after delay has passed since last call
 */
export const useDebounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): T => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Store the latest function in a ref to avoid recreating the callback
  const funcRef = useRef(func);
  
  // Update the ref when func changes
  useEffect(() => {
    funcRef.current = func;
  }, [func]);

  const debouncedFunc = useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      funcRef.current(...args);
      timeoutRef.current = null;
    }, delay);
  }, [delay]) as T; // ✅ FIXED: Only depend on delay, not func

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  return debouncedFunc;
};

/**
 * Custom hook for request throttling with automatic cancellation
 * Cancels previous requests when new ones are made
 */
export const useRequestThrottle = <T extends (...args: any[]) => Promise<any>>(
  func: T,
  delay: number = 300
): T => {
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastCallTimeRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Store the latest function in a ref to avoid recreating the callback
  const funcRef = useRef(func);
  
  // Update the ref when func changes
  useEffect(() => {
    funcRef.current = func;
  }, [func]);

  const throttledFunc = useCallback(async (...args: Parameters<T>) => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const now = Date.now();
    const timeSinceLastCall = now - lastCallTimeRef.current;

    if (timeSinceLastCall >= delay) {
      // If enough time has passed, call immediately
      lastCallTimeRef.current = now;
      abortControllerRef.current = new AbortController();
      
      try {
        return await funcRef.current(...args);
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          throw error;
        }
      } finally {
        abortControllerRef.current = null;
      }
    } else {
      // If not enough time has passed, schedule for later
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      return new Promise((resolve, reject) => {
        timeoutRef.current = setTimeout(async () => {
          lastCallTimeRef.current = Date.now();
          abortControllerRef.current = new AbortController();
          
          try {
            const result = await funcRef.current(...args);
            resolve(result);
          } catch (error) {
            if ((error as Error).name !== 'AbortError') {
              reject(error);
            }
          } finally {
            abortControllerRef.current = null;
            timeoutRef.current = null;
          }
        }, delay - timeSinceLastCall);
      });
    }
  }, [delay]) as T; // ✅ FIXED: Only depend on delay, not func

  // Cleanup timeout and abort controller on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, []);

  return throttledFunc;
};