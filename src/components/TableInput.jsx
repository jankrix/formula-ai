function parseTable(raw) {
  const lines = raw.trim().split("\n");
  if (!lines.length) return null;
  // prefer tab split; fall back to 2+ spaces
  const rows = lines.map((r) =>
    r.includes("\t") ? r.split("\t") : r.trim().split(/\s{2,}/)
  );
  if (rows.length < 1 || (rows.length === 1 && rows[0].length === 1 && !rows[0][0])) return null;
  return rows;
}

function TablePreview({ rows }) {
  const headers = rows[0];
  const body = rows.slice(1);

  return (
    <div className="table-preview-wrapper">
      <table className="table-preview">
        <thead>
          <tr>
            <th className="row-num"></th>
            {headers.map((h, i) => (
              <th key={i}>{h || "—"}</th>
            ))}
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
  );
}

export default function TableInput({ value, onChange }) {
  const parsed = value.trim() ? parseTable(value) : null;

  return (
    <div className="section">
      <label>Paste your table here</label>
      <p className="hint">Copy headers + a few rows from Excel or Google Sheets and paste below.</p>
      <textarea
        rows={5}
        placeholder={"Name\tDepartment\tSales\nAlice\tMarketing\t5000\nBob\tSales\t8000"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {parsed && <TablePreview rows={parsed} />}
    </div>
  );
}
