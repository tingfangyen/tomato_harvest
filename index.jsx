import React, { useEffect, useMemo, useState } from 'react';
import ReactDOM from 'react-dom/client';
import {
  BarChart, Bar, AreaChart, Area, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';

// ---------- Design tokens ----------
const COLORS = {
  forest: "#1F3626",
  forestDeep: "#152719",
  paper: "#F1E6CC",
  paperDim: "#E4D6B4",
  red: "#C1442D",
  redBright: "#E05A3C",
  yellow: "#E0A82E",
  yellowBright: "#F2C355",
  ink: "#2A2418",
  vine: "#7FA07E",
  vineDim: "#4C6B4F",
};

// ---------- Raw data ----------
// Edit this array as new harvests come in.
const raw = [
  { day: "≤ 7/24", red: { weights: [23.6, 19.9, 14.8, 8.9, 8.3, 8.4, 7.8, 3.6, 2.0], unweighed: 0 }, yellow: { weights: [33.2, 11.1], unweighed: 0 } },
  { day: "7/25", red: { weights: [21.9, 17.7, 20.4], unweighed: 0 }, yellow: { weights: [26.9, 8.7], unweighed: 0 } },
  { day: "7/26", red: { weights: [18.9, 20.3, 14.5, 7.3], unweighed: 1 }, yellow: { weights: [24.6], unweighed: 1 } },
  { day: "7/27", red: { weights: [28.5, 17.5, 24.9, 18.1, 18.2, 23.0, 22.6, 19.8, 17.8, 14.0, 10.2], unweighed: 0 }, yellow: { weights: [8.7], unweighed: 1, note: "squirrel-eaten" } },
  { day: "7/29", red: { weights: [18.6, 16.3, 22.7, 15.3, 16.0], unweighed: 0 }, yellow: { weights: [20.8, 11.7, 11.4], unweighed: 0 } },
  { day: "7/31", red: { weights: [27.1, 25.5, 18.0, 17.6, 14.6, 14.5, 11.5, 10.8, 6.2], unweighed: 0 }, yellow: { weights: [18.5, 16.5], unweighed: 0 } },
  { day: "8/2", red: { weights: [20.3, 24.4, 17.5, 16.1, 12.5], unweighed: 0 }, yellow: { weights: [26.6, 26.8, 17.9], unweighed: 0 } },
  { day: "8/3", red: { weights: [12.7], unweighed: 0 }, yellow: { weights: [25.7], unweighed: 0 } },
  { day: "8/6", red: { weights: [16.5, 13.2, 8.5, 8.7, 6.3], unweighed: 0 }, yellow: { weights: [15.4, 13.7, 13.3, 11.0, 29.3, 21.9], unweighed: 1, note: "1 half-eaten by squirrel" } },
  { day: "8/12", red: { weights: [14.3], unweighed: 2, note: "rotted" }, yellow: { weights: [20.9, 18.15, 17.55, 17.05, 14.9, 13, 11.7], unweighed: 0 }},
  { day: "8/16", red: { weights: [17.8, 16], unweighed: 0 }, yellow: { weights: [21.15, 13.10, 13.90, 13.15, 8.10, 8.15, 8.15, 3.15, 13.45], unweighed: 2, note: "rotted" }},
  { day: "8/18", red: { weights: [], unweighed: 0 }, yellow: { weights: [17.95], unweighed: 0 }},
  { day: "8/21", red: { weights: [], unweighed: 0 }, yellow: { weights: [13.35, 10.5], unweighed: 0 }},
  { day: "8/23", red: { weights: [], unweighed: 0 }, yellow: { weights: [15.7], unweighed: 0 }},
  { day: "8/27", red: { weights: [15.55], unweighed: 0 }, yellow: {weights: [], unweighed: 0 }},
  { day: "8/30", red: { weights: [], unweighed: 0 }, yellow: { weights: [18.9, 17.55, 11.85, 12.3], unweighed: 0 }}, 
  { day: "9/4", red: { weights: [], unweighed: 0 }, yellow: { weights: [16.65], unweighed: 0 } },
  { day: "9/6", red: { weights: [10.25, 9.10], unweighed: 0 }, yellow: { weights: [10.55], unweighed: 0 } },
  { day: "9/12", red: { weights: [11.25], unweighed: 0}, yellow: {weights: [16.15], unweighed: 0 } },
  { day: "9/16", red: { weights: [20.45, 13.4, 12.9, 12.95, 10.65], unweighed: 0}, yellow: {weights: [], unweighed: 0}},
  { day: "9/19", red: { weights: [15, 14.05, 11.3, 10.7, 10.7, 9.9, 8.95, 6.25], unweighed: 0}, yellow: { weights: [12.4, 8.3], unweighed: 0}}, 
  { day: "9/20", red: { weights: [13.25, 13.05, 11.1, 11.15, 9.75, 9.8, 7.7, 6.85, 7.25, 5.8, 5.5], unweighed: 0}, yellow: { weights: [], unweighed: 0}},
  { day: "9/21", red: { weights: [10.6, 9.95], unweighed: 0}, yellow: { weights: [14.4, 13.35], unweighed: 0}},
  { day: "9/23", red: { weights: [11.15], unweighed: 0}, yellow: { weights: [], unweighed: 0} },
  { day: "9/25", red: { weights: [10.7, 8.95, 8.9, 9.05, 7.85, 13.6], unweighed: 0}, yellow: {weights: [18.15, 14.05, 13.3, 9.45], unweighed: 0}},
];

// Unit constants
const OZ_TO_GRAMS = 28.3495;

const fmtLbOz = (oz) => {
  const lb = Math.floor(oz / 16);
  const rem = Math.round((oz - lb * 16) * 10) / 10;
  if (lb === 0) return `${rem} oz`;
  return `${lb} lb ${rem} oz`;
};

const fmtGrams = (oz) => {
  const grams = Math.round(oz * OZ_TO_GRAMS);
  return `${grams} g`;
};

const fmtWeight = (oz, unit) => {
  return unit === 'metric' ? fmtGrams(oz) : fmtLbOz(oz);
};

const fmtLbOrKg = (oz, unit) => {
  if (unit === 'metric') {
    const kg = (oz * OZ_TO_GRAMS) / 1000;
    return `${Math.round(kg * 100) / 100} kg`;
  }
  const lb = oz / 16;
  return `${Math.round(lb * 100) / 100} lb`;
};

const sum = (arr) => arr.reduce((a, b) => a + b, 0);

// ---------- Derived datasets ----------
function useDerived(unit) {
  return useMemo(() => {
    let runRed = 0, runYellow = 0;
    const daily = raw.map((d) => {
      const redTotal = sum(d.red.weights);
      const yellowTotal = sum(d.yellow.weights);
      runRed += redTotal;
      runYellow += yellowTotal;
      
      const redVal = unit === 'metric' 
        ? Math.round(((redTotal * OZ_TO_GRAMS) / 1000) * 100) / 100
        : Math.round((redTotal / 16) * 100) / 100;

      const yellowVal = unit === 'metric'
        ? Math.round(((yellowTotal * OZ_TO_GRAMS) / 1000) * 100) / 100
        : Math.round((yellowTotal / 16) * 100) / 100;

      const totalVal = unit === 'metric'
        ? Math.round((((redTotal + yellowTotal) * OZ_TO_GRAMS) / 1000) * 100) / 100
        : Math.round(((redTotal + yellowTotal) / 16) * 100) / 100;

      const cumRedVal = unit === 'metric'
        ? Math.round(((runRed * OZ_TO_GRAMS) / 1000) * 100) / 100
        : Math.round((runRed / 16) * 100) / 100;

      const cumYellowVal = unit === 'metric'
        ? Math.round(((runYellow * OZ_TO_GRAMS) / 1000) * 100) / 100
        : Math.round((runYellow / 16) * 100) / 100;

      const cumTotalVal = unit === 'metric'
        ? Math.round((((runRed + runYellow) * OZ_TO_GRAMS) / 1000) * 100) / 100
        : Math.round(((runRed + runYellow) / 16) * 100) / 100;

      return {
        day: d.day,
        redOz: Math.round(redTotal * 10) / 10,
        yellowOz: Math.round(yellowTotal * 10) / 10,
        redVal,
        yellowVal,
        totalOz: redTotal + yellowTotal,
        totalVal,
        redCount: d.red.weights.length + d.red.unweighed,
        yellowCount: d.yellow.weights.length + d.yellow.unweighed,
        cumRedVal,
        cumYellowVal,
        cumTotalVal,
      };
    });

    const individual = [];
    raw.forEach((d, dayIdx) => {
      d.red.weights.forEach((w) => individual.push({
        day: d.day,
        dayIdx,
        weightOz: w,
        weightVal: unit === 'metric' ? Math.round(w * OZ_TO_GRAMS) : w,
        variety: "red",
        label: fmtWeight(w, unit)
      }));
      d.yellow.weights.forEach((w) => individual.push({
        day: d.day,
        dayIdx,
        weightOz: w,
        weightVal: unit === 'metric' ? Math.round(w * OZ_TO_GRAMS) : w,
        variety: "yellow",
        label: fmtWeight(w, unit)
      }));
    });

    const redWeights = individual.filter((t) => t.variety === "red").map((t) => t.weightOz);
    const yellowWeights = individual.filter((t) => t.variety === "yellow").map((t) => t.weightOz);
    const allWeights = [...redWeights, ...yellowWeights];

    const redUnweighed = raw.reduce((a, d) => a + d.red.unweighed, 0);
    const yellowUnweighed = raw.reduce((a, d) => a + d.yellow.unweighed, 0);

    const redTotalOz = sum(redWeights);
    const yellowTotalOz = sum(yellowWeights);
    const totalOz = redTotalOz + yellowTotalOz;
    const redCount = redWeights.length + redUnweighed;
    const yellowCount = yellowWeights.length + yellowUnweighed;
    const totalCount = redCount + yellowCount;

    const biggest = individual.reduce((a, b) => (b.weightOz > a.weightOz ? b : a));
    const smallest = individual.reduce((a, b) => (b.weightOz < a.weightOz ? b : a));
    const bestDay = daily.reduce((a, b) => (b.totalOz > a.totalOz ? b : a));

    // Build a "went uncounted by weight" sentence
    const unweighedByVariety = { red: [], yellow: [] };
    raw.forEach((d) => {
      if (d.red.unweighed > 0) unweighedByVariety.red.push({ day: d.day, count: d.red.unweighed, note: d.red.note });
      if (d.yellow.unweighed > 0) unweighedByVariety.yellow.push({ day: d.day, count: d.yellow.unweighed, note: d.yellow.note });
    });
    const varietyPhrase = (list, variety) => {
      if (!list.length) return null;
      const total = list.reduce((a, b) => a + b.count, 0);
      const dayStr = list.map((l) => (l.note ? `${l.day} — ${l.note}` : l.day)).join(", ");
      return `${total} ${variety} tomato${total === 1 ? "" : "es"} (${dayStr})`;
    };
    const unweighedParts = [varietyPhrase(unweighedByVariety.red, "red"), varietyPhrase(unweighedByVariety.yellow, "yellow")].filter(Boolean);
    const unweighedSummary = unweighedParts.length ? `${unweighedParts.join(" and ")} went uncounted by weight` : null;

    // Histogram buckets: 2 oz wide for imperial, 50 g wide for metric
    const isMetric = unit === 'metric';
    const bucketSize = isMetric ? 50 : 2; // g or oz
    const weightsForHist = individual.map((t) => ({
      val: isMetric ? t.weightOz * OZ_TO_GRAMS : t.weightOz,
      variety: t.variety
    }));
    const maxVal = Math.max(...weightsForHist.map((w) => w.val));
    const numBuckets = Math.ceil(maxVal / bucketSize) + 1;
    
    const histogram = Array.from({ length: numBuckets }, (_, i) => ({
      range: `${i * bucketSize}-${i * bucketSize + bucketSize}`,
      lo: i * bucketSize,
      red: 0,
      yellow: 0,
    }));

    weightsForHist.forEach((w) => {
      const idx = Math.min(Math.floor(w.val / bucketSize), numBuckets - 1);
      histogram[idx][w.variety] += 1;
    });

    const avgOz = totalOz / allWeights.length;
    const avgHistVal = isMetric ? avgOz * OZ_TO_GRAMS : avgOz;

    return {
      daily,
      individual,
      totalWeightFormatted: fmtLbOrKg(totalOz, unit),
      redTotalWeightFormatted: fmtLbOrKg(redTotalOz, unit),
      yellowTotalWeightFormatted: fmtLbOrKg(yellowTotalOz, unit),
      totalCount, redCount, yellowCount,
      biggest, smallest, bestDay, unweighedSummary,
      histogram,
      avgOz,
      avgHistVal,
      bucketSize
    };
  }, [unit]);
}

// ---------- Small components ----------
function TomatoCap({ cx, cy, fill }) {
  if (cx == null || cy == null) return null;
  return (
    <g>
      <ellipse cx={cx} cy={cy - 5} rx={5} ry={4.5} fill={fill} stroke={COLORS.forestDeep} strokeWidth={1} />
      <path d={`M ${cx - 2} ${cy - 8} Q ${cx} ${cy - 13} ${cx + 2.5} ${cy - 9}`} stroke={COLORS.vineDim} strokeWidth={1.4} fill="none" strokeLinecap="round" />
    </g>
  );
}

function StatChip({ label, value, accent }) {
  return (
    <div
      style={{
        background: COLORS.paper,
        border: `1.5px solid ${COLORS.forestDeep}`,
        borderRadius: 10,
        padding: "10px 16px",
        minWidth: 120,
        boxShadow: "2px 2px 0 rgba(21,39,25,0.35)",
      }}
    >
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, letterSpacing: 1, textTransform: "uppercase", color: COLORS.vineDim, marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 600, color: accent || COLORS.ink }}>
        {value}
      </div>
    </div>
  );
}

const TABS = [
  { id: "daily", label: "Daily Yield" },
  { id: "cumulative", label: "Cumulative" },
  { id: "strip", label: "Every Tomato" },
  { id: "histogram", label: "Size Distribution" },
];

function CustomTooltip({ active, payload, label, formatter }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div style={{
      background: COLORS.forest, color: COLORS.paper, padding: "8px 12px",
      borderRadius: 8, border: `1px solid ${COLORS.yellow}`, fontFamily: "'IBM Plex Mono', monospace", fontSize: 12,
    }}>
      <div style={{ marginBottom: 4, color: COLORS.yellowBright }}>{label}</div>
      {formatter(payload)}
    </div>
  );
}

function VarietyLegend() {
  return (
    <div style={{ display: "flex", gap: 18, justifyContent: "center", marginBottom: 10, fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: COLORS.ink }}>
      <span><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 5, background: COLORS.red, marginRight: 6 }} />red</span>
      <span><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 5, background: COLORS.yellow, marginRight: 6 }} />yellow</span>
    </div>
  );
}

function TomatoHarvest() {
  const [unit, setUnit] = useState("imperial"); // "imperial" | "metric"
  const {
    daily, individual, totalWeightFormatted, redTotalWeightFormatted, yellowTotalWeightFormatted,
    totalCount, redCount, yellowCount, biggest, smallest, bestDay, unweighedSummary, histogram,
    avgOz, avgHistVal, bucketSize
  } = useDerived(unit);
  
  const [tab, setTab] = useState("daily");

  const weightUnitLabel = unit === "metric" ? "kg" : "lb";
  const singleUnitLabel = unit === "metric" ? "g" : "oz";

  return (
    <div style={{
      background: COLORS.forest,
      backgroundImage: `radial-gradient(circle at 15% 10%, ${COLORS.forestDeep} 0%, ${COLORS.forest} 55%)`,
      minHeight: "100vh", padding: "28px 20px", fontFamily: "'Public Sans', sans-serif", color: COLORS.paper,
      boxSizing: "border-box",
    }}>
      <div style={{ textAlign: "center", marginBottom: 22 }}>
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, letterSpacing: 3, color: COLORS.yellowBright, textTransform: "uppercase" }}>
          Garden Log · 2026 Season Record
        </div>
        <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 34, margin: "6px 0 4px", color: COLORS.paper }}>
          The Tomato Harvest
        </h1>
        <div style={{ fontFamily: "'Public Sans', sans-serif", fontSize: 13, color: COLORS.vine, marginBottom: 12 }}>
          {raw[0].day.replace("≤ ", "")} &mdash; {raw[raw.length - 1].day} &nbsp;·&nbsp; {totalCount} tomatoes picked ({redCount} red, {yellowCount} yellow)
        </div>

        {/* Unit Conversion Toggle */}
        <div style={{ display: "inline-flex", background: COLORS.forestDeep, padding: 3, borderRadius: 20, border: `1px solid ${COLORS.vineDim}` }}>
          <button
            onClick={() => setUnit("imperial")}
            style={{
              fontFamily: "'IBM Plex Mono', monospace", fontSize: 11,
              padding: "4px 12px", borderRadius: 16, border: "none", cursor: "pointer",
              background: unit === "imperial" ? COLORS.yellow : "transparent",
              color: unit === "imperial" ? COLORS.forestDeep : COLORS.paper,
              fontWeight: unit === "imperial" ? 600 : 400,
              transition: "all 0.15s ease",
            }}
          >
            oz / lb
          </button>
          <button
            onClick={() => setUnit("metric")}
            style={{
              fontFamily: "'IBM Plex Mono', monospace", fontSize: 11,
              padding: "4px 12px", borderRadius: 16, border: "none", cursor: "pointer",
              background: unit === "metric" ? COLORS.yellow : "transparent",
              color: unit === "metric" ? COLORS.forestDeep : COLORS.paper,
              fontWeight: unit === "metric" ? 600 : 400,
              transition: "all 0.15s ease",
            }}
          >
            g / kg
          </button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 26 }}>
        <StatChip label="Total Harvest" value={totalWeightFormatted} accent={COLORS.red} />
        <StatChip label="Red / Yellow" value={`${redTotalWeightFormatted} / ${yellowTotalWeightFormatted}`} />
        <StatChip label="Avg Weight" value={fmtWeight(avgOz, unit)} />
        <StatChip label="Biggest" value={fmtWeight(biggest.weightOz, unit)} accent={biggest.variety === "red" ? COLORS.red : COLORS.yellow} />
        <StatChip label="Best Day" value={bestDay.day} accent={COLORS.red} />
      </div>

      <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 20, flexWrap: "wrap" }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, letterSpacing: 0.5,
              padding: "8px 14px", borderRadius: 999, cursor: "pointer",
              border: `1.5px solid ${tab === t.id ? COLORS.yellow : COLORS.vineDim}`,
              background: tab === t.id ? COLORS.yellow : "transparent",
              color: tab === t.id ? COLORS.forestDeep : COLORS.paper,
              fontWeight: tab === t.id ? 600 : 400,
              transition: "all 0.15s ease",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div style={{
        background: COLORS.paper, borderRadius: 16, padding: "24px 16px 12px",
        border: `2px solid ${COLORS.forestDeep}`, boxShadow: "4px 4px 0 rgba(0,0,0,0.25)",
        maxWidth: 900, margin: "0 auto",
      }}>
        {tab === "daily" && (
          <>
            <PanelTitle title={`${unit === "metric" ? "Kilograms" : "Pounds"} picked, by day`} sub="Red and yellow stacked to show each day's full pick" />
            <VarietyLegend />
            <ResponsiveContainer width="100%" height={330}>
              <BarChart data={daily} margin={{ top: 20, right: 20, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.paperDim} />
                <XAxis dataKey="day" tick={{ fill: COLORS.ink, fontFamily: "IBM Plex Mono", fontSize: 11 }} />
                <YAxis tick={{ fill: COLORS.ink, fontFamily: "IBM Plex Mono", fontSize: 11 }} label={{ value: weightUnitLabel, position: "insideTopLeft", fill: COLORS.ink }} />
                <Tooltip content={<CustomTooltip formatter={(payload) => {
                  const p = payload[0].payload;
                  return (
                    <>
                      <div>red: {p.redVal} {weightUnitLabel} ({p.redCount})</div>
                      <div>yellow: {p.yellowVal} {weightUnitLabel} ({p.yellowCount})</div>
                      <div style={{ marginTop: 2, color: COLORS.paper }}>total: {p.totalVal} {weightUnitLabel}</div>
                    </>
                  );
                }} />} />
                <Bar dataKey="redVal" stackId="v" fill={COLORS.red} radius={[0, 0, 3, 3]} maxBarSize={44} />
                <Bar dataKey="yellowVal" stackId="v" fill={COLORS.yellow} radius={[3, 3, 0, 0]} maxBarSize={44} />
              </BarChart>
            </ResponsiveContainer>
          </>
        )}

        {tab === "cumulative" && (
          <>
            <PanelTitle title="Running total across the season" sub={`${totalWeightFormatted} combined · ${redTotalWeightFormatted} red, ${yellowTotalWeightFormatted} yellow`} />
            <VarietyLegend />
            <ResponsiveContainer width="100%" height={330}>
              <AreaChart data={daily} margin={{ top: 20, right: 24, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.paperDim} />
                <XAxis dataKey="day" tick={{ fill: COLORS.ink, fontFamily: "IBM Plex Mono", fontSize: 11 }} />
                <YAxis tick={{ fill: COLORS.ink, fontFamily: "IBM Plex Mono", fontSize: 11 }} label={{ value: weightUnitLabel, position: "insideTopLeft", fill: COLORS.ink }} />
                <Tooltip content={<CustomTooltip formatter={(payload) => {
                  const p = payload[0].payload;
                  return (
                    <>
                      <div>red: {p.cumRedVal} {weightUnitLabel}</div>
                      <div>yellow: {p.cumYellowVal} {weightUnitLabel}</div>
                      <div style={{ marginTop: 2 }}>total: {p.cumTotalVal} {weightUnitLabel}</div>
                    </>
                  );
                }} />} />
                <Area type="monotone" dataKey="cumRedVal" stackId="c" stroke={COLORS.red} fill={COLORS.red} fillOpacity={0.75} strokeWidth={2} />
                <Area type="monotone" dataKey="cumYellowVal" stackId="c" stroke={COLORS.yellow} fill={COLORS.yellow} fillOpacity={0.75} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </>
        )}

        {tab === "strip" && (
          <>
            <PanelTitle title="Every tomato, plotted by day" sub="Color shows variety; vertical spread shows size within a picking" />
            <VarietyLegend />
            <ResponsiveContainer width="100%" height={370}>
              <ScatterChart margin={{ top: 20, right: 24, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.paperDim} />
                <XAxis
                  type="number" dataKey="dayIdx" domain={[-0.5, raw.length - 0.5]}
                  ticks={raw.map((_, i) => i)}
                  tickFormatter={(v) => raw[v]?.day || ""}
                  tick={{ fill: COLORS.ink, fontFamily: "IBM Plex Mono", fontSize: 11 }}
                />
                <YAxis
                  type="number" dataKey="weightVal" name="weight" unit={` ${singleUnitLabel}`}
                  tick={{ fill: COLORS.ink, fontFamily: "IBM Plex Mono", fontSize: 11 }}
                  label={{ value: singleUnitLabel, position: "insideTopLeft", fill: COLORS.ink }}
                />
                <Tooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  content={<CustomTooltip formatter={(payload) => {
                    const p = payload[0].payload;
                    return <div>{p.day} · {p.variety} · {p.label}</div>;
                  }} />}
                />
                <Scatter data={individual.filter((t) => t.variety === "red")} shape={<TomatoCap fill={COLORS.red} />} />
                <Scatter data={individual.filter((t) => t.variety === "yellow")} shape={<TomatoCap fill={COLORS.yellow} />} />
              </ScatterChart>
            </ResponsiveContainer>
          </>
        )}

        {tab === "histogram" && (
          <>
            <PanelTitle title="How big were they, overall?" sub={`Stacked by variety, ${bucketSize} ${singleUnitLabel} buckets`} />
            <VarietyLegend />
            <ResponsiveContainer width="100%" height={330}>
              <BarChart data={histogram} margin={{ top: 20, right: 20, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.paperDim} />
                <XAxis dataKey="range" tick={{ fill: COLORS.ink, fontFamily: "IBM Plex Mono", fontSize: 10 }} label={{ value: singleUnitLabel, position: "insideBottom", offset: -4, fill: COLORS.ink }} />
                <YAxis tick={{ fill: COLORS.ink, fontFamily: "IBM Plex Mono", fontSize: 11 }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip formatter={(payload) => {
                  const p = payload[0].payload;
                  return (
                    <>
                      <div>red: {p.red}</div>
                      <div>yellow: {p.yellow}</div>
                    </>
                  );
                }} />} />
                <ReferenceLine x={`${Math.floor(avgHistVal / bucketSize) * bucketSize}-${Math.floor(avgHistVal / bucketSize) * bucketSize + bucketSize}`} stroke={COLORS.yellowBright} strokeDasharray="4 4" label={{ value: "avg", fill: COLORS.vineDim, fontSize: 10 }} />
                <Bar dataKey="red" stackId="h" fill={COLORS.red} radius={[0, 0, 0, 0]} maxBarSize={40} />
                <Bar dataKey="yellow" stackId="h" fill={COLORS.yellow} radius={[3, 3, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </>
        )}
      </div>

      <div style={{ textAlign: "center", marginTop: 16, fontSize: 11, color: COLORS.vine, fontFamily: "'IBM Plex Mono', monospace" }}>
        smallest pick: {fmtWeight(smallest.weightOz, unit)} ({smallest.variety}) on {smallest.day}
        {unweighedSummary && <>&nbsp;·&nbsp; {unweighedSummary}</>}
      </div>
    </div>
  );
}

function PanelTitle({ title, sub }) {
  return (
    <div style={{ textAlign: "center", marginBottom: 6 }}>
      <div style={{ fontFamily: "'Fraunces', serif", fontSize: 19, fontWeight: 600, color: COLORS.ink }}>{title}</div>
      <div style={{ fontFamily: "'Public Sans', sans-serif", fontSize: 12, color: "#6b6250" }}>{sub}</div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<TomatoHarvest />);