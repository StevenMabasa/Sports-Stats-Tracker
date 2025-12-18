import React from "react";
import { Link } from "react-router-dom";
import { SlPeople } from "react-icons/sl";
import { GiF1Car } from "react-icons/gi"
import { IoIosStats } from "react-icons/io";
import { CiTrophy } from "react-icons/ci";

interface Props {
  activeTab: "drivers" | "teams" | "stats"|"f1Results";
  onNavigate: (tab: "drivers" | "teams" | "stats"|"f1Results") => void;
  isMobileMenuOpen?: boolean;
  onCloseMobileMenu?: () => void;
}

const F1Sidebar: React.FC<Props> = ({ activeTab, onNavigate, isMobileMenuOpen = false }) => {
  return (
    <nav 
      className={`f1-sidebar ${isMobileMenuOpen ? 'f1-sidebar--mobile-open' : ''}`} 
      aria-label="Formula 1 section navigation"
    >
      <h1 className="f1-logo">F1 Tracker</h1>
      <ul className="f1-nav-list" role="menu">
        <li role="menuitem">
          <button
            className={activeTab === "drivers" ? "active" : ""}
            aria-current={activeTab === "drivers" ? "page" : undefined}
            onClick={() => onNavigate("drivers")}
          >
            <SlPeople /> Drivers
          </button>
        </li>
        <li role="menuitem">
          <button
            className={activeTab === "teams" ? "active" : ""}
            aria-current={activeTab === "teams" ? "page" : undefined}
            onClick={() => onNavigate("teams")}
          >
            <GiF1Car /> Teams
          </button>
        </li>
        <li role="menuitem">
          <button
            className={activeTab === "stats" ? "active" : ""}
            aria-current={activeTab === "stats" ? "page" : undefined}
            onClick={() => onNavigate("stats")}
          >
            <IoIosStats /> Stats
          </button>
        </li>
        <li role="menuitem">
          <button
            className={activeTab === "f1Results" ? "active" : ""}
            aria-current={activeTab === "f1Results" ? "page" : undefined}
            onClick={() => onNavigate("f1Results")}
          >
            <CiTrophy />Results
          </button>
        </li>
      </ul>
      <hr aria-hidden="true" />
      <Link to="/user-dashboard" className="f1-back" aria-label="Return to football dashboard">
        ← Back to Football
      </Link>
    </nav>
  );
};

export default F1Sidebar;
