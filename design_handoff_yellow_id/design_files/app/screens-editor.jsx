/* Editor screen — doc tabs, regulation banner, crop preview w/ guides,
   spec readout, and crop / adjust / background / smoothing tools. */
(function () {
  const { useState } = React;
  const G = window;

  const TOOLS = [
    { id: 'crop', label: '크롭', icon: 'IconCrop' },
    { id: 'adjust', label: '보정', icon: 'IconSun' },
    { id: 'bg', label: '배경', icon: 'IconLayers' },
    { id: 'glow', label: '뽀샤시', icon: 'IconSparkle' },
  ];

  function Editor({ go, photo, set }) {
    const [tool, setTool] = useState('crop');
    const spec = G.SPECS[photo.doc];
    const strict = spec.strict;

    const setDoc = (doc) => {
      const s = G.SPECS[doc];
      // snap bg to a legal one for the new doc
      const bg = s.bgColors.includes(photo.bg) ? photo.bg : s.bgColors[0];
      set({ doc, bg, ...(s.strict ? { smooth: 0 } : {}) });
    };

    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', paddingTop: G.TOP }}>
        {/* header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 14px 8px' }}>
          <button className="btn" onClick={() => go('upload')} style={{ width: 38, height: 38, color: 'var(--ink-2)' }}>
            <G.IconChevL s={22} />
          </button>
          <span className="t-h2" style={{ flex: 1 }}>편집</span>
          <button className="btn btn-ghost btn-sm" onClick={() => set({ zoom:1, brightness:1, exposure:0, warmth:0, smooth:0, offsetY:0 })}>
            <G.IconRefresh s={16} /> 초기화
          </button>
        </div>

        {/* doc-type tabs */}
        <div style={{ padding: '0 16px 10px' }}>
          <div className="seg">
            {Object.entries(G.SPECS).map(([id, s]) => {
              const Ic = G[s.icon];
              return (
                <button key={id} className={'seg-item' + (photo.doc === id ? ' on' : '')} onClick={() => setDoc(id)}>
                  <Ic s={16} /> {s.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* scroll body */}
        <div className="noscroll" style={{ flex: 1, overflowY: 'auto' }}>
          {/* regulation banner */}
          {strict ? (
            <div style={{ margin: '0 16px 12px', background: 'var(--warn-50)', border: '1px solid var(--warn-100)',
              borderRadius: 14, padding: '11px 13px', display: 'flex', gap: 10 }}>
              <div style={{ color: 'var(--warn)', flexShrink: 0, marginTop: 1 }}><G.IconAlert s={18} /></div>
              <div>
                <div className="t-sm-m" style={{ color: 'var(--warn-700)' }}>여권 사진은 보정·필터가 제한됩니다</div>
                <div className="t-cap" style={{ color: 'var(--warn-700)', opacity: 0.85, marginTop: 2 }}>
                  미백·뽀샤시·배경 합성은 거부 사유가 될 수 있어요. 밝기 조정만 가볍게 권장.
                </div>
              </div>
            </div>
          ) : (
            <div style={{ margin: '0 16px 12px', display: 'flex', alignItems: 'center', gap: 8,
              color: 'var(--teal-600)', justifyContent: 'center' }}>
              <G.IconLock s={13} />
              <span className="t-cap">기기 안에서만 처리 중</span>
            </div>
          )}

          {/* preview */}
          <div style={{ display: 'flex', justifyContent: 'center', padding: '2px 16px 4px' }}>
            <div style={{ position: 'relative', width: 196, aspectRatio: '35/45', borderRadius: 16,
              overflow: 'hidden', boxShadow: 'var(--sh-md)', border: '1px solid var(--line)' }}>
              <G.Portrait bg={photo.bg} zoom={photo.zoom} brightness={photo.brightness * (1 + photo.exposure/220)}
                warmth={photo.warmth} smooth={photo.smooth} offsetY={photo.offsetY}
                headPct={spec.headPct} guides={photo.guides} />
            </div>
          </div>

          {/* guide toggle + spec */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '4px 16px 12px' }}>
            <button className="btn btn-sm" onClick={() => set({ guides: !photo.guides })}
              style={{ background: photo.guides ? 'var(--primary-50)' : 'var(--bg-2)',
              color: photo.guides ? 'var(--primary-600)' : 'var(--ink-3)' }}>
              <G.IconGrid s={15} /> 규격 가이드
            </button>
          </div>

          <SpecCard spec={spec} />

          {/* tool chips */}
          <div className="noscroll" style={{ display: 'flex', gap: 8, padding: '16px 16px 6px', overflowX: 'auto' }}>
            {TOOLS.map((t) => {
              const Ic = G[t.icon];
              const on = tool === t.id;
              const locked = strict && t.id === 'glow';
              return (
                <button key={t.id} onClick={() => setTool(t.id)} className="btn btn-sm"
                  style={{ background: on ? 'var(--ink)' : 'var(--surface)', color: on ? '#fff' : 'var(--ink-2)',
                  border: on ? 'none' : '1px solid var(--line)', flexShrink: 0, opacity: locked ? 0.5 : 1 }}>
                  <Ic s={16} /> {t.label}{locked && <G.IconLock s={13} />}
                </button>
              );
            })}
          </div>

          {/* tool panel */}
          <div style={{ padding: '8px 18px 16px' }}>
            <ToolPanel tool={tool} photo={photo} set={set} spec={spec} strict={strict} />
          </div>
        </div>

        {/* bottom CTA */}
        <div style={{ padding: '10px 18px', paddingBottom: G.BOTTOM, borderTop: '1px solid var(--line)',
          background: 'var(--surface)' }}>
          <button className="btn btn-primary btn-lg btn-block" onClick={() => go('result')}>
            완료 · 미리보기 <G.IconChevR s={19} />
          </button>
        </div>
      </div>
    );
  }

  function SpecCard({ spec }) {
    return (
      <div className="card" style={{ margin: '0 16px', padding: '12px 14px', borderRadius: 16,
        display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--primary-50)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', flexShrink: 0 }}>
          <G.IconRuler s={20} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="t-sm-m">{spec.sizeMM} · 얼굴 {Math.round(spec.headPct[0]*100)}~{Math.round(spec.headPct[1]*100)}%</div>
          <div className="t-cap muted t-num" style={{ marginTop: 2 }}>{spec.px} @ {spec.dpi}</div>
        </div>
        <span className="badge badge-success"><G.IconCheck s={13}/> 규격 충족</span>
      </div>
    );
  }

  function ToolPanel({ tool, photo, set, spec, strict }) {
    if (tool === 'crop') {
      return (
        <div className="fade-up">
          <G.Slider icon="IconPlus" label="확대" value={Math.round((photo.zoom - 1) * 100)} min={0} max={60}
            onChange={(v) => set({ zoom: 1 + v / 100 })} suffix="%" />
          <G.Slider icon="IconChevD" label="상하 위치" value={photo.offsetY} min={-30} max={30} center
            onChange={(v) => set({ offsetY: v })} />
          <button className="btn btn-tonal btn-md btn-block" style={{ marginTop: 4 }}
            onClick={() => set({ zoom: 1.06, offsetY: -4 })}>
            <G.IconWand s={18} /> 얼굴 인식 자동 정렬
          </button>
          <p className="t-cap muted" style={{ textAlign: 'center', marginTop: 10 }}>
            정수리~턱이 가이드 선에 맞도록 조정하세요
          </p>
        </div>
      );
    }
    if (tool === 'adjust') {
      return (
        <div className="fade-up">
          <G.Slider icon="IconSun" label="밝기" value={Math.round((photo.brightness - 1) * 100)} min={-30} max={30} center
            onChange={(v) => set({ brightness: 1 + v / 100 })} />
          <G.Slider icon="IconImage" label="노출" value={photo.exposure} min={-50} max={50} center
            onChange={(v) => set({ exposure: v })} />
          <G.Slider icon="IconDroplet" label="화이트밸런스" value={photo.warmth} min={-50} max={50} center
            onChange={(v) => set({ warmth: v })} suffix="" />
          {strict && (
            <p className="t-cap" style={{ color: 'var(--warn-700)', background: 'var(--warn-50)',
              borderRadius: 10, padding: '8px 10px', marginTop: 4 }}>
              ⚠ 여권 규격: 과도한 색·밝기 보정은 피해주세요.
            </p>
          )}
        </div>
      );
    }
    if (tool === 'bg') {
      return (
        <div className="fade-up">
          <div className="t-sm-m muted2" style={{ marginBottom: 12 }}>배경색 — {spec.bgRule}</div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {spec.bgColors.map((c) => {
              const on = photo.bg === c;
              return (
                <button key={c} onClick={() => set({ bg: c })} style={{ width: 52, height: 52, borderRadius: 14,
                  background: c, cursor: 'pointer', position: 'relative',
                  border: on ? '2.5px solid var(--primary)' : '1px solid var(--line-2)',
                  boxShadow: on ? 'var(--sh-primary)' : 'none', transition: 'all .15s' }}>
                  {on && <div style={{ position: 'absolute', top: -7, right: -7, width: 20, height: 20,
                    borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex',
                    alignItems: 'center', justifyContent: 'center' }}><G.IconCheck s={13} /></div>}
                </button>
              );
            })}
          </div>
          <p className="t-cap muted" style={{ marginTop: 14 }}>
            인물 외 배경만 깔끔하게 교체합니다. {strict && '여권은 흰색 균일 배경만 인정돼요.'}
          </p>
        </div>
      );
    }
    if (tool === 'glow') {
      if (strict) {
        return (
          <div className="fade-up" style={{ textAlign: 'center', padding: '14px 10px' }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--warn-50)',
              color: 'var(--warn)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <G.IconLock s={24} />
            </div>
            <div className="t-body-m">여권 모드에서는 사용할 수 없어요</div>
            <p className="t-sm muted" style={{ marginTop: 6 }}>
              여권 사진은 원본 그대로여야 합니다.<br/>운전면허·일반증명에서 사용해 보세요.
            </p>
          </div>
        );
      }
      return (
        <div className="fade-up">
          <G.Slider icon="IconSparkle" label="피부 보정" value={photo.smooth} min={0} max={100}
            onChange={(v) => set({ smooth: v })} suffix="%" />
          <p className="t-cap muted">잡티를 부드럽게, 자연스러운 정도로 권장해요.</p>
        </div>
      );
    }
    return null;
  }

  Object.assign(window, { Editor });
})();
