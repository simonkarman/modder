import { createClient } from '@krmx/client-react';
import { gameModel } from 'board';
import { registerProjection } from '@krmx/state-client-react';

// Create the client
export const { client, useClient } = createClient();

export const {
  use: useGame,
  dispatch: dispatchGameEvent,
} = registerProjection(client, 'game', gameModel);
