'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const worker = fs.readFileSync(path.join(root, 'service-worker.js'), 'utf8');
const staticMarkup = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');

test('statische pagina bevat geen dubbele element-id’s', function () {
  const counts = new Map();
  for (const match of staticMarkup.matchAll(/\sid=["']([^"']+)["']/gi)) {
    counts.set(match[1], (counts.get(match[1]) || 0) + 1);
  }
  const duplicates = Array.from(counts).filter(function (entry) { return entry[1] > 1; });
  assert.deepEqual(duplicates, []);
});

test('alle statisch gekoppelde lokale bestanden bestaan', function () {
  const refs = new Set();
  for (const match of staticMarkup.matchAll(/(?:src|href)=["']([^"'#?]+)["']/gi)) {
    const ref = match[1].trim();
    if (!/^(?:data:|https?:|mailto:|tel:|javascript:|\/)/i.test(ref)) refs.add(ref);
  }
  const missing = Array.from(refs).filter(function (ref) { return !fs.existsSync(path.join(root, ref)); });
  assert.deepEqual(missing, []);
});

test('ook lokaal gekoppelde spelassets bestaan', function () {
  const refs = new Set();
  for (const match of html.matchAll(/(?:src|href)=[\\]?["']([^"']+)["']/gi)) {
    const ref = match[1].trim();
    if (!ref || ref === '...' || /[+{}<>]/.test(ref) || /^(?:data:|https?:|mailto:|tel:|javascript:|#|\/)/i.test(ref)) continue;
    refs.add(ref);
  }
  const missing = Array.from(refs).filter(function (ref) { return !fs.existsSync(path.join(root, ref)); });
  assert.deepEqual(missing, []);
});

test('Vakantie Volgorde is vanuit Quest en de geheime gids bereikbaar', function () {
  assert.match(html, /data-mini="sequence"/);
  assert.match(html, /kind === 'sequence'/);
  assert.match(html, /data-qgame="sequence"/);
  assert.match(html, /function vacationSequence\(\)/);
  assert.doesNotMatch(html, /VacationSequenceEngine|vacation-sequence-engine\.js/);
});

test('de volledige offline app-shell bevat de pagina', function () {
  assert.match(worker, /'\.\/index\.html'/);
  assert.doesNotMatch(worker, /vacation-sequence-engine/);
});

test('oude Segoe UI-lettertypes zijn niet teruggekeerd', function () {
  assert.doesNotMatch(html, /Segoe UI/i);
});

test('alle inline JavaScript blijft syntactisch geldig', function () {
  for (const match of html.matchAll(/<script\b(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)) {
    assert.doesNotThrow(function () { new Function(match[1]); });
  }
});

test('muziek en spelgeluiden hebben gescheiden voorkeuren', function () {
  assert.match(html, /zdMusicMuted_v1/);
  assert.match(html, /zdGameEffectsMuted_v1/);
  assert.match(html, /id="game-sound-toggle"/);
});

test('dynamische beelden veroorzaken geen volledige DOM-scan meer', function () {
  assert.doesNotMatch(html, /MutationObserver\(function\(\)\{\s*swapAll\(\)/);
  assert.match(html, /change\.addedNodes\.forEach/);
});

test('alle geëxternaliseerde beelden staan in het offline manifest', function () {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'assets', 'embedded', 'manifest.json'), 'utf8'));
  assert.ok(manifest.length >= 90);
  const missing = manifest.filter(function (ref) { return !fs.existsSync(path.join(root, ref.replace(/^\.\//, ''))); });
  assert.deepEqual(missing, []);
});
