import { useState, useRef, useEffect } from "react";

export default function TabBar({ tabs, activeTabId, onSwitch, onAdd, onRename, onDelete }) {
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (editingId) inputRef.current?.focus();
  }, [editingId]);

  const startRename = (tab) => {
    setEditingId(tab.id);
    setEditValue(tab.name);
  };

  const commitRename = () => {
    if (editValue.trim()) onRename(editingId, editValue.trim());
    setEditingId(null);
  };

  return (
    <div className="tab-bar">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={`tab-item ${tab.id === activeTabId ? "tab-active" : ""}`}
          onClick={() => onSwitch(tab.id)}
          onDoubleClick={() => startRename(tab)}
        >
          {editingId === tab.id ? (
            <input
              ref={inputRef}
              className="tab-rename-input"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={commitRename}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitRename();
                if (e.key === "Escape") setEditingId(null);
              }}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <>
              <span className="tab-name">{tab.name}</span>
              {tabs.length > 1 && (
                <button
                  className="tab-delete"
                  onClick={(e) => { e.stopPropagation(); onDelete(tab.id); }}
                >×</button>
              )}
            </>
          )}
        </div>
      ))}
      <button className="tab-add" onClick={onAdd}>+ Add sheet</button>
    </div>
  );
}
