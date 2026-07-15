(function (root, factory) {
  'use strict';
  const engine = factory();
  if (typeof module === 'object' && module.exports) module.exports = engine;
  if (root) root.VacationSequenceEngine = engine;
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, Number(value) || min));
  }

  function scoreForLength(length) {
    return length >= 11 ? 3 : length >= 6 ? 2 : 1;
  }

  function createGame(options) {
    options = options || {};
    const names = Array.isArray(options.names) ? options.names : [];
    const colors = Array.isArray(options.colors) ? options.colors : [];
    const objectIds = Array.isArray(options.objectIds) ? options.objectIds.slice() : [];
    const count = clamp(options.count || names.length || 2, 2, 4);
    const lives = clamp(options.lives || 3, 1, 5);
    const random = typeof options.random === 'function' ? options.random : Math.random;

    return {
      gameStatus: 'preparing',
      players: Array.from({ length: count }, function (_, index) {
        return {
          id: index,
          name: String(names[index] || ('Speler ' + (index + 1))),
          lives: lives,
          score: 0,
          longest: 0,
          errors: 0,
          color: colors[index] || '#d4a043',
          out: false
        };
      }),
      activePlayerIndex: Math.floor(random() * count),
      sequence: [],
      playerInput: [],
      currentInputIndex: 0,
      roundNumber: 1,
      availableObjectIds: objectIds,
      difficulty: options.difficulty || 'normal',
      playbackSpeed: Number(options.playbackSpeed) || 480,
      livesPerPlayer: lives,
      soundEnabled: options.soundEnabled !== false,
      isShowingSequence: false,
      winner: null,
      startedAt: Date.now(),
      elapsedTime: 0,
      longest: 0,
      pausedFrom: null
    };
  }

  function addRandomObject(state, random) {
    if (!state || !state.availableObjectIds || !state.availableObjectIds.length) return null;
    random = typeof random === 'function' ? random : Math.random;
    const index = Math.min(state.availableObjectIds.length - 1, Math.floor(random() * state.availableObjectIds.length));
    const objectId = state.availableObjectIds[index];
    state.sequence.push(objectId);
    state.roundNumber = state.sequence.length;
    return objectId;
  }

  function resetInput(state) {
    state.playerInput = [];
    state.currentInputIndex = 0;
    return state;
  }

  function applyInput(state, objectId) {
    if (!state || state.gameStatus !== 'player-input' || state.isShowingSequence) {
      return { type: 'blocked' };
    }
    const player = state.players[state.activePlayerIndex];
    const expected = state.sequence[state.currentInputIndex];
    state.playerInput.push(objectId);
    if (objectId === expected) {
      state.currentInputIndex += 1;
      if (state.currentInputIndex < state.sequence.length) {
        return { type: 'continue', progress: state.currentInputIndex };
      }
      const points = scoreForLength(state.sequence.length);
      player.score += points;
      player.longest = Math.max(player.longest, state.sequence.length);
      state.longest = Math.max(state.longest, state.sequence.length);
      state.gameStatus = 'correct';
      return { type: 'success', points: points, player: player };
    }
    player.lives = Math.max(0, player.lives - 1);
    player.errors += 1;
    if (player.lives === 0) player.out = true;
    state.gameStatus = player.out ? 'player-eliminated' : 'incorrect';
    return { type: 'wrong', eliminated: player.out, expected: expected, player: player };
  }

  function alivePlayers(state) {
    return state.players.filter(function (player) { return !player.out; });
  }

  function nextPlayerIndex(state) {
    if (!state || !state.players || !state.players.length) return -1;
    if (alivePlayers(state).length <= 1) return state.activePlayerIndex;
    let index = state.activePlayerIndex;
    do {
      index = (index + 1) % state.players.length;
    } while (state.players[index].out);
    return index;
  }

  function advancePlayer(state) {
    state.activePlayerIndex = nextPlayerIndex(state);
    resetInput(state);
    return state.activePlayerIndex;
  }

  function determineWinner(state) {
    const alive = alivePlayers(state);
    if (alive.length === 1) return alive[0];
    if (alive.length > 1) return null;
    return state.players.slice().sort(function (a, b) {
      return b.score - a.score || b.longest - a.longest || a.errors - b.errors;
    })[0] || null;
  }

  return {
    createGame: createGame,
    addRandomObject: addRandomObject,
    resetInput: resetInput,
    applyInput: applyInput,
    alivePlayers: alivePlayers,
    nextPlayerIndex: nextPlayerIndex,
    advancePlayer: advancePlayer,
    determineWinner: determineWinner,
    scoreForLength: scoreForLength
  };
}));
