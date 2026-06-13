/* Settings / About */
(function () {
  const G = window;

  function Settings({ go, billing }) {
    const Row = ({ icon, title, desc, right, onClick, danger }) => {
      const Ic = G[icon];
      return (
        <button onClick={onClick} style={{ width: '100%', background: 'transparent', border: 'none',
          cursor: onClick ? 'pointer' : 'default', display: 'flex', alignItems: 'center', gap: 13,
          padding: '13px 4px', fontFamily: 'var(--font)', textAlign: 'left' }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            background: danger ? 'var(--danger-50)' : 'var(--primary-50)',
            color: danger ? 'var(--danger)' : 'var(--primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Ic s={19} />
          </div>
          <div style={{ flex: 1 }}>
            <div className="t-body-m" style={{ color: danger ? 'var(--danger)' : 'var(--ink)' }}>{title}</div>
            {desc && <div className="t-cap muted" style={{ marginTop: 1 }}>{desc}</div>}
          </div>
          {right}
          {onClick && !right && <span style={{ color: 'var(--ink-4)' }}><G.IconChevR s={18} /></span>}
        </button>
      );
    };

    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', paddingTop: G.TOP }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 14px 8px' }}>
          <button className="btn" onClick={() => go('landing')} style={{ width: 38, height: 38, color: 'var(--ink-2)' }}>
            <G.IconChevL s={22} />
          </button>
          <span className="t-h2" style={{ flex: 1 }}>설정 · 소개</span>
        </div>

        <div className="noscroll" style={{ flex: 1, overflowY: 'auto', padding: '4px 20px 24px' }}>
          {/* privacy hero */}
          <div style={{ background: 'var(--teal-50)', borderRadius: 18, padding: '16px 16px', display: 'flex', gap: 12, marginBottom: 18 }}>
            <div style={{ color: 'var(--teal-600)', flexShrink: 0 }}><G.IconShield s={26} /></div>
            <div>
              <div className="t-body-m" style={{ color: 'var(--teal-600)' }}>사진은 기기를 떠나지 않아요</div>
              <div className="t-sm" style={{ color: 'var(--teal-600)', opacity: 0.82, marginTop: 3 }}>
                모든 편집은 브라우저 안에서만 처리되며, 어떤 사진도 서버로 전송·저장되지 않습니다.
              </div>
            </div>
          </div>

          <SectionLabel>플랜</SectionLabel>
          <div className="card" style={{ padding: '4px 14px', borderRadius: 16, marginBottom: 18 }}>
            <Row icon={billing.premium ? 'IconSparkle' : 'IconGift'}
              title={billing.premium ? '광고 제거됨 · 무제한' : '무료 플랜'}
              desc={billing.premium ? '평생 광고 없이 이용 중' : '무료 5장 · 추가는 광고 또는 결제'}
              right={billing.premium
                ? <span className="badge badge-primary">PRO</span>
                : <span className="btn btn-tonal btn-sm" onClick={() => go('paywall')}>업그레이드</span>} />
          </div>

          <SectionLabel>약관 · 정보</SectionLabel>
          <div className="card" style={{ padding: '4px 14px', borderRadius: 16, marginBottom: 18 }}>
            <Row icon="IconLock" title="개인정보처리방침" onClick={() => {}} />
            <div className="hr" />
            <Row icon="IconDoc" title="이용약관" onClick={() => {}} />
            <div className="hr" />
            <Row icon="IconInfo" title="자주 묻는 질문" onClick={() => {}} />
          </div>

          {/* disclaimer */}
          <div style={{ background: 'var(--warn-50)', border: '1px solid var(--warn-100)', borderRadius: 14,
            padding: '12px 14px', display: 'flex', gap: 10, marginBottom: 18 }}>
            <span style={{ color: 'var(--warn)', flexShrink: 0, marginTop: 1 }}><G.IconAlert s={17} /></span>
            <div className="t-cap" style={{ color: 'var(--warn-700)', lineHeight: 1.5 }}>
              본 앱은 규격에 맞춘 사진 제작을 돕는 도구로, <b>정부·공공기관의 공인 서비스가 아니며 심사 합격을 보장하지 않습니다.</b>
              최종 규정은 발급 기관 안내를 확인하세요.
            </div>
          </div>

          <p className="t-cap muted" style={{ textAlign: 'center' }}>Yei ID · 버전 1.0.0</p>
        </div>
      </div>
    );
  }

  function SectionLabel({ children }) {
    return <div className="t-cap muted" style={{ padding: '0 4px 7px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{children}</div>;
  }

  Object.assign(window, { Settings });
})();
