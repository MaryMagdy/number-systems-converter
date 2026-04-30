import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

interface ConversionStep {
  operation: string;
  dividend?: number;
  divisor?: number;
  quotient?: number;
  remainder?: number;
  explanation: string;
  highlight?: 'dividend' | 'quotient' | 'remainder';
}

interface ConversionProcessVisualizerProps {
  fromBase: string;
  toBase: string;
  inputValue: string;
  autoPlay?: boolean;
  onComplete?: () => void;
}

export default function ConversionProcessVisualizer({
  fromBase,
  toBase,
  inputValue,
  autoPlay = true,
  onComplete
}: ConversionProcessVisualizerProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [steps, setSteps] = useState<ConversionStep[]>([]);

  // Generate conversion steps based on the conversion type
  useEffect(() => {
    if (!inputValue) return;
    
    const newSteps = generateConversionSteps(inputValue, fromBase, toBase);
    setSteps(newSteps);
    setCurrentStep(0);
  }, [inputValue, fromBase, toBase]);

  // Auto-play animation
  useEffect(() => {
    if (!autoPlay || !steps.length || isPlaying) return;
    
    setIsPlaying(true);
    const timer = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= steps.length - 1) {
          clearInterval(timer);
          setIsPlaying(false);
          onComplete?.();
          return prev;
        }
        return prev + 1;
      });
    }, 2000);

    return () => clearInterval(timer);
  }, [steps, autoPlay, onComplete, isPlaying]);

  const generateConversionSteps = (value: string, from: string, to: string): ConversionStep[] => {
    if (from === 'decimal' && to === 'binary') {
      return generateDecimalToBinarySteps(parseInt(value, 10));
    } else if (from === 'binary' && to === 'decimal') {
      return generateBinaryToDecimalSteps(value);
    } else if (from === 'decimal' && to === 'hex') {
      return generateDecimalToHexSteps(parseInt(value, 10));
    } else if (from === 'hex' && to === 'decimal') {
      return generateHexToDecimalSteps(value);
    }
    return [];
  };

  const generateDecimalToBinarySteps = (decimal: number): ConversionStep[] => {
    const steps: ConversionStep[] = [];
    let value = decimal;
    const remainders: number[] = [];

    steps.push({
      operation: "start",
      explanation: `Convert decimal ${decimal} to binary using successive division by 2`,
    });

    while (value > 0) {
      const quotient = Math.floor(value / 2);
      const remainder = value % 2;
      remainders.push(remainder);
      
      steps.push({
        operation: "divide",
        dividend: value,
        divisor: 2,
        quotient,
        remainder,
        explanation: `${value} ÷ 2 = ${quotient} remainder ${remainder}`,
        highlight: remainder === 1 ? 'remainder' : undefined
      });
      
      value = quotient;
    }

    steps.push({
      operation: "result",
      explanation: `Read remainders from bottom to top: ${remainders.reverse().join('')}`,
    });

    return steps;
  };

  const generateBinaryToDecimalSteps = (binary: string): ConversionStep[] => {
    const steps: ConversionStep[] = [];
    const bits = binary.split('').map(Number);
    let sum = 0;

    steps.push({
      operation: "start",
      explanation: `Convert binary ${binary} to decimal using weighted sum`,
    });

    bits.forEach((bit, index) => {
      const position = bits.length - 1 - index;
      const weight = Math.pow(2, position);
      const contribution = bit * weight;
      sum += contribution;

      if (bit === 1) {
        steps.push({
          operation: "multiply",
          dividend: bit,
          quotient: weight,
          remainder: contribution,
          explanation: `Position ${position}: ${bit} × 2^${position} = ${bit} × ${weight} = ${contribution}`,
          highlight: 'remainder'
        });
      }
    });

    steps.push({
      operation: "result",
      explanation: `Sum all contributions: ${sum}`,
    });

    return steps;
  };

  const generateDecimalToHexSteps = (decimal: number): ConversionStep[] => {
    const steps: ConversionStep[] = [];
    let value = decimal;
    const remainders: string[] = [];

    steps.push({
      operation: "start",
      explanation: `Convert decimal ${decimal} to hexadecimal using successive division by 16`,
    });

    while (value > 0) {
      const quotient = Math.floor(value / 16);
      const remainder = value % 16;
      const hexRemainder = remainder > 9 ? String.fromCharCode(65 + remainder - 10) : remainder.toString();
      remainders.push(hexRemainder);
      
      steps.push({
        operation: "divide",
        dividend: value,
        divisor: 16,
        quotient,
        remainder,
        explanation: `${value} ÷ 16 = ${quotient} remainder ${remainder} (${hexRemainder})`,
        highlight: 'remainder'
      });
      
      value = quotient;
    }

    steps.push({
      operation: "result",
      explanation: `Read remainders from bottom to top: ${remainders.reverse().join('')}`,
    });

    return steps;
  };

  const generateHexToDecimalSteps = (hex: string): ConversionStep[] => {
    const steps: ConversionStep[] = [];
    const digits = hex.split('');
    let sum = 0;

    steps.push({
      operation: "start",
      explanation: `Convert hexadecimal ${hex} to decimal using weighted sum`,
    });

    digits.forEach((digit, index) => {
      const position = digits.length - 1 - index;
      const digitValue = parseInt(digit, 16);
      const weight = Math.pow(16, position);
      const contribution = digitValue * weight;
      sum += contribution;

      steps.push({
        operation: "multiply",
        dividend: digitValue,
        quotient: weight,
        remainder: contribution,
        explanation: `Position ${position}: ${digit} (${digitValue}) × 16^${position} = ${digitValue} × ${weight} = ${contribution}`,
        highlight: 'remainder'
      });
    });

    steps.push({
      operation: "result",
      explanation: `Sum all contributions: ${sum}`,
    });

    return steps;
  };

  const resetAnimation = () => {
    setCurrentStep(0);
    setIsPlaying(false);
  };

  const playStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  if (!steps.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
        <p className="text-gray-500 text-center">Enter a number to see the conversion process</p>
      </div>
    );
  }

  const visibleSteps = steps.slice(0, currentStep + 1);

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold">Conversion Process</h3>
          <p className="text-gray-600 dark:text-gray-400">
            {fromBase.charAt(0).toUpperCase() + fromBase.slice(1)} to {toBase.charAt(0).toUpperCase() + toBase.slice(1)}
          </p>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50 hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            ←
          </button>
          <button
            onClick={playStep}
            disabled={currentStep >= steps.length - 1}
            className="px-3 py-1 bg-blue-500 text-white rounded disabled:opacity-50 hover:bg-blue-600"
          >
            →
          </button>
          <button
            onClick={resetAnimation}
            className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            ↻
          </button>
        </div>
      </div>

      <div className="space-y-4 min-h-[300px]">
        <AnimatePresence>
          {visibleSteps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`p-4 rounded-lg border-2 ${
                index === currentStep 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                  : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700'
              }`}
            >
              {step.operation === "divide" && (
                <div className="flex items-center justify-center space-x-8 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-mono font-bold">{step.dividend}</div>
                    <div className="text-sm text-gray-500">dividend</div>
                  </div>
                  
                  <div className="text-3xl text-gray-400">÷</div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-mono font-bold">{step.divisor}</div>
                    <div className="text-sm text-gray-500">divisor</div>
                  </div>
                  
                  <div className="text-3xl text-gray-400">=</div>
                  
                  <div className="text-center">
                    <div className={`text-2xl font-mono font-bold ${
                      step.highlight === 'quotient' ? 'text-blue-600' : ''
                    }`}>
                      {step.quotient}
                    </div>
                    <div className="text-sm text-gray-500">quotient</div>
                  </div>
                  
                  <div className="text-2xl text-gray-400">R</div>
                  
                  <div className="text-center">
                    <div className={`text-2xl font-mono font-bold ${
                      step.highlight === 'remainder' ? 'text-red-600' : ''
                    }`}>
                      {step.remainder}
                    </div>
                    <div className="text-sm text-gray-500">remainder</div>
                  </div>
                </div>
              )}

              {step.operation === "multiply" && (
                <div className="flex items-center justify-center space-x-6 mb-4">
                  <div className="text-2xl font-mono font-bold">{step.dividend}</div>
                  <div className="text-2xl text-gray-400">×</div>
                  <div className="text-2xl font-mono font-bold">{step.quotient}</div>
                  <div className="text-2xl text-gray-400">=</div>
                  <div className={`text-2xl font-mono font-bold ${
                    step.highlight === 'remainder' ? 'text-green-600' : ''
                  }`}>
                    {step.remainder}
                  </div>
                </div>
              )}

              <div className="text-center text-gray-700 dark:text-gray-300">
                {step.explanation}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="mt-6 bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Step {currentStep + 1} of {steps.length}
          </span>
          <div className="flex space-x-1">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index <= currentStep 
                    ? 'bg-blue-500' 
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}