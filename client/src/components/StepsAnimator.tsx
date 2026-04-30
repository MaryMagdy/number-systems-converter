import { motion, AnimatePresence } from "framer-motion";

interface ConversionStep {
  value: string;
  explanation: string;
}

interface StepsProps {
  steps: ConversionStep[];
  play: boolean;
  currentStepIndex: number;
}

export default function Steps({ steps, play, currentStepIndex }: StepsProps) {
  return (
    <div className="space-y-4">
      <AnimatePresence>
        {steps.slice(0, currentStepIndex + 1).map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700"
          >
            <div className="font-mono text-lg text-blue-700 dark:text-blue-300">
              {step.value}
            </div>
            <div className="text-sm text-gray-700 dark:text-gray-300 mt-1">
              {step.explanation}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
