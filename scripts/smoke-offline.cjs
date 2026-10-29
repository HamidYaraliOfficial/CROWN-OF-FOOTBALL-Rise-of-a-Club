#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'PLAY_NOW.html'), 'utf8');
const match = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script\s*>/gi)];
assert.equal(match.length, 1, 'standalone edition should contain one inline program');
const script = match[0][1];

function makeGame() {
  const listeners = Object.create(null);
  const saved = new Map();
  const intervals = new Map();
  let intervalId = 1;
  let lastToast = null;
  let downloadName = null;
  const app = {
    innerHTML: '',
    addEventListener(type, callback) {
      (listeners[type] ??= []).push(callback);
    },
  };
  const amountInput = { value: '0' };
  const document = {
    documentElement: { lang: '', dir: '' },
    body: {
      className: '',
      appendChild(element) { lastToast = element; },
    },
    getElementById(id) {
      if (id === 'app') return app;
      if (id === 'offer-amount') return amountInput;
      return null; // The static smoke test intentionally does not emulate a canvas.
    },
    querySelector() { return null; },
    createElement(tag) {
      return {
        tagName: tag,
        style: {},
        className: '',
        innerHTML: '',
        href: '',
        download: '',
        remove() {},
        click() { downloadName = this.download; },
      };
    },
  };
  const window = { addEventListener() {}, scrollY: 0, scrollTo() {}, devicePixelRatio: 1 };
  function MockFileReader() {
    this.result = null;
    this.onload = null;
    this.readAsText = (file) => {
      this.result = file.text;
      this.onload?.();
    };
  }
  const context = {
    document,
    window,
    localStorage: {
      getItem: (key) => saved.has(key) ? saved.get(key) : null,
      setItem: (key, value) => saved.set(key, String(value)),
      removeItem: (key) => saved.delete(key),
      clear: () => saved.clear(),
    },
    console, Date, Math, Intl, Map, Set, Array, Object, String, Number, Boolean, JSON,
    Blob: function MockBlob(parts, options) { this.parts = parts; this.type = options?.type; },
    URL: { createObjectURL: () => 'blob:mock', revokeObjectURL() {} },
    FileReader: MockFileReader,
    confirm: () => false,
    alert: () => {},
    setTimeout: () => 1,
    clearTimeout: () => {},
    setInterval: (callback) => { const id = intervalId++; intervals.set(id, callback); return id; },
    clearInterval: (id) => intervals.delete(id),
  };
  vm.createContext(context);
  vm.runInContext(script, context, { timeout: 5000, filename: 'PLAY_NOW.inline.js' });
  const click = (dataset) => listeners.click[0]({ target: { closest: () => ({ dataset }) } });
  return { app, click, listeners, saved, intervals, amountInput, document, context,
    get lastToast() { return lastToast; }, get downloadName() { return downloadName; } };
}

// Initial rendering and navigation through every primary page.
const ui = makeGame();
assert.match(ui.app.innerHTML, /CROWN/);
const pages = ['dashboard', 'squad', 'transfers', 'match', 'tactics', 'league', 'finances', 'scouting', 'facilities', 'inbox', 'settings'];
for (const page of pages) {
  ui.click({ page });
  assert(ui.app.innerHTML.length > 1000, `${page} should render a substantial page`);
}
console.log(`PASS: initial render and all ${pages.length} page templates`);

// Language direction and label switching.
ui.click({ action: 'lang:zh' });
assert.equal(ui.document.documentElement.lang, 'zh');
assert.equal(ui.document.documentElement.dir, 'ltr');
assert(ui.app.innerHTML.includes('管理总览'));
ui.click({ action: 'lang:fa' });
assert.equal(ui.document.documentElement.lang, 'fa');
assert.equal(ui.document.documentElement.dir, 'rtl');
assert(ui.app.innerHTML.includes('داشبورد'));
console.log('PASS: Persian RTL and Simplified Chinese LTR language switching');

// Signing a free agent updates the saved squad and news.
const freeAgent = makeGame();
freeAgent.click({ action: 'offer:fa-1' });
assert(freeAgent.app.innerHTML.includes('TRANSFER NEGOTIATION'));
const freeInput = freeAgent.app.innerHTML.match(/id="offer-amount"[^>]*value="([^"]+)"/);
assert(freeInput, 'offer form input should render');
freeAgent.amountInput.value = freeInput[1];
freeAgent.listeners.submit[0]({ target: { id: 'offer-form' }, preventDefault() {} });
const freeSaved = JSON.parse(freeAgent.saved.get('crown-of-football-offline-v1'));
assert.equal(freeSaved.players.find((p) => p.id === 'fa-1').clubId, 'crown');
assert(freeSaved.news.some((n) => n.title === 'Transfer completed'));
console.log('PASS: free-agent signing, squad membership, news, and local persistence');

// Paid transfer updates both clubs and the ledger.
const paid = makeGame();
paid.click({ action: 'train' }); // Persist a known starting state before reading it in the test harness.
const before = JSON.parse(paid.saved.get('crown-of-football-offline-v1'));
const target = before.players.find((p) => p.id === 'p-northstar-01');
assert(target, 'paid-transfer test player should exist');
paid.click({ action: `offer:${target.id}` });
const paidInput = paid.app.innerHTML.match(/id="offer-amount"[^>]*value="([^"]+)"/);
assert(paidInput, 'paid transfer amount input should render');
paid.amountInput.value = paidInput[1];
paid.listeners.submit[0]({ target: { id: 'offer-form' }, preventDefault() {} });
const paidSaved = JSON.parse(paid.saved.get('crown-of-football-offline-v1'));
assert.equal(paidSaved.players.find((p) => p.id === target.id).clubId, 'crown');
assert(paidSaved.transactions.some((t) => t.description === `Transfer: ${target.name}`));
assert(paidSaved.clubs.find((c) => c.id === 'northstar').cash > before.clubs.find((c) => c.id === 'northstar').cash);
console.log('PASS: paid transfer, seller proceeds, and transaction ledger');

// Match progress completes a fixture round and persists the next-round state.
const matchGame = makeGame();
matchGame.click({ page: 'match' });
matchGame.click({ action: 'play-match' });
assert(matchGame.app.innerHTML.includes('MATCH SIMULATION RUNNING'));
assert(matchGame.intervals.size > 0, 'match ticker should start');
for (let i = 0; i < 80; i += 1) {
  const active = [...matchGame.intervals.values()][0];
  if (!active) break;
  active();
}
const matchSaved = JSON.parse(matchGame.saved.get('crown-of-football-offline-v1'));
assert.equal(matchSaved.currentRound, 2);
assert.equal(matchSaved.fixtures.filter((f) => f.round === 1 && f.played).length, 4);
assert(matchSaved.fixtures.filter((f) => f.round === 1 && f.played).every((f) => f.result));
console.log('PASS: match simulation reaches full time, resolves the round, and persists results');

// Export / import are available and JSON save shape survives a round trip.
const exportUi = makeGame();
exportUi.click({ action: 'train' });
const exportState = JSON.parse(exportUi.saved.get('crown-of-football-offline-v1'));
exportUi.click({ page: 'settings' });
exportUi.click({ action: 'export' });
assert(exportUi.downloadName && exportUi.downloadName.endsWith('.json'));
const importTarget = { id: 'import-file', dataset: {}, files: [{ text: JSON.stringify(exportState) }], value: 'selected' };
exportUi.listeners.change[0]({ target: importTarget });
assert(JSON.parse(exportUi.saved.get('crown-of-football-offline-v1')).players.length === exportState.players.length);
console.log('PASS: JSON export/download naming and import/save round trip');

console.log('NOTE: this is a Node VM smoke suite with a mock DOM. It validates UI-template generation and core flows, but is not a substitute for testing in a real browser.');
