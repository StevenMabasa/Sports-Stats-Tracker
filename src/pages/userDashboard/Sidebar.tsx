import React, { useState } from "react";
import "./Sidebar.css";
import { SiF1 } from "react-icons/si";
import { CiStar } from "react-icons/ci";
import { RiTeamLine } from "react-icons/ri";
import { SlPeople } from "react-icons/sl";
import { GrOverview } from "react-icons/gr";
import { GiSoccerBall } from "react-icons/gi";


type Tab = "overview" | "teams" | "players" | "matches" | "favorites"|"F1";
interface Props {
  activeTab: Tab;
  goToTab: (t: Tab) => void;
}

const tabIcons: Record<Tab, JSX.Element> = {
  overview: <GrOverview aria-label="overview icon"/>,
  teams: <RiTeamLine aria-label="teams icon"/>,
  players: <SlPeople aria-label="players icon"/>,
  matches: <GiSoccerBall />,
  favorites: <CiStar aria-label="favorites icon"/>,
  F1: <SiF1 aria-label="F1 Icon" />,
};

const Sidebar: React.FC<Props> = ({ activeTab, goToTab }) => {
  const [isOpen, setIsOpen] = useState(false);


  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };


  const handleNavigation = (tab: Tab) => {
    goToTab(tab);
    setIsOpen(false);
  };

  return (
    <>
      <header className="u-dashboard-header">
        <div className="u-header-content">
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
      </header>

      {isOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}

      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h3 className="sidebar-title">R&S Sports</h3>
          <button className="close-btn" onClick={toggleSidebar}>
            ×
          </button>
        </div>
        <nav className="sidebar-nav">
          {(["overview", "teams", "players", "matches", "favorites","F1"] as Tab[]).map(
            (t) => (
              <button
                key={t}

                className={activeTab === t ? "active" : ""}
                onClick={() => handleNavigation(t)}
              >
                <span className="nav-icon">{tabIcons[t]}</span>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            )
          )}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;