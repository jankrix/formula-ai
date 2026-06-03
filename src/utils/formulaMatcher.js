const SUM_KW    = ["sum of", "total of", "total ", "add up"];
const COUNT_KW  = ["count ", "how many", "number of rows", "number of records"];
const AVG_KW    = ["average of", "average ", "avg ", "mean of", "mean "];
const MAX_KW    = ["highest", "maximum", "max ", "largest", "biggest"];
const MIN_KW    = ["lowest", "minimum", "min ", "smallest", "least"];
const COND_KW   = [" where ", " if ", " when ", " for "];

const has = (q, kws) => kws.some((k) => q.includes(k));

function colLetter(i) {
  let label = "";
  i += 1;
  while (i > 0) {
    label = String.fromCharCode(((i - 1) % 26) + 65) + label;
    i = Math.floor((i - 1) / 26);
  }
  return label;
}

function findCols(q, headers) {
  return headers
    .map((h, i) => ({ name: h, letter: colLetter(i), index: i, pos: q.toLowerCase().indexOf(h.toLowerCase()) }))
    .filter((c) => c.name.trim() && c.pos >= 0)
    .sort((a, b) => a.pos - b.pos);
}

function extractValue(q) {
  const m =
    q.match(/(?:\bis\b|\bequals?\b|=)\s*["']?([a-zA-Z0-9][a-zA-Z0-9\s]*?)["']?(?:\s|$)/i) ||
    q.match(/["']([^"']+)["']/);
  return m ? m[1].trim() : null;
}

function getColValues(grid, colIndex, headerRows) {
  return grid
    .slice(headerRows)
    .map((row) => (row[colIndex] ?? "").trim())
    .filter(Boolean);
}

function validateValue(val, grid, colIndex, headerRows) {
  if (!val) return null;
  const values = getColValues(grid, colIndex, headerRows);
  const exists = values.some((v) => v.toLowerCase() === val.toLowerCase());
  if (!exists && values.length > 0) {
    const unique = [...new Set(values)].slice(0, 5).join(", ");
    return `"${val}" was not found in that column. Available values: ${unique}${values.length > 5 ? "…" : ""}`;
  }
  return null;
}

function condKeyPos(q) {
  const positions = COND_KW.map((k) => q.indexOf(k)).filter((p) => p >= 0);
  return positions.length ? Math.min(...positions) : Infinity;
}

export function matchFormula(query, grid, headerRows) {
  if (!query.trim() || !grid.length) return null;

  const headers = (grid[0] || []).map((h) => h.trim());
  if (!headers.some(Boolean)) return null;

  const q = " " + query.toLowerCase() + " ";
  const qOriginal = " " + query + " ";
  const cols = findCols(q, headers);
  const hasCond = has(q, COND_KW);
  const ckp = condKeyPos(q);

  const fc = (letter) => `${letter}:${letter}`;

  // ── SUM (no condition) ──────────────────────────────
  if (has(q, SUM_KW) && !hasCond && cols.length >= 1) {
    const col = cols[0];
    return {
      formula: `=SUM(${fc(col.letter)})`,
      explanation: `Sums all values in the ${col.name} column.`,
    };
  }

  // ── SUMIF ───────────────────────────────────────────
  if (has(q, SUM_KW) && hasCond && cols.length >= 2) {
    const sumCol = cols.find((c) => c.pos < ckp) || cols[0];
    const condCol = cols.find((c) => c !== sumCol) || cols[1];
    const val = extractValue(qOriginal);
    const criteria = val ? `"${val}"` : `""`;
    const warning = validateValue(val, grid, condCol.index, headerRows);
    return {
      formula: `=SUMIF(${fc(condCol.letter)},${criteria},${fc(sumCol.letter)})`,
      explanation: `Sums ${sumCol.name} where ${condCol.name} equals ${val || "the specified value"}.`,
      warning,
    };
  }

  // ── COUNT (no condition) ────────────────────────────
  if (has(q, COUNT_KW) && !hasCond && cols.length >= 1) {
    const col = cols[0];
    return {
      formula: `=COUNTA(${fc(col.letter)})`,
      explanation: `Counts all non-empty cells in the ${col.name} column.`,
    };
  }

  // ── COUNTIF ─────────────────────────────────────────
  if (has(q, COUNT_KW) && hasCond && cols.length >= 1) {
    const condCol = cols.find((c) => c.pos > ckp) || cols[0];
    const val = extractValue(qOriginal);
    const criteria = val ? `"${val}"` : `""`;
    const warning = validateValue(val, grid, condCol.index, headerRows);
    return {
      formula: `=COUNTIF(${fc(condCol.letter)},${criteria})`,
      explanation: `Counts rows where ${condCol.name} equals ${val || "the specified value"}.`,
      warning,
    };
  }

  // ── AVERAGE (no condition) ──────────────────────────
  if (has(q, AVG_KW) && !hasCond && cols.length >= 1) {
    const col = cols[0];
    return {
      formula: `=AVERAGE(${fc(col.letter)})`,
      explanation: `Calculates the average of all values in the ${col.name} column.`,
    };
  }

  // ── AVERAGEIF ───────────────────────────────────────
  if (has(q, AVG_KW) && hasCond && cols.length >= 2) {
    const avgCol = cols.find((c) => c.pos < ckp) || cols[0];
    const condCol = cols.find((c) => c !== avgCol) || cols[1];
    const val = extractValue(qOriginal);
    const criteria = val ? `"${val}"` : `""`;
    const warning = validateValue(val, grid, condCol.index, headerRows);
    return {
      formula: `=AVERAGEIF(${fc(condCol.letter)},${criteria},${fc(avgCol.letter)})`,
      explanation: `Averages ${avgCol.name} where ${condCol.name} equals ${val || "the specified value"}.`,
      warning,
    };
  }

  // ── MAX ─────────────────────────────────────────────
  if (has(q, MAX_KW) && cols.length >= 1) {
    const col = cols[0];
    return {
      formula: `=MAX(${fc(col.letter)})`,
      explanation: `Returns the highest value in the ${col.name} column.`,
    };
  }

  // ── MIN ─────────────────────────────────────────────
  if (has(q, MIN_KW) && cols.length >= 1) {
    const col = cols[0];
    return {
      formula: `=MIN(${fc(col.letter)})`,
      explanation: `Returns the lowest value in the ${col.name} column.`,
    };
  }

  return null; // no confident match → fall through to AI
}
