import React, { useEffect, useRef, useState, useCallback } from "react";
import { SlotApp } from "./SlotApp";
import type { SpinResponseDto } from "./SpinDtos";
import "./SlotGame.scss";

const API_BASE = "/api";

interface SlotGameProps {
  slotId:         number;
  userId:         number;
  authToken?:     string;
  initialBalance: number;
}

type SpinState = "idle" | "spinning" | "result";

const BET_STEPS = [0.5, 1, 2, 5, 10, 25, 50, 100];

const SlotGame: React.FC<SlotGameProps> = ({
  slotId,
  userId,
  authToken,
  initialBalance,
}) => {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const slotAppRef         = useRef<SlotApp | null>(null);
  const initRef            = useRef(false);

  const [balance,   setBalance]   = useState(initialBalance);
  const [betAmount, setBetAmount] = useState(1);
  const [spinState, setSpinState] = useState<SpinState>("idle");
  const [lastWin,   setLastWin]   = useState<number | null>(null);
  const [error,     setError]     = useState<string | null>(null);
  const [winLines,  setWinLines]  = useState<number>(0);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const app = new SlotApp();
    slotAppRef.current = app;

    if (canvasContainerRef.current) {
      app.init(canvasContainerRef.current);
    }

    const onResize = () => {
      if (canvasContainerRef.current) {
        app.resize(
          canvasContainerRef.current.clientWidth,
          canvasContainerRef.current.clientHeight
        );
      }
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      slotAppRef.current?.destroy();
      slotAppRef.current = null;
      initRef.current = false;
    };
  }, []);

  const getToken = useCallback((): string => {
    const fromProp = authToken && authToken.trim() !== "" ? authToken : null;
    const fromStorage = localStorage.getItem("token");
    const result = fromProp ?? fromStorage ?? "";
    console.log("token being used:", result ? result.substring(0, 30) + "..." : "EMPTY");
    return result;
  }, [authToken]);

  const handleSpin = useCallback(async () => {
    const token = getToken();

    if (spinState === "spinning") return;

    if (!token) {
      setError("You are not logged in. Redirecting...");
      setTimeout(() => {
        window.location.href = "/login";
      }, 1500);
      return;
    }

    if (balance < betAmount) {
      setError("Insufficient balance.");
      return;
    }

    setError(null);
    setLastWin(null);
    setWinLines(0);
    setSpinState("spinning");

    try {
      const res = await fetch(`${API_BASE}/slot/spin`, {
        method:  "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:  `Bearer ${token}`,
        },
        body: JSON.stringify({ betAmount, slotKey: String(slotId) }),
      });

      console.log("spin response status:", res.status);
      console.log("token:", localStorage.getItem("token"));
      console.log("user:", localStorage.getItem("user"));

      if (res.status === 401) {
        setError("Session expired. Redirecting to login...");
        setSpinState("idle");
        setTimeout(() => {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/login";
        }, 2000);
        return;
      }

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Spin failed.");
      }

      const data: SpinResponseDto = await res.json();
      console.log("spin data:", data);

      await slotAppRef.current?.playSpin(data.grid, data.winLines);

      setBalance(data.newBalance);
      setLastWin(data.winAmount);
      setWinLines(data.winLines.length);
      setSpinState("result");
    } catch (err: any) {
      console.error("spin error:", err);
      setError(err.message ?? "Something went wrong.");
      setSpinState("idle");
    }
  }, [spinState, balance, betAmount, authToken, slotId, getToken]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "Enter") {
        e.preventDefault();
        handleSpin();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleSpin]);

  const isSpinning = spinState === "spinning";
  const canSpin    = !isSpinning && balance >= betAmount;

  return (
    <div className="slot-game">
      <div className="slot-game__inner">

        {/* ── Top bar ── */}
        <div className="slot-game__topbar">
          <div className="slot-game__stat">
            <span className="slot-game__stat-label">Balance</span>
            <span className="slot-game__stat-value slot-game__stat-value--gold">
              ${balance.toFixed(2)}
            </span>
          </div>

          {lastWin !== null && (
            <div className={`slot-game__stat ${lastWin > 0 ? "slot-game__stat--win" : ""}`}>
              <span className="slot-game__stat-label">Last Win</span>
              <span className={`slot-game__stat-value ${lastWin > 0 ? "slot-game__stat-value--win" : ""}`}>
                {lastWin > 0 ? `+$${lastWin.toFixed(2)}` : "—"}
              </span>
            </div>
          )}

          {winLines > 0 && (
            <div className="slot-game__stat">
              <span className="slot-game__stat-label">Lines Hit</span>
              <span className="slot-game__stat-value slot-game__stat-value--gold">
                {winLines}
              </span>
            </div>
          )}
        </div>

        {/* ── Canvas ── */}
        <div className="slot-game__canvas-wrap" ref={canvasContainerRef}>
          {isSpinning && (
            <div className="slot-game__spin-overlay" aria-hidden="true">
              <span className="slot-game__spinning-text">Spinning…</span>
            </div>
          )}
        </div>

        {/* ── Controls ── */}
        <div className="slot-game__controls">
          <div className="slot-game__bet-wrap">
            <span className="slot-game__controls-label">Bet</span>
            <div className="slot-game__bet-steps">
              {BET_STEPS.map((step) => (
                <button
                  key={step}
                  type="button"
                  className={`slot-game__bet-step${betAmount === step ? " slot-game__bet-step--active" : ""}`}
                  onClick={() => setBetAmount(step)}
                  disabled={isSpinning}
                >
                  ${step}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            className={`slot-game__spin-btn${isSpinning ? " slot-game__spin-btn--spinning" : ""}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleSpin();
            }}
            disabled={!canSpin}
          >
            {isSpinning ? (
              <span className="slot-game__spinner" />
            ) : (
              <>
                <span className="slot-game__spin-icon">▶</span>
                SPIN
              </>
            )}
          </button>
        </div>

        {/* ── Error ── */}
        {error && (
          <p className="slot-game__error">{error}</p>
        )}

        {/* ── Win banner ── */}
        {spinState === "result" && lastWin !== null && lastWin > 0 && (
          <div className="slot-game__win-banner">
            🎉 You won <strong>${lastWin.toFixed(2)}</strong>!
          </div>
        )}

      </div>
    </div>
  );
};

export default SlotGame;