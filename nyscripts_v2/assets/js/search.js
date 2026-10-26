/* ==========================================================================
   BUSCA NO CATÁLOGO PÚBLICO DO ROBLOX
   --------------------------------------------------------------------------
   Fluxo: frase em linguagem natural -> extrai palavras-chave e filtros
          -> consulta a API pública -> mostra resultado com imagem e link.

   Importante: o endpoint do Roblox bloqueia chamada direta do navegador
   (CORS). Configure `catalogProxy` em config.js apontando para um
   Cloudflare Worker (código pronto no README.md) para funcionar em produção.
   ========================================================================== */
(function () {
  'use strict';

  var Ny = window.Ny;
  var CFG = window.NY_CONFIG || {};

  var CATALOG_BASE = 'https://catalog.roblox.com/v1/search/items/details';
  var THUMB_BASE = 'https://thumbnails.roblox.com/v1/assets';

  /* ----------------------------------------------------------------------
     Interpretação da frase
  ---------------------------------------------------------------------- */
  var STOPWORDS = new Set([
    'de', 'do', 'da', 'dos', 'das', 'para', 'pra', 'que', 'tem', 'quais', 'qual',
    'o', 'a', 'os', 'as', 'um', 'uma', 'uns', 'umas', 'e', 'ou', 'com', 'sem',
    'no', 'na', 'nos', 'nas', 'por', 'se', 'sao', 'são', 'eu', 'voce', 'você',
    'ele', 'ela', 'tipo', 'sei', 'la', 'lá', 'algo', 'bom', 'boa', 'melhor',
    'melhores', 'ai', 'aí', 'usa', 'usar', 'uso', 'preciso', 'quero', 'gostaria',
    'como', 'onde', 'quando', 'tenho', 'ter', 'me', 'meu', 'minha', 'esse', 'essa',
    'isso', 'aqui', 'mais', 'muito', 'bem', 'ja', 'já', 'so', 'só', 'tudo'
  ]);

  var FREE_WORDS = ['gratis', 'grátis', 'graça', 'graca', 'gratuito', 'gratuita', 'free', 'zero'];
  var PLUGIN_WORDS = ['plugin', 'plugins'];
  var SCRIPT_WORDS = ['script', 'scripts', 'codigo', 'código'];
  var MODEL_WORDS = ['modelo', 'modelos', 'model', 'asset', 'assets'];

  function parseQuery(raw) {
    var lower = String(raw || '').toLowerCase();
    var flags = {
      free: FREE_WORDS.some(function (w) { return lower.indexOf(w) !== -1; }),
      plugin: PLUGIN_WORDS.some(function (w) { return lower.indexOf(w) !== -1; }),
      script: SCRIPT_WORDS.some(function (w) { return lower.indexOf(w) !== -1; }),
      model: MODEL_WORDS.some(function (w) { return lower.indexOf(w) !== -1; })
    };

    var ignore = FREE_WORDS.concat(PLUGIN_WORDS, SCRIPT_WORDS, MODEL_WORDS);
    var words = lower
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .split(/\s+/)
      .filter(function (w) {
        return w && !STOPWORDS.has(w) && ignore.indexOf(w) === -1;
      });

    // mantém a palavra do tipo na busca quando ela é o assunto principal
    var keyword = words.join(' ').trim();
    if (!keyword) {
      if (flags.plugin) keyword = 'plugin';
      else if (flags.script) keyword = 'script';
      else keyword = String(raw || '').trim();
    }

    return { keyword: keyword, flags: flags };
  }

  /* ----------------------------------------------------------------------
     Rede
  ---------------------------------------------------------------------- */
  function buildUrl(base, params) {
    var qs = new URLSearchParams(params).toString();
    var url = base + (qs ? '?' + qs : '');
    var proxy = (CFG.catalogProxy || '').replace(/\/+$/, '');
    return proxy ? proxy + '/?url=' + encodeURIComponent(url) : url;
  }

  function getJSON(url) {
    return fetch(url, { headers: { 'Accept': 'application/json' } }).then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    });
  }

  /* ----------------------------------------------------------------------
     UI
  ---------------------------------------------------------------------- */
  function skeletons(grid, n) {
    var one =
      '<div class="skeleton">' +
        '<div class="sk-img"></div>' +
        '<div class="sk-line" style="width:80%"></div>' +
        '<div class="sk-line" style="width:55%"></div>' +
      '</div>';
    grid.innerHTML = new Array(n + 1).join(one);
  }

  function showError(grid, message, detail) {
    grid.innerHTML =
      '<div class="state state-error">' +
        '<b>' + Ny.esc(message) + '</b>' +
        'O endpoint público do Roblox costuma bloquear chamadas feitas direto do ' +
        'navegador (CORS). Para funcionar com o site publicado, suba o proxy ' +
        '(Cloudflare Worker) e preencha <code>catalogProxy</code> em ' +
        '<code>config.js</code>. O passo a passo está no <code>README.md</code>.' +
        (detail ? '<br><br>Detalhe técnico: <code>' + Ny.esc(detail) + '</code>' : '') +
      '</div>';
  }

  function renderResults(grid, items, thumbs) {
    grid.innerHTML = items.map(function (item) {
      var free = !item.price;
      var thumb = thumbs[item.id];
      return '' +
        '<article class="card result reveal">' +
          (thumb
            ? '<img src="' + Ny.safeUrl(thumb) + '" alt="' + Ny.esc(item.name) + '" loading="lazy" decoding="async">'
            : '<div class="sk-img" style="animation:none"></div>') +
          '<div class="tags">' +
            '<span class="tag ' + (free ? 'tag-free' : 'tag-paid') + '">' + (free ? 'Grátis' : 'R$ ' + Ny.esc(item.price)) + '</span>' +
            (item.itemType ? '<span class="tag">' + Ny.esc(item.itemType) + '</span>' : '') +
          '</div>' +
          '<h3>' + Ny.esc(item.name) + '</h3>' +
          '<p class="id">ID ' + Ny.esc(item.id) + '</p>' +
          '<a class="card-link" href="https://www.roblox.com/library/' + encodeURIComponent(item.id) + '" target="_blank" rel="noopener">Ver no Roblox' + Ny.ICON.external + '</a>' +
        '</article>';
    }).join('');
    Ny.reveal(grid);
  }

  /* ----------------------------------------------------------------------
     Busca
  ---------------------------------------------------------------------- */
  var lastQuery = '';

  function search(rawQuery) {
    var grid = Ny.el('results');
    var meta = Ny.el('results-meta');
    if (!grid) return;

    lastQuery = rawQuery;
    skeletons(grid, 8);
    if (meta) meta.textContent = 'Buscando “' + rawQuery + '”...';

    var parsed = parseQuery(rawQuery);
    var params = { Category: 'All', Keyword: parsed.keyword, Limit: '30' };
    if (parsed.flags.free) { params.MinPrice = '0'; params.MaxPrice = '0'; }

    getJSON(buildUrl(CATALOG_BASE, params))
      .then(function (data) {
        if (lastQuery !== rawQuery) return; // resposta antiga, ignora
        var items = (data && data.data) || [];

        if (parsed.flags.free) {
          items = items.filter(function (i) { return !i.price; });
        }
        items = items.slice(0, 12);

        if (!items.length) {
          grid.innerHTML =
            '<div class="empty">' + Ny.ICON.inbox +
              '<h3>Nenhum resultado</h3>' +
              '<p>Não achamos nada para <code>' + Ny.esc(parsed.keyword) + '</code>. Tente descrever de outro jeito ou usar menos palavras.</p>' +
            '</div>';
          if (meta) meta.textContent = '';
          return;
        }

        if (meta) {
          meta.textContent = items.length + ' resultado(s) para “' + parsed.keyword + '”' +
            (parsed.flags.free ? ' · somente grátis' : '');
        }

        var ids = items.map(function (i) { return i.id; }).join(',');
        return getJSON(buildUrl(THUMB_BASE, { assetIds: ids, size: '420x420', format: 'Png' }))
          .then(function (t) {
            var map = {};
            ((t && t.data) || []).forEach(function (x) {
              if (x.state === 'Completed' || !x.state) map[x.targetId] = x.imageUrl;
            });
            return map;
          })
          .catch(function () { return {}; })
          .then(function (map) { renderResults(grid, items, map); });
      })
      .catch(function (err) {
        if (lastQuery !== rawQuery) return;
        if (meta) meta.textContent = '';
        showError(grid, 'Não foi possível buscar agora.', err && err.message);
      });
  }

  /* ----------------------------------------------------------------------
     Init
  ---------------------------------------------------------------------- */
  window.NySearch = function () {
    var input = Ny.el('search-input');
    var button = Ny.el('search-btn');
    if (!input) return;

    function run() {
      var q = input.value.trim();
      if (q.length < 2) { Ny.toast('Digite pelo menos 2 caracteres'); return; }
      search(q);
    }

    if (button) button.addEventListener('click', run);
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') run(); });

    var chips = Ny.el('search-chips');
    if (chips) {
      chips.addEventListener('click', function (e) {
        var chip = e.target.closest('.chip');
        if (!chip) return;
        Ny.all('.chip', chips).forEach(function (c) { c.classList.toggle('is-active', c === chip); });
        input.value = chip.dataset.query || chip.textContent;
        run();
      });
    }

    // estado inicial
    var grid = Ny.el('results');
    if (grid) {
      grid.innerHTML =
        '<div class="empty">' + Ny.ICON.search +
          '<h3>Descreva o que você precisa</h3>' +
          '<p>Escreva do seu jeito — ex: <code>plugin grátis pra escalar GUI</code>. A busca extrai as palavras-chave e os filtros sozinha.</p>' +
        '</div>';
    }
  };
})();
