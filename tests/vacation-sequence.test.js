'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const engine = require('../vacation-sequence-engine.js');

function game(overrides) {
  return engine.createGame(Object.assign({
    count: 3,
    lives: 3,
    names: ['Jarno', 'Erica', 'Leonora'],
    colors: ['#a00', '#0a0', '#00a'],
    objectIds: ['case', 'camera', 'ice'],
    random: function () { return 0; }
  }, overrides || {}));
}

test('voegt een nieuw object aan de reeks toe', function () {
  const state = game();
  assert.equal(engine.addRandomObject(state, function () { return 0.99; }), 'ice');
  assert.deepEqual(state.sequence, ['ice']);
});

test('accepteert een volledig correcte reeks en kent punten toe', function () {
  const state = game();
  state.sequence = ['case', 'camera'];
  state.gameStatus = 'player-input';
  assert.equal(engine.applyInput(state, 'case').type, 'continue');
  const result = engine.applyInput(state, 'camera');
  assert.equal(result.type, 'success');
  assert.equal(state.players[0].score, 1);
  assert.equal(state.players[0].longest, 2);
});

test('herkent verkeerde invoer', function () {
  const state = game();
  state.sequence = ['case'];
  state.gameStatus = 'player-input';
  assert.equal(engine.applyInput(state, 'camera').type, 'wrong');
});

test('trekt bij een fout precies één leven af', function () {
  const state = game();
  state.sequence = ['case'];
  state.gameStatus = 'player-input';
  engine.applyInput(state, 'camera');
  assert.equal(state.players[0].lives, 2);
});

test('schakelt een speler zonder levens uit', function () {
  const state = game({ lives: 1 });
  state.sequence = ['case'];
  state.gameStatus = 'player-input';
  const result = engine.applyInput(state, 'ice');
  assert.equal(result.eliminated, true);
  assert.equal(state.players[0].out, true);
});

test('slaat uitgeschakelde spelers bij de beurtwissel over', function () {
  const state = game();
  state.players[1].out = true;
  assert.equal(engine.nextPlayerIndex(state), 2);
});

test('bepaalt de laatste actieve speler als winnaar', function () {
  const state = game();
  state.players[1].out = true;
  state.players[2].out = true;
  assert.equal(engine.determineWinner(state).name, 'Jarno');
});

test('wisselt naar de volgende speler en reset invoer', function () {
  const state = game();
  state.currentInputIndex = 2;
  state.playerInput = ['case', 'camera'];
  engine.advancePlayer(state);
  assert.equal(state.activePlayerIndex, 1);
  assert.equal(state.currentInputIndex, 0);
  assert.deepEqual(state.playerInput, []);
});

test('een nieuw spel reset alle scores, levens en reeksen', function () {
  const first = game();
  first.players[0].score = 8;
  first.sequence.push('case');
  const reset = game();
  assert.equal(reset.players[0].score, 0);
  assert.equal(reset.players[0].lives, 3);
  assert.deepEqual(reset.sequence, []);
});

test('blokkeert invoer tijdens het tonen van de reeks', function () {
  const state = game();
  state.sequence = ['case'];
  state.gameStatus = 'showing-sequence';
  state.isShowingSequence = true;
  assert.equal(engine.applyInput(state, 'case').type, 'blocked');
  assert.equal(state.currentInputIndex, 0);
});
