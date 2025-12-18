import React, { useState } from "react";
import { Link } from "react-router-dom";
import supabase from "../../supabaseClient";
import "../Styles/signUpLogin.css";

const Signup: React.FC = () => {
  const [errorMessage, setErrorMessage] = useState("");

  const handleGoogleSignIn = async () => {
    try {
      try { localStorage.setItem('cameFromSignup', '1'); } catch {}
      console.log("[Signup] Initiating Google OAuth sign-in", {
        redirectTo: window.location.origin + "/auth/callback",
        origin: window.location.origin,
        location: window.location.href
      });
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin + "/auth-callback?from=signup",
        },
      });

      console.log("[Signup] signInWithOAuth resolved", { data, error });

      if (error) {
        setErrorMessage(error.message);
        console.error("[Signup] Google sign-in error:", error);
      } else {
        console.log("[Signup] Redirecting to Google login (Supabase response):", data);
      }
    } catch (err) {
      console.error("[Signup] Unexpected error during Google sign-in:", err);
      setErrorMessage("An unexpected error occurred during Google login.");
    }
  };

  return (
    <section className="auth-body">
      <section className="auth-container">
        <form onSubmit={(e) => e.preventDefault()} className="auth-form">
          <h1 className="auth-header">SIGN UP</h1>

          {errorMessage && <p className="error-message">{errorMessage}</p>}

          <button
            className="auth-button"
            type="button"
            onClick={handleGoogleSignIn}
          >
            Continue with Google
          </button>

          <p className="switch-link">
            Already have an account? <Link to="/login">Log In</Link>
          </p>
        </form>
      </section>
    </section>
  );
};

export default Signup;
