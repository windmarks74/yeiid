/* Shared building blocks. Reads icons from window. */
(function () {
  const { useState } = React;

  /* ---------------- Spec data (real KR ID-photo regulations) ---------------- */
  const SPECS = {
    passport: {
      label: '여권',
      icon: 'IconPassport',
      sizeMM: '35 × 45 mm',
      px: '413 × 531 px',
      dpi: '300 DPI',
      headPct: [0.70, 0.80],          // chin-to-crown as share of photo height
      bgRule: '흰색·균일 배경',
      bgColors: ['#FFFFFF', '#F4F5F7'],
      strict: true,
      notes: [
        '얼굴(정수리~턱) 높이가 사진의 70~80%',
        '정면 응시 · 무표정 · 입 다물기',
        '안경 반사·컬러렌즈·모자 금지',
        '보정·필터·미백 금지 (원본 그대로)',
      ],
    },
    license: {
      label: '운전면허',
      icon: 'IconCard',
      sizeMM: '35 × 45 mm',
      px: '413 × 531 px',
      dpi: '300 DPI',
      headPct: [0.65, 0.80],
      bgRule: '흰색·하늘색·옅은 회색',
      bgColors: ['#FFFFFF', '#DCEAF7', '#EDEFF2'],
      strict: false,
      notes: [
        '최근 6개월 이내 촬영',
        '얼굴이 정면을 향하도록',
        '가벼운 색보정 허용',
      ],
    },
    general: {
      label: '일반증명',
      icon: 'IconUser',
      sizeMM: '30 × 40 mm',
      px: '354 × 472 px',
      dpi: '300 DPI',
      headPct: [0.60, 0.75],
      bgRule: '자유 (흰색·하늘색·핑크 등)',
      bgColors: ['#FFFFFF', '#DCEAF7', '#F6E3EC', '#E7F3EC', '#EDEFF2'],
      strict: false,
      notes: [
        '이력서·학생증·자격증 범용',
        '배경색·보정 자유롭게',
      ],
    },
  };

  /* ---------------- Portrait placeholder (the “photo”) ---------------- */
  // Renders a studio-style head&shoulders subject reacting to bg / zoom /
  // brightness / warmth / smoothing, with optional regulation guides.
  function Portrait({
    bg = '#FFFFFF', zoom = 1, brightness = 1, warmth = 0, smooth = 0,
    guides = false, headPct = [0.7, 0.8], offsetY = 0, style = {},
  }) {
    const warmOverlay = warmth > 0 ? warmth / 100 : 0;
    const coolOverlay = warmth < 0 ? -warmth / 100 : 0;
    const filter = `brightness(${brightness}) saturate(${1 + warmth/400}) ${smooth ? `blur(0px) contrast(${1 - smooth/600})` : ''}`;

    return (
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: bg, ...style }}>
        {/* studio vignette */}
        <div style={{ position: 'absolute', inset: 0,
          background: `radial-gradient(120% 80% at 50% 12%, rgba(255,255,255,0.5), transparent 60%)` }} />
        {/* subject */}
        <div style={{ position: 'absolute', left: '50%', bottom: 0,
          width: '100%', transform: `translateX(-50%) translateY(${offsetY}px) scale(${zoom})`,
          transformOrigin: '50% 38%', filter, transition: 'transform .12s ease, filter .15s ease' }}>
          <svg viewBox="0 0 200 230" width="100%" style={{ display: 'block' }} preserveAspectRatio="xMidYMax meet">
            <defs>
              <radialGradient id="skin" cx="50%" cy="40%" r="62%">
                <stop offset="0%" stopColor="#F6D2BC"/>
                <stop offset="62%" stopColor="#EBBD9E"/>
                <stop offset="100%" stopColor="#D6A084"/>
              </radialGradient>
              <linearGradient id="hair" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3B3230"/>
                <stop offset="100%" stopColor="#241D1C"/>
              </linearGradient>
              <linearGradient id="cloth" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#46556A"/>
                <stop offset="100%" stopColor="#2E3A4B"/>
              </linearGradient>
            </defs>
            {/* shoulders / clothing */}
            <path d="M28 230 C30 178 60 158 100 158 C140 158 170 178 172 230 Z" fill="url(#cloth)"/>
            <path d="M78 150 h44 v22 c0 14 -44 14 -44 0 Z" fill="#E8C0A4"/>
            {/* neck shade */}
            <path d="M82 158 q18 12 36 0 v8 q-18 10 -36 0 Z" fill="#C99576" opacity="0.5"/>
            {/* hair back */}
            <path d="M58 86 C58 44 78 26 100 26 C122 26 142 44 142 86 C142 110 138 128 132 140 L128 120 C130 96 120 74 100 74 C80 74 70 96 72 120 L68 140 C62 128 58 110 58 86 Z" fill="url(#hair)"/>
            {/* face */}
            <ellipse cx="100" cy="96" rx="38" ry="46" fill="url(#skin)"/>
            {/* ears */}
            <ellipse cx="62" cy="100" rx="7" ry="11" fill="#E3B295"/>
            <ellipse cx="138" cy="100" rx="7" ry="11" fill="#E3B295"/>
            {/* hair front */}
            <path d="M62 90 C60 56 80 40 100 40 C120 40 140 56 138 90 C134 72 124 62 100 62 C76 62 66 72 62 90 Z" fill="url(#hair)"/>
            {/* brows */}
            <path d="M76 88 q10 -5 20 -1" stroke="#5A4A44" strokeWidth="3" fill="none" strokeLinecap="round"/>
            <path d="M104 87 q10 -4 20 1" stroke="#5A4A44" strokeWidth="3" fill="none" strokeLinecap="round"/>
            {/* eyes */}
            <ellipse cx="84" cy="98" rx="5.4" ry="3.4" fill="#fff"/>
            <ellipse cx="116" cy="98" rx="5.4" ry="3.4" fill="#fff"/>
            <circle cx="84.5" cy="98.4" r="2.5" fill="#3A2C25"/>
            <circle cx="115.5" cy="98.4" r="2.5" fill="#3A2C25"/>
            {/* nose */}
            <path d="M100 100 v12 q-4 4 -7 5" stroke="#C99576" strokeWidth="2.4" fill="none" strokeLinecap="round"/>
            {/* lips */}
            <path d="M88 124 q12 7 24 0" stroke="#C57F6E" strokeWidth="3.4" fill="none" strokeLinecap="round"/>
            {/* soft cheek */}
            <ellipse cx="76" cy="112" rx="7" ry="5" fill="#F0B69B" opacity="0.45"/>
            <ellipse cx="124" cy="112" rx="7" ry="5" fill="#F0B69B" opacity="0.45"/>
          </svg>
        </div>

        {/* warmth temperature overlay */}
        {warmOverlay > 0 && <div style={{ position: 'absolute', inset: 0, background: '#FF8A3D', opacity: warmOverlay * 0.28, mixBlendMode: 'soft-light' }} />}
        {coolOverlay > 0 && <div style={{ position: 'absolute', inset: 0, background: '#3D9BFF', opacity: coolOverlay * 0.30, mixBlendMode: 'soft-light' }} />}
        {/* soft-glow (뽀샤시) */}
        {smooth > 0 && <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(60% 50% at 50% 40%, rgba(255,255,255,0.55), transparent 70%)', opacity: smooth / 100, mixBlendMode: 'screen' }} />}

        {/* regulation guides */}
        {guides && <GuideOverlay headPct={headPct} />}
      </div>
    );
  }

  function GuideOverlay({ headPct }) {
    const crownY = (1 - headPct[1]) * 100 / 1.0;           // crown line from top (%)
    const chinY = crownY + (headPct[1]) * 100;             // approximate
    const top = 12, chin = 84;                              // tuned to subject layout
    const C = 'rgba(23,22,28,0.78)';
    return (
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {/* face oval */}
        <div style={{ position: 'absolute', left: '50%', top: '38%', transform: 'translate(-50%,-50%)',
          width: '54%', height: '64%', border: `1.5px dashed ${C}`, borderRadius: '50%', opacity: 0.7 }} />
        {/* crown line */}
        <GuideLine y={top} label="정수리" />
        {/* chin line */}
        <GuideLine y={chin} label="턱선" />
        {/* center axis */}
        <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, background: 'rgba(23,22,28,0.3)' }} />
      </div>
    );
  }
  function GuideLine({ y, label }) {
    return (
      <div style={{ position: 'absolute', left: 0, right: 0, top: `${y}%`, height: 0,
        borderTop: '1.5px dashed rgba(23,22,28,0.78)' }}>
        <span style={{ position: 'absolute', right: 8, top: -18, fontSize: 10.5, fontWeight: 800,
          color: '#17161C', background: '#FFD12E', padding: '2px 7px', borderRadius: 999 }}>{label}</span>
      </div>
    );
  }

  /* ---------------- Privacy bar ---------------- */
  function PrivacyBar({ compact = false }) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center',
        background: 'var(--teal-50)', color: 'var(--teal-600)', borderRadius: 999,
        padding: compact ? '7px 12px' : '9px 14px' }}>
        <window.IconLock s={15} />
        <span style={{ fontSize: compact ? 12 : 12.5, fontWeight: 700, letterSpacing: '-0.01em' }}>
          사진은 기기 밖으로 전송되지 않고 브라우저에서만 처리됩니다
        </span>
      </div>
    );
  }

  /* ---------------- Small controls ---------------- */
  function Slider({ icon, label, value, min = -100, max = 100, onChange, suffix = '', center = false }) {
    const Icon = icon ? window[icon] : null;
    return (
      <div style={{ marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 9 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--ink-2)' }}>
            {Icon && <Icon s={17} />}
            <span style={{ fontSize: 14, fontWeight: 500 }}>{label}</span>
          </div>
          <span className="t-num" style={{ fontSize: 13, fontWeight: 700, color: value !== (center ? 0 : min) ? 'var(--primary)' : 'var(--ink-3)' }}>
            {center && value > 0 ? '+' : ''}{value}{suffix}
          </span>
        </div>
        <input className="range" type="range" min={min} max={max} value={value}
          onChange={(e) => onChange(Number(e.target.value))} />
      </div>
    );
  }

  function Toggle({ on, onChange }) {
    return (
      <button onClick={() => onChange(!on)} style={{
        width: 46, height: 28, borderRadius: 999, border: 'none', cursor: 'pointer',
        background: on ? 'var(--primary)' : 'var(--line-2)', padding: 3, transition: 'background .2s',
        display: 'flex', justifyContent: on ? 'flex-end' : 'flex-start' }}>
        <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#fff',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transition: 'all .2s' }} />
      </button>
    );
  }

  Object.assign(window, { SPECS, Portrait, PrivacyBar, Slider, Toggle });
})();
