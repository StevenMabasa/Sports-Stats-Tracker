import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../../supabaseClient";
import { getUserRole, createUserProfile } from "../services/roleService";
import RoleSelection from "../components/RoleSelection";

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const [userData, setUserData] = useState<{ id: string; email: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasProcessed = useRef(false); // Prevent double execution

  useEffect(() => {
    const handleAuthCallback = async () => {
      // Prevent double execution in React Strict Mode
      if (hasProcessed.current) {
        console.log("[AuthCallback] Already processed, skipping");
        return;
      }
      hasProcessed.current = true;

      console.log("[AuthCallback] Handling auth callback", {
        location: window.location.href,
        origin: window.location.origin
      });

      // Detect OAuth error
      const searchParams = new URLSearchParams(window.location.search);
      const oauthError = searchParams.get('error');
      const oauthErrorDescription = searchParams.get('error_description');
      const fromParam = searchParams.get('from');
      
      if (oauthError) {
        console.error("[AuthCallback] OAuth provider returned error:", {
          error: oauthError,
          description: oauthErrorDescription
        });
        navigate("/login", { replace: true });
        return;
      }

      const { data: { session }, error } = await supabase.auth.getSession();
      console.log("[AuthCallback] getSession resolved", { hasSession: !!session, error });
      
      if (error) {
        console.error("[AuthCallback] Error getting session:", error);
        navigate("/login", { replace: true });
        return;
      }

      if (session?.user) {
        try {
          console.log("[AuthCallback] Session user detected", {
            userId: session.user.id,
            email: session.user.email
          });

          // Check if came from signup
          let cameFromSignup = fromParam === 'signup';
          if (!cameFromSignup) {
            try {
              cameFromSignup = localStorage.getItem('cameFromSignup') === '1';
              if (cameFromSignup) localStorage.removeItem('cameFromSignup');
            } catch {}
          }

          if (cameFromSignup) {
            console.log("[AuthCallback] Detected first-time signup; forcing role selection");
            setUserData({
              id: session.user.id,
              email: session.user.email || 'Unknown'
            });
            setShowRoleSelection(true);
            return;
          }

          const userRole = await getUserRole(session.user.id);
          console.log("[AuthCallback] getUserRole resolved", userRole);
          
          if (!userRole) {
            console.log("[AuthCallback] No role found; prompting role selection");
            setUserData({
              id: session.user.id,
              email: session.user.email || 'Unknown'
            });
            setShowRoleSelection(true);
            return;
          }

          // Store session info in localStorage before navigating
          try {
            localStorage.setItem('user_role', userRole.role);
            localStorage.setItem('user_id', session.user.id);
          } catch (e) {
            console.warn("[AuthCallback] Could not store in localStorage:", e);
          }

          // Use replace: true to prevent back button issues
          if (userRole.role === "Coach") {
            console.log("[AuthCallback] Navigating to coach dashboard");
            navigate("/coach-dashboard", {
              replace: true,
              state: { 
                username: session.user.email, 
                userId: session.user.id,
                isGoogleUser: true 
              },
            });
          } else if (userRole.role === "Admin") {
            console.log("[AuthCallback] Navigating to admin dashboard");
            navigate("/admin-dashboard", {
              replace: true,
              state: { 
                username: session.user.email, 
                userId: session.user.id,
                isGoogleUser: true 
              },
            });
          } else {
            console.log("[AuthCallback] Navigating to user dashboard");
            navigate("/user-dashboard", {
              replace: true,
              state: { 
                username: session.user.email, 
                userId: session.user.id,
                isGoogleUser: true 
              },
            });
          }
        } catch (error) {
          console.error("[AuthCallback] Error checking user role:", error);
          navigate("/login", { replace: true });
        }
      } else {
        console.warn("[AuthCallback] No session found; redirecting to /login");
        navigate("/login", { replace: true });
      }
    };

    handleAuthCallback();
  }, [navigate]);

  const handleRoleSelected = async (role: 'Fan' | 'Coach' | 'Admin') => {
    if (!userData) return;

    setIsLoading(true);
    setError(null);

    try {
      console.log("[AuthCallback] Role selected; handling user profile", {
        role,
        userId: userData.id,
        email: userData.email
      });

      // First check if user already exists
      const existingUser = await getUserRole(userData.id);
      
      let success = false;
      if (existingUser) {
        // User exists, update their role
        console.log("[AuthCallback] User exists, updating role");
        const { updateUserRole } = await import('../services/roleService');
        success = await updateUserRole(userData.id, role);
      } else {
        // User doesn't exist. Disallow creating Admin accounts via the public role selection UI.
        if (role === 'Admin') {
          console.warn('[AuthCallback] Admin accounts cannot be self-created via signup');
          setError('Admin accounts must be created by an administrator.');
          setIsLoading(false);
          return;
        }

        // User doesn't exist, create new profile
        console.log("[AuthCallback] User doesn't exist, creating profile");
        success = await createUserProfile(userData.id, userData.email, role);
      }
      
      console.log("[AuthCallback] Profile operation result", { success });
      
      if (success) {
        // Store role in localStorage
        try {
          localStorage.setItem('user_role', role);
          localStorage.setItem('user_id', userData.id);
        } catch (e) {
          console.warn("[AuthCallback] Could not store in localStorage:", e);
        }

        if (role === 'Coach') {
          console.log("[AuthCallback] Navigating to team setup");
          navigate('/team-setup', { replace: true });
        } else if (role === 'Admin') {
          console.log("[AuthCallback] Navigating to admin dashboard");
          navigate('/admin-dashboard', { replace: true });
        } else {
          console.log("[AuthCallback] Navigating to user dashboard");
          navigate('/user-dashboard', { replace: true });
        }
      } else {
        console.error('[AuthCallback] Failed to handle user profile');
        setError('Failed to update role. Please try again.');
      }
    } catch (error) {
      console.error('[AuthCallback] Error handling user profile:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (showRoleSelection && userData) {
    const allowAdmin = typeof window !== 'undefined' && localStorage.getItem('allow_admin_signup') === '1';
    const allowedRoles: Array<'Fan' | 'Coach' | 'Admin'> = allowAdmin ? ['Fan', 'Coach', 'Admin'] : ['Fan', 'Coach'];

    return (
      <RoleSelection
        userId={userData.id}
        userEmail={userData.email}
        onRoleSelected={handleRoleSelected}
        includeAdminOption={allowAdmin}
        allowedRoles={allowedRoles}
        isLoading={isLoading}
        error={error}
      />
    );
  }

  return (
    <section style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      fontSize: '1.2rem',
      color: '#666'
    }}>
      Loading...
    </section>
  );
};

export default AuthCallback;