

interface IIdleCallbackWindow {
  requestIdleCallback: (callback: () => void, options?: { timeout: number }) => number;
  cancelIdleCallback: (handle: number) => void;
}

const FALLBACK_DELAY_MS = 300;

function getIdleCallbackWindow(): IIdleCallbackWindow | undefined {
  if (typeof window === 'undefined' || typeof (window as unknown as Partial<IIdleCallbackWindow>).requestIdleCallback !== 'function') {
    return undefined;
  }

  return window as unknown as IIdleCallbackWindow;
}

export function scheduleIdleTask(callback: () => void, timeoutMs: number = 2000): number {
  if (typeof window === 'undefined') {
    return -1;
  }

  const idleWindow = getIdleCallbackWindow();

  if (idleWindow) {
    return idleWindow.requestIdleCallback(callback, { timeout: timeoutMs });
  }

  return window.setTimeout(callback, FALLBACK_DELAY_MS);
}

export function cancelIdleTask(handle: number): void {
  if (typeof window === 'undefined' || handle === -1) {
    return;
  }

  const idleWindow = getIdleCallbackWindow();

  if (idleWindow) {
    idleWindow.cancelIdleCallback(handle);
    return;
  }

  window.clearTimeout(handle);
}
