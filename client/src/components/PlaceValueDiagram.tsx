import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface PlaceValueDiagramProps {
  numberSystem: 'binary' | 'decimal' | 'hex';
  value: string;
  interactive?: boolean;
  onValueChange?: (newValue: string) => void;
}

interface PlaceValueColumn {
  position: number;
  weight: number;
  digit: string;
  digitValue: number;
  contribution: number;
}

export default function PlaceValueDiagram({
  numberSystem,
  value,
  interactive = true,
  onValueChange
}: PlaceValueDiagramProps) {
  const [selectedColumn, setSelectedColumn] = useState<number | null>(null);
  const [highlightedColumn, setHighlightedColumn] = useState<number | null>(null);

  const getBase = () => {
    switch (numberSystem) {
      case 'binary': return 2;
      case 'decimal': return 10;
      case 'hex': return 16;
      default: return 10;
    }
  };

  const base = getBase();
  
  // Parse the value into place value columns
  const parseValue = (): PlaceValueColumn[] => {
    if (!value || value === '0') {
      return [{
        position: 0,
        weight: 1,
        digit: '0',
        digitValue: 0,
        contribution: 0
      }];
    }

    const digits = value.split('').reverse(); // Reverse to start from least significant
    
    return digits.map((digit, index) => {
      const position = index;
      const weight = Math.pow(base, position);
      const digitValue = numberSystem === 'hex' 
        ? parseInt(digit, 16)
        : parseInt(digit, base);
      const contribution = digitValue * weight;

      return {
        position,
        weight,
        digit: digit.toUpperCase(),
        digitValue,
        contribution
      };
    }).reverse(); // Reverse back to show most significant first
  };

  const columns = parseValue();
  const totalValue = columns.reduce((sum, col) => sum + col.contribution, 0);

  const getValidDigits = () => {
    switch (numberSystem) {
      case 'binary': return ['0', '1'];
      case 'decimal': return ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
      case 'hex': return ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'];
      default: return [];
    }
  };

  const handleDigitChange = (columnIndex: number, newDigit: string) => {
    if (!interactive || !onValueChange) return;
    
    const newDigits = columns.map((col, index) => 
      index === columnIndex ? newDigit : col.digit
    );
    
    // Remove leading zeros
    let newValue = newDigits.join('').replace(/^0+/, '');
    if (newValue === '') newValue = '0';
    
    onValueChange(newValue);
  };

  const getSystemName = () => {
    switch (numberSystem) {
      case 'binary': return 'Binary (Base 2)';
      case 'decimal': return 'Decimal (Base 10)';
      case 'hex': return 'Hexadecimal (Base 16)';
      default: return '';
    }
  };

  const getSystemColor = () => {
    switch (numberSystem) {
      case 'binary': return 'green';
      case 'decimal': return 'blue';
      case 'hex': return 'purple';
      default: return 'gray';
    }
  };

  const color = getSystemColor();

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">{getSystemName()} Place Values</h3>
        <p className="text-gray-600 dark:text-gray-400">
          {interactive 
            ? "Click on digits to change them and see how place values work." 
            : "Understanding how each position contributes to the total value."
          }
        </p>
      </div>

      {/* Place value table */}
      <div className="overflow-x-auto mb-6">
        <div className="inline-flex space-x-1 min-w-full justify-center">
          {columns.map((column, index) => (
            <motion.div
              key={index}
              className={`
                relative border-2 rounded-lg p-4 min-w-[100px] cursor-pointer
                ${selectedColumn === index 
                  ? `border-${color}-500 bg-${color}-50 dark:bg-${color}-900/20` 
                  : `border-gray-300 dark:border-gray-600 hover:border-${color}-300`
                }
                ${highlightedColumn === index ? 'ring-2 ring-yellow-400' : ''}
              `}
              onClick={() => setSelectedColumn(selectedColumn === index ? null : index)}
              onMouseEnter={() => setHighlightedColumn(index)}
              onMouseLeave={() => setHighlightedColumn(null)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              layout
            >
              {/* Position label */}
              <div className="text-xs text-gray-500 dark:text-gray-400 text-center mb-2">
                Position {column.position}
              </div>

              {/* Weight */}
              <div className="text-sm text-center mb-2 font-mono">
                {base}<sup>{column.position}</sup> = {column.weight}
              </div>

              {/* Digit (editable if interactive) */}
              {interactive ? (
                <select
                  value={column.digit}
                  onChange={(e) => handleDigitChange(index, e.target.value)}
                  className={`
                    w-full text-center text-2xl font-bold p-2 rounded
                    bg-transparent border-none focus:outline-none
                    text-${color}-600 dark:text-${color}-400
                  `}
                  onClick={(e) => e.stopPropagation()}
                >
                  {getValidDigits().map(digit => (
                    <option key={digit} value={digit}>{digit}</option>
                  ))}
                </select>
              ) : (
                <div className={`text-2xl font-bold text-center text-${color}-600 dark:text-${color}-400 mb-2`}>
                  {column.digit}
                </div>
              )}

              {/* Calculation */}
              <div className="text-xs text-center text-gray-600 dark:text-gray-400">
                {column.digitValue} × {column.weight}
              </div>

              {/* Contribution */}
              <motion.div 
                className={`text-lg font-bold text-center mt-2 text-${color}-700 dark:text-${color}-300`}
                animate={{ 
                  scale: highlightedColumn === index ? 1.1 : 1,
                  color: highlightedColumn === index ? '#f59e0b' : undefined
                }}
              >
                = {column.contribution}
              </motion.div>

              {/* Position indicator */}
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <div className={`
                  w-6 h-6 rounded-full bg-${color}-500 text-white text-xs 
                  flex items-center justify-center font-bold
                `}>
                  {columns.length - 1 - index}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Total calculation */}
      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
        <h4 className="text-lg font-semibold mb-3 text-center">Total Calculation</h4>
        
        <div className="text-center mb-4">
          <div className="flex items-center justify-center space-x-2 flex-wrap">
            {columns.map((column, index) => (
              <span key={index} className="inline-flex items-center">
                <motion.span
                  className={`
                    px-2 py-1 rounded font-mono text-sm
                    ${highlightedColumn === index 
                      ? 'bg-yellow-200 dark:bg-yellow-800' 
                      : `bg-${color}-100 dark:bg-${color}-900/30`
                    }
                  `}
                  animate={{ 
                    scale: highlightedColumn === index ? 1.1 : 1 
                  }}
                >
                  {column.contribution}
                </motion.span>
                {index < columns.length - 1 && (
                  <span className="mx-2 text-gray-500">+</span>
                )}
              </span>
            ))}
          </div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold">
            <span className={`text-${color}-600 dark:text-${color}-400`}>{value}</span>
            <span className="mx-4 text-gray-500">=</span>
            <span className="text-blue-600 dark:text-blue-400">{totalValue}</span>
            <span className="text-sm text-gray-500 ml-2">(decimal)</span>
          </div>
        </div>
      </div>

      {/* Selected column details */}
      <AnimatePresence>
        {selectedColumn !== null && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`mt-4 p-4 bg-${color}-50 dark:bg-${color}-900/20 border border-${color}-200 dark:border-${color}-700 rounded-lg`}
          >
            <h5 className={`font-semibold text-${color}-800 dark:text-${color}-200 mb-2`}>
              Position {columns[selectedColumn].position} Details
            </h5>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Digit:</strong> {columns[selectedColumn].digit}
              </div>
              <div>
                <strong>Position:</strong> {columns[selectedColumn].position}
              </div>
              <div>
                <strong>Weight:</strong> {base}<sup>{columns[selectedColumn].position}</sup> = {columns[selectedColumn].weight}
              </div>
              <div>
                <strong>Contribution:</strong> {columns[selectedColumn].digitValue} × {columns[selectedColumn].weight} = {columns[selectedColumn].contribution}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick examples */}
      <div className="mt-6 text-center">
        <h5 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
          Try these examples:
        </h5>
        <div className="flex justify-center space-x-2 flex-wrap">
          {(() => {
            let examples: string[] = [];
            switch (numberSystem) {
              case 'binary':
                examples = ['1010', '1111', '10101', '11001'];
                break;
              case 'decimal':
                examples = ['123', '456', '789', '1024'];
                break;
              case 'hex':
                examples = ['A1', 'FF', '1A3', 'C0DE'];
                break;
            }
            return examples;
          })().map((example) => (
            <button
              key={example}
              onClick={() => onValueChange?.(example)}
              className={`
                px-3 py-1 rounded text-sm transition-colors
                ${value === example 
                  ? `bg-${color}-500 text-white` 
                  : `bg-gray-200 dark:bg-gray-700 hover:bg-${color}-200 dark:hover:bg-${color}-800`
                }
              `}
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}