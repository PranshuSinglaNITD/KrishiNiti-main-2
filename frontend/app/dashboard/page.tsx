"use client";

import { useState, useEffect, useRef } from "react";
import LocationAutoFill from "@/components/LocationAutoFill";

/* ─────────────────────────── TYPES ─────────────────────────── */

type Mandi = {
  name: string;
  distance_km: number;
  current_price: number;
  avg_7_day_price: number;
  predicted_prices_next_7_days: number[];
  price_volatility: number;
  demand_score: number;
  confidence: number;
};

type ProfitOption = {
  mandi: string;
  distance_km: number;
  transport_cost: number;
  expected_price: number;
  net_profit: number;
  profit_margin_percent: number;
};

type AIResponse = {
  input: {
    crop: string;
    quantity_quintal: number;
    location: string;
    harvest_in_days: number;
  };
  harvest_intelligence: {
    recommended_harvest_day: number;
    harvest_window: string;
    crop_maturity_score: number;
    weather_impact: string;
    risk_alerts: string[];
  };
  market_intelligence: {
    overall_trend: string;
    arrival_trend: string;
    mandis: Mandi[];
  };
  profit_optimization: {
    transport_cost_per_km: number;
    options: ProfitOption[];
    best_option: { mandi: string; net_profit: number };
  };
  decision_engine: {
    sell_today_profit: number;
    wait_days: number;
    sell_later_profit: number;
    profit_difference: number;
    action: string;
    confidence_score: number;
  };
  recommendation: {
    best_mandi: string;
    best_day_to_sell_in_days: number;
    expected_profit_gain: number;
    reasoning: string;
    summary: string;
  };
  market_visuals: {
    mandis: {
      name: string;
      image_url: string;
      place_description: string;
      google_maps_search: string;
    }[];
  };
};

/* ─────────────────────── HELPERS ───────────────────────────── */

const INR = (val: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(val);

const pct = (val: number) => `${Math.round(val * 100)}%`;

const LOCATIONIQ_KEY = "pk.e6953260361dea8f4b758c4a2528aefa";

/* ─────────────────── SPARKLINE SVG ─────────────────────────── */

function Sparkline({ prices, color }: { prices: number[]; color: string }) {
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;
  const W = 80, H = 28;
  const pts = prices.map(
    (p, i) => `${(i / (prices.length - 1)) * W},${H - ((p - min) / range) * (H - 4) - 2}`
  );
  const polyline = pts.join(" ");
  const area = `0,${H} ${polyline} ${W},${H}`;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id={`sg-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#sg-${color})`} />
      <polyline points={polyline} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={pts[pts.length - 1].split(",")[0]} cy={pts[pts.length - 1].split(",")[1]} r="2.5" fill={color} />
    </svg>
  );
}

/* ─────────────────── PRICE FORECAST CHART ──────────────────── */

function ForecastChart({ mandis }: { mandis: Mandi[] }) {
  const COLORS = ["#2e7bbf", "#2a8c4e", "#d4820a"];
  const days = ["D1", "D2", "D3", "D4", "D5", "D6", "D7"];
  const allPrices = mandis.flatMap((m) => m.predicted_prices_next_7_days);
  const minP = Math.min(...allPrices) - 30;
  const maxP = Math.max(...allPrices) + 30;
  const range = maxP - minP;
  const W = 520, H = 160, padL = 52, padR = 10, padT = 10, padB = 28;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const toX = (i: number) => padL + (i / 6) * chartW;
  const toY = (p: number) => padT + chartH - ((p - minP) / range) * chartH;
  const yTicks = 4;
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible" }}>
      {Array.from({ length: yTicks + 1 }).map((_, i) => {
        const y = padT + (i / yTicks) * chartH;
        const val = maxP - (i / yTicks) * range;
        return (
          <g key={i}>
            <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="#e0ddd6" strokeWidth="0.5" />
            <text x={padL - 6} y={y + 4} textAnchor="end" fontSize="10" fill="#8a8880">{Math.round(val)}</text>
          </g>
        );
      })}
      {days.map((d, i) => (
        <text key={i} x={toX(i)} y={H - 6} textAnchor="middle" fontSize="10" fill="#8a8880">{d}</text>
      ))}
      {mandis.map((m, mi) => {
        const pts = m.predicted_prices_next_7_days.map((p, i) => `${toX(i)},${toY(p)}`).join(" ");
        const area = `${toX(0)},${padT + chartH} ${pts} ${toX(6)},${padT + chartH}`;
        return (
          <g key={mi}>
            <defs>
              <linearGradient id={`fg${mi}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={COLORS[mi]} stopOpacity="0.15" />
                <stop offset="100%" stopColor={COLORS[mi]} stopOpacity="0" />
              </linearGradient>
            </defs>
            <polygon points={area} fill={`url(#fg${mi})`} />
            <polyline points={pts} fill="none" stroke={COLORS[mi]} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
            {m.predicted_prices_next_7_days.map((p, i) => (
              <circle key={i} cx={toX(i)} cy={toY(p)} r="2.5" fill={COLORS[mi]} />
            ))}
          </g>
        );
      })}
      {mandis.map((m, mi) => (
        <g key={mi}>
          <rect x={padL + mi * 160} y={H - 12} width={8} height={8} rx="2" fill={COLORS[mi]} />
          <text x={padL + mi * 160 + 12} y={H - 5} fontSize="10" fill="#5a5955">
            {m.name.replace(" Mandi", "")}
          </text>
        </g>
      ))}
    </svg>
  );
}

/* ─────────────────────── TIMELINE ──────────────────────────── */

function HarvestTimeline() {
  const steps = [
    { day: "Today", label: "Query filed", status: "done" },
    { day: "Day 5", label: "Field prep", status: "done" },
    { day: "Day 10", label: "Harvest", status: "now" },
    { day: "Day 12", label: "Drying", status: "future" },
    { day: "Day 15", label: "Sell at Pipariya", status: "future" },
  ];
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 0, marginTop: 4 }}>
      {steps.map((s, i) => (
        <div key={i} style={{ flex: 1, textAlign: "center", position: "relative" }}>
          {i < steps.length - 1 && (
            <div style={{
              position: "absolute", top: 10, left: "50%", right: "-50%", height: 2,
              background: s.status === "done" ? "#2a8c4e" : s.status === "now" ? "#2e7bbf" : "#ddd",
              zIndex: 0,
            }} />
          )}
          <div style={{
            width: 22, height: 22, borderRadius: "50%", margin: "0 auto 6px",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 10, position: "relative", zIndex: 1,
            background: s.status === "done" ? "#2a8c4e" : s.status === "now" ? "#2e7bbf" : "#f0efeb",
            border: s.status === "now" ? "2px solid #a8d4f5" : "none",
            color: s.status === "future" ? "#888" : "#fff", fontWeight: 500,
          }}>
            {s.status === "done" ? "✓" : s.status === "now" ? "●" : "○"}
          </div>
          <div style={{ fontSize: 11, fontWeight: 500, color: "#333", lineHeight: 1.2 }}>{s.day}</div>
          <div style={{ fontSize: 10, color: "#888", lineHeight: 1.3 }}>{s.label}</div>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────── DEMAND GAUGE ──────────────────────────── */

function DemandGauge({ score, color }: { score: number; color: string }) {
  const r = 22, cx = 28, cy = 28, circ = 2 * Math.PI * r;
  const filled = (score / 100) * circ;
  return (
    <svg width={56} height={56} viewBox="0 0 56 56">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e8e6df" strokeWidth="5" />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="5"
        strokeDasharray={`${filled} ${circ - filled}`} strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`} />
      <text x={cx} y={cy + 4} textAnchor="middle" fontSize="11" fontWeight="500" fill={color}>{score}</text>
    </svg>
  );
}

/* ─────────────────────── MAIN PAGE ─────────────────────────── */

export default function AnalyzePage() {
  const [query, setQuery] = useState("");
  const [data, setData] = useState<AIResponse | null>(null);
  const [location, setLocation] = useState<{ city: string; state: string } | null>(null);
  const [locLoading, setLocLoading] = useState(false);
  const [locError, setLocError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "market" | "harvest" | "profit">("overview");
  const [animIn, setAnimIn] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (data) {
      setAnimIn(false);
      requestAnimationFrame(() => setAnimIn(true));
    }
  }, [data]);

  const handleLocationFound = (loc: { city: string; state: string }) => {
    setLocation(loc);
    setLocError(null);
  };

  const detectLocation = async () => {
    setLocLoading(true);
    setLocError(null);
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true, timeout: 6000, maximumAge: 0,
        })
      );
      const { latitude, longitude } = pos.coords;
      const res = await fetch(
        `https://us1.locationiq.com/v1/reverse?key=${LOCATIONIQ_KEY}&lat=${latitude}&lon=${longitude}&format=json`
      );
      const geo = await res.json();
      const city = geo.address?.city || geo.address?.town || geo.address?.village ||
        geo.address?.county || geo.address?.state_district || "";
      const state = geo.address?.state || "";
      if (city || state) {
        handleLocationFound({ city, state });
      } else {
        setLocError("Location found but city/state could not be determined.");
      }
    } catch (err: unknown) {
      const isGeoError = typeof GeolocationPositionError !== "undefined" &&
        err instanceof GeolocationPositionError;
      const msg = isGeoError
        ? (err as GeolocationPositionError).code === 1
          ? "Location permission denied. Please allow access in your browser."
          : "Could not determine your location. Try again."
        : "Location detection failed. Please try again.";
      setLocError(msg);
    } finally {
      setLocLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const res = await fetch("/api/ai-response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          city: location?.city ?? null,
          state: location?.state ?? null,
        }),
      });
      if (!res.ok) throw new Error(`Request failed: ${res.status} ${res.statusText}`);
      const result: AIResponse = await res.json();
      setData(result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleAnalyze();
  };

  const MANDI_COLORS = ["#2e7bbf", "#2a8c4e", "#d4820a"];
  const maxProfit = data ? Math.max(...data.profit_optimization.options.map((o) => o.net_profit)) : 1;

  return (
    <div style={{ minHeight: "100vh", background: "#f4f3ef", fontFamily: "'DM Sans', 'Segoe UI', sans-serif", paddingBottom: 40 }}>

      {/* ── GOV HEADER ── */}
      <div style={{ background: "linear-gradient(135deg, #0d2d4a 0%, #163a5c 100%)", color: "#fff", borderBottom: "3px solid #d4820a" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 0 12px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
            <div style={{ width: 54, height: 54, borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 }}>
              🌾
            </div>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: 16, fontWeight: 600, color: "#fff", margin: 0, letterSpacing: 0.3 }}>
                AI Crop Intelligence Dashboard
              </h1>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", margin: "2px 0 0" }}>
                Ministry of Agriculture & Farmers Welfare — Market Intelligence Division
              </p>
            </div>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 6, padding: "6px 14px", fontSize: 11, color: "rgba(255,255,255,0.75)", textAlign: "center", lineHeight: 1.5 }}>
                <div style={{ opacity: 0.6, fontSize: 10 }}>Report ID</div>
                <div style={{ fontWeight: 600 }}>KIF-2025-0415</div>
                <div style={{ opacity: 0.6, fontSize: 10 }}>
                  {location ? `${location.city}${location.city && location.state ? ", " : ""}${location.state}` : "Hoshangabad, MP"}
                </div>
              </div>
              <div style={{ background: data ? "#2a8c4e" : "rgba(255,255,255,0.1)", borderRadius: 20, padding: "4px 12px", fontSize: 11, color: "#fff", display: "flex", alignItems: "center", gap: 5, transition: "background 0.3s" }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: data ? "#7de3b4" : "rgba(255,255,255,0.4)", display: "inline-block", animation: data ? "pulse 1.5s infinite" : "none" }} />
                {data ? "Live" : "Awaiting input"}
              </div>
            </div>
          </div>
          {data && (
            <div style={{ display: "flex", gap: 0 }}>
              {(["overview", "market", "harvest", "profit"] as const).map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: "10px 18px", fontSize: 12, color: activeTab === tab ? "#fff" : "rgba(255,255,255,0.45)", background: "none", border: "none", borderBottom: activeTab === tab ? "2px solid #4fa3e3" : "2px solid transparent", cursor: "pointer", transition: "all 0.15s", fontWeight: activeTab === tab ? 500 : 400, textTransform: "capitalize" }}>
                  {tab}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "20px 24px 0" }}>

        {/* ── RISK ALERTS ── */}
        {data && data.harvest_intelligence.risk_alerts.map((alert, i) => (
          <div key={i} style={{ background: "#fff9e6", border: "0.5px solid #e6a817", borderLeft: "4px solid #e6a817", borderRadius: 8, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "#7a5100", marginBottom: 16 }}>
            <span style={{ fontSize: 16 }}>⚠️</span>
            <strong style={{ fontWeight: 500 }}>Risk Alert:</strong>&nbsp;{alert}
          </div>
        ))}

        {/* ══════════════════════════════════════════════
            INPUT CARD — IMPROVED
        ══════════════════════════════════════════════ */}
        <div style={{
          background: "#fff",
          borderRadius: 12,
          border: "0.5px solid #e0ddd6",
          padding: "18px 20px",
          marginBottom: 20,
          boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
        }}>

          {/* Row 1 — search input */}
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <span style={{ fontSize: 18, flexShrink: 0, opacity: 0.5 }}>🔍</span>
            <input
              ref={inputRef}
              type="text"
              placeholder="e.g. 50 quintal wheat, Hoshangabad MP, harvest in 10 days"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              style={{
                flex: 1,
                border: "1.5px solid #e0ddd6",
                borderRadius: 8,
                padding: "11px 14px",
                fontSize: 13,
                outline: "none",
                background: "#fafaf8",
                color: "#1a1a18",
                fontFamily: "inherit",
                transition: "border-color 0.2s, box-shadow 0.2s",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#2e7bbf";
                e.target.style.boxShadow = "0 0 0 3px rgba(46,123,191,0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#e0ddd6";
                e.target.style.boxShadow = "none";
              }}
            />
            <button
              onClick={handleAnalyze}
              disabled={loading}
              style={{
                background: loading ? "#7aadcf" : "#1a3a5c",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "11px 24px",
                fontSize: 13,
                fontWeight: 500,
                cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "inherit",
                transition: "background 0.2s",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => { if (!loading) (e.currentTarget.style.background = "#254f7a"); }}
              onMouseLeave={(e) => { if (!loading) (e.currentTarget.style.background = "#1a3a5c"); }}
            >
              {loading ? "Analyzing…" : "Analyze crop →"}
            </button>
          </div>

          {/* Divider */}
          <div style={{ borderTop: "0.5px solid #f0efeb", margin: "12px 0" }} />

          {/* Row 2 — location strip */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>

            {/* Detect button */}
            <button
              onClick={detectLocation}
              disabled={locLoading}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                background: locLoading ? "#f0f4f8" : "#fff",
                color: locLoading ? "#8aadca" : "#1a3a5c",
                border: `1.5px solid ${locError ? "#e0a8a8" : "#c8d8ea"}`,
                borderRadius: 8,
                padding: "8px 14px",
                fontSize: 12.5,
                fontWeight: 500,
                cursor: locLoading ? "not-allowed" : "pointer",
                fontFamily: "inherit",
                transition: "all 0.2s",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => { if (!locLoading) { e.currentTarget.style.background = "#e8f2fc"; e.currentTarget.style.borderColor = "#2e7bbf"; } }}
              onMouseLeave={(e) => { if (!locLoading) { e.currentTarget.style.background = "#fff"; e.currentTarget.style.borderColor = "#c8d8ea"; } }}
            >
              {locLoading ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" style={{ animation: "spin 1s linear infinite", flexShrink: 0 }}>
                    <circle cx="8" cy="8" r="6" strokeDasharray="20 10" />
                  </svg>
                  Detecting…
                </>
              ) : (
                <>
                  <LocationPinIcon />
                  Detect my location
                </>
              )}
            </button>

            {/* "or" divider */}
            <span style={{ fontSize: 11, color: "#c0bdb6", flexShrink: 0 }}>or enter manually above</span>

            {/* Location badge — shown once location is set */}
            {location && !locLoading && (
              <div style={{
                display: "flex", alignItems: "center", gap: 6,
                background: "#e8f7ee", border: "1px solid #b3dfc6",
                borderRadius: 20, padding: "5px 12px 5px 10px",
                fontSize: 12, color: "#1a5c38", marginLeft: "auto",
                animation: "fadeSlideIn 0.2s ease",
              }}>
                <svg width="13" height="13" viewBox="0 0 16 16" fill="#2a8c4e" style={{ flexShrink: 0 }}>
                  <path d="M13 5.5a5 5 0 1 0-10 0c0 3.5 5 9.5 5 9.5s5-6 5-9.5z"/>
                  <circle cx="8" cy="5.5" r="1.8" fill="#fff"/>
                </svg>
                <span style={{ fontWeight: 500 }}>
                  {location.city}{location.city && location.state ? ", " : ""}{location.state}
                </span>
                <button
                  onClick={() => { setLocation(null); setLocError(null); }}
                  title="Clear location"
                  style={{
                    background: "none", border: "none", padding: "0 0 0 2px",
                    fontSize: 16, cursor: "pointer", color: "#3a8a5c",
                    lineHeight: 1, display: "flex", alignItems: "center",
                  }}
                >×</button>
              </div>
            )}

            {/* Hint when nothing is set */}
            {!location && !locLoading && !locError && (
              <span style={{ fontSize: 11.5, color: "#b0ada6", marginLeft: "auto" }}>
                Improves mandi suggestions &amp; weather accuracy
              </span>
            )}

            {/* Error message */}
            {locError && (
              <span style={{ fontSize: 11.5, color: "#b03030", display: "flex", alignItems: "center", gap: 5, marginLeft: "auto" }}>
                <span style={{ fontSize: 13 }}>⚠</span>
                {locError}
              </span>
            )}
          </div>

          {/* Success context strip — shown when location is active */}
          {location && (
            <div style={{
              marginTop: 10,
              padding: "7px 11px",
              background: "#f3faf6",
              borderRadius: 7,
              fontSize: 11.5,
              color: "#3a7a58",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#2a8c4e", display: "inline-block", flexShrink: 0 }} />
              Location active — mandi data &amp; weather forecasts are matched to <strong style={{ fontWeight: 500 }}>{location.city}, {location.state}</strong>
            </div>
          )}
        </div>
        {/* ══ END INPUT CARD ══ */}

        {error && (
          <div style={{ background: "#fef2f2", border: "0.5px solid #fca5a5", borderLeft: "3px solid #ef4444", borderRadius: 8, padding: "10px 14px", color: "#991b1b", fontSize: 13, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
            <span>❌</span> {error}
          </div>
        )}

        {/* ── LOADING STATE ── */}
        {loading && (
          <div style={{ background: "#fff", borderRadius: 12, border: "0.5px solid #e0ddd6", padding: "48px 40px", textAlign: "center", boxShadow: "0 1px 6px rgba(0,0,0,0.05)" }}>
            <div style={{ fontSize: 36, marginBottom: 14 }}>🌾</div>
            <p style={{ fontSize: 14, color: "#444", marginBottom: 6, fontWeight: 500 }}>
              Running AI crop intelligence analysis…
            </p>
            <p style={{ fontSize: 12.5, color: "#999", marginBottom: 20 }}>
              Fetching mandi prices, weather data &amp; profit projections
              {location ? ` for ${location.city}, ${location.state}` : ""}
            </p>
            <div style={{ width: 200, height: 4, background: "#e8e6df", borderRadius: 2, margin: "0 auto", overflow: "hidden" }}>
              <div style={{ height: "100%", background: "#2e7bbf", borderRadius: 2, animation: "loadbar 1.2s ease-in-out infinite" }} />
            </div>
          </div>
        )}

        {/* ══════════════════ RESULTS ══════════════════ */}
        {data && (
          <div style={{ opacity: animIn ? 1 : 0, transform: animIn ? "translateY(0)" : "translateY(12px)", transition: "opacity 0.4s ease, transform 0.4s ease" }}>

            {/* ── KPI CARDS ── */}
            {(activeTab === "overview" || activeTab === "profit") && (
              <>
                <SectionLabel>Key performance indicators</SectionLabel>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
                  <KpiCard label="Best mandi" value={data.recommendation.best_mandi}
                    sub={`${data.market_intelligence.mandis.find(m => m.name === data.recommendation.best_mandi)?.distance_km ?? "—"} km away`}
                    badge="95/100 demand" badgeColor="#d0e8f7" badgeText="#0a4a80" topColor="#2e7bbf" smallValue />
                  <KpiCard label="Max net profit" value={INR(data.profit_optimization.best_option.net_profit)}
                    sub={`vs ${INR(data.profit_optimization.options[0].net_profit)} local`}
                    badge={`+${INR(data.recommendation.expected_profit_gain)} gain`} badgeColor="#d4edda" badgeText="#155724" topColor="#2a8c4e" />
                  <KpiCard label="Recommended action" value={`${data.decision_engine.action} ${data.decision_engine.wait_days}d`}
                    sub={`Sell on Day ${data.recommendation.best_day_to_sell_in_days}`}
                    badge={`+${INR(data.decision_engine.profit_difference)} by waiting`} badgeColor="#fff3cd" badgeText="#7a5100" topColor="#d4820a" />
                  <KpiCard label="AI confidence" value={pct(data.decision_engine.confidence_score)}
                    sub="Model confidence score" badge="High confidence" badgeColor="#ede8fa" badgeText="#4a2b9e" topColor="#6b4fbb" />
                </div>
              </>
            )}

            {/* ── OVERVIEW TAB ── */}
            {activeTab === "overview" && (
              <>
                <SectionLabel>Decision engine</SectionLabel>
                <div style={{ background: "linear-gradient(135deg, #0d2d4a 0%, #0f3d28 100%)", borderRadius: 12, padding: "18px 20px", marginBottom: 20, display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 20, alignItems: "center" }}>
                  <div>
                    <p style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>Sell today (Day 10)</p>
                    <p style={{ fontSize: 22, fontWeight: 600, color: "#fff", margin: 0 }}>{INR(data.decision_engine.sell_today_profit)}</p>
                    <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>Pipariya, today's price</p>
                  </div>
                  <div>
                    <p style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>Sell on Day {data.recommendation.best_day_to_sell_in_days}</p>
                    <p style={{ fontSize: 22, fontWeight: 600, color: "#7de3b4", margin: 0 }}>{INR(data.decision_engine.sell_later_profit)}</p>
                    <p style={{ fontSize: 11, color: "#7de3b4", marginTop: 4, opacity: 0.7 }}>+{INR(data.decision_engine.profit_difference)} extra</p>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ background: "#d4820a", borderRadius: 8, padding: "10px 22px", fontSize: 20, fontWeight: 600, color: "#fff", marginBottom: 8 }}>
                      {data.decision_engine.action}
                    </div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 6 }}>AI confidence</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ flex: 1, height: 5, background: "rgba(255,255,255,0.15)", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ width: pct(data.decision_engine.confidence_score), height: "100%", background: "#4fa3e3", borderRadius: 3 }} />
                      </div>
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>{pct(data.decision_engine.confidence_score)}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
                  <Card title="Harvest intelligence" tag="Bullish" tagColor="#d4edda" tagText="#155724">
                    <HarvestTimeline />
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 14 }}>
                      {[
                        { label: "Harvest window", value: data.harvest_intelligence.harvest_window },
                        { label: "Maturity score", value: pct(data.harvest_intelligence.crop_maturity_score) },
                        { label: "Crop", value: data.input.crop },
                        { label: "Quantity", value: `${data.input.quantity_quintal} qtl` },
                      ].map((item) => (
                        <div key={item.label} style={{ background: "#f6f5f0", borderRadius: 6, padding: "8px 10px" }}>
                          <div style={{ fontSize: 10, color: "#888", marginBottom: 2 }}>{item.label}</div>
                          <div style={{ fontSize: 13, fontWeight: 500, color: "#1a1a18" }}>{item.value}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop: 10, padding: "8px 10px", background: "#f0faf5", borderRadius: 6, fontSize: 12, color: "#2a5c3f", lineHeight: 1.5 }}>
                      ☀️ {data.harvest_intelligence.weather_impact}
                    </div>
                  </Card>

                  <Card title="Mandi price comparison" tag="Live" tagColor="#fde8e8" tagText="#8b1a1a">
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                      <thead>
                        <tr>
                          {["Mandi", "Price", "Dist.", "7D avg", "Demand", "Trend"].map((h) => (
                            <th key={h} style={{ textAlign: "left", padding: "5px 6px", fontSize: 10, fontWeight: 500, color: "#888", borderBottom: "0.5px solid #e8e6df" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {data.market_intelligence.mandis.map((m, i) => (
                          <tr key={i} style={{ background: m.name === data.recommendation.best_mandi ? "rgba(42,140,78,0.05)" : "transparent" }}>
                            <td style={{ padding: "8px 6px", borderBottom: "0.5px solid #f0efeb" }}>
                              <div style={{ fontWeight: 500, fontSize: 11, color: "#1a1a18" }}>{m.name.replace(" Mandi", "")}</div>
                              {m.name === data.recommendation.best_mandi && (
                                <span style={{ fontSize: 9, background: "#d4edda", color: "#155724", padding: "1px 5px", borderRadius: 3 }}>Best</span>
                              )}
                            </td>
                            <td style={{ padding: "8px 6px", borderBottom: "0.5px solid #f0efeb", fontWeight: 500, color: MANDI_COLORS[i] }}>₹{m.current_price}</td>
                            <td style={{ padding: "8px 6px", borderBottom: "0.5px solid #f0efeb", fontSize: 11, color: "#666" }}>{m.distance_km}km</td>
                            <td style={{ padding: "8px 6px", borderBottom: "0.5px solid #f0efeb", fontSize: 11, color: "#444" }}>₹{m.avg_7_day_price}</td>
                            <td style={{ padding: "8px 6px", borderBottom: "0.5px solid #f0efeb" }}><DemandGauge score={m.demand_score} color={MANDI_COLORS[i]} /></td>
                            <td style={{ padding: "8px 6px", borderBottom: "0.5px solid #f0efeb" }}><Sparkline prices={m.predicted_prices_next_7_days} color={MANDI_COLORS[i]} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </Card>
                </div>

                <div style={{ background: "linear-gradient(135deg, #1a3a5c, #0f5b38)", borderRadius: 12, padding: "18px 22px", color: "#fff", marginBottom: 20 }}>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", marginBottom: 6 }}>✅ FINAL RECOMMENDATION — AI ENGINE</p>
                  <p style={{ fontSize: 15, lineHeight: 1.7, margin: 0 }}>{data.recommendation.summary}</p>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", marginTop: 8, lineHeight: 1.5 }}>{data.recommendation.reasoning}</p>
                </div>
              </>
            )}

            {/* ── MARKET TAB ── */}
            {activeTab === "market" && (
              <>
                <SectionLabel>7-day price forecast</SectionLabel>
                <Card title="Predicted price trajectory — all mandis">
                  <ForecastChart mandis={data.market_intelligence.mandis} />
                </Card>
                <div style={{ marginTop: 16 }}>
                  <SectionLabel>Mandi profiles</SectionLabel>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
                    {data.market_visuals.mandis.map((mv, i) => {
                      const mandi = data.market_intelligence.mandis[i];
                      return (
                        <div key={i} style={{ background: "#fff", borderRadius: 12, border: "0.5px solid #e0ddd6", overflow: "hidden" }}>
                          <img src={mv.image_url} alt={mv.name} style={{ width: "100%", height: 100, objectFit: "cover" }} />
                          <div style={{ padding: "12px 14px" }}>
                            <h3 style={{ fontSize: 13, fontWeight: 600, color: "#1a1a18", margin: "0 0 4px" }}>{mv.name}</h3>
                            <p style={{ fontSize: 11, color: "#666", lineHeight: 1.5, margin: "0 0 8px" }}>{mv.place_description}</p>
                            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                              <Pill color="#d0e8f7" text={`₹${mandi?.current_price}/qtl`} />
                              <Pill color="#d4edda" text={`${mandi?.demand_score}/100 demand`} />
                              <Pill color="#f0efeb" text={`${mandi?.distance_km}km`} />
                            </div>
                            <a href={mv.google_maps_search} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", marginTop: 10, fontSize: 11, color: "#2e7bbf", textDecoration: "none" }}>
                              📍 View on Maps →
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {/* ── HARVEST TAB ── */}
            {activeTab === "harvest" && (
              <>
                <SectionLabel>Harvest intelligence</SectionLabel>
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14, marginBottom: 16 }}>
                  <Card title="Harvest timeline">
                    <HarvestTimeline />
                    <div style={{ marginTop: 18, padding: "12px 14px", background: "#f0faf5", borderRadius: 8, fontSize: 13, color: "#2a5c3f", lineHeight: 1.6 }}>
                      ☀️ {data.harvest_intelligence.weather_impact}
                    </div>
                    <div style={{ marginTop: 10, padding: "12px 14px", background: "#fff9e6", border: "0.5px solid #e6a817", borderRadius: 8, fontSize: 13, color: "#7a5100", lineHeight: 1.6 }}>
                      ⚠️ {data.harvest_intelligence.risk_alerts[0]}
                    </div>
                  </Card>
                  <Card title="Crop details">
                    {[
                      { label: "Crop type", value: data.input.crop },
                      { label: "Quantity", value: `${data.input.quantity_quintal} quintals` },
                      { label: "Location", value: data.input.location },
                      { label: "Harvest day", value: `Day ${data.harvest_intelligence.recommended_harvest_day}` },
                      { label: "Harvest window", value: data.harvest_intelligence.harvest_window },
                      { label: "Maturity score", value: pct(data.harvest_intelligence.crop_maturity_score) },
                    ].map((item) => (
                      <div key={item.label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "0.5px solid #f0efeb", fontSize: 12 }}>
                        <span style={{ color: "#888" }}>{item.label}</span>
                        <span style={{ fontWeight: 500, color: "#1a1a18" }}>{item.value}</span>
                      </div>
                    ))}
                  </Card>
                </div>
              </>
            )}

            {/* ── PROFIT TAB ── */}
            {activeTab === "profit" && (
              <>
                <SectionLabel>Profit optimization</SectionLabel>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
                  <Card title="Net profit by mandi">
                    {data.profit_optimization.options.map((opt, i) => {
                      const isBest = opt.mandi === data.profit_optimization.best_option.mandi;
                      return (
                        <div key={i} style={{ marginBottom: 16 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 5 }}>
                            <span style={{ color: "#1a1a18", fontWeight: isBest ? 500 : 400 }}>
                              {opt.mandi}
                              {isBest && <span style={{ marginLeft: 6, fontSize: 10, background: "#d4edda", color: "#155724", padding: "1px 6px", borderRadius: 3 }}>Best</span>}
                            </span>
                            <span style={{ fontWeight: 600, color: MANDI_COLORS[i] }}>{INR(opt.net_profit)}</span>
                          </div>
                          <div style={{ height: 8, background: "#f0efeb", borderRadius: 4, overflow: "hidden" }}>
                            <div style={{ width: `${(opt.net_profit / maxProfit) * 100}%`, height: "100%", background: MANDI_COLORS[i], borderRadius: 4, transition: "width 1s ease" }} />
                          </div>
                          <div style={{ fontSize: 11, color: "#888", marginTop: 4 }}>
                            Transport: {INR(opt.transport_cost)} · Price: ₹{opt.expected_price}/qtl
                          </div>
                        </div>
                      );
                    })}
                  </Card>

                  <Card title="Cost breakdown — Pipariya Mandi">
                    {(() => {
                      const best = data.profit_optimization.options.find(o => o.mandi === data.profit_optimization.best_option.mandi)!;
                      const revenue = best.expected_price * data.input.quantity_quintal;
                      const rows = [
                        { label: "Gross revenue", value: INR(revenue), color: "#2a8c4e" },
                        { label: "Transport cost", value: `– ${INR(best.transport_cost)}`, color: "#c0392b" },
                        { label: "Net profit", value: INR(best.net_profit), color: "#1a3a5c" },
                        { label: "Profit margin", value: `${best.profit_margin_percent}%`, color: "#6b4fbb" },
                      ];
                      return rows.map((row) => (
                        <div key={row.label} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "0.5px solid #f0efeb", fontSize: 13 }}>
                          <span style={{ color: "#666" }}>{row.label}</span>
                          <span style={{ fontWeight: 600, color: row.color }}>{row.value}</span>
                        </div>
                      ));
                    })()}
                    <div style={{ marginTop: 14, padding: "12px", background: "#f0faf5", borderRadius: 7, fontSize: 12, color: "#2a5c3f", lineHeight: 1.6 }}>
                      💡 {data.recommendation.reasoning}
                    </div>
                  </Card>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.35} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes loadbar {
          0%{width:0%;margin-left:0}
          50%{width:60%;margin-left:20%}
          100%{width:0%;margin-left:100%}
        }
        @keyframes fadeSlideIn {
          from{opacity:0;transform:translateX(6px)}
          to{opacity:1;transform:translateX(0)}
        }
        input[type="text"]::placeholder { color: #b0ada6; }
      `}</style>
    </div>
  );
}

/* ─────────────────── SHARED COMPONENTS ─────────────────────── */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 11, fontWeight: 500, color: "#888", letterSpacing: "0.7px", textTransform: "uppercase", marginBottom: 10 }}>
      {children}
      <div style={{ flex: 1, height: "0.5px", background: "#ddd" }} />
    </div>
  );
}

function Card({ title, tag, tagColor, tagText, children }: { title: string; tag?: string; tagColor?: string; tagText?: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "#fff", border: "0.5px solid #e0ddd6", borderRadius: 12, padding: "14px 16px", marginBottom: 0 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, paddingBottom: 10, borderBottom: "0.5px solid #f0efeb" }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: "#1a1a18" }}>{title}</span>
        {tag && (
          <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 3, background: tagColor, color: tagText }}>{tag}</span>
        )}
      </div>
      {children}
    </div>
  );
}

function KpiCard({ label, value, sub, badge, badgeColor, badgeText, topColor, smallValue }: {
  label: string; value: string; sub: string; badge: string;
  badgeColor: string; badgeText: string; topColor: string; smallValue?: boolean;
}) {
  return (
    <div style={{ background: "#fff", border: "0.5px solid #e0ddd6", borderRadius: 12, padding: "14px 16px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: topColor }} />
      <p style={{ fontSize: 11, color: "#888", margin: "0 0 6px" }}>{label}</p>
      <p style={{ fontSize: smallValue ? 14 : 20, fontWeight: 600, color: "#1a1a18", margin: "0 0 4px", lineHeight: 1.2 }}>{value}</p>
      <p style={{ fontSize: 11, color: "#888", margin: "0 0 6px" }}>{sub}</p>
      <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 10, fontSize: 11, fontWeight: 500, background: badgeColor, color: badgeText }}>{badge}</span>
    </div>
  );
}

function Pill({ color, text }: { color: string; text: string }) {
  return (
    <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 10, fontSize: 11, background: color, color: "#333" }}>
      {text}
    </span>
  );
}

function LocationPinIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" style={{ flexShrink: 0 }}>
      <circle cx="8" cy="7" r="2.5" />
      <path d="M8 1.5a5.5 5.5 0 0 1 5.5 5.5c0 3.5-5.5 8-5.5 8S2.5 10.5 2.5 7A5.5 5.5 0 0 1 8 1.5z" />
    </svg>
  );
}