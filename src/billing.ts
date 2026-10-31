// 다운로드 카운터 + 영구 라이센스 상태. Capacitor Preferences에 로컬 저장(웹은 localStorage 백업).
// 사진과 무관 — 횟수/구매 플래그만 저장한다.
import { Preferences } from '@capacitor/preferences'

/**
 * 기존 사용자 보존 한도. **이 값을 신규에 쓰지 않는다.**
 * 2026-10-31 이전에 설치해 기록이 남아 있는 기기는 계속 5회를 받는다.
 * 이미 깐 사용자에게서 횟수를 빼앗으면 평점이 상한다(BACKLOG 4-X).
 */
export const FREE_LIMIT = 5

/**
 * 신규 설치 한도. 2026-10-31 도입.
 *
 * 왜 3인가(2가 아니라): 돈 낼 사람(용도 여러 개·반복 사용)은 3에서도 똑같이 막힌다.
 * 2로 낮춰 추가로 잡히는 건 "한 장 필요한데 재시도 두 번 한 사람"인데, 그 사람은
 * 결제하지 않고 화만 낸다. 손해가 비대칭이다 — 3이 후하면 복구 가능하지만
 * 2가 빡빡해서 생긴 평점 하락은 복구가 어렵다.
 *
 * ⚠️ 바꾸면 홈페이지 9곳의 "N장 무료"도 같이 고쳐야 한다. check-spec-sync.mjs 가 검사한다.
 */
export const FREE_LIMIT_NEW = 3

const KEY = 'billing'

export type BillingState = {
  /** 영구 라이센스 보유 → 무제한 */
  premium: boolean
  /** 무료 다운로드 사용 횟수 */
  used: number
  /**
   * 이 기기에 부여된 무료 한도. **최초 로드 때 한 번 정해지고 다시는 바뀌지 않는다.**
   * 없으면(= 구버전 기록) 기존 사용자로 보고 FREE_LIMIT 을 준다.
   */
  limit?: number
}

const DEFAULT: BillingState = { premium: false, used: 0 }

/**
 * 코호트는 여기서 단 한 번 정해진다.
 *
 * - 저장된 기록이 **없다** → 이 기기에서 처음 연 것 → 신규(3). 바로 저장해 못 박는다.
 * - 기록은 있는데 `limit` 이 **없다** → 이 변경 전부터 쓰던 사용자 → 5 를 부여하고 못 박는다.
 * - 깨진 기록 → **5 로 간다.** 기존 사용자일 가능성이 있으므로 후한 쪽으로 실패한다.
 *
 * ⚠️ 한 번 저장하면 다음 로드부터는 이 분기를 타지 않는다. 앱 업데이트로 한도가 바뀌어도
 *    이미 깐 사람의 숫자는 움직이지 않는다 — 그게 이 설계의 목적이다.
 */
export async function loadBilling(): Promise<BillingState> {
  const { value } = await Preferences.get({ key: KEY })
  if (!value) {
    const fresh: BillingState = { ...DEFAULT, limit: FREE_LIMIT_NEW }
    await save(fresh)
    return fresh
  }
  try {
    const parsed = JSON.parse(value) as Partial<BillingState>
    if (parsed.limit == null) {
      const migrated: BillingState = { ...DEFAULT, ...parsed, limit: FREE_LIMIT }
      await save(migrated)
      return migrated
    }
    return { ...DEFAULT, ...parsed }
  } catch {
    const recovered: BillingState = { ...DEFAULT, limit: FREE_LIMIT }
    await save(recovered)
    return recovered
  }
}

async function save(s: BillingState): Promise<void> {
  await Preferences.set({ key: KEY, value: JSON.stringify(s) })
}

/** 이 기기의 무료 한도. 화면에 숫자를 쓸 땐 전부 이걸 쓴다 — 상수를 직접 쓰면 코호트가 깨진다. */
export function limitOf(s: BillingState): number {
  return s.limit ?? FREE_LIMIT
}

/** 다운로드 1회 기록 (프리미엄이면 카운트 안 함) */
export async function recordDownload(s: BillingState): Promise<BillingState> {
  if (s.premium) return s
  const next = { ...s, used: s.used + 1 }
  await save(next)
  return next
}

/** 구매/복원 성공 → 영구 해제 */
export async function grantPremium(s: BillingState): Promise<BillingState> {
  const next = { ...s, premium: true }
  await save(next)
  return next
}

/**
 * 환불·취소로 스토어 권한이 사라졌을 때 로컬 프리미엄을 회수한다.
 *
 * `used`는 일부러 보존한다. 초기화하면 "구매 → 쓰고 환불 → 무료 횟수 부활"이
 * 반복 가능해진다. 환불은 결제를 되돌리는 것이지 쓴 횟수를 되돌리는 게 아니다.
 * `limit` 도 보존한다 — 코호트는 결제와 무관하다.
 *
 * ⚠️ 호출 조건: entitlement가 **확실히 비활성**일 때만. 오프라인·오류('unknown')로
 * 부르면 정당한 구매자가 잠긴다. iap.ts getEntitlementStatus() 참고.
 */
export async function revokePremium(s: BillingState): Promise<BillingState> {
  if (!s.premium) return s
  const next = { ...s, premium: false }
  await save(next)
  return next
}

export function canDownload(s: BillingState): boolean {
  return s.premium || s.used < limitOf(s)
}

export function freeLeft(s: BillingState): number {
  return Math.max(0, limitOf(s) - s.used)
}
