import { useState, useCallback } from 'react';
import Settings from './components/Settings';
import EntrantsList from './components/EntrantsList';
import WinnersList from './components/WinnersList';
import WinnerToast from './components/WinnerToast';
import RerunTool from './pages/RerunTool';
import { connectTwitch, disconnectTwitch } from './lib/twitch';
import { useGiveawayStore } from './store/giveawayStore';
import type { Winner } from './types';
import './App.css';

type TwitchStatus = 'disconnected' | 'connected' | 'error';
type Page = 'main' | 'rerun';

export default function App() {
  const [twitchStatus, setTwitchStatus] = useState<TwitchStatus>('disconnected');
  const [twitchStatusDetail, setTwitchStatusDetail] = useState<string>();
  const [lastWinner, setLastWinner] = useState<Winner | null>(null);
  const [page, setPage] = useState<Page>('main');

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
    connectTwitch(channel, token, handleMessage, (status, detail) => {
      setTwitchStatus(status);
      setTwitchStatusDetail(detail);
    });
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
        <nav className="app-nav">
          <button
            className={`nav-link${page === 'main' ? ' active' : ''}`}
            onClick={() => setPage('main')}
          >
            Dashboard
          </button>
          <button
            className={`nav-link${page === 'rerun' ? ' active' : ''}`}
            onClick={() => setPage('rerun')}
          >
            Re-run Tool
          </button>
        </nav>
        <span className="app-header-spacer" />
        <span
          className="twitch-status"
          style={{
            color:
              twitchStatus === 'connected' ? '#4caf50' :
              twitchStatus === 'error' ? '#f44336' : '#888',
          }}
        >
          {twitchStatus === 'connected' && `● #${settings.twitchChannel}`}
          {twitchStatus === 'disconnected' && '○ Disconnected'}
          {twitchStatus === 'error' && `● Error: ${twitchStatusDetail}`}
        </span>
      </header>

      {page === 'main' && (
        <main className="app-layout">
          <div className="col-main">
            <Settings
              onConnect={handleConnect}
              onDisconnect={handleDisconnect}
              twitchStatus={twitchStatus}
              twitchStatusDetail={twitchStatusDetail}
            />
            <EntrantsList />
          </div>
          <div className="col-side">
            <WinnersList />
          </div>
        </main>
      )}

      {page === 'rerun' && (
        <main className="app-layout-full">
          <RerunTool twitchConnected={twitchStatus === 'connected'} />
        </main>
      )}

      <WinnerToast winner={lastWinner} onClose={() => setLastWinner(null)} />
    </div>
  );
}
