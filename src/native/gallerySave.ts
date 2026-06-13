// 네이티브 갤러리 저장 플러그인의 플랫폼 중립 인터페이스.
// Android = MediaStore 공용 컬렉션(Pictures/<album>)에 저장 → 앱 삭제해도 사진 유지.
import { registerPlugin } from '@capacitor/core'

export interface GallerySavePlugin {
  /** base64(또는 data URL) JPEG를 갤러리 Pictures/<album>에 저장. uri 반환. */
  saveImage(options: { data: string; fileName: string; album?: string }): Promise<{ uri: string }>
}

export const GallerySave = registerPlugin<GallerySavePlugin>('GallerySave')
