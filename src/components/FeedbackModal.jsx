import { useState } from "react";

const USE_CASES = [
  { id: "work", label: "Work", icon: "💼" },
  { id: "school", label: "School", icon: "📚" },
  { id: "personal", label: "Personal", icon: "🏠" },
  { id: "freelance", label: "Freelance", icon: "💻" },
];

export default function FeedbackModal({ onClose }) {
  const [rating, setRating] = useState(null);
  const [useCase, setUseCase] = useState(null);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    setSubmitted(true);
    fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating, useCase, comment }),
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        {submitted ? (
          <div className="modal-thanks">
            <div className="thanks-icon">🙏</div>
            <div className="thanks-title">Thank you!</div>
            <p className="thanks-sub">Your feedback helps us build a better product.</p>
            <button className="modal-close-btn" onClick={onClose}>Close</button>
          </div>
        ) : (
          <>
            <div className="modal-header">
              <div className="modal-title">Quick feedback</div>
              <button className="modal-x" onClick={onClose}>✕</button>
            </div>

            <div className="modal-section">
              <div className="modal-label">Was the formula correct?</div>
              <div className="rating-row">
                <button
                  className={`rating-btn ${rating === "yes" ? "selected-yes" : ""}`}
                  onClick={() => setRating("yes")}
                >
                  👍 Yes
                </button>
                <button
                  className={`rating-btn ${rating === "no" ? "selected-no" : ""}`}
                  onClick={() => setRating("no")}
                >
                  👎 Needs work
                </button>
              </div>
            </div>

            <div className="modal-section">
              <div className="modal-label">What's your main use case?</div>
              <div className="usecase-row">
                {USE_CASES.map((u) => (
                  <button
                    key={u.id}
                    className={`usecase-btn ${useCase === u.id ? "selected-usecase" : ""}`}
                    onClick={() => setUseCase(u.id)}
                  >
                    <span className="usecase-icon">{u.icon}</span>
                    <span className="usecase-label">{u.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="modal-section">
              <div className="modal-label">Any other thoughts? <span className="optional">(optional)</span></div>
              <textarea
                className="modal-textarea"
                rows={2}
                placeholder="What would make this more useful for you?"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>

            <div className="modal-footer">
              <button className="modal-skip" onClick={onClose}>Skip</button>
              <button
                className="modal-submit"
                onClick={handleSubmit}
                disabled={!rating && !useCase && !comment}
              >
                Submit
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
