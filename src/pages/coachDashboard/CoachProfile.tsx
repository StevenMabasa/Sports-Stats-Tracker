import { useState, useEffect } from "react";
import type { DragEvent } from "react";
import "./CoachProfile.css";
import Logo from "../../images/7435680.jpg";
import { fetchTeamById, updateTeam, uploadTeamLogo, createTeam } from "../../services/teamService";
import { getCurrentTeamId } from "../../services/teamService";
interface CoachProfileProps {
  initialCoachName?: string;
  initialTeamName?: string;
  initialLogo?: string;
}

export default function CoachProfile({
  initialCoachName,
  initialTeamName,
  initialLogo
}: CoachProfileProps) {
  const [coachName, setCoachName] = useState(initialCoachName || "");
  const [teamName, setTeamName] = useState(initialTeamName || "");
  const [teamLogo, setTeamLogo] = useState(initialLogo || Logo);
  const [showDropzone, setShowDropzone] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [teamId, setTeamId] = useState<string | null>(null);

  // Load team data on component mount
  useEffect(() => {
    const loadTeamData = async () => {
      setIsLoading(true);
      setMessage("");
      
      try {
        const currentTeamId = getCurrentTeamId();
        console.log("Loading team data for team ID:", currentTeamId);
        
        if (!currentTeamId) {
          // No team: allow coach to create one inline
          setMessage("");
          setTeamId(null);
          setIsLoading(false);
          return;
        }

        setTeamId(currentTeamId);
        const team = await fetchTeamById(currentTeamId);
        
        console.log("Fetched team data:", team);
        
        if (team) {
          setTeamName(team.name || "");
          if (team.logo_url) {
            setTeamLogo(team.logo_url);
          }
          if (team.coach_name) {
            console.log("Setting coach name from DB:", team.coach_name);
            setCoachName(team.coach_name);
          } else {
            console.log("No coach name found in database");
            setCoachName("");
          }
        } else {
          console.log("No team data found");
          setMessage("No team data found");
        }
      } catch (error) {
        console.error("Error loading team data:", error);
        setMessage("Error loading team data");
      } finally {
        setIsLoading(false);
      }
    };

    loadTeamData();
  }, []);

  const handleSave = async () => {
    if (!teamId) {
      // Create a new team for the coach
      setIsSaving(true);
      setMessage("");
      try {
        const created = await createTeam(teamName.trim(), undefined, undefined, coachName || undefined);
        if (created) {
          setTeamId(created.id);
          setMessage("Team created and profile saved successfully!");
        } else {
          setMessage("Failed to create team");
        }
      } catch (err) {
        console.error("Error creating team:", err);
        setMessage("Error creating team");
      } finally {
        setIsSaving(false);
      }
      return;
    }

    setIsSaving(true);
    setMessage("");
    
    try {
      const success = await updateTeam(teamId, { 
        name: teamName,
        coach_name: coachName
      });
      
      if (success) {
        setMessage("Team profile updated successfully!");
      } else {
        setMessage("Failed to update team profile");
      }
    } catch (error) {
      console.error("Error saving team:", error);
      setMessage("Error saving team profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/") && teamId) {
      setIsLoading(true);
      setMessage("");
      
      try {
        // Upload logo to storage
        const logoUrl = await uploadTeamLogo(teamId, file);
        
        if (logoUrl) {
          // Update team with new logo URL
          const success = await updateTeam(teamId, { logo_url: logoUrl });
          
          if (success) {
            setTeamLogo(logoUrl);
            setMessage("Logo updated successfully!");
          } else {
            setMessage("Failed to update logo");
          }
        } else {
          setMessage("Failed to upload logo");
        }
      } catch (error) {
        console.error("Error uploading logo:", error);
        setMessage("Error uploading logo");
      } finally {
        setIsLoading(false);
        setShowDropzone(false);
      }
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!teamId) return;
    
    setIsLoading(true);
    setMessage("");
    
    try {
      // Upload logo to storage
      const logoUrl = await uploadTeamLogo(teamId, file);
      
      if (logoUrl) {
        // Update team with new logo URL
        const success = await updateTeam(teamId, { logo_url: logoUrl });
        
        if (success) {
          setTeamLogo(logoUrl);
          setMessage("Logo updated successfully!");
        } else {
          setMessage("Failed to update logo");
        }
      } else {
        setMessage("Failed to upload logo");
      }
    } catch (error) {
      console.error("Error uploading logo:", error);
      setMessage("Error uploading logo");
    } finally {
      setIsLoading(false);
      setShowDropzone(false);
    }
  };


  if (isLoading) {
    return (
      <main className="profile-card">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p>Loading team profile...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="profile-card">
      <header className="profile-header">
        <h1 className="title" aria-label="Coach Profile">
          Team Profile
        </h1>
        {message && (
          <div style={{ 
            marginTop: '1rem', 
            padding: '0.5rem', 
            backgroundColor: message.includes('success') ? '#d4edda' : '#f8d7da',
            color: message.includes('success') ? '#155724' : '#721c24',
            borderRadius: '4px',
            textAlign: 'center'
          }}>
            {message}
          </div>
        )}
      </header>

      <section className="profile-layout">
        {/* Logo Section */}
        <figure className="profile-logo">
          <img src={teamLogo} alt={`${teamName} logo`} />
          <figcaption>{teamName}</figcaption>
          <button
            type="button"
            className="CoachBtn"
            onClick={() => setShowDropzone(!showDropzone)}
            aria-label="Update team logo"
          >
            Update Logo
          </button>
        </figure>

        {/* Dropzone */}
        {showDropzone && (
          <div
            className={`dropzone ${isDragging ? "dragging" : ""}`}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            aria-label="Drag and drop new logo"
          >
            <p>Drag & drop your new logo here</p>
            <p className="muted">PNG, JPG, SVG supported</p>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file && teamId) {
                  handleFileUpload(file);
                }
              }}
              style={{ marginTop: '1rem' }}
            />
          </div>
        )}

        {/* Form Section */}
        <form
          className="profile-form"
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
        >
          <label htmlFor="teamName">
            Team Name
            <input
              type="text"
              id="teamName"
              aria-label="Team name"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
            />
          </label>

          <label htmlFor="coachName">
            Coach Name
            <input
              type="text"
              id="coachName"
              aria-label="Coach name"
              value={coachName}
              onChange={(e) => setCoachName(e.target.value)}
            />
          </label>

          <button 
            type="submit" 
            className="CoachBtn" 
            aria-label="Save profile changes"
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </section>
    </main>
  );
}
