import React, { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";

export default function Mochitech() {
  const team = useMemo(() => [
  { name: "Mendoza Gómez Mercedes", role: "Integrante" },
  { name: "López López Claudia", role: "Integrante" },
  { name: "Quispe Palacios Fernando", role: "Integrante" },
  { name: "Inga Sullon Yajaira", role: "Integrante" },
  { name: "Murguia Merino Dayron", role: "Integrante" },
  { name: "Quinde Navarro Carlos", role: "Integrante" },
  { name: "Sandoval Peralta Daniel", role: "Integrante" },
], []);
  // DOM refs
  const floatingContainerRef = useRef(null);
  const speechRef = useRef(null);
  const energyFillRef = useRef(null);
  const petStageRef = useRef(null);

  // SVG refs
  const petGroupRef = useRef(null);
  const eyeLRef = useRef(null);
  const eyeRRef = useRef(null);
  const mouthRef = useRef(null);

  // Audio refs
  const musicRef = useRef(null);
  const chompRef = useRef(null);

  // State
  const [state, setState] = useState({
    name: "Mochitechito",
    energy: 0,
    hat: "none", // cap | crown | beanie | none
    glasses: "none", // round | star | none
    scarf: "none", // scarf | backpack | none
  });

  const [calcResult, setCalcResult] = useState("—");
  const [ageInput, setAgeInput] = useState("");
  const [weightInput, setWeightInput] = useState("");
  const [hbInput, setHbInput] = useState("");

  const storageKey = "mochitech_state_v1";

  // Tips (rotatorios + animados)
  const tips = useMemo(
    () => [
      "Hierro + vitamina C = equipo ganador (mochi + jugo de naranja).",
      "Evita café o té justo después de comer: dificultan la absorción.",
      "Incluye legumbres, sangrecita, hígado o espinaca con frutas cítricas.",
      "Bebe agua durante el día: la hidratación ayuda a tu energía.",
      "Constancia: marca tu calendario y alimenta a Mochitechito a diario.",
    ],
    []
  );
  const [tipIndex, setTipIndex] = useState(0);

  // Utils
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  const starPath = (cx, cy, spikes, R, r) => {
    let rot = (Math.PI / 2) * 3;
    const step = Math.PI / spikes;
    const pts = [];
    for (let i = 0; i < spikes; i++) {
      pts.push([cx + Math.cos(rot) * R, cy + Math.sin(rot) * R]); rot += step;
      pts.push([cx + Math.cos(rot) * r, cy + Math.sin(rot) * r]); rot += step;
    }
    const [x0, y0] = pts[0];
    return "M" + [x0, y0].join(" ") + " " + pts.slice(1).map(([x, y]) => "L" + x + " " + y).join(" ") + " Z";
  };

  // Voz — niña suave/tiers
  const voiceRef = useRef(null);
  function pickKindaVoice() {
    const voices = window.speechSynthesis?.getVoices?.() || [];
    const prefer = ["child", "niñ", "mujer", "Luciana", "Paulina", "Sofia", "Google español", "es-419", "MX", "ES"];
    const es = voices.filter(v => /^es/i.test(v.lang));
    let best = es.find(v => prefer.some(k => (v.name + " " + v.lang).toLowerCase().includes(k.toLowerCase())));
    if (!best && es.length) best = es[0];
    voiceRef.current = best || null;
  }
  function speak(text) {
    if (!("speechSynthesis" in window)) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = voiceRef.current?.lang || "es-ES";
    u.voice = voiceRef.current || null;
    u.rate = 1.03;   // cadencia dulce
    u.pitch = 1.18;  // tono más infantil
    u.volume = 1;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }
  function setSpeech(text) {
    if (!speechRef.current) return;
    speechRef.current.innerHTML = text;
    try {
      speechRef.current.classList.remove("pop");
      // reflow para reiniciar anim
      // eslint-disable-next-line no-unused-expressions
      speechRef.current.offsetHeight;
      speechRef.current.classList.add("pop");
    } catch {}
  }

  // Save / Load
  function saveState() {
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
      sparkle();
      setSpeech("¡Progreso guardado! 💾");
    } catch {}
  }
  function loadState() {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setState(s => ({ ...s, ...JSON.parse(raw) }));
    } catch {}
  }
// Actualizar título del navegador cuando cambie el nombre
useEffect(() => {
  try {
    document.title = `${state.name} — Mochitech`;
  } catch {}
}, [state.name]);

  // Fondo flotante + parallax suave
  useEffect(() => {
    const container = floatingContainerRef.current;
    if (!container) return;

    function createMascot() {
      const d = document.createElement("div");
      d.classList.add("floating");
      d.style.left = Math.random() * 100 + "vw";
      const size = 60 + Math.random() * 80;
      d.style.width = size + "px";
      d.style.height = size + "px";
      d.style.animationDuration = 12 + Math.random() * 12 + "s";
      d.style.animationDelay = Math.random() * 3 + "s";
      container.appendChild(d);
      setTimeout(() => d.remove(), 24000);
    }
    const id = setInterval(createMascot, 1200);
    for (let i = 0; i < 8; i++) createMascot();

    const onMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 8;
      const y = (e.clientY / window.innerHeight - 0.5) * 8;
      container.style.transform = `translate(${x}px, ${y}px)`;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      clearInterval(id);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  // Música local (coloca /public/make_it_right.mp3)
  const MUSIC_URL = "/make_it_right.mp3";
  useEffect(() => {
    const m = musicRef.current;
    const c = chompRef.current;
    if (!m || !c) return;

    const tryPlay = () => {
      m.volume = 0.35;
      m.loop = true;
      m.play().catch(() => {
        setSpeech("🔊 Si no escuchas música, toca “▶ Música”.");
      });
    };
    // Intento de autoplay + desbloqueo al primer gesto
    const id = setTimeout(tryPlay, 120);
    const unlock = () => { m.play().catch(()=>{}); window.removeEventListener("pointerdown", unlock); };
    window.addEventListener("pointerdown", unlock, { once: true });

    return () => { clearTimeout(id); window.removeEventListener("pointerdown", unlock); };
  }, []);

  function handlePlayMusic() {
    const m = musicRef.current;
    if (!m) return;
    m.play().catch(() => {});
  }
  function handleMuteMusic() {
    const m = musicRef.current;
    if (!m) return;
    m.muted = !m.muted;
  }

  // Idle wobble + parpadeo aleatorio + selección de voz
  useEffect(() => {
    if (!petGroupRef.current) return;

    // Idle
    petGroupRef.current.animate(
      [
        { transform: "translateY(0px) scale(1)" },
        { transform: "translateY(6px) scale(1.02, .98)" },
        { transform: "translateY(0px) scale(1)" },
      ],
      { duration: 1600, iterations: Infinity, easing: "ease-in-out" }
    );

    pickKindaVoice();
    window.speechSynthesis?.addEventListener?.("voiceschanged", pickKindaVoice);

    let alive = true;
    (function loop() {
      const delay = 1400 + Math.random() * 2200;
      setTimeout(() => { if (!alive) return; blink(); loop(); }, delay);
    })();
    return () => { alive = false; };
  }, []);

  // Sincroniza barra de energía
  useEffect(() => {
    if (energyFillRef.current) {
      energyFillRef.current.style.width = state.energy + "%";
      energyFillRef.current.classList.toggle("pulse", state.energy >= 90);
    }
    try { localStorage.setItem(storageKey, JSON.stringify(state)); } catch {}
  }, [state.energy, state.hat, state.glasses, state.scarf, state.name]);

  // Carga inicial
  useEffect(() => { loadState(); }, []);

  // Efectos mini
  function blink() {
    try {
      [eyeLRef.current, eyeRRef.current].forEach((el) => {
        if (!el) return;
        el.animate([{ transform: "scaleY(1)" }, { transform: "scaleY(.15)" }, { transform: "scaleY(1)" }], {
          duration: 180, easing: "ease-in-out",
        });
      });
    } catch {}
  }

  function smile() {
    const mouth = mouthRef.current;
    if (!mouth) return;
    const neutral = "M180 200 Q250 230 320 200";
    const happy = "M160 210 Q250 250 340 210";
    mouth.setAttribute("d", happy);
    try {
      petGroupRef.current?.animate([{ transform: "translateY(0)" }, { transform: "translateY(-8px)" }, { transform: "translateY(0)" }], {
        duration: 420, easing: "ease-out",
      });
    } catch {}
    setTimeout(() => mouth.setAttribute("d", neutral), 820);
  }

  function sleep() {
    setSpeech("Zzz... 😴");
    try {
      petGroupRef.current?.animate([{ opacity: 1 }, { opacity: 0.85 }, { opacity: 1 }], {
        duration: 600, easing: "ease-in-out",
      });
      const z = document.createElement("div");
      z.textContent = "Zzz";
      z.className = "zz";
      petStageRef.current.appendChild(z);
      z.animate([{ transform: "translateY(0)", opacity: 1 }, { transform: "translateY(-70px)", opacity: 0 }], {
        duration: 1300, easing: "ease-out",
      }).onfinish = () => z.remove();
    } catch {}
  }

  function sparkle() {
    for (let i = 0; i < 12; i++) {
      const d = document.createElement("div");
      d.className = "floaty star";
      d.style.left = 10 + Math.random() * 80 + "%";
      d.style.top = 10 + Math.random() * 60 + "%";
      const iel = document.createElement("i");
      d.appendChild(iel);
      document.body.appendChild(d);
      d.animate([{ transform: "translateY(0)", opacity: 1 }, { transform: "translateY(-90px)", opacity: 0 }], {
        duration: 700 + Math.random() * 700, easing: "ease-out", fill: "forwards",
      }).onfinish = () => d.remove();
    }
  }

  function celebrate() {
    try {
      petGroupRef.current?.animate(
        [{ transform: "rotate(0)" }, { transform: "rotate(0.06rad)" }, { transform: "rotate(0)" }, { transform: "rotate(-0.06rad)" }, { transform: "rotate(0)" }],
        { duration: 780, iterations: 2, easing: "ease-in-out" }
      );
    } catch {}
    sparkle();
    heartBurst();
  }

  function ultraCelebrate() {
    try {
      petGroupRef.current?.animate([{ transform: "scale(1)" }, { transform: "scale(1.09)" }, { transform: "scale(1)" }], {
        duration: 300, iterations: 3, easing: "ease-in-out",
      });
    } catch {}
    setSpeech("¡Nivel de energía máximo! ¡Eres grandios@! ✨");
    speak("¡Nivel de energía máximo! ¡Eres grandioso!");
    heartBurst(24);
  }

  function heartBurst(n = 12) {
    const box = petStageRef.current || document.body;
    for (let i = 0; i < n; i++) {
      const h = document.createElement("span");
      h.className = "heart";
      h.textContent = "💜";
      h.style.left = (20 + Math.random() * 60) + "%";
      h.style.bottom = (10 + Math.random() * 20) + "%";
      box.appendChild(h);
      h.animate(
        [
          { transform: "translateY(0) scale(1)", opacity: 1 },
          { transform: `translate(${(Math.random() * 40 - 20)}px, -120px) scale(${0.7 + Math.random() * 0.6})`, opacity: 0 }
        ],
        { duration: 1200 + Math.random() * 600, easing: "ease-out", fill: "forwards" }
      ).onfinish = () => h.remove();
    }
  }

  // Feed
  function feed(e) {
    const stage = petStageRef.current;
    if (!stage) return;
    const mochi = document.createElement("div");
    mochi.textContent = "🍡";
    mochi.className = "mochi-shot";
    stage.appendChild(mochi);

    const keyframes = [
      { transform: "translate(0,0) scale(1)", offset: 0, filter: "drop-shadow(0 0 0px rgba(0,0,0,0))" },
      { transform: "translate(220px,-180px) scale(0.9)", offset: 0.6 },
      { transform: "translate(270px,-210px) scale(0.85)", offset: 1, filter: "drop-shadow(0 6px 12px rgba(0,0,0,.2))" },
    ];
    mochi.animate(keyframes, { duration: 1100, easing: "ease-in-out" }).onfinish = () => {
      chompRef.current?.currentTime && (chompRef.current.currentTime = 0);
      chompRef.current?.play?.().catch?.(() => {});
      mochi.remove();
      setState((s) => {
        const newEnergy = clamp(s.energy + 10, 0, 100);
        const phrases = [
          "¡Gracias por darme energía! 💪",
          "¡Yum! Mochi power 🍡",
          "Recuerda frutas ricas en hierro con vitamina C 🍓",
          "¡Sigue así! Tu cuerpo te lo agradece ✨",
        ];
        const msg = phrases[Math.floor(Math.random() * phrases.length)];
        setSpeech(msg);
        speak(msg);
        if (newEnergy >= 50) celebrate();
        if (newEnergy >= 90) ultraCelebrate();
        return { ...s, energy: newEnergy };
      });
      try {
        petGroupRef.current?.querySelectorAll(".cheek").forEach((el) =>
          el.animate([{ transform: "scale(1)" }, { transform: "scale(1.25)" }, { transform: "scale(1)" }], {
            duration: 380, easing: "ease-out",
          })
        );
      } catch {}
    };
  }

  // Calculadora
  function calcPlan(ageVal, weightVal, hbVal) {
    const age = parseFloat(ageVal || "0");
    const weight = parseFloat(weightVal || "0");
    const hb = parseFloat(hbVal || "0");
    let base = 2;
    if (age <= 6) base = 1;
    else if (age <= 12) base = 2;
    else base = 3;
    if (weight < 25) base = Math.max(1, base - 1);
    if (weight > 60) base += 1;

    let adjust = 0;
    if (hb && hb < 11.5) adjust = 1;
    if (hb && hb < 10.5) adjust = 2;
    if (hb && hb < 9.5) adjust = 3;

    const perDay = clamp(base + adjust, 1, 4);
    const perWeek = perDay * 7;
    const text =
      `Recomendación estimada:\n${perDay} mochi(s) al día (≈ ${perWeek} a la semana).` +
      (hb ? ` Con Hb ${hb} g/dL: combina hierro + vitamina C y, si es posible, consulta con un profesional de salud.` : "");

    setSpeech("Con esta cantidad, pronto te sentirás con más energía.");
    speak("Con esta cantidad, pronto te sentirás con más energía.");
    return text;
  }
  function handleCalc() { setCalcResult(calcPlan(ageInput, weightInput, hbInput)); }

  // Tips — auto-rotación con animación
  useEffect(() => {
    const id = setInterval(() => setTipIndex(i => (i + 1) % tips.length), 4200);
    return () => clearInterval(id);
  }, [tips.length]);

  // Ripple en botones (delegado)
  useEffect(() => {
    function onClick(e) {
      const btn = e.target.closest(".btn");
      if (!btn) return;
      const r = document.createElement("span");
      r.className = "ripple";
      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      r.style.width = r.style.height = size + "px";
      r.style.left = (e.clientX - rect.left - size / 2) + "px";
      r.style.top = (e.clientY - rect.top - size / 2) + "px";
      btn.appendChild(r);
      setTimeout(() => r.remove(), 600);
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  // Accesorios SVG
  function Hat() {
    if (state.hat === "cap")
      return <ellipse cx="250" cy="90" rx="80" ry="40" fill="#8a6ad6" className="hat floatUp" />;
    if (state.hat === "crown")
      return <path d="M190 105 L310 105 L290 60 L250 105 L210 60 Z" fill="#f7d34e" className="hat twinkle" />;
    if (state.hat === "beanie")
      return <ellipse cx="250" cy="100" rx="85" ry="45" fill="#ffa6c9" className="hat floatUp" />;
    return null;
  }
  function Glasses() {
    if (state.glasses === "round")
      return (
        <g className="glasses">
          <circle cx="210" cy="160" r="16" />
          <circle cx="290" cy="160" r="16" />
          <line x1="226" y1="160" x2="274" y2="160" />
        </g>
      );
    if (state.glasses === "star")
      return (
        <g className="glasses">
          <path d={starPath(210, 160, 5, 16, 7)} />
          <path d={starPath(290, 160, 5, 16, 7)} />
        </g>
      );
    return null;
  }
  function ScarfOrBackpack() {
    if (state.scarf === "scarf")
      return (
        <g className="scarf">
          <rect x="210" y="220" width="80" height="18" rx="9" />
          <rect x="290" y="220" width="18" height="40" rx="9" />
        </g>
      );
    if (state.scarf === "backpack")
      return <rect x="160" y="185" width="60" height="70" rx="14" className="backpack" />;
    return null;
  }

  return (
    <div className="mochitech-root">
      {/* Música y SFX (usa el mismo mp3 para un “chomp” leve) */}
      <audio ref={musicRef} src={MUSIC_URL} preload="auto" />
      <audio ref={chompRef} src={MUSIC_URL} preload="auto" />

      {/* Fondo flotante */}
      <div className="floating-container" ref={floatingContainerRef} aria-hidden="true" />

      <header className="header">
        <div className="wrap flex">
          <div className="brand">
            <img
              alt="Logo Mochitech"
              width={130}
              height={130}
              src="https://mochitech-app.vercel.app/logo.png"
              style={{ filter: "drop-shadow(0 4px 8px #0001)" }}
            />
            <h1 className="brandTitle">
            <span className="brandName">{state.name}</span>
            <span className="subtitle">Sabor que da vida</span>
          </h1>


          </div>
          <div className="controls">
            <button className="btn" onClick={handlePlayMusic} aria-label="Reproducir música">▶ Música</button>
            <button className="btn secondary" onClick={handleMuteMusic} aria-label="Silenciar o activar música">🔇 Silenciar</button>
            <button className="btn ghost" onClick={saveState}>💾 Guardar</button>
            <button
              className="btn ghost"
              onClick={() => { localStorage.removeItem(storageKey); window.location.reload(); }}
            >
              🧼 Reiniciar
            </button>
          </div>
        </div>
      </header>

      <main className="wrap">
        <section className="hero card reveal">
          <div className="left">
            <div className="pet-stage" ref={petStageRef}>
              {/* Mascota (SVG) */}
              <svg id="petSvg" viewBox="0 0 500 360" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Mascota Mochitechito">
                <defs>
                  <radialGradient id="bodyG" cx="50%" cy="40%" r="65%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                    <stop offset="100%" stopColor="#d9c6ff" />
                  </radialGradient>
                </defs>
                <g id="pet" ref={petGroupRef}>
                  {/* cuerpo */}
                  <circle cx="250" cy="160" r="130" fill="url(#bodyG)" />
                  <ellipse cx="250" cy="200" rx="120" ry="80" fill="#f8d5e7" opacity=".95" />
                  <circle cx="210" cy="110" r="26" fill="#ffffff" opacity=".7" />
                  {/* ojos */}
                  <g ref={eyeLRef} className="eye" transform="translate(0,0)">
                    <circle cx="210" cy="160" r="8" />
                  </g>
                  <g ref={eyeRRef} className="eye" transform="translate(0,0)">
                    <circle cx="290" cy="160" r="8" />
                  </g>
                  {/* mejillas */}
                  <g className="cheek">
                    <circle cx="190" cy="170" r="10" />
                  </g>
                  <g className="cheek">
                    <circle cx="310" cy="170" r="10" />
                  </g>
                  {/* boca */}
                  <path ref={mouthRef} d="M180 200 Q250 230 320 200" className="mouth" />

                  {/* Accesorios */}
                  <Hat />
                  <Glasses />
                  <ScarfOrBackpack />
                </g>
              </svg>

              {/* Globo de texto */}
              <div id="speech" ref={speechRef} className="pop">
                ¡Hola! Soy <b>{state.name}</b> 💜
              </div>
            </div>

            <div className="flex energyRow">
              <div className="energy-bar" aria-label="Barra de energía" title="Energía">
                <div id="energyFill" ref={energyFillRef} style={{ width: state.energy + "%" }} />
                <span className="shine" aria-hidden="true" />
              </div>
              <strong className="energyTxt">{state.energy}%</strong>
              <button className="btn" onClick={feed}>🍡 Alimentar</button>
            </div>
          </div>

          <div className="right">
            <h2 className="gradientText">Personaliza a Mochitechito</h2>
            <div className="customizer">
              <label htmlFor="petName">Nombre</label>
              <input
                id="petName"
                type="text"
                value={state.name}
                onChange={(e) => setState((s) => ({ ...s, name: e.target.value || "Mochitechito" }))}
                placeholder="Mochi, Luna, Kira..."
              />

              <label htmlFor="hat">Sombrero</label>
              <select id="hat" value={state.hat} onChange={(e) => setState((s) => ({ ...s, hat: e.target.value }))}>
                <option value="none">Sin sombrero</option>
                <option value="cap">Gorra</option>
                <option value="crown">Corona</option>
                <option value="beanie">Gorro</option>
              </select>

              <label htmlFor="glasses">Gafas</label>
              <select id="glasses" value={state.glasses} onChange={(e) => setState((s) => ({ ...s, glasses: e.target.value }))}>
                <option value="none">Sin gafas</option>
                <option value="round">Redondas</option>
                <option value="star">Estrellas</option>
              </select>

              <label htmlFor="scarf">Bufanda/Mochila</label>
              <select id="scarf" value={state.scarf} onChange={(e) => setState((s) => ({ ...s, scarf: e.target.value }))}>
                <option value="none">Ninguno</option>
                <option value="scarf">Bufanda</option>
                <option value="backpack">Mochila</option>
              </select>
            </div>

            <div className="flex" style={{ marginTop: 20 }}>
              <button className="btn secondary" onClick={celebrate}>✨ Animación especial</button>
              <button className="btn ghost" onClick={() => speak("¡Sigue cuidándote! Come bien y muévete cada día.")}>
                🗣 Decir consejo
              </button>
            </div>

            <p className="tiny" style={{ marginTop: 20 }}>
              Voz integrada del navegador, música instrumental suave al entrar.
            </p>
          </div>
        </section>

        <section className="card about reveal">
          <div className="about-text">
            <h2>¿Qué es Mochitech?</h2>
            <p>
              Mochitech une nutrición y tecnología para combatir la anemia de forma divertida.
              Con una mascota virtual personalizable, consejos breves y una calculadora de consumo,
              motivamos buenos hábitos diarios que favorecen la absorción de hierro.
            </p>
          </div>
          <div className="about-img">
            <img src="https://i.ibb.co/VptQy80S/Whats-App-Image-2025-08-13-at-8-37-14-PM.jpg" alt="Mascota Mochitechito" />
          </div>
        </section>

        <section className="card about-team reveal">
  <h2>Sobre nosotros — IEP EL TRIUNFO</h2>
  <p>
    Proyecto realizado por estudiantes del colegio <strong>IEP EL TRIUNFO</strong>. 
    Equipo responsable del proyecto:
  </p>

  <div className="team-grid" role="list">
  {team.map((m, i) => {
    const initials = m.name
      .split(" ")
      .map(n => n[0] || "")
      .slice(0, 2)
      .join("")
      .toUpperCase();
    return (
      <article
        key={i}
        className="member-card"
        role="listitem"
        aria-label={`Integrante ${m.name}`}
        style={{ ["--delay"]: `${i * 0.12}s` }} // stagger: 0.12s entre tarjetas
      >
        <div className="avatar" aria-hidden="true" style={{ ["--a-delay"]: `${i * 0.08}s` }}>
          {initials}
        </div>
        <h3>{m.name}</h3>
        <p className="role">{m.role}</p>
      </article>
    );
  })}
</div>


  <p className="tiny" style={{ marginTop: 12 }}>
    Agradecimientos a los docentes y a la comunidad del colegio por su apoyo.
  </p>
</section>


        <section className="card reveal">
          <h2>Plan de Consumo</h2>
          <p>
            Ingresa tu <b>edad</b>, <b>peso</b> y tu <b>hemoglobina estimada</b> (g/dL).
            Te sugerimos una cantidad orientativa de mochis. <span className="tiny">(No sustituye consejo médico).</span>
          </p>

          <div className="two-col grid">
            <div className="grid inputs">
              <label>
                Edad (años)
                <input type="number" min="1" max="99" value={ageInput} onChange={(e) => setAgeInput(e.target.value)} placeholder="10" />
              </label>
              <label>
                Peso (kg)
                <input type="number" min="5" max="200" value={weightInput} onChange={(e) => setWeightInput(e.target.value)} placeholder="35" />
              </label>
              <label>
                Hemoglobina (g/dL)
                <input
                  type="number"
                  step="0.1"
                  min="5"
                  max="20"
                  value={hbInput}
                  onChange={(e) => setHbInput(e.target.value)}
                  placeholder="11.5"
                />
              </label>
              <button className="btn" onClick={handleCalc}>📈 Calcular</button>
            </div>

            <div className="card result-card">
              <h3>Resultado</h3>
              <p className="calcText" style={{ whiteSpace: "pre-wrap" }}>{calcResult}</p>
              <p className="tiny">Mochitechito leerá el resultado en voz alta 💬</p>
            </div>
          </div>
        </section>

        <section className="card reveal">
          <h2>Receta: Mochitech Power Berry</h2>
          <div className="two-col grid">
            <div>
              <h3>Ingredientes</h3>
              <ul className="cute">
                <li>1 taza de arándanos (hierro + antioxidantes)</li>
                <li>1 taza de fresas (vitamina C)</li>
                <li>1 taza de mango (vitamina C y A)</li>
                <li>2 cdas de harina de arroz o avena fina</li>
                <li>1 cda de semillas de chía molidas</li>
                <li>Miel o panela al gusto</li>
              </ul>
            </div>
            <div>
              <h3>Pasos</h3>
              <ol className="recipe">
                <li>Tritura las frutas y cocina a fuego bajo con la miel/panela.</li>
                <li>Incorpora harina y chía hasta espesar. Enfría.</li>
                <li>Forma bolitas y reboza ligeramente con harina fina.</li>
                <li>Rellena con puré de fruta si deseas centro jugoso.</li>
                <li>Sirve frío. ¡Listo para energizar a Mochitechito!</li>
              </ol>
            </div>
          </div>
        </section>

        <section className="card reveal">
          <h2>Consejos contra la anemia</h2>
          <ul className="cute tipsList" id="tipsList" aria-live="polite">
            {tips.map((t, i) => (
              <li key={i} className={i === tipIndex ? "tip active" : "tip"} onClick={() => { setTipIndex(i); speak(t); }}>
                {t}
              </li>
            ))}
          </ul>
          <div className="flex" style={{ marginTop: 10 }}>
            <button className="btn" onClick={() => setTipIndex((i) => (i + 1) % tips.length)}>💡 Siguiente consejo</button>
            <button className="btn secondary" onClick={() => speak(tips[tipIndex])}>🔊 Leer en voz alta</button>
          </div>
        </section>


        <footer className="site-footer">
                <div className="wrap">
               <p>© 2025 Mochitech - IEP EL TRIUNFO <span className="muted">Proyecto desarrollado en React.</span></p>
        </div>
      </footer>

      </main>
    </div>
  );
}

// ==== Intersection reveal (suave) ====
if (typeof window !== "undefined") {
  const runReveal = () => {
    const els = document.querySelectorAll(".reveal");
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          e.target.style.setProperty("--reveal-delay", (Math.random() * 0.2 + 0.05) + "s");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.15 });
    els.forEach(el => io.observe(el));
  };
  if (document.readyState !== "loading") runReveal();
  else document.addEventListener("DOMContentLoaded", runReveal, { once: true });
}