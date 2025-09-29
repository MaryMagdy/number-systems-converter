import { useState } from "react";
import axios from "axios";

interface ConversionResult {
  binary: string;
  decimal: string;
  hex: string;
  steps: string[];
}

function App() {
  const [input, setInput] = useState("");
  const [base, setBase] = useState("decimal");
  const [result, setResult] = useState<ConversionResult | null>(null);

  const handleConvert = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/convert", {
        input,
        base,
      });
      setResult(res.data);
    } catch (err) {
      alert("Conversion failed. Check input.");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Number Systems Converter</h1>

      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter number"
        className="border p-2 mr-2"
      />

      <select
        value={base}
        onChange={(e) => setBase(e.target.value)}
        className="border p-2 mr-2"
      >
        <option value="decimal">Decimal</option>
        <option value="binary">Binary</option>
        <option value="hex">Hexadecimal</option>
      </select>

      <button onClick={handleConvert} className="bg-blue-500 text-white p-2">
        Convert
      </button>

      {result && (
        <div className="mt-4 border p-4">
          <p><strong>Binary:</strong> {result.binary}</p>
          <p><strong>Decimal:</strong> {result.decimal}</p>
          <p><strong>Hexadecimal:</strong> {result.hex}</p>
          <div>
            <strong>Steps:</strong>
            <ul>
              {result.steps.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
