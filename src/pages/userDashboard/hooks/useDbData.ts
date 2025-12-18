import { useEffect, useMemo, useState } from "react";
import { fetchMatches } from "../../../services/matchService.ts";
import { fetchPlayers, fetchAggregatedStatsForPlayers } from "../../../services/playerService.ts";
import { fetchTeamById } from "../../../services/teamService.ts";

export interface UiTeam { id: string; name: string; isFavorite?: boolean; }
export interface UiPlayer { id: string; name: string; teamId: string; position: string; stats: { goals: number; assists: number; minutesPlayed: number }; }
export interface UiMatch { id: string; homeTeamId: string; awayTeamId: string; homeScore: number; awayScore: number; date: string; status: "confirmed" | "pending" | "finished"; }

// Map DB -> UI types minimally so dashboard can stay modular
export function useDbData() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [teams, setTeams] = useState<UiTeam[]>([]);
  const [players, setPlayers] = useState<UiPlayer[]>([]);
  const [matches, setMatches] = useState<UiMatch[]>([]);

  // Debug function to test data fetching
  const debugData = () => {
    console.log('=== DEBUG DATA ===');
    console.log('Loading:', loading);
    console.log('Error:', error);
    console.log('Teams count:', teams.length);
    console.log('Players count:', players.length);
    console.log('Matches count:', matches.length);
    console.log('Sample teams:', teams.slice(0, 3));
    console.log('Sample matches:', matches.slice(0, 3));
    console.log('==================');
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        console.log('Starting data fetch...');
        const [dbMatches, dbPlayers] = await Promise.all([
          fetchMatches(),
          fetchPlayers(),
        ]);

        console.log('Raw data fetched:', { dbMatches, dbPlayers });

        // gather teams referenced by matches and players
        const teamIds = new Set<string>();
        dbPlayers.forEach(p => teamIds.add(p.team_id));
        dbMatches.forEach(m => teamIds.add(m.teamId));

        const uniqueIds = Array.from(teamIds);
        console.log('Team IDs to fetch:', uniqueIds);
        
        const teamResults = await Promise.all(uniqueIds.map(id => fetchTeamById(id)));
        const uiTeamsMap = new Map<string, UiTeam>();
        teamResults.filter(Boolean).forEach(t => { uiTeamsMap.set(t!.id, { id: t!.id, name: t!.name }); });

        // Aggregate real player stats for dashboard display
        const aggregatedStats = await fetchAggregatedStatsForPlayers(dbPlayers.map(p => p.id));
        const uiPlayers: UiPlayer[] = dbPlayers.map(p => ({
          id: p.id,
          name: p.name,
          teamId: p.team_id,
          position: p.position ?? "",
          stats: {
            goals: aggregatedStats[p.id]?.goals ?? 0,
            assists: aggregatedStats[p.id]?.assists ?? 0,
            minutesPlayed: aggregatedStats[p.id]?.minutesPlayed ?? 0
          },
        }));

        // Map matches where "team" is the home team and opponent is away
        const uiMatches: UiMatch[] = dbMatches.map(m => ({
          id: m.id,
          homeTeamId: m.teamId,
          awayTeamId: `opponent:${m.opponentName}`,
          homeScore: m.teamScore,
          awayScore: m.opponentScore,
          date: m.date,
          status: m.status === 'completed' ? 'finished' : m.status === 'scheduled' ? 'confirmed' : 'pending',
        }));

        // Create pseudo teams for opponents so UI can resolve names
        dbMatches.forEach(m => {
          const oppId = `opponent:${m.opponentName}`;
          if (!uiTeamsMap.has(oppId)) {
            uiTeamsMap.set(oppId, { id: oppId, name: m.opponentName });
          }
        });

        // Log data for debugging
        console.log('Fetched data:', {
          matchesCount: dbMatches.length,
          playersCount: dbPlayers.length,
          teamsCount: uiTeamsMap.size,
          sampleMatch: dbMatches[0],
          samplePlayer: dbPlayers[0]
        });

        const uiTeams = Array.from(uiTeamsMap.values());

        if (!mounted) return;
        setTeams(uiTeams);
        setPlayers(uiPlayers);
        setMatches(uiMatches);
        
        // Debug after state update
        setTimeout(() => debugData(), 100);
      } catch (e: any) {
        if (!mounted) return;
        console.error('useDbData error:', e);
        setError(e?.message || 'Failed to load data. Please check your connection and try again.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const derived = useMemo(() => ({ teams, players, matches }), [teams, players, matches]);
  return { ...derived, loading, error, debugData };
}


