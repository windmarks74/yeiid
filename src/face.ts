// 얼굴 검출 (잡티 완화 영역 한정). 네이티브(ML Kit)만 — 웹은 null 반환.
import { Capacitor } from '@capacitor/core'
import { FaceDetect } from './native/faceDetect'
import type { FaceBox } from './imageUtils'

/** 얼굴 검출용 입력 상한 (긴 변 px) — 좌표는 0~1 정규화라 작아도 결과 동일, 훨씬 빠름 */
const DETECT_MAX = 720

/** 검출용으로 다운스케일한 JPEG base64 (접두사 제거) */
function toDetectBase64(canvas: HTMLCanvasElement): string {
  const scale = Math.min(1, DETECT_MAX / Math.max(canvas.width, canvas.height))
  if (scale >= 1) return canvas.toDataURL('image/jpeg', 0.85).split(',')[1] ?? ''
  const w = Math.round(canvas.width * scale)
  const h = Math.round(canvas.height * scale)
  const small = document.createElement('canvas')
  small.width = w
  small.height = h
  small.getContext('2d')!.drawImage(canvas, 0, 0, w, h)
  return small.toDataURL('image/jpeg', 0.85).split(',')[1] ?? ''
}

/** 가장 큰 얼굴을 source-정규화 FaceBox로. 없거나 웹이면 null. (실패해도 throw 안 함) */
export async function detectFace(source: HTMLCanvasElement): Promise<FaceBox | null> {
  if (!Capacitor.isNativePlatform()) return null
  try {
    const base64 = toDetectBase64(source)
    const { face } = await FaceDetect.detect({ data: base64 })
    if (!face) return null
    const eyes: { x: number; y: number }[] = []
    if (face.leftEye) eyes.push(face.leftEye)
    if (face.rightEye) eyes.push(face.rightEye)
    return {
      cx: face.x + face.w / 2,
      cy: face.y + face.h / 2,
      rx: face.w / 2,
      ry: face.h / 2,
      eyes,
      mouth: face.mouth,
    }
  } catch (e) {
    console.error('[얼굴 검출 실패]', e)
    return null
  }
}
