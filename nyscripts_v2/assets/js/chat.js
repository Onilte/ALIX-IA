'use strict';

(function () {
  const STORAGE_KEY = 'anix-chat-sessions-v1';
  const MAX_FILES = 10;
  const MAX_FILE_BYTES = 10 * 1024 * 1024;
  const MAX_TOTAL_FILE_BYTES = 10 * 1024 * 1024;
  const ALLOWED_EXTENSIONS = new Set(['lua', 'luau', 'txt', 'md', 'json', 'csv', 'js', 'ts', 'html', 'css', 'py', 'xml']);
  const form = document.getElementById('chat-form');
  const input = document.getElementById('message-input');
  const fileInput = document.getElementById('file-input');
  const fileList = document.getElementById('file-list');
  const messageList = document.getElementById('message-list');
  const historyList = document.getElementById('history-list');
  const status = document.getElementById('chat-status');
  const sendButton = document.getElementById('send-button');
  const newChatButton = document.getElementById('new-chat-button');
  let selectedFiles = [];
  let sessions = loadSessions();
  let activeId = sessions[0] && sessions[0].id;

  function loadSessions() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      return Array.isArray(saved) ? saved.filter((item) => item && typeof item.id === 'string' && Array.isArray(item.messages)) : [];
    } catch (error) {
      console.error('Não foi possível carregar o histórico local:', error);
      return [];
    }
  }

  function currentSession() {
    return sessions.find((session) => session.id === activeId);
  }

  function persistSessions() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    } catch (error) {
      console.error('Não foi possível salvar o histórico local:', error);
      setStatus('O armazenamento do navegador está cheio; esta conversa pode não ficar salva.', true);
    }
  }

  function setStatus(message, isError) {
    status.textContent = message;
    status.classList.toggle('is-error', Boolean(isError));
  }

  function makeId() {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }

  function escapeHtml(value) {
    return value.replace(/[&<>"']/g, (character) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[character]);
  }

  function renderMarkdownLite(value) {
    return escapeHtml(value)
      .replace(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g, '<pre class="code-output"><code>$2</code></pre>')
      .replace(/`([^`\n]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
  }

  function renderMessages() {
    const session = currentSession();
    const hasMessages = Boolean(session && session.messages.length);
    document.getElementById('welcome-state').hidden = hasMessages;
    messageList.hidden = !hasMessages;
    messageList.replaceChildren();
    if (!hasMessages) return;

    session.messages.forEach((message) => {
      const article = document.createElement('article');
      article.className = `message ${message.role}`;
      const label = message.role === 'assistant' ? 'Anix' : 'Você';
      article.innerHTML = `<div class="message-avatar" aria-hidden="true">${message.role === 'assistant' ? '<img src="assets/images/anix-logo.png" alt="" />' : 'V'}</div><div class="message-content"><strong>${label}</strong><div class="message-text">${renderMarkdownLite(message.content)}</div></div>`;
      messageList.appendChild(article);
    });
    messageList.scrollTop = messageList.scrollHeight;
  }

  function renderHistory() {
    historyList.replaceChildren();
    sessions.forEach((session) => {
      const item = document.createElement('button');
      item.type = 'button';
      item.className = `history-item${session.id === activeId ? ' active' : ''}`;
      item.textContent = session.title || 'Nova conversa';
      item.addEventListener('click', () => {
        activeId = session.id;
        renderHistory();
        renderMessages();
      });
      historyList.appendChild(item);
    });
  }

  function createSession() {
    const session = { id: makeId(), title: 'Nova conversa', messages: [], updatedAt: Date.now() };
    sessions.unshift(session);
    activeId = session.id;
    persistSessions();
    renderHistory();
    renderMessages();
    input.focus();
  }

  function renderFiles() {
    fileList.replaceChildren();
    selectedFiles.forEach((file, index) => {
      const chip = document.createElement('span');
      chip.className = 'file-chip';
      chip.textContent = `${file.name} (${formatBytes(file.size)})`;
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.setAttribute('aria-label', `Remover ${file.name}`);
      remove.textContent = '×';
      remove.addEventListener('click', () => {
        selectedFiles.splice(index, 1);
        renderFiles();
      });
      chip.appendChild(remove);
      fileList.appendChild(chip);
    });
    document.getElementById('file-count').textContent = `${selectedFiles.length}/${MAX_FILES} arquivos`;
  }

  function formatBytes(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  function addFiles(files) {
    const incoming = Array.from(files);
    const next = selectedFiles.slice();
    for (const file of incoming) {
      const extension = file.name.split('.').pop().toLowerCase();
      if (!ALLOWED_EXTENSIONS.has(extension)) {
        setStatus(`Formato não suportado: ${file.name}. Anexe arquivos de texto ou código.`, true);
        continue;
      }
      if (file.size > MAX_FILE_BYTES) {
        setStatus(`${file.name} excede o limite de 10 MB por arquivo.`, true);
        continue;
      }
      if (next.length >= MAX_FILES) {
        setStatus('O limite é de 10 arquivos por mensagem.', true);
        break;
      }
      if (next.reduce((total, current) => total + current.size, 0) + file.size > MAX_TOTAL_FILE_BYTES) {
        setStatus('O total dos arquivos anexados não pode exceder 10 MB por mensagem.', true);
        break;
      }
      next.push(file);
    }
    selectedFiles = next;
    renderFiles();
  }

  async function readSelectedFiles() {
    return Promise.all(selectedFiles.map(async (file) => ({
      name: file.name,
      content: await file.text()
    })));
  }

  async function sendMessage(event) {
    event.preventDefault();
    const text = input.value.trim();
    if (!text && selectedFiles.length === 0) {
      setStatus('Escreva uma mensagem ou anexe um arquivo.', true);
      input.focus();
      return;
    }

    if (!currentSession()) createSession();
    const session = currentSession();
    const files = await readSelectedFiles();
    const originalFiles = selectedFiles.slice();
    let messageText = text;
    if (files.length) {
      const fileContent = files.map((file) => `\n\n--- Arquivo: ${file.name} ---\n${file.content}`).join('');
      messageText = `${text || 'Analise os arquivos anexados.'}${fileContent}`;
    }
    session.messages.push({ role: 'user', content: messageText });
    if (session.messages.length === 1) session.title = (text || files[0].name).slice(0, 48);
    session.updatedAt = Date.now();
    input.value = '';
    selectedFiles = [];
    renderFiles();
    renderMessages();
    renderHistory();
    persistSessions();
    setStatus('Anix está pensando…', false);
    sendButton.disabled = true;
    sendButton.textContent = 'Enviando…';

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: session.messages.slice(-12) })
      });
      const responseText = await response.text();
      let result;
      try {
        result = responseText ? JSON.parse(responseText) : null;
      } catch {
        const isHtml = /<html|<!doctype/i.test(responseText);
        if (isHtml || response.status === 404) {
          throw new Error('O chat precisa ser aberto pelo servidor Anix, não pelo Live Server. Inicie `node .\\server.js` e acesse http://localhost:8391/chat.html.');
        }
        throw new Error(`O servidor respondeu com conteúdo inválido (HTTP ${response.status}).`);
      }
      if (!result || typeof result !== 'object') {
        throw new Error(`O servidor retornou uma resposta vazia (HTTP ${response.status}).`);
      }
      if (!response.ok) throw new Error(result.error || `Erro HTTP ${response.status}.`);
      if (typeof result.answer !== 'string' || !result.answer.trim()) {
        throw new Error('A API não retornou texto. Verifique a chave, o modelo e os logs do servidor.');
      }
      session.messages.push({ role: 'assistant', content: result.answer });
      session.updatedAt = Date.now();
      persistSessions();
      renderMessages();
      renderHistory();
      setStatus('Resposta recebida.', false);
    } catch (error) {
      console.error('Falha ao conversar com Anix:', error);
      input.value = text;
      selectedFiles = originalFiles;
      renderFiles();
      session.messages.pop();
      persistSessions();
      renderMessages();
      setStatus(error.message || 'Não foi possível conectar ao servidor Anix.', true);
    } finally {
      sendButton.disabled = false;
      sendButton.textContent = 'Enviar';
      input.focus();
    }
  }

  form.addEventListener('submit', sendMessage);
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      form.requestSubmit();
    }
  });
  fileInput.addEventListener('change', () => {
    addFiles(fileInput.files);
    fileInput.value = '';
  });
  newChatButton.addEventListener('click', createSession);

  if (!sessions.length) createSession();
  else {
    renderHistory();
    renderMessages();
  }
  renderFiles();
})();
