/* BF Suma — shared UI primitives. Exposes components on window. */
const { useState, useEffect, useRef, useMemo } = React;

/* ---------------- Icons (lucide-style, 24px stroke) ---------------- */
const ICON_PATHS = {
  home: "M3 10.5 12 3l9 7.5M5 9.5V21h14V9.5",
  grid: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",
  bag: "M6 8h12l-1 12H7L6 8zM9 8a3 3 0 0 1 6 0",
  box: "M3 7.5 12 3l9 4.5v9L12 21l-9-4.5v-9zM3 7.5 12 12m9-4.5L12 12m0 9V12",
  users: "M16 19v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 19v-1a4 4 0 0 0-3-3.87M16 3.13A4 4 0 0 1 16 11",
  user: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  chart: "M3 3v18h18M7 14v4M12 9v9M17 5v13",
  tag: "M20.5 13.5 12 22l-9-9V3h10l7.5 7.5zM7.5 7.5h.01",
  file: "M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9zM14 3v6h6M8 13h8M8 17h6",
  settings: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z",
  bell: "M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0",
  search: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.35-4.35",
  menu: "M3 12h18M3 6h18M3 18h18",
  chevronR: "M9 18l6-6-6-6",
  chevronD: "M6 9l6 6 6-6",
  chevronL: "M15 18l-6-6 6-6",
  plus: "M12 5v14M5 12h14",
  filter: "M22 3H2l8 9.46V19l4 2v-8.54L22 3z",
  dots: "M12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM19 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM5 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2z",
  heart: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z",
  repeat: "M17 1l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3",
  pin: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0zM12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  card: "M2 5h20v14H2zM2 10h20",
  truck: "M1 4h15v12H1zM16 8h4l3 3v5h-7M5.5 19a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM18.5 19a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z",
  check: "M20 6 9 17l-5-5",
  checkCircle: "M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4 12 14.01l-3-3",
  clock: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2",
  x: "M18 6 6 18M6 6l12 12",
  arrowUp: "M12 19V5M5 12l7-7 7 7",
  arrowDown: "M12 5v14M19 12l-7 7-7-7",
  star: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  leaf: "M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10zM2 21c0-3 1.85-5.36 5.08-6",
  sparkles: "M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3zM19 15l.95 2.55L22 18.5l-2.05.95L19 22l-.95-2.55L16 18.5l2.05-.95L19 15z",
  gift: "M20 12v10H4V12M2 7h20v5H2zM12 22V7M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z",
  logout: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9",
  edit: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z",
  trash: "M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6",
  eye: "M2 12s4-8 10-8 10 8 10 8-4 8-10 8-10-8-10-8zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  calendar: "M3 4h18v18H3zM3 9h18M8 2v4M16 2v4",
  percent: "M19 5 5 19M6.5 9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM17.5 20a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z",
  trending: "M23 6l-9.5 9.5-5-5L1 18M17 6h6v6",
  phone: "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z",
  download: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3",
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  zap: "M13 2 3 14h9l-1 8 10-12h-9l1-8z",
  external: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3",
  layers: "M12 2 2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
  award: "M12 15a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM8.21 13.89 7 23l5-3 5 3-1.21-9.12",
};

function Icon({ name, size = 18, stroke = 2, fill = "none", style, className }) {
  const d = ICON_PATHS[name] || "";
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill === "current" ? "currentColor" : "none"}
      stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"
      style={style} className={className} aria-hidden="true">
      {d.split(/(?=M)/).map((seg, i) => <path key={i} d={seg} />)}
    </svg>
  );
}

/* ---------------- helpers ---------------- */
const accentColor = (a) => `var(--c-${a || "green"})`;
const accentSoft = (a) => `var(--c-${a || "green"}-soft)`;
const shortMoney = (n) => {
  if (n >= 1000000) return "UGX " + (n / 1000000).toFixed(n % 1000000 === 0 ? 0 : 1) + "M";
  if (n >= 1000) return "UGX " + Math.round(n / 1000) + "K";
  return "UGX " + n;
};

/* ---------------- Badge ---------------- */
const TONE = {
  Delivered: "green", "Out for delivery": "blue", Shipped: "blue", Processing: "amber",
  Pending: "amber", Cancelled: "rose", Active: "green", Inactive: "muted",
  "Pending payout": "amber", VIP: "purple", Published: "green", Draft: "muted",
  Scheduled: "blue", Expired: "muted", New: "blue", Bestseller: "orange",
  "Low stock": "rose", Kids: "blue",
};
function Badge({ children, tone, dot }) {
  const t = tone || TONE[children] || "muted";
  return (
    <span className="bf-badge" data-tone={t}>
      {dot && <span className="bf-badge-dot" />}
      {children}
    </span>
  );
}

/* ---------------- Avatar ---------------- */
function Avatar({ initials, accent, size = 38 }) {
  return (
    <span className="bf-avatar" style={{ width: size, height: size, fontSize: size * 0.36,
      background: accentSoft(accent || "green"), color: accentColor(accent || "green") }}>
      {initials}
    </span>
  );
}

/* ---------------- Product thumbnail placeholder ---------------- */
function ProductThumb({ pid, size = 52, radius = 14 }) {
  const p = BF.productById[pid] || { name: "?", cat: "living" };
  const cat = BF.CATEGORIES.find((c) => c.id === p.cat) || { accent: "green" };
  const initials = p.name.replace(/[^A-Za-z0-9 ]/g, "").split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  return (
    <span className="bf-thumb" style={{ width: size, height: size, borderRadius: radius,
      background: `linear-gradient(150deg, ${accentSoft(cat.accent)}, color-mix(in oklab, ${accentSoft(cat.accent)} 50%, #fff))`,
      color: accentColor(cat.accent) }}>
      <Icon name="leaf" size={size * 0.34} stroke={2.2} style={{ position: "absolute", opacity: 0.28, right: size * 0.1, bottom: size * 0.1 }} />
      <b style={{ fontSize: size * 0.30, letterSpacing: "-0.02em" }}>{initials}</b>
    </span>
  );
}

/* ---------------- Card ---------------- */
function Card({ children, className = "", style, pad = true, ...rest }) {
  return <div className={"bf-card " + className} style={{ padding: pad ? undefined : 0, ...style }} {...rest}>{children}</div>;
}

/* ---------------- Stat card ---------------- */
function Stat({ label, value, delta, icon, accent = "green", spark, footer }) {
  const up = delta >= 0;
  return (
    <Card className="bf-stat">
      <div className="bf-stat-top">
        <span className="bf-stat-ic" style={{ background: accentSoft(accent), color: accentColor(accent) }}>
          <Icon name={icon} size={19} />
        </span>
        {delta !== undefined && (
          <span className={"bf-delta " + (up ? "up" : "down")}>
            <Icon name={up ? "arrowUp" : "arrowDown"} size={13} stroke={2.6} />{Math.abs(delta)}%
          </span>
        )}
      </div>
      <div className="bf-stat-val">{value}</div>
      <div className="bf-stat-label">{label}</div>
      {spark && <Sparkline data={spark} accent={accent} />}
      {footer && <div className="bf-stat-foot">{footer}</div>}
    </Card>
  );
}

/* ---------------- Sparkline ---------------- */
function Sparkline({ data, accent = "green", h = 34 }) {
  const w = 120;
  const min = Math.min(...data), max = Math.max(...data);
  const rng = max - min || 1;
  const pts = data.map((v, i) => [(i / (data.length - 1)) * w, h - ((v - min) / rng) * (h - 4) - 2]);
  const line = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
  const area = line + ` L${w} ${h} L0 ${h} Z`;
  const id = "spk" + accent + data.length;
  return (
    <svg className="bf-spark" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: "100%", height: h, marginTop: 10 }}>
      <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={accentColor(accent)} stopOpacity="0.22" />
        <stop offset="1" stopColor={accentColor(accent)} stopOpacity="0" />
      </linearGradient></defs>
      <path d={area} fill={`url(#${id})`} />
      <path d={line} fill="none" stroke={accentColor(accent)} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ---------------- Bar chart ---------------- */
function BarChart({ data, labels, accent = "green", h = 200, format }) {
  const max = Math.max(...data) * 1.1;
  return (
    <div className="bf-bars" style={{ height: h }}>
      {data.map((v, i) => (
        <div className="bf-bar-col" key={i}>
          <div className="bf-bar-track">
            <div className="bf-bar-fill" style={{ height: (v / max) * 100 + "%",
              background: `linear-gradient(180deg, ${accentColor(accent)}, color-mix(in oklab, ${accentColor(accent)} 65%, #fff))` }}>
              <span className="bf-bar-tip">{format ? format(v) : v}</span>
            </div>
          </div>
          {labels && <span className="bf-bar-label">{labels[i]}</span>}
        </div>
      ))}
    </div>
  );
}

/* ---------------- Donut ---------------- */
function Donut({ data, size = 168, thickness = 26 }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  let off = 0;
  return (
    <div className="bf-donut-wrap">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="bf-donut">
        <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          {data.map((d, i) => {
            const len = (d.value / total) * c;
            const seg = <circle key={i} cx={size / 2} cy={size / 2} r={r} fill="none"
              stroke={accentColor(d.accent)} strokeWidth={thickness}
              strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-off} strokeLinecap="butt" />;
            off += len;
            return seg;
          })}
        </g>
        <text x="50%" y="46%" textAnchor="middle" className="bf-donut-num">{total}%</text>
        <text x="50%" y="58%" textAnchor="middle" className="bf-donut-sub">of sales</text>
      </svg>
      <ul className="bf-donut-legend">
        {data.map((d, i) => (
          <li key={i}><span className="bf-dot" style={{ background: accentColor(d.accent) }} />{d.name}<b>{d.value}%</b></li>
        ))}
      </ul>
    </div>
  );
}

/* ---------------- Button ---------------- */
function Btn({ children, variant = "primary", size = "md", icon, iconRight, onClick, full, type, style }) {
  return (
    <button type={type || "button"} className={`bf-btn v-${variant} s-${size}` + (full ? " full" : "")} onClick={onClick} style={style}>
      {icon && <Icon name={icon} size={size === "sm" ? 15 : 17} />}
      {children}
      {iconRight && <Icon name={iconRight} size={size === "sm" ? 15 : 17} />}
    </button>
  );
}

/* ---------------- Progress ---------------- */
function Progress({ value, accent = "green", h = 8 }) {
  return (
    <div className="bf-prog" style={{ height: h }}>
      <div className="bf-prog-fill" style={{ width: value + "%", background: accentColor(accent) }} />
    </div>
  );
}

/* ---------------- Segmented ---------------- */
function Segmented({ options, value, onChange }) {
  return (
    <div className="bf-seg">
      {options.map((o) => (
        <button key={o} className={"bf-seg-btn" + (o === value ? " on" : "")} onClick={() => onChange(o)}>{o}</button>
      ))}
    </div>
  );
}

/* ---------------- Section header ---------------- */
function PageHead({ title, sub, children }) {
  return (
    <div className="bf-pagehead">
      <div>
        <h1 className="bf-h1">{title}</h1>
        {sub && <p className="bf-sub">{sub}</p>}
      </div>
      {children && <div className="bf-pagehead-actions">{children}</div>}
    </div>
  );
}

/* ---------------- Empty toast helper ---------------- */
function useToast() {
  const [msg, setMsg] = useState(null);
  const show = (m) => { setMsg(m); setTimeout(() => setMsg(null), 2200); };
  const node = msg ? <div className="bf-toast"><Icon name="checkCircle" size={17} />{msg}</div> : null;
  return [node, show];
}

Object.assign(window, {
  Icon, accentColor, accentSoft, shortMoney, Badge, Avatar, ProductThumb, Card, Stat,
  Sparkline, BarChart, Donut, Btn, Progress, Segmented, PageHead, useToast,
});
