// src/pages/coachDashboard/TeamFormGuide.tsx
import React from 'react';

interface Props {
  form: ('W' | 'D' | 'L')[];
}

const TeamFormGuide: React.FC<Props> = ({ form }) => (
  <div className="form-guide">
    {form.map((result, index) => (
      <span key={index} className={`form-bubble form-${result.toLowerCase()}`}>
        {result}
      </span>
    ))}
  </div>
);

export default TeamFormGuide;