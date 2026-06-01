export default function QueryInput({ value, onChange, onSubmit, loading }) {
  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="section">
      <label>What do you want to calculate?</label>
      <div className="query-row">
        <textarea
          rows={2}
          placeholder="e.g. Sum of Sales where Department is Sales"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKey}
        />
        <button onClick={onSubmit} disabled={loading}>
          {loading ? "..." : "Generate"}
        </button>
      </div>
    </div>
  );
}
