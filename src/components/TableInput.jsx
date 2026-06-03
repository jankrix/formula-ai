import { useCallback, useRef } from "react";

function colLabel(i) {
  let label = "";
  i += 1;
  while (i > 0) {
    label = String.fromCharCode(((i - 1) % 26) + 65) + label;
    i = Math.floor((i - 1) / 26);
  }
  return label;
}

export default function TableInput({ grid, onGridChange, headerRows, onHeaderRowsChange }) {
  const tableRef = useRef(null);
  const hasData = grid.some((r) => r.some((c) => c.trim() !== ""));
  const cols = grid[0]?.length ?? 0;

  const handleCellChange = (ri, ci, value) => {
    const newGrid = grid.map((r) => [...r]);
    newGrid[ri][ci] = value;
    onGridChange(newGrid);
  };

  const handlePaste = useCallback((e, startRow = 0, startCol = 0) => {
    e.preventDefault();
    const raw = e.clipboardData.getData("text/plain");

    if (!raw.includes("\t")) {
      alert("Looks like plain text — please copy directly from Excel or Google Sheets.");
      return;
    }

    const rows = raw.trim().split("\n").map((r) => r.split("\t"));
    const neededRows = startRow + rows.length;
    const neededCols = startCol + Math.max(...rows.map((r) => r.length));
    const newRows = Math.max(grid.length, neededRows);
    const newCols = Math.max(grid[0]?.length ?? 0, neededCols);

    const newGrid = Array.from({ length: newRows }, (_, ri) =>
      Array.from({ length: newCols }, (_, ci) => grid[ri]?.[ci] ?? "")
    );

    rows.forEach((row, ri) => {
      row.forEach((val, ci) => {
        newGrid[startRow + ri][startCol + ci] = val;
      });
    });

    onGridChange(newGrid);
  }, [grid, onGridChange]);

  const handleKeyDown = (e, ri, ci) => {
    const rows = grid.length;
    const focus = (r, c) => tableRef.current?.querySelector(`[data-cell="${r}-${c}"]`)?.focus();

    if (e.key === "Tab") {
      e.preventDefault();
      const next = e.shiftKey ? ci - 1 : ci + 1;
      if (next >= 0 && next < cols) focus(ri, next);
      else if (!e.shiftKey && ri + 1 < rows) focus(ri + 1, 0);
    }
    if (e.key === "Enter") { e.preventDefault(); if (ri + 1 < rows) focus(ri + 1, ci); }
    if (e.key === "ArrowDown" && ri + 1 < rows) focus(ri + 1, ci);
    if (e.key === "ArrowUp" && ri > 0) focus(ri - 1, ci);
    if (e.key === "ArrowRight" && e.target.selectionStart === e.target.value.length && ci + 1 < cols) focus(ri, ci + 1);
    if (e.key === "ArrowLeft" && e.target.selectionStart === 0 && ci > 0) focus(ri, ci - 1);
  };

  return (
    <div className="section">
      {hasData && (
        <div className="table-label-row" style={{ marginBottom: 6 }}>
          <div className="header-row-toggle">
            <span className="toggle-label">Header rows:</span>
            {[1, 2, 3, 4].map((n) => (
              <button
                key={n}
                className={headerRows === n ? "active" : ""}
                onClick={() => onHeaderRowsChange(n)}
              >{n}</button>
            ))}
          </div>
        </div>
      )}

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
