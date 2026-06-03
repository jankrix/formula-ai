import { useState } from "react";
import { matchFormula } from "./utils/formulaMatcher";
import TabBar from "./components/TabBar";
import TableInput from "./components/TableInput";
import QueryInput from "./components/QueryInput";
import FormatToggle from "./components/FormatToggle";
import FormulaOutput from "./components/FormulaOutput";
import HelpPage from "./components/HelpPage";
import StepHint from "./components/StepHint";
import "./App.css";

const INIT_ROWS = 6;
const INIT_COLS = 5;

function makeGrid() {
  return Array.from({ length: INIT_ROWS }, () => Array(INIT_COLS).fill(""));
}

function makeTab(id, name) {
  return { id, name, grid: makeGrid(), headerRows: 1 };
}

let tabCounter = 2;

function buildTableData(tabs) {
  const filledTabs = tabs.filter((t) => t.grid.some((r) => r.some((c) => c.trim())));
  if (filledTabs.length === 0) return "";
  if (filledTabs.length === 1) {
    return filledTabs[0].grid.map((r) => r.join("\t")).join("\n");
  }
  return filledTabs
    .map((t) => `[${t.name}]\n${t.grid.map((r) => r.join("\t")).join("\n")}`)
    .join("\n\n");
}

export default function App() {
  const [tabs, setTabs] = useState([makeTab("sheet1", "Sheet1")]);
  const [activeTabId, setActiveTabId] = useState("sheet1");
  const [query, setQuery] = useState("");
  const [format, setFormat] = useState("excel");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");
  const [showHelp, setShowHelp] = useState(false);

  const activeTab = tabs.find((t) => t.id === activeTabId);
  const hasAnyData = tabs.some((t) => t.grid.some((r) => r.some((c) => c.trim())));

  const updateActiveTab = (changes) => {
    setTabs((prev) => prev.map((t) => t.id === activeTabId ? { ...t, ...changes } : t));
  };

  const handleAddTab = () => {
    const id = `sheet${tabCounter++}`;
    const name = `Sheet${tabs.length + 1}`;
    const newTab = makeTab(id, name);
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(id);
  };

  const handleDeleteTab = (id) => {
    const remaining = tabs.filter((t) => t.id !== id);
    setTabs(remaining);
    if (activeTabId === id) setActiveTabId(remaining[remaining.length - 1].id);
  };

  const handleRenameTab = (id, name) => {
    setTabs((prev) => prev.map((t) => t.id === id ? { ...t, name } : t));
  };

  const handleClearTab = () => {
    updateActiveTab({ grid: makeGrid(), headerRows: 1 });
  };

  const handleGenerate = async () => {
    const tableData = buildTableData(tabs);
    if (!tableData.trim() || !query.trim()) {
      setError("Please fill in your table and type your question.");
      return;
    }
    setError("");
    setWarning("");
    setResult("");

    // try pattern match first — no API call needed for common formulas
    const matched = matchFormula(query, activeTab.grid, activeTab.headerRows);
    if (matched) {
      setResult(`Formula: ${matched.formula}\nExplanation: ${matched.explanation}`);
      if (matched.warning) setWarning(matched.warning);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/formula", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tableData, query, format }),
      });

      if (!res.ok) throw new Error("Something went wrong. Please try again.");
      const data = await res.json();
      setResult(data.result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (showHelp) {
    return (
      <div className="container">
        <HelpPage onClose={() => setShowHelp(false)} />
      </div>
    );
  }

  return (
    <div className="container">
      <header>
        <h1>FormulaAI</h1>
        <p>Paste your table, ask a question, get the formula — no extensions, no data stored.</p>
        <button className="help-link" onClick={() => setShowHelp(true)}>How to use?</button>
      </header>

      <main>
        <StepHint visible={!hasAnyData} />

        <div className="section">
          <div className="sheet-header">
            <TabBar
              tabs={tabs}
              activeTabId={activeTabId}
              onSwitch={setActiveTabId}
              onAdd={handleAddTab}
              onRename={handleRenameTab}
              onDelete={handleDeleteTab}
            />
            {activeTab && activeTab.grid.some((r) => r.some((c) => c.trim())) && (
              <button className="clear-btn" onClick={handleClearTab}>Clear sheet</button>
            )}
          </div>

          {activeTab && (
            <TableInput
              key={activeTabId}
              grid={activeTab.grid}
              onGridChange={(grid) => updateActiveTab({ grid })}
              headerRows={activeTab.headerRows}
              onHeaderRowsChange={(headerRows) => updateActiveTab({ headerRows })}
            />
          )}
        </div>

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
        {warning && <p className="warning">{warning}</p>}

        <FormulaOutput result={result} />
      </main>

      <footer>
        <p>Your data never leaves your browser. We only send your question and table structure to generate the formula.</p>
      </footer>
    </div>
  );
}
