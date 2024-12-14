import { placeHouse, startGame } from 'board';
import { useGame, dispatchGameEvent, useClient } from '@/store/krmx';
import { capitalize } from '@krmx/state';
import { Simulate } from 'react-dom/test-utils';

const playerColors = [
  { bg: 'bg-yellow-500', text: 'text-yellow-500' },
  { bg: 'bg-blue-500', text: 'text-blue-500' },
  { bg: 'bg-red-500', text: 'text-red-500' },
  { bg: 'bg-indigo-500', text: 'text-indigo-500' },
  { bg: 'bg-pink-500', text: 'text-pink-500' },
];

export const GameModel = () => {
  const client = useClient();
  const projection = useGame();

  const isCurrentPlayer = (playerName: string) => projection.order[projection.turn] === playerName;

  return <div>
    <div className="flex items-center gap-3">
      {projection.order.map(playerName => <p
        key={playerName}
        className={
          (projection.order[projection.turn] === playerName ? 'font-bold' : '')
          + ' ' + playerColors[projection.players[playerName]?.id || 0].text
          + ' ' + (isCurrentPlayer(playerName) ? 'underline' : '')}
      >
        {capitalize(playerName)} {projection.players[playerName]?.score}
      </p>)}
    </div>
    <div className="my-2 grid grid-cols-10 gap-1">
      {projection.tiles.map(tile => <div
        key={`${tile.x}-${tile.y}`}
        className="flex aspect-square items-center justify-center rounded-lg border border-gray-300 dark:border-gray-700"
        onClick={() => dispatchGameEvent(placeHouse({ x: tile.x, y: tile.y }))}
      >
        {tile.type === 'house' && <div
          className={`flex h-3/4 w-3/4 items-center justify-center rounded md:rounded-xl ${
            playerColors[projection.players[tile.owner || '']?.id || 0].bg
          }`}
        >
          {tile.lastChangedRound > 0 ? tile.lastChangedRound : 0}
        </div>}
        {tile.type === 'tree' && <div className="h-1/2 w-1/2 rounded-full bg-emerald-800 text-center" />}
      </div>)}
    </div>
    <button
      onClick={() => dispatchGameEvent(startGame({ width: 10, height: 10, players: client.users.map(u => u.username) }))}
    >
      Start!
    </button>
  </div>;
};
