"use client";

import { useState } from "react";

/* ─────────────────────── TYPES ─────────────────────────── */
type CropPredictionInput = { state: string; district: string; season: string };
type ApiResponse = { success: boolean; prediction: string; details: Record<string, string> };

/* ─────────────────────── DATA ───────────────────────────── */
// Common Indian states & districts (representative data for the Decision Tree model)
const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
];

const SEASONS = ["Kharif", "Rabi", "Summer", "Winter", "Whole Year", "Autumn"];

const SEASON_INFO: Record<string, { icon: string; months: string; color: string; desc: string }> = {
  "Kharif": { icon: "☀️", months: "Jun–Oct", color: "#d4820a", desc: "Monsoon season crops — rice, cotton, maize" },
  "Rabi": { icon: "❄️", months: "Nov–Apr", color: "#4a8ec2", desc: "Winter season crops — wheat, barley, mustard" },
  "Summer": { icon: "🌞", months: "Apr–Jun", color: "#e07a3a", desc: "Hot season crops — watermelon, cucumber" },
  "Winter": { icon: "🌨️", months: "Nov–Feb", color: "#6ba3c4", desc: "Cold weather crops — peas, spinach" },
  "Whole Year": { icon: "🔄", months: "Year-round", color: "#3d8c40", desc: "Perennial crops — sugarcane, coconut" },
  "Autumn": { icon: "🍂", months: "Aug–Nov", color: "#c46a00", desc: "Autumn harvest crops" },
};

/* ─────────────────────── PROBABILITY BAR ───────────────── */
function ProbBar({ crop, pct, color, rank }: { crop: string; pct: string; color: string; rank: number }) {
  const numPct = parseInt(pct);
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 20, height: 20, borderRadius: "50%",
            background: rank === 1 ? color : "#e8e0d8",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 10, fontWeight: 700,
            color: rank === 1 ? "#fff" : "#888",
          }}>
            {rank}
          </div>
          <span style={{ fontSize: 13, fontWeight: rank === 1 ? 600 : 400, color: rank === 1 ? "#1a2a1a" : "#5a6a5a", textTransform: "capitalize" }}>
            {crop}
          </span>
        </div>
        <span style={{ fontSize: 13, fontWeight: 600, color: rank === 1 ? color : "#888" }}>{pct}</span>
      </div>
      <div style={{ height: rank === 1 ? 10 : 6, background: "#f0ece8", borderRadius: 5, overflow: "hidden" }}>
        <div style={{
          width: `${numPct}%`, height: "100%",
          background: rank === 1 ? color : "#c8c0b8",
          borderRadius: 5,
          transition: "width 0.8s ease",
          transitionDelay: `${rank * 80}ms`,
        }} />
      </div>
    </div>
  );
}

/* ─────────────────────── MAIN PAGE ─────────────────────── */
export default function CropPredictionPage() {
  const [form, setForm] = useState<CropPredictionInput>({
    state: "Karnataka",
    district: "MYSORE",
    season: "Kharif",
  });
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await fetch("/api/ml/crop-prediction", {
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

  const seasonMeta = SEASON_INFO[form.season] ?? SEASON_INFO["Kharif"];
  const sortedCrops = result
    ? Object.entries(result.details).sort((a, b) => parseInt(b[1]) - parseInt(a[1]))
    : [];

  const inputStyle = {
    width: "100%", padding: "11px 14px", borderRadius: 8,
    border: "0.5px solid #c8d4c8", background: "#f8fbf8",
    fontSize: 13, color: "#1a2a1a", outline: "none", cursor: "pointer",
    boxSizing: "border-box" as const,
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f4f8f4", fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #1a2a1a 0%, #2a4a1a 100%)", borderBottom: "3px solid #8cc46a" }}>
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "20px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ fontSize: 36 }}>🌾</div>
            <div>
              <h1 style={{ fontSize: 18, fontWeight: 600, color: "#fff", margin: 0 }}>Crop Prediction</h1>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", margin: "3px 0 0" }}>
                Decision Tree · Region & season-based crop classification
              </p>
            </div>
            <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
              <div style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 6, padding: "6px 14px", fontSize: 11, color: "rgba(255,255,255,0.6)", textAlign: "center" }}>
                <div style={{ opacity: 0.6, fontSize: 10 }}>Model</div>
                <div style={{ fontWeight: 600 }}>Custom Decision Tree</div>
              </div>
              <div style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 6, padding: "6px 14px", fontSize: 11, color: "rgba(255,255,255,0.6)", textAlign: "center" }}>
                <div style={{ opacity: 0.6, fontSize: 10 }}>Inputs</div>
                <div style={{ fontWeight: 600 }}>State · District · Season</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "28px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>

          {/* Left: inputs */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ background: "#fff", borderRadius: 12, border: "0.5px solid #c8d8c8", padding: "20px 22px" }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#7a8a7a", textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 18 }}>
                Location Details
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 500, color: "#3a4a3a", display: "block", marginBottom: 6 }}>State</label>
                <select value={form.state} onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))} style={{ ...inputStyle, appearance: "none" }}>
                  {INDIAN_STATES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 500, color: "#3a4a3a", display: "block", marginBottom: 6 }}>
                  District <span style={{ fontSize: 11, color: "#9aaa9a", fontWeight: 400 }}>(as in training data)</span>
                </label>
                <input
                  type="text"
                  value={form.district}
                  onChange={(e) => setForm((f) => ({ ...f, district: e.target.value.toUpperCase() }))}
                  placeholder="e.g. MYSORE, BAGALKOT, BELGAUM"
                  style={inputStyle}
                />
                <p style={{ fontSize: 11, color: "#aabcaa", marginTop: 5 }}>
                  Enter district name in uppercase as it appears in the dataset
                </p>
              </div>
            </div>

            {/* Season selector */}
            <div style={{ background: "#fff", borderRadius: 12, border: "0.5px solid #c8d8c8", padding: "20px 22px" }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#7a8a7a", textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 14 }}>
                Crop Season
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {SEASONS.map((s) => {
                  const meta = SEASON_INFO[s];
                  const selected = form.season === s;
                  return (
                    <button
                      key={s}
                      onClick={() => setForm((f) => ({ ...f, season: s }))}
                      style={{
                        padding: "10px 12px", borderRadius: 8, textAlign: "left",
                        border: selected ? `2px solid ${meta.color}` : "1px solid #e0e8e0",
                        background: selected ? `${meta.color}15` : "#fafcfa",
                        cursor: "pointer", transition: "all 0.15s",
                      }}
                    >
                      <div style={{ fontSize: 16, marginBottom: 3 }}>{meta.icon}</div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: selected ? meta.color : "#3a4a3a" }}>{s}</div>
                      <div style={{ fontSize: 10, color: "#9aaa9a" }}>{meta.months}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                padding: "14px 0", borderRadius: 10,
                background: loading ? "#7aad8a" : "linear-gradient(135deg, #1a2a1a, #2a5c1a)",
                color: "#fff", border: "none", fontSize: 15, fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: loading ? "none" : "0 4px 14px rgba(26,90,26,0.35)",
                transition: "all 0.2s",
              }}
            >
              {loading ? "⟳ Running Decision Tree…" : "Predict Crop →"}
            </button>
            {error && <p style={{ color: "#c0392b", fontSize: 12 }}>❌ {error}</p>}
          </div>

          {/* Right: result */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Season context */}
            <div style={{ background: `${seasonMeta.color}15`, borderRadius: 12, border: `0.5px solid ${seasonMeta.color}50`, padding: "16px 18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ fontSize: 28 }}>{seasonMeta.icon}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: seasonMeta.color }}>{form.season} Season</div>
                  <div style={{ fontSize: 11, color: "#7a8a7a" }}>{seasonMeta.months} · {seasonMeta.desc}</div>
                </div>
              </div>
            </div>

            {/* Result card */}
            {!result && !loading && (
              <div style={{ background: "#fff", borderRadius: 12, border: "0.5px solid #c8d8c8", padding: "40px 22px", textAlign: "center", flex: 1 }}>
                <div style={{ fontSize: 44, marginBottom: 12 }}>🌿</div>
                <p style={{ fontSize: 13, color: "#7a8a7a", lineHeight: 1.6 }}>
                  Enter your location details<br />and click Predict Crop
                </p>
              </div>
            )}
            {loading && (
              <div style={{ background: "#fff", borderRadius: 12, border: "0.5px solid #c8d8c8", padding: "40px 22px", textAlign: "center", flex: 1 }}>
                <div style={{ fontSize: 36, animation: "spin 1.5s linear infinite", marginBottom: 12 }}>🌾</div>
                <p style={{ fontSize: 13, color: "#7a8a7a" }}>Traversing decision tree…</p>
              </div>
            )}

            {result && (
              <>
                {/* Best prediction */}
                <div style={{
                  background: "linear-gradient(135deg, #1a2a1a, #2a5c1a)",
                  borderRadius: 12, padding: "22px 22px",
                  display: "flex", alignItems: "center", gap: 16,
                  animation: "fadeUp 0.4s ease",
                }}>
                  <div style={{ fontSize: 48 }}>🌾</div>
                  <div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", letterSpacing: "1px", textTransform: "uppercase", marginBottom: 4 }}>
                      Top Predicted Crop
                    </div>
                    <div style={{ fontSize: 24, fontWeight: 700, color: "#8dd68c", textTransform: "capitalize" }}>
                      {result.prediction}
                    </div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 4 }}>
                      {form.state} · {form.district} · {form.season}
                    </div>
                  </div>
                </div>

                {/* Probability distribution */}
                {sortedCrops.length > 0 && (
                  <div style={{ background: "#fff", borderRadius: 12, border: "0.5px solid #c8d8c8", padding: "18px 20px", animation: "fadeUp 0.5s ease" }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "#7a8a7a", textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 14 }}>
                      Probability Distribution
                    </div>
                    {sortedCrops.map(([crop, pct], i) => (
                      <ProbBar key={crop} crop={crop} pct={pct} color="#3d8c40" rank={i + 1} />
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Input recap */}
            <div style={{ background: "#fff", borderRadius: 12, border: "0.5px solid #c8d8c8", padding: "16px 18px" }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#7a8a7a", textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 10 }}>Query Summary</div>
              {[
                { label: "State", value: form.state },
                { label: "District", value: form.district },
                { label: "Season", value: form.season },
                { label: "Model", value: "Custom Decision Tree (.pkl)" },
              ].map((row) => (
                <div key={row.label} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "0.5px solid #f0f5f0", fontSize: 12 }}>
                  <span style={{ color: "#8a9a8a" }}>{row.label}</span>
                  <span style={{ fontWeight: 500, color: "#1a2a1a" }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  );
}
