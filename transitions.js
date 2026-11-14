
(() => {
  'use strict';
  const root = document.documentElement;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let active, first = true;
  const mark = () => { try { sessionStorage.setItem('dream-bookshop-seen-v1', '1'); } catch {} };
  const hasSeen = () => { try { return sessionStorage.getItem('dream-bookshop-seen-v1') === '1'; } catch { return false; } };

  if (!motion.matches && !hasSeen()) root.classList.add('dream-boot');

  const endBoot = () => {
    if (!root.classList.contains('dream-boot')) return;
    root.classList.remove('dream-boot');
    mark();
  };
  // Always uncover the page, even if an image or another script stalls.
  const watchdog = setTimeout(endBoot, 2000);
  const release = () => {
    clearTimeout(watchdog);
    endBoot();
  };

  window.dreamTransitions = {
    ready(main) {
      if (!first) return;
      first = false;
      if (!root.classList.contains('dream-boot')) { clearTimeout(watchdog); return; }
      const img = main.querySelector('.night-scene img, .page-atmosphere img');
      if (!img || location.hash === '#shelf') { release(); return; }
      const minimum = new Promise(resolve => setTimeout(resolve, 510));
      const decoded = Promise.resolve().then(() => img.decode()).catch(() => {});
      Promise.all([minimum, decoded]).then(release);
    },
    navigate(update) {
      release();
      active?.skipTransition();
      if (motion.matches || document.hidden) { update(); return; }
      if (typeof document.startViewTransition !== 'function') {
        update();
        document.querySelector('main')?.animate(
          [{opacity: .55, transform: 'translateY(7px)'}, {opacity: 1, transform: 'none'}],
          {duration: 240, easing: 'ease-out'}
        );
        return;
      }
      const transition = document.startViewTransition(update);
      active = transition;
      transition.ready.catch(() => {});
      transition.finished.catch(() => {}).then(() => { if (active === transition) active = null; });
    }
  };
  document.addEventListener('keydown', release, {once:true});
  motion.addEventListener('change', e => { if (e.matches) { release(); active?.skipTransition(); } });
})();
