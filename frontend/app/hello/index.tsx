"use client";

import Link from "next/link";

/* ─────────────────────── TYPES ─────────────────────────── */
type ModelCard = {
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  href: string;
  model: string;
  inputs: string[];
  output: string;
  accentColor: string;
  topColor: string;
  tag: string;
};

/* ─────────────────────── DATA ───────────────────────────── */
const MODELS: ModelCard[] = [
  {
    title: "Crop Prediction",
    subtitle: "Region-based classification",
    description: "Predicts the most suitable crop based on state, district, and agricultural season using a custom-built Decision Tree trained on nationwide crop data.",
    icon: "🌾",
    href: "/crop-prediction",
    model: "Custom Decision Tree",
    inputs: ["State", "District", "Season"],
    output: "Predicted crop with probability distribution",
    accentColor: "#3d8c40",
    topColor: "#2a5c2a",
    tag: "Classification",
  },
  {
    title: "Crop Recommendation",
    subtitle: "Soil & climate optimization",
    description: "Recommends the ideal crop for your land by analyzing 7 soil and climate parameters: NPK values, temperature, humidity, pH, and annual rainfall.",
    icon: "🌱",
    href: "/crop-recommendation",
    model: "Random Forest Classifier",
    inputs: ["N", "P", "K", "Temperature", "Humidity", "pH", "Rainfall"],
    output: "Best crop recommendation",
    accentColor: "#2e7bbf",
    topColor: "#1a3a5c",
    tag: "Recommendation",
  },
  {
    title: "Fertilizer Recommendation",
    subtitle: "Nutrient deficiency detection",
    description: "Identifies the optimal fertilizer type based on soil composition, crop variety, and environmental conditions — powered by a Decision Tree classifier.",
    icon: "🧪",
    href: "/fertilizer-recommendation",
    model: "Decision Tree Classifier",
    inputs: ["Temperature", "Humidity", "Soil Moisture", "Soil Type", "Crop Type", "N", "K", "P"],
    output: "Recommended fertilizer name",
    accentColor: "#d4820a",
    topColor: "#7a3c00",
    tag: "Classification",
  },
  {
    title: "Rainfall Prediction",
    subtitle: "Historical monthly averages",
    description: "Estimates average monthly rainfall for any of India's 36 meteorological subdivisions based on historical IMD data spanning over a century (1901–2015).",
    icon: "🌧️",
    href: "/rainfall-prediction",
    model: "Lookup Table (Historical Avg)",
    inputs: ["Meteorological Region", "Month"],
    output: "Predicted rainfall in mm",
    accentColor: "#4fa3e3",
    topColor: "#0d2d4a",
    tag: "Regression",
  },
  {
    title: "Yield Prediction",
    subtitle: "Production volume forecasting",
    description: "Forecasts crop production yield for Karnataka districts using a Random Forest Regressor with one-hot encoded categorical variables and area as input.",
    icon: "📊",
    href: "/yield-prediction",
    model: "Random Forest Regressor",
    inputs: ["State", "District", "Season", "Crop", "Area (ha)"],
    output: "Predicted production in tonnes",
    accentColor: "#c4a03a",
    topColor: "#5c3a00",
    tag: "Regression",
  },
];

/* ─────────────────────── STAT CARDS ─────────────────────── */
const STATS = [
  { label: "ML Models", value: "5", icon: "🤖" },
  { label: "Algorithms", value: "3", icon: "⚙️" },
  { label: "Data Points", value: "114yr", icon: "📈" },
  { label: "Crops Covered", value: "59+", icon: "🌾" },
];

/* ─────────────────────── MAIN PAGE ─────────────────────── */
export default function KrishiNitiDashboard() {
  return (
    <div style={{ minHeight: "100vh", background: "#f4f3ef", fontFamily: "'DM Sans', 'Segoe UI', sans-serif", paddingBottom: 48 }}>
      {/* ── GOV HEADER ── */}
      <div style={{ background: "linear-gradient(135deg, #0d2d4a 0%, #163a5c 100%)", borderBottom: "3px solid #d4820a" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "18px 0 16px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0 }}>
              🌾
            </div>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: 17, fontWeight: 600, color: "#fff", margin: 0, letterSpacing: 0.3 }}>
                KrishiNiti — AI Crop Intelligence Platform
              </h1>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", margin: "3px 0 0" }}>
                Ministry of Agriculture & Farmers Welfare · ML Engine v1.0 · FastAPI + Next.js
              </p>
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 6, padding: "6px 14px", fontSize: 11, color: "rgba(255,255,255,0.65)", textAlign: "center" }}>
                <div style={{ opacity: 0.6, fontSize: 10 }}>Backend</div>
                <div style={{ fontWeight: 600 }}>FastAPI :8000</div>
              </div>
              <div style={{ background: "#2a8c4e", borderRadius: 20, padding: "4px 12px", fontSize: 11, color: "#fff", display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#7de3b4", display: "inline-block", animation: "pulse 1.5s infinite" }} />
                5 models loaded
              </div>
            </div>
          </div>

          {/* Stat strip */}
          <div style={{ display: "flex", gap: 0, padding: "12px 0" }}>
            {STATS.map((s) => (
              <div key={s.label} style={{ flex: 1, display: "flex", alignItems: "center", gap: 10, padding: "0 16px", borderRight: "1px solid rgba(255,255,255,0.08)" }}>
                <span style={{ fontSize: 20 }}>{s.icon}</span>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>{s.value}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)" }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── INTRO ── */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 24px 0" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 28 }}>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: "#1a1a18", margin: "0 0 6px" }}>
              Machine Learning Models
            </h2>
            <p style={{ fontSize: 13, color: "#6a6a60", lineHeight: 1.7, margin: 0, maxWidth: 620 }}>
              Five production-ready ML models wrapped in a FastAPI backend, each accessible via a dedicated Next.js interface. Select a model below to begin analysis.
            </p>
          </div>
          <div style={{ background: "#fff", border: "0.5px solid #ddd", borderRadius: 8, padding: "10px 16px", fontSize: 12 }}>
            <div style={{ fontSize: 10, color: "#888", marginBottom: 4 }}>API Base URL</div>
            <code style={{ fontSize: 12, color: "#1a5a9c", fontFamily: "monospace" }}>
              http://localhost:8000/api/ml/
            </code>
          </div>
        </div>

        {/* ── MODEL GRID ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {MODELS.map((model) => (
            <Link
              key={model.href}
              href={model.href}
              style={{ textDecoration: "none" }}
            >
              <div
                style={{
                  background: "#fff",
                  borderRadius: 12,
                  border: "0.5px solid #ddd",
                  overflow: "hidden",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                  height: "100%",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)";
                  (e.currentTarget as HTMLDivElement).style.boxShadow = `0 8px 24px ${model.accentColor}20`;
                  (e.currentTarget as HTMLDivElement).style.border = `0.5px solid ${model.accentColor}50`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)";
                  (e.currentTarget as HTMLDivElement).style.border = "0.5px solid #ddd";
                }}
              >
                {/* Top color bar */}
                <div style={{ height: 4, background: `linear-gradient(90deg, ${model.topColor}, ${model.accentColor})` }} />

                <div style={{ padding: "18px 18px 16px" }}>
                  {/* Icon + tag row */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <div style={{ fontSize: 32 }}>{model.icon}</div>
                    <span style={{
                      fontSize: 10, padding: "3px 8px", borderRadius: 4,
                      background: `${model.accentColor}18`, color: model.accentColor, fontWeight: 600,
                    }}>
                      {model.tag}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 style={{ fontSize: 15, fontWeight: 600, color: "#1a1a18", margin: "0 0 3px" }}>
                    {model.title}
                  </h3>
                  <p style={{ fontSize: 11, color: model.accentColor, margin: "0 0 10px", fontWeight: 500 }}>
                    {model.subtitle}
                  </p>
                  <p style={{ fontSize: 12, color: "#6a6a60", lineHeight: 1.6, margin: "0 0 14px" }}>
                    {model.description}
                  </p>

                  {/* Model badge */}
                  <div style={{ background: "#f4f3ef", borderRadius: 6, padding: "6px 10px", marginBottom: 12 }}>
                    <div style={{ fontSize: 10, color: "#888", marginBottom: 2 }}>Algorithm</div>
                    <div style={{ fontSize: 11, fontWeight: 500, color: "#333" }}>{model.model}</div>
                  </div>

                  {/* Inputs */}
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 10, color: "#888", marginBottom: 6 }}>INPUTS</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                      {model.inputs.map((inp) => (
                        <span key={inp} style={{
                          fontSize: 10, padding: "3px 8px", borderRadius: 4,
                          background: "#f4f3ef", color: "#555", border: "0.5px solid #e0ddd6",
                        }}>
                          {inp}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Output */}
                  <div style={{ padding: "8px 10px", background: `${model.accentColor}08`, borderRadius: 6, borderLeft: `3px solid ${model.accentColor}`, fontSize: 11, color: "#4a4a40", lineHeight: 1.4 }}>
                    <span style={{ color: model.accentColor, fontWeight: 600 }}>Output: </span>
                    {model.output}
                  </div>

                  {/* CTA */}
                  <div style={{ marginTop: 14, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 12, fontWeight: 500, color: model.accentColor }}>
                      Open model →
                    </span>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: `${model.accentColor}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>
                      →
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}

          {/* API status card (6th cell) */}
          <div style={{ background: "linear-gradient(135deg, #0d2d4a, #163a5c)", borderRadius: 12, padding: "18px 18px 16px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 10 }}>
                Backend API
              </div>
              <div style={{ fontSize: 24, marginBottom: 8 }}>⚡</div>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: "#fff", margin: "0 0 8px" }}>FastAPI ML Engine</h3>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", lineHeight: 1.6, margin: 0 }}>
                All models are served via a single FastAPI instance running on port 8000. Each model is preloaded as a pickle file.
              </p>
            </div>
            <div style={{ marginTop: 16 }}>
              {[
                { path: "/api/ml/crop-prediction", color: "#3d8c40" },
                { path: "/api/ml/crop-recommendation", color: "#2e7bbf" },
                { path: "/api/ml/fertilizer-recommendation", color: "#d4820a" },
                { path: "/api/ml/rainfall-prediction", color: "#4fa3e3" },
                { path: "/api/ml/yield-prediction", color: "#c4a03a" },
              ].map((ep) => (
                <div key={ep.path} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: ep.color, flexShrink: 0 }} />
                  <code style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", fontFamily: "monospace" }}>
                    POST {ep.path}
                  </code>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.35} }`}</style>
    </div>
  );
}
