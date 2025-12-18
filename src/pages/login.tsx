import React, { useState } from "react";
import { Link } from "react-router-dom";
import supabase from "../../supabaseClient";
import "../Styles/signUpLogin.css";

const Login: React.FC = () => {
  const [errorMessage, setErrorMessage] = useState("");

  const handleGoogleSignIn = async () => {
    try {
      console.log("[Login] Initiating Google OAuth sign-in", {
        redirectTo: window.location.origin + "/auth/callback",
        origin: window.location.origin,
        location: window.location.href
      });
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin + "/auth-callback",
        },
      });

      console.log("[Login] signInWithOAuth resolved", { data, error });

      if (error) {
        setErrorMessage(error.message);
        console.error("[Login] Google sign-in error:", error);
      } else {
        console.log("[Login] Redirecting to Google login (Supabase response):", data);
      }
    } catch (err) {
      console.error("[Login] Unexpected error during Google sign-in:", err);
      setErrorMessage("An unexpected error occurred during Google login.");
    }
  };

  return (
    <section className="auth-body">
      <section className="auth-container">
        <form onSubmit={(e) => e.preventDefault()} className="auth-form">
          <h1 className="auth-header">LOGIN</h1>

          {errorMessage && <p className="error-message">{errorMessage}</p>}

          <button
            className="google-button"
            type="button"
            onClick={handleGoogleSignIn}
          >
            <img
              src="https://img.icons8.com/?size=100&id=V5cGWnc9R4xj&format=png&color=000000"
              alt="Google logo"
            />
            Continue with Google
          </button>

          <div className="auth-links">
            <span>
              Are you new? <Link to="/signup">Sign up</Link>
            </span>
          </div>
        </form>
      </section>
    </section>
  );
};

export default Login;
