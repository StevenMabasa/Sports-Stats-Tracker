import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import StrStatsForm from '../pages/coachDashboard/matchManaging/PlayerStatsForm/StrStatsForm';

describe('StrStatsForm Component', () => {
  const mockOnSave = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render all form fields with correct labels and initial values', () => {
    render(<StrStatsForm onSave={mockOnSave} />);

    ['shots', 'shotsOnTarget', 'dribblesAttempted', 'dribblesSuccessful', 'offsides']
      .forEach(label => expect(screen.getByText(label)).toBeInTheDocument());

    const inputs = screen.getAllByRole('spinbutton');
    inputs.forEach(input => expect(input).toHaveValue(0));
  });

  it('should update individual field values and call onSave', () => {
    render(<StrStatsForm onSave={mockOnSave} />);

    const inputs = screen.getAllByRole('spinbutton');
    fireEvent.change(inputs[0], { target: { value: '5' } }); // shots

    expect(inputs[0]).toHaveValue(5);
    expect(mockOnSave).toHaveBeenCalledWith(
      expect.objectContaining({ shots: 5 })
    );
  });

  it('should handle multiple field updates correctly', () => {
    render(<StrStatsForm onSave={mockOnSave} />);
    const inputs = screen.getAllByRole('spinbutton');

    const values = [8, 5, 6, 4, 2];
    inputs.forEach((input, i) => fireEvent.change(input, { target: { value: `${values[i]}` } }));

    const expected = {
      shots: 8,
      shotsOnTarget: 5,
      dribblesAttempted: 6,
      dribblesSuccessful: 4,
      offsides: 2,
    };
    expect(mockOnSave).toHaveBeenLastCalledWith(expected);
  });

  it('should handle edge cases', () => {
    render(<StrStatsForm onSave={mockOnSave} />);
    const inputs = screen.getAllByRole('spinbutton');

    // negative
    fireEvent.change(inputs[4], { target: { value: '-1' } });
    expect(mockOnSave).toHaveBeenLastCalledWith(expect.objectContaining({ offsides: -1 }));

    // decimal
    fireEvent.change(inputs[0], { target: { value: '5.5' } });
    expect(mockOnSave).toHaveBeenLastCalledWith(expect.objectContaining({ shots: 5.5 }));

    // empty string => 0
    fireEvent.change(inputs[1], { target: { value: '' } });
    expect(mockOnSave).toHaveBeenLastCalledWith(expect.objectContaining({ shotsOnTarget: 0 }));

    // very large number
    fireEvent.change(inputs[0], { target: { value: '999999' } });
    expect(mockOnSave).toHaveBeenLastCalledWith(expect.objectContaining({ shots: 999999 }));
  });

  it('should accept initialStats prop', () => {
    const initialStats = { shots: 3, shotsOnTarget: 2, dribblesAttempted: 1, dribblesSuccessful: 0, offsides: 0 };
    render(<StrStatsForm onSave={mockOnSave} initialStats={initialStats} />);
    
    const inputs = screen.getAllByRole('spinbutton');
    expect(inputs[0]).toHaveValue(3);
    expect(inputs[1]).toHaveValue(2);
    expect(inputs[2]).toHaveValue(1);
    expect(inputs[3]).toHaveValue(0);
    expect(inputs[4]).toHaveValue(0);
  });
});
