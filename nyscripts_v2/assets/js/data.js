/* ==========================================================================
   CONTEÚDO DO SITE — edite só este arquivo para adicionar/remover itens.
   Não precisa mexer no HTML.

   Campos:
     title  (obrigatório) nome do item
     desc   (obrigatório) descrição curta
     link   (opcional)    URL http(s)
     tags   (opcional)    array de etiquetas — viram filtros automáticos
     price  (opcional)    'free' | 'paid'
     code   (opcional, só em scripts) código Luau exibido com botão copiar
   ========================================================================== */
window.NY_DATA = {

  /* ---------------------------------------------------------------- */
  /* PLUGINS — ferramentas do Roblox Studio                            */
  /* (curadoria inicial de plugins públicos e gratuitos: troque pelos  */
  /*  seus quando quiser)                                              */
  /* ---------------------------------------------------------------- */
  plugins: [
    {
      title: 'Building Tools by F3X',
      desc: 'Kit de construção completo dentro do Studio: mover, redimensionar, girar, pintar e texturizar com precisão.',
      link: 'https://create.roblox.com/store/asset/142785488',
      tags: ['building', 'terreno'],
      price: 'free'
    },
    {
      title: 'Archimedes Two',
      desc: 'Cria curvas, arcos e estruturas circulares com parts alinhadas automaticamente. Essencial para pontes e estradas.',
      link: 'https://create.roblox.com/store/asset/144303712',
      tags: ['building'],
      price: 'free'
    },
    {
      title: 'GapFill & Extrude',
      desc: 'Preenche vãos entre parts e faz extrusão de superfícies — resolve cantos e rampas em segundos.',
      link: 'https://create.roblox.com/store/asset/169708515',
      tags: ['building'],
      price: 'free'
    },
    {
      title: 'Tag Editor',
      desc: 'Interface visual para o CollectionService. Marque objetos com tags e trate tudo por código depois.',
      link: 'https://create.roblox.com/store/asset/948084095',
      tags: ['scripting', 'organização'],
      price: 'free'
    },
    {
      title: 'Part to Terrain',
      desc: 'Converte parts comuns em terreno voxel do Roblox — bom para montar mapas rápido.',
      link: 'https://create.roblox.com/store/asset/261794520',
      tags: ['terreno'],
      price: 'free'
    },
    {
      title: 'Rojo',
      desc: 'Sincroniza o Studio com arquivos locais e editor externo (VS Code). Permite Git e versionamento de verdade.',
      link: 'https://rojo.space',
      tags: ['scripting', 'workflow'],
      price: 'free'
    }
  ],

  /* ---------------------------------------------------------------- */
  /* SCRIPTS — código Lua/Luau próprio                                 */
  /* ---------------------------------------------------------------- */
  scripts: [
    {
      title: 'Leaderstats básico',
      desc: 'Cria dinheiro e nível para cada jogador que entra. Base de qualquer sistema de progressão.',
      tags: ['iniciante', 'server'],
      code:
'-- ServerScriptService > Script\n' +
'local Players = game:GetService("Players")\n\n' +
'Players.PlayerAdded:Connect(function(player)\n' +
'\tlocal stats = Instance.new("Folder")\n' +
'\tstats.Name = "leaderstats"\n' +
'\tstats.Parent = player\n\n' +
'\tlocal dinheiro = Instance.new("IntValue")\n' +
'\tdinheiro.Name = "Dinheiro"\n' +
'\tdinheiro.Value = 0\n' +
'\tdinheiro.Parent = stats\n\n' +
'\tlocal nivel = Instance.new("IntValue")\n' +
'\tnivel.Name = "Nivel"\n' +
'\tnivel.Value = 1\n' +
'\tnivel.Parent = stats\n' +
'end)'
    },
    {
      title: 'Perseguição de NPC (viatura)',
      desc: 'Faz um NPC perseguir o jogador mais próximo dentro de um raio, com recálculo de rota periódico.',
      tags: ['npc', 'server', 'intermediário'],
      code:
'-- Coloque dentro do modelo do NPC > Script\n' +
'local PathfindingService = game:GetService("PathfindingService")\n' +
'local Players = game:GetService("Players")\n\n' +
'local npc = script.Parent\n' +
'local humanoid = npc:WaitForChild("Humanoid")\n' +
'local raiz = npc:WaitForChild("HumanoidRootPart")\n\n' +
'local RAIO = 200\n\n' +
'local function alvoMaisProximo()\n' +
'\tlocal alvo, menorDist = nil, RAIO\n' +
'\tfor _, player in ipairs(Players:GetPlayers()) do\n' +
'\t\tlocal char = player.Character\n' +
'\t\tlocal hrp = char and char:FindFirstChild("HumanoidRootPart")\n' +
'\t\tlocal hum = char and char:FindFirstChildOfClass("Humanoid")\n' +
'\t\tif hrp and hum and hum.Health > 0 then\n' +
'\t\t\tlocal dist = (hrp.Position - raiz.Position).Magnitude\n' +
'\t\t\tif dist < menorDist then\n' +
'\t\t\t\talvo, menorDist = hrp, dist\n' +
'\t\t\tend\n' +
'\t\tend\n' +
'\tend\n' +
'\treturn alvo\n' +
'end\n\n' +
'while task.wait(0.6) do\n' +
'\tlocal alvo = alvoMaisProximo()\n' +
'\tif not alvo then continue end\n\n' +
'\tlocal caminho = PathfindingService:CreatePath({ AgentRadius = 3, AgentCanJump = true })\n' +
'\tlocal ok = pcall(function()\n' +
'\t\tcaminho:ComputeAsync(raiz.Position, alvo.Position)\n' +
'\tend)\n\n' +
'\tif ok and caminho.Status == Enum.PathStatus.Success then\n' +
'\t\tfor _, ponto in ipairs(caminho:GetWaypoints()) do\n' +
'\t\t\tif ponto.Action == Enum.PathWaypointAction.Jump then\n' +
'\t\t\t\thumanoid.Jump = true\n' +
'\t\t\tend\n' +
'\t\t\thumanoid:MoveTo(ponto.Position)\n' +
'\t\t\tif not humanoid.MoveToFinished:Wait() then break end\n' +
'\t\tend\n' +
'\telse\n' +
'\t\thumanoid:MoveTo(alvo.Position)\n' +
'\tend\n' +
'end'
    },
    {
      title: 'RemoteEvent com validação (anti-exploit)',
      desc: 'Modelo correto de RemoteEvent: nunca confie no cliente. Valida tipo, alcance e aplica cooldown no servidor.',
      tags: ['segurança', 'server', 'avançado'],
      code:
'-- ServerScriptService > Script\n' +
'local ReplicatedStorage = game:GetService("ReplicatedStorage")\n' +
'local remote = ReplicatedStorage:WaitForChild("ComprarItem")\n\n' +
'local PRECOS = { espada = 100, escudo = 250 }\n' +
'local COOLDOWN = 1\n' +
'local ultimoUso = {}\n\n' +
'remote.OnServerEvent:Connect(function(player, item)\n' +
'\t-- 1. valida o tipo do dado recebido\n' +
'\tif type(item) ~= "string" then return end\n\n' +
'\t-- 2. valida se o item existe mesmo\n' +
'\tlocal preco = PRECOS[item]\n' +
'\tif not preco then return end\n\n' +
'\t-- 3. cooldown por jogador (evita spam do remote)\n' +
'\tlocal agora = os.clock()\n' +
'\tif ultimoUso[player.UserId] and agora - ultimoUso[player.UserId] < COOLDOWN then\n' +
'\t\treturn\n' +
'\tend\n' +
'\tultimoUso[player.UserId] = agora\n\n' +
'\t-- 4. o servidor decide, o cliente só pede\n' +
'\tlocal stats = player:FindFirstChild("leaderstats")\n' +
'\tlocal dinheiro = stats and stats:FindFirstChild("Dinheiro")\n' +
'\tif not dinheiro or dinheiro.Value < preco then return end\n\n' +
'\tdinheiro.Value -= preco\n' +
'\tprint(player.Name .. " comprou " .. item)\n' +
'end)\n\n' +
'game:GetService("Players").PlayerRemoving:Connect(function(player)\n' +
'\tultimoUso[player.UserId] = nil\n' +
'end)'
    }
  ],

  /* ---------------------------------------------------------------- */
  /* TUTORIAIS                                                         */
  /* ---------------------------------------------------------------- */
  tutoriais: [
    {
      title: 'Luau — a linguagem do Roblox',
      desc: 'Documentação oficial da linguagem: tipos, escopo, tabelas e as diferenças em relação ao Lua padrão.',
      link: 'https://create.roblox.com/docs/luau',
      tags: ['oficial', 'iniciante']
    },
    {
      title: 'Cliente x Servidor',
      desc: 'Entenda o modelo de replicação do Roblox — o conceito que separa quem sabe scriptar de quem só copia código.',
      link: 'https://create.roblox.com/docs/scripting/networking/client-server-runtime',
      tags: ['oficial', 'intermediário']
    },
    {
      title: 'RemoteEvents e RemoteFunctions',
      desc: 'Como cliente e servidor conversam com segurança, e por que validar tudo do lado do servidor.',
      link: 'https://create.roblox.com/docs/scripting/events/remote',
      tags: ['oficial', 'segurança']
    },
    {
      title: 'Salvando dados com DataStore',
      desc: 'Persistência de progresso entre sessões, tratamento de erro e boas práticas para não perder save.',
      link: 'https://create.roblox.com/docs/cloud-services/data-stores',
      tags: ['oficial', 'intermediário']
    },
    {
      title: 'Pathfinding — NPCs que andam sozinhos',
      desc: 'Base para inimigos, viaturas e qualquer NPC que precise navegar pelo mapa desviando de obstáculos.',
      link: 'https://create.roblox.com/docs/characters/pathfinding',
      tags: ['oficial', 'npc']
    },
    {
      title: 'Performance e otimização',
      desc: 'Como achar gargalos com o MicroProfiler e manter o jogo rodando liso em aparelho fraco.',
      link: 'https://create.roblox.com/docs/performance-optimization',
      tags: ['oficial', 'avançado']
    }
  ]
};

/* ==========================================================================
   Renderização das coleções (usada por plugins/scripts/tutoriais)
   ========================================================================== */
(function () {
  'use strict';

  function build(item, iconName, opts) {
    var Ny = window.Ny;
    var tags = (item.tags || []).map(function (t) {
      return '<span class="tag">' + Ny.esc(t) + '</span>';
    }).join('');

    if (item.price === 'free') tags = '<span class="tag tag-free">Grátis</span>' + tags;
    if (item.price === 'paid') tags = '<span class="tag tag-paid">Pago</span>' + tags;

    var snippet = '';
    if (opts.showCode && item.code) {
      snippet =
        '<div class="snippet">' +
          '<div class="snippet-head">' +
            '<span>' + Ny.esc((item.file || 'Script') + '.lua') + '</span>' +
            '<button class="copy-btn" type="button" data-copy="' + Ny.esc(item.code) + '">' + Ny.ICON.copy + 'Copiar</button>' +
          '</div>' +
          '<pre><code>' + Ny.esc(item.code) + '</code></pre>' +
        '</div>';
    }

    var link = item.link
      ? '<a class="card-link" href="' + Ny.safeUrl(item.link) + '" target="_blank" rel="noopener">Abrir' + Ny.ICON.external + '</a>'
      : '';

    return '' +
      '<article class="card reveal">' +
        '<div class="card-icon">' + Ny.ICON[iconName] + '</div>' +
        (tags ? '<div class="tags">' + tags + '</div>' : '') +
        '<h3>' + Ny.esc(item.title) + '</h3>' +
        '<p>' + Ny.esc(item.desc) + '</p>' +
        snippet +
        link +
      '</article>';
  }

  /**
   * Monta uma coleção com busca por texto e filtro por tag.
   * @param {object} o { key, gridId, searchId, chipsId, icon, showCode, emptyTitle, emptyText }
   */
  window.NyCollection = function (o) {
    var Ny = window.Ny;
    var items = (window.NY_DATA[o.key] || []).slice();
    var grid = Ny.el(o.gridId);
    if (!grid) return;

    var input = o.searchId ? Ny.el(o.searchId) : null;
    var chipsHost = o.chipsId ? Ny.el(o.chipsId) : null;
    var activeTag = 'todos';

    if (chipsHost) {
      var tags = ['todos'];
      items.forEach(function (it) {
        (it.tags || []).forEach(function (t) { if (tags.indexOf(t) === -1) tags.push(t); });
      });
      chipsHost.innerHTML = tags.map(function (t, i) {
        return '<button class="chip' + (i === 0 ? ' is-active' : '') + '" type="button" data-tag="' + Ny.esc(t) + '">' + Ny.esc(t) + '</button>';
      }).join('');
      chipsHost.addEventListener('click', function (e) {
        var chip = e.target.closest('.chip');
        if (!chip) return;
        activeTag = chip.dataset.tag;
        Ny.all('.chip', chipsHost).forEach(function (c) { c.classList.toggle('is-active', c === chip); });
        render();
      });
    }

    function render() {
      var q = input ? input.value.trim().toLowerCase() : '';
      var list = items.filter(function (it) {
        var okTag = activeTag === 'todos' || (it.tags || []).indexOf(activeTag) !== -1;
        var haystack = (it.title + ' ' + it.desc + ' ' + (it.tags || []).join(' ')).toLowerCase();
        return okTag && (!q || haystack.indexOf(q) !== -1);
      });

      if (!list.length) {
        grid.innerHTML =
          '<div class="empty">' + Ny.ICON.inbox +
            '<h3>' + Ny.esc(q || activeTag !== 'todos' ? 'Nada encontrado' : (o.emptyTitle || 'Nada por aqui ainda')) + '</h3>' +
            '<p>' + (q || activeTag !== 'todos'
              ? 'Tente outro termo ou volte para o filtro <code>todos</code>.'
              : Ny.esc(o.emptyText || '') + ' Adicione itens em <code>assets/js/data.js</code>.') + '</p>' +
          '</div>';
        return;
      }

      grid.innerHTML = list.map(function (it) { return build(it, o.icon, o); }).join('');
      Ny.reveal(grid);

      Ny.all('[data-copy]', grid).forEach(function (btn) {
        btn.addEventListener('click', function () { Ny.copy(btn.dataset.copy); });
      });
    }

    if (input) input.addEventListener('input', Ny.debounce(render, 140));
    render();
  };
})();
