/* ==========================================================================
   LOGIN (opcional) — Google / GitHub / Discord via Clerk
   --------------------------------------------------------------------------
   SEGURANÇA — leia antes de mexer:

   Tudo que está neste arquivo é baixado pelo navegador de quem visita o site.
   Portanto:

     PODE ficar aqui:  Publishable key  (pk_test_... / pk_live_...)
     NUNCA pode:       Secret key       (sk_test_... / sk_live_...)

   A secret key dá controle total da sua aplicação Clerk (criar, ler e
   apagar usuários). Se ela já apareceu em algum arquivo do front-end,
   considere-a vazada: vá no painel do Clerk > API keys e clique em
   "Regenerate" para invalidá-la.

   Como ativar o login:
     1. crie a conta em https://clerk.com
     2. crie uma aplicação e ative Google, GitHub e Discord em
        "SSO connections" (em modo de desenvolvimento o Clerk já fornece
        credenciais de teste, sem precisar criar OAuth app em cada provedor)
     3. copie a Publishable key e cole em `clerkPublishableKey` no config.js

   Deixando `clerkPublishableKey` vazio, o site funciona normalmente,
   apenas sem botão de login.
   ========================================================================== */
(function () {
  'use strict';

  var CFG = window.NY_CONFIG || {};
  var KEY = (CFG.clerkPublishableKey || '').trim();

  /**
   * A publishable key carrega o domínio do frontend em base64.
   * pk_test_<base64("exemplo-12.clerk.accounts.dev$")>
   */
  function frontendApiFromKey(key) {
    try {
      var encoded = key.replace(/^pk_(test|live)_/, '');
      var decoded = atob(encoded);
      return decoded.replace(/\$+$/, '');
    } catch (e) {
      return '';
    }
  }

  function slot() {
    return document.getElementById('auth-slot');
  }

  function showDisabled() {
    var host = slot();
    if (!host) return;
    host.innerHTML = '';
  }

  function mountUI() {
    var host = slot();
    if (!host || !window.Clerk) return;
    host.innerHTML = '';

    if (window.Clerk.user) {
      window.Clerk.mountUserButton(host);
    } else {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn btn-ghost btn-sm';
      btn.textContent = 'Entrar';
      btn.addEventListener('click', function () { window.Clerk.openSignIn(); });
      host.appendChild(btn);
    }
  }

  function load() {
    if (!KEY || KEY.indexOf('pk_') !== 0) {
      showDisabled();
      return;
    }

    var host = frontendApiFromKey(KEY);
    if (!host) {
      console.warn('[auth] publishable key inválida — login desativado.');
      showDisabled();
      return;
    }

    var script = document.createElement('script');
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.src = 'https://' + host + '/npm/@clerk/clerk-js@5/dist/clerk.browser.js';
    script.setAttribute('data-clerk-publishable-key', KEY);

    script.addEventListener('load', function () {
      window.Clerk.load()
        .then(function () {
          mountUI();
          window.Clerk.addListener(mountUI);
        })
        .catch(function (err) {
          console.warn('[auth] Clerk não carregou:', err);
          showDisabled();
        });
    });

    script.addEventListener('error', function () {
      console.warn('[auth] não foi possível baixar o Clerk.');
      showDisabled();
    });

    document.head.appendChild(script);
  }

  // chamado pelo Ny.boot() depois que o header existe no DOM
  window.NyAuth = load;
})();
