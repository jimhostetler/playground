import { useGiveawayStore } from '../store/giveawayStore';

export default function EntrantsList() {
  const { entrants, isGiveawayActive, settings } = useGiveawayStore();

  return (
    <div className="card flex-col">
      <div className="card-header">
        <span>Current Entrants</span>
        {isGiveawayActive && (
          <span className="hint">Type <code>{settings.entryKeyword}</code> in chat to enter</span>
        )}
      </div>
      <div className="card-body entrants-list">
        {entrants.length === 0 ? (
          <div className="empty-state">
            {isGiveawayActive ? 'Waiting for entries…' : 'No active giveaway'}
          </div>
        ) : (
          <div className="entrant-grid">
            {entrants.map((name) => (
              <div key={name} className="entrant-chip">{name}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
