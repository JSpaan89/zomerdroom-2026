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

test('een locatiepagina kan het muziekthema niet dubbel starten', function () {
  assert.match(html, /DOUBLE_TRIGGER_GUARD\s*=\s*1400/);
  assert.match(html, /LOCATION_SINGLETON_GUARD\s*=\s*3200/);
  assert.match(html, /window\.__ZD_LOCATION_AUDIO__/);
  assert.match(html, /function stopActiveTheme\(\)/);
  assert.doesNotMatch(html, /ambience=ctx\.createConvolver/);
  assert.match(html, /if \(document\.body\.classList\.contains\('book-mode'\)\) return;/);
  assert.doesNotMatch(html, /playTheme\(loc,\s*true\)/);
});

test('admin kan alle galerijen met multiselect opschonen', function () {
  assert.ok((html.match(/gallery-admin-open/g) || []).length >= 3);
  assert.match(html, /const selectedItems\s*=\s*new Set\(\)/);
  assert.match(html, /const gallerySelected=new Set\(\)/);
  assert.match(html, /function deleteMediaBatch\(type,loc,items\)/);
  assert.match(html, /function deleteChallengeGalleryItems\(ids\)/);
  assert.match(html, /HS\.deleteMediaBatch\('drawings'/);
  assert.match(html, /HS\.deleteMediaBatch\('photos'/);
  assert.match(html, /await HS\.deleteChallengeGalleryItems\(ids\)/);
  assert.match(worker, /const VERSION = 'v3\.43\.0'/);
});

test('iedere locatie bundelt activiteiten in must-see en regen', function () {
  assert.equal((staticMarkup.match(/class="activity-guide-title"/g) || []).length, 9);
  assert.equal((staticMarkup.match(/class="activity-card must-see"/g) || []).length, 9);
  assert.equal((staticMarkup.match(/class="activity-card rain"/g) || []).length, 9);
  assert.doesNotMatch(html, /aqualandia\.it|maiskogel\.info|tauernspa\.at/);
});

test('de titelbalk markeert de locatie van vandaag los van de geopende pagina', function () {
  assert.match(html, /function markTodaysTripStop\(\)/);
  assert.match(html, /classList\.add\('today'\)/);
  assert.match(html, /\.kompas-stop\.today \.kompas-dot/);
  assert.match(html, /data-today-label/);
});

test('alle tekenvelden en de foto-editor gebruiken twintig extra avatarstickers', function () {
  const refs = Array.from(html.matchAll(/assets\/stickers\/(?:jarno|erica|leonora|roan)-[1-5]\.webp/g), function (m) { return m[0]; });
  assert.equal(new Set(refs).size, 20);
  for (const ref of new Set(refs)) assert.ok(fs.existsSync(path.join(root, ref)), ref);
  assert.match(html, /editPhotoWithStickers/);
  assert.match(html, /#db-canvas,#db-own-canvas/);
  assert.match(html, /Tik op de tekening om de sticker te plakken/);
});

test('de familie-stickers komen ook terug in locaties, team, quest en paspoort', function () {
  assert.match(html, /id="family-stickers-throughout-css"/);
  for (const loc of ['munchen', 'zell', 'dolomieten', 'garda', 'asolo', 'lido', 'bergamo', 'luzern', 'mannheim']) {
    assert.match(html, new RegExp('\\b' + loc + ':\\['));
  }
  assert.match(html, /team-sticker-signature/);
  assert.match(html, /quest-family-band/);
  assert.match(html, /passport-family-strip/);
  assert.match(html, /media-empty-family/);
});

test('foto’s en tekeningen tonen het gemiddelde van meerdere spelers onder het werk', function () {
  assert.ok((html.match(/class=\\?"media-rating-strip/g) || []).length >= 4);
  assert.match(html, /info\.avg\/5\*100/);
  assert.match(html, /ri\.avg\/5\*100/);
  assert.match(html, /\/ratings\/['"]? \+ safeVoter|\/ratings\/['"]? \+ safe/);
  assert.match(html, /setTimeout\(syncCloud,0\)/);
});

test('tekenen staat als echte schermlaag boven de boeknavigatie', function () {
  assert.match(html, /document\.body\.appendChild\(panel\)/);
  assert.match(html, /document\.body\.classList\.add\('drawing-mode'\)/);
  assert.match(html, /body\.drawing-mode \.book-nav/);
  assert.match(html, /if \(overlayOpen\(\)\) return;/);
  assert.match(html, /return document\.body\.classList\.contains\('drawing-mode'\)/);
});

test('losse berichten gebruiken het zichtbare commentveld', function () {
  assert.ok((html.match(/querySelector\('\.media-comment-form \.media-comment-input'\)/g) || []).length >= 2);
  assert.doesNotMatch(html, /const input=ov\.querySelector\('\.media-comment-input'\)/);
  assert.match(html, /commentList\.scrollTop\s*=\s*commentList\.scrollHeight/);
  assert.match(html, /authorId:voter,authorName:authorName/);
  assert.match(html, /serverAt:firebase\.database\.ServerValue\.TIMESTAMP/);
  assert.match(html, /function renderPhotoComment\(comment\)/);
  assert.match(html, /function renderDrawingComment\(comment\)/);
  assert.match(html, /new Intl\.DateTimeFormat\('nl-NL'/);
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
