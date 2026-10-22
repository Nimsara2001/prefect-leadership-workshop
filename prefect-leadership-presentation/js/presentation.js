/*
 * Prefect Leadership Presentation: navigation and interaction logic.
 * Vanilla JavaScript, no dependencies, works from file://.
 *
 * Structure:
 *   1. Config (section timing)
 *   2. State and element references
 *   3. Navigation (goTo, hash, progress, footer)
 *   4. Overlays (help, grid) and notes panel
 *   5. Timers and reveal panels
 *   6. Input (keyboard, touch, wheel, buttons)
 *   7. Init
 */
(() => {
  'use strict';

  /* ---------- 1. Config ---------- */

  // Planned minutes per section. Edit here AND the data-minutes values on slides;
  // the script checks that both agree and that the total is 120.
  const SECTIONS = {
    A: { name: 'Opening and Introduction', minutes: 10 },
    B: { name: 'Understanding Leadership', minutes: 40 },
    C: { name: 'Break', minutes: 5 },
    D: { name: 'Balancing Leadership and Studies', minutes: 35 },
    E: { name: 'Weekly Planning Activity', minutes: 20 },
    F: { name: 'Reflection and Closing', minutes: 10 },
  };
  const TOTAL_MINUTES = 120;

  /* ---------- 2. State and elements ---------- */

  const $ = (id) => document.getElementById(id);
  const stage = $('stage');
  const slides = Array.from(stage.querySelectorAll(':scope > .slide'));
  const total = slides.length;
  const visited = new Set();
  let current = -1;

  const el = {
    progress: $('progressBar'),
    footCur: $('footCur'),
    footTot: $('footTot'),
    footSec: $('footSec'),
    secMap: $('secMap'),
    status: $('sr-status'),
    ui: $('ui'),
    btnPrev: $('btnPrev'),
    btnNext: $('btnNext'),
    btnGrid: $('btnGrid'),
    btnNotes: $('btnNotes'),
    btnFull: $('btnFull'),
    btnHelp: $('btnHelp'),
    notesPanel: $('notesPanel'),
    npMeta: $('npMeta'),
    npTitle: $('npTitle'),
    npBody: $('npBody'),
    npClose: $('npClose'),
    grid: $('gridOverlay'),
    gridList: $('gridList'),
    help: $('helpOverlay'),
  };

  const pad = (n) => String(n).padStart(2, '0');
  const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));

  // Planned clock (minutes elapsed at the start of each slide).
  const startMinute = [];
  (function computeClock() {
    let acc = 0;
    slides.forEach((s, i) => {
      startMinute[i] = acc;
      acc += Number(s.dataset.minutes) || 0;
    });
  })();

  function validateTiming() {
    const sums = {};
    slides.forEach((s) => {
      sums[s.dataset.section] = (sums[s.dataset.section] || 0) + (Number(s.dataset.minutes) || 0);
    });
    let grand = 0;
    Object.keys(SECTIONS).forEach((k) => {
      grand += sums[k] || 0;
      if ((sums[k] || 0) !== SECTIONS[k].minutes) {
        console.warn(`Section ${k}: slides add up to ${sums[k] || 0} min, config says ${SECTIONS[k].minutes}.`);
      }
    });
    if (grand !== TOTAL_MINUTES) {
      console.warn(`Planned total is ${grand} minutes, expected ${TOTAL_MINUTES}.`);
    }
  }

  /* ---------- 3. Navigation ---------- */

  function parseHash() {
    const m = /^#\/?(\d+)$/.exec(window.location.hash);
    if (!m) return 0;
    return clamp(parseInt(m[1], 10) - 1, 0, total - 1);
  }

  function goTo(index) {
    const next = clamp(index, 0, total - 1);
    if (next === current) return;
    current = next;

    slides.forEach((s, i) => {
      const active = i === current;
      s.classList.toggle('is-active', active);
      s.classList.toggle('is-before', i < current);
      s.classList.toggle('is-after', i > current);
      s.setAttribute('aria-hidden', active ? 'false' : 'true');
      if (active) s.removeAttribute('inert'); else s.setAttribute('inert', '');
    });

    // Play entrance animations only the first time a slide is shown.
    const slide = slides[current];
    if (!visited.has(current)) {
      visited.add(current);
      slide.classList.add('enter');
    }

    stage.classList.toggle('on-light', slide.classList.contains('light'));
    updateChrome();
    updateNotes();
    history.replaceState(null, '', '#' + (current + 1));
    el.status.textContent = `Slide ${current + 1} of ${total}: ${slide.dataset.title}`;
    el.btnPrev.disabled = current === 0;
    el.btnNext.disabled = current === total - 1;
  }

  const next = () => goTo(current + 1);
  const prev = () => goTo(current - 1);

  function buildSectionMap() {
    el.secMap.textContent = '';
    Object.keys(SECTIONS).forEach((k) => {
      const seg = document.createElement('i');
      seg.dataset.sec = k;
      seg.style.flexGrow = SECTIONS[k].minutes;
      el.secMap.appendChild(seg);
    });
  }

  function updateChrome() {
    const slide = slides[current];
    const key = slide.dataset.section;
    const sec = SECTIONS[key];
    el.footCur.textContent = pad(current + 1);
    el.footTot.textContent = pad(total);
    el.footSec.textContent = `${key} · ${sec.name} · ${sec.minutes} min`;
    el.progress.style.transform = `scaleX(${total > 1 ? current / (total - 1) : 1})`;
    el.secMap.querySelectorAll('i').forEach((seg) => {
      seg.classList.toggle('on', seg.dataset.sec === key);
    });
  }

  /* ---------- 4. Overlays and notes ---------- */

  let openOverlay = null;
  let lastFocus = null;

  function showOverlay(node) {
    if (openOverlay) hideOverlay();
    lastFocus = document.activeElement;
    openOverlay = node;
    node.hidden = false;
    const target = node.querySelector('[data-close]') || node;
    target.focus({ preventScroll: true });
  }

  function hideOverlay() {
    if (!openOverlay) return;
    openOverlay.hidden = true;
    openOverlay = null;
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }

  function trapFocus(e) {
    if (!openOverlay || e.key !== 'Tab') return;
    const f = openOverlay.querySelectorAll('button, [href], [tabindex]:not([tabindex="-1"])');
    if (!f.length) return;
    const first = f[0];
    const last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  function toggleHelp() {
    if (openOverlay === el.help) hideOverlay(); else showOverlay(el.help);
  }

  // Overview grid: thumbnails are scaled clones of the slides, built on first use.
  let gridBuilt = false;
  function buildGrid() {
    if (gridBuilt) return;
    gridBuilt = true;
    slides.forEach((s, i) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'thumb';
      btn.dataset.i = String(i);
      btn.setAttribute('aria-label', `Go to slide ${i + 1}: ${s.dataset.title}`);

      const frame = document.createElement('span');
      frame.className = 'thumb-frame';
      const clone = s.cloneNode(true);
      clone.querySelectorAll('.notes').forEach((n) => n.remove());
      clone.className = 'slide thumb-slide ' + (s.classList.contains('light') ? 'light' : s.classList.contains('alt') ? 'alt' : '');
      clone.removeAttribute('aria-roledescription');
      clone.setAttribute('inert', '');
      clone.setAttribute('aria-hidden', 'true');
      frame.appendChild(clone);

      const cap = document.createElement('span');
      cap.className = 'thumb-cap';
      cap.textContent = `${i + 1}. ${s.dataset.title}`;
      btn.append(frame, cap);
      el.gridList.appendChild(btn);
    });
    el.gridList.addEventListener('click', (e) => {
      const b = e.target.closest('.thumb');
      if (!b) return;
      goTo(Number(b.dataset.i));
      hideOverlay();
    });
  }

  function scaleThumbs() {
    const f = el.gridList.querySelector('.thumb-frame');
    if (f && f.clientWidth) el.gridList.style.setProperty('--ts', String(f.clientWidth / 1920));
  }

  function toggleGrid() {
    if (openOverlay === el.grid) { hideOverlay(); return; }
    buildGrid();
    showOverlay(el.grid);
    scaleThumbs();
    const t = el.gridList.querySelector(`.thumb[data-i="${current}"]`);
    if (t) { t.focus({ preventScroll: false }); }
  }

  function gridArrowKeys(e) {
    const thumbs = Array.from(el.gridList.querySelectorAll('.thumb'));
    const idx = thumbs.indexOf(document.activeElement);
    if (idx < 0) return false;
    const cols = Math.max(1, Math.round(el.gridList.clientWidth / (thumbs[0].offsetWidth || 1)));
    const delta = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: cols, ArrowUp: -cols }[e.key];
    if (!delta) return false;
    e.preventDefault();
    const target = thumbs[clamp(idx + delta, 0, thumbs.length - 1)];
    target.focus();
    return true;
  }

  // Speaker notes (presenter-only panel).
  function updateNotes() {
    const s = slides[current];
    const sec = SECTIONS[s.dataset.section];
    el.npMeta.textContent = `Slide ${current + 1} of ${total} · Section ${s.dataset.section}: ${sec.name} · ~${s.dataset.minutes} min · planned clock ${startMinute[current]} min`;
    el.npTitle.textContent = s.dataset.title;
    const n = s.querySelector('.notes');
    el.npBody.innerHTML = n ? n.innerHTML : '<p>No notes for this slide.</p>';
    el.npBody.scrollTop = 0;
  }

  function toggleNotes(force) {
    const show = typeof force === 'boolean' ? force : el.notesPanel.hidden;
    el.notesPanel.hidden = !show;
    el.btnNotes.setAttribute('aria-pressed', String(show));
  }

  /* ---------- 5. Timers and reveals ---------- */

  const timers = [];

  function createTimer(root) {
    const total = Number(root.dataset.timer) * 1000;
    const display = root.querySelector('.timer-display');
    let remaining = total;
    let endAt = 0;
    let handle = null;

    const fmt = (ms) => {
      const sec = Math.ceil(ms / 1000);
      return `${pad(Math.floor(sec / 60))}:${pad(sec % 60)}`;
    };
    const render = () => { display.textContent = fmt(remaining); };

    function tick() {
      remaining = Math.max(0, endAt - Date.now());
      render();
      if (remaining === 0) {
        stop();
        root.classList.add('done');
        el.status.textContent = 'Timer finished';
      }
    }
    function start() {
      if (handle !== null || remaining === 0) return;
      endAt = Date.now() + remaining;
      handle = window.setInterval(tick, 250);
      root.classList.add('running');
      root.classList.remove('done');
    }
    function stop() {
      if (handle !== null) {
        window.clearInterval(handle);
        handle = null;
        // Capture the exact remaining time at the moment of pausing.
        remaining = Math.max(0, endAt - Date.now());
        render();
      }
      root.classList.remove('running');
    }
    function reset() {
      stop();
      remaining = total;
      root.classList.remove('done');
      render();
    }
    function toggle() { if (handle === null) start(); else stop(); }

    root.addEventListener('click', (e) => {
      const b = e.target.closest('button[data-action]');
      if (!b) return;
      ({ start, pause: stop, reset })[b.dataset.action]();
    });

    render();
    return { root, toggle, destroy: stop };
  }

  function initTimers() {
    stage.querySelectorAll('[data-timer]').forEach((r) => timers.push(createTimer(r)));
  }

  function toggleSlideTimer() {
    const t = timers.find((x) => slides[current].contains(x.root));
    if (t) t.toggle();
  }

  // Reveal buttons show or hide the matching panel on the same slide.
  function setReveal(btn, show) {
    const slide = btn.closest('.slide');
    const panel = slide.querySelector(`[data-panel="${btn.dataset.reveal}"]`);
    if (!panel) return;
    panel.hidden = !show;
    btn.setAttribute('aria-expanded', String(show));
    btn.querySelector('span').textContent = show
      ? btn.querySelector('span').textContent.replace(/^Show/, 'Hide')
      : btn.querySelector('span').textContent.replace(/^Hide/, 'Show');
  }

  function initReveals() {
    stage.addEventListener('click', (e) => {
      const b = e.target.closest('.reveal-btn');
      if (!b) return;
      setReveal(b, b.getAttribute('aria-expanded') !== 'true');
    });
  }

  function toggleSlideReveal() {
    const b = slides[current].querySelector('.reveal-btn');
    if (b) setReveal(b, b.getAttribute('aria-expanded') !== 'true');
  }

  /* ---------- 6. Input ---------- */

  function isEditable(t) {
    return !!t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));
  }

  function toggleFullscreen() {
    if (document.fullscreenElement) {
      document.exitFullscreen && document.exitFullscreen();
    } else if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  }

  function onKeyDown(e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (isEditable(e.target)) return;
    if (openOverlay) trapFocus(e);

    const key = e.key;

    if (key === 'Escape') {
      if (openOverlay) { e.preventDefault(); hideOverlay(); }
      else if (!el.notesPanel.hidden) { toggleNotes(false); }
      return; // Escape also exits fullscreen natively
    }

    if (openOverlay === el.grid && gridArrowKeys(e)) return;
    if (openOverlay) {
      if (key === '?' ) { e.preventDefault(); toggleHelp(); }
      return;
    }

    const onButton = e.target.closest && e.target.closest('button, a, summary');
    switch (key) {
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault(); next(); break;
      case ' ':
      case 'Spacebar':
        if (onButton) return; // let focused buttons activate normally
        e.preventDefault(); next(); break;
      case 'ArrowLeft':
      case 'ArrowUp':
      case 'Backspace':
        e.preventDefault(); prev(); break;
      case 'Home': e.preventDefault(); goTo(0); break;
      case 'End': e.preventDefault(); goTo(total - 1); break;
      case 'f': case 'F': e.preventDefault(); toggleFullscreen(); break;
      case 'n': case 'N': e.preventDefault(); toggleNotes(); break;
      case 'g': case 'G': e.preventDefault(); toggleGrid(); break;
      case 't': case 'T': e.preventDefault(); toggleSlideTimer(); break;
      case 'r': case 'R': e.preventDefault(); toggleSlideReveal(); break;
      case '?': e.preventDefault(); toggleHelp(); break;
      default: break;
    }
  }

  // Touch swipe (horizontal).
  let touch = null;
  function onTouchStart(e) {
    if (openOverlay || e.target.closest('.notes-panel, .ui')) { touch = null; return; }
    const t = e.changedTouches[0];
    touch = { x: t.clientX, y: t.clientY };
  }
  function onTouchEnd(e) {
    if (!touch) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touch.x;
    const dy = t.clientY - touch.y;
    touch = null;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (dx < 0) next(); else prev();
    }
  }

  // Mouse wheel, throttled so one gesture moves one slide.
  let lastWheelNav = 0;
  function onWheel(e) {
    if (openOverlay || e.target.closest('.notes-panel')) return;
    if (Math.abs(e.deltaY) < 30 && Math.abs(e.deltaX) < 30) return;
    e.preventDefault();
    const now = performance.now();
    if (now - lastWheelNav < 900) return;
    lastWheelNav = now;
    if ((Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX) > 0) next(); else prev();
  }

  // Auto-hide controls when the pointer is idle.
  let idleTimer = null;
  function wake() {
    el.ui.classList.remove('idle');
    window.clearTimeout(idleTimer);
    idleTimer = window.setTimeout(() => {
      if (!el.ui.contains(document.activeElement)) el.ui.classList.add('idle');
    }, 3000);
  }

  // Scale the 1920x1080 stage to the viewport.
  function fit() {
    const s = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
    stage.style.setProperty('--s', String(s));
    if (!el.grid.hidden) scaleThumbs();
  }

  function onFullscreenChange() {
    el.btnFull.setAttribute('aria-pressed', String(!!document.fullscreenElement));
    fit();
  }

  /* ---------- 7. Init ---------- */

  function init() {
    validateTiming();
    buildSectionMap();

    // Stagger index for entrance animations (capped so late items do not lag).
    slides.forEach((s) => {
      s.querySelectorAll('.a').forEach((n, k) => n.style.setProperty('--i', String(Math.min(k, 9))));
      s.setAttribute('aria-label', `Slide: ${s.dataset.title}`);
    });

    initTimers();
    initReveals();
    fit();

    el.btnPrev.addEventListener('click', prev);
    el.btnNext.addEventListener('click', next);
    el.btnGrid.addEventListener('click', toggleGrid);
    el.btnNotes.addEventListener('click', () => toggleNotes());
    el.btnFull.addEventListener('click', toggleFullscreen);
    el.btnHelp.addEventListener('click', toggleHelp);
    el.npClose.addEventListener('click', () => toggleNotes(false));
    [el.grid, el.help].forEach((o) => {
      o.addEventListener('click', (e) => {
        if (e.target === o || e.target.closest('[data-close]')) hideOverlay();
      });
    });

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('touchstart', onTouchStart, { passive: true });
    document.addEventListener('touchend', onTouchEnd, { passive: true });
    $('deck').addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('resize', fit);
    document.addEventListener('fullscreenchange', onFullscreenChange);
    window.addEventListener('hashchange', () => goTo(parseHash()));
    window.addEventListener('mousemove', wake, { passive: true });
    window.addEventListener('pagehide', () => timers.forEach((t) => t.destroy()));

    goTo(parseHash());
    wake();
    // Reveal the stage only once the first slide state is set (avoids a flash).
    document.documentElement.classList.add('ready');
  }

  init();
})();
