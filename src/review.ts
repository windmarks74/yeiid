// 인앱 리뷰 요청 (Play In-App Review API). 네이티브 전용, 저장 성공 직후 = 만족도 최고 시점.
// 정책: 첫 저장 성공 직후, 설치당 1회만 요청. 실제 표시 여부·빈도는 Google이 결정(쿼터)하므로
// 호출 자체는 무해하며 실패해도 사용자 흐름에 영향 없음. 별점 유도 문구 금지(정책).
import { Capacitor } from '@capacitor/core'
import { Preferences } from '@capacitor/preferences'

const SAVES_KEY = 'reviewSaves'
const ASKED_KEY = 'reviewAsked'
/** 이 횟수째 저장에서 요청. 1 = 첫 저장 직후(만족도 최고, 이 앱은 1회 저장 사용자가 다수). 무료 소진 업셀과 겹치지 않는 시점 */
const ASK_AT_SAVE = 1

/** 저장 성공 1회 기록 + 조건 충족 시 리뷰 요청. 절대 throw 안 함. */
export async function noteSaveAndMaybeReview(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return
  try {
    const { value: askedRaw } = await Preferences.get({ key: ASKED_KEY })
    const { value: savesRaw } = await Preferences.get({ key: SAVES_KEY })
    const saves = (Number(savesRaw) || 0) + 1
    await Preferences.set({ key: SAVES_KEY, value: String(saves) })
    if (askedRaw || saves < ASK_AT_SAVE) return
    await Preferences.set({ key: ASKED_KEY, value: '1' })
    const { InAppReview } = await import('@capacitor-community/in-app-review')
    await InAppReview.requestReview()
  } catch (e) {
    console.warn('[인앱 리뷰 요청 실패 — 무시]', e)
  }
}
