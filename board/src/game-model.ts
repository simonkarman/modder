import { ProjectionModel, Random } from '@krmx/state';
import { z } from 'zod';

type Tile = {
  x: number;
  y: number;
  type: 'none' | 'house' | 'tree';
  owner?: string;
}

const startTiles = (width: number, height: number) => {
  const tiles: Tile[] = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      tiles.push({ x, y, type: 'none' });
    }
  }
  return { width, height, tiles };
};

export const SERVER = '<server>';

const getInitialState = (width: number, height: number, players: string[]) => {
  const random = new Random('abc');
  return {
    random,
    ...startTiles(width, height),
    order: [...random.asShuffledArray(players), SERVER],
    turn: 0,
  };
};

export const gameModel = new ProjectionModel(
  getInitialState(1, 1, []),
  (state) => ({
    ...state,
    random: undefined,
  }),
);

export const startGame = gameModel.when(
  'start-game',
  z.object({ width: z.number().int().min(1).max(10), height: z.number().int().min(1).max(10), players: z.array(z.string().min(4)) }),
  (_, __, payload) => getInitialState(payload.width, payload.height, payload.players),
);

export const placeHouse = gameModel.when(
  'place-house',
  z.object({ x: z.number().int().min(0).max(9), y: z.number().int().min(0).max(9) }),
  (state, dispatcher, payload) => {
    const dispatcherIndex = state.order.indexOf(dispatcher);
    if (state.turn !== dispatcherIndex) {
      return;
    }
    state.tiles[payload.y * 10 + payload.x].type = 'house';
    state.tiles[payload.y * 10 + payload.x].owner = dispatcher;
    state.turn = (state.turn + 1) % state.order.length;
  },
);

export const placeTree = gameModel.when(
  'place-tree',
  z.undefined(),
  (state, dispatcher) => {
    if (dispatcher !== SERVER) {
      return;
    }
    const tile = state.random.asShuffledArray(state.tiles.filter(tile => tile.type === 'none')).pop();
    if (!tile) {
      return;
    }
    tile.type = 'tree';
    state.turn = (state.turn + 1) % state.order.length;
  },
);
