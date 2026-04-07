import { useState, useCallback } from 'react';
import Settings from './components/Settings';
import GiveawayControl from './components/GiveawayControl';
import EntrantsList from './components/EntrantsList';
import WinnersList from './components/WinnersList';
import FourthwallPanel from './components/FourthwallPanel';
import WinnerToast from './components/WinnerToast';
import { connectTwitch, disconnectTwitch } from './lib/twitch';
import { useGiveawayStore } from './store/giveawayStore';
import type { Winner } from './types';
import './App.css';

type TwitchStatus = 'disconnected' | 'connected' | 'error';

export default function App() {
  const [twitchStatus, setTwitchStatus] = useState<TwitchStatus>('disconnected');
  const [twitchStatusDetail, setTwitchStatusDetail] = useState<string>();
  const [lastWinner, setLastWinner] = useState<Winner | null>(null);

  const { addEntrant, settings } = useGiveawayStore();

  const handleMessage = useCallback(
    (username: string, message: string) => {
      if (message.toLowerCase() === settings.entryKeyword.toLowerCase()) {
        addEntrant(username);
      }
    },
    [addEntrant, settings.entryKeyword]
  );

  const handleConnect = (channel: string, token: string) => {
    connectTwitch(
      channel,
      token,
      handleMessage,
      (status, detail) => {
        setTwitchStatus(status);
        setTwitchStatusDetail(detail);
      }
    );
  };

  const handleDisconnect = () => {
    disconnectTwitch();
    setTwitchStatus('disconnected');
    setTwitchStatusDetail(undefined);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Giveaway Tool</h1>
        <span className="app-subtitle">Twitch + Fourthwall</span>
      </header>

      <main className="app-layout">
        <div className="col-main">
          <Settings
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
            twitchStatus={twitchStatus}
            twitchStatusDetail={twitchStatusDetail}
          />
          <GiveawayControl onWinnerDrawn={(w) => setLastWinner(w)} />
          <EntrantsList />
        </div>

        <div className="col-side">
          <WinnersList />
          <FourthwallPanel />
        </div>
      </main>

      <WinnerToast winner={lastWinner} onClose={() => setLastWinner(null)} />
    </div>
  );
}
