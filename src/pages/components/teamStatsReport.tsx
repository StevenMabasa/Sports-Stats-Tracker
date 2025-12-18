// src/components/TeamStatsReport.tsx

import React, { useRef, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import StatCard from "../coachDashboard/coachStatsPage/StatCard";
import TeamFormGuide from "../coachDashboard/coachStatsPage/TeamFormGuide";
import BarChart from "../coachDashboard/coachStatsPage/Charts/BarChart";
import PiChart from "../coachDashboard/coachStatsPage/Charts/PiChart";
import type { Match, Player } from "../../types";
import "./TeamStatsReport.css";

interface Props {
  team: { id: string; name: string };
  matches: Match[];
  stats: any;
  players?: Player[];
  selectedPlayer?: Player | null;
  onPlayerSelect?: (playerId: string) => void;
  showPlayerSelector?: boolean;
  showBackButton?: boolean;
  onBack?: () => void;
  startDate: string;
  endDate: string;
  setStartDate: (date: string) => void;
  setEndDate: (date: string) => void;
  totalInterceptions: number;
  totalClearances: number;
  totalYellowCards: number;
  totalRedCards: number;
}

const TeamStatsReport: React.FC<Props> = ({
  team,
  stats,
  players = [],
  selectedPlayer,
  onPlayerSelect,
  showPlayerSelector = false,
  showBackButton = false,
  onBack,
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  totalInterceptions,
  totalClearances,
  totalYellowCards,
  totalRedCards,
}) => {
  const reportRef = useRef<HTMLElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Early return if stats is null or undefined
  const noStats = !stats;

  const handleExportPdf = async () => {
    if (!reportRef.current) return;
    setIsExporting(true);
    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const pageMargin = 15;
      const pdfWidth = pdf.internal.pageSize.getWidth() - pageMargin * 2;
      let yPosition = pageMargin;

      const addElementToPdf = async (element: HTMLElement) => {
        const canvas = await html2canvas(element, { scale: 2 });
        const imgData = canvas.toDataURL("image/png");
        const imgHeight = (canvas.height * pdfWidth) / canvas.width;

        if (yPosition + imgHeight > pdf.internal.pageSize.getHeight() - pageMargin) {
          pdf.addPage();
          yPosition = pageMargin;
        }

        pdf.addImage(imgData, "PNG", pageMargin, yPosition, pdfWidth, imgHeight);
        yPosition += imgHeight + 5;
      };

      const elementsToCapture = reportRef.current.querySelectorAll<HTMLElement>(".pdf-capture");

      for (const element of Array.from(elementsToCapture)) {
        await addElementToPdf(element);
      }

      pdf.save(`${team?.name || "Team"}_Season_Report.pdf`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <main className="team-stats-container">
      
<header className="stats-header" aria-label="Team Stats header section">
  <div className="main-bar">
    <section className="team-section">
      {showBackButton && (
        <button className="menu-btn" onClick={onBack}>
          ←
        </button>
      )}
      <div className="team-info">
        <h1>{team.name}</h1>
  <p>Performance Report · Based on {stats?.totalMatches || 0} matches</p>
      </div>
    </section>

    <nav className="header-controls">
      {showPlayerSelector && (
        <div className="player-selector">
          <select
            id="player-select"
            className="player-dropdown"
            onChange={(e) => onPlayerSelect?.(e.target.value)}
            value={selectedPlayer?.id || ""}
          >
            <option value="">Select a player...</option>
            {players.map((player) => (
              <option key={player.id} value={player.id}>
                {player.name} - {player.position}
              </option>
            ))}
          </select>
        </div>
      )}

      <button
        className="CoachBtn export-btn"
        onClick={handleExportPdf}
        disabled={isExporting || noStats}
        aria-disabled={isExporting || noStats}
        title={noStats ? 'No data to export' : undefined}
      >
        {isExporting ? 'Exporting...' : 'Export as PDF'}
      </button>
    </nav>
  </div>

  <div className="info-bar">
      <div className="info-item">
      <span className="info-label">Recent Form (Last 5):</span>
      <TeamFormGuide form={stats?.form || []} />
    </div>
  </div>
</header>

      <section className="filter-by-date" aria-label="Filter By date section">
        <label htmlFor="start-date" aria-label="Start date input">
          From
        </label>
        <input type="date" id="start-date" name="start-date" value={startDate} onChange={e => setStartDate(e.target.value)} />

        <label htmlFor="end-date">To</label>
        <input type="date" id="end-date" name="end-date" aria-label="End date input" value={endDate} onChange={e => setEndDate(e.target.value)} />
      </section>

      <article ref={reportRef} className={isExporting ? "pdf-mode" : ""}>
        {noStats && (
          <section className="no-stats-message pdf-capture" aria-live="polite">
            <h2>No statistics found</h2>
            <p>
              There are no team statistics for the selected date range. Try adjusting the "From" and
              "To" dates to expand your search.
            </p>
            <div className="no-stats-actions">
              <button className="CoachBtn" onClick={() => { setStartDate(''); setEndDate(''); }}>
                Reset dates
              </button>
            </div>
          </section>
        )}
  <section className="pef-sec">
    <h2>Team Performance Averages</h2>
    <ul>
      <StatCard label="Matches Played" value={stats?.totalMatches || 0} />
      <StatCard label="Possession" value={stats?.avgPossession || 0} />
      <StatCard label="Shots" value={stats?.avgShots || 0} />
      <StatCard label="Shots on Target" value={stats?.avgShotsOnTarget || 0} />
      <StatCard label="Fouls" value={stats?.avgFouls || 0} />
      <StatCard label="Corners" value={stats?.avgCorners || 0} />
      <StatCard label="Passes" value={stats?.avgPasses || 0} />
      <StatCard label="Pass Accuracy" value={`${stats?.avgPassAccuracy || 0}%`} />
      <StatCard label="Tackles" value={stats?.avgTackles || 0} />
      <StatCard label="Saves" value={stats?.avgSaves || 0} />
    </ul>
  </section>

  <section className="gen-stats-sec pdf-capture">
    <h2>General</h2>
    <section className="gen-team-stats">
      <BarChart
        title="Goals"
        label={["Goals For", "Goals Against", "Goal Difference"]}
        values={[stats?.goalsFor || 0, stats?.goalsAgainst || 0, stats?.goalDifference || 0]}
      />
      <PiChart
        title="Results %"
        label={["Win%", "Loss/Draw%"]}
        values={[stats?.winPercentage || 0, 100 - (stats?.winPercentage || 0)]}
      />
      <PiChart
        title="Results"
        label={["Wins", "Losses", "Draws"]}
        values={[stats?.wins || 0, stats?.losses || 0, stats?.draws || 0]}
      />
    </section>
  </section>

  <section className="def-att">
    <section className="rep-stats-sec pdf-capture">
      <h2>Attacking</h2>
      <section className="att-team-stats">
        <BarChart
          title="Shooting"
          label={["Shots", "Shots on Target", "Goals"]}
          values={[stats?.totalShots || 0, stats?.totalShotsOnTarget || 0, stats?.goalsFor || 0]}
        />
        <PiChart
          title="Passing"
          label={["Successful Passes", "Unsuccessful Passes"]}
          values={[
              Number(stats?.avgPassAccuracy) || 0,
              100 - (Number(stats?.avgPassAccuracy) || 0),
          ]}
        />
      </section>
    </section>

    <section className="rep-stats-sec pdf-capture">
      <h2>Defending</h2>
      <section className="att-team-stats">
        <BarChart
          title="General"
          label={["Tackles", "Interceptions", "Clearances"]}
          values={[stats?.totalTackles || 0, totalInterceptions, totalClearances]}
        />
        <BarChart
          title="Discipline"
          label={["Fouls", "Yellow Cards", "Red Cards"]}
            values={[stats?.totalFouls || 0, totalYellowCards, totalRedCards]}
        />
      </section>
    </section>
  </section>
</article>

    </main>
  );
};

export default TeamStatsReport;
