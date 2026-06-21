/* ============================================
   TAYLOR — Game Portal
   Application logic
   ============================================ */
(function () {
  'use strict';

  const GAMES_URL = 'games.json';
  const FAVORITES_KEY = 'taylor_favorites';
  const ICON = {
    play: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`,
    heart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>`,
    search: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>`,
    close: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>`,
    expand: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>`,
    newtab: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><path d="M15 3h6v6M10 14L21 3"/></svg>`,
    refresh: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.5 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.65 4.36A9 9 0 0 0 20.5 15"/></svg>`,
    fire: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c1 3-2 4-2 7a3 3 0 0 0 6 0c2 1 3 3 3 5a7 7 0 1 1-14 0c0-4 3-6 4-8 1 1 1 2 1 2s1-3 2-6z"/></svg>`,
    star: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.9 6.5 7.1.6-5.4 4.7L18.2 21 12 17.3 5.8 21l1.6-7.2-5.4-4.7 7.1-.6z"/></svg>`,
    clock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>`,
    grid: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`,
    controller: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 12h4m-2-2v4M16 11h.01M19 13h.01"/><path d="M2 14a4 4 0 0 1 4-5h12a4 4 0 0 1 4 5l-1 5a2 2 0 0 1-3.6 1.2L16 18H8l-1.4 2.2A2 2 0 0 1 3 19z"/></svg>`,
    users: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/></svg>`,
    bolt: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L3 14h7l-1 8 11-13h-7l1-7z"/></svg>`,
    layers: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l9 5-9 5-9-5 9-5z"/><path d="M3 12l9 5 9-5M3 17l9 5 9-5"/></svg>`,
    check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>`,
    arrow: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`
  };

  let allGames = [];
  let categories = [];
  let favorites = new Set(JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]'));
  let currentCategory = 'All';
  let currentSearch = '';
  let showFavoritesOnly = false;

  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str == null ? '' : String(str);
    return div.innerHTML;
  }

  function saveFavorites() {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(Array.from(favorites)));
    updateFavCount();
  }

  function updateFavCount() {
    const el = $('#favCount');
    if (!el) return;
    const n = favorites.size;
    el.textContent = n;
    el.style.display = n > 0 ? 'flex' : 'none';
  }

  function toast(msg) {
    const t = $('#toast');
    t.innerHTML = `${ICON.check}<span>${escapeHtml(msg)}</span>`;
    t.classList.add('show');
    clearTimeout(toast._tid);
    toast._tid = setTimeout(() => t.classList.remove('show'), 2400);
  }

  /* ---------- Data loading ---------- */
  async function loadGames() {
    try {
      const res = await fetch(GAMES_URL + '?t=' + Date.now());
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      allGames = Array.isArray(data.games) ? data.games : [];
      categories = Array.isArray(data.categories) ? data.categories : [];
      renderCategoryNav();
      renderAll();
      updateStats();
    } catch (err) {
      console.error('Failed to load games.json', err);
      $('#libraryGrid').innerHTML = `
        <div class="empty-state" style="grid-column:1/-1">
          <h3>Couldn't load the game library</h3>
          <p>games.json may be missing or invalid. (${escapeHtml(err.message)})</p>
        </div>`;
    }
  }

  /* ---------- Rendering helpers ---------- */
  function cardHTML(game, delay) {
    const isFav = favorites.has(game.id);
    const tag = (game.tags && game.tags[0]) || '';
    const tagHTML = tag ? `<span class="card-tag ${tag}">${escapeHtml(tag)}</span>` : '';
    const clicks = typeof game.clicks === 'number' ? game.clicks : Math.floor((game.id * 137) % 900) + 50;
    return `
      <article class="game-card" data-id="${game.id}" style="animation-delay:${delay || 0}ms">
        <button class="card-fav ${isFav ? 'active' : ''}" data-fav="${game.id}" aria-label="${isFav ? 'Remove from favorites' : 'Add to favorites'}" aria-pressed="${isFav}">
          ${ICON.heart}
        </button>
        <div class="card-plate">
          <span class="card-plate-title">${escapeHtml(game.category || 'Game')}</span>
          ${tagHTML}
        </div>
        <div class="card-window">
          <img src="${escapeHtml(game.cover)}" alt="${escapeHtml(game.name)}" loading="lazy">
          <div class="card-play">${ICON.play}<span>Play now</span></div>
        </div>
        <div class="card-body">
          <h3 class="card-name">${escapeHtml(game.name)}</h3>
          <div class="card-meta">
            <span class="card-category">${escapeHtml(game.category || '')}</span>
            <span class="card-clicks">${ICON.fire}${clicks.toLocaleString()}</span>
          </div>
        </div>
      </article>`;
  }

  function emptyStateHTML(title, sub) {
    return `<div class="empty-state" style="grid-column:1/-1">
      ${ICON.controller.replace('width="24" height="24"', 'width="48" height="48"')}
      <h3>${escapeHtml(title)}</h3>
      <p>${escapeHtml(sub)}</p>
    </div>`;
  }

  function renderCategoryNav() {
    const nav = $('#categoryNav');
    const cats = ['All', ...categories];
    nav.innerHTML = cats.map(c =>
      `<button class="chip ${c === currentCategory ? 'active' : ''}" data-cat="${escapeHtml(c)}">${escapeHtml(c)}</button>`
    ).join('');
  }

  function getFiltered() {
    return allGames.filter(g => {
      if (showFavoritesOnly && !favorites.has(g.id)) return false;
      if (currentCategory !== 'All' && g.category !== currentCategory) return false;
      if (currentSearch && !g.name.toLowerCase().includes(currentSearch.toLowerCase())) return false;
      return true;
    });
  }

  function renderFeatured() {
    const wrap = $('#featuredCarousel');
    const featured = allGames.filter(g => g.featured);
    if (!featured.length) {
      wrap.innerHTML = emptyStateHTML('No featured games yet', 'Mark games as "featured": true in games.json');
      return;
    }
    wrap.innerHTML = featured.map((g, i) => cardHTML(g, i * 60)).join('');
  }

  function renderPopular() {
    const wrap = $('#popularGrid');
    const popular = allGames.filter(g => g.tags && g.tags.includes('popular'));
    const list = (popular.length ? popular : allGames).slice(0, 6);
    wrap.innerHTML = list.length ? list.map((g, i) => cardHTML(g, i * 50)).join('') : emptyStateHTML('No games yet', 'Add games to games.json to see them here.');
  }

  function renderTrending() {
    const wrap = $('#trendingGrid');
    const trending = allGames.filter(g => g.tags && g.tags.includes('trending'));
    const list = (trending.length ? trending : allGames).slice(0, 6);
    wrap.innerHTML = list.length ? list.map((g, i) => cardHTML(g, i * 50)).join('') : emptyStateHTML('No games yet', 'Add games to games.json to see them here.');
  }

  function renderRecent() {
    const wrap = $('#recentGrid');
    const recent = [...allGames].sort((a, b) => b.id - a.id).slice(0, 6);
    wrap.innerHTML = recent.length ? recent.map((g, i) => cardHTML(g, i * 50)).join('') : emptyStateHTML('No games yet', 'Add games to games.json to see them here.');
  }

  function renderLibrary() {
    const wrap = $('#libraryGrid');
    const list = getFiltered();
    $('#libraryCount').textContent = list.length;
    if (!list.length) {
      wrap.innerHTML = emptyStateHTML('No games found', 'Try a different search term or category.');
      return;
    }
    wrap.innerHTML = list.map((g, i) => cardHTML(g, Math.min(i, 12) * 35)).join('');
  }

  function renderAll() {
    renderFeatured();
    renderPopular();
    renderTrending();
    renderRecent();
    renderLibrary();
  }

  function updateStats() {
    animateNumber($('#statGames'), allGames.length);
    animateNumber($('#statCategories'), categories.length);
    const totalClicks = allGames.reduce((sum, g) => sum + (typeof g.clicks === 'number' ? g.clicks : Math.floor((g.id * 137) % 900) + 50), 0);
    animateNumber($('#statPlays'), totalClicks);
    animateNumber($('#bandGames'), allGames.length);
    animateNumber($('#bandCategories'), categories.length);
    animateNumber($('#bandPlays'), totalClicks);
  }

  function animateNumber(el, target) {
    if (!el) return;
    const start = 0;
    const dur = 900;
    const t0 = performance.now();
    function tick(now) {
      const p = Math.min(1, (now - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(start + (target - start) * eased).toLocaleString();
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* ---------- Player ---------- */
  function openGame(id) {
    const game = allGames.find(g => g.id === id);
    if (!game) return;
    if (!game.url || game.url === 'REPLACE_WITH_GAME_URL') {
      toast('This game has no URL set yet — edit games.json');
      return;
    }

    // Local visual play counter only — nothing sent anywhere.
    game.clicks = (typeof game.clicks === 'number' ? game.clicks : Math.floor((game.id * 137) % 900) + 50) + 1;

    if (/^https?:\/\//i.test(game.url)) {
      window.open(game.url, '_blank', 'noopener');
      return;
    }

    $('#playerThumb').src = game.cover;
    $('#playerTitle').textContent = game.name;
    $('#playerCat').textContent = game.category || '';
    $('#gameFrame').src = game.url;
    $('#playerView').classList.add('open');
    $('#playerView').dataset.gameId = id;
    document.body.style.overflow = 'hidden';
  }

  function closeGame() {
    $('#playerView').classList.remove('open');
    $('#gameFrame').src = 'about:blank';
    document.body.style.overflow = '';
  }

  /* ---------- Events ---------- */
  function bindGridClicks(container) {
    if (!container) return;
    container.addEventListener('click', (e) => {
      const favBtn = e.target.closest('[data-fav]');
      if (favBtn) {
        e.stopPropagation();
        const id = Number(favBtn.dataset.fav);
        if (favorites.has(id)) {
          favorites.delete(id);
          favBtn.classList.remove('active');
          favBtn.setAttribute('aria-pressed', 'false');
          toast('Removed from favorites');
        } else {
          favorites.add(id);
          favBtn.classList.add('active');
          favBtn.setAttribute('aria-pressed', 'true');
          toast('Added to favorites');
        }
        saveFavorites();
        if (showFavoritesOnly) renderLibrary();
        return;
      }
      const card = e.target.closest('.game-card');
      if (card) {
        card.classList.add('pressed');
        setTimeout(() => card.classList.remove('pressed'), 380);
        openGame(Number(card.dataset.id));
      }
    });
  }

  function initEvents() {
    [$('#featuredCarousel'), $('#popularGrid'), $('#trendingGrid'), $('#recentGrid'), $('#libraryGrid')]
      .forEach(bindGridClicks);

    $('#searchInput').addEventListener('input', (e) => {
      currentSearch = e.target.value;
      renderLibrary();
      if (currentSearch) document.getElementById('library').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    $('#categoryNav').addEventListener('click', (e) => {
      const chip = e.target.closest('.chip');
      if (!chip) return;
      currentCategory = chip.dataset.cat;
      $$('.chip', $('#categoryNav')).forEach(c => c.classList.toggle('active', c === chip));
      renderLibrary();
    });

    $('#favToggle').addEventListener('click', () => {
      showFavoritesOnly = !showFavoritesOnly;
      $('#favToggle').classList.toggle('active', showFavoritesOnly);
      renderLibrary();
      document.getElementById('library').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    $('#browseBtn').addEventListener('click', () => {
      document.getElementById('library').scrollIntoView({ behavior: 'smooth' });
    });

    $('#closePlayer').addEventListener('click', closeGame);
    $('#fullscreenBtn').addEventListener('click', () => {
      const frame = $('#gameFrame');
      if (frame.requestFullscreen) frame.requestFullscreen();
      else if (frame.webkitRequestFullscreen) frame.webkitRequestFullscreen();
    });
    $('#newTabBtn').addEventListener('click', () => {
      const id = Number($('#playerView').dataset.gameId);
      const game = allGames.find(g => g.id === id);
      if (game) window.open(game.url, '_blank', 'noopener');
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && $('#playerView').classList.contains('open')) closeGame();
    });

    // Modals (privacy / contact / about)
    $$('[data-modal]').forEach(btn => {
      btn.addEventListener('click', () => openModal(btn.dataset.modal));
    });
    $('#modalClose').addEventListener('click', closeModal);
    $('#modalOverlay').addEventListener('click', (e) => {
      if (e.target === $('#modalOverlay')) closeModal();
    });

    // Header scroll shadow
    const header = $('.site-header');
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 8);
    }, { passive: true });
  }

  const MODAL_CONTENT = {
    privacy: {
      title: 'Privacy Policy',
      body: `
        <p><strong>Last updated:</strong> June 2026</p>
        <p>Taylor is a static games portal. We don't run servers that log your activity — your favorites list is stored only in your browser's local storage and never leaves your device.</p>
        <p>Third-party games loaded in the player may set their own cookies or local storage within their own frame. We don't control or access that data.</p>
        <p>If you have questions about this policy, reach out via the contact details in the footer.</p>
      `
    },
    contact: {
      title: 'Contact',
      body: `<p>Questions, suggestions, or game submissions? Reach out through your preferred contact channel and update this section with your details.</p>`
    },
    about: {
      title: 'About Taylor',
      body: `<p>Taylor is a curated library of free browser games — fast to load, easy to browse, and built for quick sessions whenever you've got a few minutes to spare.</p>`
    }
  };

  function openModal(key) {
    const data = MODAL_CONTENT[key];
    if (!data) return;
    $('#modalTitle').textContent = data.title;
    $('#modalBody').innerHTML = data.body;
    $('#modalOverlay').classList.add('open');
  }
  function closeModal() {
    $('#modalOverlay').classList.remove('open');
  }

  function injectIcons() {
    $$('[data-icon]').forEach(el => {
      const name = el.dataset.icon;
      if (ICON[name]) el.innerHTML = ICON[name];
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    injectIcons();
    updateFavCount();
    initEvents();
    loadGames();
  });
})();
