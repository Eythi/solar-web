// Runs before React: applies the saved palette and motion setting, then plays the sunrise splash
// from index.html and hands over to the app. Kept tiny and dependency-free on purpose.
(function () {
  var root = document.documentElement;
  var palettes = {
    sun: ['#ffc24b', '#ff4d4d', '#2a0e04'],
    fire: ['#ff2b4a', '#ff7a1f', '#ffffff'],
    sea: ['#ffb23e', '#2fa49a', '#10201d'],
    aurora: ['#8b6cff', '#22d3ee', '#0b0a1a'],
    berry: ['#ff5fa2', '#7b3cff', '#ffffff'],
    moon: ['#e8e8ee', '#6a6a74', '#111114'],
  };
  var palette = null;
  var motion = 'on';
  try {
    palette = palettes[localStorage.getItem('solar.palette')];
    motion = localStorage.getItem('solar.motion') || 'on';
  } catch (e) {
    /* storage unavailable: defaults */
  }
  if (palette) {
    root.style.setProperty('--accent', palette[0]);
    root.style.setProperty('--accent-2', palette[1]);
    root.style.setProperty('--on-accent', palette[2]);
  }
  // "system" follows Windows "Animation effects"; the default is on, since many PCs have them off.
  var off = motion === 'off' || (motion === 'system' && matchMedia('(prefers-reduced-motion: reduce)').matches);
  root.dataset.motion = off ? 'off' : 'on';

  var splash = document.getElementById('boot-splash');
  if (!splash) return;
  // Hard fallback whatever happens below: the splash is gone 5.5 s after start at the latest,
  // and the app (or anything else) can drop it earlier with window.solarHideSplash().
  function drop() {
    root.classList.remove('is-booting');
    if (splash && splash.parentNode) splash.parentNode.removeChild(splash);
  }
  window.solarHideSplash = drop;
  setTimeout(drop, 5500);
  // Started with Windows into the tray (?hidden=1 from the main process): nobody would see it.
  var hidden = /[?&]hidden=1\b/.test(location.search);
  // iPhone: the system launch screen already showed; no 5-second animation on top of it.
  // The capacitor:// scheme (iOS) or the Capacitor bridge itself also count, in case the bridge
  // object isn't fully set up yet when this runs.
  var phone = false;
  try {
    phone =
      location.protocol === 'capacitor:' ||
      Boolean(window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.bridge) ||
      Boolean(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
  } catch (e) {
    phone = location.protocol === 'capacitor:';
  }
  if (phone) root.dataset.motion = 'off';
  if (off || hidden || phone) {
    drop();
    return;
  }
  // About 5 s in all, however fast the app is ready: the sunrise plays to the end, then
  // dissolves over the last 0.7 s (timings match the animations in index.html).
  root.classList.add('is-booting');
  setTimeout(function () {
    splash.classList.add('is-leaving');
    root.classList.remove('is-booting');
  }, 4300);
  setTimeout(drop, 5000);
})();
