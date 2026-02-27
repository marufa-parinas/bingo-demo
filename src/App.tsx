import { useState } from 'react';
import { GameState, CategoryId } from './types';
import { generateCard } from './lib/cardGenerator';
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
  const [screen, setScreen] = useState<Screen>('landing');
  const [game, setGame] = useState<GameState>(INITIAL_GAME);

  function handleStart() {
    setScreen('category');
  }

  function handleCategorySelect(categoryId: CategoryId) {
    const card = generateCard(categoryId);
    setGame({
      ...INITIAL_GAME,
      status: 'playing',
      category: categoryId,
      card,
      startedAt: Date.now(),
      filledCount: 1, // free space
    });
    setScreen('game');
  }

  function handleNewCard() {
    if (!game.category) return;
    const card = generateCard(game.category);
    setGame({
      ...INITIAL_GAME,
      status: 'playing',
      category: game.category,
      card,
      startedAt: Date.now(),
      filledCount: 1,
    });
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
    setGame(INITIAL_GAME);
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
