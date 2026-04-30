import { motion } from "framer-motion";

interface BinaryVisualizerProps {
  binaryValue: string;
}

export default function BinaryVisualizer({ binaryValue }: BinaryVisualizerProps) {
  if (!binaryValue) return null;

  // Convert binary string to array of bits
  const bits = binaryValue.split("");

  return (
    <div className="flex flex-wrap justify-center gap-3 mt-8">
      {bits.map((bit, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{
            opacity: 1,
            scale: 1,
            backgroundColor: bit === "1" ? "#3b82f6" : "#e5e7eb",
          }}
          transition={{
            duration: 0.3,
            delay: index * 0.1, // Animate one by one
          }}
          className={`w-12 h-12 flex items-center justify-center rounded-full shadow-md font-bold text-lg ${
            bit === "1"
              ? "text-white border border-blue-500"
              : "text-gray-700 border border-gray-300"
          }`}
        >
          {bit}
        </motion.div>
      ))}
    </div>
  );
}
