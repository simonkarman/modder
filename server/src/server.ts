import { createServer, Props } from '@krmx/server';
import { chat } from './chat';
import { cli } from './cli';
import { enableUnlinkedKicker } from './unlinked-kicker';
import { gameModel, placeTree, SERVER } from 'board';
import { registerProjection } from '@krmx/state-server';

// Setup server
const props: Props = {
  pingIntervalMilliseconds: 3_000,
  http: { queryParams: { version: '0.0.2' } },
};
const server = createServer(props);
enableUnlinkedKicker(server);
cli(server);
chat(server);

// Game
const game = registerProjection(server, 'game', gameModel);
const internalId = setInterval(() => {
  const projection = game.projection(SERVER);
  if (projection.turn === projection.order.length - 1) {
    game.dispatch(SERVER, placeTree());
  }
}, 500);

// Start server
server.listen(8084);
export default async () => {
  await server.close();
  clearInterval(internalId);
};
