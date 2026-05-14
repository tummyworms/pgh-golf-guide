/*
 * The Guide to Pittsburgh Golf — Animation runtime
 * ------------------------------------------------
 * - IntersectionObserver-driven scroll reveals (.is-in)
 * - Stagger index assignment for grid children (--i)
 * - Header shrink on scroll
 * - Re-observes nodes added by Firestore real-time listeners
 *   (post cards, course table rows are rendered async)
 */

(function () {
  'use strict';

  if (window.__pghAnimReady) return;
  window.__pghAnimReady = true;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ─── Reveal observer ──────────────────────────────────
  const REVEAL_SELECTORS = [
    '.section-head',
    '.post-card',
    '.sponsor-slot',
    '.slogan-strip',
    '.newsletter-section',
    '.contact-grid',
    '.post-article',
    '.course-table tbody tr',
    'footer',
    '.reveal',
    '.reveal-stagger',
  ];

  const io = ('IntersectionObserver' in window)
    ? new IntersectionObserver((entries, obs) => {
        for (const ent of entries) {
          if (ent.isIntersecting) {
            ent.target.classList.add('is-in');
            obs.unobserve(ent.target);
          }
        }
      }, {
        rootMargin: '0px 0px -8% 0px',
        threshold: 0.08,
      })
    : null;

  function assignStagger(parentSelector, childSelector) {
    document.querySelectorAll(parentSelector).forEach(parent => {
      const kids = parent.querySelectorAll(childSelector);
      kids.forEach((kid, i) => {
        if (!kid.style.getPropertyValue('--i')) {
          kid.style.setProperty('--i', i % 12); // cap so it doesn't get huge
        }
      });
    });
  }

  function observeAll() {
    if (!io || prefersReduced) {
      // Just mark everything visible immediately
      REVEAL_SELECTORS.forEach(sel => {
        document.querySelectorAll(sel).forEach(el => el.classList.add('is-in'));
      });
      return;
    }
    REVEAL_SELECTORS.forEach(sel => {
      document.querySelectorAll(sel).forEach(el => {
        if (!el.classList.contains('is-in')) io.observe(el);
      });
    });
  }

  function refreshAnimations() {
    // Assign --i for staggered children
    assignStagger('.post-grid', '.post-card');
    assignStagger('.sponsor-grid', '.sponsor-slot');
    assignStagger('.course-table tbody', 'tr');
    assignStagger('.contact-grid', '.contact-info, .form-card');
    // Re-observe any new nodes
    observeAll();
  }

  // ─── Header drop-in already handled in CSS; no scroll listener needed ──
  // ─── Watch for dynamically-rendered content ───────────
  // The site uses Firestore onSnapshot to inject post cards and course
  // table rows after initial load. A MutationObserver re-runs
  // refreshAnimations whenever those containers get new children.
  function watchDynamicContainers() {
    const containers = [
      '#latestPosts',
      '#postGrid',
      '#courseTableBody',
    ];
    const mo = new MutationObserver(() => {
      // Microtask-defer so layout settles
      requestAnimationFrame(refreshAnimations);
    });
    containers.forEach(sel => {
      const el = document.querySelector(sel);
      if (el) mo.observe(el, { childList: true });
    });
  }

  // ─── Boot ─────────────────────────────────────────────
  function init() {
    document.documentElement.classList.add('anim-ready');
    refreshAnimations();
    watchDynamicContainers();
    setupHeaderEasterEgg();
  }

  // ─── Easter egg: golf ball rolls along the header border every so often ──
  function setupHeaderEasterEgg() {
    if (prefersReduced) return;
    const header = document.querySelector('.site-header');
    if (!header) return;
    // Avoid duplicate balls if init is somehow run twice
    if (header.querySelector('.header-golf-ball')) return;

    const ball = document.createElement('span');
    ball.className = 'header-golf-ball';
    ball.setAttribute('aria-hidden', 'true');
    header.appendChild(ball);

    function rollOnce() {
      ball.classList.remove('is-rolling');
      // Force reflow so the animation restarts cleanly each cycle
      void ball.offsetWidth;
      ball.classList.add('is-rolling');
    }

    function scheduleNext() {
      // 50–140 seconds between rolls — rare enough to feel like a discovery
      const wait = 50000 + Math.random() * 90000;
      setTimeout(() => {
        // Only roll when the page is visible; otherwise wait again
        if (document.visibilityState === 'visible') rollOnce();
        scheduleNext();
      }, wait);
    }

    // First roll between 15 and 30 seconds after load — late enough to feel
    // unprompted, soon enough that a careful eye might catch it.
    setTimeout(() => {
      if (document.visibilityState === 'visible') rollOnce();
      scheduleNext();
    }, 15000 + Math.random() * 15000);
  }


  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose a manual refresh hook in case other scripts need it
  window.pghRefreshAnimations = refreshAnimations;
})();
