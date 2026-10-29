#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const htmlPath = path.join(root, 'PLAY_NOW.html');
if (!fs.existsSync(htmlPath)) {
  console.error('FAIL: PLAY_NOW.html is missing.');
  process.exit(1);
}
const html = fs.readFileSync(htmlPath, 'utf8');
const scripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script\s*>/gi)];
if (scripts.length !== 1) {
  console.error(`FAIL: expected one inline script, found ${scripts.length}.`);
  process.exit(1);
}
try {
  new vm.Script(scripts[0][1], { filename: 'PLAY_NOW.html:inline-script' });
} catch (error) {
  console.error('FAIL: inline JavaScript syntax check failed.');
  console.error(error.stack || error.message);
  process.exit(1);
}
const required = [
  'CROWN OF FOOTBALL',
  'localStorage',
  'createFixtures',
  'completeMatch',
  'offerModal()',
  'data-page="transfers"',
  'data-page="match"',
  'data-page="league"',
  "act==='export'",
  "act==='import'",
  'Hamid Yarali',
];
const missing = required.filter((text) => !html.includes(text));
if (missing.length) {
  console.error('FAIL: required standalone features were not found:', missing.join(', '));
  process.exit(1);
}
console.log('PASS: PLAY_NOW.html exists.');
console.log('PASS: the single inline JavaScript program parses successfully.');
console.log(`PASS: ${required.length} core feature markers are present.`);
console.log('NOTE: this is a static smoke check; it does not replace an interactive browser test.');
