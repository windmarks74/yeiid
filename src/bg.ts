// 배경 제거(인물 분리). 플랫폼 분기:
//  - 네이티브(모바일): ML Kit Selfie Segmentation (네이티브 플러그인, 온디바이스)
//  - 웹(PC): @imgly/background-removal (로컬 WASM, public/imgly 번들)
// 어느 쪽이든 동일한 누끼(Cutout 캔버스)를 반환 → drawPhoto·배경색 합성 로직 그대로 재사용.
import { Capacitor } from '@capacitor/core'
import { loadImageFromFile, refineCutoutAlpha, type Cutout } from './imageUtils'
import { Segmentation } from './native/segmentation'
import { t } from './strings'

/** 배경 제거 모델(웹 전용): fast=isnet_fp16(88MB), high=isnet(176MB, 가장자리 더 깔끔) */
export type BgModel = 'isnet_fp16' | 'isnet'

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve((reader.result as string).split(',')[1] ?? '')
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}

/** 누끼 PNG(base64)를 정제된 Cutout 캔버스로 (웹·네이티브 공통 꼬리) */
async function toCutout(pngBase64: string): Promise<Cutout> {
  const blob = await (await fetch(`data:image/png;base64,${pngBase64}`)).blob()
  const raw = await loadImageFromFile(new File([blob], 'cutout.png', { type: 'image/png' }))
  const cutout = refineCutoutAlpha(raw) // 가장자리 헤일로 제거
  URL.revokeObjectURL(raw.src)
  return cutout
}

/** 네이티브 경로 (ML Kit) */
async function removeBgNative(source: Blob, onProgress?: (msg: string) => void): Promise<Cutout> {
  onProgress?.(t('bgprogress.separating'))
  const base64 = await blobToBase64(source)
  const { cutout } = await Segmentation.segment({ data: base64 })
  onProgress?.(t('bgprogress.refining'))
  return toCutout(cutout)
}

/** 웹 경로 (@imgly), 첫 사용 시에만 라이브러리 동적 로드 */
async function removeBgWeb(
  source: Blob,
  model: BgModel,
  onProgress?: (msg: string) => void,
): Promise<Cutout> {
  const { removeBackground } = await import('@imgly/background-removal')
  const blob = await removeBackground(source, {
    publicPath: `${window.location.origin}/imgly/`,
    model,
    progress: (key, current, total) => {
      const pct = total ? Math.round((current / total) * 100) : 0
      const stage = key.startsWith('fetch') ? t('bgprogress.preparingModel') : t('bgprogress.processing')
      onProgress?.(`${stage} ${pct}%`)
    },
  })
  onProgress?.(t('bgprogress.refining'))
  const raw = await loadImageFromFile(new File([blob], 'cutout.png', { type: blob.type }))
  const cutout = refineCutoutAlpha(raw)
  URL.revokeObjectURL(raw.src)
  return cutout
}

/**
 * 원본 이미지의 배경을 제거하고 가장자리를 정제한 누끼(canvas)를 만든다.
 * 무거운 작업 — 원본당 1회만 실행하고 호출부에서 캐시한다.
 */
export async function removeBg(
  source: Blob,
  model: BgModel,
  onProgress?: (msg: string) => void,
): Promise<Cutout> {
  return Capacitor.isNativePlatform()
    ? removeBgNative(source, onProgress)
    : removeBgWeb(source, model, onProgress)
}
