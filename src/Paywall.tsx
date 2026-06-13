import { useState } from 'react'
import { PRICE_LABEL, purchaseLifetime, restorePurchases } from './iap'

type Props = {
  /** 구매/복원 성공 → 영구 해제 */
  onUnlock: () => void
  onClose: () => void
}

const BENEFITS = [
  '무제한 다운로드',
  '미국 등 해외 규격',
  '인화 시트 출력 (4×6)',
  '기기 내 처리 유지 (사진 전송 없음)',
]

/** 페이월: ₩4,900 영구 라이센스 구매 + 구매 복원 */
export default function Paywall({ onUnlock, onClose }: Props) {
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  async function run(fn: () => Promise<boolean>, emptyMsg: string) {
    setBusy(true)
    setMsg(null)
    try {
      if (await fn()) onUnlock()
      else setMsg(emptyMsg)
    } catch (e) {
      setMsg(`오류: ${(e as Error)?.message ?? e}`)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="paywall-screen" role="dialog" aria-modal>
      <button className="paywall-x" onClick={onClose} aria-label="닫기">
        ✕
      </button>

      <div className="paywall-hero">
        <div className="paywall-icon">∞</div>
        <h2>한 번 결제, 평생 무제한.</h2>
        <p className="paywall-sub">증명사진을 무제한으로 만들고 저장하세요.</p>
      </div>

      <div className="paywall-card">
        {BENEFITS.map((b) => (
          <div className="benefit" key={b}>
            <span className="benefit-check">✓</span>
            {b}
          </div>
        ))}
      </div>

      <div className="paywall-foot">
        <div className="paywall-price">
          {PRICE_LABEL} <span>· 커피 한 잔 값, 평생 이용</span>
        </div>
        <button
          className="paywall-buy"
          disabled={busy}
          onClick={() => run(purchaseLifetime, '구매가 완료되지 않았습니다.')}
        >
          {busy ? '처리 중…' : '평생 이용 시작'}
        </button>
        <button
          className="paywall-restore"
          disabled={busy}
          onClick={() => run(restorePurchases, '복원할 구매 내역이 없습니다.')}
        >
          구매 복원
        </button>
        <button className="paywall-restore" disabled={busy} onClick={onClose}>
          나중에
        </button>
        {msg && <p className="paywall-msg">{msg}</p>}
      </div>
    </div>
  )
}
