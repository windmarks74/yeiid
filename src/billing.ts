// 다운로드 카운터 + 영구 라이센스 상태. Capacitor Preferences에 로컬 저장(웹은 localStorage 백업).
// 사진과 무관 — 횟수/구매 플래그만 저장한다.
import { Preferences } from '@capacitor/preferences'

/** 무료 다운로드 횟수. 정책 변경 시 여기만 고치면 됨. */
export const FREE_LIMIT = 5

const KEY = 'billing'

export type BillingState = {
  /** 영구 라이센스 보유 → 무제한 */
  premium: boolean
  /** 무료 다운로드 사용 횟수 */
  used: number
}

const DEFAULT: BillingState = { premium: false, used: 0 }

export async function loadBilling(): Promise<BillingState> {
  const { value } = await Preferences.get({ key: KEY })
  if (!value) return { ...DEFAULT }
  try {
    return { ...DEFAULT, ...(JSON.parse(value) as Partial<BillingState>) }
  } catch {
    return { ...DEFAULT }
  }
}

async function save(s: BillingState): Promise<void> {
  await Preferences.set({ key: KEY, value: JSON.stringify(s) })
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

export function canDownload(s: BillingState): boolean {
  return s.premium || s.used < FREE_LIMIT
}

export function freeLeft(s: BillingState): number {
  return Math.max(0, FREE_LIMIT - s.used)
}
