// pages/userDashboard/RedesignedDashboard.tsx
import React, { useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Topbar from "./Topbar.tsx";
import Sidebar from "./Sidebar.tsx";
import StatsCards from "./StatsCards.tsx";
import MatchesList from "./MatchList.tsx";
import TeamsList from "./TeamsList";
import PlayersList from "./PlayersList";
import { useFavoriteTeams } from "./hooks/useFavorites.ts";
import PlayerDetails from "./PlayerDetails.tsx";
import MatchDetailsPage from "./MatchDetailsPage.tsx";
// Types kept for reference; UI types are derived via useDbData
import { useLocalStorage } from "./hooks/useLocalStorage.ts";
import { useDbData } from "./hooks/useDbData.ts";
import "../../Styles/user-dashboard.css";


const USERNAME_KEY = "rs_dashboard_username_v2";
type Tab = "overview"|"teams"|"players"|"matches"|"favorites"|"F1";

const RedesignedDashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { teams, players, matches, loading, error, debugData } = useDbData();
  const { favoriteTeamIds, isFavorite, toggleFavorite, loading: favoritesLoading } = useFavoriteTeams();

  // Enhanced toggle favorite with notification
  const handleToggleFavorite = async (teamId: string) => {
    try {
      await toggleFavorite(teamId);
      const team = teams.find(t => t.id === teamId);
      const isNowFavorite = !favoriteTeamIds.includes(teamId);
      setNotification({
        message: `${team?.name || 'Team'} ${isNowFavorite ? 'added to' : 'removed from'} favorites`,
        type: 'success'
      });
      // Clear notification after 3 seconds
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      setNotification({
        message: 'Failed to update favorites',
        type: 'error'
      });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const [activeTab, setActiveTab] = useState<"overview"|"teams"|"players"|"matches"|"favorites"|"F1">("overview");
  const [selectedMatchId, setSelectedMatchId] = useState<string|null>(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string|null>(null);
  const [query, setQuery] = useState("");
  const [username, setUsername] = useLocalStorage(USERNAME_KEY, "Fan");
  const [notification, setNotification] = useState<{message: string; type: 'success' | 'error'} | null>(null);

  // Check environment variables
  const envCheck = useMemo(() => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    return {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseKey,
      isConfigured: !!supabaseUrl && !!supabaseKey
    };
  }, []);

  const filteredMatches = useMemo(()=> {
    if (!query.trim()) return matches;
    const q = query.toLowerCase();
    return matches.filter(m=>{
      const home = teams.find(t => t.id === m.homeTeamId)?.name.toLowerCase() || "";
      const away = teams.find(t => t.id === m.awayTeamId)?.name.toLowerCase() || "";
      return home.includes(q) || away.includes(q) || m.date.includes(q);
    });
  }, [query, matches, teams]);

  const recentMatches = useMemo(()=> matches.slice(0, 5), [matches]);

  // sync tab and selected match/player with URL
  React.useEffect(() => {
    const path = location.pathname.replace(/^\//, "");
    const [segment, maybeId] = path.split("/");
    if (segment === "overview" || segment === "teams" || segment === "players" || segment === "matches" || segment === "favorites") {
      setActiveTab(segment as Tab);
    } else if (segment === "user-dashboard" || segment === "") {
      setActiveTab("overview");
    }
    if (segment === "matches" && maybeId) {
      setSelectedMatchId(maybeId);
      setSelectedPlayerId(null);
    } else if (segment === "players" && maybeId) {
      setSelectedPlayerId(maybeId);
      setSelectedMatchId(null);
    } else if (segment !== "matches" && segment !== "players") {
      setSelectedMatchId(null);
      setSelectedPlayerId(null);
    }
  }, [location.pathname]);

  const selectedMatch = selectedMatchId ? matches.find(m => m.id === selectedMatchId) || null : null;

  // Handle navigation including F1 dashboard
  const handleTabNavigation = (t: Tab) => {
    if (t === "F1") {
      navigate("/f1-dashboard/drivers");
    } else {
      setActiveTab(t);
      navigate(t === "overview" ? "/user-dashboard" : `/${t}`);
      setSelectedMatchId(null);
    }
  };

  return (
    <div className="rs-dashboard">
     
      <div className="rs-container">
        <aside className="rs-sidebar">
          <Sidebar activeTab={activeTab} goToTab={handleTabNavigation} />
            <Topbar username={username} setUsername={setUsername} onProfile={()=>navigate("/profile-settings")} />
        </aside>
           
       
        <main className="rs-main">
          {/* Notification */}
          {notification && (
            <div style={{
              position: 'fixed',
              top: '20px',
              right: '20px',
              padding: '12px 20px',
              borderRadius: '8px',
              backgroundColor: notification.type === 'success' ? '#4caf50' : '#f44336',
              color: 'white',
              zIndex: 1000,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              animation: 'slideIn 0.3s ease-out'
            }}>
              {notification.message}
            </div>
          )}
          <div className="contentContainer">
            {loading && (
              <div style={{textAlign: "center", padding: "40px", color:"var(--muted)"}}>
                <div>Loading matches and teams...</div>
                <div style={{fontSize: "14px", marginTop: "8px"}}>Please wait while we fetch your data</div>
              </div>
            )}
            {error && (
              <div style={{textAlign: "center", padding: "20px", color:"var(--danger)", backgroundColor: "var(--danger-bg)", borderRadius: "8px", margin: "10px 0"}}>
                <div style={{fontWeight: "bold", marginBottom: "8px"}}>Error Loading Data</div>
                <div>{error}</div>
                {!envCheck.isConfigured && (
                  <div style={{marginTop: "10px", padding: "10px", backgroundColor: "rgba(255,255,255,0.1)", borderRadius: "4px", fontSize: "14px"}}>
                    <div style={{fontWeight: "bold", marginBottom: "5px"}}>Configuration Issue:</div>
                    <div>Missing Supabase credentials. Please check your .env file.</div>
                    <div>Required: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY</div>
                  </div>
                )}
                <div style={{marginTop: "10px", display: "flex", gap: "10px", justifyContent: "center"}}>
                  <button 
                    style={{padding: "8px 16px", backgroundColor: "var(--primary)", color: "white", border: "none", borderRadius: "4px", cursor: "pointer"}}
                    onClick={() => window.location.reload()}
                  >
                    Retry
                  </button>
                  <button 
                    style={{padding: "8px 16px", backgroundColor: "var(--secondary)", color: "white", border: "none", borderRadius: "4px", cursor: "pointer"}}
                    onClick={() => debugData()}
                  >
                    Debug Data
                  </button>
                </div>
              </div>
            )}
            {!loading && !error && activeTab === "overview" && (
              <>
                <StatsCards teams={teams.length} players={players.length} matches={matches.length} playersWithStats={players} />
                <MatchesList 
                  matches={query.trim() ? filteredMatches.slice(0, 5) : recentMatches} 
                  teams={teams} 
                  query={query} 
                  setQuery={setQuery} 
                  onOpen={(id)=>{ setSelectedMatchId(id); navigate(`/matches/${id}`); setActiveTab("matches"); }} 
                />
              </>
            )}
            {!loading && !error && activeTab === "matches" && (
              <>
                {selectedMatch ? (
                  <MatchDetailsPage onBack={() => { setSelectedMatchId(null); navigate("/matches"); }} username={username} teams={teams} />
                ) : (
                  <MatchesList matches={filteredMatches} teams={teams} query={query} setQuery={setQuery} onOpen={(id)=>{ setSelectedMatchId(id); navigate(`/matches/${id}`); }} />
                )}
              </>
            )}
            {!loading && !error && activeTab === "teams" && (
              <TeamsList 
                teams={teams} 
                isFavorite={isFavorite}
                toggleFavorite={handleToggleFavorite}
                loading={favoritesLoading}
              />
            )}
            {!loading && !error && activeTab === "players" && (
              <>
                {selectedPlayerId ? (
                  <PlayerDetails onBack={() => setSelectedPlayerId(null)} />
                ) : (
                  <PlayersList players={players} teams={teams} />
                )}
              </>
            )}
            {!loading && !error && activeTab === "favorites" && (
              <>
                {favoritesLoading && <div style={{color:"var(--muted)"}}>Loading favorites...</div>}
                <TeamsList 
                  key={`favorites-${favoriteTeamIds.length}`}
                  teams={teams.filter(t => favoriteTeamIds.includes(t.id))} 
                  isFavorite={isFavorite}
                  toggleFavorite={handleToggleFavorite}
                  loading={favoritesLoading}
                />
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default RedesignedDashboard;