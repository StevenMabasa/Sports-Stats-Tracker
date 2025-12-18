import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserRole } from '../services/roleService';
import supabase from '../../supabaseClient';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'Fan' | 'Coach' | 'Admin';
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole, 
  redirectTo = '/role-selection' 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const navigate = useNavigate();
  const hasChecked = useRef(false);

  useEffect(() => {
    const checkAccess = async () => {
      // Prevent double execution in React Strict Mode
      if (hasChecked.current) {
        return;
      }
      hasChecked.current = true;

      try {
        console.log('[ProtectedRoute] Checking access', { requiredRole });
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        console.log('[ProtectedRoute] Session check', { 
          hasSession: !!session, 
          userId: session?.user?.id,
          error 
        });

        if (error || !session?.user) {
          console.log('[ProtectedRoute] No session, redirecting to login');
          navigate('/login', { replace: true });
          return;
        }

        // If no specific role required, just check authentication
        if (!requiredRole) {
          console.log('[ProtectedRoute] No role required, granting access');
          setHasAccess(true);
          setIsLoading(false);
          return;
        }

        // Get the user's actual role from the database
        const userRole = await getUserRole(session.user.id);
        console.log('[ProtectedRoute] User role retrieved', { userRole, requiredRole });

        if (!userRole) {
          console.log('[ProtectedRoute] No role found, redirecting to', redirectTo);
          navigate(redirectTo, { replace: true });
          return;
        }

        // Check if user's role matches required role
        const hasRequiredRole = userRole.role === requiredRole;
        
        console.log('[ProtectedRoute] Role check result', { 
          hasRequiredRole,
          userRole: userRole.role,
          requiredRole 
        });

        if (hasRequiredRole) {
          setHasAccess(true);
        } else {
          console.log('[ProtectedRoute] Role mismatch, redirecting to', redirectTo);
          navigate(redirectTo, { replace: true });
        }
      } catch (error) {
        console.error('[ProtectedRoute] Error checking access:', error);
        navigate('/login', { replace: true });
      } finally {
        setIsLoading(false);
      }
    };

    checkAccess();
  }, [navigate, requiredRole, redirectTo]);

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '1.2rem',
        color: '#666'
      }}>
        Checking access...
      </div>
    );
  }

  return hasAccess ? <>{children}</> : null;
};

export default ProtectedRoute;