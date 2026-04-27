"use client";

import { useState, useEffect, useRef } from "react";

/* ─────────────────────── TYPES ─────────────────────── */
type Feature = {
  href: string;
  icon: React.ReactNode;
  label: string;
  desc: string;
  accent: string;
  
};

/* ─────────────────────── DATA ─────────────────────── */
const FEATURES: Feature[] = [
  {
    href: "/hello/crop-prediction",
    icon: "🌿",
    label: "Crop Prediction",
    desc: "AI-driven crop suitability analysis based on soil, climate, and regional data.",
    accent: "#2ecc71",
  },
  {
    href: "/hello/crop-recommendation",
    icon: "🌾",
    label: "Crop Recommendation",
    desc: "Personalised crop selection engine tuned to your exact land and season conditions.",
    accent: "#27ae60",
  },
  {
    href: "/hello/fertilizer-recommendation",
    icon: "🧪",
    label: "Fertilizer Recommendation",
    desc: "Precision nutrient planning — NPK ratios and micro-nutrients, zero waste.",
    accent: "#f39c12",
  },
  {
    href: "/hello/rainfall-prediction",
    icon: "🌧️",
    label: "Rainfall Prediction",
    desc: "Hyper-local precipitation forecasts built on historical patterns and live weather feeds.",
    accent: "#3498db",
  },
  {
    href: "/hello/yield-prediction",
    icon: "🧑🏻‍🌾",
    label: "Yield Prediction",
    desc: "Harvest volume estimates with confidence bands to plan storage and logistics ahead.",
    accent: "#e74c3c",
  },
];

const STATS = [
  { value: "2.4M+", label: "Farmers Served" },
  { value: "94.7%", label: "Prediction Accuracy" },
  { value: "18", label: "Indian States" },
  { value: "₹840Cr", label: "Farmer Revenue Gained" },
];

/* ─────────────────── PARTICLE FIELD ─────────────────── */
function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let raf: number;

    const resize = () => {
      canvas.width = canvas.offsetWidth * devicePixelRatio;
      canvas.height = canvas.offsetHeight * devicePixelRatio;
      ctx.scale(devicePixelRatio, devicePixelRatio);
    };
    resize();
    window.addEventListener("resize", resize);

    const W = () => canvas.offsetWidth;
    const H = () => canvas.offsetHeight;

    const particles = Array.from({ length: 55 }, () => ({
      x: Math.random() * W(),
      y: Math.random() * H(),
      r: Math.random() * 1.5 + 0.4,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      alpha: Math.random() * 0.5 + 0.15,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, W(), H());
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = W();
        if (p.x > W()) p.x = 0;
        if (p.y < 0) p.y = H();
        if (p.y > H()) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(134,239,172,${p.alpha})`;
        ctx.fill();
      });

      // draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(134,239,172,${0.06 * (1 - dist / 100)})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    />
  );
}

/* ─────────────────── ANIMATED COUNTER ─────────────────── */
function Counter({ target }: { target: string }) {
  const [display, setDisplay] = useState("0");
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const numeric = parseFloat(target.replace(/[^0-9.]/g, ""));
        const suffix = target.replace(/[0-9.]/g, "");
        let start = 0;
        const duration = 1600;
        const step = (ts: number) => {
          if (!start) start = ts;
          const progress = Math.min((ts - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setDisplay(`${(eased * numeric).toFixed(target.includes(".") ? 1 : 0)}${suffix}`);
          if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{display}</span>;
}

/* ─────────────────── FEATURE CARD ─────────────────── */
function FeatureCard({ feature, index }: { feature: Feature; index: number }) {
  const [hovered, setHovered] = useState(false);

  return (
    <a
      href={feature.href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "block",
        textDecoration: "none",
        background: hovered
          ? `linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 100%)`
          : "rgba(255,255,255,0.03)",
        border: `1px solid ${hovered ? feature.accent + "55" : "rgba(255,255,255,0.08)"}`,
        borderRadius: 16,
        padding: "28px 26px",
        transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        boxShadow: hovered ? `0 20px 40px rgba(0,0,0,0.3), 0 0 0 1px ${feature.accent}33` : "none",
        position: "relative",
        overflow: "hidden",
        animationDelay: `${index * 0.08}s`,
        animationFillMode: "both",
        animation: "fadeUp 0.5s ease forwards",
        opacity: 0,
      }}
    >
      {/* Glow blob */}
      <div
        style={{
          position: "absolute",
          top: -40,
          right: -40,
          width: 120,
          height: 120,
          borderRadius: "50%",
          background: feature.accent,
          opacity: hovered ? 0.08 : 0,
          transition: "opacity 0.3s",
          filter: "blur(30px)",
          pointerEvents: "none",
        }}
      />
      {/* Index number */}
      <div
        style={{
          position: "absolute",
          top: 20,
          right: 22,
          fontSize: 11,
          color: "rgba(255,255,255,0.2)",
          fontFamily: "'DM Mono', monospace",
          fontWeight: 500,
        }}
      >
        {String(index + 1).padStart(2, "0")}
      </div>

      <div style={{ fontSize: 32, marginBottom: 14 }}>{feature.icon}</div>
      <h3
        style={{
          fontSize: 17,
          fontWeight: 600,
          color: "#fff",
          margin: "0 0 8px",
          fontFamily: "'Fraunces', Georgia, serif",
          letterSpacing: -0.3,
        }}
      >
        {feature.label}
      </h3>
      <p
        style={{
          fontSize: 13,
          color: "rgba(255,255,255,0.5)",
          lineHeight: 1.65,
          margin: "0 0 16px",
        }}
      >
        {feature.desc}
      </p>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
        }}
      >
        <span
          style={{
            fontSize: 13,
            color: hovered ? feature.accent : "rgba(255,255,255,0.3)",
            transition: "color 0.2s",
            fontWeight: 500,
          }}
        >
          Open →
        </span>
      </div>
    </a>
  );
}

/* ─────────────────── MAIN PAGE ─────────────────── */
export default function LandingPage() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#080e0a",
        color: "#fff",
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
        overflowX: "hidden",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,700;1,9..144,400&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes heroReveal {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes pulse-ring {
          0%   { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-8px); }
        }

        .hero-title {
          font-size: clamp(42px, 6vw, 88px);
          font-family: 'Fraunces', Georgia, serif;
          font-weight: 700;
          line-height: 1.05;
          letter-spacing: -2px;
          margin: 0;
        }
        .shimmer-text {
          background: linear-gradient(
            90deg,
            #86efac 0%,
            #34d399 20%,
            #fff 40%,
            #86efac 60%,
            #34d399 80%,
            #86efac 100%
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
        }
        .nav-link {
          color: rgba(255,255,255,0.5);
          text-decoration: none;
          font-size: 13px;
          font-weight: 500;
          transition: color 0.2s;
          letter-spacing: 0.2px;
        }
        .nav-link:hover { color: #fff; }
        .cta-primary {
          background: linear-gradient(135deg, #22c55e, #16a34a);
          color: #fff;
          border: none;
          border-radius: 10px;
          padding: 13px 28px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.2s;
          box-shadow: 0 4px 20px rgba(34,197,94,0.35);
          letter-spacing: 0.2px;
        }
        .cta-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(34,197,94,0.45);
        }
        .cta-secondary {
          background: rgba(255,255,255,0.06);
          color: rgba(255,255,255,0.75);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 10px;
          padding: 13px 24px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.2s;
          text-decoration: none;
          display: inline-block;
        }
        .cta-secondary:hover {
          background: rgba(255,255,255,0.1);
          color: #fff;
          border-color: rgba(255,255,255,0.2);
        }
        .section-label {
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #4ade80;
          margin-bottom: 14px;
        }
        .grain-overlay {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 9999;
          opacity: 0.03;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
        }
      `}</style>

      {/* Grain */}
      <div className="grain-overlay" />

      {/* ── NAV ── */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          padding: "0 40px",
          height: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: scrollY > 40 ? "rgba(8,14,10,0.85)" : "transparent",
          backdropFilter: scrollY > 40 ? "blur(16px)" : "none",
          borderBottom: scrollY > 40 ? "1px solid rgba(255,255,255,0.06)" : "none",
          transition: "all 0.3s",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              background: "linear-gradient(135deg, #22c55e, #16a34a)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 15,
            }}
          >
            🌾
          </div>
          <span
            style={{
              fontSize: 15,
              fontWeight: 600,
              fontFamily: "'Fraunces', serif",
              letterSpacing: -0.3,
            }}
          >
            KrishiNiti
          </span>
        </div>
        <div style={{ display: "flex", gap: 28, alignItems: "center" }}>
          {["Features", "Stats", "Demo"].map((l) => (
            <a key={l} href={`#${l.toLowerCase()}`} className="nav-link">
              {l}
            </a>
          ))}
        </div>
        <a href="/dashboard" className="cta-secondary" style={{ padding: "8px 18px", fontSize: 12 }}>
          Open Dashboard →
        </a>
      </nav>

      {/* ── HERO ── */}
      <section
        id="hero"
        style={{
          position: "relative",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          padding: "120px 24px 80px",
          overflow: "hidden",
        }}
      >
        <ParticleField />

        {/* Background radial */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -60%)",
            width: 700,
            height: 700,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(34,197,94,0.08) 0%, rgba(34,197,94,0.02) 50%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        {/* Orbit ring */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: 500,
            height: 500,
            marginLeft: -250,
            marginTop: -250,
            borderRadius: "50%",
            border: "1px solid rgba(74,222,128,0.06)",
            animation: "spin 40s linear infinite",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: 340,
            height: 340,
            marginLeft: -170,
            marginTop: -170,
            borderRadius: "50%",
            border: "1px solid rgba(74,222,128,0.04)",
            animation: "spin 28s linear infinite reverse",
            pointerEvents: "none",
          }}
        />

        <div style={{ position: "relative", zIndex: 2, maxWidth: 820 }}>
          {/* Eyebrow */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(34,197,94,0.1)",
              border: "1px solid rgba(34,197,94,0.25)",
              borderRadius: 20,
              padding: "6px 14px",
              marginBottom: 32,
              animation: "heroReveal 0.6s ease forwards",
            }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#22c55e",
                animation: "pulse-ring 1.5s ease-out infinite",
              }}
            />
            <span
              style={{
                fontSize: 12,
                color: "#86efac",
                fontWeight: 500,
                fontFamily: "'DM Mono', monospace",
              }}
            >
              Powered by Team Dhurandhar · KRISHINITI
            </span>
          </div>

          <h1
            className="hero-title"
            style={{ animation: "heroReveal 0.6s 0.1s ease forwards", opacity: 0 }}
          >
            Intelligent Farming,
            <br />
            <span className="shimmer-text">Powered by Real-Time Data</span>
          </h1>

          <p
            style={{
              fontSize: 17,
              color: "rgba(255,255,255,0.45)",
              lineHeight: 1.7,
              maxWidth: 540,
              margin: "24px auto 40px",
              animation: "heroReveal 0.6s 0.2s ease forwards",
              opacity: 0,
            }}
          >
            Harness Google Gemini's full model suite and real time API simulation for precision crop predictions,
            fertilizer planning, rainfall forecasts, and live mandi market intelligence.
          </p>

          <div
            style={{
              display: "flex",
              gap: 12,
              justifyContent: "center",
              flexWrap: "wrap",
              animation: "heroReveal 0.6s 0.3s ease forwards",
              opacity: 0,
            }}
          >
            <a href="/hello/crop-prediction">
              <button className="cta-primary">🌿 Start Crop Analysis</button>
            </a>
            <a href="#features" className="cta-secondary">
              Explore Features
            </a>
          </div>

          {/* Floating feature pills */}
          <div
            style={{
              display: "flex",
              gap: 8,
              justifyContent: "center",
              flexWrap: "wrap",
              marginTop: 48,
              animation: "heroReveal 0.6s 0.4s ease forwards",
              opacity: 0,
            }}
          >
            {FEATURES.map((f) => (
              <div
                key={f.label}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 20,
                  padding: "6px 14px",
                  fontSize: 12,
                  color: "rgba(255,255,255,0.4)",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <span>{f.icon}</span> {f.label}
              </div>
            ))}
          </div>
        </div>

        {/* Scroll cue */}
        <div
          style={{
            position: "absolute",
            bottom: 32,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
            opacity: 0.3,
            animation: "float 2s ease-in-out infinite",
          }}
        >
          <div style={{ width: 1, height: 40, background: "rgba(255,255,255,0.3)" }} />
          <span style={{ fontSize: 10, letterSpacing: 2, fontFamily: "'DM Mono', monospace" }}>SCROLL</span>
        </div>
      </section>

      {/* ── STATS ── */}
      <section
        id="stats"
        style={{
          padding: "60px 40px",
          borderTop: "1px solid rgba(255,255,255,0.05)",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          background: "rgba(255,255,255,0.015)",
        }}
      >
        <div
          style={{
            maxWidth: 1000,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 20,
            textAlign: "center",
          }}
        >
          {STATS.map((s) => (
            <div key={s.label}>
              <div
                style={{
                  fontSize: "clamp(28px,4vw,44px)",
                  fontWeight: 700,
                  fontFamily: "'Fraunces', serif",
                  color: "#4ade80",
                  letterSpacing: -1,
                  lineHeight: 1,
                }}
              >
                <Counter target={s.value} />
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "rgba(255,255,255,0.4)",
                  marginTop: 8,
                  fontWeight: 500,
                  letterSpacing: 0.5,
                }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ padding: "100px 40px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p className="section-label">// AI Modules</p>
            <h2
              style={{
                fontSize: "clamp(28px,4vw,48px)",
                fontFamily: "'Fraunces', serif",
                fontWeight: 700,
                margin: "0 0 16px",
                letterSpacing: -1,
                lineHeight: 1.1,
              }}
            >
              Five intelligent tools,
              <br />
              <span style={{ color: "rgba(255,255,255,0.35)" }}>one unified platform</span>
            </h2>
            <p
              style={{
                fontSize: 15,
                color: "rgba(255,255,255,0.4)",
                maxWidth: 480,
                margin: "0 auto",
                lineHeight: 1.6,
              }}
            >
              Each module is backed by the optimal Gemini model for that task —
              matching speed, context window, and cost to the problem.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 14,
            }}
          >
            {FEATURES.slice(0, 3).map((f, i) => (
              <FeatureCard key={f.href} feature={f} index={i} />
            ))}
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 14,
              marginTop: 14,
            }}
          >
            {FEATURES.slice(3).map((f, i) => (
              <FeatureCard key={f.href} feature={f} index={i + 3} />
            ))}
          </div>
        </div>
      </section>

      {/* ── DEMO / CTA ── */}
      <section id="demo" style={{ padding: "100px 40px" }}>
        <div
          style={{
            maxWidth: 800,
            margin: "0 auto",
            textAlign: "center",
          }}
        >
          <p className="section-label">// Get Started</p>

          <div
            style={{
              position: "relative",
              background:
                "linear-gradient(135deg, rgba(34,197,94,0.08) 0%, rgba(16,163,74,0.04) 100%)",
              border: "1px solid rgba(34,197,94,0.2)",
              borderRadius: 24,
              padding: "60px 48px",
              overflow: "hidden",
            }}
          >
            {/* Glow */}
            <div
              style={{
                position: "absolute",
                top: -80,
                left: "50%",
                transform: "translateX(-50%)",
                width: 300,
                height: 300,
                borderRadius: "50%",
                background: "rgba(34,197,94,0.12)",
                filter: "blur(80px)",
                pointerEvents: "none",
              }}
            />
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ fontSize: 48, marginBottom: 20, animation: "float 3s ease-in-out infinite" }}>
                🌾
              </div>
              <h2
                style={{
                  fontSize: "clamp(26px, 4vw, 42px)",
                  fontFamily: "'Fraunces', serif",
                  fontWeight: 700,
                  margin: "0 0 16px",
                  letterSpacing: -1,
                  lineHeight: 1.1,
                }}
              >
                Ready to transform
                <br />
                your farming decisions?
              </h2>
              <p
                style={{
                  fontSize: 15,
                  color: "rgba(255,255,255,0.45)",
                  margin: "0 0 36px",
                  lineHeight: 1.6,
                }}
              >
                Join 2.4 million farmers already using KrishiAI to maximise yields,
                minimise inputs, and sell at the right mandi at the right time.
              </p>

              <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                {FEATURES.map((f) => (
                  <a
                    key={f.href}
                    href={f.href}
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 10,
                      padding: "10px 16px",
                      color: "#fff",
                      textDecoration: "none",
                      fontSize: 13,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      transition: "all 0.2s",
                      fontWeight: 500,
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "rgba(34,197,94,0.15)";
                      (e.currentTarget as HTMLElement).style.borderColor = "rgba(34,197,94,0.35)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)";
                      (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.1)";
                    }}
                  >
                    <span>{f.icon}</span> {f.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer
        style={{
          borderTop: "1px solid rgba(255,255,255,0.06)",
          padding: "32px 40px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: 6,
              background: "linear-gradient(135deg, #22c55e, #16a34a)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 13,
            }}
          >
            🌾
          </div>
          <span
            style={{
              fontSize: 14,
              fontFamily: "'Fraunces', serif",
              fontWeight: 600,
            }}
          >
            KrishiAI
          </span>
          <span
            style={{
              fontSize: 12,
              color: "rgba(255,255,255,0.25)",
              marginLeft: 12,
            }}
          >
            Powered by Google Gemini
          </span>
        </div>
        <div style={{ display: "flex", gap: 20 }}>
          {FEATURES.map((f) => (
            <a
              key={f.href}
              href={f.href}
              style={{
                fontSize: 12,
                color: "rgba(255,255,255,0.35)",
                textDecoration: "none",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "#fff")}
              onMouseLeave={(e) =>
                ((e.target as HTMLElement).style.color = "rgba(255,255,255,0.35)")
              }
            >
              {f.label}
            </a>
          ))}
        </div>
        <div
          style={{
            fontSize: 11,
            color: "rgba(255,255,255,0.2)",
            fontFamily: "'DM Mono', monospace",
          }}
        >
          © 2025 KrishiAI · Ministry of Agriculture
        </div>
      </footer>
    </div>
  );
}