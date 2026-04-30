import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";

interface ConversionChallenge {
  id: string;
  fromValue: string;
  fromBase: 'binary' | 'decimal' | 'hex';
  toBase: 'binary' | 'decimal' | 'hex';
  correctAnswer: string;
}

interface SpeedGameStats {
  score: number;
  correct: number;
  incorrect: number;
  streak: number;
  timeRemaining: number;
  level: number;
  wpm: number; // words per minute equivalent
}

interface ConversionSpeedChallengeProps {
  onGameEnd?: (score: number) => void;
}

export default function ConversionSpeedChallenge({ onGameEnd }: ConversionSpeedChallengeProps) {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameOver'>('menu');
  const [currentChallenge, setCurrentChallenge] = useState<ConversionChallenge | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [stats, setStats] = useState<SpeedGameStats>({
    score: 0,
    correct: 0,
    incorrect: 0,
    streak: 0,
    timeRemaining: 60,
    level: 1,
    wpm: 0
  });
  
  const [gameMode, setGameMode] = useState<'sprint' | 'marathon' | 'mixed'>('sprint');
  const [, setChallenges] = useState<ConversionChallenge[]>([]);
  const [challengeStartTime, setChallengeStartTime] = useState<number>(0);

  // Generate a single conversion challenge
  const generateChallenge = useCallback((level: number, mode: 'sprint' | 'marathon' | 'mixed'): ConversionChallenge => {
    const bases: Array<'binary' | 'decimal' | 'hex'> = ['binary', 'decimal', 'hex'];
    
    let fromBase: 'binary' | 'decimal' | 'hex';
    let toBase: 'binary' | 'decimal' | 'hex';
    
    if (mode === 'mixed') {
      // Random conversion
      fromBase = bases[Math.floor(Math.random() * 3)];
      do {
        toBase = bases[Math.floor(Math.random() * 3)];
      } while (toBase === fromBase);
    } else if (mode === 'sprint') {
      // Focus on decimal <-> binary
      const conversions = [
        ['decimal', 'binary'],
        ['binary', 'decimal']
      ];
      const conversion = conversions[Math.floor(Math.random() * 2)];
      fromBase = conversion[0] as 'binary' | 'decimal';
      toBase = conversion[1] as 'binary' | 'decimal';
    } else {
      // Marathon: all types, increasing difficulty
      if (level <= 3) {
        fromBase = 'decimal';
        toBase = 'binary';
      } else if (level <= 6) {
        const conversions = [['decimal', 'binary'], ['binary', 'decimal']];
        const conversion = conversions[Math.floor(Math.random() * 2)];
        fromBase = conversion[0] as 'binary' | 'decimal';
        toBase = conversion[1] as 'binary' | 'decimal';
      } else {
        fromBase = bases[Math.floor(Math.random() * 3)];
        do {
          toBase = bases[Math.floor(Math.random() * 3)];
        } while (toBase === fromBase);
      }
    }

    // Generate value based on level
    const maxValue = Math.min(255, Math.pow(2, Math.min(8, 3 + Math.floor(level / 2))));
    const minValue = Math.max(1, Math.pow(2, Math.max(0, Math.floor((level - 1) / 3))));
    const decimalValue = Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue;
    
    let fromValue: string;
    let correctAnswer: string;
    
    // Generate fromValue
    switch (fromBase) {
      case 'binary':
        fromValue = decimalValue.toString(2);
        break;
      case 'decimal':
        fromValue = decimalValue.toString();
        break;
      case 'hex':
        fromValue = decimalValue.toString(16).toUpperCase();
        break;
    }
    
    // Generate correct answer
    switch (toBase) {
      case 'binary':
        correctAnswer = decimalValue.toString(2);
        break;
      case 'decimal':
        correctAnswer = decimalValue.toString();
        break;
      case 'hex':
        correctAnswer = decimalValue.toString(16).toUpperCase();
        break;
    }

    return {
      id: Math.random().toString(36).substr(2, 9),
      fromValue,
      fromBase,
      toBase,
      correctAnswer
    };
  }, []);

  const startGame = (mode: 'sprint' | 'marathon' | 'mixed') => {
    setGameMode(mode);
    setGameState('playing');
    
    const initialTime = mode === 'sprint' ? 60 : mode === 'marathon' ? 120 : 90;
    
    setStats({
      score: 0,
      correct: 0,
      incorrect: 0,
      streak: 0,
      timeRemaining: initialTime,
      level: 1,
      wpm: 0
    });
    
    setUserAnswer('');
    setFeedback(null);
    setChallenges([]);
    
    const firstChallenge = generateChallenge(1, mode);
    setCurrentChallenge(firstChallenge);
    setChallengeStartTime(Date.now());
  };

  const submitAnswer = () => {
    if (!currentChallenge || !userAnswer.trim()) return;
    
    const isCorrect = userAnswer.trim().toUpperCase() === currentChallenge.correctAnswer.toUpperCase();
    const responseTime = Date.now() - challengeStartTime;
    
    setFeedback(isCorrect ? 'correct' : 'incorrect');
    
    setStats(prev => {
      const newCorrect = isCorrect ? prev.correct + 1 : prev.correct;
      const newIncorrect = isCorrect ? prev.incorrect : prev.incorrect + 1;
      const newStreak = isCorrect ? prev.streak + 1 : 0;
      
      // Calculate score
      let points = 0;
      if (isCorrect) {
        const basePoints = 100;
        const speedBonus = Math.max(0, 5000 - responseTime) / 100; // Bonus for speed
        const streakBonus = newStreak * 10;
        const levelBonus = prev.level * 5;
        points = Math.floor(basePoints + speedBonus + streakBonus + levelBonus);
      }
      
      // Calculate WPM equivalent (conversions per minute)
      const totalChallenges = newCorrect + newIncorrect;
      const gameTime = (60 - prev.timeRemaining) + 1; // Avoid division by zero
      const wpm = Math.round((totalChallenges / gameTime) * 60);
      
      // Level up every 10 correct answers
      const newLevel = Math.floor(newCorrect / 10) + 1;
      
      return {
        ...prev,
        score: prev.score + points,
        correct: newCorrect,
        incorrect: newIncorrect,
        streak: newStreak,
        level: newLevel,
        wpm
      };
    });
    
    // Store challenge result
    setChallenges(prev => [...prev, {
      ...currentChallenge,
      correctAnswer: userAnswer // Store what user answered for review
    }]);
    
    setTimeout(() => {
      if (stats.timeRemaining > 0) {
        const nextChallenge = generateChallenge(stats.level, gameMode);
        setCurrentChallenge(nextChallenge);
        setUserAnswer('');
        setFeedback(null);
        setChallengeStartTime(Date.now());
      }
    }, 1000);
  };

  // Handle Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      submitAnswer();
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

  const getBaseColor = (base: 'binary' | 'decimal' | 'hex') => {
    switch (base) {
      case 'binary': return 'text-green-600 dark:text-green-400';
      case 'decimal': return 'text-blue-600 dark:text-blue-400';
      case 'hex': return 'text-purple-600 dark:text-purple-400';
    }
  };

  const getBaseIcon = (base: 'binary' | 'decimal' | 'hex') => {
    switch (base) {
      case 'binary': return '⚡';
      case 'decimal': return '🔢';
      case 'hex': return '🔶';
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (gameState === 'menu') {
    return (
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg text-center">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">
            ⚡ Conversion Speed Challenge
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            How fast can you convert between number systems?
          </p>
        </div>
        
        <div className="mb-8 p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">Game Modes:</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <h4 className="font-bold text-green-700 dark:text-green-300">🏃 Sprint</h4>
              <p className="text-sm">60 seconds of decimal ↔ binary conversions</p>
            </div>
            <div className="p-4 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <h4 className="font-bold text-blue-700 dark:text-blue-300">🏃‍♂️ Marathon</h4>
              <p className="text-sm">120 seconds, progressive difficulty</p>
            </div>
            <div className="p-4 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <h4 className="font-bold text-purple-700 dark:text-purple-300">🎯 Mixed</h4>
              <p className="text-sm">90 seconds of all conversion types</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => startGame('sprint')}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors w-full md:w-auto"
          >
            🏃 Start Sprint
          </button>
          
          <button
            onClick={() => startGame('marathon')}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors w-full md:w-auto mx-4"
          >
            🏃‍♂️ Start Marathon
          </button>
          
          <button
            onClick={() => startGame('mixed')}
            className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors w-full md:w-auto"
          >
            🎯 Start Mixed
          </button>
        </div>
      </div>
    );
  }

  if (gameState === 'gameOver') {
    const accuracy = stats.correct + stats.incorrect > 0 ? Math.round((stats.correct / (stats.correct + stats.incorrect)) * 100) : 0;
    
    return (
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg text-center">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">
            ⏰ Time's Up!
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.score}</div>
              <div className="text-sm text-gray-500">Score</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.correct}</div>
              <div className="text-sm text-gray-500">Correct</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{accuracy}%</div>
              <div className="text-sm text-gray-500">Accuracy</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.wpm}</div>
              <div className="text-sm text-gray-500">CPM</div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => startGame(gameMode)}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded-lg transition-colors"
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
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {stats.score}
            </div>
            <div className="text-xs text-gray-500">SCORE</div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-bold text-green-600 dark:text-green-400">
              {stats.correct}
            </div>
            <div className="text-xs text-gray-500">CORRECT</div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-bold text-red-600 dark:text-red-400">
              {stats.incorrect}
            </div>
            <div className="text-xs text-gray-500">WRONG</div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
              {stats.streak}
            </div>
            <div className="text-xs text-gray-500">STREAK</div>
          </div>
        </div>
        
        <div className={`text-2xl font-bold ${
          stats.timeRemaining <= 10 ? 'text-red-500' : 'text-blue-600 dark:text-blue-400'
        }`}>
          ⏰ {formatTime(stats.timeRemaining)}
        </div>
      </div>

      {currentChallenge && (
        <div className="text-center mb-8">
          <h3 className="text-lg font-semibold mb-4">Convert:</h3>
          
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className="text-center">
              <div className={`text-4xl font-bold font-mono ${getBaseColor(currentChallenge.fromBase)}`}>
                {currentChallenge.fromValue}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                {getBaseIcon(currentChallenge.fromBase)} {currentChallenge.fromBase}
              </div>
            </div>
            
            <div className="text-3xl text-gray-400">→</div>
            
            <div className="text-center">
              <div className={`text-2xl font-semibold ${getBaseColor(currentChallenge.toBase)}`}>
                {getBaseIcon(currentChallenge.toBase)} {currentChallenge.toBase}
              </div>
            </div>
          </div>

          <div className="flex justify-center space-x-4">
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your answer..."
              className={`
                text-2xl font-mono text-center p-4 border-2 rounded-lg w-64 focus:outline-none
                ${feedback === 'correct' ? 'border-green-500 bg-green-50' : 
                  feedback === 'incorrect' ? 'border-red-500 bg-red-50' : 
                  'border-gray-300 dark:border-gray-600'
                }
                dark:bg-gray-700 dark:text-white
              `}
              disabled={feedback !== null}
              autoFocus
            />
            
            <button
              onClick={submitAnswer}
              disabled={!userAnswer.trim() || feedback !== null}
              className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white font-bold py-4 px-8 rounded-lg transition-colors"
            >
              Submit
            </button>
          </div>
        </div>
      )}

      {/* Feedback */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className={`text-center text-2xl font-bold mb-4 ${
              feedback === 'correct' ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {feedback === 'correct' ? (
              <div>
                <div>🎉 Correct!</div>
                {stats.streak > 1 && (
                  <div className="text-lg text-purple-600 dark:text-purple-400">
                    🔥 {stats.streak} streak!
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div>❌ Wrong!</div>
                <div className="text-lg text-gray-600 dark:text-gray-400">
                  Answer: {currentChallenge?.correctAnswer}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress Bar */}
      <div className="mt-8">
        <div className="flex justify-between text-sm text-gray-500 mb-2">
          <span>Level {stats.level}</span>
          <span>{stats.wpm} CPM</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-orange-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(stats.correct % 10) * 10}%` }}
          />
        </div>
      </div>
    </div>
  );
}