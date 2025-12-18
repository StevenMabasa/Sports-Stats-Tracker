import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, vi, beforeEach, expect } from 'vitest';
import RoleSelection from '../components/RoleSelection';
import { MemoryRouter } from 'react-router-dom';

describe('RoleSelection Component', () => {
  const userEmail = 'test@example.com';
  const userId = 'user-123';
  const onRoleSelected = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders component with both roles', () => {
    render(
      <MemoryRouter>
        <RoleSelection userId={userId} userEmail={userEmail} onRoleSelected={onRoleSelected} />
      </MemoryRouter>
    );

    expect(screen.getByText(/Welcome to Sport Stats Tracker/i)).toBeInTheDocument();
    expect(screen.getByText(/Fan/i)).toBeInTheDocument();
    expect(screen.getByText(/Coach/i)).toBeInTheDocument();
  });

  it('selects Fan role when clicked', () => {
    render(
      <MemoryRouter>
        <RoleSelection userId={userId} userEmail={userEmail} onRoleSelected={onRoleSelected} />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('Fan'));
    const continueBtn = screen.getByRole('button', { name: /Continue as Fan/i });
    expect(continueBtn).toBeInTheDocument();
  });

  it('selects Coach role when clicked', () => {
    render(
      <MemoryRouter>
        <RoleSelection userId={userId} userEmail={userEmail} onRoleSelected={onRoleSelected} />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('Coach'));
    const continueBtn = screen.getByRole('button', { name: /Continue as Coach/i });
    expect(continueBtn).toBeInTheDocument();
  });

  it('calls onRoleSelected for Fan', async () => {
    render(
      <MemoryRouter>
        <RoleSelection userId={userId} userEmail={userEmail} onRoleSelected={onRoleSelected} />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('Fan'));
    fireEvent.click(screen.getByRole('button', { name: /Continue as Fan/i }));

    await waitFor(() => {
      expect(onRoleSelected).toHaveBeenCalledWith('Fan');
    });
  });

  it('calls onRoleSelected for Coach', async () => {
    render(
      <MemoryRouter>
        <RoleSelection userId={userId} userEmail={userEmail} onRoleSelected={onRoleSelected} />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('Coach'));
    fireEvent.click(screen.getByRole('button', { name: /Continue as Coach/i }));

    await waitFor(() => {
      expect(onRoleSelected).toHaveBeenCalledWith('Coach');
    });
  });

  it('displays loading state when isLoading prop is true', async () => {
    // Render with external loading state enabled. The component shows the
    // "Setting up..." label and disables the button when `isLoading` is true.
    render(
      <MemoryRouter>
        <RoleSelection userId={userId} userEmail={userEmail} onRoleSelected={onRoleSelected} isLoading={true} />
      </MemoryRouter>
    );

    // Select a role to reveal the continue button, which should show the
    // loading label and be disabled because `isLoading` is true.
    fireEvent.click(screen.getByText('Fan'));

    expect(screen.getByRole('button', { name: /Setting up.../i })).toBeDisabled();
  });

  it('handles role selection without errors', async () => {
    render(
      <MemoryRouter>
        <RoleSelection userId={userId} userEmail={userEmail} onRoleSelected={onRoleSelected} />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('Fan'));
    fireEvent.click(screen.getByRole('button', { name: /Continue as Fan/i }));

    await waitFor(() => {
      expect(onRoleSelected).toHaveBeenCalledWith('Fan');
    });
  });
});