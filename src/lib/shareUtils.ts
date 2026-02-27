import { GameState } from '../types';
import { getCategoryById } from '../data/categories';

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
}

export function buildShareText(game: GameState): string {
  const category = game.category ? getCategoryById(game.category) : null;
  const elapsed =
    game.startedAt && game.completedAt
      ? formatDuration(game.completedAt - game.startedAt)
      : '?';
  const filled = game.filledCount > 0 ? game.filledCount - 1 : 0; // exclude free space
  const word = game.winningWord ?? '?';
  const cat = category?.name ?? 'Meeting';

  return [
    `🎯 BINGO! ${cat}`,
    `⏱️ ${elapsed}`,
    `🏆 Winning word: "${word}"`,
    `📊 ${filled}/24 squares filled`,
    `meetingbingo.vercel.app`,
  ].join(' | ');
}

export async function shareResult(game: GameState): Promise<'shared' | 'copied' | 'error'> {
  const text = buildShareText(game);

  // Mobile: native share sheet
  if (typeof navigator.share === 'function') {
    try {
      await navigator.share({ text });
      return 'shared';
    } catch {
      // User cancelled or share failed — fall through to clipboard
    }
  }

  // Desktop: clipboard
  try {
    await navigator.clipboard.writeText(text);
    return 'copied';
  } catch {
    return 'error';
  }
}
