import React, { useState, useEffect } from "react";
import type { Player } from "../../../../types";
import GKStatsForm from "./GKStatsForm";
import MidStatsForm from "./MidStatsForm";
import StrStatsForm from "./StrStatsForm";
import DefStatsForm from "./DefStatsForm";
import "./PlayerStatsForm.css";

interface Props {
  player: Player;
  onSave: (playerId: string, stats: Record<string, number>) => void;
  initialStats?: Record<string, number>; 
}

const AdvancedStatsForm: React.FC<Props> = ({ player, onSave, initialStats }) => {
  const [stats, setStats] = useState<Record<string, number>>(initialStats || {});

  useEffect(() => {
    setStats(initialStats || {});
  }, [initialStats]);

  const handleSave = (data: Record<string, number>) => {
    setStats(data);
    onSave(player.id, data);
  };

  let form = null;
  if (player.position === "GK")
    form = <GKStatsForm onSave={handleSave} initialStats={stats} />;
  else if (["CAM", "CDM", "CM", "LM", "RM"].includes(player.position))
    form = <MidStatsForm onSave={handleSave} initialStats={stats} />;
  else if (["CF", "ST", "LW", "RW"].includes(player.position))
    form = <StrStatsForm onSave={handleSave} initialStats={stats} />;
  else if (["LWB", "RWB", "CB", "RB", "LB"].includes(player.position))
    form = <DefStatsForm onSave={handleSave} initialStats={stats} />;

  return (
    <div className="stats-form">
      <h5>
        Advanced Stats for {player.name} ({player.position})
      </h5>
      {form}
    </div>
  );
};

export default AdvancedStatsForm;
