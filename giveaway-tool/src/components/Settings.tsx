import { useState } from 'react';
import { useGiveawayStore } from '../store/giveawayStore';

interface Props {
  onConnect: (channel: string, token: string) => void;
  onDisconnect: () => void;
  twitchStatus: 'disconnected' | 'connected' | 'error';
  twitchStatusDetail?: string;
}

export default function Settings({ onConnect, onDisconnect, twitchStatus, twitchStatusDetail }: Props) {
  const { settings, updateSettings } = useGiveawayStore();
  const [open, setOpen] = useState(false);

  const statusColor =
    twitchStatus === 'connected' ? '#4caf50' :
    twitchStatus === 'error' ? '#f44336' : '#888';

  return (
    <div className="card">
      <div className="card-header" onClick={() => setOpen((v) => !v)} style={{ cursor: 'pointer' }}>
        <span>Settings</span>
        <span style={{ color: statusColor, fontSize: '0.8rem' }}>
          {twitchStatus === 'connected' && `● Connected to #${settings.twitchChannel}`}
          {twitchStatus === 'disconnected' && '● Disconnected'}
          {twitchStatus === 'error' && `● Error: ${twitchStatusDetail}`}
        </span>
        <span className="chevron">{open ? '▲' : '▼'}</span>
      </div>

      {open && (
        <div className="card-body settings-grid">
          <label>
            Twitch Channel
            <input
              value={settings.twitchChannel}
              onChange={(e) => updateSettings({ twitchChannel: e.target.value })}
              placeholder="channelname"
            />
          </label>
          <label>
            Twitch OAuth Token
            <input
              type="password"
              value={settings.twitchOAuthToken}
              onChange={(e) => updateSettings({ twitchOAuthToken: e.target.value })}
              placeholder="oauth:xxxxxxxxxxxx"
            />
          </label>
          <label>
            Fourthwall API Key
            <input
              type="password"
              value={settings.fourthwallApiKey}
              onChange={(e) => updateSettings({ fourthwallApiKey: e.target.value })}
              placeholder="fw_..."
            />
          </label>
          <label>
            Entry Keyword
            <input
              value={settings.entryKeyword}
              onChange={(e) => updateSettings({ entryKeyword: e.target.value })}
              placeholder="!enter"
            />
          </label>
          <label>
            Cooldown (days)
            <input
              type="number"
              min={1}
              value={settings.cooldownDays}
              onChange={(e) => updateSettings({ cooldownDays: Number(e.target.value) })}
            />
          </label>

          <div className="settings-actions">
            {twitchStatus !== 'connected' ? (
              <button
                className="btn btn-primary"
                onClick={() => onConnect(settings.twitchChannel, settings.twitchOAuthToken)}
                disabled={!settings.twitchChannel}
              >
                Connect to Twitch
              </button>
            ) : (
              <button className="btn btn-danger" onClick={onDisconnect}>
                Disconnect
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
