import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import "./animated-converter.css";

// Debounce hook
export function useDebounce<T>(value: T, delay = 300) {
  const [state, setState] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setState(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return state;
}

// Reduced motion hook
export function usePrefersReducedMotion() {
  const [prefers, setPrefers] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefers(mq.matches);
    const handler = () => setPrefers(mq.matches);
    mq.addEventListener?.("change", handler);
    return () => mq.removeEventListener?.("change", handler);
  }, []);
  return prefers;
}

// ConverterForm component
export function ConverterForm({ onConvert }: { onConvert: (input: string, base: string) => void }) {
  const [input, setInput] = useState("");
  const [base, setBase] = useState("decimal");
  const debounced = useDebounce(input, 350);

  useEffect(() => {
    if (debounced.trim() !== "") {
      onConvert(debounced.trim(), base);
    }
  }, [debounced, base, onConvert]);

  return (
    <div className="card p-4">
      <label className="label">Enter number</label>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="e.g. 13 or 1101 or D"
        className="input"
      />

      <label className="label mt-3">Base</label>
      <select value={base} onChange={(e) => setBase(e.target.value)} className="select">
        <option value="decimal">Decimal</option>
        <option value="binary">Binary</option>
        <option value="hex">Hexadecimal</option>
      </select>

      <p className="muted mt-3">Auto-converts after you stop typing.</p>
    </div>
  );
}

// StepsAnimator component
export function StepsAnimator({ steps, play }: { steps: string[]; play: boolean }) {
  const prefersReduced = usePrefersReducedMotion();
  return (
    <div className="card p-4">
      <h3 className="card-title">Steps</h3>
      <ul className="steps-list" aria-live="polite">
        <AnimatePresence>
          {play && steps.map((s, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: prefersReduced ? 0 : 0.35, delay: i * (prefersReduced ? 0 : 0.28) }}
              className="step-item"
            >
              <code>{s}</code>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}

// Visualizer component
export function Visualizer({ bits, animate }: { bits: number[]; animate: boolean }) {
  const prefersReduced = usePrefersReducedMotion();
  const msbIndex = bits.length - 1;

  return (
    <div className="card p-4">
      <h3 className="card-title">Visualizer</h3>
      <div className="bits-row" role="list">
        {bits.map((b, i) => {
          const weight = Math.pow(2, msbIndex - i);
          return (
            <motion.button
              key={i}
              role="listitem"
              className={`bit ${b ? "bit-on" : "bit-off"}`}
              aria-label={`bit ${i}: ${b}, weight ${weight}`}
              whileTap={{ scale: 0.95 }}
              initial={{ rotateX: -20, opacity: 0 }}
              animate={{ rotateX: 0, opacity: 1 }}
              transition={{ duration: prefersReduced ? 0 : 0.35, delay: animate ? i * 0.06 : 0 }}
              onClick={() => alert(`Weight: ${weight} = 2^${msbIndex - i}`)}
            >
              <div className="bit-val">{b}</div>
              <div className="bit-weight">{weight}</div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// Helper: parse API or local conversion to structured result
function safeParseInt(input: string, base: string) {
  if (base === "binary") return parseInt(input, 2);
  if (base === "hex") return parseInt(input, 16);
  return parseInt(input, 10);
}

function toStepsDecimalToBinary(n: number): string[] {
  if (n === 0) return ["0"];
  const steps: string[] = [];
  let value = n;
  const remainders: number[] = [];
  while (value > 0) {
    const q = Math.floor(value / 2);
    const r = value % 2;
    steps.push(`${value} ÷ 2 = ${q} remainder ${r}`);
    remainders.push(r);
    value = q;
  }
  steps.push(`Read remainders bottom-up: ${remainders.reverse().join("")}`);
  return steps;
}

// Main exported component: AnimatedConverter
export default function AnimatedConverter() {
  const [loading, setLoading] = useState(false);
  const [play, setPlay] = useState(false);
  const [result, setResult] = useState<{ binary: string; decimal: string; hex: string } | null>(null);
  const [steps, setSteps] = useState<string[]>([]);
  const [animateBits, setAnimateBits] = useState(false);

  const handleConvert = async (input: string, base: string) => {
    // minimal validation
    if (!input) return;
    setLoading(true);
    setPlay(false);
    setAnimateBits(false);

    try {
      // try calling your backend - fallback to local if error
      const res = await axios.post("http://localhost:5000/api/convert", { input, base }, { timeout: 2000 });
      const data = res.data;
      setResult({ binary: data.binary, decimal: data.decimal, hex: data.hex });
      setSteps(data.steps || []);

      // trigger animations
      setTimeout(() => {
        setPlay(true);
        setAnimateBits(true);
      }, 200);
    } catch (err) {
      // local fallback
      const dec = safeParseInt(input, base);
      if (Number.isNaN(dec)) {
        setResult(null);
        setSteps(["Invalid input for the selected base."]);
      } else {
        const binary = dec.toString(2);
        const hex = dec.toString(16).toUpperCase();
        setResult({ binary, decimal: String(dec), hex });
        setSteps(toStepsDecimalToBinary(dec));
        setTimeout(() => {
          setPlay(true);
          setAnimateBits(true);
        }, 200);
      }
    } finally {
      setLoading(false);
    }
  };

  const bits = useMemo(() => {
    if (!result) return [];
    // ensure MSB -> LSB ordering visually left->right
    return result.binary.split("").map((c) => Number(c));
  }, [result]);

  return (
    <div className="page-wrap">
      <header className="header">
        <h1>Number Systems — Animated Tutor</h1>
      </header>

      <main className="grid-main">
        <aside className="left-col">
          <ConverterForm onConvert={handleConvert} />
          <div className="card p-4 mt-4">
            <h4>Results</h4>
            {loading && <div className="muted">Computing...</div>}
            {!loading && result && (
              <div className="results">
                <div className="res-card"><strong>Binary</strong><div className="res-val">{result.binary}</div></div>
                <div className="res-card"><strong>Decimal</strong><div className="res-val">{result.decimal}</div></div>
                <div className="res-card"><strong>Hex</strong><div className="res-val">{result.hex}</div></div>
              </div>
            )}
          </div>
        </aside>

        <section className="right-col">
          <Visualizer bits={bits} animate={animateBits} />
          <div className="mt-4">
            <StepsAnimator steps={steps} play={play} />
          </div>

          <div className="card p-4 mt-4">
            <h3 className="card-title">Comparison 1–20</h3>
            <div className="table-scroll">
              <table className="comp-table">
                <thead>
                  <tr><th>#</th><th>Decimal</th><th>Binary</th><th>Hex</th></tr>
                </thead>
                <tbody>
                  {Array.from({ length: 20 }).map((_, i) => {
                    const d = i + 1;
                    return (
                      <tr key={d}><td>{d}</td><td>{d}</td><td>{d.toString(2)}</td><td>{d.toString(16).toUpperCase()}</td></tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </section>
      </main>
    </div>
  );
}
