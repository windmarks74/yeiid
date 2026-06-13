// 네이티브 인물 분리 플러그인의 플랫폼 중립 인터페이스.
// Android = ML Kit Selfie Segmentation. (iOS는 같은 인터페이스 뒤에 Vision으로 추후 구현)
import { registerPlugin } from '@capacitor/core'

export interface SegmentationPlugin {
  /** base64 이미지 → 전경 알파 PNG(base64, 접두사 없음) */
  segment(options: { data: string }): Promise<{ cutout: string }>
}

export const Segmentation = registerPlugin<SegmentationPlugin>('Segmentation')
