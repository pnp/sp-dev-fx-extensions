import { useCallback, useState } from "react";

/**
 * Custom hook to reliably trigger refreshes.
 */
export function useRefreshTrigger(): [number, () => void] {
  const [trigger, setTrigger] = useState(0);

  const refresh = useCallback(() => {
    setTrigger((prev) => prev + 1);
  }, []);

  return [trigger, refresh];
}