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
  if (!input || !base) {
    return res.status(400).json({ error: "Input and base are required" });
  }
  try {
    const result = convertNumber(input, base);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: "Invalid number format" });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
