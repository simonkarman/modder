import { placeHouse, startGame } from 'board';
import { useGame, dispatchGameEvent, useClient } from '@/store/krmx';

const playerColors = [
  { bg: 'bg-blue-500', text: 'text-blue-500' },
  { bg: 'bg-red-500', text: 'text-red-500' },
  { bg: 'bg-yellow-500', text: 'text-yellow-500' },
  { bg: 'bg-indigo-500', text: 'text-indigo-500' },
  { bg: 'bg-pink-500', text: 'text-pink-500' },
];

export const GameModel = () => {
  const client = useClient();
  const projection = useGame();

  const getPlayerColor = (owner: string | undefined) => {
    if (!owner) {
      return { bg: 'bg-gray-500', text: 'text-gray-500' };
    }
    const index = projection.order.findIndex(v => v === owner);
    return playerColors[index];
  };

  return <div>
    <div className="flex items-center gap-3">
      {projection.order.map(playerName => <p
        key={playerName}
        className={(projection.order[projection.turn] === playerName ? 'font-bold' : '') + ' ' + getPlayerColor(playerName).text}
      >
        {playerName}
      </p>)}
    </div>
    <div className="my-2 grid w-1/2 grid-cols-10 gap-2">
      {projection.tiles.map(tile => <div
        key={`${tile.x}-${tile.y}`}
        className="flex aspect-square items-center justify-center rounded-lg border border-gray-200"
        onClick={() => dispatchGameEvent(placeHouse({ x: tile.x, y: tile.y }))}
      >
        {tile.type === 'house' && <div className={`h-1/2 w-1/2 ${getPlayerColor(tile.owner).bg}`} />}
        {tile.type === 'tree' && <div className="h-1/2 w-1/2 rounded-full bg-emerald-800"/>}
      </div>)}
    </div>
    <button
      onClick={() => dispatchGameEvent(startGame({ width: 10, height: 10, players: client.users.map(u => u.username) }))}
    >
      Start!
    </button>
  </div>;
};
