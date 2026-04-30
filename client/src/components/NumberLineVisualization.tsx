import { motion } from "framer-motion";
import { useState, useCallback } from "react";

interface NumberLineVisualizationProps {
  min?: number;
  max?: number;
  currentValue?: number;
  onValueChange?: (value: number) => void;
}

export default function NumberLineVisualization({
  min = 0,
  max = 255,
  currentValue = 0,
  onValueChange
}: NumberLineVisualizationProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [hoveredValue, setHoveredValue] = useState<number | null>(null);

  // Major tick marks (every 16 for better hex visualization)
  const majorTicks = [];
  for (let i = min; i <= max; i += 16) {
    majorTicks.push(i);
  }

  // Minor tick marks (every 4)
  const minorTicks = [];
  for (let i = min; i <= max; i += 4) {
    if (i % 16 !== 0) { // Don't duplicate major ticks
      minorTicks.push(i);
    }
  }

  const getPositionForValue = (value: number) => {
    return ((value - min) / (max - min)) * 100;
  };

  const getValueForPosition = (position: number) => {
    return Math.round(min + (position / 100) * (max - min));
  };

  const handleSliderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    onValueChange?.(value);
  }, [onValueChange]);

  const handleLineClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const position = ((e.clientX - rect.left) / rect.width) * 100;
    const value = getValueForPosition(position);
    
    if (value >= min && value <= max) {
      onValueChange?.(value);
    }
  }, [min, max, onValueChange]);

  const formatBinary = (value: number) => {
    return value.toString(2).padStart(8, '0');
  };

  const formatHex = (value: number) => {
    return value.toString(16).toUpperCase().padStart(2, '0');
  };

  const displayValue = hoveredValue !== null ? hoveredValue : currentValue;

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Interactive Number Line</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Drag the slider or click on the line to explore different values across number systems.
        </p>
      </div>

      {/* Current value display */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <motion.div 
          className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
          animate={{ scale: displayValue !== currentValue ? 1.05 : 1 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Decimal</div>
          <div className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400">
            {displayValue}
          </div>
        </motion.div>

        <motion.div 
          className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg"
          animate={{ scale: displayValue !== currentValue ? 1.05 : 1 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Binary</div>
          <div className="text-2xl font-bold font-mono text-green-600 dark:text-green-400">
            {formatBinary(displayValue)}
          </div>
        </motion.div>

        <motion.div 
          className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg"
          animate={{ scale: displayValue !== currentValue ? 1.05 : 1 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Hexadecimal</div>
          <div className="text-2xl font-bold font-mono text-purple-600 dark:text-purple-400">
            0x{formatHex(displayValue)}
          </div>
        </motion.div>
      </div>

      {/* Number line */}
      <div className="relative mb-6">
        {/* Background line */}
        <div 
          className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full cursor-pointer relative"
          onClick={handleLineClick}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const position = ((e.clientX - rect.left) / rect.width) * 100;
            const value = getValueForPosition(position);
            if (value >= min && value <= max) {
              setHoveredValue(value);
            }
          }}
          onMouseLeave={() => setHoveredValue(null)}
        >
          {/* Major tick marks */}
          {majorTicks.map((tick) => (
            <div
              key={tick}
              className="absolute w-0.5 h-6 bg-gray-400 dark:bg-gray-500 -top-2"
              style={{ left: `${getPositionForValue(tick)}%` }}
            >
              <div className="absolute -bottom-8 -left-4 w-8 text-center text-xs text-gray-500">
                {tick}
              </div>
            </div>
          ))}

          {/* Minor tick marks */}
          {minorTicks.map((tick) => (
            <div
              key={tick}
              className="absolute w-0.5 h-3 bg-gray-300 dark:bg-gray-600 -top-0.5"
              style={{ left: `${getPositionForValue(tick)}%` }}
            />
          ))}

          {/* Current value indicator */}
          <motion.div
            className="absolute w-6 h-6 bg-blue-500 rounded-full -top-2 border-2 border-white shadow-lg cursor-grab active:cursor-grabbing"
            style={{ left: `${getPositionForValue(currentValue)}%` }}
            animate={{ 
              scale: isDragging ? 1.2 : 1,
              boxShadow: isDragging ? "0 0 20px rgba(59, 130, 246, 0.5)" : "0 4px 8px rgba(0, 0, 0, 0.1)"
            }}
            whileHover={{ scale: 1.1 }}
            onMouseDown={() => setIsDragging(true)}
            onMouseUp={() => setIsDragging(false)}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0}
          />

          {/* Hover indicator */}
          {hoveredValue !== null && hoveredValue !== currentValue && (
            <motion.div
              className="absolute w-4 h-4 bg-gray-400 rounded-full -top-1 border border-white opacity-60"
              style={{ left: `${getPositionForValue(hoveredValue)}%` }}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 0.6, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
            />
          )}
        </div>

        {/* Range slider (hidden but functional) */}
        <input
          type="range"
          min={min}
          max={max}
          value={currentValue}
          onChange={handleSliderChange}
          className="absolute inset-0 w-full h-6 opacity-0 cursor-pointer"
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
        />
      </div>

      {/* Range labels */}
      <div className="flex justify-between text-sm text-gray-500 mb-6">
        <span>{min}</span>
        <span className="text-center">Range: {min} - {max}</span>
        <span>{max}</span>
      </div>

      {/* Binary bit breakdown for current value */}
      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
        <h4 className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
          Binary Breakdown for {displayValue}
        </h4>
        <div className="flex justify-center space-x-1">
          {formatBinary(displayValue).split('').map((bit, index) => {
            const position = 7 - index;
            const weight = Math.pow(2, position);
            const isActive = bit === '1';
            
            return (
              <motion.div
                key={index}
                className={`
                  flex flex-col items-center p-2 rounded
                  ${isActive 
                    ? 'bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200' 
                    : 'bg-gray-200 dark:bg-gray-600 text-gray-500'
                  }
                `}
                animate={{ 
                  scale: isActive ? 1.1 : 1,
                  backgroundColor: isActive ? "#bbf7d0" : "#e5e7eb"
                }}
                transition={{ duration: 0.2 }}
              >
                <div className="text-lg font-bold">{bit}</div>
                <div className="text-xs">2<sup>{position}</sup></div>
                <div className="text-xs">{weight}</div>
              </motion.div>
            );
          })}
        </div>
        
        <div className="text-center mt-3 text-sm text-gray-600 dark:text-gray-400">
          Sum: {formatBinary(displayValue).split('').map((bit, index) => {
            const position = 7 - index;
            const weight = Math.pow(2, position);
            return bit === '1' ? weight : 0;
          }).filter(val => val > 0).join(' + ')} = {displayValue}
        </div>
      </div>

      {/* Quick navigation buttons */}
      <div className="mt-6 flex justify-center space-x-2">
        {[0, 16, 32, 64, 128, 255].filter(val => val >= min && val <= max).map((value) => (
          <button
            key={value}
            onClick={() => onValueChange?.(value)}
            className={`
              px-3 py-1 rounded text-sm transition-colors
              ${currentValue === value 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
              }
            `}
          >
            {value}
          </button>
        ))}
      </div>
    </div>
  );
}