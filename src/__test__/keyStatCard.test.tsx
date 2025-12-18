import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import KeyStatCard from '../pages/coachDashboard/playerManagement/KeyStatCard'

describe('KeyStatCard', () => {
  it('renders with given label and value', () => {
    render(<KeyStatCard label="Goals" value={10} />)

    expect(screen.getByText('Goals')).toBeInTheDocument()
    expect(screen.getByText('10')).toBeInTheDocument()
  })

  it('renders string values correctly', () => {
    render(<KeyStatCard label="Player" value="Messi" />)

    expect(screen.getByText('Player')).toBeInTheDocument()
    expect(screen.getByText('Messi')).toBeInTheDocument()
  })

  it('handles empty label correctly', () => {
    render(<KeyStatCard label="" value={5} />)
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('handles empty value correctly', () => {
    render(<KeyStatCard label="Assists" value="" />)
    expect(screen.getByText('Assists')).toBeInTheDocument()
  })

})
