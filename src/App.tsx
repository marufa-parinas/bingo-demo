import { useState, useEffect } from 'react';
import { GameState, CategoryId } from './types';
import { generateCard } from './lib/cardGenerator';
import { useLocalStorage } from './hooks/useLocalStorage';
import { LandingPage } from './components/LandingPage';
import { CategorySelect } from './components/CategorySelect';
import { GameBoard } from './components/GameBoard';
import { WinScreen } from './components/WinScreen';

type Screen = 'landing' | 'category' | 'game' | 'win';

const INITIAL_GAME: GameState = {
  status: 'idle',
  category: null,
  card: null,
  isListening: false,
  startedAt: null,
  completedAt: null,
  winningLine: null,
  winningWord: null,
  filledCount: 0,
};

export default function App() {
  const [game, setGame, clearGame] = useLocalStorage<GameState>(INITIAL_GAME);
  const [screen, setScreen] = useState<Screen>('landing');

  // Restore screen from persisted game state on first load
  useEffect(() => {
    if (game.status === 'playing' && game.card) setScreen('game');
    else if (game.status === 'won' && game.card) setScreen('win');
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleStart() {
    setScreen('category');
  }

  function handleCategorySelect(categoryId: CategoryId) {
    const card = generateCard(categoryId);
    const newGame: GameState = {
      ...INITIAL_GAME,
      status: 'playing',
      category: categoryId,
      card,
      startedAt: Date.now(),
      filledCount: 1,
    };
    setGame(newGame);
    setScreen('game');
  }

  function handleNewCard() {
    if (!game.category) return;
    const card = generateCard(game.category);
    const newGame: GameState = {
      ...INITIAL_GAME,
      status: 'playing',
      category: game.category,
      card,
      startedAt: Date.now(),
      filledCount: 1,
    };
    setGame(newGame);
    setScreen('game');
  }

  function handleWin(updatedGame: GameState) {
    setGame(updatedGame);
    setScreen('win');
  }

  function handlePlayAgain() {
    setScreen('category');
  }

  function handleHome() {
    clearGame();
    setScreen('landing');
  }

  return (
    <div className="min-h-screen">
      {screen === 'landing' && <LandingPage onStart={handleStart} />}
      {screen === 'category' && (
        <CategorySelect onSelect={handleCategorySelect} onBack={handleHome} />
      )}
      {screen === 'game' && (
        <GameBoard
          game={game}
          onGameUpdate={setGame}
          onWin={handleWin}
          onNewCard={handleNewCard}
        />
      )}
      {screen === 'win' && (
        <WinScreen game={game} onPlayAgain={handlePlayAgain} onHome={handleHome} />
      )}
    </div>
  );
}
