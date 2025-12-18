import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { updateUserRole } from '../services/roleService';
import './RoleSelection.css';

interface RoleSelectionProps {
  userId: string;
  userEmail: string;
  onRoleSelected: (role: 'Fan' | 'Coach' | 'Admin') => void;
  includeAdminOption?: boolean;
  allowedRoles?: Array<'Fan' | 'Coach' | 'Admin'>;
  isLoading?: boolean;
  error?: string | null;
}

const RoleSelection: React.FC<RoleSelectionProps> = ({ 
  // userId,
  userEmail, 
  onRoleSelected,
  includeAdminOption = false,
  allowedRoles,
  isLoading: externalLoading = false,
  error: externalError = null
}) => {
  const [selectedRole, setSelectedRole] = useState<'Fan' | 'Coach' | 'Admin' | null>(null);
  // const navigate = useNavigate();

  const handleRoleSelect = async (role: 'Fan' | 'Coach' | 'Admin') => {
    setSelectedRole(role);
    
    try {
      // Let the parent component handle the role update/creation
      onRoleSelected(role);
      
      // Navigation will be handled by the parent component
      // after successful role creation/update
    } catch (err) {
      console.error('Error in handleRoleSelect:', err);
    }
  };

  return (
    <section className="role-selection">
      <section className="role-selection-container">
        <section className="role-selection-header">
          <h1>Welcome to Sport Stats Tracker!</h1>
          <p>Hi {userEmail}, please select your role to get started:</p>
        </section>

        <section className="role-options">
          <section 
            className={`role-option ${selectedRole === 'Fan' ? 'selected' : ''}`}
            onClick={() => setSelectedRole('Fan')}
          >
            <section className="role-icon">👥</section>
            <h3>Fan</h3>
            <p>Track your favorite teams, view match statistics, and stay updated with the latest football news.</p>
            <ul>
              <li>View team and player statistics</li>
              <li>Track match results and live scores</li>
              <li>Save favorite teams and players</li>
              <li>Access comprehensive football analytics</li>
            </ul>
          </section>

          <section 
            className={`role-option ${selectedRole === 'Coach' ? 'selected' : ''}`}
            onClick={() => setSelectedRole('Coach')}
          >
            <section className="role-icon">⚽</section>
            <h3>Coach</h3>
            <p>Manage your team, track player performance, and analyze match data to improve your team's strategy.</p>
            <ul>
              <li>Create and manage your team</li>
              <li>Track individual player statistics</li>
              <li>Analyze team performance metrics</li>
              <li>Manage match lineups and tactics</li>
            </ul>
          </section>

          {((allowedRoles && allowedRoles.includes('Admin')) || (!allowedRoles && includeAdminOption)) && (
            <section 
              className={`role-option ${selectedRole === 'Admin' ? 'selected' : ''}`}
              onClick={() => setSelectedRole('Admin')}
            >
              <section className="role-icon">🛠️</section>
              <h3>Admin</h3>
              <p>Manage the platform, approve coach applications, and oversee system operations and user management.</p>
              <ul>
                <li>User management and moderation</li>
                <li>Coach application approval</li>
                <li>System analytics and reports</li>
                <li>Platform configuration and settings</li>
              </ul>
            </section>
          )}
        </section>

        {selectedRole && (
          <section className="role-selection-actions">
            <button
              className="continue-btn"
              onClick={() => handleRoleSelect(selectedRole)}
              disabled={externalLoading}
            >
              {externalLoading ? 'Setting up...' : `Continue as ${selectedRole}`}
            </button>
          </section>
        )}

        {externalError && (
          <section className="error-message">
            {externalError}
          </section>
        )}
      </section>
    </section>
  );
};

export default RoleSelection;