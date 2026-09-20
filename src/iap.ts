// 인앱결제(IAP) — RevenueCat (@revenuecat/purchases-capacitor).
// 화면은 이 함수들만 호출하고, 구현은 플랫폼별로 갈린다.
//   - 네이티브(폰): RevenueCat 실제 구매/복원/entitlement 확인
//   - 웹: 스텁(구매=성공, 복원=없음) — 플로우만 검증
// 플러그인은 네이티브에서만 동적 로드한다 (웹 번들 영향 없음).
import { Capacitor } from '@capacitor/core'
import { t, LANG } from './strings'

/** 플레이 콘솔에 만들 일회성(managed) 상품 ID — RevenueCat 상품과 동일하게 맞출 것 */
export const PRODUCT_ID = 'yei_lifetime'
/** RevenueCat 대시보드에서 만들 Entitlement 식별자 */
export const ENTITLEMENT_ID = 'premium'
/** 가격 표시 폴백(웹/조회 실패용). 실제 표시는 getPriceString의 스토어 현지화 가격을 우선 사용.
 *  ⚠️ Play Console 의 실제 가격과 맞출 것. 2026-09-20 확인: 미국 USD 2.99(₩4,900 자동 환산),
 *  한국 ₩4,900. 콘솔에서 가격을 바꾸면 여기와 site/yeiid/en/index.html 도 같이 고친다. */
export const PRICE_LABEL = LANG === 'en' ? '$2.99' : '₩4,900'

// RevenueCat 공개 SDK 키 (Google). 대시보드 → Project settings → API keys → "goog_..." 키.
// public 키라 앱에 포함돼도 안전. 비어있으면 결제 시 안내 에러.
const RC_API_KEY = 'goog_INvlbGQYnqoAIsJTLKEDlyNCFHh'

let configured = false
async function ensureConfigured() {
  if (!RC_API_KEY) {
    throw new Error(t('iap.noKey'))
  }
  if (configured) return
  const { Purchases } = await import('@revenuecat/purchases-capacitor')
  await Purchases.configure({ apiKey: RC_API_KEY })
  configured = true
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isActive(customerInfo: any): boolean {
  return !!customerInfo?.entitlements?.active?.[ENTITLEMENT_ID]
}

/** 구매 시도. 성공(해제) 시 true. (웹 스텁: 항상 성공으로 플로우 검증) */
export async function purchaseLifetime(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return true
  const { Purchases } = await import('@revenuecat/purchases-capacitor')
  await ensureConfigured()
  const offerings = await Purchases.getOfferings()
  const packages = offerings.current?.availablePackages ?? []
  const pkg = packages.find((p) => p.product.identifier === PRODUCT_ID) ?? packages[0]
  if (!pkg) throw new Error(t('iap.noProduct'))
  const { customerInfo } = await Purchases.purchasePackage({ aPackage: pkg })
  return isActive(customerInfo)
}

/** 구매 복원. 복원된 라이센스가 있으면 true. (웹 스텁: 없음) */
export async function restorePurchases(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false
  const { Purchases } = await import('@revenuecat/purchases-capacitor')
  await ensureConfigured()
  const { customerInfo } = await Purchases.restorePurchases()
  return isActive(customerInfo)
}

/** entitlement 확인 결과. 'unknown' = 네트워크·키 문제로 **확인 실패**(권한 없음이 아니다). */
export type EntitlementStatus = 'active' | 'inactive' | 'unknown'

/**
 * 앱 시작 시 기존 구매 여부 확인 (재설치/기기변경 시 같은 구글 계정이면 자동 반영) +
 * 환불·취소 감지. 절대 throw 하지 않는다.
 *
 * 왜 3상태인가: 환불 후 권한을 회수하려면 "비활성"을 알아야 하는데, 실패를 false로
 * 뭉개면 오프라인·오류와 구분이 안 된다. 그걸로 회수하면 **비행기 모드에서 앱을 켠
 * 정당한 구매자가 잠긴다.** 'unknown'일 때는 로컬 상태를 건드리지 않는 것이 호출부의 계약이다.
 */
export async function getEntitlementStatus(): Promise<EntitlementStatus> {
  if (!Capacitor.isNativePlatform() || !RC_API_KEY) return 'unknown'
  try {
    const { Purchases } = await import('@revenuecat/purchases-capacitor')
    await ensureConfigured()
    const { customerInfo } = await Purchases.getCustomerInfo()
    return isActive(customerInfo) ? 'active' : 'inactive'
  } catch {
    return 'unknown'
  }
}

/**
 * 무료 횟수 정책을 숫자로 판단하기 위한 **익명 집계**. 절대 throw 하지 않는다.
 *
 * 왜 필요한가 (docs/funnel-2026-09-20.md): 설치는 느는데 결제가 0이다. 원인이
 * "페이월에 닿지 못한다"인지 "닿았는데 안 산다"인지 구분이 안 되면 FREE_LIMIT 을
 * 손댈 근거가 없다. 줄이는 건 되돌리기 어려운 변경이라 추측으로 하면 안 된다.
 *
 * 왜 RevenueCat 인가: 이 앱은 실행할 때마다 entitlement 조회로 이미 RevenueCat 과
 * 통신한다(익명 App User ID + IP). 구독자 속성에 정수 두 개를 얹는 것이라
 * **새 업체도, 새 서버도, 새 데이터 흐름도 생기지 않는다.** 자체 엔드포인트를 세우면
 * 수집처가 하나 더 느는 셈이라 오히려 공개할 게 많아진다.
 *
 * 보내는 것은 이 둘뿐이다:
 *   - free_used    무료 다운로드 사용 횟수 (0~)
 *   - paywall_seen 페이월을 본 적 있는지 ("1"/"0")
 * 사진·얼굴·파일명·용도 선택 이력은 **보내지 않는다.**
 *
 * ⚠️ 이건 한시적 계측이다. 무료 횟수 결정이 끝나면 제거한다 — 남겨두면
 *    "왜 수집하는지" 설명할 수 없는 항목이 된다. BACKLOG 에 제거 항목을 걸어뒀다.
 */
export async function reportAnonymousUsage(used: number, paywallSeen: boolean): Promise<void> {
  if (!Capacitor.isNativePlatform() || !RC_API_KEY) return
  try {
    const { Purchases } = await import('@revenuecat/purchases-capacitor')
    await ensureConfigured()
    await Purchases.setAttributes({
      free_used: String(used),
      paywall_seen: paywallSeen ? '1' : '0',
    })
  } catch {
    // 집계 실패는 앱 동작에 영향을 주지 않는다 — 조용히 넘어간다.
  }
}

/**
 * 스토어 현지화 가격 문자열 (예 "$2.99"/"₩4,900" — 구글 플레이가 사용자 국가에 매긴 가격).
 * 표시값과 실제 청구가 항상 일치한다. 웹/키 미설정/오류면 null → 호출부에서 PRICE_LABEL 폴백.
 */
export async function getPriceString(): Promise<string | null> {
  if (!Capacitor.isNativePlatform() || !RC_API_KEY) return null
  try {
    const { Purchases } = await import('@revenuecat/purchases-capacitor')
    await ensureConfigured()
    const offerings = await Purchases.getOfferings()
    const packages = offerings.current?.availablePackages ?? []
    const pkg = packages.find((p) => p.product.identifier === PRODUCT_ID) ?? packages[0]
    return pkg?.product.priceString ?? null
  } catch {
    return null
  }
}
