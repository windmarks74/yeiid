import { useState } from 'react'
import { PRICE_LABEL, purchaseLifetime, restorePurchases } from './iap'
import { t, type StringKey } from './strings'

type Props = {
  /** 구매/복원 성공 → 영구 해제 */
  onUnlock: () => void
  onClose: () => void
}

const BENEFITS: StringKey[] = [
  'paywall.benefit.unlimited',
  'paywall.benefit.intl',
  'paywall.benefit.printsheet',
  'paywall.benefit.ondevice',
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
      setMsg(t('common.errorPrefix', { msg: (e as Error)?.message ?? String(e) }))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="paywall-screen" role="dialog" aria-modal>
      <button className="paywall-x" onClick={onClose} aria-label={t('paywall.close')}>
        ✕
      </button>

      <div className="paywall-hero">
        <div className="paywall-icon">∞</div>
        <h2>{t('paywall.title')}</h2>
        <p className="paywall-sub">{t('paywall.sub')}</p>
      </div>

      <div className="paywall-card">
        {BENEFITS.map((b) => (
          <div className="benefit" key={b}>
            <span className="benefit-check">✓</span>
            {t(b)}
          </div>
        ))}
      </div>

      <div className="paywall-foot">
        <div className="paywall-price">
          {PRICE_LABEL} <span>{t('paywall.priceNote')}</span>
        </div>
        <button
          className="paywall-buy"
          disabled={busy}
          onClick={() => run(purchaseLifetime, t('paywall.purchaseIncomplete'))}
        >
          {busy ? t('paywall.processing') : t('paywall.buy')}
        </button>
        <button
          className="paywall-restore"
          disabled={busy}
          onClick={() => run(restorePurchases, t('paywall.noRestore'))}
        >
          {t('paywall.restore')}
        </button>
        <button className="paywall-restore" disabled={busy} onClick={onClose}>
          {t('paywall.later')}
        </button>
        {msg && <p className="paywall-msg">{msg}</p>}
      </div>
    </div>
  )
}
