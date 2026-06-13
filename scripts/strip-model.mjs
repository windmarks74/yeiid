// 모바일 번들에서 배경제거 모델(dist/imgly)을 제외한다.
// 모바일은 배경 제거가 PC 전용(WebView 메모리/스레딩 한계)이라 모델이 불필요 →
// APK/AAB 용량 대폭 절감 + 플레이 업로드 한도(설치 APK ≤ ~200MB) 충족.
// 웹 dev는 public/imgly를 그대로 쓰므로 영향 없음.
import { rmSync, existsSync } from 'node:fs'

const dir = new URL('../dist/imgly', import.meta.url)
if (existsSync(dir)) {
  rmSync(dir, { recursive: true, force: true })
  console.log('dist/imgly 제외됨 (모바일 빌드용)')
} else {
  console.log('dist/imgly 없음 — 건너뜀')
}
