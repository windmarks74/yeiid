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
/** 가격 표시 폴백(웹/조회 실패용). 실제 표시는 getPriceString의 스토어 현지화 가격을 우선 사용. */
export const PRICE_LABEL = LANG === 'en' ? '$4.99' : '₩4,900'

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

/**
 * 앱 시작 시 기존 구매 여부 확인 (재설치/기기변경 시 같은 구글 계정이면 자동 반영).
 * 키 미설정/웹/오류면 false. (절대 throw 안 함)
 */
export async function checkEntitlement(): Promise<boolean> {
  if (!Capacitor.isNativePlatform() || !RC_API_KEY) return false
  try {
    const { Purchases } = await import('@revenuecat/purchases-capacitor')
    await ensureConfigured()
    const { customerInfo } = await Purchases.getCustomerInfo()
    return isActive(customerInfo)
  } catch {
    return false
  }
}

/**
 * 스토어 현지화 가격 문자열 (예 "$4.99"/"₩4,900" — 구글 플레이가 사용자 국가에 매긴 가격).
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
