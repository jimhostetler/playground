import { useState } from 'react';
import { useGiveawayStore } from '../store/giveawayStore';
import type { Winner } from '../types';

interface Props {
  onWinnerDrawn: (winner: Winner) => void;
}

export default function GiveawayControl({ onWinnerDrawn }: Props) {
  const { isGiveawayActive, entrants, currentPrize, startGiveaway, stopGiveaway, drawWinner } =
    useGiveawayStore();
  const [prize, setPrize] = useState('');

  const handleStart = () => {
    if (!prize.trim()) return;
    startGiveaway(prize.trim());
    setPrize('');
  };

  const handleDraw = () => {
    const winner = drawWinner();
    if (winner) onWinnerDrawn(winner);
  };

  return (
    <div className="card">
      <div className="card-header">
        <span>Giveaway Control</span>
        {isGiveawayActive && (
          <span className="badge badge-active">LIVE — {entrants.length} entrant{entrants.length !== 1 ? 's' : ''}</span>
        )}
      </div>
      <div className="card-body">
        {!isGiveawayActive ? (
          <div className="row gap-sm">
            <input
              className="flex-1"
              value={prize}
              onChange={(e) => setPrize(e.target.value)}
              placeholder="Prize name / description"
              onKeyDown={(e) => e.key === 'Enter' && handleStart()}
            />
            <button className="btn btn-primary" onClick={handleStart} disabled={!prize.trim()}>
              Start Giveaway
            </button>
          </div>
        ) : (
          <div className="row gap-sm">
            <div className="current-prize flex-1">
              Prize: <strong>{currentPrize}</strong>
            </div>
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
        )}
      </div>
    </div>
  );
}
