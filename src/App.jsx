import React, { useEffect, useRef, useState } from "react";
import {
  Sparkles,
  Brain,
  Target,
  GraduationCap,
  ArrowRight,
  Menu,
  X,
  Send,
  BookOpen,
  Globe2,
  Calculator,
  Atom,
  Landmark,
  Quote,
  Zap,
  Share2,
  Globe,
  UserRound,
  Crown,
  Terminal,
  Palette,
  Mic,
  Clapperboard,
  Sun,
  Moon,
} from "lucide-react";

import classaLogo from "./assets/classa-logo.jpg";

/* ------------------------------------------------------------------ */
/* DESIGN TOKENS v2 — "holographic circuit" direction                  */
/* ------------------------------------------------------------------ */
/*
  Palette
   --bg-0:   #05050A   near-black void
   --bg-1:   #0B0B14   panel tone
   --lime:   #C8FF4D   electric acid-lime — primary "wow" accent
   --cyan:   #35F2E0   secondary accent, cools the lime
   --magenta:#FF4DD8   rare highlight, used only as a spark
   --ink-0:  #F3F6EF
   --ink-1:  #9AA2A6

  Type: Unbounded (display) / Manrope (body) / Space Mono (data, utility)

  Signature element: a slowly tumbling CSS cube + glass sphere cluster
  floating in true 3D (transform-style: preserve-3d), orbited by a thin
  wireframe ring — the "AI core" made tangible. The same cube motif
  recurs, shrunk, as ambient debris across the page.
*/

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Unbounded:wght@400;500;600;700;800&family=Manrope:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap');`;

/* ------------------------------------------------------------------ */
/* Cursor glow                                                         */
/* ------------------------------------------------------------------ */
function CursorGlow() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    let raf = null;
    let tx = 0, ty = 0, x = 0, y = 0;
    const onMove = (e) => {
      tx = e.clientX;
      ty = e.clientY;
    };
    const loop = () => {
      x += (tx - x) * 0.12;
      y += (ty - y) * 0.12;
      if (el) el.style.transform = `translate(${x}px, ${y}px)`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("mousemove", onMove);
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);
  return <div ref={ref} className="cursor-glow" />;
}

/* ------------------------------------------------------------------ */
/* Tilt wrapper — 3D perspective tilt on mouse move                    */
/* ------------------------------------------------------------------ */
function Tilt({ children, className = "", strength = 10 }) {
  const ref = useRef(null);
  const onMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(700px) rotateX(${-py * strength}deg) rotateY(${px * strength}deg) translateZ(6px)`;
  };
  const onLeave = () => {
    const el = ref.current;
    if (el) el.style.transform = `perspective(700px) rotateX(0deg) rotateY(0deg)`;
  };
  return (
    <div ref={ref} className={`tilt ${className}`} onMouseMove={onMove} onMouseLeave={onLeave}>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Magnetic button                                                     */
/* ------------------------------------------------------------------ */
function Magnetic({ children, className = "", as: Tag = "button", ...rest }) {
  const ref = useRef(null);
  const onMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const mx = e.clientX - (r.left + r.width / 2);
    const my = e.clientY - (r.top + r.height / 2);
    el.style.transform = `translate(${mx * 0.28}px, ${my * 0.35}px)`;
  };
  const onLeave = () => {
    const el = ref.current;
    if (el) el.style.transform = `translate(0,0)`;
  };
  return (
    <Tag ref={ref} className={`magnetic ${className}`} onMouseMove={onMove} onMouseLeave={onLeave} {...rest}>
      {children}
    </Tag>
  );
}

/* ------------------------------------------------------------------ */
/* Scroll reveal hook                                                  */
/* ------------------------------------------------------------------ */
function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.unobserve(el);
        }
      },
      { threshold: 0.18 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, visible];
}

function Reveal({ children, className = "", delay = 0, as: Tag = "div" }) {
  const [ref, visible] = useReveal();
  return (
    <Tag ref={ref} className={`reveal ${visible ? "reveal-visible" : ""} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </Tag>
  );
}

/* ------------------------------------------------------------------ */
/* Animated counter                                                    */
/* ------------------------------------------------------------------ */
function Counter({ target, suffix = "", duration = 1600 }) {
  const ref = useRef(null);
  const [value, setValue] = useState(0);
  const [started, setStarted] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
          const start = performance.now();
          const animate = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(Math.round(target * eased));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
          io.unobserve(el);
        }
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);
  return (
    <span ref={ref} className="stat-number">
      {value.toLocaleString("en-US")}
      {suffix}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* 3D primitives — cube / sphere / ring                                 */
/* ------------------------------------------------------------------ */
function Cube3D({ size = 70, className = "", speed = 14 }) {
  const half = size / 2;
  const faceStyle = { width: size, height: size };
  return (
    <div className={`cube3d ${className}`} style={{ width: size, height: size, animationDuration: `${speed}s` }}>
      <div className="cube3d-face f-front" style={{ ...faceStyle, transform: `translateZ(${half}px)` }} />
      <div className="cube3d-face f-back" style={{ ...faceStyle, transform: `translateZ(-${half}px) rotateY(180deg)` }} />
      <div className="cube3d-face f-right" style={{ ...faceStyle, transform: `rotateY(90deg) translateZ(${half}px)` }} />
      <div className="cube3d-face f-left" style={{ ...faceStyle, transform: `rotateY(-90deg) translateZ(${half}px)` }} />
      <div className="cube3d-face f-top" style={{ ...faceStyle, transform: `rotateX(90deg) translateZ(${half}px)` }} />
      <div className="cube3d-face f-bottom" style={{ ...faceStyle, transform: `rotateX(-90deg) translateZ(${half}px)` }} />
    </div>
  );
}

function Sphere3D({ size = 120, className = "" }) {
  return (
    <div className={`sphere3d ${className}`} style={{ width: size, height: size }}>
      <div className="sphere3d-shine" />
    </div>
  );
}

function Ring3D({ size = 220, className = "" }) {
  return <div className={`ring3d ${className}`} style={{ width: size, height: size }} />;
}

/* ------------------------------------------------------------------ */
/* Hero core — cube + sphere + ring cluster with parallax               */
/* ------------------------------------------------------------------ */
function HeroCore() {
  const stageRef = useRef(null);
  const onMove = (e) => {
    const el = stageRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--px", px.toFixed(3));
    el.style.setProperty("--py", py.toFixed(3));
  };
  const nodes = [
    { icon: <Calculator size={16} />, label: "Matematika", top: "4%", left: "10%" },
    { icon: <Atom size={16} />, label: "Fizika", top: "14%", left: "80%" },
    { icon: <Globe2 size={16} />, label: "Ingliz tili", top: "76%", left: "6%" },
    { icon: <Landmark size={16} />, label: "Tarix", top: "84%", left: "68%" },
    { icon: <BookOpen size={16} />, label: "Ona tili", top: "46%", left: "90%" },
  ];
  return (
    <div className="hero-core" ref={stageRef} onMouseMove={onMove}>
      <div className="hero-core-parallax">
        <Ring3D size={280} className="hc-ring hc-ring-1" />
        <Ring3D size={340} className="hc-ring hc-ring-2" />
        <Sphere3D size={140} className="hc-sphere" />
        <Cube3D size={54} className="hc-cube hc-cube-1" speed={11} />
        <Cube3D size={34} className="hc-cube hc-cube-2" speed={16} />
        {nodes.map((n, i) => (
          <div key={i} className="hc-node" style={{ top: n.top, left: n.left, animationDelay: `${i * 0.4}s` }}>
            <span className="hc-node-icon">{n.icon}</span>
            <span>{n.label}</span>
          </div>
        ))}
        <div className="hc-card hc-card-1">
          <span className="hc-card-dot" />
          Matematika — 12-dars
        </div>
        <div className="hc-card hc-card-2">
          <div className="hc-progress"><div className="hc-progress-fill" /></div>
          87% tugallandi
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Marquee strip                                                       */
/* ------------------------------------------------------------------ */
function Marquee({ items }) {
  const loop = [...items, ...items];
  return (
    <div className="marquee">
      <div className="marquee-track">
        {loop.map((t, i) => (
          <span key={i} className="marquee-item">
            <Zap size={14} /> {t}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Team — member card variants                                         */
/* ------------------------------------------------------------------ */
function SocialRow() {
  return (
    <div className="tm-social">
      <span className="tm-social-icon"><Share2 size={14} /></span>
      <span className="tm-social-icon"><Send size={14} /></span>
      <span className="tm-social-icon"><Globe size={14} /></span>
    </div>
  );
}

function Avatar({ name, grad, size = 64, ring = false }) {
  return (
    <div className={`tm-avatar ${ring ? "tm-avatar-ring" : ""}`} style={{ width: size, height: size, background: grad }}>
      <span style={{ fontSize: size * 0.32 }}>{initialsForName(name)}</span>
      <UserRound className="tm-avatar-icon" size={size * 0.5} />
    </div>
  );
}
function initialsForName(name) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((n) => n[0]).join("");
}

function FeaturedMemberCard({ member, grad }) {
  return (
    <Tilt strength={6}>
      <div className="tm-featured">
        <div className="tm-featured-photo" style={{ background: grad }}>
          <UserRound size={54} className="tm-photo-icon" />
          <div className="tm-featured-shine" />
        </div>
        <div className="tm-featured-body">
          <h4>{member.name}</h4>
          <p>{member.role}</p>
          <SocialRow />
        </div>
      </div>
    </Tilt>
  );
}

function HorizontalMemberCard({ member, grad }) {
  return (
    <Tilt strength={4}>
      <div className="tm-horizontal">
        <Avatar name={member.name} grad={grad} size={58} />
        <div className="tm-horizontal-body">
          <h4>{member.name}</h4>
          <p>{member.role}</p>
        </div>
        <SocialRow />
      </div>
    </Tilt>
  );
}

function VisualMemberCard({ member, grad }) {
  return (
    <Tilt strength={7}>
      <div className="tm-visual">
        <div className="tm-visual-photo" style={{ background: grad }}>
          <UserRound size={64} className="tm-photo-icon" />
        </div>
        <div className="tm-visual-body">
          <h4>{member.name}</h4>
          <p>{member.role}</p>
          <SocialRow />
        </div>
      </div>
    </Tilt>
  );
}

function CompactMemberCard({ member, grad }) {
  return (
    <div className="tm-compact">
      <Avatar name={member.name} grad={grad} size={46} />
      <div>
        <h4>{member.name}</h4>
        <p>{member.role}</p>
      </div>
      <SocialRow />
    </div>
  );
}

function GalleryMemberCard({ member, grad }) {
  return (
    <div className="tm-gallery">
      <Avatar name={member.name} grad={grad} size={52} ring />
      <h4>{member.name}</h4>
      <p>{member.role}</p>
      <SocialRow />
    </div>
  );
}

function TeamGroup({ group, gradFor }) {
  return (
    <Reveal className="tm-group">
      <div className="tm-group-head">
        <span className="tm-group-label mono">{group.label}</span>
        <div className="tm-group-icon">{group.icon}</div>
        <h3>{group.title}</h3>
        <div className="tm-group-rule" />
      </div>

      {group.layout === "featured" && (
        <div className="tm-featured-grid">
          {group.members.map((m) => (
            <FeaturedMemberCard key={m.name + m.role} member={m} grad={gradFor(m.name)} />
          ))}
        </div>
      )}

      {group.layout === "horizontal" && (
        <div className="tm-horizontal-grid">
          {group.members.map((m) => (
            <HorizontalMemberCard key={m.name + m.role} member={m} grad={gradFor(m.name)} />
          ))}
        </div>
      )}

      {group.layout === "visual" && (
        <div className="tm-visual-grid">
          {group.members.map((m) => (
            <VisualMemberCard key={m.name + m.role} member={m} grad={gradFor(m.name)} />
          ))}
        </div>
      )}

      {group.layout === "compact" && (
        <div className="tm-compact-grid">
          {group.members.map((m) => (
            <CompactMemberCard key={m.name + m.role} member={m} grad={gradFor(m.name)} />
          ))}
        </div>
      )}

      {group.layout === "gallery" && (
        <div className="tm-gallery-grid">
          {group.members.map((m) => (
            <GalleryMemberCard key={m.name + m.role} member={m} grad={gradFor(m.name)} />
          ))}
        </div>
      )}
    </Reveal>
  );
}

/* ------------------------------------------------------------------ */
/* Main page                                                           */
/* ------------------------------------------------------------------ */
export default function AkademiyaAIv2() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "dark";
    return localStorage.getItem("akademiya-theme") || "dark";
  });

  useEffect(() => {
    localStorage.setItem("akademiya-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { label: "Bosh sahifa", href: "#home" },
    { label: "Darslar", href: "#courses" },
    { label: "AI imkoniyatlari", href: "#ai" },
    { label: "Jamoa", href: "#team" },
    { label: "Biz haqimizda", href: "#about" },
  ];

  const features = [
    { icon: <Brain size={22} />, title: "Jonli AI repetitor", text: "Har bir o'quvchiga alohida, jonli AI repetitor yordam beradi." },
    { icon: <Target size={22} />, title: "Darslik asosida", text: "Maktabingiz darsliklari asosida tuzilgan interaktiv darslar." },
    { icon: <Sparkles size={22} />, title: "O'qituvchi nazorati", text: "O'qituvchilar va ota-onalar natijalarni real vaqtda kuzatadi." },
    { icon: <GraduationCap size={22} />, title: "Davlat standartiga mos", text: "Davlat ta'lim dasturi va andozalariga to'liq muvofiq." },
  ];

  const courses = [
    { title: "Matematika", desc: "Darslik mavzulari asosida bosqichma-bosqich mashqlar.", lessons: "64 dars", icon: <Calculator size={20} />, grad: "linear-gradient(135deg,#C8FF4D,#35F2E0)" },
    { title: "Ona tili va adabiyot", desc: "O'qish, yozish va nutq ko'nikmalarini rivojlantirish.", lessons: "58 dars", icon: <BookOpen size={20} />, grad: "linear-gradient(135deg,#35F2E0,#4D8CFF)" },
    { title: "Fizika", desc: "Tajribalar va vizual modellar orqali tushuntirish.", lessons: "48 dars", icon: <Atom size={20} />, grad: "linear-gradient(135deg,#FF4DD8,#C8FF4D)" },
    { title: "Ingliz tili", desc: "Maktab dasturi asosida amaliy til ko'nikmalari.", lessons: "40 dars", icon: <Globe2 size={20} />, grad: "linear-gradient(135deg,#35F2E0,#C8FF4D)" },
    { title: "Tarix", desc: "Voqealarni tizimli va qiziqarli tarzda o'zlashtirish.", lessons: "36 dars", icon: <Landmark size={20} />, grad: "linear-gradient(135deg,#FF4DD8,#35F2E0)" },
  ];

  const testimonials = [
    { name: "Dilnoza Yusupova", role: "Maktab o'qituvchisi", text: "AI repetitor har doim aynan o'quvchiga kerak bo'lgan tushuntirishni beradi. Sinfdagi natijalar sezilarli oshdi." },
    { name: "Javlon Rahimov", role: "Maktab direktori", text: "O'qituvchilar endi har bir o'quvchining o'zlashtirishini real vaqtda ko'radi. Boshqaruv ancha osonlashdi." },
    { name: "Madina Ergasheva", role: "Ota-ona", text: "Farzandimning qaysi mavzuda qiynalayotganini aniq ko'raman va uyda unga to'g'ri yordam bera olaman." },
  ];

  const stats = [
    { target: 25000, suffix: "+", label: "O'quvchilar" },
    { target: 120, suffix: "+", label: "Maktablar" },
    { target: 12000, suffix: "+", label: "AI darslar" },
    { target: 94, suffix: "%", label: "Qoniqish darajasi" },
  ];

  const marqueeItems = ["Matematika", "Fizika", "Kimyo", "Ona tili", "Ingliz tili", "Tarix", "Biologiya", "Geografiya"];

  const teamGroups = [
    {
      id: "rahbariyat",
      label: "01",
      title: "Rahbariyat",
      icon: <Crown size={16} />,
      layout: "featured",
      members: [
        { name: "Arifxodjayev Sardorbek", role: "Loyiha asoschisi" },
        { name: "Arifxodjayev Abdukarim", role: "Texnik rahbar" },
        { name: "Kodirov Jakhongir", role: "Loyiha rahbari" },
      ],
    },
    {
      id: "dasturchilar",
      label: "02",
      title: "Dasturchilar",
      icon: <Terminal size={16} />,
      layout: "horizontal",
      members: [
        { name: "Abduvaitov Sanjar", role: "Dasturchi" },
        { name: "Axatov Adham", role: "Dasturchi" },
        { name: "Bazarbayev Amirbek", role: "Dasturchi" },
        { name: "Elmurodov Ibrohim", role: "Dasturchi" },
      ],
    },
    {
      id: "dizayn",
      label: "03",
      title: "Dizayn",
      icon: <Palette size={16} />,
      layout: "visual",
      members: [
        { name: "Kodirov Jakhongir", role: "Grafik dizayn" },
        { name: "Elmurodov Ibrohim", role: "Motion dizayn" },
      ],
    },
    {
      id: "ovozlashtirish",
      label: "04",
      title: "Ovozlashtirish",
      icon: <Mic size={16} />,
      layout: "compact",
      members: [
        { name: "Xakimov Azizbek", role: "Ovozlashtiruvchi" },
        { name: "Saidadzimov Saidakmal", role: "Ovozlashtiruvchi" },
      ],
    },
    {
      id: "video-montaj",
      label: "05",
      title: "Video montaj",
      icon: <Clapperboard size={16} />,
      layout: "gallery",
      members: [
        { name: "Ergashev Madaminbek", role: "Video montaj" },
        { name: "Axmedov Syunmirzo", role: "Video montaj" },
        { name: "Tangirov Zafar", role: "Video montaj" },
        { name: "Imomnazarov Asadbek", role: "Video montaj" },
        { name: "Nematov Shaxriyor", role: "Video montaj" },
        { name: "Xojiakbarov Maxmud", role: "Video montaj" },
        { name: "Muhammadaliyeva Marjonaxon", role: "Video montaj" },
        { name: "Saidahmatova Xilola", role: "Video montaj" },
        { name: "Isomiddinov Shahzod", role: "Video montaj" },
      ],
    },
  ];

  const teamGradients = [
    "linear-gradient(135deg,#8B5CF6,#4C8DFF)",
    "linear-gradient(135deg,#C084FC,#8B5CF6)",
    "linear-gradient(135deg,#4C8DFF,#38BDF8)",
    "linear-gradient(135deg,#8B5CF6,#C084FC)",
    "linear-gradient(135deg,#4C8DFF,#8B5CF6)",
  ];
  const gradFor = (name) => {
    let h = 0;
    for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % teamGradients.length;
    return teamGradients[h];
  };
  const initialsFor = (name) =>
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0])
      .join("");

  return (
    <div className={`page ${theme === "light" ? "light-theme" : "dark-theme"}`}>
      <div className="test-mode">
  <span className="test-mode-dot"></span>
  <span>Sayt hozir sinov rejimida</span>
  <span className="test-mode-line"></span>
</div>
      <style>{`
        ${FONT_IMPORT}

        :root {
          --bg-0: #05050A;
          --bg-1: #0B0B14;
          --bg-2: #101019;
          --lime: #C8FF4D;
          --cyan: #35F2E0;
          --magenta: #FF4DD8;
          --ink-0: #F3F6EF;
          --ink-1: #9AA2A6;
          --line: rgba(255,255,255,0.09);
          --glass: rgba(255,255,255,0.05);
        }

        /* ================= THEME SYSTEM ================= */
        .page.light-theme {
          --bg-0: #F7F8FA;
          --bg-1: #FFFFFF;
          --bg-2: #EEF1F5;
          --lime: #D10A0A;
          --cyan: #FF3B30;
          --magenta: #A80000;
          --ink-0: #171717;
          --ink-1: #626A73;
          --line: rgba(15,23,42,0.12);
          --glass: rgba(255,255,255,0.72);
        }

        .theme-toggle {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          min-height: 40px;
          padding: 9px 13px;
          border-radius: 999px;
          border: 1px solid var(--line);
          background: var(--glass);
          color: var(--ink-0);
          font-family: 'Manrope', sans-serif;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          backdrop-filter: blur(12px);
          transition: all 0.25s ease;
        }
        .theme-toggle:hover {
          color: var(--lime);
          border-color: var(--lime);
          transform: translateY(-1px);
        }

        .page.light-theme .nav.scrolled {
          background: rgba(247,248,250,0.82);
        }

        .page.light-theme .bg-field {
          background:
            radial-gradient(ellipse 55% 40% at 12% 6%, rgba(209,10,10,0.08), transparent 60%),
            radial-gradient(ellipse 55% 45% at 90% 14%, rgba(255,59,48,0.07), transparent 60%),
            radial-gradient(ellipse 60% 50% at 50% 100%, rgba(168,0,0,0.05), transparent 60%);
        }

        .page.light-theme .grid-overlay {
          opacity: 0.45;
          background-image:
            linear-gradient(rgba(15,23,42,0.045) 1px, transparent 1px),
            linear-gradient(90deg, rgba(15,23,42,0.045) 1px, transparent 1px);
        }

        .page.light-theme .cursor-glow {
          background: radial-gradient(circle, rgba(209,10,10,0.09), rgba(255,59,48,0.05) 45%, transparent 70%);
          mix-blend-mode: multiply;
        }

        /* Oqartirish: light rejimdagi asosiy oynalar va kartalar */
        .page.light-theme .mobile-menu {
          background: rgba(247,248,250,0.98);
        }
        .page.light-theme .hc-node,
        .page.light-theme .hc-card,
        .page.light-theme .mock,
        .page.light-theme .course-card,
        .page.light-theme .test-card,
        .page.light-theme .feature-card,
        .page.light-theme .stat-card {
          box-shadow: 0 12px 30px rgba(15,23,42,0.07);
        }
        .page.light-theme .hc-node,
        .page.light-theme .hc-card,
        .page.light-theme .mock-input,
        .page.light-theme .chat-ai {
          background: rgba(255,255,255,0.82);
        }
        .page.light-theme .chat-ai {
          color: var(--ink-0);
        }
        .page.light-theme .test-text {
          color: #39414A;
        }
        .page.light-theme .cta-section {
          background: linear-gradient(180deg, rgba(209,10,10,0.08), rgba(255,255,255,0.72));
          box-shadow: 0 25px 70px rgba(15,23,42,0.08);
        }
        .page.light-theme .cta-glow {
          background: radial-gradient(ellipse, rgba(255,59,48,0.18), transparent 70%);
        }
        .page.light-theme .marquee {
          background: rgba(255,255,255,0.65);
        }
        .page.light-theme .course-visual-icon {
          background: rgba(255,255,255,0.35);
        }
        .page.light-theme .tm-featured {
          background: linear-gradient(180deg, rgba(209,10,10,0.055), rgba(255,255,255,0.9));
        }
        .page.light-theme .tm-horizontal,
        .page.light-theme .tm-visual,
        .page.light-theme .tm-compact,
        .page.light-theme .tm-gallery {
          background: rgba(255,255,255,0.8);
        }
        .page.light-theme .tm-social-icon {
          background: rgba(15,23,42,0.035);
        }

        * { box-sizing: border-box; }
        html, body { overflow-x: hidden; width: 100%; margin: 0; }
        html { cursor: default; }

        .page {
          background: var(--bg-0);
          color: var(--ink-0);
          font-family: 'Manrope', sans-serif;
          position: relative;
          overflow-x: hidden;
          max-width: 100vw;
          scroll-behavior: smooth;
          line-height: 1.5;
        }
        .page h1, .page h2, .page h3, .page .display { font-family: 'Unbounded', sans-serif; }
        .mono { font-family: 'Space Mono', monospace; letter-spacing: 0.04em; }

        .cursor-glow {
          position: fixed; top: -220px; left: -220px;
          width: 440px; height: 440px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(200,255,77,0.10), rgba(53,242,224,0.06) 45%, transparent 70%);
          pointer-events: none;
          z-index: 2;
          mix-blend-mode: screen;
        }

        /* ---------- ambient background ---------- */
        .bg-field {
          position: fixed; inset: 0; z-index: 0; pointer-events: none;
          background:
            radial-gradient(ellipse 55% 40% at 12% 6%, rgba(200,255,77,0.10), transparent 60%),
            radial-gradient(ellipse 55% 45% at 90% 14%, rgba(53,242,224,0.12), transparent 60%),
            radial-gradient(ellipse 60% 50% at 50% 100%, rgba(255,77,216,0.07), transparent 60%);
          animation: bgShift 20s ease-in-out infinite alternate;
        }
        @keyframes bgShift { 0% { filter: hue-rotate(0deg); } 100% { filter: hue-rotate(10deg); } }
        .grid-overlay {
          position: fixed; inset: 0; z-index: 0; pointer-events: none; opacity: 0.35;
          background-image:
            linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px);
          background-size: 46px 46px;
          mask-image: radial-gradient(ellipse 70% 60% at 50% 20%, black, transparent 75%);
        }
        .particle {
          position: fixed; border-radius: 50%; z-index: 0; pointer-events: none;
          background: radial-gradient(circle, rgba(53,242,224,0.9), transparent 70%);
          animation: floatY linear infinite;
        }
        @keyframes floatY {
          0% { transform: translateY(0); opacity: 0; }
          10% { opacity: 0.8; }
          90% { opacity: 0.5; }
          100% { transform: translateY(-120vh) translateX(30px); opacity: 0; }
        }

        section, header, footer { position: relative; z-index: 1; }

        /* ---------- floating debris cubes across page ---------- */
        .debris { position: absolute; z-index: 0; opacity: 0.5; pointer-events: none; }

        /* ---------- 3D primitives ---------- */
        .cube3d {
          position: relative;
          transform-style: preserve-3d;
          animation: cubeSpin linear infinite;
        }
        @keyframes cubeSpin {
          from { transform: rotateX(0deg) rotateY(0deg); }
          to { transform: rotateX(360deg) rotateY(360deg); }
        }
        .cube3d-face {
          position: absolute; top: 0; left: 0;
          background: linear-gradient(135deg, rgba(200,255,77,0.22), rgba(53,242,224,0.16));
          border: 1px solid rgba(255,255,255,0.18);
          backdrop-filter: blur(2px);
        }

        .sphere3d {
          position: relative;
          border-radius: 50%;
          background: radial-gradient(circle at 32% 28%, rgba(255,255,255,0.9), rgba(200,255,77,0.55) 22%, rgba(53,242,224,0.5) 55%, rgba(11,11,20,0.9) 100%);
          box-shadow: 0 0 70px rgba(53,242,224,0.35), 0 0 140px rgba(200,255,77,0.2), inset -10px -10px 30px rgba(0,0,0,0.4);
          animation: spherePulse 5s ease-in-out infinite;
        }
        @keyframes spherePulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.05); } }
        .sphere3d-shine {
          position: absolute; top: 12%; left: 20%;
          width: 26%; height: 18%; border-radius: 50%;
          background: rgba(255,255,255,0.65);
          filter: blur(4px);
        }

        .ring3d {
          position: absolute;
          top: 50%; left: 50%;
          border-radius: 50%;
          border: 1px solid rgba(53,242,224,0.35);
          transform: translate(-50%,-50%) rotateX(72deg);
          animation: ringSpin linear infinite;
        }
        .ring3d::before {
          content: '';
          position: absolute; inset: -1px;
          border-radius: 50%;
          border: 1px dashed rgba(200,255,77,0.25);
        }
        @keyframes ringSpin { to { transform: translate(-50%,-50%) rotateX(72deg) rotateZ(360deg); } }

        /* ---------- tilt / magnetic ---------- */
        .tilt { transition: transform 0.15s ease-out; transform-style: preserve-3d; will-change: transform; }
        .magnetic { transition: transform 0.18s ease-out; }

        /* ---------- nav ---------- */
        .nav {
          position: sticky; top: 0; z-index: 50;
          display: flex; align-items: center; justify-content: space-between;
          padding: 18px clamp(20px, 6vw, 64px);
          transition: all 0.35s ease;
          border-bottom: 1px solid transparent;
        }
        .nav.scrolled { background: rgba(5,5,10,0.75); backdrop-filter: blur(18px); border-bottom: 1px solid var(--line); }
        .logo { font-family: 'Unbounded', sans-serif; font-weight: 700; font-size: 17px; display: flex; align-items: center; gap: 8px; }
        .logo-dot {
          width: 10px; height: 10px; border-radius: 3px;
          background: linear-gradient(135deg, var(--lime), var(--cyan));
          box-shadow: 0 0 16px rgba(200,255,77,0.85);
          animation: dotSpin 4s linear infinite;
        }
        @keyframes dotSpin { to { transform: rotate(360deg); } }
        .nav-links { display: flex; gap: 36px; list-style: none; margin: 0; padding: 0; }
        .nav-links a { color: var(--ink-1); text-decoration: none; font-size: 14.5px; font-weight: 500; position: relative; transition: color 0.25s ease; }
        .nav-links a:hover { color: var(--ink-0); }
        .nav-links a::after {
          content: ''; position: absolute; left: 0; bottom: -6px; width: 0; height: 1.5px;
          background: linear-gradient(90deg, var(--lime), var(--cyan));
          transition: width 0.25s ease;
        }
        .nav-links a:hover::after { width: 100%; }
        .nav-right { display: flex; align-items: center; gap: 14px; }
        .btn { font-family: 'Manrope', sans-serif; font-weight: 700; font-size: 14px; border: none; cursor: pointer; }
        .btn-ghost { background: transparent; color: var(--ink-0); padding: 10px 18px; transition: color 0.25s ease; }
        .btn-ghost:hover { color: var(--lime); }
        .btn-primary {
          background: linear-gradient(135deg, var(--lime), var(--cyan));
          color: #05050A;
          padding: 12px 24px; border-radius: 999px;
          display: inline-flex; align-items: center; gap: 8px;
          box-shadow: 0 8px 26px -6px rgba(200,255,77,0.55);
          transition: box-shadow 0.25s ease;
        }
        .btn-primary:hover { box-shadow: 0 14px 34px -6px rgba(53,242,224,0.7); }
        .btn-secondary {
          background: var(--glass); border: 1px solid var(--line); color: var(--ink-0);
          padding: 12px 24px; border-radius: 999px; backdrop-filter: blur(10px);
          transition: border-color 0.25s ease;
        }
        .btn-secondary:hover { border-color: rgba(53,242,224,0.6); }
        .menu-toggle { display: none; background: none; border: none; color: var(--ink-0); cursor: pointer; }
        .mobile-menu { position: fixed; inset: 0; z-index: 60; background: rgba(5,5,10,0.98); backdrop-filter: blur(20px); display: flex; flex-direction: column; padding: 24px; gap: 28px; }
        .mobile-menu a { color: var(--ink-0); text-decoration: none; font-size: 22px; font-family: 'Unbounded', sans-serif; }

        /* ---------- hero ---------- */
        .hero {
          display: grid; grid-template-columns: 1.05fr 0.95fr; align-items: center; gap: 40px;
          padding: clamp(40px,6vw,80px) clamp(20px,6vw,64px) 50px;
          min-height: 86vh;
        }
        .eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 7px 14px; border-radius: 999px;
          background: var(--glass); border: 1px solid var(--line);
          font-size: 12.5px; color: var(--lime); margin-bottom: 26px; width: fit-content;
        }
        .hero h1 { font-size: clamp(38px, 5.2vw, 68px); font-weight: 700; line-height: 1.06; letter-spacing: -0.01em; margin: 0 0 22px; isolation: isolate; }
        .grad-text {
          display: inline-block;
          background: linear-gradient(120deg, var(--lime), var(--cyan) 55%, var(--magenta));
          background-size: 220% auto; -webkit-background-clip: text; background-clip: text; color: transparent;
          -webkit-text-fill-color: transparent;
          animation: gradMove 5s ease infinite;
          transform: translateZ(0);
          will-change: background-position;
          backface-visibility: hidden;
        }
        @keyframes gradMove { 0%,100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
        .hero p.sub { font-size: clamp(15px, 1.4vw, 18px); color: var(--ink-1); max-width: 480px; margin-bottom: 34px; }
        .hero-actions { display: flex; gap: 14px; flex-wrap: wrap; }

        /* ---------- hero core (3D cluster) ---------- */
        .hero-core { position: relative; width: 100%; aspect-ratio: 1/1; max-width: 480px; margin: 0 auto; perspective: 1000px; }
        .hero-core-parallax {
          position: absolute; inset: 0;
          transform: rotateY(calc(var(--px, 0) * 14deg)) rotateX(calc(var(--py, 0) * -14deg));
          transform-style: preserve-3d;
          transition: transform 0.1s ease-out;
        }
        .hc-ring { position: absolute; }
        .hc-ring-1 { top: 50%; left: 50%; animation-duration: 26s; }
        .hc-ring-2 { top: 50%; left: 50%; animation-duration: 34s; animation-direction: reverse; border-color: rgba(255,77,216,0.25); }
        .hc-sphere { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); }
        .hc-cube { position: absolute; }
        .hc-cube-1 { top: 12%; left: 66%; }
        .hc-cube-2 { top: 68%; left: 18%; }
        .hc-node {
          position: absolute; display: flex; align-items: center; gap: 6px;
          padding: 7px 12px; border-radius: 999px;
          background: rgba(11,11,20,0.75); border: 1px solid var(--line);
          backdrop-filter: blur(8px); font-size: 12px; color: var(--ink-0);
          animation: floatNode 5s ease-in-out infinite;
          box-shadow: 0 6px 18px rgba(0,0,0,0.4);
        }
        .hc-node-icon { color: var(--lime); display: flex; }
        @keyframes floatNode { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        .hc-card {
          position: absolute; display: flex; align-items: center; gap: 8px;
          background: rgba(11,11,20,0.82); border: 1px solid var(--line); border-radius: 14px;
          padding: 10px 14px; font-size: 12px; backdrop-filter: blur(10px);
          box-shadow: 0 10px 26px rgba(0,0,0,0.45);
          animation: floatNode 6s ease-in-out infinite;
        }
        .hc-card-1 { bottom: 4%; left: -6%; animation-delay: 0.5s; }
        .hc-card-2 { top: 2%; right: -4%; flex-direction: column; align-items: flex-start; animation-delay: 1.5s; }
        .hc-card-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--lime); box-shadow: 0 0 8px var(--lime); }
        .hc-progress { width: 90px; height: 4px; border-radius: 4px; background: rgba(255,255,255,0.12); overflow: hidden; margin-bottom: 6px; }
        .hc-progress-fill { width: 87%; height: 100%; background: linear-gradient(90deg, var(--lime), var(--cyan)); }

        /* ---------- marquee ---------- */
        .marquee { overflow: hidden; border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); padding: 18px 0; background: var(--glass); }
        .marquee-track { display: flex; gap: 40px; width: max-content; animation: marqueeScroll 22s linear infinite; }
        @keyframes marqueeScroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .marquee-item { display: flex; align-items: center; gap: 8px; font-family: 'Space Mono', monospace; font-size: 13px; color: var(--ink-1); white-space: nowrap; }
        .marquee-item svg { color: var(--lime); }

        /* ---------- section shell ---------- */
        .section { padding: 100px clamp(20px,6vw,64px); }
        .section-head { max-width: 640px; margin: 0 auto 56px; text-align: center; }
        .section-head h2 { font-size: clamp(28px, 3.4vw, 44px); font-weight: 600; letter-spacing: -0.01em; margin: 0 0 14px; }
        .section-head p { color: var(--ink-1); font-size: 16px; }

        .reveal { opacity: 0; transform: translateY(28px); transition: opacity 0.7s ease, transform 0.7s ease; }
        .reveal-visible { opacity: 1; transform: translateY(0); }

        /* ---------- features ---------- */
        .feature-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; max-width: 1200px; margin: 0 auto; }
        .feature-card {
          background: var(--glass); border: 1px solid var(--line); border-radius: 20px; padding: 28px 24px;
          transition: border-color 0.3s ease, background 0.3s ease;
        }
        .feature-card:hover { border-color: rgba(200,255,77,0.4); background: rgba(200,255,77,0.05); }
        .feature-icon {
          width: 46px; height: 46px; border-radius: 13px; display: flex; align-items: center; justify-content: center;
          background: linear-gradient(135deg, rgba(200,255,77,0.25), rgba(53,242,224,0.25));
          color: var(--lime); margin-bottom: 18px;
        }
        .feature-card h3 { font-size: 17px; margin: 0 0 8px; font-weight: 600; }
        .feature-card p { font-size: 14px; color: var(--ink-1); margin: 0; }

        /* ---------- courses ---------- */
        .course-scroll { display: flex; gap: 20px; overflow-x: auto; padding: 8px 4px 20px; scroll-snap-type: x proximity; }
        .course-scroll::-webkit-scrollbar { height: 6px; }
        .course-scroll::-webkit-scrollbar-thumb { background: rgba(200,255,77,0.4); border-radius: 6px; }
        .course-card { scroll-snap-align: start; flex: 0 0 280px; border-radius: 22px; background: var(--bg-1); border: 1px solid var(--line); overflow: hidden; }
        .course-visual { height: 130px; display: flex; align-items: center; justify-content: center; color: #05050A; position: relative; overflow: hidden; }
        .course-visual::after { content: ''; position: absolute; inset: 0; background: radial-gradient(circle at 70% 20%, rgba(255,255,255,0.35), transparent 55%); }
        .course-visual-icon { width: 52px; height: 52px; border-radius: 14px; background: rgba(5,5,10,0.18); display: flex; align-items: center; justify-content: center; backdrop-filter: blur(6px); }
        .course-body { padding: 20px; }
        .course-body h3 { font-size: 16.5px; margin: 0 0 8px; font-weight: 600; }
        .course-body p { font-size: 13.5px; color: var(--ink-1); margin: 0 0 14px; min-height: 36px; }
        .course-meta { display: flex; align-items: center; justify-content: space-between; font-size: 12.5px; color: var(--lime); }

        /* ---------- AI section ---------- */
        .ai-section { display: grid; grid-template-columns: 0.9fr 1.1fr; gap: 48px; align-items: center; max-width: 1200px; margin: 0 auto; }
        .ai-copy h2 { font-size: clamp(28px,3.2vw,42px); font-weight: 600; margin: 0 0 18px; line-height: 1.15; }
        .ai-copy p { color: var(--ink-1); font-size: 15.5px; margin-bottom: 26px; max-width: 420px; }
        .mock {
          border-radius: 24px; background: linear-gradient(180deg, rgba(200,255,77,0.06), rgba(11,11,20,0.92));
          border: 1px solid var(--line); padding: 22px; backdrop-filter: blur(14px);
          box-shadow: 0 30px 70px -20px rgba(53,242,224,0.25);
        }
        .mock-topbar { display: flex; align-items: center; gap: 8px; margin-bottom: 20px; }
        .mock-dot { width: 9px; height: 9px; border-radius: 50%; background: rgba(255,255,255,0.2); }
        .mock-title { margin-left: 8px; font-size: 12.5px; color: var(--ink-1); }
        .chat-bubble { max-width: 82%; padding: 14px 16px; border-radius: 16px; font-size: 14px; line-height: 1.5; margin-bottom: 14px; }
        .chat-user { margin-left: auto; background: linear-gradient(135deg, var(--lime), var(--cyan)); color: #05050A; border-bottom-right-radius: 4px; font-weight: 600; }
        .chat-ai { background: rgba(255,255,255,0.05); border: 1px solid var(--line); border-bottom-left-radius: 4px; }
        .chat-typing { display: inline-flex; gap: 4px; padding: 6px 0; }
        .chat-typing span { width: 6px; height: 6px; border-radius: 50%; background: var(--lime); animation: blink 1.2s infinite ease-in-out; }
        .chat-typing span:nth-child(2) { animation-delay: 0.2s; }
        .chat-typing span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes blink { 0%,80%,100% { opacity: 0.25; } 40% { opacity: 1; } }
        .mock-input { display: flex; align-items: center; gap: 10px; margin-top: 6px; background: rgba(255,255,255,0.04); border: 1px solid var(--line); border-radius: 999px; padding: 10px 14px; color: var(--ink-1); font-size: 13.5px; }

        /* ---------- stats ---------- */
        .stats-wrap { max-width: 1100px; margin: 0 auto; display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
        .stat-card { text-align: center; padding: 34px 16px; border-radius: 20px; border: 1px solid var(--line); background: var(--glass); }
        .stat-number { font-family: 'Space Mono', monospace; font-size: clamp(30px, 3.4vw, 42px); font-weight: 700; background: linear-gradient(120deg, var(--lime), var(--cyan)); -webkit-background-clip: text; background-clip: text; color: transparent; -webkit-text-fill-color: transparent; display: inline-block; }
        .stat-label { color: var(--ink-1); font-size: 13.5px; margin-top: 8px; }

        /* ---------- testimonials ---------- */
        .test-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; max-width: 1160px; margin: 0 auto; }
        .test-card { background: var(--bg-1); border: 1px solid var(--line); border-radius: 20px; padding: 26px; }
        .test-quote { color: var(--lime); margin-bottom: 14px; }
        .test-text { font-size: 14.5px; color: #DDE3D8; margin: 0 0 20px; line-height: 1.6; }
        .test-person { display: flex; align-items: center; gap: 12px; }
        .avatar { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, var(--lime), var(--cyan)); display: flex; align-items: center; justify-content: center; font-family: 'Unbounded', sans-serif; font-size: 13px; font-weight: 700; color: #05050A; }
        .test-name { font-size: 14px; font-weight: 700; }
        .test-role { font-size: 12.5px; color: var(--ink-1); }

        /* ---------- final CTA ---------- */
        .cta-section {
          margin: 40px clamp(16px,4vw,48px) 0; border-radius: 32px; padding: 90px 40px; text-align: center;
          position: relative; overflow: hidden;
          background: linear-gradient(180deg, rgba(200,255,77,0.1), rgba(11,11,20,0.6));
          border: 1px solid var(--line);
        }
        .cta-glow { position: absolute; top: -30%; left: 50%; transform: translateX(-50%); width: 700px; height: 400px; background: radial-gradient(ellipse, rgba(53,242,224,0.4), transparent 70%); filter: blur(20px); pointer-events: none; }
        .cta-section h2 { font-size: clamp(28px,4vw,48px); margin: 0 0 16px; position: relative; }
        .cta-section p { color: var(--ink-1); margin-bottom: 32px; position: relative; }

        /* ---------- footer ---------- */
        .footer { padding: 64px clamp(20px,6vw,64px) 32px; border-top: 1px solid var(--line); margin-top: 60px; }
        .footer-top { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 32px; margin-bottom: 40px; }
        .footer-tag { color: var(--ink-1); font-size: 13.5px; margin-top: 8px; max-width: 260px; }
        .footer-links { display: flex; gap: 32px; list-style: none; padding: 0; margin: 0; flex-wrap: wrap; }
        .footer-links a { color: var(--ink-1); text-decoration: none; font-size: 14px; }
        .footer-links a:hover { color: var(--lime); }
        .footer-bottom { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; padding-top: 24px; border-top: 1px solid var(--line); font-size: 12.5px; color: var(--ink-1); }
        .socials { display: flex; gap: 14px; }
        .social-dot { width: 34px; height: 34px; border-radius: 50%; border: 1px solid var(--line); display: flex; align-items: center; justify-content: center; color: var(--ink-1); transition: border-color 0.25s ease, color 0.25s ease; }
        .social-dot:hover { border-color: var(--lime); color: var(--lime); }

        /* ---------- team section (violet/blue accent, as specified) ---------- */
        .tm-section {
          --tv: #8B5CF6;
          --tv-2: #4C8DFF;
          --tv-3: #C084FC;
          position: relative;
          overflow: hidden;
          padding-top: 90px;
          padding-bottom: 110px;
        }
        .tm-bg-ring {
          position: absolute; top: 6%; left: 50%; transform: translateX(-50%) rotateX(72deg);
          border-color: rgba(139,92,246,0.14);
          z-index: 0;
        }
        .tm-eyebrow { color: var(--tv-3); border-color: rgba(139,92,246,0.25); }
        .grad-text-violet {
          display: inline-block;
          background: linear-gradient(120deg, var(--tv-3), var(--tv-2));
          -webkit-background-clip: text; background-clip: text; color: transparent;
          -webkit-text-fill-color: transparent;
        }

        .tm-groups { display: flex; flex-direction: column; gap: 76px; max-width: 1220px; margin: 0 auto; position: relative; z-index: 1; }

        .tm-group-head { display: flex; align-items: center; gap: 12px; margin-bottom: 30px; }
        .tm-group-label { color: rgba(139,92,246,0.55); font-size: 13px; }
        .tm-group-icon {
          width: 34px; height: 34px; border-radius: 10px;
          background: linear-gradient(135deg, rgba(139,92,246,0.28), rgba(76,141,255,0.28));
          border: 1px solid rgba(139,92,246,0.3);
          display: flex; align-items: center; justify-content: center; color: var(--tv-3);
        }
        .tm-group-head h3 { font-size: 20px; font-weight: 600; margin: 0; white-space: nowrap; }
        .tm-group-rule { flex: 1; height: 1px; background: linear-gradient(90deg, rgba(139,92,246,0.35), transparent); }

        /* shared avatar */
        .tm-avatar {
          position: relative; border-radius: 50%; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Unbounded', sans-serif; font-weight: 700; color: rgba(255,255,255,0.92);
          overflow: hidden;
          box-shadow: 0 8px 22px -6px rgba(139,92,246,0.55);
        }
        .tm-avatar-icon { position: absolute; opacity: 0.22; color: #fff; }
        .tm-avatar-ring { box-shadow: 0 0 0 3px rgba(139,92,246,0.18), 0 8px 22px -6px rgba(139,92,246,0.55); }

        .tm-social { display: flex; gap: 8px; margin-top: 12px; }
        .tm-social-icon {
          width: 28px; height: 28px; border-radius: 8px;
          border: 1px solid var(--line);
          background: rgba(255,255,255,0.03);
          display: flex; align-items: center; justify-content: center;
          color: var(--ink-1);
          transition: color 0.25s ease, border-color 0.25s ease, transform 0.25s ease;
        }
        .tm-social-icon:hover { color: var(--tv-3); border-color: rgba(139,92,246,0.5); transform: translateY(-2px); }

        /* 1. Rahbariyat — large featured cards */
        .tm-featured-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 22px; }
        .tm-featured {
          border-radius: 26px; overflow: hidden;
          background: linear-gradient(180deg, rgba(139,92,246,0.08), rgba(11,11,20,0.85));
          border: 1px solid rgba(139,92,246,0.22);
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
        }
        .tm-featured:hover { border-color: rgba(192,132,252,0.55); box-shadow: 0 24px 50px -18px rgba(139,92,246,0.5); }
        .tm-featured-photo {
          height: 190px; position: relative; display: flex; align-items: center; justify-content: center;
          overflow: hidden;
        }
        .tm-photo-icon { color: rgba(255,255,255,0.85); }
        .tm-featured-shine {
          position: absolute; inset: 0;
          background: radial-gradient(circle at 70% 15%, rgba(255,255,255,0.3), transparent 55%);
        }
        .tm-featured-body { padding: 22px 22px 26px; }
        .tm-featured-body h4 { margin: 0 0 6px; font-size: 17px; font-family: 'Unbounded', sans-serif; font-weight: 600; }
        .tm-featured-body p { margin: 0; color: var(--tv-3); font-size: 13px; }

        /* 2. Dasturchilar — horizontal cards */
        .tm-horizontal-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
        .tm-horizontal {
          display: flex; align-items: center; gap: 16px;
          padding: 16px 18px; border-radius: 18px;
          background: var(--glass); border: 1px solid var(--line);
          transition: border-color 0.3s ease, background 0.3s ease, transform 0.3s ease;
        }
        .tm-horizontal:hover { border-color: rgba(139,92,246,0.4); background: rgba(139,92,246,0.06); transform: translateX(4px); }
        .tm-horizontal-body { flex: 1; }
        .tm-horizontal-body h4 { margin: 0 0 3px; font-size: 15px; font-weight: 600; }
        .tm-horizontal-body p { margin: 0; color: var(--ink-1); font-size: 12.5px; }
        .tm-horizontal .tm-social { margin-top: 0; }

        /* 3. Dizayn — visual cards, strong image presence */
        .tm-visual-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 22px; }
        .tm-visual {
          border-radius: 24px; overflow: hidden; display: flex; align-items: stretch;
          background: rgba(11,11,20,0.7); border: 1px solid rgba(76,141,255,0.22);
          transition: transform 0.35s ease, border-color 0.3s ease;
          min-height: 168px;
        }
        .tm-visual:hover { transform: translateY(-6px); border-color: rgba(192,132,252,0.5); }
        .tm-visual-photo {
          width: 44%; position: relative; display: flex; align-items: center; justify-content: center;
        }
        .tm-visual-photo::after { content: ''; position: absolute; inset: 0; background: radial-gradient(circle at 30% 20%, rgba(255,255,255,0.28), transparent 60%); }
        .tm-visual-body { padding: 22px; display: flex; flex-direction: column; justify-content: center; }
        .tm-visual-body h4 { margin: 0 0 6px; font-size: 16px; font-weight: 600; font-family: 'Unbounded', sans-serif; }
        .tm-visual-body p { margin: 0; color: var(--tv-3); font-size: 13px; }

        /* 4. Ovozlashtirish — compact elegant cards */
        .tm-compact-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; max-width: 640px; }
        .tm-compact {
          display: flex; align-items: center; gap: 14px;
          padding: 14px 16px; border-radius: 999px;
          background: var(--glass); border: 1px solid var(--line);
          transition: border-color 0.3s ease, transform 0.3s ease;
        }
        .tm-compact:hover { border-color: rgba(139,92,246,0.45); transform: scale(1.02); }
        .tm-compact h4 { margin: 0; font-size: 13.5px; font-weight: 700; }
        .tm-compact p { margin: 0; font-size: 11.5px; color: var(--ink-1); }
        .tm-compact .tm-social { margin-top: 0; margin-left: auto; }

        /* 5. Video montaj — wide gallery grid */
        .tm-gallery-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
        .tm-gallery {
          text-align: center; padding: 22px 14px;
          border-radius: 18px;
          background: var(--glass); border: 1px solid var(--line);
          display: flex; flex-direction: column; align-items: center;
          transition: border-color 0.3s ease, transform 0.3s ease, background 0.3s ease;
        }
        .tm-gallery:hover { border-color: rgba(76,141,255,0.45); background: rgba(76,141,255,0.05); transform: translateY(-4px); }
        .tm-gallery .tm-avatar { margin-bottom: 12px; }
        .tm-gallery h4 { margin: 0 0 4px; font-size: 13.5px; font-weight: 700; }
        .tm-gallery p { margin: 0; font-size: 11.5px; color: var(--ink-1); }
        .tm-gallery .tm-social { justify-content: center; }

        /* closing line */
        .tm-closing {
          display: flex; align-items: center; gap: 22px;
          max-width: 720px; margin: 90px auto 0;
        }
        .tm-closing-line { flex: 1; height: 1px; background: linear-gradient(90deg, transparent, rgba(139,92,246,0.4), transparent); }
        .tm-closing p {
          font-family: 'Unbounded', sans-serif; font-size: clamp(14px, 1.8vw, 18px);
          font-weight: 500; color: var(--ink-0); text-align: center; white-space: nowrap;
          margin: 0;
        }

        /* ---------- responsive: tablet (≤980px) ---------- */
        @media (max-width: 980px) {
          .hero { grid-template-columns: 1fr; text-align: center; padding-top: 24px; min-height: auto; }
          .hero p.sub { margin-left: auto; margin-right: auto; }
          .hero-actions { justify-content: center; }
          .eyebrow { margin-left: auto; margin-right: auto; }
          .hero-core { max-width: 380px; margin-top: 20px; }
          .feature-grid { grid-template-columns: repeat(2, 1fr); }
          .ai-section { grid-template-columns: 1fr; }
          .ai-copy { text-align: center; }
          .ai-copy p { margin-left: auto; margin-right: auto; }
          .ai-copy .btn { margin: 0 auto; }
          .stats-wrap { grid-template-columns: repeat(2, 1fr); }
          .test-grid { grid-template-columns: 1fr; max-width: 460px; }
          .nav-links { display: none; }
          .nav-right .btn-ghost { display: none; }
          .menu-toggle { display: block; }
          .cursor-glow { display: none; }
          .section { padding: 76px clamp(20px,6vw,64px); }
          .cta-section { padding: 64px 32px; }
          .tm-featured-grid { grid-template-columns: repeat(2, 1fr); }
          .tm-horizontal-grid, .tm-visual-grid { grid-template-columns: 1fr; }
          .tm-gallery-grid { grid-template-columns: repeat(2, 1fr); }
          .tm-groups { gap: 56px; }
        }

        /* ---------- responsive: mobile (≤640px) ---------- */
        @media (max-width: 640px) {
          .nav { padding: 14px 18px; }
          .logo { font-size: 15px; }
          .nav-right { gap: 8px; }
          .btn-primary { padding: 10px 16px; font-size: 13px; }
          .hero { padding-bottom: 30px; }
          .hero-core { max-width: 300px; }
          .hc-card-1 { left: 2%; }
          .hc-card-2 { right: 2%; }
          .feature-grid { grid-template-columns: 1fr; }
          .course-card { flex-basis: 240px; }
          .stats-wrap { grid-template-columns: 1fr 1fr; gap: 12px; }
          .stat-card { padding: 24px 10px; }
          .stat-number { font-size: 26px; }
          .footer-top { flex-direction: column; }
          .footer-links { gap: 22px; }
          .cta-section { padding: 52px 22px; border-radius: 24px; }
          .mock { padding: 16px; }
          .section { padding: 60px 20px; }
          .section-head { margin-bottom: 40px; }

          /* team section on mobile */
          .tm-groups { gap: 46px; }
          .tm-group-head h3 { white-space: normal; font-size: 18px; }
          .tm-featured-grid { grid-template-columns: 1fr; }
          .tm-compact-grid { grid-template-columns: 1fr; }
          .tm-gallery-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
          .tm-visual { flex-direction: column; }
          .tm-visual-photo { width: 100%; height: 120px; }
          .tm-closing { flex-direction: column; gap: 12px; margin-top: 60px; }
          .tm-closing p { white-space: normal; }

          /* thin out decorative weight on small screens */
          .particle { display: none; }
          .hc-cube-2 { display: none; }
          .debris { display: none; }
        }

        /* ---------- responsive: small mobile (≤420px) ---------- */
        @media (max-width: 420px) {
          .logo { font-size: 13.5px; gap: 6px; }
          .logo-dot { width: 8px; height: 8px; }
          .btn-primary { padding: 9px 14px; font-size: 12.5px; gap: 6px; }
          .hero h1 { font-size: 32px; }
          .hero-core { max-width: 250px; }
          .hc-ring-1 { width: 170px !important; height: 170px !important; }
          .hc-ring-2 { width: 200px !important; height: 200px !important; }
          .hc-sphere { width: 84px !important; height: 84px !important; }
          .hc-cube-1 { display: none; }
          .hc-node { font-size: 10px; padding: 5px 9px; gap: 4px; }
          .hc-card { font-size: 10.5px; padding: 7px 10px; }
          .hc-card-1 { left: 0; }
          .hc-card-2 { right: 0; }
          .hc-progress { width: 66px; }
          .stats-wrap { grid-template-columns: 1fr; max-width: 260px; margin-left: auto; margin-right: auto; }
          .course-card { flex-basis: 220px; }
          .tm-gallery-grid { grid-template-columns: 1fr 1fr; }
          .tm-avatar { width: 44px !important; height: 44px !important; }
        }

        @media (max-width: 980px) {
          .theme-toggle span { display: none; }
          .theme-toggle { width: 40px; padding: 9px; }
        }

        @media (max-width: 640px) {
          .theme-toggle { width: 38px; min-height: 38px; }
        }

        /* Light rejimda qora rangga bog'langan elementlar */
        .page.light-theme .btn-primary {
          color: #fff;
          box-shadow: 0 8px 26px -6px rgba(209,10,10,0.35);
        }
        .page.light-theme .btn-primary:hover {
          box-shadow: 0 14px 34px -6px rgba(255,59,48,0.4);
        }
        .page.light-theme .course-visual {
          color: #fff;
        }
        .page.light-theme .chat-user {
          color: #fff;
        }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; }
        }
      `}</style>

      <CursorGlow />
      <div className="bg-field" />
      <div className="grid-overlay" />
      {[...Array(14)].map((_, i) => (
        <div
          key={i}
          className="particle"
          style={{
            width: `${2 + (i % 3)}px`,
            height: `${2 + (i % 3)}px`,
            left: `${(i * 7.3) % 100}%`,
            bottom: `-10px`,
            animationDuration: `${14 + (i % 6) * 3}s`,
            animationDelay: `${i * 1.1}s`,
          }}
        />
      ))}

      {/* NAV */}
      <header className={`nav ${scrolled ? "scrolled" : ""}`} id="home">
        <div className="logo">
  <img
    src={classaLogo}
    alt="ClassA"
    className="classa-logo"
  />
  <span>AKADEMIYA AI</span>
</div>
        <ul className="nav-links">
          {navLinks.map((l) => (
            <li key={l.href}>
              <a href={l.href}>{l.label}</a>
            </li>
          ))}
        </ul>
        <div className="nav-right">
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Yorug' rejimga o'tish" : "Qorong'i rejimga o'tish"}
            title={theme === "dark" ? "Yorug' rejim" : "Qorong'i rejim"}
          >
            {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
            <span>{theme === "dark" ? "Yorug' rejim" : "Qorong'i rejim"}</span>
          </button>

          <button className="btn btn-ghost">Kirish</button>
          <Magnetic className="btn btn-primary">
            Boshlash <ArrowRight size={15} />
          </Magnetic>
          <button className="menu-toggle" onClick={() => setMenuOpen(true)} aria-label="Menyu">
            <Menu size={24} />
          </button>
        </div>
      </header>

      {menuOpen && (
        <div className="mobile-menu">
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button className="menu-toggle" style={{ display: "block" }} onClick={() => setMenuOpen(false)}>
              <X size={26} />
            </button>
          </div>
          {navLinks.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)}>
              {l.label}
            </a>
          ))}
          <button className="btn btn-primary" style={{ width: "fit-content", marginTop: 16 }} onClick={() => setMenuOpen(false)}>
            Boshlash <ArrowRight size={15} />
          </button>
        </div>
      )}

      {/* HERO */}
      <section className="hero">
        <div>
          <div className="eyebrow">
            <Sparkles size={14} /> Davlat maktablari uchun AI ta'lim platformasi
          </div>
          <h1>
            Kelajakni o'rganish <br />
            <span className="grad-text">bugundan</span> boshlanadi.
          </h1>
          <p className="sub">Darsliklaringiz asosida tuzilgan darslar, jonli AI repetitor va o'qituvchilar uchun natijalarni real vaqtda kuzatish imkoniyati.</p>
          <div className="hero-actions">
            <Magnetic className="btn btn-primary">
              Boshlash <ArrowRight size={16} />
            </Magnetic>
            <Magnetic className="btn btn-secondary">Darslarni ko'rish</Magnetic>
          </div>
        </div>

        <HeroCore />
      </section>

      <Marquee items={marqueeItems} />

      {/* WHY */}
      <section className="section" id="about">
        <Reveal as="div" className="section-head">
          <h2>Nega Akademiya AI?</h2>
          <p>Davlat maktablari uchun sun'iy intellektga asoslangan zamonaviy ta'lim tajribasi.</p>
        </Reveal>
        <div className="feature-grid">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 90}>
              <Tilt strength={8}>
                <div className="feature-card">
                  <div className="feature-icon">{f.icon}</div>
                  <h3>{f.title}</h3>
                  <p>{f.text}</p>
                </div>
              </Tilt>
            </Reveal>
          ))}
        </div>
      </section>

      {/* COURSES */}
      <section className="section" id="courses">
        <Reveal as="div" className="section-head">
          <h2>Maktab dasturidagi fanlar — bir joyda</h2>
          <p>Davlat ta'lim standartiga mos darslar, har bir maktab o'z darsligi asosida.</p>
        </Reveal>
        <Reveal>
          <div className="course-scroll">
            {courses.map((c) => (
              <Tilt key={c.title} strength={6}>
                <div className="course-card">
                  <div className="course-visual" style={{ background: c.grad }}>
                    <div className="course-visual-icon">{c.icon}</div>
                  </div>
                  <div className="course-body">
                    <h3>{c.title}</h3>
                    <p>{c.desc}</p>
                    <div className="course-meta">
                      <span>{c.lessons}</span>
                      <ArrowRight size={15} />
                    </div>
                  </div>
                </div>
              </Tilt>
            ))}
          </div>
        </Reveal>
      </section>

      {/* AI */}
      <section className="section" id="ai">
        <div className="ai-section">
          <Reveal className="ai-copy">
            <h2>Ta'limda AI kuchidan foydalaning.</h2>
            <p>Akademiya AI'ning jonli repetitori har bir o'quvchining savoliga real vaqtda javob beradi va darslik mavzusiga mos tushuntiradi.</p>
            <Magnetic className="btn btn-primary">
              AI repetitor bilan tanishish <ArrowRight size={16} />
            </Magnetic>
          </Reveal>

          <Reveal delay={120}>
            <Tilt strength={4}>
              <div className="mock">
                <div className="mock-topbar">
                  <span className="mock-dot" />
                  <span className="mock-dot" />
                  <span className="mock-dot" />
                  <span className="mock-title">Akademiya AI · jonli repetitor</span>
                </div>
                <div className="chat-bubble chat-user">Kvadrat tenglamani qanday yechish kerak?</div>
                <div className="chat-bubble chat-ai">Avval diskriminantni topamiz: D = b² − 4ac. Keyin ildizlarni hisoblab, natijani tekshiramiz...</div>
                <div className="chat-bubble chat-ai" style={{ width: "fit-content" }}>
                  <span className="chat-typing"><span /><span /><span /></span>
                </div>
                <div className="mock-input">
                  <span style={{ flex: 1 }}>Savolingizni yozing...</span>
                  <Send size={15} />
                </div>
              </div>
            </Tilt>
          </Reveal>
        </div>
      </section>

      {/* TEAM */}
      <section className="section tm-section" id="team">
        <Ring3D size={520} className="tm-bg-ring" />
        <Cube3D size={30} className="debris tm-debris-1" speed={13} />
        <Cube3D size={22} className="debris tm-debris-2" speed={17} />

        <Reveal as="div" className="section-head">
          <div className="eyebrow tm-eyebrow">
            <Sparkles size={14} /> Jamoa bilan tanishing
          </div>
          <h2>Bizning jamoa</h2>
          <p>Akademiya AI ortida bilim, texnologiya va ijodkorlikni birlashtirgan jamoa turibdi.</p>
        </Reveal>

        <div className="tm-groups">
          {teamGroups.map((g) => (
            <TeamGroup key={g.id} group={g} gradFor={gradFor} />
          ))}
        </div>

        <Reveal className="tm-closing">
          <span className="tm-closing-line" />
          <p>
            Bir jamoa. <span className="grad-text-violet">Bir maqsad.</span> Yangi avlod ta'limi.
          </p>
          <span className="tm-closing-line" />
        </Reveal>
      </section>

      {/* STATS */}
      <section className="section" style={{ paddingBottom: 60 }}>
        <div className="stats-wrap">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 80}>
              <div className="stat-card">
                <Counter target={s.target} suffix={s.suffix} />
                <div className="stat-label mono">{s.label}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="section">
        <Reveal as="div" className="section-head">
          <h2>O'quvchilarimiz nima deydi?</h2>
          <p>Minglab o'quvchilar o'z maqsadlariga Akademiya AI bilan erishmoqda.</p>
        </Reveal>
        <div className="test-grid">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={i * 100}>
              <Tilt strength={5}>
                <div className="test-card">
                  <Quote size={20} className="test-quote" />
                  <p className="test-text">{t.text}</p>
                  <div className="test-person">
                    <div className="avatar">{t.name.split(" ").map((n) => n[0]).join("")}</div>
                    <div>
                      <div className="test-name">{t.name}</div>
                      <div className="test-role">{t.role}</div>
                    </div>
                  </div>
                </div>
              </Tilt>
            </Reveal>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <Reveal>
        <section className="cta-section">
          <div className="cta-glow" />
          <Cube3D size={44} className="debris" speed={9} />
          <h2>Bilim olishning yangi usulini sinab ko'ring.</h2>
          <p>Akademiya AI bilan o'rganishni bugundan boshlang.</p>
          <Magnetic className="btn btn-primary">
            Hoziroq boshlash <ArrowRight size={16} />
          </Magnetic>
        </section>
      </Reveal>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-top">
          <div>
            <div className="logo">
  <img
    src={classaLogo}
    alt="ClassA"
    className="classa-logo"
  />
  <span>AKADEMIYA AI</span>
</div>
            <p className="footer-tag">"Kelajak bilimdan boshlanadi."</p>
          </div>
          <ul className="footer-links">
            <li><a href="#courses">Darslar</a></li>
            <li><a href="#ai">AI</a></li>
            <li><a href="#about">Biz haqimizda</a></li>
            <li><a href="#">Bog'lanish</a></li>
          </ul>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Akademiya AI. Barcha huquqlar himoyalangan.</span>
          <div className="socials">
            <div className="social-dot">in</div>
            <div className="social-dot">tg</div>
            <div className="social-dot">yt</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
