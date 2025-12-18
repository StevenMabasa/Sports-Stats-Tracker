import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DefStatsForm from "../pages/coachDashboard/matchManaging/PlayerStatsForm/DefStatsForm";

describe('DefStatsForm', () => {
  const mockOnSave = vi.fn();

  const defaultProps = {
    onSave: mockOnSave,
  };

  beforeEach(() => {
    mockOnSave.mockClear();
  });

  it('renders all form fields with initial values of 0', () => {
    render(<DefStatsForm {...defaultProps} />);

    const inputs = screen.getAllByRole('spinbutton');
    expect(inputs).toHaveLength(4);
    inputs.forEach((input) => {
      expect(input).toHaveValue(0);
    });
  });

  it('renders with initialStats when provided', () => {
    const initialStats = {
      passesSuccessful: 10,
      passesAttempted: 15,
      interceptions: 2,
      tackles: 8,
    };

    render(<DefStatsForm {...defaultProps} initialStats={initialStats} />);

    const inputs = screen.getAllByRole('spinbutton');
    expect(inputs[0]).toHaveValue(10); // passesSuccessful
    expect(inputs[1]).toHaveValue(15); // passesAttempted
    expect(inputs[2]).toHaveValue(2);  // interceptions
    expect(inputs[3]).toHaveValue(8);  // tackles
  });

  it('calls onSave when input value changes', async () => {
    const user = userEvent.setup();
    render(<DefStatsForm {...defaultProps} />);

    const inputs = screen.getAllByRole('spinbutton');
    const tacklesInput = inputs[3];
    
    await user.clear(tacklesInput);
    await user.type(tacklesInput, '5');

    expect(mockOnSave).toHaveBeenCalledWith({
      passesSuccessful: 0,
      passesAttempted: 0,
      interceptions: 0,
      tackles: 5,
    });
  });

  it('calls onSave multiple times for multiple field changes', async () => {
    const user = userEvent.setup();
    render(<DefStatsForm {...defaultProps} />);

    const inputs = screen.getAllByRole('spinbutton');
    const passesSuccessfulInput = inputs[0];
    const interceptionsInput = inputs[2];

    await user.clear(passesSuccessfulInput);
    await user.type(passesSuccessfulInput, '12');

    await user.clear(interceptionsInput);
    await user.type(interceptionsInput, '3');

    expect(mockOnSave).toHaveBeenCalled();
    expect(mockOnSave).toHaveBeenLastCalledWith({
      passesSuccessful: 12,
      passesAttempted: 0,
      interceptions: 3,
      tackles: 0,
    });
  });

  it('updates form when initialStats prop changes', () => {
    const { rerender } = render(<DefStatsForm {...defaultProps} />);

    let inputs = screen.getAllByRole('spinbutton');
    expect(inputs[3]).toHaveValue(0);

    const newInitialStats = {
      passesSuccessful: 20,
      passesAttempted: 25,
      interceptions: 5,
      tackles: 15,
    };

    rerender(<DefStatsForm {...defaultProps} initialStats={newInitialStats} />);

    inputs = screen.getAllByRole('spinbutton');
    expect(inputs[0]).toHaveValue(20);
    expect(inputs[1]).toHaveValue(25);
    expect(inputs[2]).toHaveValue(5);
    expect(inputs[3]).toHaveValue(15);
  });

  it('handles partial initialStats by defaulting missing fields to 0', () => {
    const partialStats = {
      tackles: 10,
    };

    render(<DefStatsForm {...defaultProps} initialStats={partialStats} />);

    const inputs = screen.getAllByRole('spinbutton');
    expect(inputs[0]).toHaveValue(0); // passesSuccessful
    expect(inputs[1]).toHaveValue(0); // passesAttempted
    expect(inputs[2]).toHaveValue(0); // interceptions
    expect(inputs[3]).toHaveValue(10); // tackles
  });

});