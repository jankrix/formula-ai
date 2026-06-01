import { useState } from "react";
import TableInput from "./components/TableInput";
import QueryInput from "./components/QueryInput";
import FormatToggle from "./components/FormatToggle";
import FormulaOutput from "./components/FormulaOutput";
import "./App.css";

export default function App() {
  const [tableData, setTableData] = useState("");
  const [query, setQuery] = useState("");
  const [format, setFormat] = useState("excel");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!tableData.trim() || !query.trim()) {
      setError("Please paste your table and type your question.");
      return;
    }
    setError("");
    setLoading(true);
    setResult("");

    try {
      const res = await fetch("/api/formula", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tableData, query, format }),
      });

      if (!res.ok) {
        throw new Error("Something went wrong. Please try again.");
      }

      const data = await res.json();
      setResult(data.result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <header>
        <h1>FormulaAI</h1>
        <p>Paste your table, ask a question, get the formula — no extensions, no data stored.</p>
      </header>

      <main>
        <TableInput value={tableData} onChange={setTableData} />

        <div className="section">
          <label>Formula type</label>
          <FormatToggle format={format} onChange={setFormat} />
        </div>

        <QueryInput
          value={query}
          onChange={setQuery}
          onSubmit={handleGenerate}
          loading={loading}
        />

        {error && <p className="error">{error}</p>}

        <FormulaOutput result={result} />
      </main>

      <footer>
        <p>Your data never leaves your browser. We only send your question and table structure to generate the formula.</p>
      </footer>
    </div>
  );
}
