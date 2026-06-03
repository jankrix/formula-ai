import { useState, useEffect } from "react";

const STEPS = [
  { icon: "📋", label: "Copy from Excel or Sheets" },
  { icon: "⌘V", label: "Paste into the zone below" },
  { icon: "💬", label: "Ask your question" },
  { icon: "✓", label: "Get your formula" },
];

export default function StepHint({ visible }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (!visible) return;
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % STEPS.length);
    }, 2000);
    return () => clearInterval(timer);
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="step-hint">
      {STEPS.map((step, i) => (
        <div key={i} className={`step-hint-item ${active === i ? "active" : ""}`}>
          <span className="step-hint-icon">{step.icon}</span>
          <span className="step-hint-label">{step.label}</span>
          {i < STEPS.length - 1 && <span className="step-hint-arrow">→</span>}
        </div>
      ))}
    </div>
  );
}
