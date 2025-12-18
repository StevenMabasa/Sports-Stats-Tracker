import React, { useState, useEffect } from "react";

interface Props {
  initialStats?: Record<string, number>;
  onSave: (stats: Record<string, number>) => void;
}

const GKStatsForm: React.FC<Props> = ({ onSave, initialStats }) => {
  const [form, setForm] = useState({
    saves: 0,
    clearances: 0,
    goalsConceded: 0,
  });

  useEffect(() => {
    if (initialStats) {
      setForm({
        saves: initialStats.saves || 0,
        clearances: initialStats.clearances || 0,
        goalsConceded: initialStats.goalsConceded || 0,
      });
    }
  }, [initialStats]);

  const handleInputChange = (field: string, value: number) => {
    const newForm = { ...form, [field]: value };
    setForm(newForm);
    onSave(newForm);
  };

  return (
    <div className="position-stats-form">
      <div className="form-group">
        <label htmlFor="saves" style={{ color: "var(--primary)" }}>Saves</label>
        <input
          id="saves"
          type="number"
          min={0}
          aria-label="Number of saves"
          value={form.saves}
          onChange={(e) => handleInputChange("saves", +e.target.value) }
        />
      </div>
      <div className="form-group">
        <label htmlFor="clearances" style={{ color: "var(--primary)" }}>Clearances</label>
        <input
          id="clearances"
          type="number"
          min={0}
          aria-label="Number of clearances"
          value={form.clearances}
          onChange={(e) => handleInputChange("clearances", +e.target.value)}
        />
      </div>
      <div className="form-group">
        <label htmlFor="goalsConceded"style={{ color: "var(--primary)" }}>Goals Conceded</label>
        <input
          id="goalsConceded"
          type="number"
          min={0}
          aria-label="Number of goals conceded"
          value={form.goalsConceded}
          onChange={(e) => handleInputChange("goalsConceded", +e.target.value)}
        />
      </div>
    </div>
  );
};

export default GKStatsForm;
