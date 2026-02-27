import { BingoCard as BingoCardType, WinningLine } from '../types';
import { BingoSquare } from './BingoSquare';

interface Props {
  card: BingoCardType;
  winningLine: WinningLine | null;
  nearLineIds?: Set<string>;
  onSquareClick: (row: number, col: number) => void;
}

export function BingoCard({ card, winningLine, nearLineIds, onSquareClick }: Props) {
  const winningIds = new Set(winningLine?.squares ?? []);

  return (
    <div className="grid grid-cols-5 gap-1 w-full mx-auto">
      {card.squares.flat().map((square) => (
        <BingoSquare
          key={square.id}
          square={square}
          isWinningSquare={winningIds.has(square.id)}
          isNearWin={nearLineIds?.has(square.id) && !square.isFilled && !winningIds.has(square.id)}
          onClick={() => onSquareClick(square.row, square.col)}
        />
      ))}
    </div>
  );
}
