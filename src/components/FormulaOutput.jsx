import { useState } from "react";
import FeedbackModal from "./FeedbackModal";

export default function FormulaOutput({ result }) {
  const [copied, setCopied] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  if (!result) return null;

  const formulaMatch = result.match(/Formula:\s*(.+)/i);
  const explanationMatch = result.match(/Explanation:\s*([\s\S]+)/i);

  const formula = formulaMatch ? formulaMatch[1].trim() : result;
  const explanation = explanationMatch ? explanationMatch[1].trim() : null;

  const handleCopy = () => {
    navigator.clipboard.writeText(formula);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    setTimeout(() => setShowFeedback(true), 400);
  };

  return (
    <>
      <div className="output">
        <div className="formula-box">
          <code>{formula}</code>
          <button className="copy-btn" onClick={handleCopy}>
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
        {explanation && <p className="explanation">{explanation}</p>}
      </div>

      {showFeedback && <FeedbackModal onClose={() => setShowFeedback(false)} />}
    </>
  );
}
