import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useDebounce } from "./hooks/useDebounce";
import Steps from "./components/Steps";

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
  const [input, setInput] = useState('');
  const [base, setBase] = useState('decimal');
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [appState, setAppState] = useState<AppState>('idle');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [visibleSteps, setVisibleSteps] = useState<ConversionStep[]>([]);
  const debouncedInput = useDebounce(input, 500);

  const startAnimation = useCallback(() => {
    if (!result) return;
    
    setVisibleSteps([]);
    setCurrentStepIndex(0);
    setIsPlaying(true);
    
    const timer = setInterval(() => {
      setCurrentStepIndex(prev => {
        const nextStep = prev + 1;
        if (nextStep >= result.steps.length) {
          clearInterval(timer);
          setIsPlaying(false);
          setAppState('finished');
          return prev;
        }
        setVisibleSteps(prevSteps => [...prevSteps, result.steps[prev]]);
        return nextStep;
      });
    }, 1500); // Adjust timing as needed
    
    return () => clearInterval(timer);
  }, [result]);

  const convertNumber = useCallback(async (value: string, numberBase: string) => {
    if (!value.trim()) {
      setAppState('idle');
      setResult(null);
      setCurrentStepIndex(0);
      setIsPlaying(false);
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
      setIsPlaying(true);
    } catch (err) {
      console.error("Conversion failed:", err);
      setAppState('idle');
    }
  }, []);

  // Handle debounced input changes
  useEffect(() => {
    // Clear results if input is empty
    if (!input.trim()) {
      setAppState('idle');
      setResult(null);
      setVisibleSteps([]);
      return;
    }
    
    // Only proceed if debounced input matches current input
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
      }, 800); // Time between steps
      
      return () => clearTimeout(timer);
    } else if (currentStepIndex === steps.length - 1) {
      // All steps shown, start visualizer animation
      const timer = setTimeout(() => {
        setAppState('animatingVisualizer');
        
        // Final state after all animations
        const finalTimer = setTimeout(() => {
          setAppState('finished');
          setIsPlaying(false);
        }, 1000);
        
        return () => clearTimeout(finalTimer);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [appState, currentStepIndex, result]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleBaseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setBase(e.target.value);
  };
 
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4">
        <div className="max-w-6xl mx-auto">
          <header className="flex items-center justify-between py-4">
            <h1 className="text-2xl font-bold">Number Systems Converter</h1>
          </header>
  
          <main className="grid grid-cols-1 gap-6 md:grid-cols-[360px,1fr]">
            <aside className="space-y-4">
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
                    className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
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
                    className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 disabled:opacity-50"
                  >
                    <option value="decimal">Decimal</option>
                    <option value="binary">Binary</option>
                    <option value="hex">Hexadecimal</option>
                  </select>
                </div>
  
                <button
                  disabled={appState === 'loading' || !input.trim()}
                  className={`w-full font-medium py-2 px-4 rounded-md transition-colors ${
                    appState === 'loading' 
                      ? 'bg-blue-400 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {appState === 'loading' ? 'Converting...' : 'Convert'}
                </button>
              </div>
            </aside>
  
            <section className="space-y-6">
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
  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-medium">
                        Conversion Steps
                        {appState === 'animatingSteps' && (
                          <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                            (Step {currentStepIndex + 1} of {result.steps.length})
                          </span>
                        )}
                      </h3>
                      
                      {appState === 'finished' && (
                        <button
                          onClick={() => {
                            setCurrentStepIndex(0);
                            setAppState('animatingSteps');
                            startAnimation();
                          }}
                          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          Replay Animation
                        </button>
                      )}
                    </div>
  
                    <div className="space-y-3">
                      <Steps 
                        steps={result.steps} 
                        play={appState === 'animatingSteps' || appState === 'finished'}
                        currentStepIndex={currentStepIndex}
                      />
                    </div>
                  </div>
                </div>
              )}
            </section>
          </main>
        </div>
      </div>
    );
  }
  


export default App;
