import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";

interface GameStats {
  score: number;
  level: number;
  lives: number;
  streak: number;
  timeRemaining: number;
}

interface BinaryBuilderGameProps {
  onGameEnd?: (score: number) => void;
}

export default function BinaryBuilderGame({ onGameEnd }: BinaryBuilderGameProps) {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'paused' | 'gameOver'>('menu');
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    level: 1,
    lives: 3,
    streak: 0,
    timeRemaining: 30
  });
  
  const [targetValue, setTargetValue] = useState(0);
  const [playerBits, setPlayerBits] = useState<boolean[]>(new Array(8).fill(false));
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [powerUps, setPowerUps] = useState({
    hint: 3,
    extraTime: 2,
    skipTarget: 1
  });

  // Generate random target based on level
  const generateTarget = useCallback(() => {
    const maxValue = Math.min(255, Math.pow(2, Math.min(8, 3 + stats.level)));
    const minValue = Math.max(1, Math.pow(2, Math.max(1, stats.level - 1)));
    return Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue;
  }, [stats.level]);

  // Calculate current value from player bits
  const getCurrentValue = () => {
    return playerBits.reduce((sum, bit, index) => {
      return sum + (bit ? Math.pow(2, 7 - index) : 0);
    }, 0);
  };

  // Start new game
  const startGame = () => {
    setGameState('playing');
    setStats({
      score: 0,
      level: 1,
      lives: 3,
      streak: 0,
      timeRemaining: 30
    });
    setPlayerBits(new Array(8).fill(false));
    setTargetValue(generateTarget());
    setFeedback(null);
    setPowerUps({ hint: 3, extraTime: 2, skipTarget: 1 });
  };

  // Handle bit toggle
  const toggleBit = (index: number) => {
    if (gameState !== 'playing') return;
    
    setPlayerBits(prev => {
      const newBits = [...prev];
      newBits[index] = !newBits[index];
      return newBits;
    });
    setShowHint(false);
  };

  // Check answer
  const checkAnswer = () => {
    const currentValue = getCurrentValue();
    const isCorrect = currentValue === targetValue;
    
    setFeedback(isCorrect ? 'correct' : 'incorrect');
    
    if (isCorrect) {
      // Correct answer
      const basePoints = 100;
      const levelBonus = stats.level * 10;
      const streakBonus = stats.streak * 5;
      const timeBonus = Math.floor(stats.timeRemaining * 2);
      const totalPoints = basePoints + levelBonus + streakBonus + timeBonus;
      
      setStats(prev => ({
        ...prev,
        score: prev.score + totalPoints,
        streak: prev.streak + 1,
        timeRemaining: Math.min(60, prev.timeRemaining + 5) // Bonus time
      }));
      
      // Level up every 5 correct answers
      if ((stats.streak + 1) % 5 === 0) {
        setStats(prev => ({ ...prev, level: prev.level + 1 }));
      }
      
      // Generate new target after delay
      setTimeout(() => {
        setTargetValue(generateTarget());
        setPlayerBits(new Array(8).fill(false));
        setFeedback(null);
      }, 1500);
      
    } else {
      // Wrong answer
      setStats(prev => ({
        ...prev,
        lives: prev.lives - 1,
        streak: 0
      }));
      
      // Game over check
      if (stats.lives <= 1) {
        setGameState('gameOver');
        onGameEnd?.(stats.score);
      }
      
      setTimeout(() => {
        setFeedback(null);
      }, 2000);
    }
  };

  // Use hint power-up
  const useHint = () => {
    if (powerUps.hint > 0 && !showHint) {
      setPowerUps(prev => ({ ...prev, hint: prev.hint - 1 }));
      setShowHint(true);
    }
  };

  // Use extra time power-up
  const useExtraTime = () => {
    if (powerUps.extraTime > 0) {
      setPowerUps(prev => ({ ...prev, extraTime: prev.extraTime - 1 }));
      setStats(prev => ({ ...prev, timeRemaining: prev.timeRemaining + 15 }));
    }
  };

  // Skip target power-up
  const skipTarget = () => {
    if (powerUps.skipTarget > 0) {
      setPowerUps(prev => ({ ...prev, skipTarget: prev.skipTarget - 1 }));
      setTargetValue(generateTarget());
      setPlayerBits(new Array(8).fill(false));
      setFeedback(null);
    }
  };

  // Timer countdown
  useEffect(() => {
    if (gameState === 'playing' && stats.timeRemaining > 0) {
      const timer = setTimeout(() => {
        setStats(prev => ({ ...prev, timeRemaining: prev.timeRemaining - 1 }));
      }, 1000);
      return () => clearTimeout(timer);
    } else if (gameState === 'playing' && stats.timeRemaining <= 0) {
      setGameState('gameOver');
      onGameEnd?.(stats.score);
    }
  }, [gameState, stats.timeRemaining, onGameEnd]);

  // Auto-check when bits change
  useEffect(() => {
    if (gameState === 'playing' && getCurrentValue() === targetValue && targetValue > 0) {
      checkAnswer();
    }
  }, [playerBits, targetValue, gameState]);

  const getCorrectBinary = () => {
    return targetValue.toString(2).padStart(8, '0').split('').map(bit => bit === '1');
  };

  if (gameState === 'menu') {
    return (
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg text-center">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
            🎮 Binary Builder Game
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Build the target decimal number by turning on the correct binary bits!
          </p>
        </div>
        
        <div className="mb-8 p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">How to Play:</h3>
          <ul className="text-left space-y-2 text-sm">
            <li>• Click bits to turn them ON (1) or OFF (0)</li>
            <li>• Match the target decimal value shown</li>
            <li>• Earn points for speed and accuracy</li>
            <li>• Use power-ups strategically</li>
            <li>• Level up every 5 correct answers</li>
          </ul>
        </div>
        
        <button
          onClick={startGame}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors"
        >
          Start Game
        </button>
      </div>
    );
  }

  if (gameState === 'gameOver') {
    return (
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg text-center">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-red-600 dark:text-red-400 mb-2">
            🎮 Game Over!
          </h2>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
            Final Score: {stats.score}
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            Level Reached: {stats.level} | Best Streak: {stats.streak}
          </p>
        </div>
        
        <div className="flex justify-center space-x-4">
          <button
            onClick={startGame}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg transition-colors"
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

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
      {/* Game Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {stats.score}
            </div>
            <div className="text-xs text-gray-500">SCORE</div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-bold text-green-600 dark:text-green-400">
              {stats.level}
            </div>
            <div className="text-xs text-gray-500">LEVEL</div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
              {stats.streak}
            </div>
            <div className="text-xs text-gray-500">STREAK</div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Lives */}
          <div className="flex space-x-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className={`w-4 h-4 rounded-full ${
                  i < stats.lives ? 'bg-red-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          
          {/* Timer */}
          <div className={`text-lg font-bold ${
            stats.timeRemaining <= 10 ? 'text-red-500' : 'text-blue-600 dark:text-blue-400'
          }`}>
            ⏰ {stats.timeRemaining}s
          </div>
        </div>
      </div>

      {/* Target */}
      <div className="text-center mb-8">
        <h3 className="text-lg font-semibold mb-2">Build This Number:</h3>
        <motion.div
          key={targetValue}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-6xl font-bold text-purple-600 dark:text-purple-400"
        >
          {targetValue}
        </motion.div>
        <p className="text-gray-500 mt-2">Click the bits below to build this decimal value</p>
      </div>

      {/* Binary Bits */}
      <div className="mb-8">
        <div className="flex justify-center mb-2">
          <div className="text-sm text-gray-500 grid grid-cols-8 gap-1 text-center">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="p-1">
                2<sup>{7 - i}</sup>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex justify-center mb-2">
          <div className="text-xs text-gray-400 grid grid-cols-8 gap-1 text-center">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="p-1">
                {Math.pow(2, 7 - i)}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center space-x-1 mb-4">
          {playerBits.map((bit, index) => {
            const correctBit = showHint ? getCorrectBinary()[index] : false;
            const isCorrectPosition = bit === getCorrectBinary()[index];
            
            return (
              <motion.button
                key={index}
                onClick={() => toggleBit(index)}
                className={`
                  w-16 h-16 rounded-lg font-bold text-xl border-2 transition-all duration-200
                  ${bit
                    ? 'bg-green-500 text-white border-green-600 shadow-lg'
                    : 'bg-gray-200 text-gray-700 border-gray-300 dark:bg-gray-700 dark:text-gray-300'
                  }
                  ${showHint && correctBit ? 'ring-4 ring-yellow-400' : ''}
                  ${feedback === 'correct' && isCorrectPosition ? 'ring-4 ring-green-400' : ''}
                  ${feedback === 'incorrect' && !isCorrectPosition ? 'ring-4 ring-red-400' : ''}
                  hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500
                `}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={feedback !== null}
              >
                {bit ? '1' : '0'}
              </motion.button>
            );
          })}
        </div>

        {/* Current Value Display */}
        <div className="text-center">
          <div className="text-2xl font-bold font-mono">
            Current Value: <span className="text-blue-600 dark:text-blue-400">{getCurrentValue()}</span>
          </div>
        </div>
      </div>

      {/* Power-ups */}
      <div className="flex justify-center space-x-4 mb-6">
        <button
          onClick={useHint}
          disabled={powerUps.hint === 0}
          className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg transition-colors"
        >
          💡 Hint ({powerUps.hint})
        </button>
        
        <button
          onClick={useExtraTime}
          disabled={powerUps.extraTime === 0}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg transition-colors"
        >
          ⏱️ +15s ({powerUps.extraTime})
        </button>
        
        <button
          onClick={skipTarget}
          disabled={powerUps.skipTarget === 0}
          className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg transition-colors"
        >
          ⏭️ Skip ({powerUps.skipTarget})
        </button>
      </div>

      {/* Feedback */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className={`text-center text-2xl font-bold ${
              feedback === 'correct' ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {feedback === 'correct' ? '🎉 Correct!' : '❌ Try Again!'}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}