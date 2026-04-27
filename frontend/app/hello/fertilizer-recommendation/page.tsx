"use client";

import { useState } from "react";

/* ─────────────────────── TYPES ─────────────────────────── */
type FertilizerInput = {
  temperature: number;
  humidity: number;
  soil_moisture: number;
  soil_type: string;
  crop_type: string;
  nitrogen: number;
  potassium: number;
  phosphorus: number;
};

type ApiResponse = {
  success: boolean;
  prediction: string;
};

/* ─────────────────────── OPTIONS ────────────────────────── */
const SOIL_TYPES = ["Sandy", "Loamy", "Black", "Red", "Clayey"];
const CROP_TYPES = ["Maize", "Sugarcane", "Cotton", "Tobacco", "Paddy", "Barley", "Wheat", "Millets", "Oil seeds", "Pulses", "Ground Nuts"];

const SOIL_COLORS: Record<string, string> = {
  Sandy: "#d4a853", Loamy: "#8b6914", Black: "#2c2c2c",
  Red: "#c0392b", Clayey: "#7a6e5a",
};

const FERT_INFO: Record<string, { icon: string; desc: string; color: string }> = {
  "Urea": { icon: "⚗️", desc: "High nitrogen content — promotes leaf and stem growth", color: "#3a7bc8" },
  "DAP": { icon: "🔵", desc: "Di-ammonium phosphate — excellent for root development", color: "#6b4fbb" },
  "14-35-14": { icon: "🟣", desc: "Balanced NPK for flowering and fruiting stages", color: "#9b59b6" },
  "28-28": { icon: "🟢", desc: "Equal nitrogen & phosphorus blend for general growth", color: "#27ae60" },
  "17-17-17": { icon: "🟡", desc: "Balanced complete fertilizer for maintenance", color: "#d4820a" },
  "20-20": { icon: "🟠", desc: "Dual nutrient blend for uniform crop development", color: "#e07a3a" },
};

/* ─────────────────────── SUBCOMPONENTS ──────────────────── */
function NumField({
  label, value, onChange, min, max, step = 1, unit, color,
}: {
  label: string; value: number; onChange: (v: number) => void;
  min: number; max: number; step?: number; unit: string; color: string;
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
        <label style={{ fontSize: 12, fontWeight: 500, color: "#2a1a0a" }}>{label}</label>
        <span style={{ fontSize: 13, fontWeight: 700, color }}>{value}{unit}</span>
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input
          type="range" min={min} max={max} step={step} value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{ flex: 1, accentColor: color, cursor: "pointer" }}
        />
      </div>
    </div>
  );
}

function SelectGrid({
  label, options, value, onChange, colorMap,
}: {
  label: string; options: string[]; value: string;
  onChange: (v: string) => void; colorMap?: Record<string, string>;
}) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: "#7a6a5a", textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
        {options.map((opt) => {
          const selected = opt === value;
          const bg = colorMap?.[opt];
          return (
            <button
              key={opt}
              onClick={() => onChange(opt)}
              style={{
                padding: "6px 12px",
                borderRadius: 6,
                fontSize: 12,
                fontWeight: selected ? 600 : 400,
                border: selected ? "2px solid transparent" : "1px solid #e0d4c8",
                background: selected ? (bg ?? "#c46a00") : "#faf6f0",
                color: selected ? "#fff" : "#5a4a3a",
                cursor: "pointer",
                transition: "all 0.15s",
                boxShadow: selected ? `0 2px 8px ${(bg ?? "#c46a00")}40` : "none",
              }}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────────────── MAIN PAGE ─────────────────────── */
export default function FertilizerRecommendationPage() {
  const [form, setForm] = useState<FertilizerInput>({
    temperature: 28, humidity: 55, soil_moisture: 45,
    soil_type: "Loamy", crop_type: "Wheat",
    nitrogen: 30, potassium: 10, phosphorus: 20,
  });
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof FertilizerInput>(key: K, val: FertilizerInput[K]) =>
    setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = async () => {
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await fetch("/api/ml/fertilizer-recommendation", {
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

  const fertInfo = result ? (FERT_INFO[result.prediction] ?? { icon: "🌿", desc: "Specialized fertilizer for this combination.", color: "#3d8c40" }) : null;

  return (
    <div style={{ minHeight: "100vh", background: "#faf6f0", fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #3a1a00 0%, #7a3c00 100%)", borderBottom: "3px solid #d4820a" }}>
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "20px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ fontSize: 36 }}>🧪</div>
            <div>
              <h1 style={{ fontSize: 18, fontWeight: 600, color: "#fff", margin: 0 }}>Fertilizer Recommendation</h1>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", margin: "3px 0 0" }}>
                Decision Tree · 8-feature soil & crop classification
              </p>
            </div>
            <div style={{ marginLeft: "auto", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 6, padding: "6px 14px", fontSize: 11, color: "rgba(255,255,255,0.6)", textAlign: "center" }}>
              <div style={{ opacity: 0.6, fontSize: 10 }}>Model</div>
              <div style={{ fontWeight: 600 }}>DecisionTreeClassifier</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "28px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>

          {/* Left col: soil & crop selectors */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ background: "#fff", borderRadius: 12, border: "0.5px solid #e0d4c8", padding: "20px 22px" }}>
              <SelectGrid label="Soil Type" options={SOIL_TYPES} value={form.soil_type} onChange={(v) => set("soil_type", v)} colorMap={SOIL_COLORS} />
              <SelectGrid label="Crop Type" options={CROP_TYPES} value={form.crop_type} onChange={(v) => set("crop_type", v)} />
            </div>

            {/* Soil visual indicator */}
            <div style={{ background: "#fff", borderRadius: 12, border: "0.5px solid #e0d4c8", padding: "18px 20px" }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#7a6a5a", textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 14 }}>
                Selected Soil Profile
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 60, height: 60, borderRadius: 10, background: SOIL_COLORS[form.soil_type] ?? "#8b6914", boxShadow: `0 4px 12px ${(SOIL_COLORS[form.soil_type] ?? "#8b6914")}40` }} />
                <div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: "#2a1a0a" }}>{form.soil_type} Soil</div>
                  <div style={{ fontSize: 12, color: "#9a8a7a", marginTop: 2 }}>Selected for {form.crop_type}</div>
                  <div style={{ fontSize: 11, color: "#bcac9c", marginTop: 4 }}>Moisture: {form.soil_moisture}% · Temp: {form.temperature}°C</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right col: numeric inputs */}
          <div style={{ background: "#fff", borderRadius: 12, border: "0.5px solid #e0d4c8", padding: "20px 22px" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#7a6a5a", textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 18 }}>
              Environmental & Nutrient Values
            </div>
            <NumField label="Temperature" value={form.temperature} onChange={(v) => set("temperature", v)} min={10} max={50} unit="°C" color="#e07a3a" />
            <NumField label="Humidity" value={form.humidity} onChange={(v) => set("humidity", v)} min={20} max={100} unit="%" color="#4a8ec2" />
            <NumField label="Soil Moisture" value={form.soil_moisture} onChange={(v) => set("soil_moisture", v)} min={10} max={100} unit="%" color="#6db86e" />
            <div style={{ height: "0.5px", background: "#f0e8e0", margin: "8px 0 16px" }} />
            <div style={{ fontSize: 11, fontWeight: 600, color: "#7a6a5a", textTransform: "uppercase", letterSpacing: "0.7px", marginBottom: 14 }}>
              Current Soil Nutrients (mg/kg)
            </div>
            <NumField label="Nitrogen (N)" value={form.nitrogen} onChange={(v) => set("nitrogen", v)} min={0} max={60} unit=" mg/kg" color="#3d8c40" />
            <NumField label="Potassium (K)" value={form.potassium} onChange={(v) => set("potassium", v)} min={0} max={30} unit=" mg/kg" color="#4a9e6e" />
            <NumField label="Phosphorus (P)" value={form.phosphorus} onChange={(v) => set("phosphorus", v)} min={0} max={60} unit=" mg/kg" color="#6db86e" />
          </div>
        </div>

        {/* Submit */}
        <div style={{ marginTop: 18 }}>
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              width: "100%", padding: "14px 0",
              background: loading ? "#b8946a" : "linear-gradient(135deg, #7a3c00, #c46a00)",
              color: "#fff", border: "none", borderRadius: 10,
              fontSize: 15, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer",
              boxShadow: loading ? "none" : "0 4px 14px rgba(196,106,0,0.35)",
              transition: "all 0.2s",
            }}
          >
            {loading ? "⟳ Running Decision Tree…" : "Recommend Fertilizer →"}
          </button>
          {error && <p style={{ color: "#c0392b", fontSize: 12, marginTop: 10 }}>❌ {error}</p>}
        </div>

        {/* Result */}
        {result && fertInfo && (
          <div style={{
            marginTop: 18,
            background: "linear-gradient(135deg, #3a1a00, #7a3c00)",
            borderRadius: 12,
            padding: "24px 28px",
            display: "flex",
            alignItems: "center",
            gap: 24,
            animation: "fadeUp 0.4s ease",
          }}>
            <div style={{ fontSize: 56 }}>{fertInfo.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", letterSpacing: "1px", textTransform: "uppercase", marginBottom: 6 }}>
                Recommended Fertilizer
              </div>
              <div style={{ fontSize: 28, fontWeight: 700, color: "#ffd68a", marginBottom: 8 }}>
                {result.prediction}
              </div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.6 }}>
                {fertInfo.desc}
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 8, padding: "10px 16px" }}>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>Applied to</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{form.crop_type}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>{form.soil_type} soil</div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`@keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}
