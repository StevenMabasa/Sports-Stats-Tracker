// src/components/Matches/MatchDetailsModal.tsx
import React, { useState, useEffect } from "react";
import type { Match, Player, MatchEvent } from "../../../types";
import AdvancedStatsForm from "./PlayerStatsForm/AdvancedStatsForm";
import { upsertPlayerStats } from "../../../services/matchService";
import { fetchPlayerStatsByMatch } from "../../../services/playerService";
import { updateMatch } from "../../../services/matchService";
import InlineAlert from "../../components/InlineAlert";
import "./MatchDetailsModal.css";

interface Props {
  match: Match;
  players: Player[];
  events: MatchEvent[];
  onClose: () => void;
  onUpdateTeamStats: (matchId: string, stats: Partial<Match>) => void;
  onAddPlayerEvent: (
    eventId: string,
    matchId: string,
    playerId: string,
    eventType: MatchEvent["eventType"]
  ) => void;
  onRemovePlayerEvent: (eventId: string) => void;
}

interface Notification {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  id: string;
}

const MatchDetailsModal: React.FC<Props> = ({
  match,
  players,
  onClose,
  onUpdateTeamStats,
}) => {
  const [selectedPlayerId, setSelectedPlayerId] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [basicStats, setBasicStats] = useState({
    goals: 0,
    assists: 0,
    yellowCards: 0,
    redCard: false
  });
  const [advancedStats, setAdvancedStats] = useState<Record<string, number>>({});

  // Load existing stats when a player is selected
  useEffect(() => {
    const loadExistingStats = async () => {
      if (!selectedPlayerId) {
        setBasicStats({
          goals: 0,
          assists: 0,
          yellowCards: 0,
          redCard: false
        });
        setAdvancedStats({});
        return;
      }

      try {
        const existingStats = await fetchPlayerStatsByMatch(selectedPlayerId);
        const matchStats = existingStats.find((stat: any) => stat.match_id === match.id);
        
        if (matchStats) {
          setBasicStats({
            goals: matchStats.goals || 0,
            assists: matchStats.assists || 0,
            yellowCards: matchStats.yellow_cards || 0,
            redCard: (matchStats.red_cards || 0) > 0
          });
          
          setAdvancedStats({
            // Common stats
            shots: matchStats.shots || 0,
            shotsOnTarget: matchStats.shots_on_target || 0,
            chancesCreated: matchStats.chances_created || 0,
            dribblesAttempted: matchStats.dribbles_attempted || 0,
            dribblesSuccessful: matchStats.dribbles_successful || 0,
            offsides: matchStats.offsides || 0,
            tackles: matchStats.tackles || 0,
            interceptions: matchStats.interceptions || 0,
            clearances: matchStats.clearances || 0,
            saves: matchStats.saves || 0,
            cleansheets: matchStats.clean_sheets || 0,
            savePercentage: matchStats.save_percentage || 0,
            passCompletion: matchStats.pass_completion || 0,
            minutesPlayed: matchStats.minutes_played || 0,
            // Position-specific stats
            passesSuccessful: matchStats.passes_successful || 0,
            passesAttempted: matchStats.passes_attempted || 0,
            goalsConceded: matchStats.goals_conceded || 0,
          });
        } else {
          setBasicStats({
            goals: 0,
            assists: 0,
            yellowCards: 0,
            redCard: false
          });
          setAdvancedStats({});
        }
      } catch (error) {
        console.error('Error loading existing stats:', error);
        setBasicStats({
          goals: 0,
          assists: 0,
          yellowCards: 0,
          redCard: false
        });
        setAdvancedStats({});
      }
    };

    loadExistingStats();
  }, [selectedPlayerId, match.id]);

  const addNotification = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { message, type, id }]);
    setTimeout(() => {
      removeNotification(id);
    }, 5000);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const normalizeStatsKeys = (raw: Record<string, number>) => {
    return {
      goals: raw.goals ?? raw.Goals ?? 0,
      assists: raw.assists ?? raw.Assists ?? 0,
      shots: raw.shots ?? raw.Shots ?? 0,
      shotsOnTarget: raw.shotsOnTarget ?? raw.ShotsOnTarget ?? 0,
      chancesCreated: raw.chancesCreated ?? raw.ChancesCreated ?? 0,
      dribblesAttempted: raw.dribblesAttempted ?? raw.DribblesAttempted ?? 0,
      dribblesSuccessful: raw.dribblesSuccessful ?? raw.DribblesSuccessful ?? 0,
      offsides: raw.offsides ?? raw.Offsides ?? 0,
      tackles: raw.tackles ?? raw.Tackles ?? 0,
      interceptions: raw.interceptions ?? raw.Interceptions ?? 0,
      clearances: raw.clearances ?? raw.Clearances ?? 0,
      saves: raw.saves ?? raw.Saves ?? 0,
      cleansheets: raw.cleansheets ?? raw.cleanSheets ?? raw.CleanSheets ?? 0,
      savePercentage: raw.savePercentage ?? raw.SavePercentage ?? 0,
      passCompletion: raw.passCompletion ?? raw.PassCompletion ?? 0,
      minutesPlayed: raw.minutesPlayed ?? raw.MinutesPlayed ?? 0,
      yellowCards: raw.yellowCards ?? raw.YellowCards ?? 0,
      redCards: raw.redCards ?? raw.RedCards ?? 0,
      // Position-specific stats
      passesSuccessful: raw.passesSuccessful ?? raw.PassesSuccessful ?? 0,
      passesAttempted: raw.passesAttempted ?? raw.PassesAttempted ?? 0,
      goalsConceded: raw.goalsConceded ?? raw.GoalsConceded ?? 0,
    };
  };

  const handleSaveAllPlayerStats = async () => {
    if (!selectedPlayerId) {
      addNotification('Please select a player first', 'warning');
      return;
    }

    try {
      setIsSaving(true);
      console.log('[MatchDetailsModal] Saving all player stats', { matchId: match.id, playerId: selectedPlayerId, basicStats, advancedStats });

      const combinedStats = normalizeStatsKeys({ ...advancedStats });

      const statsId = await upsertPlayerStats(match.id, selectedPlayerId, {
        goals: basicStats.goals || 0,
        assists: basicStats.assists || 0,
        yellow_cards: basicStats.yellowCards || 0,
        red_cards: basicStats.redCard ? 1 : 0,
        shots: combinedStats.shots || 0,
        shots_on_target: combinedStats.shotsOnTarget || 0,
        chances_created: combinedStats.chancesCreated || 0,
        dribbles_attempted: combinedStats.dribblesAttempted || 0,
        dribbles_successful: combinedStats.dribblesSuccessful || 0,
        offsides: combinedStats.offsides || 0,
        tackles: combinedStats.tackles || 0,
        interceptions: combinedStats.interceptions || 0,
        clearances: combinedStats.clearances || 0,
        saves: combinedStats.saves || 0,
        clean_sheets: combinedStats.cleansheets || 0,
        save_percentage: combinedStats.savePercentage || 0,
        pass_completion: combinedStats.passCompletion || 0,
        minutes_played: combinedStats.minutesPlayed || 0,
        // Position-specific stats
        passes_successful: combinedStats.passesSuccessful || 0,
        passes_attempted: combinedStats.passesAttempted || 0,
        goals_conceded: combinedStats.goalsConceded || 0,
      });

      if (!statsId) {
        throw new Error('Failed to save player stats');
      }

      console.log('[MatchDetailsModal] All player stats saved successfully', { statsId, matchId: match.id, playerId: selectedPlayerId });
      addNotification('Player stats saved successfully', 'success');
      
    } catch (error) {
      console.error('Error saving player stats:', error);
      addNotification('Failed to save player stats. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateTeamStats = async (matchId: string, stats: Partial<Match>) => {
    try {
      setIsSaving(true);
      
      const success = await updateMatch(matchId, {
        possession: stats.possession,
        shots: stats.shots,
        shots_on_target: stats.shotsOnTarget,
        corners: stats.corners,
        fouls: stats.fouls,
        offsides: stats.offsides,
        passes: stats.passes,
        pass_accuracy: stats.passAccuracy,
        tackles: stats.tackles,
        saves: stats.saves,
      });
      
      if (!success) {
        throw new Error('Failed to update team stats');
      }
      
      onUpdateTeamStats(matchId, stats);
      addNotification('Team stats updated successfully', 'success');
      
    } catch (error) {
      console.error('Error updating team stats:', error);
      addNotification('Failed to update team stats. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mdm-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="mdm-title">
      <article className="mdm-container" onClick={(e) => e.stopPropagation()}>
        <button 
          className="mdm-close-btn" 
          onClick={onClose}
          aria-label="Close match details modal"
        >
          &times;
        </button>

        <header className="mdm-header">
          <h2 id="mdm-title" className="mdm-title">Match Details</h2>
          <h3 className="mdm-subtitle">
            {players[0]?.teamId} vs {match.opponentName} ({match.teamScore} - {match.opponentScore})
          </h3>
        </header>

        <div className="mdm-notifications" role="status" aria-live="polite">
          {notifications.map(notification => (
            <InlineAlert
              key={notification.id}
              message={notification.message}
              type={notification.type}
              onClose={() => removeNotification(notification.id)}
            />
          ))}
        </div>

        {isSaving && (
          <div className="mdm-saving-indicator" role="status" aria-live="polite">
            Saving...
          </div>
        )}

        <section className="mdm-section" aria-labelledby="mdm-player-stats-heading">
          <h4 id="mdm-player-stats-heading" className="mdm-section-title">Player Statistics</h4>
          
          <div className="mdm-player-select-wrapper">
            <label htmlFor="mdm-player-select" className="mdm-label">Select Player</label>
            <select
              id="mdm-player-select"
              className="mdm-select"
              value={selectedPlayerId}
              onChange={(e) => setSelectedPlayerId(e.target.value)}
              aria-label="Select a player to record statistics"
            >
              <option value="">Choose a player...</option>
              {players.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (#{p.jerseyNum})
                </option>
              ))}
            </select>
          </div>

          {selectedPlayerId && (
            <div className="mdm-stats-container">
              <fieldset className="mdm-fieldset">
                <legend className="mdm-legend">Basic Statistics</legend>
                <div className="mdm-form-grid">
                  <div className="mdm-form-group">
                    <label htmlFor="mdm-goals" className="mdm-label">Goals</label>
                    <input
                      id="mdm-goals"
                      type="number"
                      min="0"
                      className="mdm-input"
                      value={basicStats.goals}
                      onChange={(e) => setBasicStats({...basicStats, goals: parseInt(e.target.value) || 0})}
                      aria-label="Number of goals scored"
                    />
                  </div>

                  <div className="mdm-form-group">
                    <label htmlFor="mdm-assists" className="mdm-label">Assists</label>
                    <input
                      id="mdm-assists"
                      type="number"
                      min="0"
                      className="mdm-input"
                      value={basicStats.assists}
                      onChange={(e) => setBasicStats({...basicStats, assists: parseInt(e.target.value) || 0})}
                      aria-label="Number of assists"
                    />
                  </div>

                  <div className="mdm-form-group">
                    <label htmlFor="mdm-yellow-cards" className="mdm-label">Yellow Cards</label>
                    <input
                      id="mdm-yellow-cards"
                      type="number"
                      min="0"
                      max="2"
                      className="mdm-input"
                      value={basicStats.yellowCards}
                      onChange={(e) => setBasicStats({...basicStats, yellowCards: parseInt(e.target.value) || 0})}
                      aria-label="Number of yellow cards received"
                    />
                  </div>

                  <div className="mdm-form-group mdm-checkbox-group">
                    <label htmlFor="mdm-red-card" className="mdm-label">Red Card</label>
                    <input
                      id="mdm-red-card"
                      type="checkbox"
                      className="mdm-checkbox"
                      checked={basicStats.redCard}
                      onChange={(e) => setBasicStats({...basicStats, redCard: e.target.checked})}
                      aria-label="Red card received"
                    />
                  </div>
                </div>
              </fieldset>

              <div className="mdm-advanced-stats-wrapper">
                <p className="mdm-legend">Advanced Statistics</p>
                <AdvancedStatsForm
                  player={players.find((p) => p.id === selectedPlayerId)!}
                  onSave={(_playerId, stats) => setAdvancedStats(stats)}
                  initialStats={advancedStats}
                />
              </div>

              <button 
                type="button"
                className="mdm-submit-btn"
                disabled={!selectedPlayerId || isSaving}
                onClick={handleSaveAllPlayerStats}
                aria-label="Save all player statistics"
              >
                {isSaving ? 'Saving...' : 'Save Player Stats'}
              </button>
            </div>
          )}
        </section>

        <section className="mdm-section" aria-labelledby="mdm-team-stats-heading">
          <h4 id="mdm-team-stats-heading" className="mdm-section-title">Team Statistics</h4>
          <form className="mdm-team-stats-form">
            <div className="mdm-form-grid">
              <div className="mdm-form-group">
                <label htmlFor="mdm-possession" className="mdm-label">Possession (%)</label>
                <input
                  id="mdm-possession"
                  type="number"
                  min="0"
                  max="100"
                  className="mdm-input"
                  defaultValue={match.possession}
                  onBlur={(e) => handleUpdateTeamStats(match.id, { possession: Number(e.target.value) })}
                  aria-label="Team possession percentage"
                />
              </div>

              <div className="mdm-form-group">
                <label htmlFor="mdm-total-shots" className="mdm-label">Total Shots</label>
                <input
                  id="mdm-total-shots"
                  type="number"
                  min="0"
                  className="mdm-input"
                  defaultValue={match.shots}
                  onBlur={(e) => handleUpdateTeamStats(match.id, { shots: Number(e.target.value) })}
                  aria-label="Total shots taken"
                />
              </div>

              <div className="mdm-form-group">
                <label htmlFor="mdm-shots-target" className="mdm-label">Shots on Target</label>
                <input
                  id="mdm-shots-target"
                  type="number"
                  min="0"
                  className="mdm-input"
                  defaultValue={match.shotsOnTarget}
                  onBlur={(e) => handleUpdateTeamStats(match.id, { shotsOnTarget: Number(e.target.value) })}
                  aria-label="Shots on target"
                />
              </div>

              <div className="mdm-form-group">
                <label htmlFor="mdm-corners" className="mdm-label">Corners</label>
                <input
                  id="mdm-corners"
                  type="number"
                  min="0"
                  className="mdm-input"
                  defaultValue={match.corners}
                  onBlur={(e) => handleUpdateTeamStats(match.id, { corners: Number(e.target.value) })}
                  aria-label="Corner kicks"
                />
              </div>

              <div className="mdm-form-group">
                <label htmlFor="mdm-fouls" className="mdm-label">Fouls</label>
                <input
                  id="mdm-fouls"
                  type="number"
                  min="0"
                  className="mdm-input"
                  defaultValue={match.fouls}
                  onBlur={(e) => handleUpdateTeamStats(match.id, { fouls: Number(e.target.value) })}
                  aria-label="Fouls committed"
                />
              </div>

              <div className="mdm-form-group">
                <label htmlFor="mdm-offsides" className="mdm-label">Offsides</label>
                <input
                  id="mdm-offsides"
                  type="number"
                  min="0"
                  className="mdm-input"
                  defaultValue={match.offsides}
                  onBlur={(e) => handleUpdateTeamStats(match.id, { offsides: Number(e.target.value) })}
                  aria-label="Offsides called"
                />
              </div>

              <div className="mdm-form-group">
                <label htmlFor="mdm-passes" className="mdm-label">Passes</label>
                <input
                  id="mdm-passes"
                  type="number"
                  min="0"
                  className="mdm-input"
                  defaultValue={match.passes}
                  onBlur={(e) => handleUpdateTeamStats(match.id, { passes: Number(e.target.value) })}
                  aria-label="Total passes"
                />
              </div>

              <div className="mdm-form-group">
                <label htmlFor="mdm-pass-accuracy" className="mdm-label">Pass Accuracy (%)</label>
                <input
                  id="mdm-pass-accuracy"
                  type="number"
                  min="0"
                  max="100"
                  className="mdm-input"
                  defaultValue={match.passAccuracy}
                  onBlur={(e) => handleUpdateTeamStats(match.id, { passAccuracy: Number(e.target.value) })}
                  aria-label="Pass accuracy percentage"
                />
              </div>

              <div className="mdm-form-group">
                <label htmlFor="mdm-tackles" className="mdm-label">Tackles</label>
                <input
                  id="mdm-tackles"
                  type="number"
                  min="0"
                  className="mdm-input"
                  defaultValue={match.tackles}
                  onBlur={(e) => handleUpdateTeamStats(match.id, { tackles: Number(e.target.value) })}
                  aria-label="Tackles made"
                />
              </div>

              <div className="mdm-form-group">
                <label htmlFor="mdm-saves" className="mdm-label">Saves</label>
                <input
                  id="mdm-saves"
                  type="number"
                  min="0"
                  className="mdm-input"
                  defaultValue={match.saves}
                  onBlur={(e) => handleUpdateTeamStats(match.id, { saves: Number(e.target.value) })}
                  aria-label="Goalkeeper saves"
                />
              </div>
            </div>
          </form>
        </section>
      </article>
    </div>
  );
};

export default MatchDetailsModal;