import { motion } from 'framer-motion';

interface Step {
  value: string;
  explanation: string;
  isCurrent?: boolean;
}

interface StepsProps {
  steps: Step[];
  play: boolean;
  currentStepIndex: number;
}

export default function Steps({ steps, play, currentStepIndex }: StepsProps) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        when: "beforeChildren"
      }
    }
  };
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        type: "spring" as const,  // Add 'as const' to make it a literal type
        stiffness: 100,
        damping: 10
      }
    })
  } as const;  // Add 'as const' to make the entire object readonly
  return (
    <motion.div 
      className="space-y-3"
      variants={container}
      initial="hidden"
      animate={play ? "show" : "hidden"}
    >
      {steps.slice(0, currentStepIndex + 1).map((step, index) => (
        <motion.div
          key={index}
          custom={index}
          variants={item}
          className={`p-4 rounded-lg transition-colors ${
            index === currentStepIndex 
              ? 'bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500' 
              : 'bg-gray-50 dark:bg-gray-700/50'
          }`}
        >
          <div className="font-mono text-sm mb-1">{step.value}</div>
          {step.explanation && (
            <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">
              {step.explanation}
            </div>
          )}
        </motion.div>
      ))}
    </motion.div>
  );
}
