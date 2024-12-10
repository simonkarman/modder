'use client';

import { Chat } from '@/components/chat';
import { useClient } from '@/store/krmx';
import { capitalize } from '@krmx/state';
import { GameModel } from '@/modder/game-model';

export default function Page() {
  const { status, username } = useClient();

  if (status !== 'linked') {
    return null;
  }

  return <div className="px-2 pb-16 pt-10 md:mx-4">
    <Chat/>
    <div className="space-y-0.5">
      <h1 className="text-lg font-bold">Welcome, {capitalize(username!)}!</h1>
      <p>Modder is a moddable game about mud.</p>
    </div>
    <GameModel />
  </div>;
}
