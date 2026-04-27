"use client";

import { useState } from "react";

/* ─────────────────────── TYPES ─────────────────────────── */
type YieldInput = {
  state: string;
  district: string;
  season: string;
  crop: string;
  area: number;
};
type ApiResponse = { success: boolean; prediction: number };

/* ─────────────────────── DATA ───────────────────────────── */
const STATES = ["Karnataka"];
const DISTRICTS = [
  "BAGALKOT", "BANGALORE_RURAL", "BELGAUM", "BELLARY", "BENGALURU_URBAN",
  "BIDAR", "BIJAPUR", "CHAMARAJANAGAR", "CHIKBALLAPUR", "CHIKMAGALUR",
  "CHITRADURGA", "DAKSHIN_KANNAD", "DAVANGERE", "DHARWAD", "GADAG",
  "GULBARGA", "HASSAN", "HAVERI", "KODAGU", "KOLAR", "KOPPAL",
  "MANDYA", "MYSORE", "RAICHUR", "RAMANAGARA", "SHIMOGA",
  "TUMKUR", "UDUPI", "UTTAR_KANNAD", "YADGIR",
];
const SEASONS = ["Kharif", "Rabi", "Summer", "Whole Year"];
const CROPS = [
  "Arcanut (Processed)", "Arecanut", "Arhar/Tur", "Bajra", "Banana",
  "Black pepper", "Brinjal", "Cardamom", "Cashewnut", "Castor seed",
  "Coconut ", "Cotton(lint)", "Groundnut", "Horse-gram", "Jowar",
  "Maize", "Mango", "Moong(Green Gram)", "Niger seed", "Onion",
  "Paddy", "Potato", "Ragi", "Rapeseed &Mustard", "Rice",
  "Sesamum", "Soyabean", "Sugarcane", "Sunflower", "Tomato",
  "Turmeric", "Urad", "Wheat",
];

/* ─────────────────────── UTILS ──────────────────────────── */
function formatProduction(val: number) {
  if (val >= 100000) return `${(val / 100000).toFixed(2)} lakh tonnes`;
  if (val >= 1000) return `${(val / 1000).toFixed(2)} thousand tonnes`;
  return `${val.toFixed(1)} tonnes`;
}

function getYieldColor(val: number) {
  if (val > 100000) return "#2a8c4e";
  if (val > 10000) return "#3d8c40";
  if (val > 1000) return "#d4820a";
  return "#4a8ec2";
}

/* ─────────────────────── SELECT ─────────────────────────── */
function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ fontSize: 12, fontWeight: 500, color: "#3a3a2a", display: "block", marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}

const selectStyle: React.CSSProperties = {
  width: "100%", padding: "11px 14px", borderRadius: 8,
  border: "0.5px solid #d8d4c0", background: "#fafaf5",
  fontSize: 13, color: "#1a1a0a", outline: "none", cursor: "pointer",
  appearance: "none",
};

/* ─────────────────────── MAIN PAGE ─────────────────────── */
export default function YieldPredictionPage() {
  const [form, setForm] = useState<YieldInput>({
    state: "Karnataka", district: "MYSORE", season: "Kharif", crop: "Rice", area: 500,
  });
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof YieldInput>(key: K, val: YieldInput[K]) =>
    setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = async () => {
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await fetch("/api/ml/yield-prediction", {
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

  const yieldColor = result ? getYieldColor(result.prediction) : "#3d8c40";
  const yieldPerHectare = result ? result.prediction / form.area : null;

  return (
    <div style={{ minHeight: "100vh", background: "#f8f6f0", fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #2a1a00 0%, #5c3a00 100%)", borderBottom: "3px solid #c4a03a" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "20px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ fontSize: 36 }}>📊</div>
            <div>
              <h1 style={{ fontSize: 18, fontWeight: 600, color: "#fff", margin: 0 }}>Yield Prediction</h1>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", margin: "3px 0 0" }}>
                Random Forest Regressor · Karnataka crop production dataset
              </p>
            </div>
            <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
              <div style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 6, padding: "6px 14px", fontSize: 11, color: "rgba(255,255,255,0.6)", textAlign: "center" }}>
                <div style={{ opacity: 0.6, fontSize: 10 }}>Model</div>
                <div style={{ fontWeight: 600 }}>RandomForestRegressor</div>
              </div>
              <div style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 6, padding: "6px 14px", fontSize: 11, color: "rgba(255,255,255,0.6)", textAlign: "center" }}>
                <div style={{ opacity: 0.6, fontSize: 10 }}>Trees</div>
                <div style={{ fontWeight: 600 }}>n=100</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "28px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 18 }}>

          {/* Left: location + season */}
          <div style={{ background: "#fff", borderRadius: 12, border: "0.5px solid #dcd8c8", padding: "20px 22px" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#8a8070", textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 18 }}>
              Location & Season
            </div>
            <FieldRow label="State">
              <select value={form.state} onChange={(e) => set("state", e.target.value)} style={selectStyle}>
                {STATES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </FieldRow>
            <FieldRow label="District">
              <select value={form.district} onChange={(e) => set("district", e.target.value)} style={selectStyle}>
                {DISTRICTS.map((d) => <option key={d}>{d}</option>)}
              </select>
            </FieldRow>
            <FieldRow label="Season">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {SEASONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => set("season", s)}
                    style={{
                      padding: "10px 14px", borderRadius: 8, fontSize: 13,
                      border: form.season === s ? "2px solid #c4a03a" : "1px solid #e0d8c8",
                      background: form.season === s ? "#fffbe8" : "#fafaf5",
                      color: form.season === s ? "#7a6000" : "#5a5040",
                      fontWeight: form.season === s ? 600 : 400,
                      cursor: "pointer", transition: "all 0.15s",
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </FieldRow>
          </div>

          {/* Right: crop + area */}
          <div style={{ background: "#fff", borderRadius: 12, border: "0.5px solid #dcd8c8", padding: "20px 22px" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#8a8070", textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 18 }}>
              Crop & Cultivation Area
            </div>
            <FieldRow label="Crop">
              <select value={form.crop} onChange={(e) => set("crop", e.target.value)} style={selectStyle}>
                {CROPS.map((c) => <option key={c}>{c}</option>)}
              </select>
            </FieldRow>
            <FieldRow label={`Cultivation Area — ${form.area.toLocaleString()} hectares`}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 4 }}>
                <input
                  type="range" min={10} max={100000} step={10} value={form.area}
                  onChange={(e) => set("area", Number(e.target.value))}
                  style={{ flex: 1, accentColor: "#c4a03a", cursor: "pointer" }}
                />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#bcb0a0", marginTop: 4 }}>
                <span>10 ha</span><span>100,000 ha</span>
              </div>
              <input
                type="number" min={10} max={100000} value={form.area}
                onChange={(e) => set("area", Math.max(10, Number(e.target.value)))}
                style={{ ...selectStyle, marginTop: 8, width: "auto" }}
                placeholder="Enter area in hectares"
              />
            </FieldRow>

            {/* Area context */}
            <div style={{ marginTop: 8, padding: "10px 12px", background: "#faf6e8", borderRadius: 7, fontSize: 11, color: "#7a6a3a", lineHeight: 1.6 }}>
              📐 1 hectare ≈ 2.47 acres · {form.area >= 1000 ? `${(form.area / 1000).toFixed(1)}k` : form.area} ha selected
              {form.area > 10000 && " — large commercial scale"}
              {form.area < 100 && " — small farm scale"}
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: "100%", padding: "14px 0", borderRadius: 10,
            background: loading ? "#c4a86a" : "linear-gradient(135deg, #2a1a00, #c4a03a)",
            color: loading ? "#fff" : "#2a1a00", border: "none",
            fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
            boxShadow: loading ? "none" : "0 4px 14px rgba(196,160,58,0.35)",
            transition: "all 0.2s",
          }}
        >
          {loading ? "⟳ Running Random Forest…" : "Predict Production Yield →"}
        </button>
        {error && <p style={{ color: "#c0392b", fontSize: 12, marginTop: 10 }}>❌ {error}</p>}

        {/* Results */}
        {result && (
          <div style={{ marginTop: 18, display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 14, animation: "fadeUp 0.4s ease" }}>
            {/* Main result */}
            <div style={{
              background: "linear-gradient(135deg, #2a1a00, #5c3a00)",
              borderRadius: 12, padding: "24px 26px",
              display: "flex", alignItems: "center", gap: 20,
            }}>
              <div style={{ fontSize: 56 }}>🌾</div>
              <div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", letterSpacing: "1px", textTransform: "uppercase", marginBottom: 6 }}>
                  Predicted Production
                </div>
                <div style={{ fontSize: 28, fontWeight: 800, color: "#ffd68a", marginBottom: 4 }}>
                  {formatProduction(result.prediction)}
                </div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
                  {result.prediction.toFixed(0)} tonnes total
                </div>
              </div>
            </div>

            {/* Yield per hectare */}
            <div style={{ background: "#fff", borderRadius: 12, border: "0.5px solid #dcd8c8", padding: "20px 18px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div style={{ fontSize: 10, color: "#8a8070", textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 8 }}>
                Yield per Hectare
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, color: yieldColor }}>
                {yieldPerHectare !== null ? yieldPerHectare.toFixed(2) : "—"}
              </div>
              <div style={{ fontSize: 11, color: "#9a9080" }}>tonnes / ha</div>
              <div style={{ marginTop: 10, height: 4, background: "#f0ece0", borderRadius: 2, overflow: "hidden" }}>
                <div style={{
                  width: `${Math.min(100, (yieldPerHectare ?? 0) / 20 * 100)}%`,
                  height: "100%", background: yieldColor, borderRadius: 2,
                }} />
              </div>
            </div>

            {/* Crop details */}
            <div style={{ background: "#fff", borderRadius: 12, border: "0.5px solid #dcd8c8", padding: "20px 18px" }}>
              <div style={{ fontSize: 10, color: "#8a8070", textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 12 }}>
                Input Summary
              </div>
              {[
                { label: "Crop", value: form.crop },
                { label: "District", value: form.district },
                { label: "Season", value: form.season },
                { label: "Area", value: `${form.area.toLocaleString()} ha` },
              ].map((row) => (
                <div key={row.label} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "0.5px solid #f4f0e8", fontSize: 11 }}>
                  <span style={{ color: "#9a9080" }}>{row.label}</span>
                  <span style={{ fontWeight: 500, color: "#2a2a1a", maxWidth: 110, textAlign: "right" }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`@keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }`}</style>
    </div>
  );
}
