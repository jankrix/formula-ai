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
      <p className="tab-intro">FormulaAI turns plain-language questions about your spreadsheet into ready-to-use formulas — without sharing your full data.</p>
      <div className="steps">
        <StepCard number="1" title="Copy from Excel or Google Sheets">
          Select your headers and a few rows of data. Press <kbd>Cmd+C</kbd> (Mac) or <kbd>Ctrl+C</kbd> (Windows). You don't need to copy the whole sheet — just enough rows for the AI to understand the structure.
        </StepCard>
        <StepCard number="2" title="Paste into the table zone">
          Click the dashed paste area on the main page, then press <kbd>Cmd+V</kbd> / <kbd>Ctrl+V</kbd>. Your table will appear as a grid instantly. If your table has two header rows (group labels + column names), toggle <strong>Header rows: 2</strong>.
        </StepCard>
        <StepCard number="3" title="Choose Excel or Google Sheets">
          Use the toggle to select which app you're working in. The formula syntax differs between the two — XLOOKUP exists in Excel but not older Sheets, FILTER is Sheets-native, etc.
        </StepCard>
        <StepCard number="4" title="Ask your question in plain English">
          Type what you want to calculate. Be specific about column names and conditions. Press <kbd>Enter</kbd> or click <strong>Generate</strong>.
        </StepCard>
        <StepCard number="5" title="Copy and paste the formula">
          Click <strong>Copy</strong> next to the result, go to your spreadsheet, click the cell where you want the formula, and paste. Adjust cell references if needed.
        </StepCard>
      </div>
      <div className="tip-box">
        <strong>Privacy note:</strong> Only your question and table structure are sent to the AI. Your actual data values are included only as sample rows — we never store anything.
      </div>
    </div>
  );
}

function TabExamples() {
  return (
    <div className="tab-content">
      <ExampleBlock
        title="Simple — Sales Table"
        table={{
          headers: [["Name", "Region", "Department", "Sales", "Status"]],
          rows: [
            ["Alice", "East", "Marketing", "5000", "Closed"],
            ["Bob", "West", "Sales", "12000", "Closed"],
            ["Carol", "East", "Sales", "8500", "Pending"],
          ],
        }}
        queries={[
          "Sum of Sales where Region is East",
          "Count rows where Status is Pending",
          "Average sales for Department Sales",
          "What percentage of total sales does East region contribute",
        ]}
      />

      <ExampleBlock
        title="Lookup — Employee Table"
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
          "Which department does Alice belong to",
        ]}
      />

      <ExampleBlock
        title="Complex — Multi-header Quarterly Table"
        note="Use 'Header rows: 2' toggle after pasting this table type."
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
          "Which department has the highest Q2 expense",
          "Total profit (revenue minus expense) per region across all quarters",
          "Compare Q1 vs Q2 revenue growth percentage for Engineering",
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

      <div className="tip-box" style={{ marginTop: 24 }}>
        <strong>Common issue:</strong> If the formula returns <code>#REF!</code> or <code>#VALUE!</code>, the column letters in the formula don't match your actual sheet. Ask FormulaAI again with the correct column layout described in your question.
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
