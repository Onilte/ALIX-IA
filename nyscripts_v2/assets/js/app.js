/* ==========================================================================
   NyScripts_Sources — núcleo do site
   Header, footer, navegação, efeitos e utilitários compartilhados.
   ========================================================================== */
(function () {
  'use strict';

  var CFG = window.NY_CONFIG || {};

  /* ----------------------------------------------------------------------
     Ícones (SVG inline — sem dependência externa, sem quebrar se um CDN cair)
  ---------------------------------------------------------------------- */
  var ICON = {
    plugin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v4M12 18v4M4.9 4.9l2.9 2.9M16.2 16.2l2.9 2.9M2 12h4M18 12h4M4.9 19.1l2.9-2.9M16.2 7.8l2.9-2.9"/><circle cx="12" cy="12" r="3.5"/></svg>',
    code: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m16 18 6-6-6-6M8 6l-6 6 6 6"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
    book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
    chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.1A8.4 8.4 0 0 1 12 3a8.4 8.4 0 0 1 9 8.5z"/></svg>',
    ticket: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 9V7a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v2a3 3 0 0 0 0 6v2a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-2a3 3 0 0 0 0-6z"/><path d="M13 5v14" stroke-dasharray="3 3"/></svg>',
    shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
    star: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m12 2 3 6.6 7 .9-5 4.9 1.2 7L12 18l-6.2 3.4L7 14.4l-5-4.9 7-.9z"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    up: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>',
    external: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>',
    copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m4 12 5 5L20 6"/></svg>',
    chevron: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>',
    alert: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/></svg>',
    inbox: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.5 5h13l3.5 7v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6z"/></svg>',
    discord: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.3 4.5A19 19 0 0 0 15.6 3l-.24.5a13 13 0 0 1 4.1 2.1 17.7 17.7 0 0 0-14.9 0A13 13 0 0 1 8.7 3.5L8.4 3a19 19 0 0 0-4.7 1.5C.8 8.9 0 13.2.4 17.4a19.2 19.2 0 0 0 5.8 3l1.2-1.7c-.9-.4-1.8-.8-2.6-1.4l.6-.4a13.6 13.6 0 0 0 11.6 0l.6.4c-.8.6-1.7 1-2.6 1.4l1.2 1.7a19.1 19.1 0 0 0 5.8-3c.5-4.9-.8-9.1-3.7-12.9zM8.3 14.8c-1.1 0-2-1-2-2.3s.9-2.3 2-2.3 2.1 1 2 2.3c0 1.3-.9 2.3-2 2.3zm7.4 0c-1.1 0-2-1-2-2.3s.9-2.3 2-2.3 2 1 2 2.3c0 1.3-.9 2.3-2 2.3z"/></svg>'
  };

  /* ----------------------------------------------------------------------
     Utilitários
  ---------------------------------------------------------------------- */

  /** Escapa HTML — impede injeção de código por conteúdo dinâmico (XSS). */
  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /** Só deixa passar link http(s) — bloqueia javascript: em href. */
  function safeUrl(url) {
    var s = String(url || '').trim();
    return /^https?:\/\//i.test(s) ? esc(s) : '#';
  }

  function el(id) { return document.getElementById(id); }
  function all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function debounce(fn, wait) {
    var t;
    return function () {
      var ctx = this, args = arguments;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(ctx, args); }, wait);
    };
  }

  /* ----------------------------------------------------------------------
     Navegação
  ---------------------------------------------------------------------- */
  var PAGES = [
    { id: 'index', label: 'Início', href: 'index.html' },
    { id: 'plugins', label: 'Documentação', href: 'plugins.html' },
    { id: 'scripts', label: 'Scripts', href: 'scripts.html' },
    { id: 'modelos', label: 'Anix Chat', href: 'chat.html' },
    { id: 'tutoriais', label: 'Tutoriais', href: 'tutoriais.html' }
  ];

  var COMMUNITY = [
    { id: 'comunidade', label: 'Visão geral', href: 'comunidade.html', icon: 'chat' },
    { id: 'suporte', label: 'Suporte / Tickets', href: 'suporte.html', icon: 'ticket' },
    { id: 'regras', label: 'Regras', href: 'regras.html', icon: 'shield' },
    { id: 'creditos', label: 'Créditos', href: 'creditos.html', icon: 'star' }
  ];

  function renderHeader(active) {
    var host = el('site-header');
    if (!host) return;

    var isCommunity = COMMUNITY.some(function (p) { return p.id === active; });

    host.className = 'site-header';
    host.innerHTML =
      '<div class="header-inner">' +
        '<a class="brand" href="index.html" aria-label="Anix, início">' +
          '<img class="brand-mark" src="assets/images/anix-logo.png" alt="">' +
          '<span class="brand-text">Anix<span> // IA</span></span>' +
        '</a>' +
        '<nav class="nav" id="nav" aria-label="Navegação principal">' +
          PAGES.map(function (p) {
            return '<a class="nav-link' + (p.id === active ? ' is-active' : '') + '" href="' + p.href + '">' + p.label + '</a>';
          }).join('') +
          '<div class="nav-group">' +
            '<a class="nav-link' + (isCommunity ? ' is-active' : '') + '" href="comunidade.html">Comunidade</a>' +
            '<div class="nav-menu">' +
              COMMUNITY.map(function (p) {
                return '<a href="' + p.href + '">' + ICON[p.icon] + p.label + '</a>';
              }).join('') +
            '</div>' +
          '</div>' +
        '</nav>' +
        '<div class="header-actions">' +
          '<div id="auth-slot"></div>' +
          '<a class="btn btn-discord btn-sm" href="' + safeUrl(CFG.discordInvite) + '" target="_blank" rel="noopener">' + ICON.discord + 'Discord</a>' +
          '<button class="nav-toggle" id="nav-toggle" aria-label="Abrir menu" aria-expanded="false" aria-controls="nav">' + ICON.menu + '</button>' +
        '</div>' +
      '</div>';

    initMobileNav();
    initStickyHeader();
  }

  function initMobileNav() {
    var toggle = el('nav-toggle');
    var nav = el('nav');
    if (!toggle || !nav) return;

    var backdrop = document.createElement('div');
    backdrop.className = 'nav-backdrop';
    document.body.appendChild(backdrop);

    function setOpen(open) {
      nav.classList.toggle('is-open', open);
      backdrop.classList.toggle('is-open', open);
      toggle.innerHTML = open ? ICON.close : ICON.menu;
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
      document.body.style.overflow = open ? 'hidden' : '';
    }

    toggle.addEventListener('click', function () { setOpen(!nav.classList.contains('is-open')); });
    backdrop.addEventListener('click', function () { setOpen(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setOpen(false); });
    all('a', nav).forEach(function (a) { a.addEventListener('click', function () { setOpen(false); }); });
    window.addEventListener('resize', debounce(function () {
      if (window.innerWidth > 820) setOpen(false);
    }, 150));
  }

  function initStickyHeader() {
    var header = document.querySelector('.site-header');
    if (!header) return;
    var onScroll = function () { header.classList.toggle('is-stuck', window.scrollY > 8); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ----------------------------------------------------------------------
     Footer
  ---------------------------------------------------------------------- */
  function renderFooter() {
    var host = el('site-footer');
    if (!host) return;

    host.className = 'site-footer';
    host.innerHTML =
      '<div class="container">' +
        '<div class="footer-top">' +
          '<div class="footer-brand">' +
            '<a class="brand" href="index.html">' +
              '<span class="brand-mark" aria-hidden="true">Ny</span>' +
              '<span class="brand-text">Ny<span>Scripts_Sources</span></span>' +
            '</a>' +
            '<p>Central de desenvolvimento Roblox: plugins, scripts, modelos e tutoriais organizados num só lugar.</p>' +
          '</div>' +
          '<div class="footer-col"><h4>Conteúdo</h4>' +
            PAGES.slice(1).map(function (p) { return '<a href="' + p.href + '">' + p.label + '</a>'; }).join('') +
          '</div>' +
          '<div class="footer-col"><h4>Comunidade</h4>' +
            COMMUNITY.map(function (p) { return '<a href="' + p.href + '">' + p.label + '</a>'; }).join('') +
          '</div>' +
          '<div class="footer-col"><h4>Links</h4>' +
            '<a href="' + safeUrl(CFG.discordInvite) + '" target="_blank" rel="noopener">Servidor Discord</a>' +
            '<a href="https://create.roblox.com/docs" target="_blank" rel="noopener">Roblox Docs</a>' +
            '<a href="https://create.roblox.com/store" target="_blank" rel="noopener">Creator Store</a>' +
          '</div>' +
        '</div>' +
        '<div class="footer-bottom">' +
          '<span>&copy; ' + new Date().getFullYear() + ' ' + esc(CFG.siteName || 'NyScripts_Sources') + ' &middot; feito por ' + esc(CFG.author || 'Nydev') + '</span>' +
          '<span>Consulta pública via API oficial do Roblox &middot; nenhum dado de conta é acessado</span>' +
        '</div>' +
      '</div>';
  }

  /* ----------------------------------------------------------------------
     Efeitos de ambiente
  ---------------------------------------------------------------------- */
  function initChrome() {
    var frag = document.createDocumentFragment();

    var grid = document.createElement('div');
    grid.className = 'fx-layer fx-grid';
    frag.appendChild(grid);

    var aurora = document.createElement('div');
    aurora.className = 'fx-layer fx-aurora';
    aurora.innerHTML = '<i></i><i></i><i></i>';
    frag.appendChild(aurora);

    var noise = document.createElement('div');
    noise.className = 'fx-layer fx-noise';
    frag.appendChild(noise);

    var bar = document.createElement('div');
    bar.className = 'scroll-progress';
    frag.appendChild(bar);

    document.body.insertBefore(frag, document.body.firstChild);

    // Brilho seguindo o cursor (só em ponteiro fino, evita custo no mobile)
    if (window.matchMedia('(pointer: fine)').matches) {
      var glow = document.createElement('div');
      glow.className = 'fx-layer fx-cursor';
      document.body.appendChild(glow);
      var raf = null, mx = 0, my = 0;
      window.addEventListener('mousemove', function (e) {
        mx = e.clientX; my = e.clientY;
        if (raf) return;
        raf = requestAnimationFrame(function () {
          glow.style.setProperty('--mx', mx + 'px');
          glow.style.setProperty('--my', my + 'px');
          raf = null;
        });
      }, { passive: true });
    }

    // Progresso do scroll
    window.addEventListener('scroll', function () {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = 'scaleX(' + (h > 0 ? window.scrollY / h : 0) + ')';
    }, { passive: true });

    initToTop();
    initReveal();
  }

  function initToTop() {
    var btn = document.createElement('button');
    btn.className = 'to-top';
    btn.setAttribute('aria-label', 'Voltar ao topo');
    btn.innerHTML = ICON.up;
    btn.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
    document.body.appendChild(btn);
    window.addEventListener('scroll', function () {
      btn.classList.toggle('is-visible', window.scrollY > 500);
    }, { passive: true });
  }

  function initReveal(root) {
    var items = all('.reveal:not(.is-in)', root);
    if (!items.length) return;

    if (!('IntersectionObserver' in window)) {
      items.forEach(function (n) { n.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px' });
    items.forEach(function (n) { io.observe(n); });
  }

  /* ----------------------------------------------------------------------
     Toast + copiar
  ---------------------------------------------------------------------- */
  var toastEl = null, toastTimer = null;
  function toast(message) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'toast';
      toastEl.setAttribute('role', 'status');
      document.body.appendChild(toastEl);
    }
    toastEl.innerHTML = ICON.check + '<span>' + esc(message) + '</span>';
    toastEl.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('is-visible'); }, 2200);
  }

  function copyText(text) {
    var done = function () { toast('Copiado para a área de transferência'); };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done).catch(fallback);
    } else {
      fallback();
    }
    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); done(); } catch (e) { toast('Não foi possível copiar'); }
      document.body.removeChild(ta);
    }
  }

  /* ----------------------------------------------------------------------
     Boot
  ---------------------------------------------------------------------- */
  function boot(activePage) {
    renderHeader(activePage);
    renderFooter();
    if (typeof window.NyAuth === 'function') window.NyAuth();
  }

  document.addEventListener('DOMContentLoaded', initChrome);

  // API pública
  window.Ny = {
    ICON: ICON,
    PAGES: PAGES,
    COMMUNITY: COMMUNITY,
    config: CFG,
    esc: esc,
    safeUrl: safeUrl,
    el: el,
    all: all,
    debounce: debounce,
    reveal: initReveal,
    toast: toast,
    copy: copyText,
    boot: boot
  };
})();
