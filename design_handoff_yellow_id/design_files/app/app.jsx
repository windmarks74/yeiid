/* App shell — state + navigation, mounted inside the iOS device frame. */
(function () {
  const { useState } = React;
  const G = window;

  const DEFAULT_PHOTO = {
    doc: 'passport', bg: '#FFFFFF', zoom: 1.05, brightness: 1,
    exposure: 0, warmth: 0, smooth: 0, offsetY: -2, guides: true,
  };
  const DEFAULT_BILLING = { premium: false, used: 0, credits: 0, adsWatched: 0 };

  const SCREENS = [
    ['landing', '시작'], ['upload', '업로드'], ['editor', '편집'],
    ['result', '완성'], ['paywall', '결제'], ['settings', '설정'],
  ];

  function App() {
    const [screen, setScreen] = useState('landing');
    const [photo, setPhoto] = useState(DEFAULT_PHOTO);
    const [billing, setBilling] = useState(DEFAULT_BILLING);

    const set = (patch) => setPhoto((p) => ({ ...p, ...(typeof patch === 'function' ? patch(p) : patch) }));
    const go = (s) => setScreen(s);

    const props = { go, photo, set, billing, setBilling };
    const Screen = {
      landing: G.Landing, upload: G.Upload, editor: G.Editor,
      result: G.Result, paywall: G.Paywall, settings: G.Settings,
    }[screen];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
        <G.IOSDevice>
          <div className="app-root" style={{ position: 'relative', height: '100%' }}>
            <Screen {...props} />
          </div>
        </G.IOSDevice>

        {/* prototype screen jumper */}
        <div className="screen-jumper" style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', maxWidth: 402 }}>
          {SCREENS.map(([id, label]) => (
            <button key={id} onClick={() => go(id)} style={{
              fontFamily: 'var(--font)', fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
              padding: '7px 13px', borderRadius: 999, border: 'none', letterSpacing: '-0.01em',
              background: screen === id ? '#101A29' : 'rgba(255,255,255,0.9)',
              color: screen === id ? '#fff' : '#3C4859', whiteSpace: 'nowrap',
              boxShadow: '0 1px 3px rgba(16,26,41,0.08)', transition: 'all .15s' }}>
              {label}
            </button>
          ))}
          {(billing.premium || billing.used > 0) && (
            <button onClick={() => setBilling(DEFAULT_BILLING)} style={{
              fontFamily: 'var(--font)', fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
              padding: '7px 13px', borderRadius: 999, border: '1px dashed #B3CDFB',
              background: 'transparent', color: '#1551CB' }}>
              ↺ 결제상태 초기화
            </button>
          )}
        </div>
      </div>
    );
  }

  ReactDOM.createRoot(document.getElementById('root')).render(<App />);
})();
