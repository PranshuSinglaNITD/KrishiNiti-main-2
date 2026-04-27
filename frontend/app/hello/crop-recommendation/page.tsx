"use client";
import { Droplets, Thermometer, CloudRain, FlaskConical } from "lucide-react";
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

/* ─────────────────────── NUMBER INPUT FIELD ─────────────── */
function Field({
  label, unit, min, max, step = 1, value, onChange, color, icon,
}: {
  label: string; unit: string; min: number; max: number; step?: number;
  value: number; onChange: (v: number) => void; color: string; icon: string;
}) {
  const [focused, setFocused] = useState(false);
  const clamp = (v: number) => Math.min(max, Math.max(min, parseFloat(v.toFixed(2))));

  return (
    <div style={{
      background: focused ? "#f8fdf8" : "#fff",
      border: `1.5px solid ${focused ? color : "#d4e4d4"}`,
      borderRadius: 10, padding: "12px 14px",
      transition: "all 0.15s",
      boxShadow: focused ? `0 0 0 3px ${color}18` : "none",
    }}>
      {/* Label row */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
        <span style={{ fontSize: 16 }}>{icon}</span>
        <span style={{ fontSize: 12, fontWeight: 600, color: "#3a5a3a", flex: 1 }}>{label}</span>
        <span style={{ fontSize: 10, fontWeight: 600, color, background: `${color}18`, borderRadius: 4, padding: "2px 6px" }}>
          {unit || "value"}
        </span>
      </div>

      {/* − number + */}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <button
          onClick={() => onChange(clamp(value - step))}
          style={{
            width: 28, height: 28, borderRadius: 6,
            border: `1px solid ${color}40`, background: `${color}10`,
            color, fontSize: 18, fontWeight: 700,
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}
        >−</button>

        <input
          type="number"
          min={min} max={max} step={step} value={value}
          onFocus={() => setFocused(true)}
          onBlur={(e) => { setFocused(false); onChange(clamp(parseFloat(e.target.value) || min)); }}
          onChange={(e) => { const v = parseFloat(e.target.value); if (!isNaN(v)) onChange(v); }}
          style={{
            flex: 1, height: 36, border: "none", outline: "none",
            background: "transparent", fontSize: 20, fontWeight: 700,
            color, textAlign: "center", fontVariantNumeric: "tabular-nums",
          } as React.CSSProperties}
        />

        <button
          onClick={() => onChange(clamp(value + step))}
          style={{
            width: 28, height: 28, borderRadius: 6,
            border: `1px solid ${color}40`, background: `${color}10`,
            color, fontSize: 18, fontWeight: 700,
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}
        >+</button>
      </div>

      {/* Range hint */}
      <div style={{ textAlign: "center", fontSize: 10, color: "#aabcaa", marginTop: 4 }}>
        range: {min} – {max}
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
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        throw new Error(errBody.error || `HTTP ${res.status}`);
      }
      const data: ApiResponse = await res.json();
      if (!data.success) throw new Error("Model returned unsuccessful response");
      setResult(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setLoading(false);
    }
  };

  const fields: {
      key: keyof CropRecommendationInput;
  label: string;
  unit: string;
  min: number;
  max: number;
  step?: number;
  color: string;
   icon: any ; 
  }[] = [
    { key: "nitrogen",    label: "Nitrogen (N)",   unit: "mg/kg", min: 0,   max: 140,       color: "#3d8c40", icon: "" },
    { key: "phosphorus",  label: "Phosphorus (P)", unit: "mg/kg", min: 5,   max: 145,       color: "#4a9e6e", icon: "" },
    { key: "potassium",   label: "Potassium (K)",  unit: "mg/kg", min: 5,   max: 205,       color: "#6db86e", icon: "" },
    {
    key: "humidity",
    label: "Humidity",
    unit: "%",
    min: 14,
    max: 100,
    color: "#4a8ec2",
    icon: <Droplets size={18} />,
  },
  {
    key: "temperature",
    label: "Temperature",
    unit: "°C",
    min: 8,
    max: 44,
    color: "#e07a3a",
    icon: <Thermometer size={18} />,
  },
  {
    key: "rainfall",
    label: "Rainfall",
    unit: "mm",
    min: 20,
    max: 300,
    color: "#3a9fc4",
    icon: <CloudRain size={18} />,
  },
  {
    key: "ph",
    label: "Soil pH",
    unit: "pH",
    min: 3.5,
    max: 10,
    color: "#9b6fd0",
    icon: <FlaskConical size={18} />,
  },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#f0f5f0", fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
      <style>{`
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        input[type=number] { -moz-appearance: textfield; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #1a3a1a 0%, #2a5c2a 100%)", borderBottom: "3px solid #6db86e" }}>
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "20px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ fontSize: 36 }}>🌱</div>
            <div>
              <h1 style={{ fontSize: 18, fontWeight: 600, color: "#fff", margin: 0 }}>Crop Recommendation</h1>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", margin: "3px 0 0" }}>
                Random Forest · 7-feature soil &amp; climate analysis
              </p>
            </div>
            <div style={{ marginLeft: "auto", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 6, padding: "6px 14px", fontSize: 11, color: "rgba(255,255,255,0.6)", textAlign: "center" }}>
              <div style={{ opacity: 0.6, fontSize: 10 }}>Model</div>
              <div style={{ fontWeight: 600 }}>RandomForestClassifier</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "28px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20 }}>

          {/* ── Left: input fields ── */}
          <div style={{ background: "#fff", borderRadius: 12, border: "0.5px solid #d4e4d4", padding: "22px 24px" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#7a9a7a", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 4 }}>
              Soil &amp; Climate Parameters
            </div>
            <p style={{ fontSize: 12, color: "#9aaa9a", marginTop: 4, marginBottom: 20 }}>
              Type a value directly or use − / + to adjust.
            </p>

            {/* Soil nutrients */}
            <div style={{ fontSize: 10, fontWeight: 700, color: "#7a9a7a", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10 }}>
              🌿 Soil Nutrients
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
              {fields.slice(0, 3).map((f) => (
                <Field {...f} value={form[f.key]} onChange={set(f.key)} />
              ))}
            </div>

            {/* Climate */}
            <div style={{ fontSize: 10, fontWeight: 700, color: "#7a9a7a", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10 }}>
              ☁️ Climate Conditions
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }}>
              {fields.slice(3).map((f) => (
                <Field {...f} value={form[f.key]} onChange={set(f.key)} />
              ))}
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                width: "100%", padding: "14px 0",
                background: loading ? "#7aad8a" : "linear-gradient(135deg, #2a5c2a, #3d8c40)",
                color: "#fff", border: "none", borderRadius: 8,
                fontSize: 15, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer",
                boxShadow: loading ? "none" : "0 4px 12px rgba(42,92,42,0.3)",
                transition: "all 0.2s",
              }}
            >
              {loading ? "⟳  Analysing soil profile…" : "Recommend Best Crop →"}
            </button>

            {error && <p style={{ color: "#c0392b", fontSize: 12, marginTop: 10 }}>❌ {error}</p>}
          </div>

          {/* ── Right: result + summary ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Result card */}
            <div style={{
              background: result ? "linear-gradient(135deg, #1a3a1a, #0f5b38)" : "#fff",
              borderRadius: 12,
              border: result ? "none" : "0.5px solid #d4e4d4",
              padding: "28px 22px",
              transition: "background 0.4s",
              minHeight: 200,
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              textAlign: "center",
            }}>
              {!result && !loading && (
                <>
                  <div style={{ fontSize: 44, marginBottom: 10 }}>🌾</div>
                  <p style={{ fontSize: 13, color: "#7a9a7a", margin: 0 }}>
                    Enter your soil &amp; climate values<br />and click Recommend
                  </p>
                </>
              )}
              {loading && (
                <div style={{ fontSize: 36, animation: "spin 2s linear infinite" }}>🌱</div>
              )}
              {result && (
                <div style={{ animation: "fadeIn 0.4s ease" }}>
                  <div style={{ fontSize: 56, marginBottom: 10 }}>{getCropIcon(result.prediction)}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", letterSpacing: "1px", textTransform: "uppercase", marginBottom: 6 }}>
                    Recommended Crop
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: "#7de3b4", textTransform: "capitalize" }}>
                    {result.prediction}
                  </div>
                  <div style={{ marginTop: 14, padding: "8px 16px", background: "rgba(125,227,180,0.12)", borderRadius: 20, fontSize: 12, color: "rgba(255,255,255,0.6)" }}>
                    ✅ Model confidence: High
                  </div>
                </div>
              )}
            </div>

            {/* Input summary */}
            <div style={{ background: "#fff", borderRadius: 12, border: "0.5px solid #d4e4d4", padding: "16px 18px" }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#7a9a7a", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 12 }}>
                Input Summary
              </div>
              {fields.map((f) => (
                <div key={f.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "0.5px solid #f0f5f0", fontSize: 12 }}>
                  <span style={{ color: "#7a9a7a" }}>{f.icon} {f.label}</span>
                  <span style={{ fontWeight: 700, color: f.color }}>{form[f.key]} {f.unit}</span>
                </div>
              ))}
            </div>

            {/* NPK balance */}
            <div style={{ background: "#fff", borderRadius: 12, border: "0.5px solid #d4e4d4", padding: "16px 18px" }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#7a9a7a", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 12 }}>
                NPK Balance
              </div>
              {[
                { label: "N", val: form.nitrogen,   max: 140, color: "#3d8c40" },
                { label: "P", val: form.phosphorus, max: 145, color: "#4a9e6e" },
                { label: "K", val: form.potassium,  max: 205, color: "#6db86e" },
              ].map((item) => (
                <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 24, height: 24, borderRadius: "50%", background: item.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                    {item.label}
                  </div>
                  <div style={{ flex: 1, height: 8, background: "#e8f0e8", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ width: `${Math.min((item.val / item.max) * 100, 100)}%`, height: "100%", background: item.color, borderRadius: 4, transition: "width 0.3s" }} />
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
    </div>
  );
}