import React, { useState, useEffect } from "react";
import SlotCard, { type SlotCardData } from "./SlotCard";
import "./SlotPage.scss";

type FilterTab = "all" | "hot" | "new";

const SlotPage: React.FC = () => {
  const [slots,        setSlots]        = useState<SlotCardData[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
  const [search,       setSearch]       = useState("");

  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const res  = await fetch("/api/slot/list");
        const data = await res.json();
        setSlots(data);
      } catch (err) {
        console.error("Failed to load slots", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSlots();
  }, []);

  const filtered = slots.filter((s) => {
    const matchesSearch  = s.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter  =
      activeFilter === "all" ||
      (activeFilter === "hot" && s.isHot) ||
      (activeFilter === "new" && s.isNew);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="slot-page">
      <div className="slot-page__scanlines" aria-hidden="true" />

      <header className="slot-page__header">
        <div className="slot-page__header-glow" aria-hidden="true" />
        <p className="slot-page__header-eyebrow">Casino · Slots</p>
        <h1 className="slot-page__title">Spin & Win</h1>
        <p className="slot-page__subtitle">
          Choose your game — every spin is a shot at glory
        </p>
      </header>

      <div className="slot-page__controls">
        <div className="slot-page__search-wrap">
          <svg className="slot-page__search-icon" viewBox="0 0 20 20" fill="none">
            <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M13 13l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            className="slot-page__search"
            type="text"
            placeholder="Search slots…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="slot-page__filters">
          {(["all", "hot", "new"] as FilterTab[]).map((tab) => (
            <button
              key={tab}
              className={`slot-page__filter-btn${activeFilter === tab ? " slot-page__filter-btn--active" : ""}`}
              onClick={() => setActiveFilter(tab)}
            >
              {tab === "all" && "All Games"}
              {tab === "hot" && "🔥 Hot"}
              {tab === "new" && "✦ New"}
            </button>
          ))}
        </div>
      </div>

      <div className="slot-page__divider" aria-hidden="true" />

      <main className="slot-page__grid-wrap">
        {loading ? (
          <div className="slot-page__empty">
            <span className="slot-page__empty-icon">🎰</span>
            <p>Loading slots…</p>
          </div>
        ) : filtered.length > 0 ? (
          <div className="slot-page__grid">
            {filtered.map((slot) => (
              <SlotCard key={slot.id} slot={slot} />
            ))}
          </div>
        ) : (
          <div className="slot-page__empty">
            <span className="slot-page__empty-icon">🎰</span>
            <p>No slots found for <strong>"{search}"</strong></p>
          </div>
        )}
      </main>
    </div>
  );
};

export default SlotPage;