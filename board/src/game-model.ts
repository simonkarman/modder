import { ProjectionModel, Random } from '@krmx/state';
import { z } from 'zod';

type Tile = {
  x: number;
  y: number;
  type: 'none' | 'house' | 'tree';
  owner?: string;
  lastChangedRound: number;
}

const _startTiles = (width: number, height: number) => {
  const tiles: Tile[] = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      tiles.push({ x, y, type: 'none', lastChangedRound: 0 });
    }
  }
  return { width, height, tiles };
};

export const God = '<god>';

const _getInitialState = (width: number, height: number, players: string[]) => {
  const random = new Random('def');
  return {
    random,
    ..._startTiles(width, height),
    order: [...random.asShuffledArray(players), God],
    players: players.reduce(
      (acc, player, index) => ({
        ...acc, [player]: { id: index + 1, score: 0 },
      }),
      {} as Record<string, { score: number, id: number }>,
    ),
    turn: 0,
    round: 1,
  };
};

const _placeTrees = (state: ReturnType<typeof _getInitialState>, numberOfTrees: number) => {
  const shuffled = state.random.asShuffledArray(state.tiles.filter(tile => tile.type === 'none'));
  for (let i = 0; i < numberOfTrees; i++) {
    const tile = shuffled.pop();
    if (!tile) {
      break;
    }
    tile.type = 'tree';
    tile.lastChangedRound = state.round;
  }
};

export const gameModel = new ProjectionModel(
  _getInitialState(1, 1, []),
  (state) => ({
    ...state,
    random: undefined,
  }),
);

export const startGame = gameModel.when(
  'start-game',
  z.object({ width: z.number().int().min(1).max(10), height: z.number().int().min(1).max(10), players: z.array(z.string().min(2)).min(2).max(4) }),
  (_, __, payload) => {
    const state = _getInitialState(payload.width, payload.height, payload.players);
    _placeTrees(state, 10);
    return state;
  },
);

export const placeHouse = gameModel.when(
  'place-house',
  z.object({ x: z.number().int().min(0).max(9), y: z.number().int().min(0).max(9) }),
  (state, dispatcher, payload) => {
    // Check if it's the dispatcher's turn
    const dispatcherIndex = state.order.indexOf(dispatcher);
    if (state.turn !== dispatcherIndex) {
      return;
    }

    // Check if the tile is empty
    const tileIndex = payload.y * 10 + payload.x;
    if (state.tiles[tileIndex].type !== 'none') {
      return;
    }

    // Place the house
    state.tiles[tileIndex].type = 'house';
    state.tiles[tileIndex].owner = dispatcher;
    state.tiles[tileIndex].lastChangedRound = state.round;
    state.turn = (state.turn + 1) % state.order.length;
  },
);

export const simulateGod = gameModel.when(
  'simulate-god',
  z.undefined(),
  (state, dispatcher) => {
    // Only the server can run the turn, and only if it's the server's turn
    if (dispatcher !== God && state.order[state.turn] !== God) {
      return;
    }

    // Woodcutting
    for (let orderIndex = 0; orderIndex < state.order.length - 1; orderIndex++) {
      const playerName = state.order[orderIndex];
      const houses = state.tiles.filter(tile => tile.type === 'house' && tile.owner === playerName);
      houses.sort((a, b) => a.lastChangedRound - b.lastChangedRound);
      while (houses.length > 0) {
        const house = houses.pop();
        if (!house || house.type !== 'house') { break; }
        const dirs = [[0, 1], [1, 0], [0, -1], [-1, 0]];
        for (const [dx, dy] of dirs) {
          let x = house.x;
          let y = house.y;
          // eslint-disable-next-line no-constant-condition
          while (true) {
            x += dx;
            y += dy;
            if (x < 0 || x >= state.width || y < 0 || y >= state.height) {
              break;
            }
            const tile = state.tiles[y * 10 + x];
            if (tile.type === 'tree') {
              tile.type = 'none';
              tile.lastChangedRound = state.round;
              state.players[playerName].score += 1;
              break;
            }
            if (tile.type === 'house') {
              tile.type = 'none';
              tile.lastChangedRound = state.round;
              tile.owner = undefined;
              break;
            }
          }
        }
      }
    }

    // Place trees
    const numberOfTrees = state.random.rangeInt(8, 15);
    _placeTrees(state, numberOfTrees);

    // End turn and round
    const scores = Object.entries(state.players);
    scores.sort(([_, a], [__, b]) => a.score - b.score);
    state.order = [...scores.map(([player]) => player), God];
    state.turn = 0;
    state.round += 1;
  },
);
