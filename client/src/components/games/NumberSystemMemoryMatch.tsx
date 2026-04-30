import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";

interface Card {
  id: string;
  value: number;
  base: 'binary' | 'decimal' | 'hex';
  displayValue: string;
  isFlipped: boolean;
  isMatched: boolean;
}

interface MatchGameStats {
  score: number;
  moves: number;
  timeElapsed: number;
  level: number;
  matches: number;
}

interface NumberSystemMemoryMatchProps {
  onGameEnd?: (score: number) => void;
}

export default function NumberSystemMemoryMatch({ onGameEnd }: NumberSystemMemoryMatchProps) {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'completed' | 'gameOver'>('menu');
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<string[]>([]);
  const [stats, setStats] = useState<MatchGameStats>({
    score: 0,
    moves: 0,
    timeElapsed: 0,
    level: 1,
    matches: 0
  });
  
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [showCelebration, setShowCelebration] = useState(false);

  // Generate cards based on difficulty
  const generateCards = useCallback((level: 'easy' | 'medium' | 'hard') => {
    const cardCounts = { easy: 6, medium: 9, hard: 12 }; // pairs
    const pairCount = cardCounts[level];
    const maxValue = level === 'easy' ? 15 : level === 'medium' ? 31 : 63;
    
    const numbers: number[] = [];
    while (numbers.length < pairCount) {
      const num = Math.floor(Math.random() * maxValue) + 1;
      if (!numbers.includes(num)) {
        numbers.push(num);
      }
    }

    const gameCards: Card[] = [];
    
    numbers.forEach((num, index) => {
      // Create 3 cards for each number (binary, decimal, hex)
      const bases: Array<'binary' | 'decimal' | 'hex'> = ['binary', 'decimal', 'hex'];
      
      // For each number, randomly pick 2 out of 3 bases to make pairs more interesting
      const selectedBases = bases.sort(() => Math.random() - 0.5).slice(0, level === 'easy' ? 2 : 3);
      
      selectedBases.forEach((base, baseIndex) => {
        let displayValue: string;
        switch (base) {
          case 'binary':
            displayValue = num.toString(2);
            break;
          case 'decimal':
            displayValue = num.toString();
            break;
          case 'hex':
            displayValue = num.toString(16).toUpperCase();
            break;
        }

        gameCards.push({
          id: `${index}-${baseIndex}`,
          value: num,
          base,
          displayValue,
          isFlipped: false,
          isMatched: false
        });
      });
    });

    // Shuffle cards
    return gameCards.sort(() => Math.random() - 0.5);
  }, []);

  const startGame = (selectedDifficulty: 'easy' | 'medium' | 'hard') => {
    setDifficulty(selectedDifficulty);
    setGameState('playing');
    setCards(generateCards(selectedDifficulty));
    setFlippedCards([]);
    setStats({
      score: 0,
      moves: 0,
      timeElapsed: 0,
      level: 1,
      matches: 0
    });
    setShowCelebration(false);
  };

  const getCardColor = (base: 'binary' | 'decimal' | 'hex') => {
    switch (base) {
      case 'binary': return 'bg-green-500';
      case 'decimal': return 'bg-blue-500';
      case 'hex': return 'bg-purple-500';
    }
  };

  const getCardIcon = (base: 'binary' | 'decimal' | 'hex') => {
    switch (base) {
      case 'binary': return '⚡';
      case 'decimal': return '🔢';
      case 'hex': return '🔶';
    }
  };

  const handleCardClick = (cardId: string) => {
    if (gameState !== 'playing') return;
    
    const card = cards.find(c => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched || flippedCards.length >= 2) return;

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);
    
    // Update card state
    setCards(prev => prev.map(c => 
      c.id === cardId ? { ...c, isFlipped: true } : c
    ));

    // Check for match when 2 cards are flipped
    if (newFlippedCards.length === 2) {
      setStats(prev => ({ ...prev, moves: prev.moves + 1 }));
      
      const [firstCardId, secondCardId] = newFlippedCards;
      const firstCard = cards.find(c => c.id === firstCardId);
      const secondCard = cards.find(c => c.id === secondCardId);

      if (firstCard && secondCard && firstCard.value === secondCard.value && firstCard.id !== secondCard.id) {
        // Match found!
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            (c.id === firstCardId || c.id === secondCardId) 
              ? { ...c, isMatched: true }
              : c
          ));
          
          setStats(prev => {
            const newMatches = prev.matches + 1;
            const basePoints = 100;
            const speedBonus = Math.max(0, 30 - prev.timeElapsed) * 2;
            const efficiencyBonus = Math.max(0, (20 - prev.moves)) * 5;
            const matchPoints = basePoints + speedBonus + efficiencyBonus;
            
            return {
              ...prev,
              matches: newMatches,
              score: prev.score + matchPoints
            };
          });
          
          setFlippedCards([]);
          setShowCelebration(true);
          setTimeout(() => setShowCelebration(false), 1000);
          
          // Check if game is complete
          const totalPairs = Math.floor(cards.length / 2);
          if (stats.matches + 1 >= totalPairs) {
            setTimeout(() => {
              setGameState('completed');
              onGameEnd?.(stats.score);
            }, 1500);
          }
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            (c.id === firstCardId || c.id === secondCardId) 
              ? { ...c, isFlipped: false }
              : c
          ));
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  // Timer
  useEffect(() => {
    if (gameState === 'playing') {
      const timer = setInterval(() => {
        setStats(prev => ({ ...prev, timeElapsed: prev.timeElapsed + 1 }));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameState]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (gameState === 'menu') {
    return (
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg text-center">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
            🧠 Number System Memory Match
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Match equivalent values across different number systems!
          </p>
        </div>
        
        <div className="mb-8 p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">How to Play:</h3>
          <ul className="text-left space-y-2 text-sm">
            <li>• Flip cards to reveal numbers in different bases</li>
            <li>• Match cards that represent the same value</li>
            <li>• 🔢 Decimal, ⚡ Binary, 🔶 Hexadecimal</li>
            <li>• Complete all matches to win</li>
            <li>• Bonus points for speed and efficiency</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Choose Difficulty:</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => startGame('easy')}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-6 rounded-lg transition-colors"
            >
              <div className="text-xl mb-1">🟢 Easy</div>
              <div className="text-sm">12 cards (6 pairs)</div>
              <div className="text-sm">Numbers 1-15</div>
            </button>
            
            <button
              onClick={() => startGame('medium')}
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-4 px-6 rounded-lg transition-colors"
            >
              <div className="text-xl mb-1">🟡 Medium</div>
              <div className="text-sm">18 cards (9 pairs)</div>
              <div className="text-sm">Numbers 1-31</div>
            </button>
            
            <button
              onClick={() => startGame('hard')}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-6 rounded-lg transition-colors"
            >
              <div className="text-xl mb-1">🔴 Hard</div>
              <div className="text-sm">24 cards (12 pairs)</div>
              <div className="text-sm">Numbers 1-63</div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'completed') {
    return (
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg text-center">
        <div className="mb-6">
          <motion.h2 
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2"
          >
            🏆 Congratulations!
          </motion.h2>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-2">
            Score: {stats.score}
          </p>
          <div className="text-gray-600 dark:text-gray-400 space-y-1">
            <p>Time: {formatTime(stats.timeElapsed)}</p>
            <p>Moves: {stats.moves}</p>
            <p>Efficiency: {stats.matches > 0 ? Math.round((stats.matches / stats.moves) * 100) : 0}%</p>
          </div>
        </div>
        
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => startGame(difficulty)}
            className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-6 rounded-lg transition-colors"
          >
            Play Again
          </button>
          <button
            onClick={() => setGameState('menu')}
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg transition-colors"
          >
            Main Menu
          </button>
        </div>
      </div>
    );
  }

  const gridCols = difficulty === 'easy' ? 'grid-cols-4' : difficulty === 'medium' ? 'grid-cols-6' : 'grid-cols-6';

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
      {/* Game Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {stats.score}
            </div>
            <div className="text-xs text-gray-500">SCORE</div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {stats.matches}/{Math.floor(cards.length / 2)}
            </div>
            <div className="text-xs text-gray-500">MATCHES</div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
              {stats.moves}
            </div>
            <div className="text-xs text-gray-500">MOVES</div>
          </div>
        </div>
        
        <div className="text-lg font-bold text-green-600 dark:text-green-400">
          ⏱️ {formatTime(stats.timeElapsed)}
        </div>
      </div>

      {/* Cards Grid */}
      <div className={`grid ${gridCols} gap-3 mb-6`}>
        {cards.map((card) => (
          <motion.div
            key={card.id}
            onClick={() => handleCardClick(card.id)}
            className="relative h-24 cursor-pointer"
            whileHover={{ scale: card.isMatched ? 1 : 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              className="absolute inset-0 w-full h-full"
              animate={{ rotateY: card.isFlipped || card.isMatched ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Card Back */}
              <div
                className="absolute inset-0 w-full h-full bg-gray-300 dark:bg-gray-600 rounded-lg flex items-center justify-center text-2xl"
                style={{ backfaceVisibility: "hidden" }}
              >
                🔒
              </div>
              
              {/* Card Front */}
              <div
                className={`
                  absolute inset-0 w-full h-full rounded-lg flex flex-col items-center justify-center text-white font-bold
                  ${getCardColor(card.base)}
                  ${card.isMatched ? 'opacity-60' : ''}
                `}
                style={{ 
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)"
                }}
              >
                <div className="text-lg mb-1">{getCardIcon(card.base)}</div>
                <div className="text-sm font-mono px-1 text-center break-all">
                  {card.displayValue}
                </div>
                <div className="text-xs opacity-75 capitalize">
                  {card.base}
                </div>
              </div>
            </motion.div>
            
            {/* Match indicator */}
            {card.isMatched && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
              >
                ✓
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex justify-center space-x-6 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span>⚡ Binary</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-blue-500 rounded"></div>
          <span>🔢 Decimal</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-purple-500 rounded"></div>
          <span>🔶 Hex</span>
        </div>
      </div>

      {/* Celebration */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed inset-0 flex items-center justify-center pointer-events-none z-50"
          >
            <div className="text-6xl">🎉</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}