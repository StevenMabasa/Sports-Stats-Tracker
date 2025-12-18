import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import F1Sidebar from "./F1Sidebar";
import { F1DataProvider } from "./F1ApiBackend";
import { HiMenu, HiX } from "react-icons/hi";
import "./f1-theme.css";

const F1Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"drivers" | "teams" | "stats" | "f1Results">("drivers");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavigate = (tab: "drivers" | "teams" | "stats" | "f1Results") => {
    setActiveTab(tab);
    navigate(`/f1-dashboard/${tab}`);
    // Close mobile menu after navigation
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <F1DataProvider>
      <div className="f1-dashboard" role="region" aria-label="Formula 1 Statistics Dashboard">
        {/* Mobile Menu Toggle Button */}
        <button
          className="f1-mobile-toggle"
          onClick={toggleMobileMenu}
          aria-label="Toggle navigation menu"
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? <HiX /> : <HiMenu />}
        </button>

        {/* Mobile Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="f1-mobile-overlay" 
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />
        )}

        <F1Sidebar
          activeTab={activeTab}
          onNavigate={handleNavigate}
          isMobileMenuOpen={isMobileMenuOpen}
        />
        <main className="f1-main" role="main">
          <section className="f1-content" aria-live="polite">
            <Outlet />
          </section>
        </main>
      </div>
    </F1DataProvider>
  );
};

export default F1Dashboard;