import React, { useState, useEffect } from "react";

interface Props {
  initialStats?: Record<string, number>;
  onSave: (stats: Record<string, number>) => void;
}

const DefStatsForm: React.FC<Props> = ({ onSave, initialStats }) => {
  const [form, setForm] = useState({
    passesSuccessful: 0,
    passesAttempted: 0,
    interceptions: 0,
    tackles: 0,
  });

  useEffect(() => {
    if (initialStats) {
      setForm({
        passesSuccessful: initialStats.passesSuccessful || 0,
        passesAttempted: initialStats.passesAttempted || 0,
        interceptions: initialStats.interceptions || 0,
        tackles: initialStats.tackles || 0,
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
      {Object.keys(form).map((field) => (
        <div key={field} className="form-group">
          <label htmlFor={field} style={{ color: "var(--primary)" }}>{field} </label>
          <input
            id={field}
            type="number"
            min={0}
            aria-label={`${field} value`}
            value={(form as any)[field]}
            onChange={(e) => handleInputChange(field, +e.target.value)}
          />
        </div>
      ))}
    </div>
  );
};

export default DefStatsForm;
