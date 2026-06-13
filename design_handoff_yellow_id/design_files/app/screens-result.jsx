/* Result / Download + Paywall + Ad flow */
(function () {
  const { useState, useEffect } = React;
  const G = window;

  /* ===================== RESULT ===================== */
  function Result({ go, photo, billing, setBilling }) {
    const spec = G.SPECS[photo.doc];
    const [fmt, setFmt] = useState('single');   // single | sheet
    const [toast, setToast] = useState(false);
    const [ad, setAd] = useState(false);
    const FREE = 5;
    const freeLeft = Math.max(0, FREE - billing.used);
    const freeAvailable = !billing.premium && freeLeft > 0;

    const doDownload = () => {
      setBilling((b) => ({ ...b, used: b.used + 1 }));
      setToast(true);
      setTimeout(() => setToast(false), 2600);
    };
    const onFinishAd = () => {
      setAd(false);
      setBilling((b) => ({ ...b, credits: (b.credits || 0) + 1, adsWatched: (b.adsWatched||0)+1 }));
      // auto-grant a download
      setTimeout(doDownload, 200);
    };
    const canDownloadFree = freeAvailable || billing.premium || (billing.credits || 0) > 0;

    const onPrimary = () => {
      if (billing.premium) { doDownload(); return; }
      if (freeAvailable) { doDownload(); return; }
      if ((billing.credits || 0) > 0) { setBilling((b)=>({...b, credits: b.credits-1})); doDownload(); return; }
    };

    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', paddingTop: G.TOP }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 14px 8px' }}>
          <button className="btn" onClick={() => go('editor')} style={{ width: 38, height: 38, color: 'var(--ink-2)' }}>
            <G.IconChevL s={22} />
          </button>
          <span className="t-h2" style={{ flex: 1 }}>완성</span>
          {billing.premium && <span className="badge badge-primary"><G.IconSparkle s={13}/> 광고 제거됨</span>}
        </div>

        <div className="noscroll" style={{ flex: 1, overflowY: 'auto', padding: '4px 20px 0' }}>
          {/* preview */}
          <div className="pop" style={{ display: 'flex', justifyContent: 'center', padding: '6px 0 4px' }}>
            {fmt === 'single' ? (
              <div className="card" style={{ padding: 12, borderRadius: 22, boxShadow: 'var(--sh-lg)' }}>
                <div style={{ position: 'relative', width: 168, aspectRatio: '35/45', borderRadius: 12,
                  overflow: 'hidden', border: '1px solid var(--line)' }}>
                  <G.Portrait bg={photo.bg} zoom={photo.zoom} brightness={photo.brightness*(1+photo.exposure/220)}
                    warmth={photo.warmth} smooth={photo.smooth} offsetY={photo.offsetY} headPct={spec.headPct} />
                </div>
              </div>
            ) : (
              <div className="card" style={{ padding: 12, borderRadius: 22, boxShadow: 'var(--sh-lg)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, width: 180 }}>
                  {[0,1,2,3].map((i)=>(
                    <div key={i} style={{ position: 'relative', aspectRatio: '35/45', borderRadius: 7,
                      overflow: 'hidden', border: '1px solid var(--line)' }}>
                      <G.Portrait bg={photo.bg} zoom={photo.zoom} brightness={photo.brightness*(1+photo.exposure/220)}
                        warmth={photo.warmth} smooth={photo.smooth} offsetY={photo.offsetY} headPct={spec.headPct} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* format toggle */}
          <div className="seg" style={{ marginTop: 8 }}>
            <button className={'seg-item' + (fmt==='single'?' on':'')} onClick={()=>setFmt('single')}>증명사진 1매</button>
            <button className={'seg-item' + (fmt==='sheet'?' on':'')} onClick={()=>setFmt('sheet')}>인화용 4컷</button>
          </div>

          {/* spec / checklist */}
          <div className="card" style={{ marginTop: 14, padding: '14px 16px', borderRadius: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 10 }}>
              <span className="t-sm-m" style={{ whiteSpace: 'nowrap' }}>{spec.label} 규격</span>
              <span className="t-cap muted t-num" style={{ whiteSpace: 'nowrap' }}>{spec.px} @ {spec.dpi}</span>
            </div>
            {['규격·여백 자동 보정', `${spec.bgRule.split('·')[0]} 배경 적용`, '얼굴 비율 가이드 충족'].map((t,i)=>(
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '3px 0' }}>
                <span style={{ color: 'var(--success)', flexShrink: 0 }}><G.IconCheckCircle s={17} /></span>
                <span className="t-sm" style={{ color: 'var(--ink-2)' }}>{t}</span>
              </div>
            ))}
          </div>
        </div>

        {/* bottom action zone */}
        <div style={{ padding: '12px 20px', paddingBottom: G.BOTTOM, borderTop: '1px solid var(--line)', background: 'var(--surface)' }}>
          {canDownloadFree ? (
            <>
              <button className="btn btn-primary btn-lg btn-block" onClick={onPrimary}>
                <G.IconDownload s={20} /> {billing.premium ? '다운로드' : freeAvailable ? `무료로 다운로드 (${freeLeft}회 남음)` : `다운로드 (보유 ${billing.credits||0}회)`}
              </button>
              {!billing.premium && freeAvailable && (
                <p className="t-cap muted" style={{ textAlign: 'center', margin: '9px 0 0' }}>
                  무료 {FREE}장 제공 · 추가는 광고 시청 또는 광고 제거로
                </p>
              )}
            </>
          ) : (
            <Upsell onAd={() => setAd(true)} onPay={() => go('paywall')} />
          )}
        </div>

        {toast && <DownloadToast onClose={() => setToast(false)} />}
        {ad && <AdModal onClose={() => setAd(false)} onFinish={onFinishAd} />}
      </div>
    );
  }

  /* gentle two-option upsell after the free download is used */
  function Upsell({ onAd, onPay }) {
    return (
      <div className="fade-up">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 11, justifyContent: 'center' }}>
          <span style={{ color: 'var(--success)' }}><G.IconCheckCircle s={16} /></span>
          <span className="t-sm-m" style={{ color: 'var(--ink-2)' }}>무료 5장을 모두 받았어요. 더 받으시겠어요?</span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {/* watch ad */}
          <button className="btn btn-outline" style={{ flex: 1, height: 'auto', padding: '14px 10px', flexDirection: 'column', gap: 6, borderRadius: 18 }} onClick={onAd}>
            <span style={{ color: 'var(--ink)' }}><G.IconPlay s={22} /></span>
            <span style={{ fontWeight: 700, fontSize: 14 }}>광고 보고 1장</span>
            <span className="t-cap muted" style={{ fontWeight: 500 }}>약 15초 · 무료</span>
          </button>
          {/* go premium */}
          <button className="btn btn-teal" style={{ flex: 1.15, height: 'auto', padding: '14px 10px', flexDirection: 'column', gap: 6, borderRadius: 18, position: 'relative' }} onClick={onPay}>
            <span className="badge" style={{ position: 'absolute', top: -10, right: 10, background: 'var(--y)', color: 'var(--ink)', height: 22 }}>추천</span>
            <G.IconSparkle s={22} />
            <span style={{ fontWeight: 700, fontSize: 14 }}>광고 없이 무제한</span>
            <span style={{ fontSize: 11.5, fontWeight: 500, opacity: 0.92 }}>₩4,900 · 평생</span>
          </button>
        </div>
      </div>
    );
  }

  function DownloadToast() {
    return (
      <div className="pop" style={{ position: 'absolute', left: 20, right: 20, bottom: 100, zIndex: 80,
        background: 'var(--ink)', color: '#fff', borderRadius: 16, padding: '13px 16px',
        display: 'flex', alignItems: 'center', gap: 11, boxShadow: 'var(--sh-lg)' }}>
        <span style={{ color: '#5BE0A8' }}><G.IconCheckCircle s={20} /></span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 14 }}>저장 완료</div>
          <div style={{ fontSize: 12, opacity: 0.7 }}>갤러리에 증명사진이 저장됐어요</div>
        </div>
      </div>
    );
  }

  /* simulated rewarded-ad sheet */
  function AdModal({ onClose, onFinish }) {
    const [left, setLeft] = useState(15);
    useEffect(() => {
      if (left <= 0) return;
      const t = setTimeout(() => setLeft((n) => n - 1), 1000);
      return () => clearTimeout(t);
    }, [left]);
    const done = left <= 0;
    return (
      <Sheet onClose={onClose} dim>
        <div style={{ textAlign: 'center', padding: '6px 4px 4px' }}>
          <div style={{ position: 'relative', width: '100%', aspectRatio: '16/10', borderRadius: 16, overflow: 'hidden',
            background: 'linear-gradient(135deg,#1B2B4B,#0E1726)', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 10, color: '#fff' }}>
            <div style={{ position: 'absolute', top: 10, right: 10, fontSize: 11, fontWeight: 700,
              background: 'rgba(255,255,255,0.16)', padding: '3px 8px', borderRadius: 999 }}>
              {done ? '완료' : `${left}초`}
            </div>
            <G.IconPlay s={40} />
            <div style={{ fontWeight: 700 }}>광고 재생 중…</div>
            <div style={{ position: 'absolute', bottom: 0, left: 0, height: 4, background: '#5BE0A8',
              width: `${(15-left)/15*100}%`, transition: 'width 1s linear' }} />
          </div>
          <p className="t-sm muted" style={{ margin: '16px 0 16px' }}>
            {done ? '시청 완료! 1장을 받을 수 있어요.' : '광고를 끝까지 보면 1장을 무료로 받아요.'}
          </p>
          <button className="btn btn-primary btn-lg btn-block" disabled={!done}
            style={{ opacity: done ? 1 : 0.45 }} onClick={onFinish}>
            {done ? '1장 받기' : '잠시만요…'}
          </button>
        </div>
      </Sheet>
    );
  }

  /* ===================== PAYWALL ===================== */
  function Paywall({ go, setBilling }) {
    const benefits = [
      ['IconX', '광고 완전 제거', '시청·대기 없이 바로 저장'],
      ['IconDownload', '무제한 다운로드', '재촬영·여러 규격도 자유롭게'],
      ['IconLayers', '모든 규격 · 인화용 4컷', '여권·면허·일반 + 4×6 배치'],
      ['IconLock', '기기 내 처리 유지', '결제해도 사진은 전송되지 않음'],
    ];
    const buy = () => { setBilling((b) => ({ ...b, premium: true })); go('result'); };
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', paddingTop: G.TOP,
        background: 'linear-gradient(180deg,#FFE98A,#FBF2D0 30%,#F8F6EF 58%)' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '4px 14px' }}>
          <button className="btn" onClick={() => go('result')} style={{ width: 38, height: 38, color: 'var(--ink-3)' }}>
            <G.IconX s={20} />
          </button>
        </div>

        <div className="noscroll" style={{ flex: 1, overflowY: 'auto', padding: '4px 22px 0' }}>
          <div style={{ width: 60, height: 60, borderRadius: 18, background: 'var(--y)', boxShadow: 'var(--sh-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink)', marginBottom: 16,
            transform: 'rotate(-4deg)' }}>
            <G.IconSparkle s={32} />
          </div>
          <h1 className="t-title" style={{ margin: 0 }}>광고 없이, 무제한으로.</h1>
          <p className="t-body muted2" style={{ margin: '8px 0 20px' }}>
            한 번 결제하면 평생 광고 없이 모든 규격을 무제한 저장할 수 있어요.
          </p>

          <div className="card" style={{ padding: '6px 16px', borderRadius: 20 }}>
            {benefits.map(([ic, t, d], i) => {
              const Ic = G[ic];
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '13px 0',
                  borderBottom: i < benefits.length - 1 ? '1px solid var(--line)' : 'none' }}>
                  <div style={{ width: 38, height: 38, borderRadius: 11, background: 'var(--primary-50)', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                    <Ic s={20} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="t-body-m">{t}</div>
                    <div className="t-cap muted" style={{ marginTop: 1 }}>{d}</div>
                  </div>
                  <span style={{ color: 'var(--success)' }}><G.IconCheck s={18} /></span>
                </div>
              );
            })}
          </div>
        </div>

        {/* purchase */}
        <div style={{ padding: '14px 22px', paddingBottom: G.BOTTOM, background: 'var(--surface)', borderTop: '1px solid var(--line)' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 8, marginBottom: 12 }}>
            <span className="t-num" style={{ fontSize: 30, fontWeight: 700 }}>₩4,900</span>
            <span className="t-sm muted" style={{ whiteSpace: 'nowrap' }}>커피 한 잔 값, 평생 이용</span>
          </div>
          <button className="btn btn-primary btn-lg btn-block" onClick={buy}>
            <G.IconSparkle s={19} /> 광고 없이 평생 이용
          </button>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 18, marginTop: 12 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => go('result')}>나중에</button>
            <button className="btn btn-ghost btn-sm" onClick={buy}>구매 복원</button>
          </div>
        </div>
      </div>
    );
  }

  /* generic bottom sheet */
  function Sheet({ children, onClose, dim }) {
    return (
      <div style={{ position: 'absolute', inset: 0, zIndex: 90, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
        <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: dim ? 'rgba(16,26,41,0.45)' : 'transparent' }} />
        <div className="pop" style={{ position: 'relative', background: 'var(--surface)', borderRadius: '26px 26px 0 0',
          padding: '10px 20px', paddingBottom: G.BOTTOM + 6, boxShadow: '0 -10px 40px rgba(16,26,41,0.2)' }}>
          <div style={{ width: 40, height: 5, borderRadius: 999, background: 'var(--line-2)', margin: '4px auto 14px' }} />
          {children}
        </div>
      </div>
    );
  }

  Object.assign(window, { Result, Paywall });
})();
