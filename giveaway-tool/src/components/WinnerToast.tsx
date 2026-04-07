import type { Winner } from '../types';

interface Props {
  winner: Winner | null;
  onClose: () => void;
}

export default function WinnerToast({ winner, onClose }: Props) {
  if (!winner) return null;

  return (
    <div className="winner-toast">
      <div className="winner-toast-inner">
        <div className="winner-label">Winner!</div>
        <div className="winner-name">{winner.username}</div>
        <div className="winner-prize">{winner.prize}</div>
        <button className="btn btn-sm btn-ghost" onClick={onClose}>
          Dismiss
        </button>
      </div>
    </div>
  );
}
