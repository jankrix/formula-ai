import { useState, useCallback } from "react";

export default function TableInput({ onChange }) {
  const [cells, setCells] = useState([]);
  const [hasData, setHasData] = useState(false);
  const [pasteError, setPasteError] = useState("");

  const handlePaste = useCallback((e) => {
    e.preventDefault();
    const raw = e.clipboardData.getData("text/plain");
    const lines = raw.trim().split("\n");

    const hasTabs = raw.includes("\t");
    if (!hasTabs) {
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

    const tsv = padded.map((r) => r.join("\t")).join("\n");
    onChange(tsv);
  }, [onChange]);

  const handleClear = () => {
    setCells([]);
    setHasData(false);
    setPasteError("");
    onChange("");
  };

  const headers = hasData ? cells[0] : null;
  const body = hasData ? cells.slice(1) : null;

  if (!hasData) {
    return (
      <div className="section">
        <label>Paste your table</label>
        <p className="hint">Copy from Excel or Google Sheets, click the area below, then press Cmd+V / Ctrl+V.</p>
        <div
          className="paste-zone"
          tabIndex={0}
          onPaste={handlePaste}
        >
          <div className="paste-zone-icon">⌘V</div>
          <div className="paste-zone-text">Click here and paste your table</div>
          <div className="paste-zone-sub">Works with Excel and Google Sheets</div>
        </div>
        {pasteError && <p className="error" style={{ marginTop: 8 }}>{pasteError}</p>}
      </div>
    );
  }

  return (
    <div className="section">
      <div className="table-label-row">
        <label>Your table</label>
        <button className="clear-btn" onClick={handleClear}>Clear &amp; re-paste</button>
      </div>
      <div className="table-preview-wrapper" onPaste={handlePaste}>
        <table className="table-preview">
          <thead>
            <tr>
              <th className="row-num"></th>
              {headers.map((h, i) => <th key={i}>{h || "—"}</th>)}
            </tr>
          </thead>
          <tbody>
            {body.map((row, ri) => (
              <tr key={ri}>
                <td className="row-num">{ri + 2}</td>
                {headers.map((_, ci) => (
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
