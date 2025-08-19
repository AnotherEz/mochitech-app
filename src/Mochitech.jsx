import React, { useEffect, useRef, useState } from 'react';
import * as PIXI from 'pixi.js';
import { Howl } from 'howler';
import { gsap } from 'gsap';
import './App.css';

// React conversion and modernization of the original HTML file.
// - Default export is the component Mochitech
// - Install required packages: npm install pixi.js howler gsap

export default function Mochitech() {
  // Refs for DOM elements and PIXI/app containers
  const petCanvasHolderRef = useRef(null);
  const floatingContainerRef = useRef(null);
  const speechRef = useRef(null);
  const energyFillRef = useRef(null);

  // PIXI refs
  const appRef = useRef(null);
  const faceRef = useRef(null);
  const eyeLRef = useRef(null);
  const eyeRRef = useRef(null);
  const mouthRef = useRef(null);
  const cheeksRef = useRef(null);
  const hatRef = useRef(null);
  const glassesRef = useRef(null);
  const scarfRef = useRef(null);
  const backpackRef = useRef(null);

  // Audio refs
  const musicRef = useRef(null);
  const chompRef = useRef(null);

  // Component state
  const [state, setState] = useState({
    name: 'Mochitechito',
    energy: 0,
    hat: 'none',
    glasses: 'none',
    scarf: 'none',
  });

  const storageKey = 'mochitech_state_v1';

  // Tips
  const tips = [
    'Combina hierro con vitamina C para absorberlo mejor.',
    'Evita café o té justo después de comer.',
    'Incluye legumbres, sangrecita, hígado o espinaca en tus comidas.',
    'Añade frutas cítricas como naranja o mandarina.',
    'Mantén horarios regulares de comida e hidratación.',
  ];
  const [tipIndex, setTipIndex] = useState(0);

  // Utilities
  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  function speak(text) {
    if (!('speechSynthesis' in window)) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'es-ES';
    u.rate = 1.02;
    u.pitch = 1.05;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }

  function setSpeech(text) {
    if (!speechRef.current) return;
    speechRef.current.innerHTML = text;
    try {
      gsap.fromTo(
        speechRef.current,
        { scale: 0.95, opacity: 0.6 },
        { scale: 1, opacity: 1, duration: 0.35, ease: 'back.out(2)' }
      );
    } catch (e) {}
  }

  // Save/load state
  function saveState() {
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
      sparkle();
      setSpeech('¡Progreso guardado! 💾');
    } catch (e) {
      console.warn(e);
    }
  }
  function loadState() {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        setState((s) => ({ ...s, ...parsed }));
      }
    } catch (e) {
      console.warn(e);
    }
  }

  // PIXI helpers
  function drawStarPoints(cx, cy, spikes, outerRadius, innerRadius) {
    const pts = [];
    let rot = (Math.PI / 2) * 3;
    const step = Math.PI / spikes;
    for (let i = 0; i < spikes; i++) {
      pts.push(cx + Math.cos(rot) * outerRadius, cy + Math.sin(rot) * outerRadius);
      rot += step;
      pts.push(cx + Math.cos(rot) * innerRadius, cy + Math.sin(rot) * innerRadius);
      rot += step;
    }
    return pts;
  }

  function ensureAccessoryContainers() {
    const app = appRef.current;
    if (!app) return false;
    if (!hatRef.current) {
      hatRef.current = new PIXI.Container();
      app.stage.addChild(hatRef.current);
    }
    if (!glassesRef.current) {
      glassesRef.current = new PIXI.Container();
      app.stage.addChild(glassesRef.current);
    }
    if (!scarfRef.current) {
      scarfRef.current = new PIXI.Container();
      app.stage.addChild(scarfRef.current);
    }
    if (!backpackRef.current) {
      backpackRef.current = new PIXI.Container();
      app.stage.addChild(backpackRef.current);
    }
    return true;
  }

  function initPixi() {
    if (typeof PIXI === 'undefined') {
      setSpeech('Error: motor gráfico no disponible (PIXI).');
      console.error('PIXI not found');
      return;
    }
    const holder = petCanvasHolderRef.current;
    if (!holder) return;

    try {
      // Destroy previous app if exists
      if (appRef.current && typeof appRef.current.destroy === 'function') {
        try {
          appRef.current.destroy(true, { children: true, texture: true, baseTexture: true });
        } catch (e) {
          console.warn('app.destroy failed', e);
        }
        appRef.current = null;
      }

      const app = new PIXI.Application({ backgroundAlpha: 0, resizeTo: holder, antialias: true });
      appRef.current = app;

      // Remove existing canvas inside holder (if any) and append
      const existingCanvas = holder.querySelector('canvas');
      if (existingCanvas) existingCanvas.remove();
      holder.appendChild(app.view);

      // draw body
      const w = app.renderer?.width ?? 0;
      const h = app.renderer?.height ?? 0;
      const centerX = w / 2;
      const centerY = h / 2 - 20;

      const body = new PIXI.Graphics();
      body.beginFill(0xd9c6ff).drawCircle(centerX, centerY, Math.min(w, h) * 0.26).endFill();
      const belly = new PIXI.Graphics();
      belly.beginFill(0xf8d5e7).drawEllipse(centerX, centerY + 40, Math.min(w, h) * 0.24, Math.min(w, h) * 0.16).endFill();
      const shine = new PIXI.Graphics();
      shine.beginFill(0xffffff, 0.7).drawCircle(centerX - 40, centerY - 50, 26).endFill();

      const eyeOffset = Math.min(w, h) * 0.06;
      const eyeL = new PIXI.Graphics();
      eyeL.beginFill(0x000000).drawCircle(centerX - eyeOffset, centerY - 20, 8).endFill();
      const eyeR = new PIXI.Graphics();
      eyeR.beginFill(0x000000).drawCircle(centerX + eyeOffset, centerY - 20, 8).endFill();
      const mouth = new PIXI.Graphics();
      mouth
        .lineStyle(5, 0x000000, 1)
        .moveTo(centerX - 35, centerY + 10)
        .quadraticCurveTo(centerX, centerY + 30, centerX + 35, centerY + 10);
      const cheeks = new PIXI.Graphics();
      cheeks
        .beginFill(0xff8fb3, 0.5)
        .drawCircle(centerX - 60, centerY - 5, 10)
        .drawCircle(centerX + 60, centerY - 5, 10)
        .endFill();

      const face = new PIXI.Container();
      face.addChild(body, belly, shine, eyeL, eyeR, mouth, cheeks);
      app.stage.addChild(face);

      faceRef.current = face;
      eyeLRef.current = eyeL;
      eyeRRef.current = eyeR;
      mouthRef.current = mouth;
      cheeksRef.current = cheeks;

      ensureAccessoryContainers();

      // wiggle animation
      try {
        gsap.to(app.stage, { y: '+=6', duration: 1.6, yoyo: true, repeat: -1, ease: 'sine.inOut' });
        gsap.to(face.scale, { x: 1.02, y: 0.98, duration: 1.6, yoyo: true, repeat: -1, ease: 'sine.inOut' });
      } catch (e) {}

      drawAccessories();
    } catch (err) {
      console.error('initPixi error', err);
      setSpeech('Error inicializando la mascota.');
    }
  }

  function drawAccessories() {
    const app = appRef.current;
    // Guardas extra: solo dibuja si app y renderer están listos
    if (!app || !app.renderer) return;
    ensureAccessoryContainers();

    [hatRef.current, glassesRef.current, scarfRef.current, backpackRef.current].forEach((c) => {
      if (c && typeof c.removeChildren === 'function') c.removeChildren();
    });

    const centerX = app.renderer.width / 2;
    const centerY = app.renderer.height / 2 - 20;

    // Hats
    if (state.hat === 'cap') {
      const h = new PIXI.Graphics();
      h.beginFill(0x8a6ad6).drawEllipse(centerX, centerY - 90, 80, 40).endFill();
      hatRef.current.addChild(h);
    } else if (state.hat === 'crown') {
      const c = new PIXI.Graphics();
      c
        .beginFill(0xf7d34e)
        .drawPolygon([
          centerX - 60,
          centerY - 75,
          centerX + 60,
          centerY - 75,
          centerX + 30,
          centerY - 110,
          centerX,
          centerY - 75,
          centerX - 30,
          centerY - 110,
        ])
        .endFill();
      hatRef.current.addChild(c);
    } else if (state.hat === 'beanie') {
      const b = new PIXI.Graphics();
      b.beginFill(0xffa6c9).drawEllipse(centerX, centerY - 80, 85, 45).endFill();
      hatRef.current.addChild(b);
    }

    // Glasses
    if (state.glasses === 'round') {
      const gl = new PIXI.Graphics();
      gl.lineStyle(5, 0x000000)
        .drawCircle(centerX - 40, centerY - 20, 16)
        .drawCircle(centerX + 40, centerY - 20, 16)
        .moveTo(centerX - 24, centerY - 20)
        .lineTo(centerX + 24, centerY - 20);
      glassesRef.current.addChild(gl);
    } else if (state.glasses === 'star') {
      const s = new PIXI.Graphics();
      s
        .beginFill(0x000000)
        .drawPolygon(drawStarPoints(centerX - 40, centerY - 20, 5, 16, 7))
        .drawPolygon(drawStarPoints(centerX + 40, centerY - 20, 5, 16, 7))
        .endFill();
      glassesRef.current.addChild(s);
    }

    // Scarf / Backpack
    if (state.scarf === 'scarf') {
      const sc = new PIXI.Graphics();
      sc.beginFill(0xff8fb3).drawRect(centerX - 40, centerY + 40, 80, 18).drawRect(centerX + 20, centerY + 40, 18, 40).endFill();
      scarfRef.current.addChild(sc);
    } else if (state.scarf === 'backpack') {
      const bp = new PIXI.Graphics();
      bp.beginFill(0x7cc4ff).drawRoundedRect(centerX - 90, centerY - 10, 60, 70, 14).endFill();
      backpackRef.current.addChild(bp);
    }
  }

  // Small animations
  function blink() {
    try {
      if (!eyeLRef.current || !eyeRRef.current) return;
      if (eyeLRef.current.scale) eyeLRef.current.scale.y = 0.2;
      if (eyeRRef.current.scale) eyeRRef.current.scale.y = 0.2;
      setTimeout(() => {
        if (eyeLRef.current.scale) eyeLRef.current.scale.y = 1;
        if (eyeRRef.current.scale) eyeRRef.current.scale.y = 1;
      }, 220);
    } catch (e) {
      console.warn(e);
    }
  }

  function smile() {
    try {
      if (!mouthRef.current || !appRef.current || !appRef.current.renderer) return;
      mouthRef.current.clear();
      mouthRef.current
        .lineStyle(5, 0x000000)
        .moveTo(appRef.current.renderer.width * 0.25, appRef.current.renderer.height * 0.45)
        .quadraticCurveTo(
          appRef.current.renderer.width * 0.5,
          appRef.current.renderer.height * 0.55,
          appRef.current.renderer.width * 0.75,
          appRef.current.renderer.height * 0.45
        );
      setTimeout(() => {
        drawAccessories();
      }, 800);
    } catch (e) {
      console.warn(e);
    }
  }

  function sleep() {
    setSpeech('Zzz... 😴');
    try {
      if (faceRef.current) gsap.to(faceRef.current, { alpha: 0.85, duration: 0.6, yoyo: true, repeat: 1 });
    } catch (e) {}
  }

  function sparkle() {
    for (let i = 0; i < 12; i++) {
      const d = document.createElement('div');
      d.className = 'floaty star';
      d.style.left = 10 + Math.random() * 80 + '%';
      d.style.top = 10 + Math.random() * 60 + '%';
      const iel = document.createElement('i');
      d.appendChild(iel);
      document.body.appendChild(d);
      try {
        gsap.to(d, { y: -80, opacity: 0, duration: 1 + Math.random(), onComplete: () => d.remove() });
      } catch (e) {
        setTimeout(() => d.remove(), 1000);
      }
    }
  }

  function celebrate() {
    try {
      if (faceRef.current) gsap.to(faceRef.current, { rotation: 0.05, yoyo: true, repeat: 7, duration: 0.1 });
    } catch (e) {}
    sparkle();
  }

  function ultraCelebrate() {
    try {
      if (faceRef.current && faceRef.current.scale) gsap.to(faceRef.current.scale, { x: 1.08, y: 1.08, duration: 0.3, yoyo: true, repeat: 3 });
    } catch (e) {}
    setSpeech('¡Nivel de energía máximo! ¡Eres grandios@! ✨');
    speak('¡Nivel de energía máximo! ¡Eres grandioso!');
  }

  // Feed
  function feed() {
    const holder = petCanvasHolderRef.current?.parentElement; // pet-stage is the parent of the holder
    if (!holder) return;
    const mochi = document.createElement('div');
    mochi.textContent = '🍡';
    mochi.style.position = 'absolute';
    mochi.style.fontSize = '40px';
    mochi.style.left = '10px';
    mochi.style.bottom = '10px';
    holder.appendChild(mochi);

    try {
      gsap.to(mochi, {
        duration: 1.2,
        x: 270,
        y: -210,
        ease: 'power1.inOut',
        onComplete: () => {
          chompRef.current && chompRef.current.play && chompRef.current.play();
          mochi.remove();
          setState((s) => {
            const newEnergy = clamp(s.energy + 10, 0, 100);
            const phrases = [
              '¡Gracias por darme energía! 💪',
              '¡Yum! Mochi power 🍡',
              'Recuerda comer frutas ricas en hierro 🍓',
              '¡Sigue así! Tu cuerpo te lo agradece ✨',
            ];
            const msg = phrases[Math.floor(Math.random() * phrases.length)];
            setSpeech(msg);
            speak(msg);
            if (newEnergy >= 50) celebrate();
            if (newEnergy >= 90) ultraCelebrate();
            return { ...s, energy: newEnergy };
          });
        },
      });
    } catch (e) {
      mochi.remove();
      console.warn(e);
    }
  }

  // Calculation plan
  function calcPlan(ageVal, weightVal, hbVal) {
    const age = parseFloat(ageVal || '0');
    const weight = parseFloat(weightVal || '0');
    const hb = parseFloat(hbVal || '0');
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
      `Recomendación estimada: \n${perDay} mochi(s) al día (≈ ${perWeek} a la semana).` +
      (hb ? ` Con Hb ${hb} g/dL, te sugerimos cuidar la combinación hierro + vitamina C y consultar con un profesional de salud.` : '');
    setSpeech('Con esta cantidad, pronto te sentirás con más energía.');
    speak('Con esta cantidad, pronto te sentirás con más energía.');
    return text;
  }

  // Tips management
  function nextTip() {
    setTipIndex((i) => (i + 1) % tips.length);
  }

  // Floating mascot creation (background)
  useEffect(() => {
    const container = floatingContainerRef.current;
    if (!container) return;
    let intervalId = null;
    function createMascot() {
      const mascot = document.createElement('div');
      mascot.classList.add('floating');
      mascot.style.left = Math.random() * 100 + 'vw';
      let size = 60 + Math.random() * 60;
      mascot.style.width = size + 'px';
      mascot.style.height = size + 'px';
      mascot.style.animationDuration = 15 + Math.random() * 10 + 's';
      mascot.style.animationDelay = Math.random() * 5 + 's';
      container.appendChild(mascot);
      setTimeout(() => mascot.remove(), 25000);
    }
    intervalId = setInterval(createMascot, 1500);
    return () => clearInterval(intervalId);
  }, []);

  // Initialize audio and PIXI on mount
  useEffect(() => {
    // Replace URLs with license-safe tracks in production
    const MUSIC_URL =
      'https://soundcloud.com/daniel-sullon-491393094/make_it_right?si=fbc34ea13df94e238fab0c9055b43973&utm_source=clipboard&utm_medium=text&utm_campaign=social_sharing';
    const CHOMP_URL = MUSIC_URL;

    try {
      musicRef.current = new Howl({ src: [MUSIC_URL], loop: true, volume: 0.35, html5: true });
      chompRef.current = new Howl({ src: [CHOMP_URL], volume: 0.6 });
    } catch (e) {
      console.warn('Howler init failed', e);
    }

    loadState();
    initPixi();

    // cleanup PIXI on unmount
    return () => {
      try {
        if (appRef.current && typeof appRef.current.destroy === 'function') {
          appRef.current.destroy(true, { children: true, texture: true, baseTexture: true });
        }
      } catch (e) {
        console.warn(e);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // re-draw accessories when state changes (hat/glasses/scarf) and update energy bar
  useEffect(() => {
    if (appRef.current && appRef.current.renderer) {
      drawAccessories();
    }
    if (energyFillRef.current) {
      energyFillRef.current.style.width = state.energy + '%';
    }
  }, [state.hat, state.glasses, state.scarf, state.energy]);

  // Exposed small handlers for buttons in JSX
  function handlePlayMusic() {
    if (musicRef.current) musicRef.current.play();
  }
  function handleMuteMusic() {
    if (musicRef.current) {
      // toggle mute (Howler keeps internal state; .mute() accepts boolean)
      const currentlyMuted = !!musicRef.current._muted;
      musicRef.current.mute(!currentlyMuted);
    }
  }

  // Local controlled inputs
  const [ageInput, setAgeInput] = useState('');
  const [weightInput, setWeightInput] = useState('');
  const [hbInput, setHbInput] = useState('');
  const [calcResult, setCalcResult] = useState('—');

  function handleCalc() {
    const result = calcPlan(ageInput, weightInput, hbInput);
    setCalcResult(result);
  }

  // Save state effect when state changes (auto-save optional)
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
    } catch (e) {}
  }, [state]);

  return (
    <div className="mochitech-root">
      <div className="floating-container" ref={floatingContainerRef} />

      <header className="header">
        <div className="wrap flex">
          <div className="brand">
            <img
              alt="Logo mochi"
              width={130}
              height={130}
              src="https://i.ibb.co/s9gQGMbR/Whats-App-Image-2025-08-13-at-8-37-13-PM.jpg"
              style={{ filter: 'drop-shadow(0 4px 8px #0001)' }}
            />
            <h1>
              Mochitech <span className="subtitle">Sabor que da vida</span>
            </h1>
          </div>

          <div className="controls">
            <button className="btn" onClick={handlePlayMusic}>
              ▶ Música
            </button>
            <button className="btn secondary" onClick={handleMuteMusic}>
              🔇 Silenciar
            </button>
            <button className="btn ghost" onClick={saveState}>
              💾 Guardar
            </button>
            <button
              className="btn ghost"
              onClick={() => {
                localStorage.removeItem(storageKey);
                window.location.reload();
              }}
            >
              🧼 Reiniciar
            </button>
          </div>
        </div>
      </header>

      <main className="wrap">
        <section className="hero card">
          <div className="left">
            <div id="pet-stage" className="pet-stage">
              <div id="pet-canvas-holder" ref={petCanvasHolderRef} style={{ position: 'absolute', inset: 0 }} />
              <div id="speech" ref={speechRef}>
                ¡Hola! Soy <b id="petNameInline">{state.name}</b> 💜
              </div>
            </div>

            <div className="flex" style={{ marginTop: 16 }}>
              <div className="energy-bar" style={{ flex: 1 }}>
                <div id="energyFill" ref={energyFillRef} style={{ width: `${state.energy}%` }} />
              </div>
              <strong id="energyText">Energía: {state.energy}%</strong>
              <button className="btn" onClick={feed}>
                🍡 Alimentar
              </button>
            </div>
          </div>

          <div className="right">
            <h2>Personaliza a Mochitechito</h2>
            <div className="customizer">
              <label htmlFor="petName">Nombre</label>
              <input
                id="petName"
                value={state.name}
                onChange={(e) => setState((s) => ({ ...s, name: e.target.value || 'Mochitechito' }))}
                type="text"
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
              <button className="btn secondary" onClick={celebrate}>
                ✨ Animación especial
              </button>
              <button className="btn ghost" onClick={() => speak('¡Sigue cuidándote! Come bien y muévete cada día.')}>
                🗣️ Decir consejo
              </button>
            </div>

            <p className="tiny" style={{ marginTop: 20 }}>
              Frases con SpeechSynthesis. Música: reemplaza la URL por una versión libre de derechos.
            </p>
          </div>
        </section>

        <section className="card about">
          <div className="about-text">
            <h2>¿Qué es Mochitech?</h2>
            <p>
              Mochitech es una iniciativa que combina nutrición y tecnología para combatir la anemia de forma divertida y educativa.
              Mediante una mascota virtual personalizable y consejos de salud, buscamos motivar a niños, adolescentes y jóvenes a mantener
              buenos hábitos alimenticios.
            </p>
          </div>
          <div className="about-img">
            <img src="https://i.ibb.co/VptQy80S/Whats-App-Image-2025-08-13-at-8-37-14-PM.jpg" alt="Mascota" />
          </div>
        </section>

        <section className="card">
          <h2>Plan de Consumo</h2>
          <p>
            Ingresa tu <b>edad</b>, <b>peso</b> y una <b>hemoglobina estimada</b> (g/dL). Te sugerimos una cantidad orientativa de mochis. <span className="tiny">(No sustituye consejo médico).</span>
          </p>

          <div className="two-col grid">
            <div className="grid inputs">
              <label>
                Edad (años) <input id="age" type="number" min="1" max="99" value={ageInput} onChange={(e) => setAgeInput(e.target.value)} placeholder="10" />
              </label>
              <label>
                Peso (kg) <input id="weight" type="number" min="5" max="200" value={weightInput} onChange={(e) => setWeightInput(e.target.value)} placeholder="35" />
              </label>
              <label>
                Hemoglobina (g/dL) <input id="hb" type="number" step="0.1" min="5" max="20" value={hbInput} onChange={(e) => setHbInput(e.target.value)} placeholder="11.5" />
              </label>
              <button className="btn" id="calcBtn" onClick={handleCalc}>
                📈 Calcular
              </button>
            </div>

            <div className="card result-card">
              <h3 id="calcTitle">Resultado</h3>
              <p id="calcText" style={{ whiteSpace: 'pre-wrap' }}>
                {calcResult}
              </p>
              <p id="calcVoice" className="tiny">
                Mochitechito dirá tu resultado en voz alta 💬
              </p>
            </div>
          </div>
        </section>

        <section className="card">
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

        <section className="card">
          <h2>Consejos contra la anemia</h2>
          <ul className="cute" id="tipsList">
            {tips.map((t, i) => (
              <li key={i}>
                {i === tipIndex ? '⭐ ' : ''}
                {t}
              </li>
            ))}
          </ul>
          <div className="flex" style={{ marginTop: 10 }}>
            <button className="btn" id="nextTip" onClick={nextTip}>
              💡 Siguiente consejo
            </button>
            <button className="btn secondary" id="sayTip" onClick={() => speak(tips[tipIndex])}>
              🔊 Leer en voz alta
            </button>
          </div>
        </section>

        <section className="card">
          <h2>Mascota Virtual Interactiva</h2>
          <div className="flex">
            <button className="btn" id="blinkBtn" onClick={blink}>
              👀 Parpadear
            </button>
            <button className="btn" id="happyBtn" onClick={smile}>
              😊 Sonrisa
            </button>
            <button className="btn" id="sleepBtn" onClick={sleep}>
              😴 Dormir
            </button>
          </div>
        </section>

        <footer>
          <p className="tiny">
            © 2025 Mochitech. Música: usa una versión instrumental libre de derechos o una pista propia inspirada en "Make It Right" (BTS). Sustituye la URL en el código según corresponda.
          </p>
        </footer>
      </main>
    </div>
  );
}
