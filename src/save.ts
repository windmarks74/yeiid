// 결과 JPEG 저장. 플랫폼 분기:
//  - 네이티브(폰): 공용 갤러리 Pictures/Yei 에 저장 (커스텀 GallerySave 플러그인 = MediaStore)
//    → 앱을 삭제해도 사진이 갤러리에 남는다. (이전 @capacitor-community/media는 앱 전용 폴더라 삭제 시 소실)
//  - 웹: <a download>
// 네이티브 플러그인은 네이티브에서만 동적 로드한다 (웹 번들 영향 없음).
import { Capacitor } from '@capacitor/core'

const ALBUM = 'Yei'

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}

export async function saveJpeg(blob: Blob, filename: string): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    const { GallerySave } = await import('./native/gallerySave')
    const dataUrl = await blobToDataUrl(blob)
    await GallerySave.saveImage({ data: dataUrl, fileName: filename, album: ALBUM })
    return
  }
  // 웹: 브라우저 다운로드
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 10000)
}
