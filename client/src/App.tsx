import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useDebounce } from "./hooks/useDebounce";
import StepsAnimator from "./components/StepsAnimator";
import BinaryVisualizer from "./components/BinaryVisualizer";
import InteractiveBitDiagram from "./components/InteractiveBitDiagram";
import ConversionProcessVisualizer from "./components/ConversionProcessVisualizer";
import NumberLineVisualization from "./components/NumberLineVisualization";
import PlaceValueDiagram from "./components/PlaceValueDiagram";
import ComparisonMatrix from "./components/ComparisonMatrix";
import BinaryBuilderGame from "./components/games/BinaryBuilderGame";
import NumberSystemMemoryMatch from "./components/games/NumberSystemMemoryMatch";
import ConversionSpeedChallenge from "./components/games/ConversionSpeedChallenge";

type AppState = 'idle' | 'typing' | 'loading' | 'resultReceived' | 'animatingSteps' | 'animatingVisualizer' | 'finished';

interface ConversionStep {
  value: string;
  explanation: string;
}

interface ConversionResult {
  binary: string;
  decimal: string;
  hex: string;
  steps: ConversionStep[];
}

const API_URL = "http://localhost:5000/api/convert";

function App() {
  const [input, setInput] = useState('42');
  const [base, setBase] = useState('decimal');
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [appState, setAppState] = useState<AppState>('idle');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('converter');
  const [numberLineValue, setNumberLineValue] = useState(42);
  const [placeValueInput, setPlaceValueInput] = useState('42');
  const [activeGame, setActiveGame] = useState<'binary-builder' | 'memory-match' | 'speed-challenge' | null>(null);
  const debouncedInput = useDebounce(input, 500);

  // Tab configuration
  const tabs = [
    { id: 'converter', label: 'Converter', icon: '🔄' },
    { id: 'bit-diagram', label: 'Bit Diagram', icon: '🔢' },
    { id: 'process', label: 'Process', icon: '⚙️' },
    { id: 'number-line', label: 'Number Line', icon: '📏' },
    { id: 'place-values', label: 'Place Values', icon: '📊' },
    { id: 'comparison', label: 'Comparison', icon: '📋' },
    { id: 'games', label: 'Games', icon: '🎮' }
  ];

  const convertNumber = useCallback(async (value: string, numberBase: string) => {
    if (!value.trim()) {
      setAppState('idle');
      setResult(null);
      setCurrentStepIndex(0);
      return;
    }

    setAppState('loading');
    
    try {
      const res = await axios.post(API_URL, {
        input: value,
        base: numberBase,
      });
      
      setResult(res.data);
      setCurrentStepIndex(0);
      setAppState('resultReceived');
    } catch (err) {
      console.error("Conversion failed:", err);
      setAppState('idle');
    }
  }, []);

  // Handle debounced input changes
  useEffect(() => {
    if (!input.trim()) {
      setAppState('idle');
      setResult(null);
      return;
    }
    
    if (debouncedInput === input) {
      convertNumber(debouncedInput, base);
    } else {
      setAppState('typing');
    }
  }, [debouncedInput, input, base, convertNumber]);

  // Animate steps one by one when results are received
  useEffect(() => {
    if (appState !== 'resultReceived' || !result) return;
    
    setAppState('animatingSteps');
    const steps = result.steps;
    
    if (currentStepIndex < steps.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStepIndex(prev => prev + 1);
      }, 800);
      
      return () => clearTimeout(timer);
    } else if (currentStepIndex === steps.length - 1) {
      const timer = setTimeout(() => {
        setAppState('animatingVisualizer');
        
        const finalTimer = setTimeout(() => {
          setAppState('finished');
        }, 1000);
        
        return () => clearTimeout(finalTimer);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [appState, currentStepIndex, result]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    // Sync with number line if it's a valid number
    const num = parseInt(e.target.value, 10);
    if (!isNaN(num) && num >= 0 && num <= 255) {
      setNumberLineValue(num);
    }
  };

  const handleBaseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setBase(e.target.value);
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  // Sync values between components
  const handleNumberLineChange = (value: number) => {
    setNumberLineValue(value);
    setInput(value.toString());
    setPlaceValueInput(value.toString());
  };

  const handlePlaceValueChange = (newValue: string) => {
    setPlaceValueInput(newValue);
    const num = parseInt(newValue, 10);
    if (!isNaN(num) && num >= 0 && num <= 255) {
      setNumberLineValue(num);
      setInput(newValue);
    }
  };

  // Get the appropriate base for place value diagram
  const getPlaceValueBase = () => {
    if (activeTab === 'place-values') {
      return base as 'binary' | 'decimal' | 'hex';
    }
    return 'decimal' as const;
  };

  const getPlaceValueInput = () => {
    if (!result) return placeValueInput;
    
    switch (base) {
      case 'binary': return result.binary;
      case 'hex': return result.hex;
      default: return result.decimal;
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'converter':
        return (
          <div className="space-y-6">
            {result && (
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Results</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Binary</div>
                    <div className="font-mono text-lg">{result.binary}</div>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Decimal</div>
                    <div className="font-mono text-lg">{result.decimal}</div>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Hexadecimal</div>
                    <div className="font-mono text-lg">{result.hex}</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <StepsAnimator 
                    steps={result.steps} 
                    play={appState === 'animatingSteps' || appState === 'finished'}
                    currentStepIndex={currentStepIndex}
                  />
                  
                  {(appState === "animatingVisualizer" || appState === "finished") && (
                    <div className="mt-8">
                      <h3 className="text-lg font-medium mb-3">Binary Visualizer</h3>
                      <BinaryVisualizer binaryValue={result.binary} />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );

      case 'bit-diagram':
        return result ? (
          <InteractiveBitDiagram 
            binaryValue={result.binary}
            showAnimation={true}
          />
        ) : (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow text-center">
            <p className="text-gray-500">Enter a number to see the interactive bit diagram</p>
          </div>
        );

      case 'process':
        return (
          <ConversionProcessVisualizer
            fromBase={base}
            toBase={base === 'decimal' ? 'binary' : 'decimal'}
            inputValue={input}
            autoPlay={true}
          />
        );

      case 'number-line':
        return (
          <NumberLineVisualization
            min={0}
            max={255}
            currentValue={numberLineValue}
            onValueChange={handleNumberLineChange}
          />
        );

      case 'place-values':
        return (
          <div className="space-y-6">
            <div className="flex justify-center space-x-2 mb-4">
              {['binary', 'decimal', 'hex'].map((system) => (
                <button
                  key={system}
                  onClick={() => setBase(system)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    base === system
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {system.charAt(0).toUpperCase() + system.slice(1)}
                </button>
              ))}
            </div>
            
            <PlaceValueDiagram
              numberSystem={getPlaceValueBase()}
              value={getPlaceValueInput()}
              interactive={true}
              onValueChange={handlePlaceValueChange}
            />
          </div>
        );

      case 'comparison':
        return (
          <ComparisonMatrix
            startRange={0}
            endRange={31}
            highlightValue={result ? parseInt(result.decimal, 10) : undefined}
            showPatterns={true}
          />
        );

      case 'games':
        return (
          <div className="space-y-6">
            {!activeGame ? (
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                <h3 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  🎮 Educational Games
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-center mb-8">
                  Learn number system conversions through fun, interactive games!
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveGame('binary-builder')}
                    className="bg-gradient-to-br from-green-400 to-green-600 p-6 rounded-lg text-white cursor-pointer shadow-lg"
                  >
                    <div className="text-4xl mb-3">🔨</div>
                    <h4 className="text-xl font-bold mb-2">Binary Builder</h4>
                    <p className="text-sm opacity-90">Build binary numbers by clicking bits to match decimal targets</p>
                  </motion.div>
                  
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveGame('memory-match')}
                    className="bg-gradient-to-br from-purple-400 to-purple-600 p-6 rounded-lg text-white cursor-pointer shadow-lg"
                  >
                    <div className="text-4xl mb-3">🧠</div>
                    <h4 className="text-xl font-bold mb-2">Memory Match</h4>
                    <p className="text-sm opacity-90">Match equivalent values across different number systems</p>
                  </motion.div>
                  
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveGame('speed-challenge')}
                    className="bg-gradient-to-br from-orange-400 to-orange-600 p-6 rounded-lg text-white cursor-pointer shadow-lg"
                  >
                    <div className="text-4xl mb-3">⚡</div>
                    <h4 className="text-xl font-bold mb-2">Speed Challenge</h4>
                    <p className="text-sm opacity-90">Race against time to convert between number systems</p>
                  </motion.div>
                </div>
              </div>
            ) : (
              <div>
                <button
                  onClick={() => setActiveGame(null)}
                  className="mb-4 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  ← Back to Games
                </button>
                
                {activeGame === 'binary-builder' && <BinaryBuilderGame />}
                {activeGame === 'memory-match' && <NumberSystemMemoryMatch />}
                {activeGame === 'speed-challenge' && <ConversionSpeedChallenge />}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        <header className="flex items-center justify-between py-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Number Systems - Graphical Explanation
          </h1>
        </header>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px,1fr]">
          {/* Input Panel */}
          <aside className="space-y-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Input</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="number-input" className="block text-sm font-medium mb-1">
                    Enter Number
                  </label>
                  <input
                    id="number-input"
                    type="text"
                    value={input}
                    onChange={handleInputChange}
                    placeholder="e.g., 42, 101010, 2A"
                    className="w-full p-3 border rounded-md dark:bg-gray-700 dark:border-gray-600 text-lg"
                    aria-busy={appState === 'loading'}
                  />
                </div>

                <div>
                  <label htmlFor="base-select" className="block text-sm font-medium mb-1">
                    From Base
                  </label>
                  <select
                    id="base-select"
                    value={base}
                    onChange={handleBaseChange}
                    disabled={appState === 'loading'}
                    className="w-full p-3 border rounded-md dark:bg-gray-700 dark:border-gray-600 disabled:opacity-50"
                  >
                    <option value="decimal">Decimal</option>
                    <option value="binary">Binary</option>
                    <option value="hex">Hexadecimal</option>
                  </select>
                </div>

                {appState === 'loading' && (
                  <div className="text-center py-4">
                    <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
                    <p className="text-sm text-gray-500 mt-2">Converting...</p>
                  </div>
                )}
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-3">Explore</h3>
              <div className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`
                      w-full text-left p-3 rounded-lg transition-colors flex items-center space-x-3
                      ${activeTab === tab.id
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }
                    `}
                  >
                    <span className="text-lg">{tab.icon}</span>
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderTabContent()}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;
