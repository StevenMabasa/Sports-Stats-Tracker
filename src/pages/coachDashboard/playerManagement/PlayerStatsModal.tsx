// src/components/PlayerManagement/PlayerStatsModal.tsx

import React, { useRef, useState } from 'react';
import type { Player } from '../../../types';
import KeyStatCard from './KeyStatCard';
import StatsChart from './StatsChart';
import StatsTable from './StatsTable';
import { getPlayerKeyStats } from './stats-helper';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import './PlayerStatsModal.css';

interface Props {
  player: Player;
  onClose: () => void;
}

const PlayerStatsModal: React.FC<Props> = ({ player, onClose }) => {
  const modalContentRef = useRef<HTMLDivElement>(null);
  const { keyStats, chartStat } = getPlayerKeyStats(player);
  
  // State to provide user feedback during the export
  const [isExporting, setIsExporting] = useState(false);
  

  // Robust handleExportPdf function
   const handleExportPdf = async () => {
    const contentToCapture = modalContentRef.current;
    if (!contentToCapture) return;

    setIsExporting(true);

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageMargin = 15;
    const pdfWidth = pdf.internal.pageSize.getWidth() - (pageMargin * 2);
    const usablePageHeight = pdf.internal.pageSize.getHeight() - (pageMargin * 2);
    let yPosition = pageMargin;

    // Layout fix: Find the table to modify its style
    const statsTable = contentToCapture.querySelector<HTMLElement>('.stats-table');
    const originalColumns = statsTable ? statsTable.style.gridTemplateColumns : '';

    try {
      // Temporarily force a single-column layout for accurate capture
      if (statsTable) {
        statsTable.style.gridTemplateColumns = '1fr';
      }

      // Helper function to capture an element and add it to the PDF
      const addElementToPdf = async (element: HTMLElement) => {
        const canvas = await html2canvas(element, { scale: 2, backgroundColor: null });
        const imgData = canvas.toDataURL('image/png');
        const imgHeight = (canvas.height * pdfWidth) / canvas.width;

        if (yPosition + imgHeight > usablePageHeight + pageMargin) {
          pdf.addPage();
          yPosition = pageMargin;
        }

        pdf.addImage(imgData, 'PNG', pageMargin, yPosition, pdfWidth, imgHeight);
        yPosition += imgHeight;
      };

      // Process elements one by one
      const header = contentToCapture.querySelector<HTMLElement>('.modal-header');
      if (header) await addElementToPdf(header);
      
      const keyStatsGrid = contentToCapture.querySelector<HTMLElement>('.key-stats-grid');
      if (keyStatsGrid) { yPosition += 5; await addElementToPdf(keyStatsGrid); }
      
      const chart = contentToCapture.querySelector<HTMLElement>('.chart-container');
      if (chart) { yPosition += 5; await addElementToPdf(chart); }
      
      const fullStatsSection = contentToCapture.querySelector<HTMLElement>('.full-stats-section');
      if (fullStatsSection) {
        yPosition += 5;
        const sections = fullStatsSection.querySelectorAll<HTMLElement>('.stats-section');
        
        // Add the title first
        const title = fullStatsSection.querySelector<HTMLElement>('h3');
        if (title) await addElementToPdf(title);
        
        // Then add each stats section
        for (const section of Array.from(sections)) {
          await addElementToPdf(section);
          yPosition += 2; // Small spacing between sections
        }
      }

      pdf.save(`${player.name}_stats.pdf`);

    } finally {
      // Restore the original layout after capture is complete
      if (statsTable) {
        statsTable.style.gridTemplateColumns = originalColumns;
      }
      setIsExporting(false);
    }
  };
  console.log(player.stats)

  return (
    <section className="stats-modal-overlay" onClick={onClose}>
      <section className="stats-modal-content" ref={modalContentRef} onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>&times;</button>
        <header className="modal-header">
          <img src={player.imageUrl} alt={player.name} className="player-avatar" />
          <section className="player-info">
            <h1>{player.name}</h1>
            <p>{player.position} | #{player.jerseyNum}</p>
          </section>
          {/* Update button to show loading state */}
          <button 
            className="rs-btn export-btn" 
            onClick={handleExportPdf} 
            disabled={isExporting}
          >
            {isExporting ? 'Exporting...' : 'Export PDF'}
          </button>
        </header>
        
        <section className="key-stats-grid">
          {keyStats.map(stat => (
            <KeyStatCard key={stat.label} label={stat.label} value={stat.value} />
          ))}
        </section>
        
        <section className="rs-card chart-container">
          <h3>{chartStat.label} over Time</h3>
          <StatsChart data={player.stats.performanceData} />
        </section>

        {/* Updated to pass the entire player object */}
        <section className="rs-card full-stats-section">
          <h3>Full Statistics</h3>
          <StatsTable player={player} />
        </section>
      </section>
    </section>
  );
};

export default PlayerStatsModal;