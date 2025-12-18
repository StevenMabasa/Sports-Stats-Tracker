import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../../../supabaseClient";
import { IoPerson,IoLogOut,IoBarChartSharp } from "react-icons/io5";
import { GiSoccerBall,GiSoccerKick } from "react-icons/gi";
import './sidebar.css';

interface Props {
  onNavigate: (tab: string) => void;
}

const DashboardSidebar: React.FC<Props> = ({ onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleNavigation = (tab: string) => {
    onNavigate(tab);
    setIsOpen(false); // Close sidebar after navigation
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <>
      {/* Header Area with App Name */}
        <div className="header-content">
          <button
            className="hamburger-menu"
            onClick={toggleSidebar}
            aria-label="Toggle navigation menu"
          >
            <div className="hamburger-line"></div>
            <div className="hamburger-line"></div>
            <div className="hamburger-line"></div>
          </button>
        </div>

      {/* Overlay */}
      {isOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}

      {/* Sidebar */}
      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h3 className="sidebar-title">R&S Sports</h3>
          <button className="close-btn" onClick={toggleSidebar}>
            ×
          </button>
        </div>
        <nav className="sidebar-nav">
          <button onClick={() => handleNavigation("myTeam")}>
            <span className="nav-icon"><IoBarChartSharp/></span>
            Overview
          </button>
          <button onClick={() => handleNavigation("players")}>
            <span className="nav-icon"><GiSoccerKick/></span>
            Players
          </button>
          <button onClick={() => handleNavigation("matches")}>
            <span className="nav-icon"><GiSoccerBall /></span>
            Matches
          </button>
          <button onClick={() => handleNavigation("profile")}>
            <span className="nav-icon"><IoPerson /></span>
            Profile
          </button>

          {/* Logout button moved here */}
          <button className="logout-btn" onClick={handleLogout}>
            <span className="nav-icon"><IoLogOut /></span>
            Logout
          </button>
        </nav>
      </aside>
    </>
  );
};

export default DashboardSidebar;