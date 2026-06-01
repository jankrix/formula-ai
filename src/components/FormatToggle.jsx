export default function FormatToggle({ format, onChange }) {
  return (
    <div className="format-toggle">
      <button
        className={format === "excel" ? "active" : ""}
        onClick={() => onChange("excel")}
      >
        Excel
      </button>
      <button
        className={format === "sheets" ? "active" : ""}
        onClick={() => onChange("sheets")}
      >
        Google Sheets
      </button>
    </div>
  );
}
