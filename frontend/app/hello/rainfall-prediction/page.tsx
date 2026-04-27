"use client";

import { useState } from "react";

/* ─────────────────────── TYPES ─────────────────────────── */
type RainfallInput = { region: string; month: string };
type ApiResponse = { success: boolean; prediction: number };

/* ─────────────────────── DATA ───────────────────────────── */
const REGIONS = [
  "ANDAMAN & NICOBAR ISLANDS", "ARUNACHAL PRADESH", "ASSAM & MEGHALAYA",
  "NAGA MANI MIZO TRIPURA", "SUB HIMALAYAN WEST BENGAL & SIKKIM",
  "GANGETIC WEST BENGAL", "ORISSA", "JHARKHAND", "BIHAR",
  "EAST UTTAR PRADESH", "WEST UTTAR PRADESH", "UTTARAKHAND",
  "HARYANA DELHI & CHANDIGARH", "PUNJAB", "HIMACHAL PRADESH",
  "JAMMU & KASHMIR", "WEST RAJASTHAN", "EAST RAJASTHAN",
  "WEST MADHYA PRADESH", "EAST MADHYA PRADESH", "GUJARAT REGION",
  "SAURASHTRA & KUTCH", "KONKAN & GOA", "MADHYA MAHARASHTRA",
  "MATATHWADA", "VIDARBHA", "CHHATTISGARH", "COASTAL ANDHRA PRADESH",
  "TELANGANA", "RAYALSEEMA", "TAMIL NADU", "COASTAL KARNATAKA",
  "NORTH INTERIOR KARNATAKA", "SOUTH INTERIOR KARNATAKA", "KERALA",
  "LAKSHADWEEP",
];

const MONTHS = [
  { key: "JAN", label: "January", short: "Jan" },
  { key: "FEB", label: "February", short: "Feb" },
  { key: "MAR", label: "March", short: "Mar" },
  { key: "APR", label: "April", short: "Apr" },
  { key: "MAY", label: "May", short: "May" },
  { key: "JUN", label: "June", short: "Jun" },
  { key: "JUL", label: "July", short: "Jul" },
  { key: "AUG", label: "August", short: "Aug" },
  { key: "SEP", label: "September", short: "Sep" },
  { key: "OCT", label: "October", short: "Oct" },
  { key: "NOV", label: "November", short: "Nov" },
  { key: "DEC", label: "December", short: "Dec" },
];

// Indicative intensity for rain drop animation (0-1 scale)
const MONSOON_MONTHS = ["JUN", "JUL", "AUG", "SEP"];

function getRainIntensity(mm: number) {
  if (mm < 20) return { label: "Very Low", color: "#a8d4f5", drops: 1 };
  if (mm < 80) return { label: "Low", color: "#4fa3e3", drops: 2 };
  if (mm < 150) return { label: "Moderate", color: "#2e7bbf", drops: 3 };
  if (mm < 250) return { label: "High", color: "#1a5a9c", drops: 4 };
  return { label: "Very High", color: "#0d3d70", drops: 5 };
}

function RainDrops({ count, color }: { count: number; color: string }) {
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          style={{
            width: 8, height: 12,
            borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
            background: i < count ? color : "#e0e8f0",
            transition: "background 0.3s",
          }}
        />
      ))}
    </div>
  );
}

function MonthBar({ month, isSelected, onClick }: { month: typeof MONTHS[0]; isSelected: boolean; onClick: () => void }) {
  const isMonsoon = MONSOON_MONTHS.includes(month.key);
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1, padding: "10px 0", display: "flex", flexDirection: "column",
        alignItems: "center", gap: 5, border: "none", borderRadius: 8,
        background: isSelected ? "linear-gradient(180deg, #1a5a9c, #2e7bbf)" : isMonsoon ? "#e8f4fd" : "#f4f8fc",
        cursor: "pointer", transition: "all 0.15s",
        boxShadow: isSelected ? "0 2px 8px rgba(46,123,191,0.35)" : "none",
        borderBottom: isMonsoon && !isSelected ? "2px solid #4fa3e3" : "2px solid transparent",
      }}
    >
      <span style={{ fontSize: 11, fontWeight: isSelected ? 700 : 500, color: isSelected ? "#fff" : isMonsoon ? "#1a5a9c" : "#556677" }}>
        {month.short}
      </span>
      {isMonsoon && !isSelected && <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#4fa3e3" }} />}
    </button>
  );
}

/* ─────────────────────── MAIN PAGE ─────────────────────── */
export default function RainfallPredictionPage() {
  const [form, setForm] = useState<RainfallInput>({ region: "KERALA", month: "JUN" });
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await fetch("/api/ml/rainfall-prediction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setResult(await res.json());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setLoading(false);
    }
  };

  const selectedMonthLabel = MONTHS.find((m) => m.key === form.month)?.label ?? form.month;
  const intensity = result ? getRainIntensity(result.prediction) : null;

  return (
    <div style={{ minHeight: "100vh", background: "#f0f4f8", fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #0a1f3c 0%, #163a5c 100%)", borderBottom: "3px solid #4fa3e3" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "20px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ fontSize: 36 }}>🌧️</div>
            <div>
              <h1 style={{ fontSize: 18, fontWeight: 600, color: "#fff", margin: 0 }}>Rainfall Prediction</h1>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", margin: "3px 0 0" }}>
                Lookup Table · Historical monthly averages (1901–2015)
              </p>
            </div>
            <div style={{ marginLeft: "auto", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 6, padding: "6px 14px", fontSize: 11, color: "rgba(255,255,255,0.6)", textAlign: "center" }}>
              <div style={{ opacity: 0.6, fontSize: 10 }}>Regions</div>
              <div style={{ fontWeight: 600 }}>36 subdivisions</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "28px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 18 }}>

          {/* Left col */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Region select */}
            <div style={{ background: "#fff", borderRadius: 12, border: "0.5px solid #d0dde8", padding: "20px 22px" }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#6a7e8a", textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 12 }}>
                Meteorological Subdivision
              </div>
              <select
                value={form.region}
                onChange={(e) => setForm((f) => ({ ...f, region: e.target.value }))}
                style={{
                  width: "100%", padding: "11px 14px", borderRadius: 8,
                  border: "0.5px solid #c0d0dc", background: "#f8fbfd",
                  fontSize: 13, color: "#1a2a3a", outline: "none", cursor: "pointer",
                  appearance: "none",
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center",
                }}
              >
                {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            {/* Month selector */}
            <div style={{ background: "#fff", borderRadius: 12, border: "0.5px solid #d0dde8", padding: "20px 22px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#6a7e8a", textTransform: "uppercase", letterSpacing: "0.7px" }}>
                  Month
                </div>
                <div style={{ fontSize: 11, color: "#4fa3e3", fontWeight: 500 }}>
                  🌧 Monsoon: Jun–Sep
                </div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {MONTHS.map((m) => (
                  <MonthBar
                    key={m.key}
                    month={m}
                    isSelected={form.month === m.key}
                    onClick={() => setForm((f) => ({ ...f, month: m.key }))}
                  />
                ))}
              </div>
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                padding: "14px 0", borderRadius: 10,
                background: loading ? "#7aadc8" : "linear-gradient(135deg, #0a1f3c, #2e7bbf)",
                color: "#fff", border: "none", fontSize: 15, fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: loading ? "none" : "0 4px 14px rgba(46,123,191,0.35)",
                transition: "all 0.2s",
              }}
            >
              {loading ? "⟳ Fetching rainfall data…" : "Predict Rainfall →"}
            </button>
            {error && <p style={{ color: "#c0392b", fontSize: 12 }}>❌ {error}</p>}
          </div>

          {/* Right col: result */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Main result */}
            <div style={{
              background: result ? `linear-gradient(160deg, ${intensity!.color}, #0a1f3c)` : "#fff",
              borderRadius: 12,
              border: result ? "none" : "0.5px solid #d0dde8",
              padding: "28px 22px",
              textAlign: "center",
              minHeight: 200,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              transition: "background 0.4s",
              position: "relative",
              overflow: "hidden",
            }}>
              {!result && !loading && (
                <>
                  <div style={{ fontSize: 44, marginBottom: 10 }}>☁️</div>
                  <p style={{ fontSize: 13, color: "#7a8a9a", margin: 0 }}>Select a region & month<br />to predict rainfall</p>
                </>
              )}
              {loading && (
                <>
                  <div style={{ fontSize: 36, marginBottom: 10, animation: "rain 0.6s linear infinite" }}>🌧️</div>
                  <p style={{ fontSize: 13, color: "#7a8a9a" }}>Querying data…</p>
                </>
              )}
              {result && intensity && (
                <>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", letterSpacing: "1.2px", textTransform: "uppercase", marginBottom: 8 }}>
                    Average Rainfall
                  </div>
                  <div style={{ fontSize: 52, fontWeight: 800, color: "#fff", lineHeight: 1, marginBottom: 4 }}>
                    {result.prediction.toFixed(1)}
                  </div>
                  <div style={{ fontSize: 18, color: "rgba(255,255,255,0.6)", marginBottom: 16 }}>mm</div>
                  <RainDrops count={intensity.drops} color="#fff" />
                  <div style={{ marginTop: 10, fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.85)" }}>
                    {intensity.label} Rainfall
                  </div>
                  <div style={{ marginTop: 6, fontSize: 11, color: "rgba(255,255,255,0.45)" }}>
                    {selectedMonthLabel} · {form.region.split(" ").slice(0, 2).join(" ")}
                  </div>
                </>
              )}
            </div>

            {/* Context card */}
            <div style={{ background: "#fff", borderRadius: 12, border: "0.5px solid #d0dde8", padding: "16px 18px" }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#6a7e8a", textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 12 }}>
                Selection Summary
              </div>
              {[
                { label: "Region", value: form.region },
                { label: "Month", value: selectedMonthLabel },
                { label: "Data source", value: "IMD 1901–2015" },
                { label: "Method", value: "Historical avg" },
              ].map((row) => (
                <div key={row.label} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "0.5px solid #eef2f6", fontSize: 12 }}>
                  <span style={{ color: "#8a9aaa" }}>{row.label}</span>
                  <span style={{ fontWeight: 500, color: "#1a2a3a", maxWidth: 170, textAlign: "right", lineHeight: 1.4, fontSize: 11 }}>{row.value}</span>
                </div>
              ))}
            </div>

            {/* Seasonal tip */}
            {form.month && (
              <div style={{ background: MONSOON_MONTHS.includes(form.month) ? "#e8f4fd" : "#f0f5ea", borderRadius: 12, border: `0.5px solid ${MONSOON_MONTHS.includes(form.month) ? "#4fa3e3" : "#9dcc78"}`, padding: "12px 16px", fontSize: 12, color: MONSOON_MONTHS.includes(form.month) ? "#1a5a9c" : "#3a6a1a", lineHeight: 1.6 }}>
                {MONSOON_MONTHS.includes(form.month)
                  ? "☔ This is a peak monsoon month. Expect significantly elevated rainfall across most Indian subdivisions."
                  : "🌤 This is a non-monsoon month. Rainfall is typically lower except in regions with regional rain patterns."}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes rain { 0%,100%{transform:translateY(0)} 50%{transform:translateY(4px)} }
      `}</style>
    </div>
  );
}
