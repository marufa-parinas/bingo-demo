import { BingoSquare as BingoSquareType } from '../types';

interface Props {
  square: BingoSquareType;
  isWinningSquare: boolean;
  isNearWin?: boolean;
  onClick: () => void;
}

export function BingoSquare({ square, isWinningSquare, isNearWin, onClick }: Props) {
  const { word, isFilled, isAutoFilled, isFreeSpace } = square;

  const baseClasses =
    'aspect-square p-1 border-2 rounded-lg transition-all duration-200 flex items-center justify-center text-center hover:scale-105 active:scale-95 select-none';

  let stateClasses = '';
  if (isWinningSquare) {
    stateClasses = 'bg-green-500 border-green-600 text-white ring-2 ring-green-300 ring-offset-1';
  } else if (isFreeSpace) {
    stateClasses = 'bg-amber-100 border-amber-300 text-amber-700 cursor-default';
  } else if (isFilled) {
    stateClasses = `bg-blue-500 border-blue-600 text-white ${isAutoFilled ? 'animate-pulse' : ''}`;
  } else if (isNearWin) {
    stateClasses = 'bg-white border-amber-400 text-gray-700 animate-pulse cursor-pointer ring-1 ring-amber-300';
  } else {
    stateClasses = 'bg-white border-gray-200 text-gray-700 hover:border-indigo-300 cursor-pointer';
  }

  return (
    <button
      onClick={onClick}
      disabled={isFreeSpace}
      className={`${baseClasses} ${stateClasses}`}
      aria-label={isFreeSpace ? 'Free space' : word}
    >
      <span className="text-[10px] sm:text-xs font-medium leading-tight break-words hyphens-auto">
        {isFreeSpace ? '⭐ FREE' : word}
      </span>
    </button>
  );
}
