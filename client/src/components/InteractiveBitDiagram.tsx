import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface InteractiveBitDiagramProps {
  binaryValue: string;
  showAnimation?: boolean;
  onBitClick?: (bitIndex: number, newValue: number) => void;
}

interface BitInfo {
  position: number;
  value: number;
  weight: number;
  contribution: number;
}

export default function InteractiveBitDiagram({ 
  binaryValue, 
  showAnimation = true,
  onBitClick 
}: InteractiveBitDiagramProps) {
  const [selectedBit, setSelectedBit] = useState<number | null>(null);
  const [showCalculation, setShowCalculation] = useState(false);
  
  // Parse binary value to bit information
  const bits: BitInfo[] = binaryValue.split("").map((bit, index) => {
    const position = binaryValue.length - 1 - index;
    const value = parseInt(bit);
    const weight = Math.pow(2, position);
    const contribution = value * weight;
    
    return { position, value, weight, contribution };
  });

  // Calculate total decimal value
  const decimalValue = bits.reduce((sum, bit) => sum + bit.contribution, 0);

  const handleBitClick = (index: number) => {
    const bit = bits[index];
    setSelectedBit(selectedBit === index ? null : index);
    
    // Toggle bit value if callback provided
    if (onBitClick) {
      const newValue = bit.value === 1 ? 0 : 1;
      onBitClick(index, newValue);
    }
  };

  const activeBits = bits.filter(bit => bit.value === 1);

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Interactive Binary Breakdown</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Click on bits to see their weights and contributions. Each position represents a power of 2.
        </p>
      </div>

      {/* Binary representation with position labels */}
      <div className="mb-8">
        <div className="flex justify-center mb-2">
          <div className="text-sm text-gray-500 grid grid-cols-8 gap-1 text-center">
            {bits.map((bit, index) => (
              <div key={index} className="p-1">
                2<sup>{bit.position}</sup>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex justify-center mb-2">
          <div className="text-xs text-gray-400 grid grid-cols-8 gap-1 text-center">
            {bits.map((bit, index) => (
              <div key={index} className="p-1">
                {bit.weight}
              </div>
            ))}
          </div>
        </div>

        {/* Interactive bits */}
        <div className="flex justify-center space-x-1">
          {bits.map((bit, index) => (
            <motion.button
              key={index}
              onClick={() => handleBitClick(index)}
              className={`
                w-12 h-12 rounded-lg font-bold text-lg border-2 transition-all duration-200
                ${bit.value === 1 
                  ? 'bg-blue-500 text-white border-blue-600 shadow-lg' 
                  : 'bg-gray-200 text-gray-700 border-gray-300 dark:bg-gray-700 dark:text-gray-300'
                }
                ${selectedBit === index ? 'ring-4 ring-yellow-400 transform scale-110' : ''}
                hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500
              `}
              initial={showAnimation ? { opacity: 0, scale: 0.5, rotateY: -90 } : false}
              animate={{ 
                opacity: 1, 
                scale: selectedBit === index ? 1.1 : 1, 
                rotateY: 0 
              }}
              transition={{ 
                duration: 0.4, 
                delay: showAnimation ? index * 0.1 : 0,
                type: "spring",
                stiffness: 300
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label={`Bit ${bit.position}: ${bit.value}, weight ${bit.weight}`}
            >
              {bit.value}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Calculation breakdown */}
      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold">Decimal Calculation</h4>
          <button
            onClick={() => setShowCalculation(!showCalculation)}
            className="text-blue-600 dark:text-blue-400 text-sm hover:underline"
          >
            {showCalculation ? 'Hide' : 'Show'} Steps
          </button>
        </div>

        <AnimatePresence>
          {showCalculation && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              {activeBits.map((bit, index) => (
                <motion.div
                  key={bit.position}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between text-sm"
                >
                  <span>Position {bit.position}:</span>
                  <span className="font-mono">
                    {bit.value} × 2<sup>{bit.position}</sup> = {bit.value} × {bit.weight} = {bit.contribution}
                  </span>
                </motion.div>
              ))}
              
              <div className="border-t pt-2 mt-2">
                <div className="flex items-center justify-between font-semibold">
                  <span>Total:</span>
                  <span className="font-mono">
                    {activeBits.map(bit => bit.contribution).join(' + ')} = {decimalValue}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!showCalculation && (
          <div className="text-center">
            <span className="text-2xl font-bold font-mono">{binaryValue}</span>
            <span className="mx-4 text-gray-500">=</span>
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{decimalValue}</span>
          </div>
        )}
      </div>

      {/* Selected bit details */}
      <AnimatePresence>
        {selectedBit !== null && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg"
          >
            <h5 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
              Bit Position {bits[selectedBit].position}
            </h5>
            <div className="text-sm space-y-1">
              <p><strong>Value:</strong> {bits[selectedBit].value}</p>
              <p><strong>Weight:</strong> 2<sup>{bits[selectedBit].position}</sup> = {bits[selectedBit].weight}</p>
              <p><strong>Contribution:</strong> {bits[selectedBit].value} × {bits[selectedBit].weight} = {bits[selectedBit].contribution}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}