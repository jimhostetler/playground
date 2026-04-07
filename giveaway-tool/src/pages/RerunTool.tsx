import { useState } from 'react';
import { format } from 'date-fns';
import { fetchGiveawayOrders } from '../lib/fourthwall';
import { sendChatMessage } from '../lib/twitch';
import { useGiveawayStore } from '../store/giveawayStore';
import WinnerToast from '../components/WinnerToast';
import type { FourthwallOrderRow, Winner } from '../types';

type Filter = 'all' | 'unclaimed' | 'claimed';

const STATUS_LABEL: Record<FourthwallOrderRow['claimStatus'], string> = {
  unclaimed: 'Unclaimed',
  claimed: 'Claimed',
  unknown: 'Unknown',
};

export default function RerunTool({ twitchConnected }: { twitchConnected: boolean }) {
  const { settings, isGiveawayActive, currentPrize, entrants, stopGiveaway, drawWinner } =
    useGiveawayStore();

  const [rows, setRows] = useState<FourthwallOrderRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('unclaimed');
  const [rerunning, setRerunning] = useState<string | null>(null); // orderId being re-run
  const [rerunError, setRerunError] = useState<string | null>(null);
  const [lastWinner, setLastWinner] = useState<Winner | null>(null);

  const handleFetch = async () => {
    if (!settings.fourthwallApiKey) {
      setError('Enter a Fourthwall API key in Settings first.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await fetchGiveawayOrders(settings.fourthwallApiKey);
      setRows(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleRerun = async (row: FourthwallOrderRow) => {
    setRerunning(row.orderId);
    setRerunError(null);
    try {
      if (twitchConnected) {
        await sendChatMessage(
          `🎁 GIVEAWAY RE-RUN: ${row.item} — type ${settings.entryKeyword} to enter!`
        );
      }
      useGiveawayStore.getState().startGiveaway(row.item);
    } catch (err) {
      setRerunError(err instanceof Error ? err.message : String(err));
    } finally {
      setRerunning(null);
    }
  };

  const handleDraw = () => {
    const winner = drawWinner();
    if (winner) setLastWinner(winner);
  };

  const filtered = rows.filter((r) => filter === 'all' || r.claimStatus === filter);

  return (
    <div className="page">
      {/* Active giveaway bar */}
      {isGiveawayActive && (
        <div className="active-giveaway-bar">
          <div className="active-giveaway-info">
            <span className="badge badge-active">LIVE</span>
            <strong>{currentPrize}</strong>
            <span className="muted">{entrants.length} entrant{entrants.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="row gap-sm">
            <button
              className="btn btn-primary"
              onClick={handleDraw}
              disabled={entrants.length === 0}
            >
              Draw Winner
            </button>
            <button className="btn btn-danger" onClick={stopGiveaway}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="page-header">
        <div className="row gap-sm">
          <h2>Fourthwall Giveaways</h2>
          <button className="btn btn-secondary" onClick={handleFetch} disabled={loading}>
            {loading ? 'Loading…' : rows.length ? 'Refresh' : 'Load Orders'}
          </button>
        </div>

        {rows.length > 0 && (
          <div className="filter-tabs">
            {(['unclaimed', 'claimed', 'all'] as Filter[]).map((f) => (
              <button
                key={f}
                className={`filter-tab${filter === f ? ' active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f === 'all' ? 'All' : f === 'unclaimed' ? 'Unclaimed' : 'Claimed'}
                <span className="filter-count">
                  {f === 'all' ? rows.length : rows.filter((r) => r.claimStatus === f).length}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {error && <div className="error-banner">{error}</div>}
      {rerunError && <div className="error-banner">Re-run failed: {rerunError}</div>}

      {!error && rows.length === 0 && !loading && (
        <div className="empty-state">Click "Load Orders" to fetch your Fourthwall giveaway history.</div>
      )}

      {filtered.length > 0 && (
        <div className="table-wrap">
          <table className="winners-table rerun-table">
            <thead>
              <tr>
                <th>Giveaway Date</th>
                <th>Winner</th>
                <th>Item</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, i) => (
                <tr key={`${row.orderId}-${i}`}>
                  <td className="muted">{format(new Date(row.giveawayDate), 'MMM d, yyyy')}</td>
                  <td className="username">{row.winner}</td>
                  <td>{row.item}</td>
                  <td>
                    <span className={`badge badge-status-${row.claimStatus}`}>
                      {STATUS_LABEL[row.claimStatus]}
                    </span>
                  </td>
                  <td className="actions">
                    {row.orderUrl && (
                      <a
                        className="btn btn-sm btn-ghost"
                        href={row.orderUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View
                      </a>
                    )}
                    {row.claimStatus === 'unclaimed' && (
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => handleRerun(row)}
                        disabled={!!rerunning || isGiveawayActive}
                        title={
                          isGiveawayActive
                            ? 'Finish the current giveaway first'
                            : 'Announce in chat and open entries'
                        }
                      >
                        {rerunning === row.orderId ? 'Starting…' : 'Re-run'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <WinnerToast winner={lastWinner} onClose={() => setLastWinner(null)} />
    </div>
  );
}
