// 결과 JPEG 저장. 플랫폼 분기:
//  - 네이티브(폰): 공용 갤러리 Pictures/Yei 에 저장 (커스텀 GallerySave 플러그인 = MediaStore)
//    → 앱을 삭제해도 사진이 갤러리에 남는다. (이전 @capacitor-community/media는 앱 전용 폴더라 삭제 시 소실)
//  - 웹: <a download>
// 네이티브 플러그인은 네이티브에서만 동적 로드한다 (웹 번들 영향 없음).
//
// 입력이 Blob이 아니라 data URL인 이유: 인코딩을 동기(toDataURL)로 바꿨고, 네이티브 저장도
// 어차피 data URL을 받는다. 예전에는 Blob → FileReader → data URL로 한 번 더 돌았는데,
// FileReader 콜백도 화면이 멈춰 있으면 전달이 밀리는 경로였다. (imageUtils.encodeJpeg 주석 참고)
import { Capacitor } from '@capacitor/core'
import { dataUrlToBlob } from './imageUtils'

const ALBUM = 'Yei'

export async function saveJpeg(dataUrl: string, filename: string): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    const { GallerySave } = await import('./native/gallerySave')
    await GallerySave.saveImage({ data: dataUrl, fileName: filename, album: ALBUM })
    return
  }
  // 웹: 브라우저 다운로드
  const url = URL.createObjectURL(dataUrlToBlob(dataUrl))
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 10000)
}
