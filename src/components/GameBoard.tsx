import { GameState, CategoryId } from '../types';
import { checkForBingo, countFilled } from '../lib/bingoChecker';
import { generateCard } from '../lib/cardGenerator';
import { BingoCard } from './BingoCard';
import { getCategoryById } from '../data/categories';

interface Props {
  game: GameState;
  onGameUpdate: (game: GameState) => void;
  onWin: (game: GameState) => void;
  onNewCard: () => void;
}

export function GameBoard({ game, onGameUpdate, onWin, onNewCard }: Props) {
  const { card, winningLine, category } = game;
  if (!card || !category) return null;

  const categoryData = getCategoryById(category);

  function handleSquareClick(row: number, col: number) {
    if (!card) return;
    const square = card.squares[row][col];
    if (square.isFreeSpace) return;

    const updatedSquares = card.squares.map((r) =>
      r.map((sq) =>
        sq.id === square.id
          ? { ...sq, isFilled: !sq.isFilled, isAutoFilled: false, filledAt: !sq.isFilled ? Date.now() : null }
          : sq,
      ),
    );
    const updatedCard = { ...card, squares: updatedSquares };
    const filled = countFilled(updatedCard);
    const bingo = checkForBingo(updatedCard);

    const updatedGame: GameState = {
      ...game,
      card: updatedCard,
      filledCount: filled,
      winningLine: bingo,
      winningWord: bingo ? square.word : game.winningWord,
      completedAt: bingo ? Date.now() : game.completedAt,
      status: bingo ? 'won' : 'playing',
    };

    if (bingo) {
      onWin(updatedGame);
    } else {
      onGameUpdate(updatedGame);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4">
      {/* Header */}
      <div className="w-full max-w-md flex items-center justify-between mb-4">
        <h1 className="text-lg font-bold text-indigo-700">🎯 Meeting Bingo</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">
            {game.filledCount - 1}/24 filled
          </span>
          <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-medium">
            {categoryData?.icon} {categoryData?.name}
          </span>
        </div>
      </div>

      {/* Card */}
      <div className="w-full max-w-md mb-4">
        <BingoCard
          card={card}
          winningLine={winningLine}
          onSquareClick={handleSquareClick}
        />
      </div>

      {/* Controls */}
      <div className="flex gap-3 mt-2">
        <button
          onClick={onNewCard}
          className="px-4 py-2 text-sm bg-white border border-gray-300 text-gray-600 rounded-xl hover:bg-gray-50 transition-all"
        >
          🔄 New Card
        </button>
      </div>
    </div>
  );
}
