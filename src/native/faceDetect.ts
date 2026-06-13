// 네이티브 얼굴 검출 플러그인의 플랫폼 중립 인터페이스.
// Android = ML Kit Face Detection. (좌표만 반환 — 스무딩은 JS 캔버스)
import { registerPlugin } from '@capacitor/core'

export type Point = { x: number; y: number }
/** 모두 이미지 대비 0~1 정규화 좌표 */
export type DetectedFace = {
  x: number
  y: number
  w: number
  h: number
  leftEye?: Point
  rightEye?: Point
  mouth?: Point
}

export interface FaceDetectPlugin {
  detect(options: { data: string }): Promise<{ face: DetectedFace | null }>
}

export const FaceDetect = registerPlugin<FaceDetectPlugin>('FaceDetect')
