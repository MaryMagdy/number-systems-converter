import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";

interface ComparisonMatrixProps {
  startRange?: number;
  endRange?: number;
  highlightValue?: number;
  onValueSelect?: (value: number) => void;
  showPatterns?: boolean;
}

interface NumberEntry {
  decimal: number;
  binary: string;
  hex: string;
  isPowerOfTwo: boolean;
  isEven: boolean;
  hexPattern?: string;
}

export default function ComparisonMatrix({
  startRange = 0,
  endRange = 31,
  highlightValue,
  onValueSelect,
  showPatterns = true
}: ComparisonMatrixProps) {
  const [selectedValue, setSelectedValue] = useState<number | null>(null);
  const [showBinaryPatterns, setShowBinaryPatterns] = useState(false);
  const [showHexPatterns, setShowHexPatterns] = useState(false);
  
  // Generate number entries
  const numbers = useMemo((): NumberEntry[] => {
    const result: NumberEntry[] = [];
    
    for (let i = startRange; i <= endRange; i++) {
      const binary = i.toString(2).padStart(8, '0');
      const hex = i.toString(16).toUpperCase().padStart(2, '0');
      const isPowerOfTwo = i > 0 && (i & (i - 1)) === 0;
      const isEven = i % 2 === 0;
      
      // Detect hex patterns
      let hexPattern = '';
      if (i % 16 === 0 && i > 0) hexPattern = 'multiple-of-16';
      else if (hex[0] === hex[1]) hexPattern = 'repeating-digits';
      else if (hex.includes('A') || hex.includes('B') || hex.includes('C') || hex.includes('D') || hex.includes('E') || hex.includes('F')) {
        hexPattern = 'contains-letters';
      }
      
      result.push({
        decimal: i,
        binary,
        hex,
        isPowerOfTwo,
        isEven,
        hexPattern
      });
    }
    
    return result;
  }, [startRange, endRange]);

  const handleValueClick = (value: number) => {
    setSelectedValue(selectedValue === value ? null : value);
    onValueSelect?.(value);
  };

  const getRowColorClass = (entry: NumberEntry) => {
    if (highlightValue === entry.decimal) {
      return 'bg-blue-100 dark:bg-blue-900/30 border-blue-500';
    }
    if (selectedValue === entry.decimal) {
      return 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-500';
    }
    if (showPatterns) {
      if (entry.isPowerOfTwo) {
        return 'bg-green-50 dark:bg-green-900/20';
      }
      if (!entry.isEven) {
        return 'bg-red-50 dark:bg-red-900/20';
      }
    }
    return 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700';
  };

  const getBinaryCellClass = (bit: string, index: number) => {
    let baseClass = 'px-1 text-center font-mono text-sm ';
    
    if (showBinaryPatterns) {
      if (bit === '1') {
        baseClass += 'bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 ';
      } else {
        baseClass += 'bg-gray-200 dark:bg-gray-600 text-gray-500 ';
      }
    } else {
      baseClass += 'text-gray-700 dark:text-gray-300 ';
    }
    
    // Highlight significant bits
    const position = 7 - index;
    if (position === 0 && bit === '1') { // Least significant bit
      baseClass += 'border-b-2 border-red-500 ';
    }
    
    return baseClass;
  };

  const getHexCellClass = (entry: NumberEntry) => {
    let baseClass = 'text-center font-mono ';
    
    if (showHexPatterns && entry.hexPattern) {
      switch (entry.hexPattern) {
        case 'multiple-of-16':
          baseClass += 'bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200 ';
          break;
        case 'repeating-digits':
          baseClass += 'bg-orange-200 dark:bg-orange-800 text-orange-800 dark:text-orange-200 ';
          break;
        case 'contains-letters':
          baseClass += 'bg-indigo-200 dark:bg-indigo-800 text-indigo-800 dark:text-indigo-200 ';
          break;
        default:
          baseClass += 'text-gray-700 dark:text-gray-300 ';
      }
    } else {
      baseClass += 'text-gray-700 dark:text-gray-300 ';
    }
    
    return baseClass;
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold mb-2">Number Systems Comparison Matrix</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Compare numbers across different bases and discover patterns.
          </p>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setShowBinaryPatterns(!showBinaryPatterns)}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              showBinaryPatterns 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Binary Colors
          </button>
          <button
            onClick={() => setShowHexPatterns(!showHexPatterns)}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              showHexPatterns 
                ? 'bg-purple-500 text-white' 
                : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Hex Patterns
          </button>
        </div>
      </div>

      {/* Legend */}
      {showPatterns && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h4 className="text-sm font-semibold mb-2">Pattern Legend</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-200 rounded"></div>
              <span>Powers of 2</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-100 rounded"></div>
              <span>Odd Numbers</span>
            </div>
            {showHexPatterns && (
              <>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-purple-200 rounded"></div>
                  <span>Multiples of 16</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-indigo-200 rounded"></div>
                  <span>Contains A-F</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Comparison table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-gray-200 dark:border-gray-600">
              <th className="text-left p-2 font-semibold">Decimal</th>
              <th className="text-center p-2 font-semibold">Binary (8-bit)</th>
              <th className="text-center p-2 font-semibold">Hexadecimal</th>
              <th className="text-center p-2 font-semibold">Properties</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {numbers.map((entry, index) => (
                <motion.tr
                  key={entry.decimal}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: index * 0.02 }}
                  className={`
                    border-b border-gray-200 dark:border-gray-600 cursor-pointer transition-all
                    ${getRowColorClass(entry)}
                  `}
                  onClick={() => handleValueClick(entry.decimal)}
                  whileHover={{ scale: 1.01 }}
                >
                  {/* Decimal */}
                  <td className="p-2 font-mono text-center">
                    <motion.div
                      animate={{ 
                        scale: selectedValue === entry.decimal ? 1.1 : 1,
                        color: entry.isPowerOfTwo ? '#059669' : undefined
                      }}
                      className="font-bold"
                    >
                      {entry.decimal}
                    </motion.div>
                  </td>
                  
                  {/* Binary */}
                  <td className="p-2">
                    <div className="flex justify-center space-x-1">
                      {entry.binary.split('').map((bit, bitIndex) => (
                        <span
                          key={bitIndex}
                          className={getBinaryCellClass(bit, bitIndex)}
                        >
                          {bit}
                        </span>
                      ))}
                    </div>
                  </td>
                  
                  {/* Hexadecimal */}
                  <td className="p-2">
                    <div className={getHexCellClass(entry)}>
                      0x{entry.hex}
                    </div>
                  </td>
                  
                  {/* Properties */}
                  <td className="p-2 text-center">
                    <div className="flex justify-center space-x-1">
                      {entry.isPowerOfTwo && (
                        <span className="px-2 py-1 bg-green-500 text-white text-xs rounded">
                          2^n
                        </span>
                      )}
                      {!entry.isEven && (
                        <span className="px-2 py-1 bg-red-500 text-white text-xs rounded">
                          Odd
                        </span>
                      )}
                      {entry.decimal % 4 === 0 && entry.decimal > 0 && (
                        <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded">
                          4×
                        </span>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Selected value details */}
      <AnimatePresence>
        {selectedValue !== null && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg"
          >
            <h5 className="font-semibold text-blue-800 dark:text-blue-200 mb-3">
              Analysis for {selectedValue}
            </h5>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h6 className="font-medium mb-2">Binary Breakdown</h6>
                <div className="text-sm space-y-1">
                  {numbers.find(n => n.decimal === selectedValue)?.binary.split('').map((bit, index) => {
                    const position = 7 - index;
                    const weight = Math.pow(2, position);
                    const contribution = parseInt(bit) * weight;
                    
                    return bit === '1' ? (
                      <div key={index} className="font-mono">
                        2^{position} = {weight} → {contribution}
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
              
              <div>
                <h6 className="font-medium mb-2">Mathematical Properties</h6>
                <div className="text-sm space-y-1">
                  <div>Even: {selectedValue % 2 === 0 ? 'Yes' : 'No'}</div>
                  <div>Power of 2: {selectedValue > 0 && (selectedValue & (selectedValue - 1)) === 0 ? 'Yes' : 'No'}</div>
                  <div>Divisible by 4: {selectedValue % 4 === 0 ? 'Yes' : 'No'}</div>
                  <div>Divisible by 8: {selectedValue % 8 === 0 ? 'Yes' : 'No'}</div>
                </div>
              </div>
              
              <div>
                <h6 className="font-medium mb-2">Base Conversions</h6>
                <div className="text-sm space-y-1 font-mono">
                  <div>Base 2: {selectedValue.toString(2)}</div>
                  <div>Base 8: {selectedValue.toString(8)}</div>
                  <div>Base 10: {selectedValue}</div>
                  <div>Base 16: {selectedValue.toString(16).toUpperCase()}</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Range selector */}
      <div className="mt-6 text-center">
        <h5 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
          Quick Ranges:
        </h5>
        <div className="flex justify-center space-x-2 flex-wrap">
          {[
            { label: '0-15', start: 0, end: 15 },
            { label: '16-31', start: 16, end: 31 },
            { label: '32-63', start: 32, end: 63 },
            { label: '64-127', start: 64, end: 127 },
            { label: '128-255', start: 128, end: 255 }
          ].map(({ label, start, end }) => (
            <button
              key={label}
              onClick={() => {
                // This would need to be implemented via props
                console.log(`Switch to range ${start}-${end}`);
              }}
              className={`
                px-3 py-1 rounded text-sm transition-colors
                ${startRange === start && endRange === end
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
                }
              `}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}