const { execFileSync } = require('child_process');
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const BASE = 'http://localhost:8391/';

const PAGES = {
  'index.html':      ['Anix // IA', 'typed-script', 'chat.html', 'Criação de scripts'],
  'plugins.html':    ['Sobre o site e a IA Anix', 'source-main', 'Licença e uso'],
  'scripts.html':    ['Scripts organizados do source-main', 'VoidHub.lua.txt', 'Defense.lua.txt'],
  'chat.html':       ['id="chat-form"', 'id="message-input"', 'Qwen'],
  'tutoriais.html':  ['Luau', 'card-link', 'chip'],
  'modelos.html':    ['id="chat-form"', 'id="message-input"', 'Qwen'],
  'comunidade.html': ['discord.gg', 'community-cards', 'Regras'],
  'suporte.html':    ['Canal de tickets', 'Um ticket por vez'],
  'regras.html':     ['rule-head', 'rule-num', 'Uso do bot', 'toggle-all'],
  'creditos.html':   ['Nydev', 'person-avatar'],
  '404.html':        ['404', 'Voltar ao início']
};

let problemas = 0;

for (const [page, markers] of Object.entries(PAGES)) {
  let dom = '';
  try {
    dom = execFileSync(EDGE, [
      '--headless=new', '--disable-gpu', '--no-sandbox',
      '--virtual-time-budget=3500', '--dump-dom', BASE + page
    ], { encoding: 'utf8', maxBuffer: 40 * 1024 * 1024, timeout: 60000 });
  } catch (e) {
    console.log(`ERRO ao abrir ${page}: ${e.message}`);
    problemas++;
    continue;
  }

  const faltando = markers.filter(m => !dom.includes(m));
  const vazios = [];
  // containers que precisam ter sido preenchidos por JS
  for (const id of ['home-cards', 'community-cards', 'collection', 'rules', 'tips', 'results']) {
    const re = new RegExp(`id="${id}"[^>]*>\\s*</`, 'i');
    if (re.test(dom)) vazios.push(id);
  }

  const ok = faltando.length === 0 && vazios.length === 0;
  console.log(`${ok ? 'OK  ' : 'FAIL'} ${page.padEnd(17)} ${dom.length} bytes` +
    (faltando.length ? ` | faltando: ${faltando.join(', ')}` : '') +
    (vazios.length ? ` | container vazio: ${vazios.join(', ')}` : ''));
  if (!ok) problemas++;
}

console.log(problemas === 0 ? '\nTODAS AS PAGINAS OK' : `\n${problemas} pagina(s) com problema`);
