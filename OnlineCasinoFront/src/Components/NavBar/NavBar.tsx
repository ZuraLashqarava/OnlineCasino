import React, { useState, useRef, useEffect } from "react";
import logo from "./account.png";
import "./NavBar.scss";
import { useNavigate } from "react-router-dom";

const NavBar: React.FC = () => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const stored = localStorage.getItem("user");
  const user = stored ? JSON.parse(stored) : null;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setDropdownOpen(false);
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar__brand">
        <button className="navbar__logo-btn" onClick={() => navigate("/")}>
          BET<span>&</span>BET
        </button>
      </div>

      <div className="navbar__links">
        <button className="navbar__link" onClick={() => navigate("/sports")}>
          ⚽ Sports
        </button>

        
        <button className="navbar__link" onClick={() => navigate("/slots")}>
          🎰 Slots
        </button>

        <button className="navbar__link" onClick={() => navigate("/mini-games")}>
          🎮 Mini-Games
        </button>
      </div>

      <div className="navbar__actions">
        {user ? (
          <div className="navbar__dropdown-wrap" ref={dropdownRef}>
            <button
              className="navbar__register-btn"
              aria-label="Account"
              onClick={() => setDropdownOpen((p) => !p)}
            >
              <img src={logo} alt="Account" className="navbar__register-img" />
            </button>

            {dropdownOpen && (
              <div className="navbar__dropdown">
                <div className="navbar__dropdown-name">{user.fullName}</div>

                <div className="navbar__dropdown-balance">
                  <span className="navbar__dropdown-balance-label">Balance</span>
                  <span className="navbar__dropdown-balance-value">
                    ${user.balance?.toFixed(2) ?? "0.00"}
                  </span>
                </div>

                {!user.isConfirmed && (
                  <div className="navbar__dropdown-warning">
                    ⚠ Confirmation needed
                  </div>
                )}

                <div className="navbar__dropdown-divider" />

                <button
                  className="navbar__dropdown-logout"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            className="navbar__register-btn"
            aria-label="Login"
            onClick={() => navigate("/login")}
          >
            <img src={logo} alt="Login" className="navbar__register-img" />
          </button>
        )}
      </div>
    </nav>
  );
};

export default NavBar;