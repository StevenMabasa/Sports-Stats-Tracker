import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchMatches } from "../../services/matchService";
import type { Match } from "../../types";
import type { UiTeam } from "./hooks/useDbData";
import Chat from "./Chat";

interface MatchDetailsPageProps {
  onBack: () => void;
  username: string;
  teams: UiTeam[];
}

const MatchDetailsPage: React.FC<MatchDetailsPageProps> = ({ onBack, username, teams }) => {
  const { id: matchId } = useParams<{ id: string }>();
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMatchData = async () => {
      if (!matchId) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch all matches and find the specific one
        const allMatches = await fetchMatches();
        const foundMatch = allMatches.find(m => m.id === matchId);
        
        if (!foundMatch) {
          setError('Match not found');
          return;
        }

        setMatch(foundMatch);

      } catch (err) {
        console.error('Error loading match data:', err);
        setError('Failed to load match data');
      } finally {
        setLoading(false);
      }
    };

    loadMatchData();
  }, [matchId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "40px", color: "var(--muted)" }}>
        <div>Loading match details...</div>
        <div style={{ fontSize: "14px", marginTop: "8px" }}>Please wait while we fetch the data</div>
      </div>
    );
  }

  if (error || !match) {
    return (
      <div style={{ textAlign: "center", padding: "20px", color: "var(--danger)" }}>
        <div style={{ fontWeight: "bold", marginBottom: "8px" }}>Error Loading Match</div>
        <div>{error || 'Match not found'}</div>
        <button 
          style={{ marginTop: "10px", padding: "8px 16px", backgroundColor: "var(--primary)", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
          onClick={onBack}
        >
          Back to Matches
        </button>
      </div>
    );
  }

  return (
    <div className="rs-card">
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <h2 style={{ margin: 0, color: "var(--text-primary)" }}>
            Match Details For {teams.find(t => t.id === match.teamId)?.name || `Team ${match.teamId}`}
          </h2>
          <div style={{ color: "var(--muted)", fontSize: "14px" }}>
            {formatDate(match.date)} at {formatTime(match.date)}
          </div>
        </div>
        <button 
          className="rs-btn ghost"
          onClick={onBack}
        >
          ← Back to Matches
        </button>
      </div>

      {/* Match Overview */}
      <div style={{ 
        marginBottom: "24px", 
        padding: "20px", 
        backgroundColor: "var(--bg)", 
        borderRadius: "8px",
        border: "1px solid var(--border-color)"
      }}>
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "1fr auto 1fr", 
          gap: "20px", 
          alignItems: "center",
          textAlign: "center"
        }}>
          {/* Home Team */}
          <div>
            <div style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "8px" }}>
              {teams.find(t => t.id === match.teamId)?.name || `Team ${match.teamId}`}
            </div>
            <div style={{ fontSize: "32px", fontWeight: "bold", color: "var(--primary)" }}>
              {match.teamScore}
            </div>
          </div>

          {/* VS */}
          <div style={{ fontSize: "24px", fontWeight: "bold", color: "var(--muted)" }}>
            vs
          </div>

          {/* Away Team */}
          <div>
            <div style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "8px" }}>
              {match.opponentName}
            </div>
            <div style={{ fontSize: "32px", fontWeight: "bold", color: "var(--primary)" }}>
              {match.opponentScore}
            </div>
          </div>
        </div>

        {/* Match Status */}
        <div style={{ 
          textAlign: "center", 
          marginTop: "16px", 
          padding: "8px 16px",
          backgroundColor: match.status === 'completed' ? 'var(--success-bg)' : 'var(--warning-bg)',
          color: match.status === 'completed' ? 'var(--success)' : 'var(--warning)',
          borderRadius: "20px",
          display: "inline-block",
          fontSize: "14px",
          fontWeight: "bold"
        }}>
          {match.status === 'completed' ? 'Match Finished' : 
           match.status === 'scheduled' ? 'Scheduled' : 'In Progress'}
        </div>
      </div>

      {/* Match Statistics */}
      <div style={{ marginBottom: "24px" }}>
        <h3 style={{ margin: "0 0 16px 0", fontSize: "18px" }}>Match Statistics</h3>
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", 
          gap: "16px" 
        }}>
          <div style={{ 
            padding: "16px", 
            backgroundColor: "var(--bg)", 
            borderRadius: "8px",
            textAlign: "center",
            border: "1px solid var(--border-color)"
          }}>
            <div style={{ fontSize: "24px", fontWeight: "bold", color: "var(--primary)" }}>
              {match.possession || 0}%
            </div>
            <div style={{ fontSize: "12px", color: "var(--muted)" }}>Possession</div>
          </div>
          
          <div style={{ 
            padding: "16px", 
            backgroundColor: "var(--bg)", 
            borderRadius: "8px",
            textAlign: "center",
            border: "1px solid var(--border-color)"
          }}>
            <div style={{ fontSize: "24px", fontWeight: "bold", color: "var(--primary)" }}>
              {match.shots || 0}
            </div>
            <div style={{ fontSize: "12px", color: "var(--muted)" }}>Shots</div>
          </div>
          
          <div style={{ 
            padding: "16px", 
            backgroundColor: "var(--bg)", 
            borderRadius: "8px",
            textAlign: "center",
            border: "1px solid var(--border-color)"
          }}>
            <div style={{ fontSize: "24px", fontWeight: "bold", color: "var(--primary)" }}>
              {match.shotsOnTarget || 0}
            </div>
            <div style={{ fontSize: "12px", color: "var(--muted)" }}>Shots on Target</div>
          </div>
          
          <div style={{ 
            padding: "16px", 
            backgroundColor: "var(--bg)", 
            borderRadius: "8px",
            textAlign: "center",
            border: "1px solid var(--border-color)"
          }}>
            <div style={{ fontSize: "24px", fontWeight: "bold", color: "var(--primary)" }}>
              {match.corners || 0}
            </div>
            <div style={{ fontSize: "12px", color: "var(--muted)" }}>Corners</div>
          </div>
          
          <div style={{ 
            padding: "16px", 
            backgroundColor: "var(--bg)", 
            borderRadius: "8px",
            textAlign: "center",
            border: "1px solid var(--border-color)"
          }}>
            <div style={{ fontSize: "24px", fontWeight: "bold", color: "var(--primary)" }}>
              {match.fouls || 0}
            </div>
            <div style={{ fontSize: "12px", color: "var(--muted)" }}>Fouls</div>
          </div>
          
          <div style={{ 
            padding: "16px", 
            backgroundColor: "var(--bg)", 
            borderRadius: "8px",
            textAlign: "center",
            border: "1px solid var(--border-color)"
          }}>
            <div style={{ fontSize: "24px", fontWeight: "bold", color: "var(--primary)" }}>
              {match.passes || 0}
            </div>
            <div style={{ fontSize: "12px", color: "var(--muted)" }}>Passes</div>
          </div>
        </div>
      </div>

      {/* Chat System */}
      <div style={{ marginTop: "32px" }}>
        <h3 style={{ margin: "0 0 16px 0", fontSize: "18px" }}>Match Chat</h3>
        <Chat matchId={matchId!} username={username} />
      </div>
    </div>
  );
};

export default MatchDetailsPage;
