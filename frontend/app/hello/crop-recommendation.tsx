"use client";

import { useState } from "react";

/* ─────────────────────── TYPES ─────────────────────────── */
type CropRecommendationInput = {
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  temperature: number;
  humidity: number;
  ph: number;
  rainfall: number;
};

type ApiResponse = {
  success: boolean;
  prediction: string;
};

/* ─────────────────────── CROP EMOJI MAP ─────────────────── */
const CROP_ICONS: Record<string, string> = {
  rice: "🌾", wheat: "🌿", maize: "🌽", cotton: "🌸", sugarcane: "🎋",
  jute: "🌱", coffee: "☕", coconut: "🥥", papaya: "🍈", banana: "🍌",
  mango: "🥭", grapes: "🍇", watermelon: "🍉", muskmelon: "🍈", apple: "🍎",
  orange: "🍊", pomegranate: "🍎", lentil: "🫘", blackgram: "🫘", mungbean: "🫘",
  mothbeans: "🫘", pigeonpeas: "🫘", kidneybeans: "🫘", chickpea: "🫘",
  default: "🌱",
};
const getCropIcon = (crop: string) =>
  CROP_ICONS[crop.toLowerCase()] ?? CROP_ICONS.default;

/* ─────────────────────── SLIDER ─────────────────────────── */
function Slider({
  label, unit, min, max, step = 1, value, onChange, color, description,
}: {
  label: string; unit: string; min: number; max: number; step?: number;
  value: number; onChange: (v: number) => void; color: string; description?: string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <div>
          <span style={{ fontSize: 13, fontWeight: 500, color: "#1a2a1a" }}>{label}</span>
          {description && (
            <span style={{ fontSize: 11, color: "#7a8a7a", marginLeft: 6 }}>{description}</span>
          )}
        </div>
        <span style={{ fontSize: 14, fontWeight: 600, color, fontVariantNumeric: "tabular-nums" }}>
          {value}{unit}
        </span>
      </div>
      <div style={{ position: "relative", height: 6, background: "#e8f0e8", borderRadius: 3 }}>
        <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${pct}%`, background: color, borderRadius: 3, transition: "width 0.15s" }} />
        <input
          type="range" min={min} max={max} step={step} value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{
            position: "absolute", top: "50%", left: 0, width: "100%",
            transform: "translateY(-50%)", opacity: 0, cursor: "pointer", height: 20, margin: 0,
          }}
        />
        <div style={{
          position: "absolute", top: "50%", left: `${pct}%`, transform: "translate(-50%, -50%)",
          width: 14, height: 14, borderRadius: "50%", background: color,
          border: "2px solid #fff", boxShadow: `0 0 0 2px ${color}40`, transition: "left 0.15s",
        }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: 10, color: "#aabcaa" }}>
        <span>{min}{unit}</span><span>{max}{unit}</span>
      </div>
    </div>
  );
}

/* ─────────────────────── MAIN PAGE ─────────────────────── */
export default function CropRecommendationPage() {
  const [form, setForm] = useState<CropRecommendationInput>({
    nitrogen: 50, phosphorus: 50, potassium: 50,
    temperature: 25, humidity: 65, ph: 6.5, rainfall: 120,
  });
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (key: keyof CropRecommendationInput) => (v: number) =>
    setForm((f) => ({ ...f, [key]: v }));

  const handleSubmit = async () => {
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await fetch("/api/ml/crop-recommendation", {
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

  const sliders = [
    { key: "nitrogen" as const, label: "Nitrogen (N)", unit: " mg/kg", min: 0, max: 140, color: "#3d8c40", description: "soil N content" },
    { key: "phosphorus" as const, label: "Phosphorus (P)", unit: " mg/kg", min: 5, max: 145, color: "#4a9e6e", description: "soil P content" },
    { key: "potassium" as const, label: "Potassium (K)", unit: " mg/kg", min: 5, max: 205, color: "#6db86e", description: "soil K content" },
    { key: "temperature" as const, label: "Temperature", unit: "°C", min: 8, max: 44, color: "#e07a3a", description: "avg daily temp" },
    { key: "humidity" as const, label: "Humidity", unit: "%", min: 14, max: 100, color: "#4a8ec2", description: "relative humidity" },
    { key: "ph" as const, label: "Soil pH", unit: "", min: 3.5, max: 10, step: 0.1, color: "#9b6fd0", description: "acidity / alkalinity" },
    { key: "rainfall" as const, label: "Rainfall", unit: " mm", min: 20, max: 300, color: "#3a9fc4", description: "annual avg" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#f0f5f0", fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #1a3a1a 0%, #2a5c2a 100%)", borderBottom: "3px solid #6db86e" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "20px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ fontSize: 36 }}>🌱</div>
            <div>
              <h1 style={{ fontSize: 18, fontWeight: 600, color: "#fff", margin: 0 }}>Crop Recommendation</h1>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", margin: "3px 0 0" }}>
                Random Forest · 7-feature soil & climate analysis
              </p>
            </div>
            <div style={{ marginLeft: "auto", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 6, padding: "6px 14px", fontSize: 11, color: "rgba(255,255,255,0.6)", textAlign: "center" }}>
              <div style={{ opacity: 0.6, fontSize: 10 }}>Model</div>
              <div style={{ fontWeight: 600 }}>RandomForestClassifier</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "28px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 20 }}>

          {/* Left: sliders */}
          <div style={{ background: "#fff", borderRadius: 12, border: "0.5px solid #d4e4d4", padding: "22px 24px" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#7a9a7a", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 20 }}>
              Soil & Climate Parameters
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 28px" }}>
              {sliders.slice(0, 3).map((s) => {
                const { key, ...sliderProps } = s;
                return <Slider key={key} {...sliderProps} value={form[key]} onChange={set(key)} />;
              })}
              <div style={{ gridColumn: "1 / -1", height: "0.5px", background: "#e8f0e8", margin: "4px 0 16px" }} />
              {sliders.slice(3).map((s) => {
                const { key, ...sliderProps } = s;
                return <Slider key={key} {...sliderProps} value={form[key]} onChange={set(key)} />;
              })}
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                width: "100%", marginTop: 8, padding: "13px 0",
                background: loading ? "#7aad8a" : "linear-gradient(135deg, #2a5c2a, #3d8c40)",
                color: "#fff", border: "none", borderRadius: 8,
                fontSize: 14, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer",
                boxShadow: loading ? "none" : "0 4px 12px rgba(42,92,42,0.3)",
                transition: "all 0.2s",
              }}
            >
              {loading ? "⟳ Analyzing soil profile…" : "Recommend Best Crop →"}
            </button>
            {error && <p style={{ color: "#c0392b", fontSize: 12, marginTop: 10 }}>❌ {error}</p>}
          </div>

          {/* Right: result + inputs summary */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Result card */}
            <div style={{
              background: result ? "linear-gradient(135deg, #1a3a1a, #0f5b38)" : "#fff",
              borderRadius: 12,
              border: result ? "none" : "0.5px solid #d4e4d4",
              padding: "24px 22px",
              transition: "background 0.4s",
              minHeight: 180,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
            }}>
              {!result && !loading && (
                <>
                  <div style={{ fontSize: 40, marginBottom: 10 }}>🌾</div>
                  <p style={{ fontSize: 13, color: "#7a9a7a", margin: 0 }}>
                    Adjust the soil parameters<br />and click Recommend
                  </p>
                </>
              )}
              {loading && (
                <>
                  <div style={{ fontSize: 32, marginBottom: 10, animation: "spin 2s linear infinite" }}>🌱</div>
                  <p style={{ fontSize: 13, color: "#7a9a7a" }}>Running model inference…</p>
                </>
              )}
              {result && (
                <>
                  <div style={{ fontSize: 52, marginBottom: 10 }}>{getCropIcon(result.prediction)}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", letterSpacing: "1px", textTransform: "uppercase", marginBottom: 6 }}>
                    Recommended Crop
                  </div>
                  <div style={{ fontSize: 26, fontWeight: 700, color: "#7de3b4", textTransform: "capitalize" }}>
                    {result.prediction}
                  </div>
                  <div style={{ marginTop: 14, padding: "8px 16px", background: "rgba(125,227,180,0.12)", borderRadius: 20, fontSize: 12, color: "rgba(255,255,255,0.6)" }}>
                    ✅ Model confidence: High
                  </div>
                </>
              )}
            </div>

            {/* Current values summary */}
            <div style={{ background: "#fff", borderRadius: 12, border: "0.5px solid #d4e4d4", padding: "16px 18px" }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#7a9a7a", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 12 }}>
                Current Input Summary
              </div>
              {sliders.map((s) => (
                <div key={s.key} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "0.5px solid #f0f5f0", fontSize: 12 }}>
                  <span style={{ color: "#7a9a7a" }}>{s.label}</span>
                  <span style={{ fontWeight: 600, color: s.color }}>
                    {form[s.key]}{s.unit}
                  </span>
                </div>
              ))}
            </div>

            {/* NPK Visual */}
            <div style={{ background: "#fff", borderRadius: 12, border: "0.5px solid #d4e4d4", padding: "16px 18px" }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#7a9a7a", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 12 }}>
                NPK Balance
              </div>
              {[
                { label: "N", val: form.nitrogen, max: 140, color: "#3d8c40" },
                { label: "P", val: form.phosphorus, max: 145, color: "#4a9e6e" },
                { label: "K", val: form.potassium, max: 205, color: "#6db86e" },
              ].map((item) => (
                <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 24, height: 24, borderRadius: "50%", background: item.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                    {item.label}
                  </div>
                  <div style={{ flex: 1, height: 8, background: "#e8f0e8", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ width: `${(item.val / item.max) * 100}%`, height: "100%", background: item.color, borderRadius: 4, transition: "width 0.3s" }} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: item.color, minWidth: 32, textAlign: "right" }}>
                    {item.val}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
