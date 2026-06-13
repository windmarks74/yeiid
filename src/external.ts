// 외부 링크 열기. 네이티브는 시스템 브라우저(Custom Tab — 인증/로그인 정상 동작),
// 웹은 새 탭. 앱 웹뷰 안에서 열지 않는다. 사진은 전송하지 않으며 URL만 연다.
import { Capacitor } from '@capacitor/core'

export async function openExternal(url: string): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    const { Browser } = await import('@capacitor/browser')
    await Browser.open({ url })
    return
  }
  window.open(url, '_blank', 'noopener')
}
