/* ==========================================================================
   CONFIGURAÇÃO PÚBLICA
   --------------------------------------------------------------------------
   ATENÇÃO: este arquivo vai para o navegador do visitante.
   Coloque aqui SOMENTE informação pública.
   NUNCA coloque chaves secretas (sk_..., tokens de bot, senhas de banco).
   ========================================================================== */
window.NY_CONFIG = {
  siteName: 'NyScripts_Sources',
  author: 'Nydev',
  discordInvite: 'https://discord.gg/x23GGrfUF',

  /* ------------------------------------------------------------------
     Proxy da busca do catálogo (opcional, mas recomendado)

     O endpoint público do Roblox bloqueia chamadas diretas do navegador
     por CORS. Sem proxy a busca falha quando o site está hospedado.
     Suba um Cloudflare Worker (código pronto no README.md) e cole a URL
     aqui. Ex: 'https://ny-catalog.seuuser.workers.dev'
     Deixe vazio para tentar a chamada direta (funciona só em alguns casos).
  ------------------------------------------------------------------ */
  catalogProxy: '',

  /* ------------------------------------------------------------------
     Login com Google / GitHub / Discord via Clerk (opcional)

     1. crie a conta em https://clerk.com
     2. painel > API keys > copie a "Publishable key" (começa com pk_)
     3. cole abaixo. Só a publishable key — ela é pública por design.
        A Secret key (sk_...) NUNCA vai no front-end.
     Deixe vazio para desativar o login.
  ------------------------------------------------------------------ */
  clerkPublishableKey: ''
};
