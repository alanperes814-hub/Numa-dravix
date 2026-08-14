import fs from 'node:fs';

const file = 'index.html';
let s = fs.readFileSync(file, 'utf8');

s = s.replace(
  'function openTransactionModal(editId) {',
  'function openTransactionModal(editId, typeOverride) {'
);

s = s.replace(
  '  const editing = editId ? state.data.transactions.find(t => t.id === editId) : null;\n  render(editing?.type || "despesa");',
  '  const editing = editId ? state.data.transactions.find(t => t.id === editId) : null;\n  window.__numaEditingTransactionId = editId || null;\n  render(typeOverride || editing?.type || "despesa");'
);

s = s.replace(/onclick="render\('despesa'\)"/g, 'onclick="switchTransactionType(\'despesa\')"');
s = s.replace(/onclick="render\('receita'\)"/g, 'onclick="switchTransactionType(\'receita\')"');

const marker = 'function openTransactionModal(editId, typeOverride) {';
const helper = `function switchTransactionType(type) {
  openTransactionModal(window.__numaEditingTransactionId || null, type);
}

`;
if (!s.includes('function switchTransactionType(type)')) {
  s = s.replace(marker, helper + marker);
}

const oldTheme = `function toggleTheme() {
  const next = isDark() ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("numa-theme", next);
  renderApp();
}`;
const newTheme = `function toggleTheme() {
  const next = isDark() ? "light" : "dark";
  const root = document.documentElement;
  root.setAttribute("data-theme", next);
  root.style.colorScheme = next;
  try { localStorage.setItem("numa-theme", next); } catch (e) {}
  requestAnimationFrame(() => renderApp());
}`;
s = s.replace(oldTheme, newTheme);

if (!s.includes('function switchTransactionType(type)')) {
  throw new Error('Receita fix could not be applied');
}
if (!s.includes('root.style.colorScheme = next')) {
  throw new Error('Theme fix could not be applied');
}

fs.writeFileSync(file, s);
console.log('Numa fixes applied successfully.');
