// src/components/Matches/MatchesPage.tsx

import React, { useEffect, useState } from 'react';
import MatchDetailsModal from './MatchDetailsModal';
import './MatchesPage.css';
import supabase from '../../../../supabaseClient';
import InlineAlert from '../../components/InlineAlert';
import type {Team,Player,MatchEvent,Match} from '../../../types'
import MatchCard from '../../components/matchCard'; // Import the new MatchCard component
import { getCurrentTeamId, fetchTeamById } from '../../../services/teamService';
import { fetchTeamMatches, fetchMatchEvents} from '../../../services/matchService';
import { fetchPlayersWithStats } from '../../../services/playerService';

const MatchesPage: React.FC = () => {
  // Team resolution: replace with actual auth-bound team if available
  const currentTeamId = getCurrentTeamId();
  const [matches, setMatches] = useState<Match[]>([]);
  const [matchEvents, setMatchEvents] = useState<MatchEvent[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [opponentName, setOpponentName] = useState('');
  const [teamScore, setTeamScore] = useState('');
  const [opponentScore, setOpponentScore] = useState('');
  const [date, setDate] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // Load team data and other data from database
  useEffect(() => {
    const loadData = async () => {
      if (!currentTeamId) {
        setErrorMsg('No team found. Please set up your team first.');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // Fetch team details from database
        const teamData = await fetchTeamById(currentTeamId);
        if (teamData) {
          setCurrentTeam({ 
            id: teamData.id, 
            name: teamData.name, 
            coachId: teamData.coach_id || 'coach' 
          });
        }
        
        // Fetch matches using the service - no more hardcoded mapping
        const teamMatches = await fetchTeamMatches(currentTeamId);
        setMatches(teamMatches);

        // Fetch events for all matches
        const allEvents: MatchEvent[] = [];
        for (const match of teamMatches) {
          const matchEvents = await fetchMatchEvents(match.id);
          // Transform database records to MatchEvent interface
          const transformedEvents: MatchEvent[] = matchEvents.map(event => ({
            id: event.id,
            matchId: event.match_id,
            playerId: event.player_id,
            eventType: event.event_type,
            minute: event.minute,
          }));
          allEvents.push(...transformedEvents);
        }
        setMatchEvents(allEvents);

        // Fetch players with their stats from database
        const playersWithStats = await fetchPlayersWithStats(currentTeamId);
        setPlayers(playersWithStats);

        // Removed automatic success notification - only show for user operations

      } catch (error) {
        console.error('Error loading data:', error);
        setErrorMsg('We could not load your data. Please refresh or try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [currentTeamId]);

  const handleCreateMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!opponentName || !date || !currentTeam || !currentTeamId) return;
    const payload = {
      team_id: currentTeamId,
      opponent_name: opponentName,
      team_score: Number(teamScore) || 0,
      opponent_score: Number(opponentScore) || 0,
      date,
      status: 'completed',
    };
    const { data, error } = await supabase.from('matches').insert(payload).select().single();
    if (!error && data) {
      const saved: Match = {
        id: String(data.id),
        teamId: data.team_id,
        opponentName: data.opponent_name,
        teamScore: data.team_score ?? 0,
        opponentScore: data.opponent_score ?? 0,
        date: data.date,
        status: data.status,
        possession: data.possession ?? undefined,
        shots: data.shots ?? undefined,
        shotsOnTarget: data.shots_on_target ?? undefined,
      };
      setMatches(prev => [saved, ...prev]);
    } else if (error) {
      console.error('Failed to insert match:', error);
      setErrorMsg('We could not save your match. Please check your permissions and try again.');
    }
    setOpponentName('');
    setTeamScore('');
    setOpponentScore('');
    setDate('');
  };

  const handleUpdateTeamStats = async (matchId: string, stats: Partial<Match>) => {
    setMatches(prev => prev.map(m => m.id === matchId ? { ...m, ...stats } : m));
    const toDb: any = {};
    if (stats.possession !== undefined) toDb.possession = stats.possession;
    if (stats.shots !== undefined) toDb.shots = stats.shots;
    if (stats.shotsOnTarget !== undefined) toDb.shots_on_target = stats.shotsOnTarget;
    if ((stats as any).corners !== undefined) toDb.corners = (stats as any).corners;
    if ((stats as any).fouls !== undefined) toDb.fouls = (stats as any).fouls;
    if ((stats as any).offsides !== undefined) toDb.offsides = (stats as any).offsides;
    if ((stats as any).xg !== undefined) toDb.xg = (stats as any).xg;
    if ((stats as any).passes !== undefined) toDb.passes = (stats as any).passes;
    if ((stats as any).passAccuracy !== undefined) toDb.pass_accuracy = (stats as any).passAccuracy;
    if ((stats as any).tackles !== undefined) toDb.tackles = (stats as any).tackles;
    if ((stats as any).saves !== undefined) toDb.saves = (stats as any).saves;
    const { error } = await supabase.from('matches').update(toDb).eq('id', matchId);
    if (error) setErrorMsg('We could not update the match stats. Please try again.');
  };
  
  const handleAddPlayerEvent = async (_eventId: string, matchId: string, playerId: string, eventType: MatchEvent['eventType']) => {
    const payload = { match_id: matchId, player_id: playerId, event_type: eventType };
    const { data, error } = await supabase.from('match_events').insert(payload).select().single();
    if (!error && data) {
      const newEvent: MatchEvent = { id: String(data.id), matchId: String(data.match_id), playerId: String(data.player_id), eventType: data.event_type, minute: data.minute ?? undefined };
      setMatchEvents(prev => [...prev, newEvent]);
    } else if (error) {
      console.error('Failed to insert match event:', error);
      setErrorMsg('We could not log that event. Please try again.');
    }
  };
  
  const handleRemovePlayerEvent = async (eventId: string) => {
    setMatchEvents(prev => prev.filter(e => e.id !== eventId));
    const { error } = await supabase.from('match_events').delete().eq('id', eventId);
    if (error) {
      console.error('Failed to delete match event:', error);
      setErrorMsg('We could not remove that event. Please try again.');
    }
  };

  return (
    <main className="matches-container">
      <InlineAlert message={errorMsg} onClose={() => setErrorMsg(null)} />
      <section className="management-section">
        <h2 className="section-title">Match Center</h2>
        {/* The form for creating a new match remains the same */}
        <form onSubmit={handleCreateMatch} className="add-player-form">
          <h3>Log a New Match</h3>
          <input type="text" placeholder="Opponent Name" value={opponentName} onChange={e => setOpponentName(e.target.value)} required />
          <input type="date" value={date} onChange={e => setDate(e.target.value)} required />
          <div className="score-inputs">
            <input type="number" min="0"placeholder="Your Score" value={teamScore} onChange={e => setTeamScore(e.target.value)} />
            <input type="number" min="0" placeholder="Opponent Score" value={opponentScore} onChange={e => setOpponentScore(e.target.value)} />
          </div>
          <button type="submit">Create Match</button>
        </form>
        
        <div className="match-list">
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginBottom: 8, flexWrap: 'wrap' }}>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{ padding: 8, borderRadius: 8, border: '1px solid #e2e8f0' }}
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{ padding: 8, borderRadius: 8, border: '1px solid #e2e8f0' }}
            />
            <input
              type="text"
              placeholder="Search teams or dates"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ padding: 8, borderRadius: 8, border: '1px solid #e2e8f0' }}
            />
          </div>
          {isLoading ? (
            <p>Loading matches...</p>
          ) : matches.filter(m => {
            // text search
            const q = search.toLowerCase();
            const matchesText = !q || m.opponentName.toLowerCase().includes(q) || (m.date || '').includes(q);
            if (!matchesText) return false;

            // date range filter (inclusive)
            if (!startDate && !endDate) return true;
            const dStr = (m.date || '').slice(0, 10);
            if (!dStr) return false;
            // Compare as strings (YYYY-MM-DD) works lexicographically; fallback to Date if needed
            const afterStart = !startDate || dStr >= startDate;
            const beforeEnd = !endDate || dStr <= endDate;
            return afterStart && beforeEnd;
          }).map(match => (
            // We wrap the new MatchCard in a div to handle the click event
            <div key={match.id} onClick={() => setSelectedMatch(match)}>
              <MatchCard
                teamA={currentTeam?.name || 'Team'}
                teamB={match.opponentName}
                scoreA={match.teamScore}
                scoreB={match.opponentScore}
                date={match.date}
              />
            </div>
          ))}
        </div>
      </section>

      {/* The modal functionality remains unchanged */}
      {selectedMatch && currentTeam && currentTeamId && (
        <MatchDetailsModal 
          match={selectedMatch}
          players={players.filter(p => p.teamId === currentTeamId)}
          events={matchEvents.filter(e => e.matchId === selectedMatch.id)}
          onClose={() => setSelectedMatch(null)}
          onUpdateTeamStats={handleUpdateTeamStats}
          onAddPlayerEvent={handleAddPlayerEvent}
          onRemovePlayerEvent={handleRemovePlayerEvent}
        />
      )}
    </main>
  );
};

export default MatchesPage;