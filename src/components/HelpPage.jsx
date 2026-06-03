import { useState } from "react";

const TABS = ["How to Use", "Examples", "Apply the Formula"];

function StepCard({ number, title, children }) {
  return (
    <div className="step-card">
      <div className="step-num">{number}</div>
      <div className="step-body">
        <div className="step-title">{title}</div>
        <div className="step-desc">{children}</div>
      </div>
    </div>
  );
}

function ExampleBlock({ title, table, queries, note }) {
  return (
    <div className="example-block">
      <div className="example-title">{title}</div>
      {note && <p className="example-note">{note}</p>}
      <div className="example-table-wrap">
        <table className="table-preview">
          <thead>
            {table.headers.map((hrow, ri) => (
              <tr key={ri}>
                {hrow.map((h, ci) => <th key={ci}>{h}</th>)}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.rows.map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) => <td key={ci}>{cell}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="example-queries">
        <div className="example-queries-label">Sample queries</div>
        {queries.map((q, i) => (
          <div key={i} className="example-query">
            <span className="query-bullet">→</span>
            <span>{q}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TabHowToUse() {
  return (
    <div className="tab-content">
      <p className="tab-intro">FormulaAI turns plain-language questions about your spreadsheet into ready-to-use formulas — no extensions, no data stored.</p>
      <div className="steps">
        <StepCard number="1" title="Enter your table">
          You can type directly into the spreadsheet grid, or copy from Excel / Google Sheets and paste with <kbd>Cmd+V</kbd> (Mac) or <kbd>Ctrl+V</kbd> (Windows). The grid fills instantly. You don't need the full sheet — headers and a few rows is enough.
        </StepCard>
        <StepCard number="2" title="Set header rows if needed">
          If your table has group headers above column names (e.g. Q1 / Q2 spanning Revenue and Expense), use the <strong>Header rows: 1 / 2 / 3 / 4</strong> toggle to mark them. This helps the formula reference the right columns.
        </StepCard>
        <StepCard number="3" title="Add more sheets for cross-sheet formulas">
          Click <strong>+ Add sheet</strong> to add a second tab and paste a lookup table there. FormulaAI will generate formulas that reference across sheets (e.g. <code>VLOOKUP(A2, Sheet2!A:C, 3, 0)</code>). Double-click a tab name to rename it.
        </StepCard>
        <StepCard number="4" title="Choose Excel or Google Sheets">
          Use the toggle to select your app. Syntax differs — XLOOKUP works in Excel but not older Sheets, FILTER and ARRAYFORMULA are Sheets-native.
        </StepCard>
        <StepCard number="5" title="Ask your question in plain English">
          Type what you want. Be specific about column names and conditions — e.g. <em>"sum of Monthly Sales where Department is Sales"</em>. Press <kbd>Enter</kbd> or click <strong>Generate</strong>. Common formulas (SUM, SUMIF, COUNT, AVERAGE, MAX, MIN) return instantly without waiting for AI.
        </StepCard>
        <StepCard number="6" title="Copy and use the formula">
          Click <strong>Copy</strong> next to the result, go to your spreadsheet, click the target cell, and paste. The formula explanation tells you exactly which column each reference maps to.
        </StepCard>
      </div>
      <div className="tip-box">
        <strong>Privacy note:</strong> Only your question and table structure are sent for formula generation. We never store your data.
      </div>
    </div>
  );
}

function MultiSheetExample() {
  const [activeSheet, setActiveSheet] = useState(0);

  const sheet1 = {
    label: "Sheet1 — Main employee data",
    headers: ["Employee ID", "Name", "Department", "Monthly Sales"],
    rows: [["E001","Alice","Sales","85000"],["E002","Bob","Marketing","42000"],["E003","Carol","Sales","91000"]],
  };
  const sheet2 = {
    label: "Sheet2 — Commission rates",
    headers: ["Employee ID", "Commission Rate", "Bonus Cap"],
    rows: [["E001","0.05","5000"],["E002","0.03","2000"],["E003","0.05","5000"]],
  };
  const active = activeSheet === 0 ? sheet1 : sheet2;

  return (
    <div className="example-block">
      <div className="example-title">Cross-sheet — VLOOKUP across two tabs</div>
      <p className="example-note">Add a second tab with + Add sheet, paste each table into its own sheet, then ask your question.</p>

      <div className="multisheet-demo">
        <div className="multisheet-tab-bar">
          {["Sheet1", "Sheet2"].map((name, i) => (
            <button
              key={i}
              className={`multisheet-tab ${activeSheet === i ? "active-tab" : ""}`}
              onClick={() => setActiveSheet(i)}
            >{name}</button>
          ))}
        </div>
        <div className="multisheet-grid-single">
          <div className="multisheet-label">{active.label}</div>
          <div className="example-table-wrap">
            <table className="table-preview">
              <thead><tr>{active.headers.map((h, i) => <th key={i}>{h}</th>)}</tr></thead>
              <tbody>{active.rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>)}</tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="example-queries">
        <div className="example-queries-label">Sample queries (with both sheets filled)</div>
        {[
          "Get the Commission Rate from Sheet2 for each employee based on Employee ID",
          "Calculate commission: Monthly Sales multiplied by Commission Rate from Sheet2",
          "Show Bonus Eligible if Monthly Sales exceeds Bonus Cap in Sheet2, else Not Eligible",
          "Find employees whose Monthly Sales in Sheet1 exceed their Bonus Cap in Sheet2",
        ].map((q, i) => (
          <div key={i} className="example-query">
            <span className="query-bullet">→</span>
            <span>{q}</span>
          </div>
        ))}
      </div>

      <div className="formula-examples">
        <div className="example-queries-label" style={{ marginTop: 12 }}>What FormulaAI returns</div>
        {[
          { q: "Get Commission Rate by Employee ID", f: "=VLOOKUP(A2,Sheet2!A:C,2,0)" },
          { q: "Calculate commission amount", f: "=D2*VLOOKUP(A2,Sheet2!A:C,2,0)" },
          { q: "Bonus eligible check", f: '=IF(D2>VLOOKUP(A2,Sheet2!A:C,3,0),"Bonus Eligible","Not Eligible")' },
        ].map((item, i) => (
          <div key={i} className="formula-example-row">
            <span className="formula-example-q">{item.q}</span>
            <code className="formula-example-f">{item.f}</code>
          </div>
        ))}
      </div>
    </div>
  );
}

function TabExamples() {
  return (
    <div className="tab-content">
      <ExampleBlock
        title="Simple — Instant formulas (no AI needed)"
        note="These return instantly without an API call."
        table={{
          headers: [["Name", "Department", "Monthly Sales", "Status"]],
          rows: [
            ["Alice", "Sales", "85000", "Active"],
            ["Bob", "Marketing", "42000", "Active"],
            ["Carol", "Sales", "91000", "Inactive"],
          ],
        }}
        queries={[
          "total of Monthly Sales",
          "sum of Monthly Sales where Department is Sales",
          "count where Status is Active",
          "average of Monthly Sales where Department is Marketing",
          "highest Monthly Sales",
          "lowest Monthly Sales",
        ]}
      />

      <ExampleBlock
        title="Lookup — Single sheet"
        table={{
          headers: [["Employee ID", "Name", "Department", "Email", "Salary"]],
          rows: [
            ["E001", "Alice", "Engineering", "alice@co.com", "12000"],
            ["E002", "Bob", "Sales", "bob@co.com", "7200"],
            ["E003", "Carol", "Finance", "carol@co.com", "6800"],
          ],
        }}
        queries={[
          "Get the email of employee ID E002",
          "Find the salary of Carol",
          "If Salary is above 10000 show Senior else Junior",
          "Rank employees by Salary highest to lowest",
        ]}
      />

      <MultiSheetExample />

      <ExampleBlock
        title="Complex — Multi-header Quarterly Table"
        note="Use 'Header rows: 2' toggle after pasting."
        table={{
          headers: [
            ["", "", "Q1", "", "Q2", ""],
            ["Region", "Department", "Revenue", "Expense", "Revenue", "Expense"],
          ],
          rows: [
            ["East", "Engineering", "50000", "30000", "55000", "32000"],
            ["East", "Sales", "80000", "20000", "85000", "22000"],
            ["West", "Engineering", "45000", "28000", "48000", "30000"],
          ],
        }}
        queries={[
          "Total Q1 revenue for East region",
          "Total profit (revenue minus expense) per region across all quarters",
          "Which department has the highest Q2 expense",
          "Compare Q1 vs Q4 revenue growth percentage for each department",
        ]}
      />
    </div>
  );
}

function ApplyStep({ title, children }) {
  return (
    <div className="apply-step">
      <div className="apply-title">{title}</div>
      <div className="apply-body">{children}</div>
    </div>
  );
}

function TabApply() {
  return (
    <div className="tab-content">
      <p className="tab-intro">Once you have a formula from FormulaAI, here's how to use it correctly in your spreadsheet.</p>

      <div className="apply-section-label">In Excel</div>
      <ApplyStep title="1. Click the cell where you want the result">
        This is usually the first empty cell in a new column, e.g. F2.
      </ApplyStep>
      <ApplyStep title="2. Paste the formula">
        Press <kbd>Ctrl+V</kbd> or type the formula directly. All Excel formulas start with <code>=</code>.
      </ApplyStep>
      <ApplyStep title="3. Check the cell references">
        The AI assumes your data starts at row 2. If your data starts elsewhere, adjust the row numbers. For example if data starts at row 5, change <code>A2:A100</code> to <code>A5:A100</code>.
      </ApplyStep>
      <ApplyStep title="4. Press Enter, then drag down">
        After confirming the formula works on the first row, drag the cell's bottom-right corner down to apply it to all rows.
      </ApplyStep>

      <div className="apply-section-label" style={{ marginTop: 28 }}>In Google Sheets</div>
      <ApplyStep title="1. Same as Excel — click the target cell and paste">
        Google Sheets formulas also start with <code>=</code>. Most Excel formulas work as-is, but use the <strong>Google Sheets</strong> toggle in FormulaAI to get Sheets-native syntax.
      </ApplyStep>
      <ApplyStep title="2. ARRAYFORMULA for entire columns">
        Google Sheets supports <code>ARRAYFORMULA</code> to apply a formula to a whole column at once without dragging. Ask FormulaAI: <em>"give me this as an ARRAYFORMULA"</em>.
      </ApplyStep>

      <div className="apply-section-label" style={{ marginTop: 28 }}>Cross-sheet formulas</div>
      <ApplyStep title="Match your sheet names exactly">
        FormulaAI uses the tab names you set in the app (e.g. Sheet1, Sheet2). Make sure your actual Excel or Google Sheets tab names match — the formula will break if they differ. Rename tabs in FormulaAI by double-clicking the tab name.
      </ApplyStep>
      <ApplyStep title="Sheet name with spaces needs quotes">
        If your sheet is named <code>Sales Data</code> (with a space), the reference becomes <code>'Sales Data'!A:C</code> with single quotes. FormulaAI handles this automatically for Google Sheets mode.
      </ApplyStep>
      <ApplyStep title="Lock the lookup range with $">
        For VLOOKUP across sheets, lock the range so it doesn't shift when you drag the formula down: <code>=VLOOKUP(A2, Sheet2!$A:$C, 2, 0)</code>. Add <kbd>$</kbd> before the column letters in the range.
      </ApplyStep>

      <div className="tip-box" style={{ marginTop: 24 }}>
        <strong>Common issue:</strong> If the formula returns <code>#REF!</code> or <code>#N/A</code>, either the column letters don't match your sheet layout, or the lookup value in Sheet1 doesn't exist in Sheet2. Check that Employee IDs (or whatever you're matching on) are formatted the same way in both sheets — no extra spaces.
      </div>
    </div>
  );
}

export default function HelpPage({ onClose }) {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="help-page">
      <div className="help-header">
        <div>
          <h2>How to Use FormulaAI</h2>
          <p>Everything you need to get the right formula, fast.</p>
        </div>
        <button className="help-close" onClick={onClose}>← Back to app</button>
      </div>

      <div className="help-tabs">
        {TABS.map((tab, i) => (
          <button
            key={i}
            className={activeTab === i ? "active" : ""}
            onClick={() => setActiveTab(i)}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 0 && <TabHowToUse />}
      {activeTab === 1 && <TabExamples />}
      {activeTab === 2 && <TabApply />}
    </div>
  );
}
