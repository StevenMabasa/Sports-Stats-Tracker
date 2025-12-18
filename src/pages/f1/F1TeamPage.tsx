import React from 'react';
import { useConstructors, useDrivers } from './F1ApiBackend';
import './F1TeamsPage.css';

const teamColors: Record<string, { primary: string; accent: string }> = {
  'Red Bull': { primary: '#0600EF', accent: '#FF1801' },
  'McLaren': { primary: '#FF8700', accent: '#47C7FC' },
  'Ferrari': { primary: '#DC0000', accent: '#FFF500' },
  'Mercedes': { primary: '#00D2BE', accent: '#00D2BE' },
  'Aston Martin': { primary: '#006F62', accent: '#00D2BE' },
  'Alpine F1 Team': { primary: '#0090FF', accent: '#FF1801' },
  'Williams': { primary: '#005AFF', accent: '#FFFFFF' },
  'RB F1 Team': { primary: '#2B4562', accent: '#6692FF' },
  'Haas F1 Team': { primary: '#FFFFFF', accent: '#B6BABD' },
  'Sauber': { primary: '#00E701', accent: '#000000' },
};

interface TeamCardProps {
  team: {
    id: number;
    name: string;
    points: number;
    position: number;
    wins: number;
    podiums: number;
    drivers: string[];
  };
}

const TeamCard: React.FC<TeamCardProps> = ({ team }) => {
  const colors = teamColors[team.name] || { primary: '#e10600', accent: '#ffffff' };
  
  return (
    <div 
      className="f1-team-card"
      style={{
        background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primary}dd 70%, ${colors.primary}aa 100%)`,
      }}
    >
      <div className="team-card-pattern"></div>
      
      <div className="team-position">
        <span className="position-number">P{team.position}</span>
      </div>

      <div className="team-logo-container">
        {/* Logo would go here if you have logo URLs */}
        <div style={{ 
          fontSize: '3rem', 
          fontWeight: 'bold', 
          color: 'rgba(255,255,255,0.1)',
          textAlign: 'center'
        }}>
          {team.name.charAt(0)}
        </div>
      </div>

      <div className="team-info">
        <h2 className="f1-team-name">{team.name}</h2>
        <div className="team-drivers">
          {team.drivers.map((driver, idx) => (
            <span key={idx} className="driver-name">
              {driver}
            </span>
          ))}
        </div>
      </div>

      <div className="team-points-section">
        <div className="team-points">
          <span className="points-number">{team.points}</span>
          <span className="points-label">POINTS</span>
        </div>
      </div>

      <div 
        className="team-accent-stripe"
        style={{ background: colors.accent }}
      ></div>
    </div>
  );
};

const F1TeamsPage: React.FC = () => {
  const { constructorStats, loading: statsLoading } = useConstructors();
  const { drivers, loading: driversLoading } = useDrivers();

  const loading = statsLoading || driversLoading;
  const currentYear = new Date().getFullYear();

  if (loading) {
    return (
      <div className="f1-teams-page">
        <div className="page-header">
          <h1 className="page-title">Constructor Standings</h1>
          <p className="page-subtitle">{currentYear} FIA Formula One World Championship</p>
        </div>
        <div style={{ textAlign: 'center', padding: '4rem', color: '#999' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🏁</div>
          <p>Loading constructor standings...</p>
        </div>
      </div>
    );
  }

  // Map constructor stats to team format with drivers
  const teams = constructorStats?.map(team => {
    // Find drivers for this team
    const teamDrivers = drivers?.filter(d => 
      d.current_team_name === team.constructorName
    ).map(d => d.full_name) || [];

    return {
      id: team.constructorId,
      name: team.constructorName,
      points: team.stats.points,
      position: team.stats.position,
      wins: team.stats.wins,
      podiums: team.stats.podiums,
      drivers: teamDrivers,
    };
  }).sort((a, b) => a.position - b.position) || [];

  return (
    <div className="f1-teams-page">
      <div className="page-header">
        <h1 className="page-title">Constructor Standings</h1>
        <p className="page-subtitle">{currentYear} FIA Formula One World Championship</p>
      </div>

      <div className="teams-grid">
        {teams.map(team => (
          <TeamCard key={team.id} team={team} />
        ))}
      </div>
    </div>
  );
};

export default F1TeamsPage;