import { useState, useCallback } from "react";

export default function TableInput({ onChange }) {
  const [cells, setCells] = useState([]);
  const [hasData, setHasData] = useState(false);
  const [pasteError, setPasteError] = useState("");
  const [headerRows, setHeaderRows] = useState(1);

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
    setHasData(false);
    setPasteError("");
    setHeaderRows(1);
    onChange("");
  };

  if (!hasData) {
    return (
      <div className="section">
        <label>Paste your table</label>
        <p className="hint">Copy from Excel or Google Sheets, click the area below, then press Cmd+V / Ctrl+V.</p>
        <div className="paste-zone" tabIndex={0} onPaste={handlePaste}>
          <div className="paste-zone-icon">⌘V</div>
          <div className="paste-zone-text">Click here and paste your table</div>
          <div className="paste-zone-sub">Works with Excel and Google Sheets</div>
        </div>
        {pasteError && <p className="error" style={{ marginTop: 8 }}>{pasteError}</p>}
      </div>
    );
  }

  const headRows = cells.slice(0, headerRows);
  const bodyRows = cells.slice(headerRows);
  const colCount = cells[0].length;

  return (
    <div className="section">
      <div className="table-label-row">
        <label>Your table</label>
        <div className="table-controls">
          <div className="header-row-toggle">
            <span className="toggle-label">Header rows:</span>
            <button
              className={headerRows === 1 ? "active" : ""}
              onClick={() => setHeaderRows(1)}
            >1</button>
            <button
              className={headerRows === 2 ? "active" : ""}
              onClick={() => setHeaderRows(2)}
            >2</button>
          </div>
          <button className="clear-btn" onClick={handleClear}>Clear &amp; re-paste</button>
        </div>
      </div>
      <div className="table-preview-wrapper" onPaste={handlePaste}>
        <table className="table-preview">
          <thead>
            {headRows.map((row, ri) => (
              <tr key={ri}>
                <th className="row-num"></th>
                {Array.from({ length: colCount }, (_, ci) => (
                  <th key={ci}>{row[ci] ?? ""}</th>
                ))}
              </tr>
            ))}
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
    </div>
  );
}
