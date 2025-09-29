# Functional Requirements

## How to use
For each requirement add:
- ID: FR-001
- Title
- Description
- Inputs
- Outputs
- UI/Flow notes
- Acceptance Criteria
- Priority: Must / Should / Could

---

### FR-001 — Convert number between bases
- **ID:** FR-001
- **Title:** Convert number to binary/decimal/hex
- **Description:** User enters a number and selects its base. System returns equivalent values in the other two bases.
- **Inputs:** `input` (string), `base` ("binary"|"decimal"|"hex"), `showSteps` (boolean)
- **Outputs:** `{ decimal, binary, hex }` + optional `steps` + `visualizer` data
- **UI/Flow notes:** Input form, submit button, result cards for each base.
- **Acceptance Criteria:** Given valid input, API returns correct conversions; frontend displays them in a card.
- **Priority:** Must

### FR-002 — Step-by-step explanation
- **ID:** FR-002
- **Title:** Show conversion steps
- **Description:** Provide a human-readable list of steps used to compute conversion (division remainders or weighted sum).
- **Inputs:** same as FR-001
- **Outputs:** `steps.toBinary[]`, `steps.toDecimal[]`, `steps.toHex[]`
- **Acceptance Criteria:** Each step shows the arithmetic operation and a final explanatory line.
- **Priority:** Must

### FR-003 — Comparison table (1–20)
- **ID:** FR-003
- **Title:** Static comparison table
- **Description:** Table with rows 1 to 20 showing decimal, binary, hex.
- **UI/Flow notes:** Accessible table with copy button for rows.
- **Priority:** Must

### FR-004 — Visualizer
- **ID:** FR-004
- **Title:** Bit visualizer
- **Description:** Visual representation of binary bits (ON/OFF). For hex, group per nibble.
- **Outputs:** `visualizer.binaryBits` array of bits
- **Acceptance Criteria:** Bits correspond to conversion output; hover shows weight (2^index).
- **Priority:** Must

### FR-005 — Theme toggle
- **ID:** FR-005
- **Title:** Light/Dark Mode
- **Description:** Toggle persists in localStorage.
- **Priority:** Should
