// server/index.js
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Conversion logic
function convertNumber(input, base) {
  let decimalValue;

  if (base === "binary") {
    decimalValue = parseInt(input, 2);
  } else if (base === "hex") {
    decimalValue = parseInt(input, 16);
  } else {
    decimalValue = parseInt(input, 10);
  }

  return {
    binary: decimalValue.toString(2),
    decimal: decimalValue.toString(10),
    hex: decimalValue.toString(16).toUpperCase(),
    steps: [`Converted ${input} from ${base} to decimal: ${decimalValue}`]
  };
}

// API endpoint
app.post("/api/convert", (req, res) => {
  const { input, base } = req.body;
  if (!input || !base) return res.status(400).json({ error: "Input and base are required" });

  let decimal, binary, hex, steps = [];

  try {
    if (base === "decimal") {
      decimal = parseInt(input, 10);
      binary = decimal.toString(2);
      hex = decimal.toString(16).toUpperCase();
      steps = [
        { value: input, explanation: "Start with the decimal number." },
        { value: binary, explanation: "Convert decimal to binary using successive division by 2." },
        { value: hex, explanation: "Convert decimal to hexadecimal using division by 16." },
      ];
    } else if (base === "binary") {
      decimal = parseInt(input, 2);
      binary = input;
      hex = decimal.toString(16).toUpperCase();
      steps = [
        { value: input, explanation: "Start with the binary number." },
        { value: decimal.toString(), explanation: "Convert binary to decimal by summing powers of 2." },
        { value: hex, explanation: "Convert decimal to hexadecimal using division by 16." },
      ];
    } else if (base === "hex") {
      decimal = parseInt(input, 16);
      hex = input.toUpperCase();
      binary = decimal.toString(2);
      steps = [
        { value: input, explanation: "Start with the hexadecimal number." },
        { value: decimal.toString(), explanation: "Convert hex to decimal by multiplying powers of 16." },
        { value: binary, explanation: "Convert decimal to binary using division by 2." },
      ];
    }

    res.json({ binary, decimal, hex, steps });
  } catch (err) {
    res.status(400).json({ error: "Invalid number format" });
  }
});


const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
