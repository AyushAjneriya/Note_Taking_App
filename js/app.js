'use strict';

/* ---------- Storage ---------- */
const STORE_KEY = 'notedeck:v1';
const NOTE_COLORS = ['#F2A93B', '#4FB3A9', '#D97878', '#8E6EDB', '#3E8ED0', '#8B9099'];

function loadStore() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return { notes: [], settings: { theme: 'ink' } };
    const parsed = JSON.parse(raw);
    if (!parsed.settings) parsed.settings = { theme: 'ink' };
    if (!parsed.notes) parsed.notes = [];
    return parsed;
  } catch (e) {
    console.error('Failed to load notes', e);
    return { notes: [], settings: { theme: 'ink' } };
  }
}

function saveStore() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save notes', e);
    setStatus('Save failed — storage may be full', true);
  }
}

/* ---------- State ---------- */
let state = loadStore();
let activeNoteId = state.notes[0] ? state.notes[0].id : null;
let searchQuery = '';
let typeFilter = 'all'; // all | text | code
let previewMode = false;
let saveTimer = null;

/* ---------- Helpers ---------- */
function uid() {
  return 'n_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function now() {
  return Date.now();
}

function formatTime(ts) {
  const d = new Date(ts);
  const diffMs = Date.now() - ts;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return mins + 'm ago';
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return hrs + 'h ago';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

function wordCount(text) {
  const t = text.trim();
  if (!t) return 0;
  return t.split(/\s+/).length;
}

function setStatus(msg, isError) {
  const el = document.getElementById('statusMsg');
  el.textContent = msg;
  el.classList.toggle('status-error', !!isError);
  if (!isError) {
    clearTimeout(setStatus._t);
    setStatus._t = setTimeout(() => { el.textContent = 'Saved'; el.classList.remove('status-error'); }, 1600);
  }
}

function getActiveNote() {
  return state.notes.find((n) => n.id === activeNoteId) || null;
}

/* ---------- Note CRUD ---------- */
function createNote(template) {
  const t = template || templateById('blank-note');
  const note = {
    id: uid(),
    title: t.title || 'Untitled',
    type: t.type || 'text',
    language: t.language || 'plaintext',
    content: t.content || '',
    color: NOTE_COLORS[0],
    tags: [],
    createdAt: now(),
    updatedAt: now(),
  };
  state.notes.unshift(note);
  activeNoteId = note.id;
  saveStore();
  renderSidebar();
  renderEditor();
  closeTemplateModal();
  document.getElementById('noteTitle').focus();
}

function deleteNote(id) {
  const idx = state.notes.findIndex((n) => n.id === id);
  if (idx === -1) return;
  state.notes.splice(idx, 1);
  if (activeNoteId === id) {
    activeNoteId = state.notes[0] ? state.notes[0].id : null;
  }
  saveStore();
  renderSidebar();
  renderEditor();
}

function duplicateNote(id) {
  const src = state.notes.find((n) => n.id === id);
  if (!src) return;
  const copy = Object.assign({}, src, {
    id: uid(),
    title: src.title + ' (copy)',
    createdAt: now(),
    updatedAt: now(),
  });
  state.notes.unshift(copy);
  activeNoteId = copy.id;
  saveStore();
  renderSidebar();
  renderEditor();
}

function updateActiveNote(patch) {
  const note = getActiveNote();
  if (!note) return;
  Object.assign(note, patch, { updatedAt: now() });
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    saveStore();
    setStatus('Saved');
    renderSidebar(true); // light refresh, keep scroll/focus sane
  }, 300);
}

/* ---------- Sidebar rendering ---------- */
function filteredNotes() {
  let list = state.notes.slice().sort((a, b) => b.updatedAt - a.updatedAt);
  if (typeFilter !== 'all') list = list.filter((n) => n.type === typeFilter);
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    list = list.filter((n) =>
      n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)
    );
  }
  return list;
}

function renderSidebar() {
  const list = filteredNotes();
  const container = document.getElementById('noteList');
  container.innerHTML = '';

  if (list.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.innerHTML = state.notes.length === 0
      ? '<p>No notes yet.</p><p class="dim">Create your first note or code snippet to get started.</p>'
      : '<p>Nothing matches.</p><p class="dim">Try a different search or filter.</p>';
    container.appendChild(empty);
    updateCounts();
    return;
  }

  list.forEach((note) => {
    const item = document.createElement('button');
    item.className = 'note-item' + (note.id === activeNoteId ? ' active' : '');
    item.type = 'button';
    item.setAttribute('data-id', note.id);

    const dotColor = note.type === 'code' ? langById(note.language).dot : note.color;
    const preview = note.content.replace(/\s+/g, ' ').trim().slice(0, 64);
    const langLabel = note.type === 'code' ? langById(note.language).label : 'Note';

    item.innerHTML = `
      <span class="note-dot" style="background:${dotColor}"></span>
      <span class="note-item-body">
        <span class="note-item-title">${escapeHtml(note.title || 'Untitled')}</span>
        <span class="note-item-meta">${langLabel} · ${formatTime(note.updatedAt)}</span>
        ${preview ? `<span class="note-item-preview">${escapeHtml(preview)}</span>` : ''}
      </span>
    `;
    item.addEventListener('click', () => {
      activeNoteId = note.id;
      previewMode = false;
      renderSidebar();
      renderEditor();
      document.getElementById('sidebar').classList.remove('open');
      document.getElementById('scrim').classList.remove('open');
    });
    container.appendChild(item);
  });

  updateCounts();
}

function updateCounts() {
  document.getElementById('countAll').textContent = state.notes.length;
  document.getElementById('countText').textContent = state.notes.filter((n) => n.type === 'text').length;
  document.getElementById('countCode').textContent = state.notes.filter((n) => n.type === 'code').length;
}

/* ---------- Editor rendering ---------- */
function renderEditor() {
  const note = getActiveNote();
  const empty = document.getElementById('editorEmpty');
  const wrap = document.getElementById('editorWrap');

  if (!note) {
    empty.style.display = 'flex';
    wrap.style.display = 'none';
    return;
  }
  empty.style.display = 'none';
  wrap.style.display = 'flex';

  const titleInput = document.getElementById('noteTitle');
  if (document.activeElement !== titleInput) titleInput.value = note.title;

  // Language tab strip only for code notes
  const langStrip = document.getElementById('langStrip');
  langStrip.style.display = note.type === 'code' ? 'flex' : 'none';
  renderLangStrip(note);

  // Color swatch row only for text notes
  const colorRow = document.getElementById('colorRow');
  colorRow.style.display = note.type === 'code' ? 'none' : 'flex';
  renderColorRow(note);

  document.getElementById('previewToggle').style.display = note.type === 'text' ? 'inline-flex' : 'none';

  const codeArea = document.getElementById('codeArea');
  const codeHighlight = document.getElementById('codeHighlight');
  const textArea = document.getElementById('textArea');
  const previewPane = document.getElementById('previewPane');

  if (note.type === 'code') {
    textArea.style.display = 'none';
    previewPane.style.display = 'none';
    codeArea.parentElement.style.display = 'block';
    if (document.activeElement !== codeArea) codeArea.value = note.content;
    highlightCode(note);
  } else {
    codeArea.parentElement.style.display = 'none';
    if (previewMode) {
      textArea.style.display = 'none';
      previewPane.style.display = 'block';
      previewPane.innerHTML = renderMarkdown(note.content);
      previewPane.querySelectorAll('pre code').forEach((el) => { if (window.hljs) hljs.highlightElement(el); });
    } else {
      textArea.style.display = 'block';
      previewPane.style.display = 'none';
      if (document.activeElement !== textArea) textArea.value = note.content;
    }
  }

  updateStatusBar(note);
}

function renderLangStrip(note) {
  const strip = document.getElementById('langStrip');
  strip.innerHTML = '';
  LANGUAGES.forEach((lang) => {
    const tab = document.createElement('button');
    tab.type = 'button';
    tab.className = 'lang-tab' + (note.language === lang.id ? ' active' : '');
    tab.innerHTML = `<span class="lang-dot" style="background:${lang.dot}"></span>${lang.label}`;
    tab.addEventListener('click', () => {
      updateActiveNote({ language: lang.id });
      renderEditor();
    });
    strip.appendChild(tab);
  });
}

function renderColorRow(note) {
  const row = document.getElementById('colorRow');
  row.innerHTML = '<span class="color-row-label">Color</span>';
  NOTE_COLORS.forEach((c) => {
    const sw = document.createElement('button');
    sw.type = 'button';
    sw.className = 'color-swatch' + (note.color === c ? ' active' : '');
    sw.style.background = c;
    sw.addEventListener('click', () => {
      updateActiveNote({ color: c });
      renderColorRow(note);
      renderSidebar();
    });
    row.appendChild(sw);
  });
}

function highlightCode(note) {
  const codeHighlight = document.getElementById('codeHighlight');
  const lang = langById(note.language);
  const code = note.content || '';
  codeHighlight.className = 'hljs language-' + lang.hljs;
  codeHighlight.textContent = code;
  if (window.hljs) {
    try { hljs.highlightElement(codeHighlight); } catch (e) { /* unsupported alias, ignore */ }
  }
}

function renderMarkdown(text) {
  if (window.marked) {
    try {
      marked.setOptions({ breaks: true });
      return marked.parse(text || '*Nothing here yet.*');
    } catch (e) { /* fall through */ }
  }
  return `<pre>${escapeHtml(text)}</pre>`;
}

function updateStatusBar(note) {
  const wc = wordCount(note.content);
  const charCount = note.content.length;
  document.getElementById('statusWords').textContent = `${wc} word${wc === 1 ? '' : 's'} · ${charCount} chars`;
  const typeLabel = note.type === 'code' ? langById(note.language).label : 'Plain text / Markdown';
  document.getElementById('statusType').textContent = typeLabel;
}

/* ---------- Editor sync: keep codeHighlight scroll in sync with textarea ---------- */
function syncCodeScroll() {
  const codeArea = document.getElementById('codeArea');
  const codeHighlight = document.getElementById('codeHighlight');
  codeHighlight.parentElement.scrollTop = codeArea.scrollTop;
  codeHighlight.parentElement.scrollLeft = codeArea.scrollLeft;
}

/* ---------- Modals ---------- */
function openTemplateModal() {
  const grid = document.getElementById('templateGrid');
  grid.innerHTML = '';
  TEMPLATES.forEach((t) => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'template-card';
    const dot = t.type === 'code' ? langById(t.language).dot : 'var(--accent-2)';
    card.innerHTML = `
      <span class="template-dot" style="background:${dot}"></span>
      <span class="template-name">${escapeHtml(t.label)}</span>
      <span class="template-type">${t.type === 'code' ? 'Code' : 'Note'}</span>
    `;
    card.addEventListener('click', () => createNote(t));
    grid.appendChild(card);
  });
  document.getElementById('templateModal').classList.add('open');
}
function closeTemplateModal() {
  document.getElementById('templateModal').classList.remove('open');
}

function openThemeModal() {
  const grid = document.getElementById('themeGrid');
  grid.innerHTML = '';
  Object.entries(THEMES).forEach(([id, theme]) => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'theme-card' + (state.settings.theme === id ? ' active' : '');
    card.innerHTML = `
      <span class="theme-swatches">
        <span style="background:${theme.vars['--bg']}"></span>
        <span style="background:${theme.vars['--accent']}"></span>
        <span style="background:${theme.vars['--accent-2']}"></span>
      </span>
      <span class="theme-name">${theme.label}</span>
    `;
    card.addEventListener('click', () => {
      state.settings.theme = id;
      applyTheme(id);
      saveStore();
      openThemeModal();
    });
    grid.appendChild(card);
  });
  document.getElementById('themeModal').classList.add('open');
}
function closeThemeModal() {
  document.getElementById('themeModal').classList.remove('open');
}

/* ---------- Export / Import ---------- */
function exportNotes() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `notedeck-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function importNotes(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (!Array.isArray(data.notes)) throw new Error('Invalid file');
      const existingIds = new Set(state.notes.map((n) => n.id));
      data.notes.forEach((n) => {
        if (existingIds.has(n.id)) n.id = uid();
        state.notes.push(n);
      });
      saveStore();
      renderSidebar();
      setStatus('Notes imported');
    } catch (e) {
      alert('Could not import that file. Make sure it is a NoteDeck backup JSON.');
    }
  };
  reader.readAsText(file);
}

/* ---------- Wiring ---------- */
function init() {
  applyTheme(state.settings.theme || 'ink');
  renderSidebar();
  renderEditor();

  document.getElementById('newNoteBtn').addEventListener('click', openTemplateModal);
  document.getElementById('closeTemplateModal').addEventListener('click', closeTemplateModal);
  document.getElementById('templateModal').addEventListener('click', (e) => {
    if (e.target.id === 'templateModal') closeTemplateModal();
  });

  document.getElementById('themeBtn').addEventListener('click', openThemeModal);
  document.getElementById('closeThemeModal').addEventListener('click', closeThemeModal);
  document.getElementById('themeModal').addEventListener('click', (e) => {
    if (e.target.id === 'themeModal') closeThemeModal();
  });

  document.getElementById('searchInput').addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderSidebar();
  });

  document.querySelectorAll('.filter-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      typeFilter = tab.getAttribute('data-filter');
      document.querySelectorAll('.filter-tab').forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      renderSidebar();
    });
  });

  document.getElementById('noteTitle').addEventListener('input', (e) => {
    updateActiveNote({ title: e.target.value });
    renderSidebar(); // keep title in sync live, cheap enough
  });

  document.getElementById('textArea').addEventListener('input', (e) => {
    updateActiveNote({ content: e.target.value });
  });

  const codeArea = document.getElementById('codeArea');
  codeArea.addEventListener('input', (e) => {
    updateActiveNote({ content: e.target.value });
    highlightCode(getActiveNote());
  });
  codeArea.addEventListener('scroll', syncCodeScroll);
  codeArea.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = codeArea.selectionStart, end = codeArea.selectionEnd;
      codeArea.value = codeArea.value.slice(0, start) + '  ' + codeArea.value.slice(end);
      codeArea.selectionStart = codeArea.selectionEnd = start + 2;
      updateActiveNote({ content: codeArea.value });
      highlightCode(getActiveNote());
    }
  });

  document.getElementById('previewToggle').addEventListener('click', () => {
    previewMode = !previewMode;
    document.getElementById('previewToggle').classList.toggle('active', previewMode);
    renderEditor();
  });

  document.getElementById('deleteNoteBtn').addEventListener('click', () => {
    const note = getActiveNote();
    if (!note) return;
    if (confirm(`Delete "${note.title || 'Untitled'}"? This can't be undone.`)) {
      deleteNote(note.id);
    }
  });

  document.getElementById('duplicateNoteBtn').addEventListener('click', () => {
    const note = getActiveNote();
    if (note) duplicateNote(note.id);
  });

  document.getElementById('exportBtn').addEventListener('click', exportNotes);
  document.getElementById('importInput').addEventListener('change', (e) => {
    if (e.target.files[0]) importNotes(e.target.files[0]);
    e.target.value = '';
  });

  // Sidebar collapse for small screens
  document.getElementById('sidebarToggle').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('open');
    document.getElementById('scrim').classList.toggle('open');
  });
  document.getElementById('scrim').addEventListener('click', () => {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('scrim').classList.remove('open');
  });

  // Keyboard shortcut: Ctrl/Cmd+N new note, Ctrl/Cmd+K search
  document.addEventListener('keydown', (e) => {
    const mod = e.ctrlKey || e.metaKey;
    if (mod && e.key.toLowerCase() === 'n') { e.preventDefault(); openTemplateModal(); }
    if (mod && e.key.toLowerCase() === 'k') { e.preventDefault(); document.getElementById('searchInput').focus(); }
  });

  // Register service worker for installability + offline
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }

  // Install prompt handling
  let deferredPrompt = null;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    document.getElementById('installBtn').style.display = 'inline-flex';
  });
  document.getElementById('installBtn').addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    document.getElementById('installBtn').style.display = 'none';
  });
}

document.addEventListener('DOMContentLoaded', init);
