import { useState, useCallback, useRef } from "react";

const PLACEHOLDER_ROWS = 4;
const PLACEHOLDER_COLS = 5;

function buildColspanCells(row) {
  const result = [];
  let i = 0;
  while (i < row.length) {
    const val = row[i];
    if (val) {
      let span = 1;
      while (i + span < row.length && row[i + span] === "") span++;
      result.push({ value: val, colspan: span });
      i += span;
    } else {
      result.push({ value: "", colspan: 1 });
      i++;
    }
  }
  return result;
}

function PlaceholderGrid() {
  return (
    <div className="table-preview-wrapper placeholder-grid">
      <table className="table-preview">
        <thead>
          <tr>
            <th className="row-num"></th>
            {Array.from({ length: PLACEHOLDER_COLS }, (_, i) => (
              <th key={i}><div className="placeholder-cell header" /></th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: PLACEHOLDER_ROWS }, (_, ri) => (
            <tr key={ri}>
              <td className="row-num">{ri + 2}</td>
              {Array.from({ length: PLACEHOLDER_COLS }, (_, ci) => (
                <td key={ci}><div className="placeholder-cell" style={{ width: `${50 + ((ri * 3 + ci * 7) % 40)}px` }} /></td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function TableInput({ onChange }) {
  const [cells, setCells] = useState([]);
  const [origLengths, setOrigLengths] = useState([]);
  const [hasData, setHasData] = useState(false);
  const [pasteError, setPasteError] = useState("");
  const [headerRows, setHeaderRows] = useState(1);
  const textareaRef = useRef(null);

  const handlePaste = useCallback((e) => {
    e.preventDefault();
    const raw = e.clipboardData.getData("text/plain");
    const lines = raw.trim().split("\n");

    if (!raw.includes("\t")) {
      setPasteError("Looks like plain text — please copy directly from Excel or Google Sheets and try again.");
      return;
    }

    setPasteError("");
    const rows = lines.map((r) => r.split("\t"));
    const maxCols = Math.max(...rows.map((r) => r.length));

    setOrigLengths(rows.map((r) => r.length));

    const padded = rows.map((r) => {
      const copy = [...r];
      while (copy.length < maxCols) copy.push("");
      return copy;
    });

    setCells(padded);
    setHasData(true);
    onChange(padded.map((r) => r.join("\t")).join("\n"));
  }, [onChange]);

  const handleClear = () => {
    setCells([]);
    setOrigLengths([]);
    setHasData(false);
    setPasteError("");
    setHeaderRows(1);
    onChange("");
    setTimeout(() => textareaRef.current?.focus(), 50);
  };

  function getDisplayRow(row, rowIndex) {
    const deficit = (cells[0]?.length ?? 0) - (origLengths[rowIndex] ?? (cells[0]?.length ?? 0));
    if (deficit <= 0) return row;
    return [...Array(deficit).fill(""), ...row.slice(0, (cells[0]?.length ?? 0) - deficit)];
  }

  const colCount = cells[0]?.length ?? 0;
  const headRows = cells.slice(0, headerRows);
  const bodyRows = cells.slice(headerRows);

  return (
    <div className="section">
      <label>Paste your table here</label>
      <p className="hint">Copy headers + a few rows from Excel or Google Sheets, then paste below.</p>

      <textarea
        ref={textareaRef}
        rows={4}
        placeholder={"Name\tDepartment\tSales\nAlice\tMarketing\t5000\nBob\tSales\t8000"}
        onPaste={handlePaste}
        onChange={() => {}}
        value=""
        readOnly
        className="paste-textarea"
      />

      {pasteError && <p className="error" style={{ marginTop: 6 }}>{pasteError}</p>}

      {!hasData ? (
        <PlaceholderGrid />
      ) : (
        <>
          <div className="table-label-row">
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
            <button className="clear-btn" onClick={handleClear}>Clear &amp; re-paste</button>
          </div>
          <div className="table-preview-wrapper" onPaste={handlePaste}>
            <table className="table-preview">
              <thead>
                {headRows.map((row, ri) => {
                  const displayRow = getDisplayRow(row, ri);
                  const cellDefs = headerRows > 1 && ri === 0
                    ? buildColspanCells(displayRow)
                    : displayRow.map((v) => ({ value: v, colspan: 1 }));
                  return (
                    <tr key={ri}>
                      <th className="row-num"></th>
                      {cellDefs.map((cell, ci) => (
                        <th
                          key={ci}
                          colSpan={cell.colspan}
                          style={{ textAlign: cell.colspan > 1 ? "center" : "left" }}
                        >
                          {cell.value}
                        </th>
                      ))}
                    </tr>
                  );
                })}
              </thead>
              <tbody>
                {bodyRows.map((row, ri) => (
                  <tr key={ri}>
                    <td className="row-num">{ri + headerRows + 1}</td>
                    {Array.from({ length: colCount }, (_, ci) => (
                      <td key={ci}>{row[ci] ?? ""}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
