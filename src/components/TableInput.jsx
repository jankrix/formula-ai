export default function TableInput({ value, onChange }) {
  return (
    <div className="section">
      <label>Paste your table here</label>
      <p className="hint">Copy headers + a few rows from Excel or Google Sheets and paste below.</p>
      <textarea
        rows={8}
        placeholder={"Name\tDepartment\tSales\nAlice\tMarketing\t5000\nBob\tSales\t8000"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
