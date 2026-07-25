import { useState } from "react";

// ————————————————————————————————————————————————
// SEHAT/90 — Diabetes Remission Challenge · Clickable Prototype
// Palette: mint paper / deep leaf greens / marigold accent
// ————————————————————————————————————————————————

const C = {
  paper: "#F3F7F3",
  card: "#FFFFFF",
  ink: "#0C332B",
  inkSoft: "#4C6A61",
  line: "#DEE9E1",
  primary: "#14664F",
  primaryDeep: "#0C4A39",
  mint: "#E3F0E8",
  marigold: "#EFA63C",
  marigoldSoft: "#FBEED6",
  coral: "#DF5F4C",
  coralSoft: "#FBE4DF",
  blue: "#3D7EA6",
};

const font = {
  display: "'Fraunces', Georgia, serif",
  body: "'Outfit', 'Segoe UI', sans-serif",
};

// ————— shared bits —————

function Eyebrow({ children, color = C.inkSoft }) {
  return (
    <div style={{ fontFamily: font.body, fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color, fontWeight: 600 }}>
      {children}
    </div>
  );
}

function Card({ children, style, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: C.card,
        border: `1px solid ${C.line}`,
        borderRadius: 20,
        padding: 16,
        cursor: onClick ? "pointer" : "default",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function Pill({ children, bg, fg }) {
  return (
    <span style={{ background: bg, color: fg, borderRadius: 999, padding: "4px 10px", fontSize: 11, fontWeight: 600, fontFamily: font.body, whiteSpace: "nowrap" }}>
      {children}
    </span>
  );
}

// ————— glucose horizon dial (signature element) —————

function GlucoseDial({ readings }) {
  // semicircle, x from 6am (left) to 10pm (right)
  const W = 280, H = 150, cx = W / 2, cy = 138, r = 112;
  const toXY = (frac, radius = r) => {
    const a = Math.PI - frac * Math.PI;
    return [cx + radius * Math.cos(a), cy - radius * Math.sin(a)];
  };
  const arcPath = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;
  const zone = (v) => (v < 130 ? C.primary : v < 180 ? C.marigold : C.coral);
  const latest = readings[readings.length - 1];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block" }}>
      <path d={arcPath} fill="none" stroke={C.line} strokeWidth="10" strokeLinecap="round" />
      {/* in-range band */}
      <path d={arcPath} fill="none" stroke={C.mint} strokeWidth="10" strokeLinecap="round" strokeDasharray="200 400" strokeDashoffset="-40" />
      {/* hour ticks */}
      {[0, 0.25, 0.5, 0.75, 1].map((f, i) => {
        const [x1, y1] = toXY(f, r - 12);
        const [x2, y2] = toXY(f, r - 20);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={C.line} strokeWidth="2" />;
      })}
      {["6am", "2pm", "10pm"].map((t, i) => {
        const [x, y] = toXY(i * 0.5, r + 14);
        return (
          <text key={t} x={x} y={y + 4} textAnchor="middle" fontSize="9" fill={C.inkSoft} fontFamily={font.body}>
            {t}
          </text>
        );
      })}
      {/* readings */}
      {readings.map((rd, i) => {
        const [x, y] = toXY(rd.frac);
        return (
          <g key={i}>
            <circle cx={x} cy={y} r={i === readings.length - 1 ? 8 : 5.5} fill={zone(rd.value)} stroke="#fff" strokeWidth="2" />
          </g>
        );
      })}
      {/* center number */}
      <text x={cx} y={cy - 34} textAnchor="middle" fontFamily={font.display} fontWeight="600" fontSize="42" fill={C.ink}>
        {latest.value}
      </text>
      <text x={cx} y={cy - 16} textAnchor="middle" fontFamily={font.body} fontSize="10" fill={C.inkSoft} letterSpacing="0.12em">
        MG/DL · {latest.label.toUpperCase()}
      </text>
    </svg>
  );
}

// ————— 90-day path —————

function JourneyPath({ day }) {
  const W = 300, H = 64;
  const milestones = [
    { d: 1, label: "Start" },
    { d: 14, label: "Baseline" },
    { d: 45, label: "Mid-point" },
    { d: 75, label: "Med review" },
    { d: 90, label: "HbA1c" },
  ];
  const x = (d) => 14 + (d / 90) * (W - 28);
  const wave = (px) => 34 + Math.sin(px / 34) * 10;
  let path = `M ${x(0)} ${wave(x(0))}`;
  for (let d = 2; d <= 90; d += 2) path += ` L ${x(d)} ${wave(x(d))}`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block" }}>
      <path d={path} fill="none" stroke={C.line} strokeWidth="3" strokeLinecap="round" />
      <path d={path} fill="none" stroke={C.primary} strokeWidth="3" strokeLinecap="round" strokeDasharray="500" strokeDashoffset={500 - (day / 90) * 500} pathLength="500" />
      {milestones.map((m) => (
        <g key={m.d}>
          <circle cx={x(m.d)} cy={wave(x(m.d))} r="5" fill={m.d <= day ? C.primary : "#fff"} stroke={m.d <= day ? C.primary : C.line} strokeWidth="2" />
          <text x={x(m.d)} y={wave(x(m.d)) + 18} textAnchor="middle" fontSize="8" fill={C.inkSoft} fontFamily={font.body}>
            {m.label}
          </text>
        </g>
      ))}
      <circle cx={x(day)} cy={wave(x(day))} r="8" fill={C.marigold} stroke="#fff" strokeWidth="2.5" />
    </svg>
  );
}

// ————— screens —————

function TodayScreen({ tasks, toggleTask, openCoach, readings }) {
  const done = tasks.filter((t) => t.done).length;
  return (
    <div className="flex flex-col gap-4">
      <div>
        <Eyebrow color={C.primary}>Day 34 of 90 · Sunrise cohort</Eyebrow>
        <div style={{ fontFamily: font.display, fontSize: 28, fontWeight: 600, color: C.ink, lineHeight: 1.15, marginTop: 4 }}>
          Salaam, Imran
        </div>
      </div>

      <Card style={{ paddingBottom: 8 }}>
        <div className="flex items-center justify-between">
          <Eyebrow>Glucose horizon · today</Eyebrow>
          <Pill bg={C.mint} fg={C.primaryDeep}>78% in range</Pill>
        </div>
        <div style={{ marginTop: 8 }}>
          <GlucoseDial readings={readings} />
        </div>
      </Card>

      <Card onClick={openCoach} style={{ background: C.marigoldSoft, border: `1px solid #F1DDB4` }}>
        <div className="flex gap-3 items-start">
          <div style={{ width: 34, height: 34, borderRadius: 12, background: C.marigold, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>✦</div>
          <div>
            <div style={{ fontFamily: font.body, fontSize: 13.5, color: C.ink, lineHeight: 1.45 }}>
              Your post-lunch reading was 168 — likely the white rice. A 15-minute walk before 4pm usually brings your evening number down ~20 points.
            </div>
            <div style={{ fontFamily: font.body, fontSize: 12, fontWeight: 700, color: C.primaryDeep, marginTop: 6 }}>
              Ask the AI coach →
            </div>
          </div>
        </div>
      </Card>

      <div>
        <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
          <Eyebrow>Today's plan</Eyebrow>
          <span style={{ fontFamily: font.body, fontSize: 12, color: C.inkSoft }}>{done}/{tasks.length} done</span>
        </div>
        <div className="flex flex-col gap-2">
          {tasks.map((t) => (
            <Card key={t.id} onClick={() => toggleTask(t.id)} style={{ padding: "12px 14px", opacity: t.done ? 0.65 : 1 }}>
              <div className="flex items-center gap-3">
                <div style={{ width: 22, height: 22, borderRadius: 8, border: `2px solid ${t.done ? C.primary : C.line}`, background: t.done ? C.primary : "#fff", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0 }}>
                  {t.done ? "✓" : ""}
                </div>
                <div className="flex-1">
                  <div style={{ fontFamily: font.body, fontSize: 14, fontWeight: 600, color: C.ink, textDecoration: t.done ? "line-through" : "none" }}>{t.title}</div>
                  <div style={{ fontFamily: font.body, fontSize: 11.5, color: C.inkSoft }}>{t.sub}</div>
                </div>
                {t.live && <Pill bg={C.coralSoft} fg={C.coral}>Live 6pm</Pill>}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function LogScreen({ addReading }) {
  const [val, setVal] = useState("");
  const [saved, setSaved] = useState(false);
  return (
    <div className="flex flex-col gap-4">
      <div style={{ fontFamily: font.display, fontSize: 24, fontWeight: 600, color: C.ink }}>Log</div>

      <Card>
        <Eyebrow>Blood glucose</Eyebrow>
        <div className="flex gap-2 items-center" style={{ marginTop: 10 }}>
          <input
            value={val}
            onChange={(e) => { setVal(e.target.value.replace(/\D/g, "")); setSaved(false); }}
            placeholder="120"
            inputMode="numeric"
            style={{ fontFamily: font.display, fontSize: 34, fontWeight: 600, color: C.ink, width: 110, border: "none", outline: "none", background: C.paper, borderRadius: 14, padding: "8px 14px" }}
          />
          <span style={{ fontFamily: font.body, fontSize: 12, color: C.inkSoft }}>mg/dL</span>
          <div className="flex-1" />
          <button
            onClick={() => { if (val) { addReading(Number(val)); setSaved(true); } }}
            style={{ fontFamily: font.body, fontSize: 13, fontWeight: 700, background: C.primary, color: "#fff", border: "none", borderRadius: 999, padding: "10px 18px", cursor: "pointer" }}
          >
            {saved ? "Saved ✓" : "Save reading"}
          </button>
        </div>
        {saved && Number(val) >= 180 && (
          <div style={{ marginTop: 10, fontFamily: font.body, fontSize: 12.5, color: C.coral, background: C.coralSoft, borderRadius: 12, padding: "8px 12px" }}>
            Above range — flagged to Dr. Ayesha for review. She'll see it before your evening window.
          </div>
        )}
        {saved && Number(val) < 180 && (
          <div style={{ marginTop: 10, fontFamily: font.body, fontSize: 12.5, color: C.primaryDeep, background: C.mint, borderRadius: 12, padding: "8px 12px" }}>
            Added to today's horizon. Nice — trending inside your target band.
          </div>
        )}
      </Card>

      <Card>
        <div className="flex items-center justify-between">
          <Eyebrow>Meal · lunch</Eyebrow>
          <Pill bg={C.marigoldSoft} fg="#9A6A14">AI analyzed</Pill>
        </div>
        <div className="flex gap-3" style={{ marginTop: 12 }}>
          <div style={{ width: 84, height: 84, borderRadius: 16, background: `linear-gradient(135deg, ${C.mint}, ${C.marigoldSoft})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, flexShrink: 0 }}>🍛</div>
          <div>
            <div style={{ fontFamily: font.body, fontSize: 14, fontWeight: 700, color: C.ink }}>Chicken karahi + white rice</div>
            <div style={{ fontFamily: font.body, fontSize: 12, color: C.inkSoft, lineHeight: 1.5, marginTop: 4 }}>
              ~62g carbs · high glycemic load. Swap rice for half portion + salad, or move rice to post-walk days.
            </div>
          </div>
        </div>
        <button style={{ marginTop: 12, width: "100%", fontFamily: font.body, fontSize: 13, fontWeight: 700, background: C.paper, color: C.primaryDeep, border: `1px dashed ${C.line}`, borderRadius: 14, padding: "12px", cursor: "pointer" }}>
          📷 Snap next meal
        </button>
      </Card>

      <Card>
        <Eyebrow>Movement</Eyebrow>
        <div className="flex items-end gap-1" style={{ marginTop: 12, height: 54 }}>
          {[30, 55, 40, 70, 45, 85, 62].map((h, i) => (
            <div key={i} style={{ flex: 1, height: `${h}%`, background: i === 6 ? C.marigold : C.mint, borderRadius: 6 }} />
          ))}
        </div>
        <div style={{ fontFamily: font.body, fontSize: 12, color: C.inkSoft, marginTop: 8 }}>6,240 steps today · goal 8,000</div>
      </Card>
    </div>
  );
}

function CareScreen({ booked, book }) {
  const pod = [
    { name: "Dr. Ayesha Rahman", role: "Endocrinologist", emoji: "🩺", note: "Reviews your glucose flags daily" },
    { name: "Sana Iqbal", role: "Clinical nutritionist", emoji: "🥗", note: "Weekly meal plan · desi cuisine" },
    { name: "Faisal Khan", role: "Yoga & movement coach", emoji: "🧘", note: "Live sessions Mon–Sat 6pm" },
  ];
  const slots = ["12:30", "12:45", "4:15", "4:30", "8:00"];
  return (
    <div className="flex flex-col gap-4">
      <div style={{ fontFamily: font.display, fontSize: 24, fontWeight: 600, color: C.ink }}>Your care pod</div>

      <div className="flex flex-col gap-2">
        {pod.map((p) => (
          <Card key={p.name} style={{ padding: "12px 14px" }}>
            <div className="flex items-center gap-3">
              <div style={{ width: 44, height: 44, borderRadius: 999, background: C.mint, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{p.emoji}</div>
              <div className="flex-1">
                <div style={{ fontFamily: font.body, fontSize: 14, fontWeight: 700, color: C.ink }}>{p.name}</div>
                <div style={{ fontFamily: font.body, fontSize: 11.5, color: C.inkSoft }}>{p.role} · {p.note}</div>
              </div>
              <div style={{ width: 8, height: 8, borderRadius: 99, background: C.primary }} />
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <div className="flex items-center justify-between">
          <Eyebrow>Consult windows · today</Eyebrow>
          <Pill bg={C.mint} fg={C.primaryDeep}>10-min slots</Pill>
        </div>
        <div style={{ fontFamily: font.body, fontSize: 12.5, color: C.inkSoft, marginTop: 8, lineHeight: 1.5 }}>
          Dr. Ayesha holds three windows a day. AI triage answers routine questions instantly — book a slot when it's medication, symptoms, or judgment.
        </div>
        <div className="flex flex-wrap gap-2" style={{ marginTop: 12 }}>
          {slots.map((s) => (
            <button
              key={s}
              onClick={() => book(s)}
              style={{
                fontFamily: font.body, fontSize: 13, fontWeight: 700, borderRadius: 999, padding: "9px 16px", cursor: "pointer",
                background: booked === s ? C.primary : C.paper,
                color: booked === s ? "#fff" : C.ink,
                border: `1px solid ${booked === s ? C.primary : C.line}`,
              }}
            >
              {s}
            </button>
          ))}
        </div>
        {booked && (
          <div style={{ marginTop: 12, fontFamily: font.body, fontSize: 12.5, color: C.primaryDeep, background: C.mint, borderRadius: 12, padding: "10px 12px" }}>
            ✓ Booked {booked} with Dr. Ayesha. Your last 3 days of readings and meals are attached to the visit automatically.
          </div>
        )}
      </Card>

      <Card style={{ background: C.primaryDeep, border: "none" }}>
        <div style={{ fontFamily: font.body, fontSize: 13, color: "#DCEDE4", lineHeight: 1.5 }}>
          <span style={{ fontWeight: 700, color: "#fff" }}>Medication safety.</span> Dose changes only ever happen through a doctor-approved plan in this app — never from AI suggestions.
        </div>
      </Card>
    </div>
  );
}

function CohortScreen() {
  const board = [
    { rank: 1, name: "Nadia S.", pts: 940, streak: 34 },
    { rank: 2, name: "You", pts: 905, streak: 31, you: true },
    { rank: 3, name: "Bilal T.", pts: 872, streak: 29 },
    { rank: 4, name: "Hina R.", pts: 810, streak: 22 },
  ];
  return (
    <div className="flex flex-col gap-4">
      <div>
        <Eyebrow color={C.primary}>Sunrise cohort · 42 members</Eyebrow>
        <div style={{ fontFamily: font.display, fontSize: 24, fontWeight: 600, color: C.ink, marginTop: 2 }}>Week 5 challenge</div>
      </div>

      <Card style={{ background: `linear-gradient(135deg, ${C.mint}, #fff)` }}>
        <div className="flex items-center justify-between">
          <div>
            <div style={{ fontFamily: font.body, fontSize: 14, fontWeight: 700, color: C.ink }}>Walk to Hunza 🏔️</div>
            <div style={{ fontFamily: font.body, fontSize: 12, color: C.inkSoft, marginTop: 2 }}>Cohort steps goal · 3.2M of 5M</div>
          </div>
          <div style={{ fontFamily: font.display, fontSize: 26, fontWeight: 600, color: C.primaryDeep }}>64%</div>
        </div>
        <div style={{ height: 10, background: "#fff", borderRadius: 99, marginTop: 12, border: `1px solid ${C.line}` }}>
          <div style={{ width: "64%", height: "100%", background: C.primary, borderRadius: 99 }} />
        </div>
      </Card>

      <div>
        <Eyebrow>Leaderboard</Eyebrow>
        <div className="flex flex-col gap-2" style={{ marginTop: 8 }}>
          {board.map((p) => (
            <Card key={p.rank} style={{ padding: "10px 14px", background: p.you ? C.marigoldSoft : C.card, border: `1px solid ${p.you ? "#F1DDB4" : C.line}` }}>
              <div className="flex items-center gap-3">
                <div style={{ fontFamily: font.display, fontSize: 18, fontWeight: 600, color: p.rank === 1 ? C.marigold : C.inkSoft, width: 22 }}>{p.rank}</div>
                <div className="flex-1" style={{ fontFamily: font.body, fontSize: 14, fontWeight: p.you ? 700 : 600, color: C.ink }}>{p.name}</div>
                <div style={{ fontFamily: font.body, fontSize: 11.5, color: C.inkSoft }}>🔥 {p.streak}d</div>
                <div style={{ fontFamily: font.body, fontSize: 13, fontWeight: 700, color: C.primaryDeep }}>{p.pts}</div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <Card>
        <div className="flex gap-3">
          <div style={{ width: 38, height: 38, borderRadius: 999, background: C.mint, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>👩</div>
          <div>
            <div style={{ fontFamily: font.body, fontSize: 13, fontWeight: 700, color: C.ink }}>Nadia S. <span style={{ fontWeight: 400, color: C.inkSoft }}>· 2h ago</span></div>
            <div style={{ fontFamily: font.body, fontSize: 13, color: C.ink, lineHeight: 1.5, marginTop: 2 }}>
              Fasting 108 today — first time under 110 in 6 years. This cohort is everything 🥹
            </div>
            <div style={{ fontFamily: font.body, fontSize: 12, color: C.inkSoft, marginTop: 6 }}>❤️ 28 · 💬 9 replies</div>
          </div>
        </div>
      </Card>
    </div>
  );
}

function ProgressScreen() {
  return (
    <div className="flex flex-col gap-4">
      <div style={{ fontFamily: font.display, fontSize: 24, fontWeight: 600, color: C.ink }}>Progress</div>

      <Card>
        <Eyebrow>Your 90-day path</Eyebrow>
        <div style={{ marginTop: 10 }}>
          <JourneyPath day={34} />
        </div>
      </Card>

      <div className="flex gap-3">
        <Card style={{ flex: 1 }}>
          <Eyebrow>HbA1c</Eyebrow>
          <div style={{ fontFamily: font.display, fontSize: 30, fontWeight: 600, color: C.ink, marginTop: 6 }}>6.9<span style={{ fontSize: 14, color: C.inkSoft }}>%</span></div>
          <div style={{ fontFamily: font.body, fontSize: 11.5, color: C.primaryDeep, marginTop: 2 }}>est. · was 8.2% on day 1</div>
        </Card>
        <Card style={{ flex: 1 }}>
          <Eyebrow>Weight</Eyebrow>
          <div style={{ fontFamily: font.display, fontSize: 30, fontWeight: 600, color: C.ink, marginTop: 6 }}>−4.8<span style={{ fontSize: 14, color: C.inkSoft }}>kg</span></div>
          <div style={{ fontFamily: font.body, fontSize: 11.5, color: C.primaryDeep, marginTop: 2 }}>86.2 → 81.4 kg</div>
        </Card>
      </div>

      <Card>
        <Eyebrow>Fasting glucose · 4 weeks</Eyebrow>
        <svg viewBox="0 0 280 90" style={{ width: "100%", marginTop: 10 }}>
          <polyline points="0,20 40,26 80,24 120,38 160,44 200,52 240,58 280,62" fill="none" stroke={C.primary} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="0" y1="66" x2="280" y2="66" stroke={C.line} strokeWidth="1.5" strokeDasharray="4 4" />
          <text x="0" y="80" fontSize="9" fill={C.inkSoft} fontFamily={font.body}>Target: under 126 mg/dL fasting</text>
        </svg>
        <div style={{ fontFamily: font.body, fontSize: 12.5, color: C.inkSoft, lineHeight: 1.5 }}>
          Avg fasting down from 152 → 121 mg/dL. Dr. Ayesha has scheduled your day-45 medication review.
        </div>
      </Card>

      <Card style={{ background: C.marigoldSoft, border: "1px solid #F1DDB4" }}>
        <div style={{ fontFamily: font.body, fontSize: 13, color: C.ink, lineHeight: 1.5 }}>
          <span style={{ fontWeight: 700 }}>On track for remission criteria.</span> If HbA1c holds below 6.5% without glucose-lowering meds for 3 months post-challenge, that's clinical remission.
        </div>
      </Card>
    </div>
  );
}

// ————— AI coach sheet —————

function CoachSheet({ onClose }) {
  const [msgs, setMsgs] = useState([
    { ai: true, text: "I saw the 168 after lunch. Want to talk through what to eat tonight, or should I book you with Sana for a meal-plan tweak?" },
  ]);
  const [input, setInput] = useState("");
  const canned = [
    "For tonight: daal + sabzi + 1 roti keeps you well under 40g carbs. Skip fruit after dinner today since lunch ran high.",
    "That's a doctor question — I've attached your readings and opened Dr. Ayesha's 4:15 slot for you. Routine stuff, I've got you covered here anytime.",
    "Good instinct. A 15-min walk 30 min after dinner is the single highest-impact habit for your evening numbers.",
  ];
  const send = () => {
    if (!input.trim()) return;
    const reply = canned[msgs.filter((m) => m.ai).length % canned.length];
    setMsgs([...msgs, { ai: false, text: input }, { ai: true, text: reply }]);
    setInput("");
  };
  return (
    <div style={{ position: "absolute", inset: 0, background: "rgba(12,51,43,0.4)", display: "flex", alignItems: "flex-end", zIndex: 30, borderRadius: 44 }}>
      <div style={{ background: C.paper, width: "100%", borderRadius: "28px 28px 44px 44px", padding: 18, maxHeight: "78%", display: "flex", flexDirection: "column" }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
          <div className="flex items-center gap-2">
            <div style={{ width: 30, height: 30, borderRadius: 10, background: C.marigold, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>✦</div>
            <div>
              <div style={{ fontFamily: font.body, fontSize: 14, fontWeight: 700, color: C.ink }}>AI coach</div>
              <div style={{ fontFamily: font.body, fontSize: 10.5, color: C.inkSoft }}>Escalates to your doctor when needed</div>
            </div>
          </div>
          <button onClick={onClose} style={{ border: "none", background: C.card, borderRadius: 99, width: 30, height: 30, cursor: "pointer", color: C.inkSoft, fontSize: 14 }}>✕</button>
        </div>
        <div className="flex flex-col gap-2 overflow-y-auto" style={{ flex: 1 }}>
          {msgs.map((m, i) => (
            <div key={i} style={{ alignSelf: m.ai ? "flex-start" : "flex-end", maxWidth: "85%", background: m.ai ? C.card : C.primary, color: m.ai ? C.ink : "#fff", border: m.ai ? `1px solid ${C.line}` : "none", borderRadius: 16, padding: "10px 13px", fontFamily: font.body, fontSize: 13, lineHeight: 1.45 }}>
              {m.text}
            </div>
          ))}
        </div>
        <div className="flex gap-2" style={{ marginTop: 12 }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Ask anything…"
            style={{ flex: 1, fontFamily: font.body, fontSize: 13, border: `1px solid ${C.line}`, borderRadius: 999, padding: "11px 16px", outline: "none", background: C.card, color: C.ink }}
          />
          <button onClick={send} style={{ background: C.primary, color: "#fff", border: "none", borderRadius: 999, padding: "0 18px", fontFamily: font.body, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Send</button>
        </div>
      </div>
    </div>
  );
}

// ————— app shell —————

export default function App() {
  const [tab, setTab] = useState("today");
  const [coach, setCoach] = useState(false);
  const [booked, setBooked] = useState(null);
  const [tasks, setTasks] = useState([
    { id: 1, title: "Log fasting glucose", sub: "Done at 7:10am · 118 mg/dL", done: true },
    { id: 2, title: "15-min post-lunch walk", sub: "AI suggested · beats the rice spike", done: false },
    { id: 3, title: "Live yoga with Faisal", sub: "Gentle flow for insulin sensitivity", done: false, live: true },
    { id: 4, title: "Evening reading + dinner photo", sub: "Before 9pm", done: false },
  ]);
  const [readings, setReadings] = useState([
    { frac: 0.08, value: 118, label: "fasting" },
    { frac: 0.32, value: 132, label: "pre-lunch" },
    { frac: 0.52, value: 168, label: "post-lunch" },
  ]);

  const toggleTask = (id) => setTasks(tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  const addReading = (v) => setReadings([...readings.slice(0, 3), { frac: Math.min(0.95, 0.52 + readings.length * 0.14), value: v, label: "logged" }]);

  const tabs = [
    { id: "today", label: "Today", icon: "☀" },
    { id: "log", label: "Log", icon: "＋" },
    { id: "care", label: "Care", icon: "♥" },
    { id: "cohort", label: "Cohort", icon: "◆" },
    { id: "progress", label: "Progress", icon: "↗" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#0C332B", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: font.body }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600&family=Outfit:wght@400;600;700&display=swap');
        ::-webkit-scrollbar { display: none; }
        input::placeholder { color: #9DB4AB; }
        button:focus-visible, [role="button"]:focus-visible { outline: 2px solid ${C.marigold}; outline-offset: 2px; }
      `}</style>

      <div className="flex flex-col items-center gap-4">
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: font.display, color: "#F3F7F3", fontSize: 22, fontWeight: 600 }}>Sehat<span style={{ color: C.marigold }}>/90</span></div>
          <div style={{ color: "#8FB0A3", fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", marginTop: 2 }}>Diabetes remission challenge · prototype</div>
        </div>

        {/* phone frame */}
        <div style={{ width: 372, height: 760, background: C.paper, borderRadius: 44, border: "10px solid #06231D", position: "relative", overflow: "hidden", boxShadow: "0 40px 80px rgba(0,0,0,0.4)" }}>
          {/* status bar */}
          <div style={{ height: 34, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 110, height: 22, background: "#06231D", borderRadius: 99 }} />
          </div>

          {/* screen */}
          <div className="overflow-y-auto" style={{ position: "absolute", top: 40, bottom: 78, left: 0, right: 0, padding: "8px 18px 20px" }}>
            {tab === "today" && <TodayScreen tasks={tasks} toggleTask={toggleTask} openCoach={() => setCoach(true)} readings={readings} />}
            {tab === "log" && <LogScreen addReading={addReading} />}
            {tab === "care" && <CareScreen booked={booked} book={setBooked} />}
            {tab === "cohort" && <CohortScreen />}
            {tab === "progress" && <ProgressScreen />}
          </div>

          {/* tab bar */}
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 78, background: C.card, borderTop: `1px solid ${C.line}`, display: "flex", padding: "8px 8px 18px" }}>
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{ flex: 1, border: "none", background: "transparent", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}
              >
                <div style={{ width: 34, height: 34, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, background: tab === t.id ? C.primaryDeep : "transparent", color: tab === t.id ? "#fff" : C.inkSoft }}>
                  {t.icon}
                </div>
                <span style={{ fontFamily: font.body, fontSize: 10, fontWeight: tab === t.id ? 700 : 500, color: tab === t.id ? C.primaryDeep : C.inkSoft }}>{t.label}</span>
              </button>
            ))}
          </div>

          {coach && <CoachSheet onClose={() => setCoach(false)} />}
        </div>

        <div style={{ color: "#8FB0A3", fontSize: 12, fontFamily: font.body }}>Tap tabs, tasks, consult slots, and the ✦ coach card — everything is clickable.</div>
      </div>
    </div>
  );
}
