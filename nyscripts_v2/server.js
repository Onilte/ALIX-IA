'use strict';

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = __dirname;
const PORT = Number(process.env.PORT || 8391);
const MAX_BODY_BYTES = 64 * 1024 * 1024;
const MAX_MESSAGE_CHARS = 11 * 1024 * 1024;
const QWEN_API_URL = process.env.QWEN_API_URL || 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions';
const QWEN_MODEL = process.env.QWEN_MODEL || 'qwen-plus';

const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8'
};

function sendJson(res, status, value) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff'
  });
  res.end(JSON.stringify(value));
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    let bytes = 0;
    let exceeded = false;
    req.setEncoding('utf8');

    req.on('data', (chunk) => {
      if (exceeded) return;
      bytes += Buffer.byteLength(chunk);
      if (bytes > MAX_BODY_BYTES) {
        exceeded = true;
        reject(Object.assign(new Error('A solicitação excede o limite de 64 MB após a serialização JSON.'), { status: 413 }));
        return;
      }
      body += chunk;
    });
    req.on('end', () => {
      if (exceeded) return;
      try {
        resolve(JSON.parse(body || '{}'));
      } catch {
        reject(Object.assign(new Error('O corpo enviado não contém JSON válido.'), { status: 400 }));
      }
    });
    req.on('error', reject);
  });
}

function getMessages(value) {
  if (!Array.isArray(value.messages) || value.messages.length === 0 || value.messages.length > 40) {
    throw Object.assign(new Error('Envie entre 1 e 40 mensagens.'), { status: 400 });
  }

  const messages = value.messages.map((message) => {
    if (!message || !['user', 'assistant'].includes(message.role) || typeof message.content !== 'string') {
      throw Object.assign(new Error('Uma mensagem tem formato inválido.'), { status: 400 });
    }
    if (message.content.length > MAX_MESSAGE_CHARS) {
      throw Object.assign(new Error('Uma mensagem excede o limite de 10 MB de anexos mais texto adicional.'), { status: 413 });
    }
    return { role: message.role, content: message.content };
  });

  if (messages[messages.length - 1].role !== 'user') {
    throw Object.assign(new Error('A última mensagem precisa ser do usuário.'), { status: 400 });
  }

  return messages;
}

async function handleChat(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    sendJson(res, 405, { error: 'Use POST para enviar uma conversa.' });
    return;
  }

  if (!process.env.QWEN_API_KEY) {
    sendJson(res, 503, { error: 'QWEN_API_KEY não está configurada no servidor.' });
    return;
  }

  try {
    const payload = await readJson(req);
    const messages = getMessages(payload);
    const systemMessage = {
      role: 'system',
      content: [
        'Você é Anix, uma assistente de programação que responde em português claro e ajuda com desenvolvimento legítimo.',
        'Ajude com Lua/Luau para Roblox Studio, sites, automação, documentação, depuração e explicações.',
        'Priorize código seguro para jogos e projetos controlados pelo usuário. Não produza cheats, aimbots, ESP, roubo de dados, spam de remotes, bypass de anti-cheat ou código para explorar jogos de terceiros.',
        'Ao receber código, explique primeiro o que observou e depois proponha mudanças. Não afirme ter lido arquivos que não foram anexados à conversa.',
        'Quando faltarem detalhes técnicos, indique as suposições e os limites relevantes.'
      ].join(' ')
    };

    const response = await fetch(QWEN_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.QWEN_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: QWEN_MODEL,
        messages: [systemMessage, ...messages],
        stream: false
      }),
      signal: AbortSignal.timeout(120000)
    });

    const result = await response.json().catch(() => null);
    if (!response.ok) {
      const detail = result && result.error && result.error.message;
      console.error(`Qwen API respondeu HTTP ${response.status}${detail ? `: ${detail}` : ''}`);
      sendJson(res, 502, { error: 'A Qwen não conseguiu processar a solicitação. Verifique a configuração e tente novamente.' });
      return;
    }

    const answer = result && result.choices && result.choices[0] && result.choices[0].message && result.choices[0].message.content;
    if (typeof answer !== 'string' || !answer.trim()) {
      console.error('Resposta da Qwen veio sem texto em choices[0].message.content.');
      sendJson(res, 502, { error: 'A resposta da Qwen veio vazia ou em formato inesperado.' });
      return;
    }

    sendJson(res, 200, { answer });
  } catch (error) {
    const status = error.status || (error.name === 'TimeoutError' ? 504 : 500);
    if (status >= 500) console.error('Falha no endpoint de chat:', error.message);
    sendJson(res, status, { error: error.message || 'Falha ao processar a conversa.' });
  }
}

function serveStatic(req, res) {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url, `http://${req.headers.host}`).pathname);
  } catch {
    res.writeHead(400);
    res.end('URL inválida');
    return;
  }

  const relativePath = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  const filePath = path.resolve(ROOT, relativePath);
  if (filePath !== ROOT && !filePath.startsWith(ROOT + path.sep)) {
    res.writeHead(403);
    res.end('Proibido');
    return;
  }

  fs.stat(filePath, (statError, stats) => {
    if (statError || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Arquivo não encontrado');
      return;
    }

    res.writeHead(200, {
      'Content-Type': MIME_TYPES[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
      'X-Content-Type-Options': 'nosniff'
    });
    fs.createReadStream(filePath).pipe(res);
  });
}

const server = http.createServer((req, res) => {
  if (req.url.split('?')[0] === '/api/chat') {
    handleChat(req, res);
    return;
  }
  serveStatic(req, res);
});

server.listen(PORT, () => {
  console.log(`Anix disponível em http://localhost:${PORT}`);
  if (!process.env.QWEN_API_KEY) console.warn('Configure QWEN_API_KEY no ambiente para habilitar o chat.');
});

module.exports = server;
