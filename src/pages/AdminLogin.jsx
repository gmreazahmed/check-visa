import { useState } from "react";
import "./AdminLogin.css";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const correctPassword = import.meta.env.VITE_ADMIN_PASSWORD;
    if (!correctPassword) {
      setError("VITE_ADMIN_PASSWORD is missing from .env. Restart the dev server after adding it.");
      return;
    }

    if (password === correctPassword) {
      // Keeps the login on refresh; logout removes this flag.
      localStorage.setItem("visa_admin_logged_in", "true");
      window.location.assign("/admin");
    } else {
      setError("Incorrect password. Please try again.");
    }
  }

  return (
    <main className="visa-login-shell">
      <div className="visa-login-decoration visa-login-decoration-one" />
      <div className="visa-login-decoration visa-login-decoration-two" />
      <form className="visa-login-card" onSubmit={handleSubmit}>
        <div className="visa-brand-mark">V</div>
        <span className="visa-eyebrow">ADMIN ACCESS</span>
        <h1>Welcome back</h1>
        <p className="visa-login-copy">Sign in to manage visa records.</p>
        <label className="visa-login-label" htmlFor="admin-password">Admin password</label>
        <input
          id="admin-password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          required
        />
        {error && <div className="visa-alert visa-alert-error" role="alert">{error}</div>}
        <button className="visa-primary-button visa-login-button" type="submit">
          Sign in <span aria-hidden="true">→</span>
        </button>
        <div className="visa-login-footer"><span className="visa-live-dot" /> Admin workspace</div>
      </form>
    </main>
  );
}
