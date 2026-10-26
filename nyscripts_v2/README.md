# Anix

Assistente de desenvolvimento com pÃ¡ginas estÃ¡ticas e um servidor Node.js para integrar a API Qwen.

## Anix com Qwen

O chat da Anix agora usa um servidor Node.js para chamar a API compatÃ­vel com OpenAI da Qwen. A chave da API deve ficar somente no ambiente do servidor; nunca cole-a em HTML, JavaScript do navegador, GitHub ou mensagens.

1. Revogue qualquer chave que tenha sido compartilhada em uma conversa ou commit e crie uma chave nova.
2. Abra o PowerShell nesta pasta e defina a chave apenas para a sessÃ£o atual:

   ```powershell
   $env:QWEN_API_KEY = '[REVOKED_KEY_REMOVED]-mr-45935bae5f6b756150c8127a040025468d795778aa76609e79a939eccd02684a'
   node .\server.js
   ```

3. Acesse `http://localhost:8391/chat.html`.

VariÃ¡veis opcionais:

| VariÃ¡vel | PadrÃ£o | Uso |
|---|---|---|
| `QWEN_API_URL` | `https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions` | Endpoint OpenAI-compatible da Qwen |
| `QWEN_MODEL` | `qwen-plus` | Modelo habilitado para sua conta |
| `PORT` | `8391` | Porta local do servidor |

O histÃ³rico do navegador Ã© salvo localmente. O chat aceita atÃ© 10 arquivos de texto/cÃ³digo por envio, com limite combinado de 10 MB. Um arquivo individual tambÃ©m pode chegar a 10 MB, desde que o total dos anexos nÃ£o ultrapasse esse limite. O servidor permite atÃ© 64 MB no corpo JSON para acomodar a codificaÃ§Ã£o dos arquivos, mas o tamanho e o contexto aceitos pela API Qwen ainda dependem do modelo e da conta. Para publicar o serviÃ§o, configure HTTPS, autenticaÃ§Ã£o e limites de uso para evitar consumo indevido da chave.

---

## âš ï¸ AÃ‡ÃƒO URGENTE â€” chave secreta vazada

O arquivo `auth.js` da versÃ£o antiga continha isto, **no cÃ³digo que vai para o
navegador de qualquer visitante**:

```
CLERK_SECRET_KEY = [REDACTED]
```

A *secret key* do Clerk dÃ¡ controle total da sua aplicaÃ§Ã£o: criar, ler, alterar e
apagar usuÃ¡rios. Qualquer pessoa que abrisse o site conseguiria lÃª-la (basta ver
o cÃ³digo-fonte da pÃ¡gina).

**O que fazer agora:**

1. Entre em <https://dashboard.clerk.com> â†’ **API keys**
2. Clique em **Regenerate** na Secret key (isso invalida a antiga na hora)
3. Nunca cole a nova em nenhum arquivo do front-end
4. Se esse cÃ³digo jÃ¡ foi para o GitHub, apagar o arquivo **nÃ£o basta** â€” a chave
   fica no histÃ³rico. Regenerar Ã© o Ãºnico jeito de resolver

Regra prÃ¡tica:

| Chave | Onde pode ficar |
|---|---|
| `pk_test_...` / `pk_live_...` (publishable) | pode ir no front-end, Ã© pÃºblica por design |
| `sk_test_...` / `sk_live_...` (secret) | **sÃ³** no servidor, em variÃ¡vel de ambiente |

---

## Estrutura

```
nyscripts_v2/
â”œâ”€â”€ index.html          PÃ¡gina inicial Anix
â”œâ”€â”€ plugins.html        DocumentaÃ§Ã£o
â”œâ”€â”€ scripts.html        CatÃ¡logo de nomes de scripts
â”œâ”€â”€ chat.html           Interface de conversa da IA
â”œâ”€â”€ server.js           Servidor estÃ¡tico + proxy seguro para Qwen
â”œâ”€â”€ README.md
â””â”€â”€ assets/
    â”œâ”€â”€ images/anix-logo.png
    â””â”€â”€ js/chat.js      HistÃ³rico local, anexos e envio de mensagens
```

---

## Como usar

Para usar o chat, inicie o servidor integrado e abra a pÃ¡gina pelo endereÃ§o local:

```powershell
$env:QWEN_API_KEY = 'SUA_CHAVE_NOVA'
node .\server.js
```

Abrir o HTML diretamente ou usar um servidor estÃ¡tico separado nÃ£o conecta ao endpoint da Qwen.

---

## Adicionar conteÃºdo

Tudo fica em **`assets/js/data.js`**. NÃ£o precisa mexer no HTML.

```js
plugins: [
  {
    title: 'Nome do plugin',
    desc:  'O que ele faz, em uma frase.',
    link:  'https://create.roblox.com/store/asset/000000',
    tags:  ['building', 'terreno'],   // viram filtros automaticamente
    price: 'free'                     // 'free' ou 'paid'
  }
]
```

Script com cÃ³digo copiÃ¡vel:

```js
scripts: [
  {
    title: 'Meu sistema',
    desc:  'O que ele faz.',
    tags:  ['server'],
    file:  'MeuSistema',        // vira "MeuSistema.lua" no cabeÃ§alho
    code:  'print("olÃ¡")\n'     // aparece com botÃ£o de copiar
  }
]
```

As tags viram chips de filtro sozinhas, e a busca por texto funciona em cima de
tÃ­tulo, descriÃ§Ã£o e tags.

---

## ConfiguraÃ§Ã£o (`config.js`)

| Campo | Para que serve |
|---|---|
| `discordInvite` | link do convite usado no header, footer e botÃµes |
| `catalogProxy` | URL do proxy da busca (veja abaixo) â€” vazio = chamada direta |
| `clerkPublishableKey` | ativa o login. Vazio = site funciona sem login |

---

## Proxy da busca (resolve o erro de CORS)

O endpoint do Roblox recusa chamadas feitas direto do navegador. Sem proxy a
busca de modelos falha quando o site estÃ¡ publicado. A soluÃ§Ã£o Ã© um Cloudflare
Worker (plano gratuito resolve):

1. Acesse <https://dash.cloudflare.com> â†’ **Workers & Pages** â†’ **Create Worker**
2. Cole o cÃ³digo abaixo e clique em **Deploy**
3. Copie a URL gerada e cole em `catalogProxy` no `config.js`

```js
const PERMITIDOS = [
  'catalog.roblox.com',
  'thumbnails.roblox.com',
  'apis.roblox.com'
];

export default {
  async fetch(request) {
    const cors = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: cors });
    }

    const alvo = new URL(request.url).searchParams.get('url');
    if (!alvo) {
      return new Response('faltou ?url=', { status: 400, headers: cors });
    }

    let destino;
    try {
      destino = new URL(alvo);
    } catch {
      return new Response('url invÃ¡lida', { status: 400, headers: cors });
    }

    // sÃ³ repassa para domÃ­nios do Roblox â€” evita virar proxy aberto
    if (!PERMITIDOS.includes(destino.hostname)) {
      return new Response('domÃ­nio nÃ£o permitido', { status: 403, headers: cors });
    }

    const resposta = await fetch(destino.toString(), {
      headers: { 'Accept': 'application/json' }
    });

    return new Response(resposta.body, {
      status: resposta.status,
      headers: {
        ...cors,
        'Content-Type': resposta.headers.get('Content-Type') || 'application/json',
        'Cache-Control': 'public, max-age=300'
      }
    });
  }
};
```

---

## Login com Google / GitHub / Discord (opcional)

1. Crie a conta em <https://clerk.com>
2. Crie uma aplicaÃ§Ã£o e ative os provedores em **SSO connections**
3. Copie a **Publishable key** (`pk_...`) e cole em `clerkPublishableKey`

SÃ³ isso. A secret key **nÃ£o** entra em lugar nenhum do site.

---

## Publicar

| Onde | Como |
|---|---|
| **GitHub Pages** | suba a pasta no repositÃ³rio â†’ Settings â†’ Pages â†’ branch `main` |
| **Netlify** | arraste a pasta em <https://app.netlify.com/drop> |
| **Vercel** | `vercel deploy` na pasta, ou importe o repositÃ³rio |
| **Cloudflare Pages** | conecte o repositÃ³rio, sem comando de build |

Como nÃ£o hÃ¡ build, qualquer host de arquivo estÃ¡tico funciona.

---

## O que mudou em relaÃ§Ã£o Ã  versÃ£o antiga

**SeguranÃ§a**
- Removida a secret key do Clerk do cÃ³digo do navegador
- Escape de HTML em todo conteÃºdo dinÃ¢mico (fecha brecha de XSS)
- Links validados: sÃ³ passa `http`/`https` (bloqueia `javascript:`)
- Proxy do catÃ¡logo com lista de domÃ­nios permitidos

**Bugs corrigidos**
- `auth.js` tinha erro de sintaxe e nunca era carregado por nenhuma pÃ¡gina
- VariÃ¡veis inexistentes: `CLERK_FRONTEND_API` e `CLERK_PUBLISHABLE_KEY`
- Filtro de plugins com `|| true`, que anulava o prÃ³prio filtro
- `creditos`, `regras` e `suporte` marcavam o item errado no menu

**Interface**
- Design system novo: aurora animada, glassmorphism, gradientes e micro-interaÃ§Ãµes
- Menu mobile de verdade (drawer com overlay), dropdown de comunidade
- AnimaÃ§Ã£o de entrada por seÃ§Ã£o, barra de progresso, botÃ£o de voltar ao topo
- Skeleton na busca, estados de vazio e de erro desenhados
- Regras viraram accordion; scripts ganharam bloco de cÃ³digo com copiar

**Estrutura**
- ConteÃºdo centralizado em `data.js` â€” antes ficava espalhado no HTML
- Header e footer gerados por JS, um Ãºnico ponto de manutenÃ§Ã£o
- Busca e filtro por tag em plugins, scripts e tutoriais
- PÃ¡gina 404, favicon, meta tags de SEO e Open Graph
- Acessibilidade: foco visÃ­vel, `aria-*`, suporte a `prefers-reduced-motion`
