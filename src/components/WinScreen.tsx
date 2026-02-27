import { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { GameState } from '../types';
import { BingoCard } from './BingoCard';
import { getCategoryById } from '../data/categories';
import { shareResult } from '../lib/shareUtils';

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
  const [shareLabel, setShareLabel] = useState<'share' | 'copied' | 'error'>('share');

  const categoryData = category ? getCategoryById(category) : null;
  const elapsed = startedAt && completedAt ? completedAt - startedAt : null;

  // FOO-27: confetti on mount — subtle burst, no sound
  useEffect(() => {
    const end = Date.now() + 1800;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#6366f1', '#10b981', '#f59e0b'],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#6366f1', '#10b981', '#f59e0b'],
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  }, []);

  async function handleShare() {
    const result = await shareResult(game);
    if (result === 'copied') {
      setShareLabel('copied');
      setTimeout(() => setShareLabel('share'), 2500);
    } else if (result === 'error') {
      setShareLabel('error');
      setTimeout(() => setShareLabel('share'), 2500);
    }
  }

  if (!card || !category) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Win heading */}
        <div className="text-center mb-5">
          <h1 className="text-5xl font-extrabold text-green-600 mb-1 animate-bounce-in">
            🎉 BINGO!
          </h1>
          <p className="text-gray-600">
            {categoryData?.icon} {categoryData?.name}
          </p>
        </div>

        {/* Winning card — screenshot-ready */}
        <div className="mb-5">
          <BingoCard card={card} winningLine={winningLine} onSquareClick={() => {}} />
        </div>

        {/* Stats — FOO-28 */}
        <div className="bg-white rounded-2xl p-4 shadow-md mb-5 grid grid-cols-3 gap-3 text-center">
          <div>
            <div className="text-2xl">⏱️</div>
            <div className="text-sm font-semibold text-gray-800">
              {elapsed ? formatDuration(elapsed) : '—'}
            </div>
            <div className="text-xs text-gray-500">Time to BINGO</div>
          </div>
          <div>
            <div className="text-2xl">🏆</div>
            <div className="text-sm font-semibold text-gray-800 truncate px-1">
              {winningWord ?? '—'}
            </div>
            <div className="text-xs text-gray-500">Winning word</div>
          </div>
          <div>
            <div className="text-2xl">📊</div>
            <div className="text-sm font-semibold text-gray-800">
              {Math.max(0, filledCount - 1)}/24
            </div>
            <div className="text-xs text-gray-500">Squares filled</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mb-3">
          <button
            onClick={handleShare}
            className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-all hover:scale-105 active:scale-95"
          >
            {shareLabel === 'copied' ? '✅ Copied!' : shareLabel === 'error' ? '❌ Failed' : '📤 Share Result'}
          </button>
        </div>
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
