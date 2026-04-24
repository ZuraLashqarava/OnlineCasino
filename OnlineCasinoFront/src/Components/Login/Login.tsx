import React, { useState, useEffect } from "react";
import "./Login.scss";
import { useNavigate, useSearchParams } from "react-router-dom";

type Mode = "login" | "register";

const API_BASE = "/api";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<Mode>("login");

  const confirmedParam = searchParams.get("confirmed");
  const confirmMessage =
    confirmedParam === "success"
      ? "Account confirmed! You received 1000 credits."
      : confirmedParam === "already"
      ? "Account was already confirmed. You can log in."
      : confirmedParam === "declined"
      ? "Registration cancelled. Your account has been deleted."
      : confirmedParam === "invalid"
      ? "Invalid or expired confirmation link."
      : null;

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [personalNumber, setPersonalNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  
  useEffect(() => {
    if (confirmedParam === "success") {
      const stored = localStorage.getItem("user");
      if (stored) {
        const parsed = JSON.parse(stored);
        parsed.isConfirmed = true;
        parsed.balance = 1000;
        localStorage.setItem("user", JSON.stringify(parsed));
      }
    }
  }, [confirmedParam]);

  const handleModeSwitch = (next: Mode) => {
    setMode(next);
    setError("");
    setSuccess("");
    setFirstName("");
    setLastName("");
    setPersonalNumber("");
    setEmail("");
    setPassword("");
    setShowPassword(false);
  };

  const validateRegister = (): string => {
    if (!firstName.trim() || !lastName.trim()) return "Please enter your full name.";
    if (!/^\d{11}$/.test(personalNumber)) return "Personal number must be exactly 11 digits.";
    if (!email.trim()) return "Please enter your email.";
    if (password.length < 8) return "Password must be at least 8 characters.";
    if (!/\d/.test(password)) return "Password must contain at least one number.";
    return "";
  };

  const handleRegister = async () => {
    const validationError = validateRegister();
    if (validationError) {
      setError(validationError);
      return;
    }

    const payload = {
      fullName: `${firstName.trim()} ${lastName.trim()}`,
      personalNumber: personalNumber,
      email: email.trim(),
      password,
      role: "User",
    };

    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    let data: any = {};
    try {
      data = await res.json();
    } catch {
      setError("Server error. Please try again.");
      return;
    }

    if (!res.ok) {
      setError(data.message || "Registration failed. Please try again.");
      return;
    }

   
    if (data.user) {
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/");
      return;
    }

    setSuccess(data.message || "Registration successful! Please check your email to confirm your account.");
  };

  const handleLogin = async () => {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: email.trim(),
      password,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    setError(data.message || "Invalid email or password.");
    return;
  }

  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(data.user));
  navigate("/");
};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (mode === "register") {
        await handleRegister();
      } else {
        await handleLogin();
      }
    } catch {
      setError("Unable to connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card__tabs">
          <button
            className={`auth-card__tab ${mode === "register" ? "auth-card__tab--active" : ""}`}
            onClick={() => handleModeSwitch("register")}
            type="button"
          >
            Register
          </button>
          <button
            className={`auth-card__tab ${mode === "login" ? "auth-card__tab--active" : ""}`}
            onClick={() => handleModeSwitch("login")}
            type="button"
          >
            Login
          </button>
          <span
            className="auth-card__tab-indicator"
            style={{
              transform: mode === "login" ? "translateX(100%)" : "translateX(0%)",
            }}
          />
        </div>

        <div className="auth-card__header">
          <h2 className="auth-card__title">
            {mode === "login" ? "Welcome back" : "Create account"}
          </h2>
          <p className="auth-card__subtitle">
            {mode === "login"
              ? "Sign in to your BET&BET account"
              : "Join BET&BET and start playing"}
          </p>
        </div>

        <form className="auth-card__form" onSubmit={handleSubmit}>
          {mode === "register" && (
            <>
              <div className="auth-field auth-field--split">
                <div className="auth-field__half">
                  <label className="auth-field__label">First Name</label>
                  <input
                    className="auth-field__input"
                    type="text"
                    placeholder="John"
                    autoComplete="given-name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div className="auth-field__half">
                  <label className="auth-field__label">Last Name</label>
                  <input
                    className="auth-field__input"
                    type="text"
                    placeholder="Smith"
                    autoComplete="family-name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="auth-field">
                <label className="auth-field__label">Personal Number</label>
                <input
                  className="auth-field__input"
                  type="text"
                  inputMode="numeric"
                  placeholder="11-digit personal number"
                  maxLength={11}
                  value={personalNumber}
                  onChange={(e) => setPersonalNumber(e.target.value.replace(/\D/g, ""))}
                  required
                />
                <span className="auth-field__hint">{personalNumber.length}/11</span>
              </div>
            </>
          )}

          <div className="auth-field">
            <label className="auth-field__label">Email</label>
            <input
              className="auth-field__input"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="auth-field">
            <label className="auth-field__label">Password</label>
            <div className="auth-field__password-wrap">
              <input
                className="auth-field__input"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="auth-field__eye"
                onClick={() => setShowPassword((p) => !p)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            {mode === "register" && (
              <span className="auth-field__hint">Min 8 characters, at least 1 number</span>
            )}
          </div>

          {mode === "login" && (
            <div className="auth-card__forgot">
              <a href="#" className="auth-card__forgot-link">Forgot password?</a>
            </div>
          )}

          {confirmMessage && (
            <p className={`auth-card__${confirmedParam === "success" || confirmedParam === "already" ? "success" : "error"}`}>
              {confirmMessage}
            </p>
          )}
          {error && <p className="auth-card__error">{error}</p>}
          {success && <p className="auth-card__success">{success}</p>}

          <button type="submit" className="auth-card__submit" disabled={loading}>
            {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </form>

        <p className="auth-card__switch">
          {mode === "login" ? "Don't have an account?" : "Already have an account?"}
          <button
            className="auth-card__switch-btn"
            type="button"
            onClick={() => handleModeSwitch(mode === "login" ? "register" : "login")}
          >
            {mode === "login" ? "Register" : "Log in"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;