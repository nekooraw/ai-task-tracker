
import { useState } from "react";
import { loginUser, registerUser } from "./auth";
import "./Auth.css";

function Auth({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isRegister) {
        await registerUser(email, password);
      }

      await loginUser(email, password);
      onLogin();
    } catch (error) {
      setError(error.response?.data?.detail || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-brand"><span>✦</span> TaskFlow</div>
        <p className="auth-eyebrow">YOUR PERSONAL WORKSPACE</p>
        <h1>{isRegister ? "Create your account" : "Welcome back"}</h1>
        <p className="auth-subtitle">
          {isRegister ? "Start organizing your day." : "Sign in to continue your journey."}
        </p>

        <form onSubmit={handleSubmit}>
          <label>Email address</label>
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required />

          <label>Password</label>
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" minLength={8} required />

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? "Please wait..." : isRegister ? "Create account" : "Sign in"}
          </button>
        </form>

        <p className="auth-switch">
          {isRegister ? "Already have an account?" : "Don't have an account?"}
          <button type="button" onClick={() => { setIsRegister(!isRegister); setError(""); }}>
            {isRegister ? "Sign in" : "Create account"}
          </button>
        </p>
      </section>
    </main>
  );
}

export default Auth;
