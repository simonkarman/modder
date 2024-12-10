import { useGame } from '@/store/krmx';

export const GameModel = () => {
  const projection = useGame();
  return <div>
    <p>Modder!</p>
    <pre>{JSON.stringify(projection, undefined, 2)}</pre>
  </div>;
};
