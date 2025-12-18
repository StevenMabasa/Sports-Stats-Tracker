import React, { useState, useEffect } from 'react';
import { createTeam, slugify, fetchTeamById } from '../services/teamService';
import { useNavigate} from 'react-router-dom';
import supabase from '../../supabaseClient';
import InlineAlert from './components/InlineAlert';

const TeamSetup: React.FC = () => {
  const [teamName, setTeamName] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
      } else {
        navigate('/login');
      }
    };
    getCurrentUser();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim() || !userId) return;
    
    setSaving(true);
    // pre-check: if a team with the same slug already exists, show a clearer message
    try {
      const slug = slugify(teamName.trim());
      const existing = await fetchTeamById(slug);
      if (existing) {
        setSaving(false);
        setErrorMsg('A team with that name already exists. Please choose a different name.');
        return;
      }

      const team = await createTeam(teamName.trim(), logoFile, userId);
      setSaving(false);

      if (team) {
        setErrorMsg(null);
        navigate('/coach-dashboard?tab=players');
      } else {
        setErrorMsg('We could not create your team right now. Please check your internet and try again.');
      }
    } catch (err) {
      setSaving(false);
      console.error('Error creating team:', err);
      setErrorMsg('We could not create your team right now. Please check your internet and try again.');
    }
  };

  if (!userId) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '1.2rem',
        color: '#666'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <main className="auth-container" style={{ maxWidth: 520, margin: '40px auto' }}>
      <h2>Create your team</h2>
      <InlineAlert message={errorMsg} onClose={() => setErrorMsg(null)} type="error" />
      <form onSubmit={handleSubmit} className="add-player-form">
        <label style={{ fontWeight: 600, marginBottom: 4 }}>Enter team name</label>
        <input
          type="text"
          placeholder="e.g. Orlando Pirates FC"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          required
        />
        <label style={{ fontWeight: 600, margin: '12px 0 4px' }}>Upload team logo (optional)</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)}
        />
        <button type="submit" disabled={saving} style={{ marginTop: 16 }}>{saving ? 'Saving...' : 'Create Team'}</button>
      </form>
    </main>
  );
};

export default TeamSetup;


