import { useEffect, useState } from 'react';
import { formatDistanceToNow, format, isPast } from 'date-fns';
import { useGiveawayStore } from '../store/giveawayStore';
import type { Winner } from '../types';

function CooldownCell({ winner }: { winner: Winner }) {
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const id = setInterval(() => forceUpdate((n) => n + 1), 10_000);
    return () => clearInterval(id);
  }, []);

  const eligible = isPast(new Date(winner.eligibleAt));

  if (eligible) {
    return <span className="badge badge-eligible">Eligible now</span>;
  }

  return (
    <span className="badge badge-cooldown" title={format(new Date(winner.eligibleAt), 'PPPp')}>
      {formatDistanceToNow(new Date(winner.eligibleAt), { addSuffix: true })}
    </span>
  );
}

export default function WinnersList() {
  const { winners, removeWinner, resetCooldown } = useGiveawayStore();

  return (
    <div className="card flex-col">
      <div className="card-header">
        <span>Winners &amp; Cooldowns</span>
        <span className="hint">{winners.length} tracked</span>
      </div>
      <div className="card-body">
        {winners.length === 0 ? (
          <div className="empty-state">No winners yet</div>
        ) : (
          <table className="winners-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Prize</th>
                <th>Won</th>
                <th>Eligible</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {winners.map((w) => (
                <tr key={w.username}>
                  <td className="username">{w.username}</td>
                  <td>{w.prize}</td>
                  <td className="muted">{format(new Date(w.wonAt), 'MMM d, yyyy')}</td>
                  <td>
                    <CooldownCell winner={w} />
                  </td>
                  <td className="actions">
                    <button
                      className="btn btn-sm btn-ghost"
                      title="Reset cooldown now"
                      onClick={() => resetCooldown(w.username)}
                    >
                      Reset
                    </button>
                    <button
                      className="btn btn-sm btn-ghost btn-danger"
                      title="Remove from list"
                      onClick={() => removeWinner(w.username)}
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
