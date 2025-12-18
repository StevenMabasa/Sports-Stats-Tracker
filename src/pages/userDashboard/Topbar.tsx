// pages/userDashboard/Topbar.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../../../supabaseClient";
import "./Topbar.css";

interface Props { 
  username: string; 
  setUsername: (s:string)=>void; 
  onProfile: ()=>void; 
}

const Topbar: React.FC<Props> = ({ username, setUsername}) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div className="topbar">
      <input
        className="topbar-input"
        value={username}
        onChange={e => setUsername(e.target.value)}
      />
      <button className="topbar-logout-btn" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
};

export default Topbar;
