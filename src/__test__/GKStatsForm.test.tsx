import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GKStatsForm from "../pages/coachDashboard/matchManaging/PlayerStatsForm/GKStatsForm";
describe('GKStatsForm', () => {
  const mockOnSave = vi.fn();

  const defaultProps = {
    onSave: mockOnSave,
  };

  beforeEach(() => {
    mockOnSave.mockClear();
  });

  it('renders all form fields with initial values of 0', () => {
    render(<GKStatsForm {...defaultProps} />);

    const inputs = screen.getAllByRole('spinbutton');
    expect(inputs).toHaveLength(3);
    inputs.forEach((input) => {
      expect(input).toHaveValue(0);
    });

    expect(screen.getByText('Saves')).toBeInTheDocument();
    expect(screen.getByText('Clearances')).toBeInTheDocument();
    expect(screen.getByText('Goals Conceded')).toBeInTheDocument();
  });

  it('renders with initialStats when provided', () => {
    const initialStats = {
      saves: 8,
      clearances: 5,
      goalsConceded: 2,
    };

    render(<GKStatsForm {...defaultProps} initialStats={initialStats} />);

    const inputs = screen.getAllByRole('spinbutton');
    expect(inputs[0]).toHaveValue(8);  // saves
    expect(inputs[1]).toHaveValue(5);  // clearances
    expect(inputs[2]).toHaveValue(2);  // goalsConceded
  });

  it('calls onSave when input value changes', async () => {
    const user = userEvent.setup();
    render(<GKStatsForm {...defaultProps} />);

    const inputs = screen.getAllByRole('spinbutton');
    const savesInput = inputs[0];
    
    await user.clear(savesInput);
    await user.type(savesInput, '10');

    expect(mockOnSave).toHaveBeenCalledWith({
      saves: 10,
      clearances: 0,
      goalsConceded: 0,
    });
  });

  it('calls onSave multiple times for multiple field changes', async () => {
    const user = userEvent.setup();
    render(<GKStatsForm {...defaultProps} />);

    const inputs = screen.getAllByRole('spinbutton');
    const savesInput = inputs[0];
    const clearancesInput = inputs[1];

    await user.clear(savesInput);
    await user.type(savesInput, '7');

    await user.clear(clearancesInput);
    await user.type(clearancesInput, '4');

    expect(mockOnSave).toHaveBeenCalled();
    expect(mockOnSave).toHaveBeenLastCalledWith({
      saves: 7,
      clearances: 4,
      goalsConceded: 0,
    });
  });

  it('updates form when initialStats prop changes', () => {
    const { rerender } = render(<GKStatsForm {...defaultProps} />);

    let inputs = screen.getAllByRole('spinbutton');
    expect(inputs[0]).toHaveValue(0);

    const newInitialStats = {
      saves: 12,
      clearances: 8,
      goalsConceded: 3,
    };

    rerender(<GKStatsForm {...defaultProps} initialStats={newInitialStats} />);

    inputs = screen.getAllByRole('spinbutton');
    expect(inputs[0]).toHaveValue(12);
    expect(inputs[1]).toHaveValue(8);
    expect(inputs[2]).toHaveValue(3);
  });

  it('handles partial initialStats by defaulting missing fields to 0', () => {
    const partialStats = {
      saves: 6,
    };

    render(<GKStatsForm {...defaultProps} initialStats={partialStats} />);

    const inputs = screen.getAllByRole('spinbutton');
    expect(inputs[0]).toHaveValue(6);  // saves
    expect(inputs[1]).toHaveValue(0);  // clearances
    expect(inputs[2]).toHaveValue(0);  // goalsConceded
  });

  // it('handles negative numbers', async () => {
  //   const user = userEvent.setup();
  //   render(<GKStatsForm {...defaultProps} />);

  //   const inputs = screen.getAllByRole('spinbutton');
  //   const goalsConcededInput = inputs[2];
    
  //   await user.clear(goalsConcededInput);
  //   await user.type(goalsConcededInput, '-2');

  //   expect(mockOnSave).toHaveBeenCalledWith(
  //     expect.objectContaining({
  //       goalsConceded: -2,
  //     })
  //   );
  // });

  it('handles zero values correctly', async () => {
    const user = userEvent.setup();
    const initialStats = {
      saves: 5,
      clearances: 3,
      goalsConceded: 1,
    };

    render(<GKStatsForm {...defaultProps} initialStats={initialStats} />);

    const inputs = screen.getAllByRole('spinbutton');
    const savesInput = inputs[0];
    
    await user.clear(savesInput);
    await user.type(savesInput, '0');

    expect(mockOnSave).toHaveBeenCalledWith({
      saves: 0,
      clearances: 3,
      goalsConceded: 1,
    });
  });

  it('handles large numbers', async () => {
    const user = userEvent.setup();
    render(<GKStatsForm {...defaultProps} />);

    const inputs = screen.getAllByRole('spinbutton');
    const savesInput = inputs[0];
    
    await user.clear(savesInput);
    await user.type(savesInput, '999');

    expect(mockOnSave).toHaveBeenCalledWith(
      expect.objectContaining({
        saves: 999,
      })
    );
  });
});
