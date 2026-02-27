import { GameState } from '../types';
import { BingoCard } from './BingoCard';
import { getCategoryById } from '../data/categories';

interface Props {
  game: GameState;
  onPlayAgain: () => void;
  onHome: () => void;
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
}

export function WinScreen({ game, onPlayAgain, onHome }: Props) {
  const { card, winningLine, winningWord, startedAt, completedAt, filledCount, category } = game;
  if (!card || !category) return null;

  const categoryData = getCategoryById(category);
  const elapsed = startedAt && completedAt ? completedAt - startedAt : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Win heading */}
        <div className="text-center mb-6">
          <h1 className="text-5xl font-extrabold text-green-600 mb-1">🎉 BINGO!</h1>
          <p className="text-gray-600">You won during {categoryData?.name}!</p>
        </div>

        {/* Winning card */}
        <div className="mb-6">
          <BingoCard card={card} winningLine={winningLine} onSquareClick={() => {}} />
        </div>

        {/* Stats */}
        <div className="bg-white rounded-2xl p-4 shadow-md mb-6 grid grid-cols-3 gap-3 text-center">
          <div>
            <div className="text-2xl">⏱️</div>
            <div className="text-sm font-semibold text-gray-800">
              {elapsed ? formatDuration(elapsed) : '—'}
            </div>
            <div className="text-xs text-gray-500">Time</div>
          </div>
          <div>
            <div className="text-2xl">🏆</div>
            <div className="text-sm font-semibold text-gray-800 truncate">{winningWord ?? '—'}</div>
            <div className="text-xs text-gray-500">Winning word</div>
          </div>
          <div>
            <div className="text-2xl">📊</div>
            <div className="text-sm font-semibold text-gray-800">{filledCount - 1}/24</div>
            <div className="text-xs text-gray-500">Squares filled</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onPlayAgain}
            className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all hover:scale-105 active:scale-95"
          >
            🔄 Play Again
          </button>
          <button
            onClick={onHome}
            className="flex-1 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all"
          >
            🏠 Home
          </button>
        </div>
      </div>
    </div>
  );
}
