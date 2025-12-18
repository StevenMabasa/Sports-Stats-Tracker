import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import DashboardSidebar from "./DashboardSidebar";
import MyTeamTab from "./coachStatsPage/MyTeamTab";
// Updated import to use the correct name for clarity
import MatchesPage from "./matchManaging/MatchesPage";
import PlayerManagementPage from "./playerManagement/PlayerManagementPage";
import "../../Styles/coach-dashboard.css";
import { getCurrentTeamId, setCurrentTeamId } from "../../services/teamService";
import { fetchTeamByCoachId } from "../../services/teamService";
import supabase from "../../../supabaseClient";
import Profile from "./CoachProfile"

const CoachDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("myTeam");

  // Initialize activeTab from URL params or localStorage
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    const savedTab = localStorage.getItem('coach-dashboard-tab');
    
    if (tabFromUrl) {
      setActiveTab(tabFromUrl);
    } else if (savedTab) {
      setActiveTab(savedTab);
    }
  }, [searchParams]);

  // Update URL and localStorage when activeTab changes
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSearchParams({ tab });
    localStorage.setItem('coach-dashboard-tab', tab);
  };

  useEffect(() => {
    const ensureTeamForCoach = async () => {
      const teamId = getCurrentTeamId();
      if (teamId) return;

      const { data: { session } } = await supabase.auth.getSession();
      const coachUserId = session?.user?.id;
      if (!coachUserId) {
        navigate('/login');
        return;
      }

      const team = await fetchTeamByCoachId(coachUserId);
      if (team?.id) {
        setCurrentTeamId(team.id);
        return;
      }

      navigate('/team-setup');
    };

    ensureTeamForCoach();
  }, [navigate]);

  return (
    <section className="dashboard coach-dashboard">
      <DashboardSidebar onNavigate={handleTabChange} />
      <section className="dashboard-content">
        {activeTab === "myTeam" && (
          <MyTeamTab />
        )}
        {activeTab === "matches" && (
          <MatchesPage />
        )}
        {activeTab === "players" && (
          <PlayerManagementPage />
        )}
        {activeTab === "profile" && (
          <Profile />
        )}
      </section>
    </section>
  );
};

export default CoachDashboard;