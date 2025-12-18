import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../../supabaseClient";
import "../Styles/landingPage.css";

function LandingPage() {
   const navigate = useNavigate();
  const sectionsRef = useRef<HTMLDivElement>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setIsLoggedIn(true);
  // setUsername removed
        
        // Get user role
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        
        if (profile) {
          setUserRole(profile.role);
        }
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('fade-in-visible');
          }
        });
      }, observerOptions);

      const sections = sectionsRef.current?.querySelectorAll('.fade-in-section');
      sections?.forEach(section => {
        if (typeof (observer as any).observe === 'function') (observer as any).observe(section);
      });

      const featureCards = sectionsRef.current?.querySelectorAll('.features-grid .feature-card');
      featureCards?.forEach(card => {
        if (typeof (observer as any).observe === 'function') (observer as any).observe(card);
      });

      const roleCards = sectionsRef.current?.querySelectorAll('.roles-grid .role-card');
      roleCards?.forEach(card => {
        if (typeof (observer as any).observe === 'function') (observer as any).observe(card);
      });

      const statCards = sectionsRef.current?.querySelectorAll('.stats-dashboard-preview .stat-card');
      statCards?.forEach(card => {
        if (typeof (observer as any).observe === 'function') (observer as any).observe(card);
      });

      return () => {
        if (typeof (observer as any).unobserve === 'function') {
          sections?.forEach(section => (observer as any).unobserve(section));
          featureCards?.forEach(card => (observer as any).unobserve(card));
          roleCards?.forEach(card => (observer as any).unobserve(card));
          statCards?.forEach(card => (observer as any).unobserve(card));
        }
      };
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const handleAdminNavigation = () => {
    if (userRole === 'admin') {
      navigate('/admin-dashboard');
    } else {
      // Optionally show a message or redirect to unauthorized page
      navigate('/');
    }
  };
  
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error('Error signing out:', e);
    }

    // Clear local state so the landing page reflects sign-out immediately
    setIsLoggedIn(false);
  // setUsername removed
    setUserRole('');

    // Navigate to landing (may be the same route) — state changes above will
    // ensure the UI updates without forcing a full reload.
    navigate('/');
  };
  return (
    <section className="landing-page" ref={sectionsRef}>
      <nav className="landing-nav fade-in-section">
        <section className="nav-container">
          <section className="nav-logo">
            <span className="logo-icon">⚽</span>
            <span className="logo-text">SportStats</span>
          </section>
          <section className="nav-actions">
            {isLoggedIn ? (
              <>
                <button className="nav-btn secondary" onClick={() => navigate('/user-dashboard')}>
                  Dashboard
                </button>
                {userRole === 'admin' && (
                  <button className="nav-btn admin" onClick={handleAdminNavigation}>
                    Admin
                  </button>
                )}
                <button className="nav-btn secondary" onClick={handleSignOut}>
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <button className="nav-btn secondary" onClick={() => navigate('/login')}>
                  Sign In
                </button>
                <button className="nav-btn primary" onClick={() => navigate('/signup')}>
                  Get Started
                </button>
              </>
            )}
          </section>
        </section>
      </nav>

      <section className="hero-section fade-in-section">
        <section className="hero-container">
          <section className="hero-content">
            <h1 className="hero-title">
              Track. Analyze. 
              <span className="highlight"> Dominate.</span>
            </h1>
            <p className="hero-subtitle">
              The ultimate platform for football statistics, team management, and performance analytics. 
              Whether you're a passionate fan or a dedicated coach, get the insights you need to succeed.
            </p>
    
          </section>
          <section className="hero-visual">
            <section className="stats-dashboard-preview">
              <section className="stat-card">
                <section className="stat-icon">📊</section>
                <section className="stat-value">98.5%</section>
                <section className="stat-label">Accuracy</section>
              </section>
              <section className="stat-card">
                <section className="stat-icon">⚽</section>
                <section className="stat-value">24/7</section>
                <section className="stat-label">Post Match Analysis</section>
              </section>
              <section className="stat-card">
                <section className="stat-icon">🏆</section>
                <section className="stat-value">10K+</section>
                <section className="stat-label">Teams</section>
              </section>
            </section>
          </section>
        </section>
      </section>

      <section className="features-section fade-in-section">
        <section className="features-container">
          <h2 className="section-title">Why Choose SportStats?</h2>
          <section className="features-grid">
            <section className="feature-card">
              <section className="feature-icon">🎯</section>
              <h3>Precision Analytics</h3>
              <p>Get detailed statistics with 98.5% accuracy. Track every pass, shot, and tackle with precision.</p>
            </section>
            <section className="feature-card">
              <section className="feature-icon">📱</section>
              <h3>Post Match Analysis</h3>
              <p>Post match statistics, instant notifications, and up-to-the-minute performance data.</p>
            </section>
            <section className="feature-card">
              <section className="feature-icon">👥</section>
              <h3>Team Management</h3>
              <p>Comprehensive tools for coaches to manage players, analyze performance, and optimize strategies.</p>
            </section>
            <section className="feature-card">
              <section className="feature-icon">📈</section>
              <h3>Performance Insights</h3>
              <p>Advanced analytics and visualizations to understand team and player performance trends.</p>
            </section>
          </section>
        </section>
      </section>

      <section className="roles-section fade-in-section">
        <section className="roles-container">
          <h2 className="section-title">Built for Everyone</h2>
          <section className="roles-grid">
            <section className="role-card coach">
              <section className="role-header">
                <section className="role-icon">⚽</section>
                <h3>For Coaches</h3>
              </section>
              <ul className="role-features">
                <li>Team roster management</li>
                <li>Player performance tracking</li>
                <li>Match analysis tools</li>
                <li>Lineup optimization</li>
                <li>Performance reports</li>
              </ul>
              <button className="role-cta" onClick={() => navigate('/signup')}>
                Start Coaching
              </button>
            </section>
            <section className="role-card fan">
              <section className="role-header">
                <section className="role-icon">👥</section>
                <h3>For Fans</h3>
              </section>
              <ul className="role-features">
                <li>Live match statistics</li>
                <li>Team and player tracking</li>
                <li>Historical data access</li>
                <li>Favorite teams management</li>
                <li>Performance comparisons</li>
              </ul>
              <button className="role-cta" onClick={() => navigate('/signup')}>
                Start Following
              </button>
            </section>
            <section className="role-card admin">
              <section className="role-header">
                <section className="role-icon">🛠️</section>
                <h3>For Administrators</h3>
              </section>
              <ul className="role-features">
                <li>User management system</li>
                <li>Coach application approval</li>
                <li>System analytics and reports</li>
                <li>Platform moderation tools</li>
                <li>Performance monitoring</li>
              </ul>
              <button className="role-cta" onClick={() => navigate('/signup')}>
                Admin Portal
              </button>
            </section>
          </section>
        </section>
      </section>

      <section className="cta-section fade-in-section">
        <section className="cta-container">
          <h2>Ready to Transform Your Football Experience?</h2>
          <p>Join thousands of coaches, fans, and administrators who trust SportStats for their football analytics needs.</p>
          {!isLoggedIn ? (
            <button className="cta-btn primary large" onClick={() => navigate('/signup')}>
              Get Started Today
            </button>
          ) : (
            <button className="cta-btn primary large" onClick={() => navigate('/user-dashboard')}>
              Go to Dashboard
            </button>
          )}
        </section>
      </section>

      <footer className="landing-footer fade-in-section">
        <section className="footer-container">
          <section className="footer-content">
            <section className="footer-logo">
              <span className="logo-icon">⚽</span>
              <span className="logo-text">SportStats</span>
            </section>
            <p className="footer-tagline">
              Empowering football success through data-driven insights
            </p>
          </section>
        </section>
      </footer>
    </section>
  );
}
export default LandingPage;