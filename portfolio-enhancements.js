(() => {
  'use strict';

  // Avoid duplicate installation if this file is included more than once.
  if (window.__portfolioEnhancementsLoaded) return;
  window.__portfolioEnhancementsLoaded = true;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Build metallic gears as SVG, avoiding extra image/font dependencies.
  function gearSvg(teeth, outerR, innerR, id) {
    const cx = 220, cy = 220;
    const points = [];
    const steps = teeth * 4;
    for (let i = 0; i < steps; i++) {
      const a = (Math.PI * 2 * i / steps) - Math.PI / 2;
      const phase = i % 4;
      const r = phase === 1 || phase === 2 ? outerR : innerR;
      points.push(`${(cx + Math.cos(a) * r).toFixed(2)},${(cy + Math.sin(a) * r).toFixed(2)}`);
    }
    const holes = Array.from({length: 6}, (_, i) => {
      const a = (Math.PI * 2 * i / 6) - Math.PI / 2;
      return `<circle cx="${cx + Math.cos(a)*105}" cy="${cy + Math.sin(a)*105}" r="13" fill="#171d23" stroke="url(#${id}edge)" stroke-width="4"/>`;
    }).join('');
    const spokes = Array.from({length: 8}, (_, i) =>
      `<path d="M220 112 L220 158" transform="rotate(${i*45} 220 220)" stroke="url(#${id}edge)" stroke-width="18" stroke-linecap="round" opacity=".9"/>`
    ).join('');
    return `<svg viewBox="0 0 440 440" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="${id}metal" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#d0d8df"/><stop offset=".18" stop-color="#758491"/>
          <stop offset=".43" stop-color="#29333c"/><stop offset=".68" stop-color="#8a9aa7"/>
          <stop offset="1" stop-color="#252e36"/>
        </linearGradient>
        <linearGradient id="${id}edge" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#c4d0d9"/><stop offset=".5" stop-color="#566674"/><stop offset="1" stop-color="#a6b5c0"/>
        </linearGradient>
        <radialGradient id="${id}face"><stop offset="0" stop-color="#657580"/><stop offset=".62" stop-color="#303b45"/><stop offset="1" stop-color="#161d23"/></radialGradient>
      </defs>
      <polygon points="${points.join(' ')}" fill="url(#${id}metal)" stroke="url(#${id}edge)" stroke-width="5" />
      <circle cx="220" cy="220" r="158" fill="url(#${id}face)" stroke="#a7b7c3" stroke-opacity=".55" stroke-width="5"/>
      <circle cx="220" cy="220" r="137" fill="none" stroke="#10161b" stroke-width="9"/>
      ${spokes}${holes}
      <circle cx="220" cy="220" r="61" fill="#151c22" stroke="url(#${id}edge)" stroke-width="12"/>
      <circle cx="220" cy="220" r="35" fill="url(#${id}metal)" stroke="#10161b" stroke-width="7"/>
      <circle cx="220" cy="220" r="12" fill="#141b20" stroke="#9cabb6" stroke-width="4"/>
    </svg>`;
  }

  function addGears() {
    if (document.querySelector('.gear-backdrop')) return;
    const layer = document.createElement('div');
    layer.className = 'gear-backdrop';
    layer.setAttribute('aria-hidden', 'true');
    layer.innerHTML = `<div class="gear-one">${gearSvg(16, 183, 158, 'gearA')}</div>
      <div class="gear-two">${gearSvg(14, 183, 158, 'gearB')}</div>`;
    document.body.prepend(layer);
    return layer;
  }

  function addProjectLinks() {
    const cards = [...document.querySelectorAll('.project-card')];
    cards.forEach(card => {
      const title = (card.querySelector('h3')?.textContent || '').toLowerCase();
      let url = '';
      if (title.includes('students management')) url = 'https://onlinegdb.com/eez0GTg-IR';
      if (title.includes('personal portfolio')) url = 'https://sauvage-yo.github.io/';
      if (!url) return;
      const link = card.querySelector('.project-bottom .round-link');
      if (link) {
        link.href = url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
      }
      // Make the project card itself clickable without breaking nested links.
      card.classList.add('project-card-has-destination');
      card.setAttribute('data-project-url', url);
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'link');
      card.setAttribute('aria-label', `Open ${card.querySelector('h3')?.textContent || 'project'} in a new tab`);
      card.addEventListener('click', event => {
        if (event.target.closest('a, button')) return;
        window.open(url, '_blank', 'noopener,noreferrer');
      });
      card.addEventListener('keydown', event => {
        if ((event.key === 'Enter' || event.key === ' ') && !event.target.closest('a, button')) {
          event.preventDefault();
          window.open(url, '_blank', 'noopener,noreferrer');
        }
      });
    });
  }

  function makeInterestCardsInteractive() {
    const cards = [...document.querySelectorAll('.interest-card')];
    cards.forEach((card, index) => {
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-pressed', 'false');
      card.setAttribute('aria-label', `${card.querySelector('h3')?.textContent || 'Interest'} card. Click to enlarge.`);
      const toggle = () => {
        const isExpanded = card.classList.contains('is-expanded');
        cards.forEach(other => {
          other.classList.remove('is-expanded');
          other.setAttribute('aria-pressed', 'false');
        });
        if (!isExpanded) {
          card.classList.add('is-expanded');
          card.setAttribute('aria-pressed', 'true');
        }
      };
      card.addEventListener('click', event => {
        if (event.target.closest('a, button')) return;
        toggle();
      });
      card.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          toggle();
        }
        if (event.key === 'Escape') {
          card.classList.remove('is-expanded');
          card.setAttribute('aria-pressed', 'false');
        }
      });
    });
    document.addEventListener('click', event => {
      if (!event.target.closest('.interest-card')) {
        cards.forEach(card => {
          card.classList.remove('is-expanded');
          card.setAttribute('aria-pressed', 'false');
        });
      }
    });
  }

  function makeScrollReactive(layer) {
    if (!layer || reduceMotion) return;
    const gearA = layer.querySelector('.gear-one svg');
    const gearB = layer.querySelector('.gear-two svg');
    let lastY = window.scrollY;
    let rotationA = 0;
    let rotationB = 0;
    let scheduled = false;

    window.addEventListener('scroll', () => {
      if (scheduled) return;
      scheduled = true;
      window.requestAnimationFrame(() => {
        const currentY = window.scrollY;
        const delta = currentY - lastY;
        lastY = currentY;
        if (Math.abs(delta) > 0) {
          // Down-scroll rotates clockwise; up-scroll reverses the direction.
          rotationA += delta * 0.22;
          rotationB -= delta * 0.15;
          gearA.style.transform = `rotate(${rotationA}deg)`;
          gearB.style.transform = `rotate(${rotationB}deg)`;
        }
        scheduled = false;
      });
    }, { passive: true });
  }

  function init() {
    const layer = addGears();
    addProjectLinks();
    makeInterestCardsInteractive();
    makeScrollReactive(layer);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
