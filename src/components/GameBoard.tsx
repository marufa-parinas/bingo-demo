import { useState, useCallback, useRef } from 'react';
import { GameState } from '../types';
import { checkForBingo, countFilled } from '../lib/bingoChecker';
import { getCardWords } from '../lib/cardGenerator';
import { detectWordsWithAliases } from '../lib/wordDetector';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { BingoCard } from './BingoCard';
import { TranscriptPanel } from './TranscriptPanel';
import { getCategoryById } from '../data/categories';

interface Props {
  game: GameState;
  onGameUpdate: (game: GameState) => void;
  onWin: (game: GameState) => void;
  onNewCard: () => void;
}

type MicPermission = 'prompt' | 'granted' | 'denied';

export function GameBoard({ game, onGameUpdate, onWin, onNewCard }: Props) {
  const { card, winningLine, category } = game;
  const [micPermission, setMicPermission] = useState<MicPermission>('prompt');
  const [detectedWords, setDetectedWords] = useState<string[]>([]);

  // Keep a ref to the current game so the speech callback always sees fresh state
  const gameRef = useRef(game);
  gameRef.current = game;

  const handleFinalTranscript = useCallback((segment: string) => {
    const currentGame = gameRef.current;
    if (!currentGame.card) return;

    const cardWords = getCardWords(currentGame.card);
    const filledSet = new Set(
      currentGame.card.squares
        .flat()
        .filter((sq) => sq.isFilled)
        .map((sq) => sq.word.toLowerCase()),
    );

    const found = detectWordsWithAliases(segment, cardWords, filledSet);
    if (found.length === 0) return;

    setDetectedWords((prev) => [...prev, ...found]);

    // Apply auto-fills
    const updatedSquares = currentGame.card.squares.map((row) =>
      row.map((sq) =>
        found.some((w) => w.toLowerCase() === sq.word.toLowerCase()) && !sq.isFilled
          ? { ...sq, isFilled: true, isAutoFilled: true, filledAt: Date.now() }
          : sq,
      ),
    );
    const updatedCard = { ...currentGame.card, squares: updatedSquares };
    const filled = countFilled(updatedCard);
    const bingo = checkForBingo(updatedCard);
    const lastWord = found[found.length - 1];

    const updatedGame: GameState = {
      ...currentGame,
      card: updatedCard,
      filledCount: filled,
      winningLine: bingo,
      winningWord: bingo ? lastWord : currentGame.winningWord,
      completedAt: bingo ? Date.now() : currentGame.completedAt,
      status: bingo ? 'won' : 'playing',
    };

    if (bingo) {
      onWin(updatedGame);
    } else {
      onGameUpdate(updatedGame);
    }
  }, [onGameUpdate, onWin]);

  const speech = useSpeechRecognition(handleFinalTranscript);

  if (!card || !category) return null;

  const categoryData = getCategoryById(category);

  // ── Manual square toggle ──────────────────────────────────────────────────
  function handleSquareClick(row: number, col: number) {
    if (!card) return;
    const square = card.squares[row][col];
    if (square.isFreeSpace) return;

    const updatedSquares = card.squares.map((r) =>
      r.map((sq) =>
        sq.id === square.id
          ? {
              ...sq,
              isFilled: !sq.isFilled,
              isAutoFilled: false,
              filledAt: !sq.isFilled ? Date.now() : null,
            }
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

  // ── Mic permission flow ───────────────────────────────────────────────────
  function handleEnableMic() {
    if (!speech.isSupported) {
      setMicPermission('denied');
      return;
    }
    speech.startListening();
    setMicPermission('granted');
    onGameUpdate({ ...game, isListening: true });
  }

  function handleToggleMic() {
    if (speech.isListening) {
      speech.stopListening();
      onGameUpdate({ ...game, isListening: false });
    } else {
      speech.startListening();
      onGameUpdate({ ...game, isListening: true });
    }
  }

  function handleNewCardClick() {
    speech.stopListening();
    setDetectedWords([]);
    onNewCard();
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4">
      {/* Header */}
      <div className="w-full max-w-md flex items-center justify-between mb-4">
        <h1 className="text-lg font-bold text-indigo-700">🎯 Meeting Bingo</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            {game.filledCount - 1}/24
          </span>
          <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-medium">
            {categoryData?.icon} {categoryData?.name}
          </span>
        </div>
      </div>

      {/* Mic permission prompt */}
      {micPermission === 'prompt' && (
        <div className="w-full max-w-md bg-white border border-indigo-200 rounded-2xl p-4 mb-4 shadow-sm">
          <p className="text-sm font-semibold text-gray-800 mb-1">🎤 Enable auto-detection?</p>
          <p className="text-xs text-gray-500 mb-3">
            Meeting Bingo uses your microphone to detect buzzwords in real-time.
            Audio is processed locally and is never recorded or sent to any server.
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleEnableMic}
              className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all"
            >
              Allow
            </button>
            <button
              onClick={() => setMicPermission('denied')}
              className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm rounded-xl transition-all"
            >
              Skip — I'll tap manually
            </button>
          </div>
        </div>
      )}

      {/* Speech unavailable banner */}
      {(micPermission === 'denied' || (!speech.isSupported && micPermission !== 'prompt')) && (
        <div className="w-full max-w-md bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl px-3 py-2 mb-4 text-center">
          🖐 Speech recognition unavailable — tap squares manually
        </div>
      )}

      {/* Card */}
      <div className="w-full max-w-md mb-2">
        <BingoCard card={card} winningLine={winningLine} onSquareClick={handleSquareClick} />
      </div>

      {/* Transcript panel (only when mic granted) */}
      {micPermission === 'granted' && speech.isSupported && (
        <TranscriptPanel
          transcript={speech.transcript}
          interimTranscript={speech.interimTranscript}
          detectedWords={detectedWords}
          isListening={speech.isListening}
        />
      )}

      {/* Controls */}
      <div className="flex gap-3 mt-4">
        {micPermission === 'granted' && speech.isSupported && (
          <button
            onClick={handleToggleMic}
            className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${
              speech.isListening
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            {speech.isListening ? '⏹ Stop Listening' : '🎤 Start Listening'}
          </button>
        )}
        <button
          onClick={handleNewCardClick}
          className="px-4 py-2 text-sm bg-white border border-gray-300 text-gray-600 rounded-xl hover:bg-gray-50 transition-all"
        >
          🔄 New Card
        </button>
      </div>

      {/* Speech error */}
      {speech.error && (
        <p className="mt-2 text-xs text-red-500">
          Mic error: {speech.error}
        </p>
      )}
    </div>
  );
}
