import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AnimeMascot from "../components/AnimeMascot";

// ── Helpers ───────────────────────────────────────────────────────────────────
let _id = 0;
const genId = () => `h_${Date.now()}_${++_id}`;

const fmtDate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const MONTH_COLORS = [
  "#3b82f6", // Jan: Blue
  "#ec4899", // Feb: Pink
  "#10b981", // Mar: Emerald
  "#8b5cf6", // Apr: Purple
  "#f59e0b", // May: Amber
  "#06b6d4", // Jun: Cyan
  "#ef4444", // Jul: Red
  "#14b8a6", // Aug: Teal
  "#f97316", // Sep: Orange
  "#e11d48", // Oct: Rose
  "#6366f1", // Nov: Indigo
  "#059669", // Dec: Green
];
const DAY_SHORT = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

const DEFAULT_HABITS = [
  { id: "h1", name: "Exercise" },
  { id: "h2", name: "Read 30 min" },
  { id: "h3", name: "Meditate" },
];

// ── Main Component ─────────────────────────────────────────────────────────────
function Dashboard() {
  const navigate = useNavigate();
  const now = new Date();

  // ── Core state ────────────────────────────────────────────────────────────
  const [year,        setYear]        = useState(now.getFullYear());
  const [month,       setMonth]       = useState(now.getMonth());   // 0-indexed
  const [viewMode,    setViewMode]    = useState("month");          // "month" | "week"
  const [weekOffset,  setWeekOffset]  = useState(0);
  const [habits,      setHabits]      = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("ht_data") || "{}");
      return saved.habits || DEFAULT_HABITS;
    } catch {
      return DEFAULT_HABITS;
    }
  });
  const [completions, setCompletions] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("ht_data") || "{}");
      return saved.completions || {};
    } catch {
      return {};
    }
  });
  const [newName,        setNewName]        = useState("");
  const [editingId,      setEditingId]      = useState(null);
  const [editName,       setEditName]       = useState("");
  const [userName]                          = useState(() => localStorage.getItem("userName") || "Friend");
  const [signupDate,     setSignupDate]     = useState(() => localStorage.getItem("signupDate") || fmtDate(now));
  const [triggerMascot,  setTriggerMascot]  = useState(0);
  const [lockAlert,      setLockAlert]      = useState("");

  const doneColor = MONTH_COLORS[month];
  const skipColor = "#1f2937";

  const isBeforeSignup = (date) => fmtDate(date) < signupDate;
  const isToday = (date) => fmtDate(date) === fmtDate(now);

  // ── Auth guard & MongoDB sync ─────────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }

    // Fetch user dashboard info
    fetch("http://localhost:5000/api/dashboard", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.user?.signupDate) {
          setSignupDate(data.user.signupDate);
          localStorage.setItem("signupDate", data.user.signupDate);
        }
      })
      .catch(() => {});

    // Fetch completion logs from MongoDB
    fetch("http://localhost:5000/api/habits/completions", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.completions) {
          setCompletions(data.completions);
        }
      })
      .catch(() => {});
  }, [navigate]);

  // ── Persist habits to localStorage ───────────────────────────────────────
  useEffect(() => {
    localStorage.setItem("ht_data", JSON.stringify({ habits, completions }));
  }, [habits, completions]);

  // ── Derived date ranges ───────────────────────────────────────────────────
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthDays = Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1));

  // First day-of-week of the 1st of the month
  const monthStartDow = new Date(year, month, 1).getDay();
  // Sunday of week[weekOffset]
  const weekStart = new Date(year, month, 1 - monthStartDow + weekOffset * 7);
  const weekDays  = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  const viewDays = viewMode === "month" ? monthDays : weekDays;

  // ── Completion helpers ────────────────────────────────────────────────────
  const key      = (hid, date)  => `${hid}_${fmtDate(date)}`;
  const isDone   = (hid, date)  => !!completions[key(hid, date)];
  const toggle   = async (hid, hName, date) => {
    const dateStr = fmtDate(date);
    if (dateStr < signupDate) {
      setLockAlert(`🔒 Cannot edit past days before your signup date (${signupDate})!`);
      setTimeout(() => setLockAlert(""), 4000);
      return;
    }

    const k = key(hid, date);
    const isNowDone = !completions[k];

    setCompletions(prev => {
      const next = { ...prev };
      isNowDone ? (next[k] = true) : delete next[k];
      return next;
    });

    if (isNowDone) {
      setTriggerMascot(prev => prev + 1);
    }

    // Sync status change to backend MongoDB database
    try {
      const token = localStorage.getItem("token");
      if (token) {
        await fetch("http://localhost:5000/api/habits/toggle", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            habitId: hid,
            habitName: hName,
            date: dateStr,
            status: isNowDone ? "completed" : "missed",
          }),
        });
      }
    } catch (err) {
      console.error("Error syncing habit toggle:", err);
    }
  };

  const habitCount = (h) => viewDays.filter(d => isDone(h.id, d)).length;
  const habitPct   = (h) => viewDays.length ? Math.round((habitCount(h) / viewDays.length) * 100) : 0;
  const dayTotal   = (date) => habits.filter(h => isDone(h.id, date)).length;
  const maxDay     = Math.max(...viewDays.map(dayTotal), 1);

  // ── Habit CRUD ────────────────────────────────────────────────────────────
  const addHabit = () => {
    if (!newName.trim() || habits.length >= 10) return;
    setHabits(p => [...p, { id: genId(), name: newName.trim() }]);
    setNewName("");
  };
  const removeHabit = (id) => setHabits(p => p.filter(h => h.id !== id));
  const startEdit   = (h)  => { setEditingId(h.id); setEditName(h.name); };
  const saveEdit    = ()   => {
    if (editName.trim())
      setHabits(p => p.map(h => h.id === editingId ? { ...h, name: editName.trim() } : h));
    setEditingId(null);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    navigate("/login");
  };

  // ── Calendar grid (month view) ────────────────────────────────────────────
  const renderMonthCalendar = () => {
    const firstDow = new Date(year, month, 1).getDay();
    const totalCells = Math.ceil((firstDow + daysInMonth) / 7) * 7;

    return (
      <div className="hd-cal-grid">
        {DAY_SHORT.map(d => <div key={d} className="hd-cal-head">{d}</div>)}
        {Array.from({ length: totalCells }, (_, i) => {
          const dayNum = i - firstDow + 1;
          if (dayNum < 1 || dayNum > daysInMonth)
            return <div key={`e${i}`} className="hd-cal-cell empty" />;
          const date  = new Date(year, month, dayNum);
          const total = dayTotal(date);
          const pct   = habits.length ? total / habits.length : 0;
          const locked = isBeforeSignup(date);
          const itIsToday = isToday(date);
          const bg    = locked ? "rgba(255,255,255,0.02)" : (total === 0 ? skipColor
            : pct === 1 ? doneColor
            : `${doneColor}${Math.round(pct * 155 + 100).toString(16).padStart(2, "0")}`);
          return (
            <div
              key={dayNum}
              className={`hd-cal-cell${locked ? " disabled-day" : ""}${itIsToday ? " today-cell" : ""}`}
              style={{
                background: bg,
                border: itIsToday ? "2px solid #f472b6" : undefined,
                boxShadow: itIsToday ? "0 0 12px rgba(244,114,182,0.6)" : undefined,
              }}
              title={itIsToday ? `Today (${fmtDate(date)})` : (locked ? `Locked: prior to signup date (${signupDate})` : `${total}/${habits.length} habits`)}
            >
              <span className="hd-cal-num">{dayNum}</span>
              {itIsToday && <span className="hd-today-badge">TODAY</span>}
              {total > 0 && !locked && !itIsToday && <span className="hd-cal-badge">{total}</span>}
              {locked && <span style={{ fontSize: "9px" }}>🔒</span>}
            </div>
          );
        })}
      </div>
    );
  };

  const renderWeekCalendar = () => (
    <div className="hd-cal-week">
      {weekDays.map(day => {
        const total  = dayTotal(day);
        const pct    = habits.length ? total / habits.length : 0;
        const inMon  = day.getMonth() === month;
        const locked = isBeforeSignup(day);
        const itIsToday = isToday(day);
        const bg     = locked ? "rgba(255,255,255,0.02)" : (total === 0 ? skipColor
          : pct === 1 ? doneColor
          : `${doneColor}${Math.round(pct * 155 + 100).toString(16).padStart(2, "0")}`);
        return (
          <div key={fmtDate(day)} className={`hd-week-day${inMon ? "" : " dim"}${locked ? " disabled-day" : ""}${itIsToday ? " today-cell" : ""}`}>
            <div className="hd-week-dayname" style={{ color: itIsToday ? "#f472b6" : undefined }}>
              {DAY_SHORT[day.getDay()]} {itIsToday ? "★" : ""}
            </div>
            <div className="hd-week-circle" style={{ background: bg, border: itIsToday ? "2px solid #f472b6" : undefined }}>
              {locked ? "🔒" : day.getDate()}
            </div>
            <div className="hd-week-count" style={{ color: total > 0 && !locked ? doneColor : "#6b7280" }}>
              {locked ? "Locked" : `${total}/${habits.length}`}
            </div>
          </div>
        );
      })}
    </div>
  );

  // ── SVG Bar Chart ─────────────────────────────────────────────────────────
  const renderBarChart = () => {
    const H    = 160;
    const cols = viewDays.length;
    const barW = Math.max(10, Math.min(48, Math.floor(720 / cols) - 6));
    const gap  = 5;
    const padL = 36;
    const W    = padL + cols * (barW + gap);

    return (
      <svg className="hd-barchart-svg" viewBox={`0 0 ${W} ${H + 36}`} preserveAspectRatio="xMidYMid meet">
        {/* Gridlines */}
        {[0, 0.25, 0.5, 0.75, 1].map(f => {
          const y = H - f * H;
          return (
            <g key={f}>
              <line x1={padL} y1={y} x2={W} y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
              <text x={padL - 5} y={y + 4} fontSize="9" fill="#6b7280" textAnchor="end">
                {Math.round(f * habits.length)}
              </text>
            </g>
          );
        })}
        {/* Bars */}
        {viewDays.map((day, i) => {
          const total = dayTotal(day);
          const barH  = total > 0 ? Math.max(4, (total / maxDay) * H) : 0;
          const x     = padL + i * (barW + gap);
          const y     = H - barH;
          const inMon = day.getMonth() === month;
          return (
            <g key={fmtDate(day)}>
              <rect x={x} y={y} width={barW} height={barH}
                fill={inMon ? doneColor : `${doneColor}66`} rx="4" />
              {barW >= 14 && (
                <text x={x + barW / 2} y={H + 14} fontSize="9"
                  fill={inMon ? "#9ca3af" : "#4b5563"} textAnchor="middle">
                  {day.getDate()}
                </text>
              )}
              {total > 0 && barH > 14 && (
                <text x={x + barW / 2} y={y - 4} fontSize="10"
                  fill="#fff" textAnchor="middle" fontWeight="600">
                  {total}
                </text>
              )}
            </g>
          );
        })}
        {/* X-axis line */}
        <line x1={padL} y1={H} x2={W} y2={H} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
      </svg>
    );
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="hd-root">

      {/* ── Top Header ───────────────────────────────────────────────────── */}
      <header className="hd-topbar">
        <div className="hd-topbar-logo">
          <span className="hd-logo-icon">🌸</span>
          HabitTracker <span style={{ fontSize: "12px", color: "#f472b6", fontWeight: "700" }}>Anime Edition</span>
        </div>
        <div className="hd-topbar-right">
          <div className="hd-avatar">{userName.charAt(0).toUpperCase()}</div>
          <span className="hd-uname">{userName}</span>
          <button id="logout-btn" className="hd-btn-logout" onClick={logout}>Logout</button>
        </div>
      </header>

      <div className="hd-body">

        {/* ── Lock Alert Banner ────────────────────────────────────────────── */}
        {lockAlert && (
          <div className="hd-date-locked-banner">
            {lockAlert}
          </div>
        )}

        {/* ── Anime Mascot Section ─────────────────────────────────────────── */}
        <AnimeMascot triggerEvent={triggerMascot} completedCount={dayTotal(now)} />

        {/* ── Control Bar ──────────────────────────────────────────────────── */}
        <section className="hd-controls">
          <div className="hd-ctrl-row">

            <div className="hd-ctrl-group">
              <label className="hd-lbl" htmlFor="ctrl-year">Year</label>
              <input id="ctrl-year" className="hd-input" type="number"
                min="2000" max="2099" value={year}
                onChange={e => setYear(Number(e.target.value))} />
            </div>

            <div className="hd-ctrl-group">
              <label className="hd-lbl" htmlFor="ctrl-month">Month</label>
              <select id="ctrl-month" className="hd-input" value={month}
                onChange={e => { setMonth(Number(e.target.value)); setWeekOffset(0); }}>
                {MONTH_NAMES.map((n, i) => <option key={i} value={i}>{n}</option>)}
              </select>
            </div>

            <div className="hd-ctrl-group">
              <label className="hd-lbl">View</label>
              <div className="hd-toggle">
                <button id="btn-month-view"
                  className={`hd-tog-btn${viewMode === "month" ? " active" : ""}`}
                  onClick={() => setViewMode("month")}>📅 Month</button>
                <button id="btn-week-view"
                  className={`hd-tog-btn${viewMode === "week" ? " active" : ""}`}
                  onClick={() => setViewMode("week")}>📆 Week</button>
              </div>
            </div>

            {viewMode === "week" && (
              <div className="hd-ctrl-group">
                <label className="hd-lbl">Week</label>
                <div className="hd-week-nav">
                  <button className="hd-arrow" onClick={() => setWeekOffset(p => p - 1)}>‹</button>
                  <span className="hd-week-label">W{weekOffset + 1}</span>
                  <button className="hd-arrow" onClick={() => setWeekOffset(p => p + 1)}>›</button>
                </div>
              </div>
            )}

            <div className="hd-ctrl-group">
              <label className="hd-lbl">Quick Jump</label>
              <button
                id="btn-go-today"
                className="hd-add-btn"
                style={{ height: "36px", padding: "0 14px", fontSize: "12px", background: "linear-gradient(135deg,#ec4899,#8b5cf6)" }}
                onClick={() => {
                  const today = new Date();
                  setYear(today.getFullYear());
                  setMonth(today.getMonth());
                  setWeekOffset(0);
                }}
                title={`Jump to Today (${fmtDate(now)})`}
              >
                📍 Today
              </button>
            </div>

            <div className="hd-ctrl-group">
              <label className="hd-lbl">Signup Date 🔒</label>
              <div className="hd-info-pill hd-pill-accent">{signupDate}</div>
            </div>

            <div className="hd-ctrl-group">
              <label className="hd-lbl">Monthly Palette</label>
              <div className="hd-month-color-boxes">
                {MONTH_COLORS.map((col, idx) => (
                  <div
                    key={idx}
                    id={`month-color-${idx}`}
                    className={`hd-month-color-box${idx === month ? " active" : ""}`}
                    style={{ backgroundColor: col }}
                    onClick={() => { setMonth(idx); setWeekOffset(0); }}
                    title={`${MONTH_NAMES[idx]}: ${col}`}
                  >
                    {idx === month && <span className="hd-checkmark">✓</span>}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </section>

        {/* ── Main Row: Habits Panel + Calendar ────────────────────────────── */}
        <div className="hd-main-row">

          {/* Left: Habits */}
          <section className="hd-habits-panel">
            <div className="hd-sec-header">
              <h2 className="hd-sec-title">📋 Habits</h2>
              <span className="hd-badge">{habits.length}/10</span>
            </div>

            <div className="hd-habit-list">
              {habits.map(h => {
                const cnt = habitCount(h);
                const pct = habitPct(h);
                return (
                  <div key={h.id} className="hd-habit-card" id={`habit-${h.id}`}>
                    <div className="hd-habit-top">
                      {editingId === h.id ? (
                        <input className="hd-edit-inp" value={editName}
                          onChange={e => setEditName(e.target.value)}
                          onBlur={saveEdit}
                          onKeyDown={e => e.key === "Enter" && saveEdit()}
                          autoFocus />
                      ) : (
                        <span className="hd-habit-name" onClick={() => startEdit(h)}
                          title="Click to rename">{h.name}</span>
                      )}
                      <div className="hd-habit-btns">
                        <span className="hd-cnt">{cnt}/{viewDays.length}</span>
                        <button className="hd-ico-btn" onClick={() => startEdit(h)} title="Rename">✏️</button>
                        <button className="hd-ico-btn danger" onClick={() => removeHabit(h.id)} title="Delete">🗑</button>
                      </div>
                    </div>
                    <div className="hd-prog-track">
                      <div className="hd-prog-fill" style={{ width: `${pct}%`, background: doneColor }} />
                    </div>
                    <div className="hd-pct-row">
                      <span className="hd-pct-label" style={{ color: doneColor }}>{pct}% complete</span>
                    </div>
                  </div>
                );
              })}

              {habits.length === 0 && (
                <p className="hd-empty-msg">No habits yet. Add one below!</p>
              )}
            </div>

            {habits.length < 10 ? (
              <div className="hd-add-row">
                <input id="add-habit-input" className="hd-add-inp" type="text"
                  placeholder="New habit name…" maxLength={40}
                  value={newName} onChange={e => setNewName(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && addHabit()} />
                <button id="add-habit-btn" className="hd-add-btn" onClick={addHabit}>+ Add</button>
              </div>
            ) : (
              <p className="hd-limit-note">Maximum 10 habits reached</p>
            )}
          </section>

          {/* Right: Calendar */}
          <section className="hd-calendar-panel">
            <div className="hd-sec-header">
              <h2 className="hd-sec-title">
                {viewMode === "month" ? "📅" : "📆"} {MONTH_NAMES[month]} {year}
              </h2>
              <div className="hd-legend">
                <div className="hd-legend-item">
                  <span className="hd-legend-dot" style={{ background: doneColor }} />
                  <span>Completed</span>
                </div>
                <div className="hd-legend-item">
                  <span className="hd-legend-dot" style={{ background: skipColor }} />
                  <span>Incomplete</span>
                </div>
                <div className="hd-legend-item">
                  <span className="hd-legend-dot" style={{ background: "rgba(255,255,255,0.05)" }}>🔒</span>
                  <span>Locked</span>
                </div>
              </div>
            </div>
            {viewMode === "month" ? renderMonthCalendar() : renderWeekCalendar()}
          </section>
        </div>

        {/* ── Grid Tracker ─────────────────────────────────────────────────── */}
        <section className="hd-section">
          <div className="hd-sec-header">
            <h2 className="hd-sec-title">
              📊 Habit Grid — {viewMode === "month" ? MONTH_NAMES[month] : `Week ${weekOffset + 1}`} {year}
            </h2>
            <span className="hd-sec-sub">Click checkboxes to toggle (Days prior to signup date are locked)</span>
          </div>
          <div className="hd-grid-scroll">
            <table className="hd-grid">
              <thead>
                <tr>
                  <th className="hd-gh-habit">Habit</th>
                  {viewDays.map(day => {
                    const itIsToday = isToday(day);
                    return (
                      <th key={fmtDate(day)} className={`hd-gh-day${itIsToday ? " today-col" : ""}`}>
                        <div className="hd-gh-dn" style={{ color: itIsToday ? "#f472b6" : undefined }}>{DAY_SHORT[day.getDay()]}</div>
                        <div className={`hd-gh-num${day.getMonth() !== month ? " dim" : ""}${itIsToday ? " today-num" : ""}`}>
                          {isBeforeSignup(day) ? "🔒" : day.getDate()}
                        </div>
                        {itIsToday && <div className="hd-grid-today-tag">TODAY</div>}
                      </th>
                    );
                  })}
                  <th className="hd-gh-sum">Total</th>
                  <th className="hd-gh-pct">%</th>
                </tr>
              </thead>
              <tbody>
                {habits.map(h => (
                  <tr key={h.id}>
                    <td className="hd-gd-habit">{h.name}</td>
                    {viewDays.map(day => {
                      const done = isDone(h.id, day);
                      const disabled = isBeforeSignup(day);
                      const itIsToday = isToday(day);
                      return (
                        <td key={fmtDate(day)} className={`hd-gd-cell${itIsToday ? " today-cell" : ""}`}>
                          <label className={`hd-cb-wrap${disabled ? " disabled" : ""}`} title={disabled ? `Locked: prior to signup date (${signupDate})` : `${h.name} – ${fmtDate(day)}`}>
                            <input type="checkbox" className="hd-cb-native"
                              checked={done}
                              disabled={disabled}
                              onChange={() => toggle(h.id, h.name, day)}
                              id={`cb_${h.id}_${fmtDate(day)}`} />
                            <span className={`hd-cb-box${disabled ? " locked" : ""}`}
                              style={{
                                background: done && !disabled ? doneColor : "transparent",
                                borderColor: done && !disabled ? doneColor : (itIsToday ? "#f472b6" : "#374151"),
                              }} />
                          </label>
                        </td>
                      );
                    })}
                    <td className="hd-gd-sum">{habitCount(h)}</td>
                    <td className="hd-gd-pct" style={{ color: doneColor }}>{habitPct(h)}%</td>
                  </tr>
                ))}

                {/* Totals row */}
                <tr className="hd-totals-row">
                  <td className="hd-gd-habit hd-totals-label">Daily Total</td>
                  {viewDays.map(day => {
                    const t = dayTotal(day);
                    const locked = isBeforeSignup(day);
                    return (
                      <td key={fmtDate(day)} className="hd-gd-cell hd-total-cell"
                        style={{ color: t > 0 && !locked ? doneColor : "#4b5563", fontWeight: t > 0 ? 700 : 400 }}>
                        {locked ? "-" : t}
                      </td>
                    );
                  })}
                  <td className="hd-gd-sum" style={{ color: doneColor }}>
                    {viewDays.reduce((s, d) => s + (isBeforeSignup(d) ? 0 : dayTotal(d)), 0)}
                  </td>
                  <td className="hd-gd-pct" />
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Bar Chart ────────────────────────────────────────────────────── */}
        <section className="hd-section">
          <div className="hd-sec-header">
            <h2 className="hd-sec-title">
              📈 Daily Completions — {viewMode === "month" ? MONTH_NAMES[month] : `Week ${weekOffset + 1}`} {year}
            </h2>
          </div>
          <div className="hd-chart-wrap">
            {renderBarChart()}
          </div>
          <div className="hd-chart-legend">
            <span style={{ color: doneColor }}>■</span> Habits completed per day
          </div>
        </section>

      </div>
    </div>
  );
}

export default Dashboard;
