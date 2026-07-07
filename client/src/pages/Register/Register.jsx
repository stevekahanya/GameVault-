import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/useAuth";
import "../Login/Login.css";

// Registration creates an account, stores the JWT, and starts an authenticated session.
function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
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
      await register(formData);
      setStatus("success");
      navigate("/favorites", { replace: true });
    } catch (registerError) {
      setError(registerError.message);
      setStatus("error");
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <p className="auth-panel__eyebrow">Create account</p>
        <h1>Join QuestLog</h1>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label htmlFor="register-username">Username</label>
          <input
            id="register-username"
            name="username"
            type="text"
            value={formData.username}
            onChange={handleChange}
            required
          />

          <label htmlFor="register-email">Email</label>
          <input
            id="register-email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <label htmlFor="register-password">Password</label>
          <input
            id="register-password"
            name="password"
            type="password"
            minLength="6"
            value={formData.password}
            onChange={handleChange}
            required
          />

          {error && <p className="auth-form__error">{error}</p>}

          <button type="submit" disabled={status === "loading"}>
            {status === "loading" ? "Creating account" : "Create account"}
          </button>

          <p className="auth-form__footer">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </form>
      </section>
    </main>
  );
}

export default Register;
