import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import F1Sidebar from '../pages/f1/F1Sidebar';
import { BrowserRouter } from 'react-router-dom';

describe('F1Sidebar', () => {
  const renderSidebar = (activeTab: 'drivers' | 'teams' | 'stats' | 'f1Results') => {
    const onNavigate = vi.fn();
    render(
      <BrowserRouter>
        <F1Sidebar activeTab={activeTab} onNavigate={onNavigate} />
      </BrowserRouter>
    );
    return { onNavigate };
  };

  it('renders all navigation buttons and back link', () => {
    renderSidebar('drivers');

    expect(screen.getByText(/Drivers/i)).toBeInTheDocument();
    expect(screen.getByText(/Teams/i)).toBeInTheDocument();
    expect(screen.getByText(/Stats/i)).toBeInTheDocument();
    expect(screen.getByText(/Results/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Return to football dashboard/i })).toBeInTheDocument();
  });

  it('highlights the active tab', () => {
    renderSidebar('stats');

    const statsButton = screen.getByRole('button', { name: /Stats/i });
    expect(statsButton).toHaveClass('active');
    expect(statsButton).toHaveAttribute('aria-current', 'page');

    const driversButton = screen.getByRole('button', { name: /Drivers/i });
    expect(driversButton).not.toHaveClass('active');
    expect(driversButton).not.toHaveAttribute('aria-current');
  });

  it('calls onNavigate when a button is clicked', () => {
    const { onNavigate } = renderSidebar('drivers');

    const teamsButton = screen.getByRole('button', { name: /Teams/i });
    fireEvent.click(teamsButton);

    expect(onNavigate).toHaveBeenCalledTimes(1);
    expect(onNavigate).toHaveBeenCalledWith('teams');
  });

  it('renders F1 logo', () => {
    renderSidebar('drivers');
    expect(screen.getByText(/F1 Tracker/i)).toBeInTheDocument();
  });
});
