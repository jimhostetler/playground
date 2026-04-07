import { format } from 'date-fns';
import { useGiveawayStore } from '../store/giveawayStore';
import { fetchUnclaimedGiveaways } from '../lib/fourthwall';

export default function FourthwallPanel() {
  const {
    settings,
    unclaimedGiveaways,
    isFetchingFourthwall,
    fourthwallError,
    setUnclaimedGiveaways,
    setFourthwallError,
    setFetchingFourthwall,
    startGiveaway,
  } = useGiveawayStore();

  const handleFetch = async () => {
    if (!settings.fourthwallApiKey) {
      setFourthwallError('Enter a Fourthwall API key in Settings first.');
      return;
    }
    setFetchingFourthwall(true);
    setFourthwallError(null);
    try {
      const orders = await fetchUnclaimedGiveaways(settings.fourthwallApiKey);
      setUnclaimedGiveaways(orders);
    } catch (err) {
      setFourthwallError(err instanceof Error ? err.message : String(err));
    } finally {
      setFetchingFourthwall(false);
    }
  };

  return (
    <div className="card flex-col">
      <div className="card-header">
        <span>Unclaimed Fourthwall Giveaways</span>
        <button
          className="btn btn-sm btn-secondary"
          onClick={handleFetch}
          disabled={isFetchingFourthwall}
        >
          {isFetchingFourthwall ? 'Loading…' : 'Refresh'}
        </button>
      </div>
      <div className="card-body">
        {fourthwallError && (
          <div className="error-banner">{fourthwallError}</div>
        )}

        {!fourthwallError && unclaimedGiveaways.length === 0 && (
          <div className="empty-state">
            {isFetchingFourthwall ? 'Fetching orders…' : 'No unclaimed giveaways — click Refresh'}
          </div>
        )}

        {unclaimedGiveaways.length > 0 && (
          <table className="winners-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Recipient</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {unclaimedGiveaways.map((o) => (
                <tr key={o.id}>
                  <td>{o.productName}</td>
                  <td className="username">{o.recipientName}</td>
                  <td className="muted">{format(new Date(o.createdAt), 'MMM d, yyyy')}</td>
                  <td className="actions">
                    {o.orderUrl && (
                      <a
                        className="btn btn-sm btn-ghost"
                        href={o.orderUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View
                      </a>
                    )}
                    <button
                      className="btn btn-sm btn-secondary"
                      title="Re-run this giveaway"
                      onClick={() => startGiveaway(o.productName)}
                    >
                      Re-run
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
