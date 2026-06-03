import { useState, useCallback, useRef } from "react";

const INIT_ROWS = 6;
const INIT_COLS = 5;

function makeGrid(rows, cols) {
  return Array.from({ length: rows }, () => Array(cols).fill(""));
}

function colLabel(i) {
  let label = "";
  i += 1;
  while (i > 0) {
    label = String.fromCharCode(((i - 1) % 26) + 65) + label;
    i = Math.floor((i - 1) / 26);
  }
  return label;
}

function gridToTsv(grid) {
  return grid.map((r) => r.join("\t")).join("\n");
}

export default function TableInput({ onChange }) {
  const [grid, setGrid] = useState(makeGrid(INIT_ROWS, INIT_COLS));
  const [headerRows, setHeaderRows] = useState(1);
  const [pasteError, setPasteError] = useState("");
  const tableRef = useRef(null);

  const hasData = grid.some((r) => r.some((c) => c.trim() !== ""));

  const applyGrid = (newGrid) => {
    setGrid(newGrid);
    onChange(gridToTsv(newGrid));
  };

  const handleCellChange = (ri, ci, value) => {
    const newGrid = grid.map((r) => [...r]);
    newGrid[ri][ci] = value;
    applyGrid(newGrid);
  };

  const handlePaste = useCallback((e, startRow = 0, startCol = 0) => {
    e.preventDefault();
    const raw = e.clipboardData.getData("text/plain");

    if (!raw.includes("\t")) {
      setPasteError("Looks like plain text — please copy directly from Excel or Google Sheets.");
      return;
    }

    setPasteError("");
    const rows = raw.trim().split("\n").map((r) => r.split("\t"));
    const neededRows = startRow + rows.length;
    const neededCols = startCol + Math.max(...rows.map((r) => r.length));
    const newRows = Math.max(grid.length, neededRows);
    const newCols = Math.max(grid[0].length, neededCols);

    const newGrid = Array.from({ length: newRows }, (_, ri) =>
      Array.from({ length: newCols }, (_, ci) => grid[ri]?.[ci] ?? "")
    );

    rows.forEach((row, ri) => {
      row.forEach((val, ci) => {
        newGrid[startRow + ri][startCol + ci] = val;
      });
    });

    applyGrid(newGrid);
  }, [grid]);

  const handleKeyDown = (e, ri, ci) => {
    const rows = grid.length;
    const cols = grid[0].length;

    if (e.key === "Tab") {
      e.preventDefault();
      const nextCi = e.shiftKey ? ci - 1 : ci + 1;
      if (nextCi >= 0 && nextCi < cols) {
        tableRef.current?.querySelector(`[data-cell="${ri}-${nextCi}"]`)?.focus();
      } else if (!e.shiftKey && ri + 1 < rows) {
        tableRef.current?.querySelector(`[data-cell="${ri + 1}-0"]`)?.focus();
      }
    }

    if (e.key === "Enter") {
      e.preventDefault();
      if (ri + 1 < rows) {
        tableRef.current?.querySelector(`[data-cell="${ri + 1}-${ci}"]`)?.focus();
      }
    }

    if (e.key === "ArrowDown" && ri + 1 < rows) tableRef.current?.querySelector(`[data-cell="${ri + 1}-${ci}"]`)?.focus();
    if (e.key === "ArrowUp" && ri > 0) tableRef.current?.querySelector(`[data-cell="${ri - 1}-${ci}"]`)?.focus();
    if (e.key === "ArrowRight" && e.target.selectionStart === e.target.value.length && ci + 1 < cols) tableRef.current?.querySelector(`[data-cell="${ri}-${ci + 1}"]`)?.focus();
    if (e.key === "ArrowLeft" && e.target.selectionStart === 0 && ci > 0) tableRef.current?.querySelector(`[data-cell="${ri}-${ci - 1}"]`)?.focus();
  };

  const handleClear = () => {
    setGrid(makeGrid(INIT_ROWS, INIT_COLS));
    setHeaderRows(1);
    setPasteError("");
    onChange("");
    tableRef.current?.querySelector("[data-cell='0-0']")?.focus();
  };

  const cols = grid[0].length;

  return (
    <div className="section">
      <div className="table-label-row">
        <div>
          <label>Your table</label>
          <p className="hint">Type directly or paste from Excel / Google Sheets.</p>
        </div>
        <div className="table-controls">
          {hasData && (
            <div className="header-row-toggle">
              <span className="toggle-label">Header rows:</span>
              {[1, 2, 3, 4].map((n) => (
                <button
                  key={n}
                  className={headerRows === n ? "active" : ""}
                  onClick={() => setHeaderRows(n)}
                >{n}</button>
              ))}
            </div>
          )}
          {hasData && (
            <button className="clear-btn" onClick={handleClear}>Clear</button>
          )}
        </div>
      </div>

      {pasteError && <p className="error" style={{ marginTop: 4 }}>{pasteError}</p>}

      <div className="table-preview-wrapper" ref={tableRef}>
        <table className="table-preview grid-editable">
          <thead>
            <tr>
              <th className="row-num"></th>
              {Array.from({ length: cols }, (_, ci) => (
                <th key={ci} className="col-label">{colLabel(ci)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {grid.map((row, ri) => {
              const isHeader = ri < headerRows && hasData;
              return (
                <tr key={ri} className={isHeader ? "grid-header-row" : ""}>
                  <td className="row-num">{ri + 1}</td>
                  {Array.from({ length: cols }, (_, ci) => (
                    <td key={ci} className={isHeader ? "grid-header-cell" : "grid-body-cell"}>
                      <input
                        data-cell={`${ri}-${ci}`}
                        value={row[ci] ?? ""}
                        onChange={(e) => handleCellChange(ri, ci, e.target.value)}
                        onPaste={(e) => handlePaste(e, ri, ci)}
                        onKeyDown={(e) => handleKeyDown(e, ri, ci)}
                        className="cell-input"
                        spellCheck={false}
                      />
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
