import React, { useState, useEffect } from 'react';
import { useRaces, useRaceResults } from './F1ApiBackend';
import './F1ResultsPage.css';

const countryFlags: Record<string, string> = {
  'AUS': '🇦🇺', 'BHR': '🇧🇭', 'CHN': '🇨🇳', 'JPN': '🇯🇵',
  'USA': '🇺🇸', 'ITA': '🇮🇹', 'MCO': '🇲🇨', 'CAN': '🇨🇦',
  'ESP': '🇪🇸', 'GBR': '🇬🇧', 'HUN': '🇭🇺', 'BEL': '🇧🇪',
  'NLD': '🇳🇱', 'SGP': '🇸🇬', 'AZE': '🇦🇿', 'MEX': '🇲🇽',
  'BRA': '🇧🇷', 'ARE': '🇦🇪', 'SAU': '🇸🇦', 'AUT': '🇦🇹',
  'FRA': '🇫🇷', 'DEU': '🇩🇪', 'PRT': '🇵🇹', 'TUR': '🇹🇷',
};

const getTeamColor = (team: string): string => {
  const colors: Record<string, string> = {
    'McLaren': '#FF8700',
    'Red Bull': '#0600EF',
    'Ferrari': '#DC0000',
    'Mercedes': '#00D2BE',
    'Aston Martin': '#006F62',
    'Alpine F1 Team': '#0090FF',
    'Williams': '#005AFF',
    'RB F1 Team': '#2B4562',
    'Haas F1 Team': '#FFFFFF',
    'Sauber': '#00E701',
  };
  return colors[team] || '#e10600';
};

const formatTime = (timeMs: string | null): string => {
  if (!timeMs) return '-';
  const ms = parseInt(timeMs);
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  const s = seconds % 60;
  const m = minutes % 60;
  
  return `${hours}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const F1ResultsPage: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const { races, loading: racesLoading } = useRaces(currentYear);
  const [selectedRaceId, setSelectedRaceId] = useState<number | null>(null);
  const { results, loading: resultsLoading } = useRaceResults(selectedRaceId);

  const [raceWinners, setRaceWinners] = useState<Map<number, any>>(new Map());

  // When we have race results, store the winner
  useEffect(() => {
    if (results && results.length > 0 && selectedRaceId) {
      const winner = results.find(r => r.position === 1);
      if (winner) {
        setRaceWinners(prev => new Map(prev).set(selectedRaceId, winner));
      }
    }
  }, [results, selectedRaceId]);

  if (racesLoading) {
    return (
      <article className="f1-results-page" role="main" aria-labelledby="results-page-title">
        <header className="results-header">
          <h1 id="results-page-title" className="results-title">Race Results</h1>
          <p className="results-subtitle">{new Date().getFullYear()} FIA Formula One World Championship</p>
        </header>
        <div style={{ textAlign: 'center', padding: '4rem', color: '#999' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🏎️</div>
          <p>Loading races...</p>
        </div>
      </article>
    );
  }

  // Get completed races
  const completedRaces = races?.filter(r => new Date(r.date) <= new Date()) || [];
  const totalRaces = races?.length || 0;

  return (
    <article className="f1-results-page" role="main" aria-labelledby="results-page-title">
      <header className="results-header">
        <h1 id="results-page-title" className="results-title">Race Results</h1>
        <p className="results-subtitle">{currentYear} FIA Formula One World Championship</p>
      </header>

      <section aria-labelledby="results-table-heading">
        <h2 id="results-table-heading" className="visually-hidden">{currentYear} Season Race Results</h2>
        <div className="results-table-container">
          <table className="results-table" aria-label="Formula 1 2025 season race results">
            <thead>
              <tr>
                <th scope="col">Round</th>
                <th scope="col">Grand Prix</th>
                <th scope="col">Date</th>
                <th scope="col">Circuit</th>
                <th scope="col">Winner</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {races?.map((race) => {
                const winner = raceWinners.get(race.id);
                const isPast = new Date(race.date) <= new Date();
                
                return (
                  <tr
                    key={race.id}
                    className={selectedRaceId === race.id ? 'selected' : ''}
                    onClick={() => {
                      if (isPast) {
                        setSelectedRaceId(selectedRaceId === race.id ? null : race.id);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    aria-pressed={selectedRaceId === race.id}
                    aria-label={`${race.name}. Click to ${selectedRaceId === race.id ? 'deselect' : 'view results'}.`}
                    style={{ cursor: isPast ? 'pointer' : 'default', opacity: isPast ? 1 : 0.6 }}
                    onKeyDown={(e) => {
                      if ((e.key === 'Enter' || e.key === ' ') && isPast) {
                        e.preventDefault();
                        setSelectedRaceId(selectedRaceId === race.id ? null : race.id);
                      }
                    }}
                  >
                    <td className="race-round">{race.round}</td>
                    <td>
                      <div className="race-name">
                        <span className="race-flag" role="img" aria-label={`${race.circuit.country_code} flag`}>
                          {countryFlags[race.circuit.country_code] || '🏁'}
                        </span>
                        <span>{race.name}</span>
                      </div>
                    </td>
                    <td className="race-date">
                      <time dateTime={race.date}>{formatDate(race.date)}</time>
                    </td>
                    <td className="circuit-name">{race.circuit.location}</td>
                    <td>
                      {winner ? (
                        <div className="winner-name">
                          <span 
                            className="team-dot" 
                            style={{ background: getTeamColor(winner.constructor_name) }}
                            role="img"
                            aria-label={`${winner.constructor_name} team color indicator`}
                          ></span>
                          <span>{winner.driver_name}</span>
                        </div>
                      ) : isPast ? (
                        <span style={{ color: '#999' }}>Click to load</span>
                      ) : (
                        <span style={{ color: '#666' }}>TBD</span>
                      )}
                    </td>
                    <td>
                      {isPast ? (
                        <span style={{ color: '#00ff00' }}>Completed</span>
                      ) : (
                        <span style={{ color: '#ff8700' }}>Upcoming</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Race Details Modal */}
        {selectedRaceId && results && (
          <div style={{ 
            marginTop: '2rem', 
            padding: '2rem', 
            background: '#1a1a1a', 
            borderRadius: '8px',
            border: '2px solid #e10600'
          }}>
            <h3 style={{ color: '#fff', marginBottom: '1.5rem' }}>
              Race Results - {races?.find(r => r.id === selectedRaceId)?.name}
            </h3>
            
            {resultsLoading ? (
              <p style={{ color: '#999', textAlign: 'center', padding: '2rem' }}>
                Loading results...
              </p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #333' }}>
                      <th style={{ padding: '1rem', textAlign: 'left', color: '#fff' }}>Pos</th>
                      <th style={{ padding: '1rem', textAlign: 'left', color: '#fff' }}>Driver</th>
                      <th style={{ padding: '1rem', textAlign: 'left', color: '#fff' }}>Team</th>
                      <th style={{ padding: '1rem', textAlign: 'center', color: '#fff' }}>Grid</th>
                      <th style={{ padding: '1rem', textAlign: 'left', color: '#fff' }}>Time</th>
                      <th style={{ padding: '1rem', textAlign: 'center', color: '#fff' }}>Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((result) => (
                      <tr 
                        key={`${result.driver_id}-${result.session_id}`}
                        style={{ 
                          borderBottom: '1px solid #2a2a2a',
                          background: result.position <= 3 ? 'rgba(225, 6, 0, 0.1)' : 'transparent'
                        }}
                      >
                        <td style={{ padding: '1rem', color: result.position <= 3 ? '#ff8700' : '#fff', fontWeight: 'bold' }}>
                          {result.position}
                        </td>
                        <td style={{ padding: '1rem', color: '#fff' }}>
                          <span style={{ fontWeight: 'bold' }}>{result.driver_code}</span>
                          {' '}
                          <span style={{ color: '#999' }}>{result.driver_name}</span>
                        </td>
                        <td style={{ padding: '1rem', color: '#999' }}>{result.constructor_name}</td>
                        <td style={{ padding: '1rem', textAlign: 'center', color: '#999' }}>{result.grid}</td>
                        <td style={{ padding: '1rem', color: '#fff' }}>
                          {result.time_ms ? formatTime(result.time_ms) : result.status}
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'center', color: '#ff8700', fontWeight: 'bold' }}>
                          {result.points}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </section>

      <aside className="results-stats" aria-labelledby="season-stats-heading">
        <h2 id="season-stats-heading" className="visually-hidden">Season Statistics Summary</h2>
        <article className="f1-stat-card" aria-labelledby="races-completed-stat">
          <div className="stat-number" id="races-completed-stat" aria-label={`${completedRaces.length} races completed`}>
            {completedRaces.length}
          </div>
          <div className="stat-label">Races Completed</div>
        </article>
        <article className="f1-stat-card" aria-labelledby="total-races-stat">
          <div className="stat-number" id="total-races-stat" aria-label={`${totalRaces} total races`}>
            {totalRaces}
          </div>
          <div className="stat-label">Total Races</div>
        </article>
        <article className="f1-stat-card" aria-labelledby="remaining-races-stat">
          <div className="stat-number" id="remaining-races-stat" aria-label={`${totalRaces - completedRaces.length} remaining races`}>
            {totalRaces - completedRaces.length}
          </div>
          <div className="stat-label">Remaining</div>
        </article>
      </aside>
    </article>
  );
};

export default F1ResultsPage;