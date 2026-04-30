import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function AnimatedGrid() {
  const [count, setCount] = useState(0);

  return (
    <div className="p-6 grid gap-4 grid-cols-1 md:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <Card className="rounded-2xl shadow-md hover:shadow-lg transition">
            <CardContent className="p-6 text-center">
              <h2 className="text-xl font-semibold mb-2">Card {i + 1}</h2>
              <p className="text-gray-600 mb-4">Animated content block</p>
              <Button onClick={() => setCount(count + 1)}>Click {count}</Button>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
