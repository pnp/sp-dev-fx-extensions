// Ensure window.location has predictable values for tests. jsdom v29 makes
// location non-configurable and non-writable, so we define a full URL object.
try {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const win = window as any;

  const locationProps = {
    origin: { value: 'https://localhost', configurable: true, writable: true },
    href: { value: 'https://localhost/', configurable: true, writable: true },
    pathname: { value: '/', configurable: true, writable: true },
    search: { value: '', configurable: true, writable: true },
    hash: { value: '', configurable: true, writable: true },
    protocol: { value: 'https:', configurable: true, writable: true },
    host: { value: 'localhost', configurable: true, writable: true },
    hostname: { value: 'localhost', configurable: true, writable: true },
    port: { value: '', configurable: true, writable: true }
  };

  try {
    Object.defineProperties(win.location, locationProps);
  } catch {
    // If defineProperties fails, replace the whole location object
    const newLocation = {};
    for (const key of Object.keys(locationProps)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (newLocation as any)[key] = (locationProps as any)[key].value;
    }
    try { delete win.location; } catch { /* ignore */ }
    win.location = newLocation;
  }
} catch {
  // If all else fails, tests that need window.location will rely on jsdom defaults.
}