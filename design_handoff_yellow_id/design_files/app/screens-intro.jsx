/* Landing + Upload screens */
(function () {
  const { useState } = React;
  const G = window; // globals

  const TOP = 54;      // clear status bar
  const BOTTOM = 40;   // clear home indicator

  /* ===================== LANDING ===================== */
  function Landing({ go }) {
    return (
      <div className="noscroll" style={{ height: '100%', overflowY: 'auto', paddingTop: TOP,
        paddingBottom: BOTTOM, background:
        'linear-gradient(180deg, #FFE98A 0%, #FBF2D0 26%, #F8F6EF 52%, #F8F6EF 100%)' }}>

        {/* brand row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px 6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <Logo />
            <span className="wordmark" style={{ fontSize: 19 }}>Yei<span style={{ color: 'var(--y-deep)' }}>ID</span></span>
          </div>
          <button onClick={() => go('settings')} className="btn" style={{ width: 38, height: 38, background: 'rgba(255,255,255,0.7)', color: 'var(--ink-2)', boxShadow: 'var(--sh-sm)' }}>
            <G.IconSettings s={19} />
          </button>
        </div>

        {/* hero copy */}
        <div className="fade-up" style={{ padding: '16px 22px 4px' }}>
          <div className="badge badge-teal" style={{ marginBottom: 14 }}>
            <G.IconShield s={14} /> 100% 기기 내 처리
          </div>
          <h1 className="t-display" style={{ margin: 0 }}>
            집에서 1분,<br/>규격 딱 맞는<br/>
            <span style={{ background: 'linear-gradient(transparent 56%, var(--y) 56%)', padding: '0 2px', borderRadius: 3 }}>증명사진</span>.
          </h1>
          <p className="t-body muted2" style={{ margin: '12px 0 0', maxWidth: 300 }}>
            여권·운전면허·일반 증명사진을 사진관 없이.
            업로드한 사진은 서버로 전송되지 않습니다.
          </p>
        </div>

        {/* hero sample card */}
        <div className="pop" style={{ padding: '22px 22px 6px', display: 'flex', justifyContent: 'center' }}>
          <SampleCard />
        </div>

        {/* doc-type quick chips */}
        <div style={{ display: 'flex', gap: 8, padding: '14px 22px 0' }}>
          {[['IconPassport', '여권'], ['IconCard', '운전면허'], ['IconUser', '일반증명']].map(([ic, t]) => {
            const Ic = G[ic];
            return (
              <div key={t} className="card" style={{ flex: 1, padding: '12px 6px', display: 'flex',
                flexDirection: 'column', alignItems: 'center', gap: 7, borderRadius: 16 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--primary-50)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                  <Ic s={20} />
                </div>
                <span className="t-sm-m">{t}</span>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div style={{ padding: '22px 22px 10px' }}>
          <button className="btn btn-primary btn-lg btn-block" onClick={() => go('upload')}>
            <G.IconUpload s={20} /> 사진 올리기
          </button>
          <p className="t-cap muted" style={{ textAlign: 'center', margin: '12px 0 0' }}>
            무료로 5장 다운로드 · 가입 없이 바로 시작
          </p>
        </div>
      </div>
    );
  }

  function Logo() {
    return (
      <div style={{ width: 36, height: 36, borderRadius: 11, background: 'var(--y)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--sh-primary)',
        transform: 'rotate(-4deg)' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          {/* friendly face: dot eyes + big smile */}
          <circle cx="8.7" cy="9.5" r="1.7" fill="#17161C"/>
          <circle cx="15.3" cy="9.5" r="1.7" fill="#17161C"/>
          <path d="M7 13.4c1.2 2.6 3 3.9 5 3.9s3.8-1.3 5-3.9" stroke="#17161C" strokeWidth="2.2" strokeLinecap="round" fill="none"/>
        </svg>
      </div>
    );
  }

  function SampleCard() {
    return (
      <div className="card" style={{ width: 226, padding: 16, borderRadius: 24, boxShadow: 'var(--sh-lg)' }}>
        <div style={{ position: 'relative', width: '100%', aspectRatio: '35/45', borderRadius: 14,
          overflow: 'hidden', border: '1px solid var(--line)' }}>
          <G.Portrait bg="#FFFFFF" zoom={1.04} brightness={1.03} headPct={[0.7,0.8]} />
          {/* corner crop marks */}
          {[[0,0],[1,0],[0,1],[1,1]].map(([x,y],i)=>(
            <div key={i} style={{ position:'absolute', [y?'bottom':'top']:7, [x?'right':'left']:7,
              width:14, height:14, borderTop:!y?'2px solid rgba(23,22,28,0.82)':'none',
              borderBottom:y?'2px solid rgba(23,22,28,0.82)':'none',
              borderLeft:!x?'2px solid rgba(23,22,28,0.82)':'none',
              borderRight:x?'2px solid rgba(23,22,28,0.82)':'none' }} />
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
          <span className="badge badge-primary"><G.IconPassport s={13}/> 여권 규격</span>
          <span className="t-cap muted t-num">35×45mm</span>
        </div>
      </div>
    );
  }

  /* ===================== UPLOAD ===================== */
  function Upload({ go }) {
    const [drag, setDrag] = useState(false);
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', paddingTop: TOP, paddingBottom: BOTTOM }}>
        <ScreenHeader title="사진 올리기" onBack={() => go('landing')} />

        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 20px 0' }} className="noscroll">
          <div style={{ marginBottom: 14 }}><G.PrivacyBar /></div>

          {/* dropzone */}
          <button onClick={() => go('editor')}
            onMouseEnter={() => setDrag(true)} onMouseLeave={() => setDrag(false)}
            className="fade-up" style={{
            width: '100%', border: `2px dashed ${drag ? 'var(--primary)' : 'var(--line-2)'}`,
            background: drag ? 'var(--primary-50)' : 'var(--surface)', borderRadius: 24,
            padding: '40px 24px', cursor: 'pointer', transition: 'all .18s', fontFamily: 'var(--font)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 64, height: 64, borderRadius: 20, background: 'var(--primary-50)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
              <G.IconImage s={32} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <div className="t-h2">사진을 여기로 끌어다 놓기</div>
              <div className="t-sm muted" style={{ marginTop: 4 }}>JPG · PNG · HEIC · 최대 20MB</div>
            </div>
          </button>

          {/* source buttons */}
          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
            <button className="btn btn-outline btn-md" style={{ flex: 1 }} onClick={() => go('editor')}>
              <G.IconImage s={19} /> 갤러리
            </button>
            <button className="btn btn-dark btn-md" style={{ flex: 1 }} onClick={() => go('editor')}>
              <G.IconCamera s={19} /> 카메라
            </button>
          </div>

          {/* tips */}
          <div className="card" style={{ marginTop: 18, padding: 16, borderRadius: 18 }}>
            <div className="t-sm-m" style={{ marginBottom: 12, color: 'var(--ink-2)' }}>잘 나오는 팁</div>
            {[
              ['IconSun', '밝고 균일한 조명에서 촬영'],
              ['IconLayers', '벽 등 단색 배경 앞에 서기'],
              ['IconUser', '정면을 보고 어깨가 보이게'],
            ].map(([ic, t], i) => {
              const Ic = G[ic];
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 0' }}>
                  <div style={{ width: 30, height: 30, borderRadius: 9, background: 'var(--bg-2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-2)', flexShrink: 0 }}>
                    <Ic s={17} />
                  </div>
                  <span className="t-body-m">{t}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  /* shared header */
  function ScreenHeader({ title, onBack, right }) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 14px 10px' }}>
        <button className="btn" onClick={onBack} style={{ width: 38, height: 38, color: 'var(--ink-2)' }}>
          <G.IconChevL s={22} />
        </button>
        <span className="t-h2" style={{ flex: 1 }}>{title}</span>
        {right}
      </div>
    );
  }

  Object.assign(window, { Landing, Upload, ScreenHeader, TOP, BOTTOM });
})();
