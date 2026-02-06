import { useState } from "react";
import { ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area } from "recharts";

const ATH = 126272;
const CURRENT_PRICE = 67150;
const CURRENT_DRAWDOWN = ((ATH - CURRENT_PRICE) / ATH * 100).toFixed(1);
const monthsSinceHalving = 22;
const totalCycleMonths = 48;

// ============================================================
// MONTHLY DATA: Nov 2021 (ATH) → Projected ~Q2 2029 (Next ATH)
// Sources: CoinGecko, LookIntoBitcoin, Glassnode
// Projections: Based on 4-year halving cycle patterns
// ============================================================
const rawData = [
  // === 2021 (post-ATH distribution) ===
  { date: "Nov '21", price: 69000, ma200w: 13200, ma20w: 48000, type: "actual", event: "2021 ATH", eventType: "top" },
  { date: "Dec '21", price: 46200, ma200w: 13800, ma20w: 52000, type: "actual" },
  // === 2022 bear market ===
  { date: "Jan '22", price: 38500, ma200w: 14500, ma20w: 52000, type: "actual" },
  { date: "Feb '22", price: 43000, ma200w: 15200, ma20w: 50000, type: "actual" },
  { date: "Mar '22", price: 45500, ma200w: 16000, ma20w: 47000, type: "actual" },
  { date: "Apr '22", price: 39700, ma200w: 16800, ma20w: 44500, type: "actual" },
  { date: "May '22", price: 31800, ma200w: 17500, ma20w: 42000, type: "actual", event: "Luna crash", eventType: "crash" },
  { date: "Jun '22", price: 19800, ma200w: 18200, ma20w: 38000, type: "actual", event: "200WMA touch", eventType: "signal" },
  { date: "Jul '22", price: 23300, ma200w: 18800, ma20w: 34000, type: "actual" },
  { date: "Aug '22", price: 20000, ma200w: 19400, ma20w: 28000, type: "actual" },
  { date: "Sep '22", price: 19400, ma200w: 19800, ma20w: 24000, type: "actual" },
  { date: "Oct '22", price: 20500, ma200w: 20200, ma20w: 21500, type: "actual" },
  { date: "Nov '22", price: 15476, ma200w: 20800, ma20w: 20200, type: "actual", event: "FTX bottom", eventType: "bottom" },
  { date: "Dec '22", price: 16500, ma200w: 21000, ma20w: 19000, type: "actual" },
  // === 2023 recovery ===
  { date: "Jan '23", price: 23000, ma200w: 21200, ma20w: 18500, type: "actual" },
  { date: "Feb '23", price: 23500, ma200w: 21400, ma20w: 18800, type: "actual" },
  { date: "Mar '23", price: 28400, ma200w: 21600, ma20w: 19500, type: "actual" },
  { date: "Apr '23", price: 29200, ma200w: 21800, ma20w: 21000, type: "actual" },
  { date: "May '23", price: 27200, ma200w: 22000, ma20w: 23000, type: "actual" },
  { date: "Jun '23", price: 30400, ma200w: 22200, ma20w: 25000, type: "actual" },
  { date: "Jul '23", price: 29200, ma200w: 22500, ma20w: 26500, type: "actual" },
  { date: "Aug '23", price: 26000, ma200w: 22800, ma20w: 27500, type: "actual" },
  { date: "Sep '23", price: 27000, ma200w: 23000, ma20w: 27800, type: "actual" },
  { date: "Oct '23", price: 34500, ma200w: 23200, ma20w: 27500, type: "actual" },
  { date: "Nov '23", price: 37700, ma200w: 23500, ma20w: 28000, type: "actual" },
  { date: "Dec '23", price: 42500, ma200w: 23800, ma20w: 30000, type: "actual" },
  // === 2024 halving + bull ===
  { date: "Jan '24", price: 42000, ma200w: 24200, ma20w: 32000, type: "actual" },
  { date: "Feb '24", price: 51800, ma200w: 24800, ma20w: 34000, type: "actual" },
  { date: "Mar '24", price: 73800, ma200w: 25500, ma20w: 38000, type: "actual", event: "Pre-halving high", eventType: "signal" },
  { date: "Apr '24", price: 63900, ma200w: 26200, ma20w: 42000, type: "actual", event: "HALVING", eventType: "halving" },
  { date: "May '24", price: 67500, ma200w: 27000, ma20w: 48000, type: "actual" },
  { date: "Jun '24", price: 62700, ma200w: 28000, ma20w: 52000, type: "actual" },
  { date: "Jul '24", price: 64600, ma200w: 29000, ma20w: 56000, type: "actual" },
  { date: "Aug '24", price: 59000, ma200w: 30000, ma20w: 60000, type: "actual" },
  { date: "Sep '24", price: 63500, ma200w: 31000, ma20w: 62000, type: "actual" },
  { date: "Oct '24", price: 72000, ma200w: 32000, ma20w: 63000, type: "actual" },
  { date: "Nov '24", price: 96400, ma200w: 33000, ma20w: 64000, type: "actual", event: "Trump elected", eventType: "signal" },
  { date: "Dec '24", price: 93400, ma200w: 34000, ma20w: 70000, type: "actual" },
  // === 2025 ===
  { date: "Jan '25", price: 109000, ma200w: 35500, ma20w: 76000, type: "actual" },
  { date: "Feb '25", price: 95000, ma200w: 36500, ma20w: 82000, type: "actual" },
  { date: "Mar '25", price: 82000, ma200w: 37500, ma20w: 88000, type: "actual" },
  { date: "Apr '25", price: 74000, ma200w: 38500, ma20w: 90000, type: "actual", event: "Tariff crash", eventType: "crash" },
  { date: "May '25", price: 95000, ma200w: 39500, ma20w: 88000, type: "actual" },
  { date: "Jun '25", price: 107000, ma200w: 40000, ma20w: 86000, type: "actual" },
  { date: "Jul '25", price: 118000, ma200w: 41000, ma20w: 88000, type: "actual" },
  { date: "Aug '25", price: 123000, ma200w: 42000, ma20w: 95000, type: "actual" },
  { date: "Sep '25", price: 120000, ma200w: 43000, ma20w: 100000, type: "actual" },
  { date: "Oct '25", price: 126272, ma200w: 44000, ma20w: 105000, type: "actual", event: "CYCLE ATH $126K", eventType: "top" },
  { date: "Nov '25", price: 94500, ma200w: 44500, ma20w: 108000, type: "actual", event: "20WMA bear flip", eventType: "signal" },
  { date: "Dec '25", price: 88000, ma200w: 45000, ma20w: 106000, type: "actual" },
  // === 2026 actual ===
  { date: "Jan '26", price: 78000, ma200w: 45500, ma20w: 100000, type: "actual" },
  { date: "Feb '26", price: 67150, ma200w: 46000, ma20w: 94000, type: "actual", event: "NOW", eventType: "now" },
  // === PROJECTIONS: Based on 4-year cycle ===
  { date: "Mar '26", price: 62000, ma200w: 46500, ma20w: 88000, type: "projected" },
  { date: "Apr '26", price: 58000, ma200w: 47000, ma20w: 82000, type: "projected" },
  { date: "May '26", price: 54000, ma200w: 47200, ma20w: 76000, type: "projected" },
  { date: "Jun '26", price: 50000, ma200w: 47400, ma20w: 70000, type: "projected" },
  { date: "Jul '26", price: 48000, ma200w: 47500, ma20w: 64000, type: "projected", event: "200WMA test", eventType: "signal" },
  { date: "Aug '26", price: 45000, ma200w: 47600, ma20w: 60000, type: "projected" },
  { date: "Sep '26", price: 42000, ma200w: 47500, ma20w: 56000, type: "projected" },
  { date: "Oct '26", price: 38000, ma200w: 47300, ma20w: 53000, type: "projected", event: "Projected bottom", eventType: "bottom" },
  { date: "Nov '26", price: 40000, ma200w: 47000, ma20w: 50000, type: "projected" },
  { date: "Dec '26", price: 42000, ma200w: 46800, ma20w: 48000, type: "projected" },
  // === 2027 accumulation + recovery ===
  { date: "Jan '27", price: 44000, ma200w: 46600, ma20w: 46000, type: "projected" },
  { date: "Feb '27", price: 46000, ma200w: 46500, ma20w: 44500, type: "projected" },
  { date: "Mar '27", price: 48000, ma200w: 46400, ma20w: 43500, type: "projected" },
  { date: "Apr '27", price: 50000, ma200w: 46300, ma20w: 43000, type: "projected" },
  { date: "May '27", price: 52000, ma200w: 46200, ma20w: 43500, type: "projected" },
  { date: "Jun '27", price: 55000, ma200w: 46200, ma20w: 44500, type: "projected", event: "Accumulation zone", eventType: "signal" },
  { date: "Jul '27", price: 58000, ma200w: 46300, ma20w: 46000, type: "projected" },
  { date: "Aug '27", price: 62000, ma200w: 46400, ma20w: 48000, type: "projected" },
  { date: "Sep '27", price: 66000, ma200w: 46500, ma20w: 50000, type: "projected" },
  { date: "Oct '27", price: 70000, ma200w: 46700, ma20w: 53000, type: "projected" },
  { date: "Nov '27", price: 75000, ma200w: 47000, ma20w: 56000, type: "projected", event: "20WMA bull flip", eventType: "signal" },
  { date: "Dec '27", price: 82000, ma200w: 47500, ma20w: 60000, type: "projected" },
  // === 2028 halving + bull run ===
  { date: "Jan '28", price: 88000, ma200w: 48000, ma20w: 64000, type: "projected" },
  { date: "Feb '28", price: 95000, ma200w: 48500, ma20w: 68000, type: "projected" },
  { date: "Mar '28", price: 100000, ma200w: 49000, ma20w: 73000, type: "projected", event: "HALVING", eventType: "halving" },
  { date: "Apr '28", price: 105000, ma200w: 49500, ma20w: 78000, type: "projected" },
  { date: "May '28", price: 110000, ma200w: 50000, ma20w: 82000, type: "projected" },
  { date: "Jun '28", price: 118000, ma200w: 50500, ma20w: 86000, type: "projected" },
  { date: "Jul '28", price: 125000, ma200w: 51000, ma20w: 92000, type: "projected" },
  { date: "Aug '28", price: 135000, ma200w: 51500, ma20w: 98000, type: "projected" },
  { date: "Sep '28", price: 148000, ma200w: 52000, ma20w: 105000, type: "projected", event: "New ATH zone", eventType: "top" },
  { date: "Oct '28", price: 160000, ma200w: 52500, ma20w: 112000, type: "projected" },
  { date: "Nov '28", price: 175000, ma200w: 53000, ma20w: 120000, type: "projected" },
  { date: "Dec '28", price: 165000, ma200w: 53500, ma20w: 130000, type: "projected" },
  // === 2029 blow-off top ===
  { date: "Jan '29", price: 180000, ma200w: 54000, ma20w: 138000, type: "projected" },
  { date: "Feb '29", price: 195000, ma200w: 55000, ma20w: 145000, type: "projected" },
  { date: "Mar '29", price: 210000, ma200w: 56000, ma20w: 155000, type: "projected" },
  { date: "Apr '29", price: 220000, ma200w: 57000, ma20w: 162000, type: "projected", event: "Proj. ATH ~$220K", eventType: "top" },
  { date: "May '29", price: 190000, ma200w: 58000, ma20w: 170000, type: "projected" },
  { date: "Jun '29", price: 170000, ma200w: 59000, ma20w: 175000, type: "projected" },
];

interface DataPoint {
  date: string;
  price: number;
  ma200w: number;
  ma20w: number;
  type: string;
  event?: string;
  eventType?: string;
  actualPrice: number | null;
  projPrice: number | null;
  buyZoneUpper: number | null;
}

// Build chart data with split lines for actual vs projected
const chartData: DataPoint[] = rawData.map((d, i) => {
  const isProjected = d.type === "projected";
  // Bridge: last actual point also gets projected value for continuity
  const isBridge = d.type === "actual" && rawData[i + 1]?.type === "projected";
  return {
    ...d,
    actualPrice: !isProjected ? d.price : null,
    projPrice: isProjected || isBridge ? d.price : null,
    buyZoneUpper: d.ma200w ? d.ma200w * 1.25 : null,
  };
});

const events = rawData.filter(d => d.event);

// Crash scenario data
const scenarios = [
  { name: "Mid-Cycle Correction", drawdown: 47, price: CURRENT_PRICE, probability: "Current", color: "#22c55e", rationale: "Already at ~47% down. Historical mid-cycle corrections range 32-54%." },
  { name: "Extended Correction", drawdown: 55, price: Math.round(ATH * 0.45), probability: "30-40%", color: "#eab308", rationale: "Matches 2021 May crash. 200WMA upper support. Likely if macro headwinds persist." },
  { name: "Bear Market Light", drawdown: 65, price: Math.round(ATH * 0.35), probability: "15-25%", color: "#f97316", rationale: "Below 200WMA. Miner capitulation. Requires recession signals." },
  { name: "Full Bear Market", drawdown: 77, price: Math.round(ATH * 0.23), probability: "5-10%", color: "#ef4444", rationale: "Matches prior cycle drawdown. Requires black swan." },
];

const halvingCycles = [
  { halving: "Nov '12", reward: "50\u219225", moTop: 12, topPrice: 1177, moBottom: 26, drawdown: 87.1, halvingPrice: 12.5, topMult: "94x" },
  { halving: "Jul '16", reward: "25\u219212.5", moTop: 17, topPrice: 19783, moBottom: 29, drawdown: 84.2, halvingPrice: 650, topMult: "30x" },
  { halving: "May '20", reward: "12.5\u21926.25", moTop: 18, topPrice: 69000, moBottom: 30, drawdown: 77.6, halvingPrice: 8600, topMult: "8x" },
  { halving: "Apr '24", reward: "6.25\u21923.125", moTop: 18, topPrice: 126272, moBottom: null as number | null, drawdown: null as number | null, halvingPrice: 63900, topMult: "2x" },
];

const cyclePhases = [
  { start: 0, end: 6, label: "Accum.", color: "#22c55e33", textColor: "#22c55e" },
  { start: 6, end: 12, label: "Early Bull", color: "#22c55e22", textColor: "#22c55e" },
  { start: 12, end: 18, label: "Blow-off", color: "#f59e0b33", textColor: "#f59e0b" },
  { start: 18, end: 24, label: "Distrib.", color: "#f9731633", textColor: "#f97316" },
  { start: 24, end: 36, label: "Bear", color: "#ef444433", textColor: "#ef4444" },
  { start: 36, end: 48, label: "Recovery", color: "#64748b22", textColor: "#64748b" },
];

function fmt(n: number) { return "$" + n.toLocaleString(); }

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: DataPoint }> }) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  const clr = d.type === "projected" ? "#a78bfa" : "#f59e0b";
  return (
    <div style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 6, padding: "10px 14px", fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}>
      <div style={{ fontWeight: 700, color: "#f8fafc", marginBottom: 6 }}>{d.date} {d.type === "projected" ? "(projected)" : ""}</div>
      <div style={{ color: clr }}>Price: {fmt(d.price)}</div>
      {d.ma200w && <div style={{ color: "#22c55e" }}>200WMA: {fmt(d.ma200w)}</div>}
      {d.ma20w && <div style={{ color: "#64748b" }}>20W SMA: {fmt(d.ma20w)}</div>}
      {d.ma200w && <div style={{ color: d.price > d.ma200w ? "#22c55e" : "#ef4444", marginTop: 4, fontSize: 10 }}>
        {d.price > d.ma200w ? `+${((d.price/d.ma200w - 1)*100).toFixed(0)}% above` : `${((d.price/d.ma200w - 1)*100).toFixed(0)}% below`} 200WMA
      </div>}
      {d.event && <div style={{ color: "#f59e0b", marginTop: 4, fontWeight: 600 }}>{d.event}</div>}
    </div>
  );
}

function Bar({ value, max, color, label, suffix = "%" }: { value: number; max: number; color: string; label: string; suffix?: string }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 5 }}>
      <div style={{ width: 80, fontSize: 11, color: "#94a3b8", textAlign: "right", flexShrink: 0 }}>{label}</div>
      <div style={{ flex: 1, background: "#1e293b", borderRadius: 4, height: 26, position: "relative", overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: `linear-gradient(90deg, ${color}44, ${color})`, borderRadius: 4, transition: "width 0.6s ease" }} />
        <span style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", fontSize: 11, fontWeight: 600, color: "#e2e8f0", textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}>{value.toFixed(1)}{suffix}</span>
      </div>
    </div>
  );
}

function SH({ children, accent }: { children: React.ReactNode; accent?: string }) {
  return <div style={{ fontSize: 11, color: accent || "#64748b", marginBottom: 10, letterSpacing: 1.5, textTransform: "uppercase", fontWeight: 600 }}>{children}</div>;
}

export default function BTCCrashModel() {
  const [selectedScenario, setSelectedScenario] = useState<number | null>(null);
  const [customDrawdown, setCustomDrawdown] = useState(50);
  const [activeTab, setActiveTab] = useState("chart");
  const [logScale, setLogScale] = useState(true);
  const [showBuyZone, setShowBuyZone] = useState(true);

  const customPrice = Math.round(ATH * (1 - customDrawdown / 100));
  const customPctFromCurrent = ((CURRENT_PRICE - customPrice) / CURRENT_PRICE * 100).toFixed(1);

  const tabs = [
    { id: "chart", label: "Full Cycle" },
    { id: "scenarios", label: "Crash Scenarios" },
    { id: "halving", label: "Halving Cycles" },
    { id: "timeline", label: "Cycle Map" },
    { id: "signals", label: "Signals" },
  ];

  return (
    <div style={{
      fontFamily: "'JetBrains Mono', 'SF Mono', 'Fira Code', monospace",
      background: "#0a0f1a", color: "#e2e8f0",
      minHeight: "100vh", padding: "24px 16px",
      maxWidth: 960, margin: "0 auto",
    }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&display=swap'); input[type="range"] { -webkit-appearance: none; width: 100%; height: 6px; background: #1e293b; border-radius: 3px; outline: none; } input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 20px; height: 20px; background: #f59e0b; border-radius: 50%; cursor: pointer; border: 2px solid #0a0f1a; }`}</style>

      {/* Header */}
      <div style={{ marginBottom: 20, borderBottom: "1px solid #1e293b", paddingBottom: 14 }}>
        <div style={{ fontSize: 10, color: "#f59e0b", letterSpacing: 3, marginBottom: 4, textTransform: "uppercase" }}>BTC Crash Model v3 — Full Cycle Projection</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: "#f8fafc", marginBottom: 8 }}>Bitcoin 4-Year Cycle: 2021 ATH &rarr; Next ATH</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, fontSize: 12 }}>
          <div><span style={{ color: "#64748b" }}>2021 ATH </span><span style={{ color: "#94a3b8" }}>$69,000</span></div>
          <div><span style={{ color: "#64748b" }}>2025 ATH </span><span style={{ color: "#22c55e", fontWeight: 600 }}>{fmt(ATH)}</span></div>
          <div><span style={{ color: "#64748b" }}>Now </span><span style={{ color: "#ef4444", fontWeight: 600 }}>{fmt(CURRENT_PRICE)}</span></div>
          <div><span style={{ color: "#64748b" }}>DD </span><span style={{ color: "#f59e0b", fontWeight: 600 }}>-{CURRENT_DRAWDOWN}%</span></div>
          <div><span style={{ color: "#64748b" }}>Proj. Next ATH </span><span style={{ color: "#a78bfa", fontWeight: 600 }}>~$220K (Q2 '29)</span></div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20, flexWrap: "wrap" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            background: activeTab === t.id ? "#1e293b" : "transparent",
            border: `1px solid ${activeTab === t.id ? "#f59e0b" : "#1e293b"}`,
            color: activeTab === t.id ? "#f59e0b" : "#64748b",
            padding: "7px 12px", borderRadius: 6, fontSize: 11,
            fontFamily: "inherit", cursor: "pointer", letterSpacing: 0.5,
            fontWeight: activeTab === t.id ? 600 : 400, transition: "all 0.2s",
          }}>{t.label}</button>
        ))}
      </div>

      {/* ====== FULL CYCLE CHART ====== */}
      {activeTab === "chart" && (<>
        <div style={{ marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <SH accent="#f59e0b">Nov 2021 &rarr; Projected Q2 2029</SH>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={() => setShowBuyZone(!showBuyZone)} style={{
              background: showBuyZone ? "#22c55e22" : "#1e293b",
              border: `1px solid ${showBuyZone ? "#22c55e" : "#334155"}`,
              color: showBuyZone ? "#22c55e" : "#64748b",
              padding: "4px 10px", borderRadius: 4, fontSize: 10, fontFamily: "inherit", cursor: "pointer",
            }}>Buy Zone</button>
            <button onClick={() => setLogScale(!logScale)} style={{
              background: logScale ? "#f59e0b22" : "#1e293b",
              border: `1px solid ${logScale ? "#f59e0b" : "#334155"}`,
              color: logScale ? "#f59e0b" : "#64748b",
              padding: "4px 10px", borderRadius: 4, fontSize: 10, fontFamily: "inherit", cursor: "pointer",
            }}>{logScale ? "Log" : "Linear"}</button>
          </div>
        </div>

        <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8, padding: "16px 4px 4px", marginBottom: 16 }}>
          <ResponsiveContainer width="100%" height={460}>
            <ComposedChart data={chartData} margin={{ top: 20, right: 15, left: 5, bottom: 20 }}>
              <defs>
                <linearGradient id="buyZoneGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity={0.08} />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity={0.25} />
                </linearGradient>
                <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 8, fill: "#475569" }}
                interval={4}
                angle={-45}
                textAnchor="end"
                height={55}
              />
              <YAxis
                scale={logScale ? "log" : "auto"}
                domain={logScale ? [12000, 280000] : ["auto", "auto"]}
                tick={{ fontSize: 9, fill: "#475569" }}
                tickFormatter={(v: number) => v >= 1000 ? `$${(v/1000).toFixed(0)}K` : `$${v}`}
                width={52}
              />
              <Tooltip content={<CustomTooltip />} />

              {/* Buy zone band: 200WMA to 125% of 200WMA */}
              {showBuyZone && <Area type="monotone" dataKey="buyZoneUpper" stroke="none" fill="url(#buyZoneGrad)" fillOpacity={1} />}
              {showBuyZone && <Area type="monotone" dataKey="ma200w" stroke="none" fill="#0f172a" fillOpacity={1} />}

              {/* 200WMA */}
              <Line type="monotone" dataKey="ma200w" stroke="#22c55e" strokeWidth={2.5} dot={false} name="200WMA" />

              {/* 20W SMA */}
              <Line type="monotone" dataKey="ma20w" stroke="#475569" strokeWidth={1.5} dot={false} name="20W SMA" strokeDasharray="5 5" />

              {/* Actual price */}
              <Line type="monotone" dataKey="actualPrice" stroke="#f59e0b" strokeWidth={2.5} dot={false} name="BTC" connectNulls={false} />

              {/* Projected price */}
              <Line type="monotone" dataKey="projPrice" stroke="#a78bfa" strokeWidth={2} dot={false} name="Projected" strokeDasharray="8 5" connectNulls={false} />

              {/* Key levels */}
              <ReferenceLine y={ATH} stroke="#f59e0b22" strokeDasharray="3 3" />
              <ReferenceLine y={69000} stroke="#64748b22" strokeDasharray="3 3" />
              <ReferenceLine y={220000} stroke="#a78bfa22" strokeDasharray="3 3" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginBottom: 20, paddingLeft: 4 }}>
          {[
            { color: "#f59e0b", label: "Actual Price", dash: false },
            { color: "#a78bfa", label: "Projected (4yr cycle)", dash: true },
            { color: "#22c55e", label: "200WMA (buy floor)", dash: false },
            { color: "#475569", label: "20W SMA (trend)", dash: true },
            { color: "#22c55e", label: "Buy zone (< 125% of 200WMA)", bg: true },
          ].map((l, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              {'bg' in l && l.bg ? (
                <div style={{ width: 14, height: 10, background: "#22c55e33", borderRadius: 2, border: "1px solid #22c55e44" }} />
              ) : (
                <div style={{ width: 18, height: 2, background: l.color, borderTop: l.dash ? `2px dashed ${l.color}` : "none" }} />
              )}
              <span style={{ fontSize: 9, color: l.color }}>{l.label}</span>
            </div>
          ))}
        </div>

        {/* Key Events */}
        <div style={{ marginBottom: 20 }}>
          <SH>Key Events</SH>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: 6 }}>
            {events.map((e, i) => {
              const borderColor = e.eventType === "top" ? "#22c55e" : e.eventType === "bottom" ? "#ef4444" : e.eventType === "halving" ? "#a78bfa" : e.eventType === "now" ? "#f59e0b" : e.eventType === "crash" ? "#ef4444" : "#475569";
              return (
                <div key={i} style={{
                  background: e.eventType === "now" ? "#1e293b" : "#0f172a",
                  border: `1px solid ${e.eventType === "now" ? "#f59e0b44" : "#1e293b"}`,
                  borderRadius: 6, padding: "7px 10px",
                  borderLeft: `3px solid ${borderColor}`,
                }}>
                  <div style={{ fontSize: 9, color: "#475569" }}>{e.date}{e.type === "projected" ? " (proj)" : ""}</div>
                  <div style={{ fontSize: 10, color: "#cbd5e1", fontWeight: 500 }}>{e.event}</div>
                  <div style={{ fontSize: 10, color: borderColor, fontWeight: 600 }}>{fmt(e.price)}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Projection basis */}
        <div style={{ background: "#0f172a", border: "1px solid #a78bfa33", borderRadius: 8, padding: 14 }}>
          <SH accent="#a78bfa">Projection Basis</SH>
          <div style={{ fontSize: 11, lineHeight: 1.9, color: "#cbd5e1" }}>
            <div>&bull; <span style={{ color: "#f59e0b", fontWeight: 600 }}>Cycle top @ 18mo</span> confirmed Oct '25 &#10003;</div>
            <div>&bull; <span style={{ color: "#ef4444", fontWeight: 600 }}>Bear bottom @ ~30mo</span> &rarr; Oct '26, ~$38-42K (200WMA break)</div>
            <div>&bull; <span style={{ color: "#22c55e", fontWeight: 600 }}>200WMA touch</span> &rarr; Jul-Sep '26, $45-48K zone</div>
            <div>&bull; <span style={{ color: "#a78bfa", fontWeight: 600 }}>Next halving</span> &rarr; ~Mar '28 (3.125 &rarr; 1.5625 BTC)</div>
            <div>&bull; <span style={{ color: "#a78bfa", fontWeight: 600 }}>Next cycle top</span> &rarr; Q1-Q2 '29, ~$200-220K</div>
            <div>&bull; <span style={{ color: "#f59e0b", fontWeight: 600 }}>Diminishing returns:</span> 94x &rarr; 30x &rarr; 8x &rarr; 2x &rarr; <span style={{ color: "#a78bfa" }}>~1.5-2x next</span></div>
            <div style={{ marginTop: 10, padding: "8px 10px", background: "#f59e0b11", borderRadius: 4, borderLeft: "3px solid #f59e0b" }}>
              <span style={{ color: "#f59e0b", fontWeight: 600 }}>Your DIY MoneyLine buy zone:</span> Price within 25% of 200WMA (~$58-62K) with F&amp;G &lt; 20. Heavy accumulation at 200WMA touch (~$46-50K). Projected optimal window: Q3 '26 &ndash; Q2 '27.
            </div>
          </div>
        </div>
      </>)}

      {/* ====== SCENARIOS TAB ====== */}
      {activeTab === "scenarios" && (<>
        <div style={{ marginBottom: 22 }}>
          <SH>Price Waterfall from ATH</SH>
          <div style={{ position: "relative", height: 52, background: "#0f172a", borderRadius: 8, border: "1px solid #1e293b", overflow: "hidden" }}>
            {(() => {
              const pct = (CURRENT_PRICE / ATH) * 100;
              return (<div style={{ position: "absolute", left: `${pct}%`, top: 0, height: "100%", zIndex: 10 }}>
                <div style={{ width: 2, height: "100%", background: "#f59e0b" }} />
                <div style={{ position: "absolute", top: 4, left: 6, fontSize: 9, color: "#f59e0b", whiteSpace: "nowrap", fontWeight: 600 }}>NOW {fmt(CURRENT_PRICE)}</div>
              </div>);
            })()}
            {scenarios.map((s, i) => {
              const pct = (s.price / ATH) * 100;
              return (<div key={i} style={{ position: "absolute", left: `${pct}%`, top: 0, height: "100%", cursor: "pointer" }} onClick={() => setSelectedScenario(selectedScenario === i ? null : i)}>
                <div style={{ width: 2, height: "100%", background: s.color + "88" }} />
                <div style={{ position: "absolute", bottom: i % 2 === 0 ? 4 : 20, left: 6, fontSize: 8, color: s.color, whiteSpace: "nowrap" }}>{fmt(s.price)}</div>
              </div>);
            })}
            <div style={{ position: "absolute", left: 0, top: 0, width: `${(CURRENT_PRICE / ATH) * 100}%`, height: "100%", background: "linear-gradient(90deg, #ef444422, #ef444408)" }} />
          </div>
        </div>

        <div style={{ marginBottom: 22 }}>
          <SH>Crash Scenarios from ATH ({fmt(ATH)})</SH>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 8 }}>
            {scenarios.map((s, i) => (
              <div key={i} onClick={() => setSelectedScenario(selectedScenario === i ? null : i)} style={{
                background: selectedScenario === i ? "#1e293b" : "#0f172a",
                border: `1px solid ${selectedScenario === i ? s.color : "#1e293b"}`,
                borderRadius: 8, padding: 12, cursor: "pointer", transition: "all 0.2s",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <div>
                    <div style={{ fontSize: 10, color: s.color, fontWeight: 600 }}>{s.name}</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: "#f8fafc" }}>{fmt(s.price)}</div>
                  </div>
                  <div style={{ background: s.color + "22", color: s.color, padding: "3px 6px", borderRadius: 4, fontSize: 12, fontWeight: 700, height: "fit-content" }}>-{s.drawdown}%</div>
                </div>
                <div style={{ fontSize: 10, color: "#64748b" }}>Prob: {s.probability}</div>
                {i > 0 && <div style={{ fontSize: 10, color: "#ef4444", marginTop: 2 }}>More down: -{((CURRENT_PRICE - s.price) / CURRENT_PRICE * 100).toFixed(1)}%</div>}
                {selectedScenario === i && <div style={{ marginTop: 6, paddingTop: 6, borderTop: `1px solid ${s.color}33`, fontSize: 10, color: "#cbd5e1", lineHeight: 1.5 }}>{s.rationale}</div>}
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8, padding: 14, marginBottom: 22 }}>
          <SH>Custom Drawdown Calculator</SH>
          <input type="range" min={10} max={90} value={customDrawdown} onChange={(e) => setCustomDrawdown(Number(e.target.value))} style={{ marginBottom: 10 }} />
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10, fontSize: 12 }}>
            <div><span style={{ color: "#64748b", fontSize: 10 }}>DD: </span><span style={{ color: "#a78bfa", fontSize: 16, fontWeight: 700 }}>-{customDrawdown}%</span></div>
            <div><span style={{ color: "#64748b", fontSize: 10 }}>Target: </span><span style={{ color: "#f8fafc", fontSize: 16, fontWeight: 700 }}>{fmt(customPrice)}</span></div>
            <div><span style={{ color: "#64748b", fontSize: 10 }}>From now: </span><span style={{ color: customPrice < CURRENT_PRICE ? "#ef4444" : "#22c55e", fontSize: 16, fontWeight: 700 }}>{customPrice < CURRENT_PRICE ? "-" : "+"}{Math.abs(parseFloat(customPctFromCurrent))}%</span></div>
          </div>
        </div>

        <div style={{ marginBottom: 22 }}>
          <SH>Historical Bear Market Drawdowns</SH>
          {[
            { cycle: "2011", drawdown: 93.7 },
            { cycle: "2013-15", drawdown: 87.1 },
            { cycle: "2017-18", drawdown: 84.2 },
            { cycle: "2021-22", drawdown: 77.6 },
          ].map((c, i) => <Bar key={i} value={c.drawdown} max={100} color="#ef4444" label={c.cycle} />)}
          <Bar value={parseFloat(CURRENT_DRAWDOWN)} max={100} color="#f59e0b" label="2025-26" />
          <div style={{ fontSize: 10, color: "#64748b", marginTop: 5 }}>Pattern: 93&rarr;87&rarr;84&rarr;78%. Projected max ~70% = {fmt(Math.round(ATH * 0.30))}</div>
        </div>
      </>)}

      {/* ====== HALVING TAB ====== */}
      {activeTab === "halving" && (<>
        <div style={{ marginBottom: 22 }}>
          <SH accent="#a78bfa">Halving Cycle Comparison</SH>
          <div style={{ overflowX: "auto" }}>
            <div style={{ minWidth: 580 }}>
              <div style={{ display: "grid", gridTemplateColumns: "65px 72px 55px 80px 55px 50px 50px", gap: 1, marginBottom: 2 }}>
                {["Halving", "Reward", "Top @", "Peak", "Max DD", "Bot @", "Mult"].map((h, i) => (
                  <div key={i} style={{ background: "#1e293b", padding: "6px 6px", fontSize: 9, color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>{h}</div>
                ))}
              </div>
              {halvingCycles.map((c, i) => {
                const cur = i === halvingCycles.length - 1;
                const s: React.CSSProperties = { background: cur ? "#1e293b" : "#0f172a", padding: "7px 6px", fontSize: 11, color: "#cbd5e1" };
                return (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "65px 72px 55px 80px 55px 50px 50px", gap: 1, marginBottom: 1 }}>
                    <div style={{ ...s, color: cur ? "#f59e0b" : "#94a3b8", fontWeight: cur ? 600 : 400, borderLeft: cur ? "3px solid #f59e0b" : "3px solid transparent" }}>{c.halving}</div>
                    <div style={{ ...s, fontSize: 10 }}>{c.reward}</div>
                    <div style={s}><span style={{ fontWeight: 600 }}>{c.moTop}mo</span></div>
                    <div style={{ ...s, color: "#22c55e", fontWeight: 600 }}>{fmt(c.topPrice)}</div>
                    <div style={s}>{c.drawdown ? <span style={{ color: "#ef4444", fontWeight: 600 }}>-{c.drawdown}%</span> : <span style={{ color: "#f59e0b" }}>-{CURRENT_DRAWDOWN}%*</span>}</div>
                    <div style={s}>{c.moBottom ? <span>{c.moBottom}mo</span> : <span style={{ color: "#f59e0b" }}>TBD</span>}</div>
                    <div style={{ ...s, color: "#a78bfa", fontWeight: 600 }}>{c.topMult}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div style={{ background: "#0f172a", border: "1px solid #a78bfa33", borderRadius: 8, padding: 14, marginBottom: 22 }}>
          <SH accent="#a78bfa">Converging Patterns</SH>
          <div style={{ fontSize: 12, lineHeight: 1.9, color: "#cbd5e1" }}>
            <div><span style={{ color: "#a78bfa", fontWeight: 600 }}>Top timing:</span> 12&rarr;17&rarr;18&rarr;<span style={{ color: "#f59e0b" }}>18 &#10003;</span> (converged)</div>
            <div><span style={{ color: "#a78bfa", fontWeight: 600 }}>Bottom timing:</span> 26&rarr;29&rarr;30&rarr;<span style={{ color: "#f59e0b" }}>~28-30?</span></div>
            <div><span style={{ color: "#a78bfa", fontWeight: 600 }}>Max DD:</span> 87&rarr;84&rarr;78&rarr;<span style={{ color: "#f59e0b" }}>~70?</span></div>
            <div><span style={{ color: "#a78bfa", fontWeight: 600 }}>Top multiple:</span> 94x&rarr;30x&rarr;8x&rarr;<span style={{ color: "#f59e0b" }}>2x</span> (diminishing)</div>
          </div>
        </div>

        <div>
          <SH>Top Multiple (Halving Price &rarr; Peak)</SH>
          {halvingCycles.map((c, i) => {
            const mult = c.topPrice / c.halvingPrice;
            return <Bar key={i} value={mult} max={100} color="#a78bfa" label={c.halving.slice(-3)} suffix="x" />;
          })}
        </div>
      </>)}

      {/* ====== TIMELINE TAB ====== */}
      {activeTab === "timeline" && (<>
        <div style={{ marginBottom: 22 }}>
          <SH accent="#f59e0b">4-Year Cycle Position (from Apr '24 Halving)</SH>
          <div style={{ position: "relative", marginBottom: 16 }}>
            <div style={{ display: "flex", height: 44, borderRadius: 8, overflow: "hidden", marginBottom: 4 }}>
              {cyclePhases.map((p, i) => {
                const w = ((p.end - p.start) / totalCycleMonths) * 100;
                return (<div key={i} style={{ width: `${w}%`, background: p.color, display: "flex", alignItems: "center", justifyContent: "center", borderRight: "1px solid #0a0f1a" }}>
                  <span style={{ fontSize: 8, color: p.textColor, fontWeight: 600, textAlign: "center", lineHeight: 1.2 }}>{p.label}</span>
                </div>);
              })}
            </div>
            <div style={{ position: "absolute", left: `${(monthsSinceHalving / totalCycleMonths) * 100}%`, top: -4, transform: "translateX(-50%)", zIndex: 10 }}>
              <div style={{ width: 3, height: 56, background: "#f59e0b", margin: "0 auto" }} />
              <div style={{ background: "#f59e0b", color: "#0a0f1a", padding: "2px 6px", borderRadius: 4, fontSize: 9, fontWeight: 700, whiteSpace: "nowrap", textAlign: "center" }}>NOW ({monthsSinceHalving}mo)</div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 24 }}>
              {[0, 6, 12, 18, 24, 30, 36, 42, 48].map(m => <span key={m} style={{ fontSize: 8, color: "#475569" }}>{m}</span>)}
            </div>
          </div>
        </div>

        <div>
          <SH accent="#a78bfa">Projected Timeline to Next ATH</SH>
          <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8, overflow: "hidden" }}>
            {[
              { month: "Feb-Apr '26", mo: "22-24", event: "Distribution / decline", level: "$58K-$72K", color: "#f97316", status: "\u2190 YOU ARE HERE" },
              { month: "May-Jul '26", mo: "25-27", event: "Bear acceleration", level: "$45K-$60K", color: "#ef4444" },
              { month: "Aug-Dec '26", mo: "28-32", event: "Capitulation \u2192 Bottom", level: "$35K-$50K", color: "#ef4444" },
              { month: "Jan-Jun '27", mo: "33-38", event: "Accumulation (BUY ZONE)", level: "$40K-$55K", color: "#22c55e" },
              { month: "Jul-Dec '27", mo: "39-44", event: "Recovery \u2192 20WMA flip", level: "$55K-$82K", color: "#22c55e" },
              { month: "~Mar '28", mo: "48", event: "HALVING \u2192 1.5625 BTC", level: "~$100K", color: "#a78bfa" },
              { month: "Apr-Dec '28", mo: "49-56", event: "Post-halving bull", level: "$105K-$175K", color: "#a78bfa" },
              { month: "Q1-Q2 '29", mo: "57-66", event: "Blow-off \u2192 NEXT ATH", level: "$180-$220K", color: "#f59e0b" },
            ].map((r, i) => (
              <div key={i} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "9px 12px", borderBottom: i < 7 ? "1px solid #1e293b" : "none",
                background: r.status ? "#1e293b" : "transparent",
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: "#f8fafc" }}>{r.month}</div>
                  <div style={{ fontSize: 9, color: "#475569" }}>Mo {r.mo}</div>
                </div>
                <div style={{ flex: 2, fontSize: 10, color: "#cbd5e1", padding: "0 8px" }}>
                  {r.event}
                  {r.status && <span style={{ color: "#f59e0b", fontWeight: 700, marginLeft: 6 }}>{r.status}</span>}
                </div>
                <div style={{ fontSize: 11, color: r.color, fontWeight: 600, textAlign: "right", minWidth: 90 }}>{r.level}</div>
              </div>
            ))}
          </div>
        </div>
      </>)}

      {/* ====== SIGNALS TAB ====== */}
      {activeTab === "signals" && (<>
        <div style={{ background: "#0f172a", border: "1px solid #f59e0b33", borderRadius: 8, padding: 14, marginBottom: 22 }}>
          <SH accent="#f59e0b">Signal Status — Feb 6, 2026</SH>
          <div style={{ fontSize: 11, lineHeight: 2, color: "#cbd5e1" }}>
            <div style={{ color: "#ef4444" }}>&#x1F534; Below ALL EMAs — 20/50/100/200 stacked above</div>
            <div style={{ color: "#ef4444" }}>&#x1F534; 20W SMA bearish — Confirmed since Nov '25</div>
            <div style={{ color: "#ef4444" }}>&#x1F534; ETF outflows — $817M day, 10K+ BTC sold Jan</div>
            <div style={{ color: "#ef4444" }}>&#x1F534; Month 22 — Bear territory every prior cycle</div>
            <div style={{ color: "#eab308" }}>&#x1F7E1; F&amp;G: 15 — Extreme Fear (bottoming signal but can persist)</div>
            <div style={{ color: "#22c55e" }}>&#x1F7E2; 200WMA rising — ~$46-48K support intact</div>
            <div style={{ color: "#22c55e" }}>&#x1F7E2; ETF infrastructure intact — structural demand floor</div>
          </div>
        </div>

        <div style={{ background: "#0f172a", border: "1px solid #22c55e33", borderRadius: 8, padding: 14, marginBottom: 22 }}>
          <SH accent="#22c55e">DIY MoneyLine Decision Rules</SH>
          <div style={{ fontSize: 11, lineHeight: 2.2, color: "#cbd5e1" }}>
            {[
              { c: "#ef4444", l: "CAPITAL PRESERVATION", t: "20W SMA bearish \u2192 no new longs", s: "ACTIVE \u2713" },
              { c: "#eab308", l: "BUY ZONE ENTRY", t: "Price within 25% of 200WMA (~$58-62K) + F&G<20", s: "PENDING" },
              { c: "#f97316", l: "STRONG BUY", t: "Price within 10% of 200WMA (~$50-55K)", s: "PENDING" },
              { c: "#ef4444", l: "ABSOLUTE BUY", t: "200WMA touch (~$46-48K) \u2014 avg +211% 12mo return", s: "PENDING" },
              { c: "#22c55e", l: "RE-ENTRY SIGNAL", t: "Weekly close >$86K (20W SMA reclaim)", s: "PENDING" },
              { c: "#a78bfa", l: "ACCUMULATION WINDOW", t: "Q3 '26 \u2013 Q2 '27 (6-18mo pre-halving)", s: "PENDING" },
            ].map((r, i) => (
              <div key={i} style={{ padding: "4px 0", borderBottom: i < 5 ? "1px solid #1e293b" : "none", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <span style={{ color: r.c, fontWeight: 600 }}>{r.l}:</span> {r.t}
                </div>
                <span style={{ fontSize: 9, color: r.s.startsWith("ACTIVE") ? "#ef4444" : "#475569", fontWeight: 600, whiteSpace: "nowrap", minWidth: 60, textAlign: "right" }}>{r.s}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: "linear-gradient(135deg, #1e293b, #0f172a)", border: "1px solid #f59e0b44", borderRadius: 8, padding: 14 }}>
          <SH accent="#f59e0b">Net Assessment</SH>
          <div style={{ fontSize: 12, lineHeight: 1.8, color: "#e2e8f0" }}>
            <p style={{ marginBottom: 8 }}>18mo cycle top confirmed. Month 22 = bear territory in every prior cycle. Signals overwhelmingly bearish short-term.</p>
            <p style={{ marginBottom: 8 }}><span style={{ color: "#f59e0b", fontWeight: 600 }}>Base:</span> Decline to $55-62K Q1-Q2 '26. Bottom $35-50K Q3-Q4 '26. Accumulate for 2028 halving &rarr; projected ~$220K top by Q2 '29.</p>
            <p style={{ marginBottom: 8 }}><span style={{ color: "#22c55e", fontWeight: 600 }}>Bull:</span> ETF floor holds, $67K near bottom. Needs $86K weekly close. No evidence yet.</p>
            <p><span style={{ color: "#ef4444", fontWeight: 600 }}>Bear:</span> Full -77% = ~$29K. Black swan required. Low probability.</p>
          </div>
        </div>
      </>)}

      {/* Footer */}
      <div style={{ marginTop: 24, padding: "10px 0", borderTop: "1px solid #1e293b", textAlign: "center", fontSize: 9, color: "#334155" }}>
        BTC Crash Model v3 | 200WMA + 20W SMA + Halving Cycles | Updated Feb 6, 2026 | Not financial advice
      </div>
    </div>
  );
}
