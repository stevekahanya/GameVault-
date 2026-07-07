import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/useAuth";
import "./Login.css";

// Login updates global auth state and returns users to their intended protected route.
function Login() {
  const { login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("loading");
    setError("");

    try {
      await login(formData);
      setStatus("success");
      navigate(location.state?.from?.pathname || "/favorites", { replace: true });
    } catch (loginError) {
      setError(loginError.message);
      setStatus("error");
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <p className="auth-panel__eyebrow">Welcome back</p>
        <h1>Log in to QuestLog</h1>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label htmlFor="login-email">Email or username</label>
          <input
            id="login-email"
            name="email"
            type="text"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          {error && <p className="auth-form__error">{error}</p>}

          <button type="submit" disabled={status === "loading"}>
            {status === "loading" ? "Logging in" : "Log in"}
          </button>

          <p className="auth-form__footer">
            New here? <Link to="/register">Create an account</Link>
          </p>
        </form>
      </section>
    </main>
  );
}

export default Login;
