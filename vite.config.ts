import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 교차 출처 격리 헤더 → crossOriginIsolated 활성화 → 배경 제거(onnxruntime) 멀티스레딩.
// COEP는 credentialless 사용: 스레딩을 켜면서도 CDN 모델 다운로드(교차 출처)를 막지 않는다.
const coiHeaders = {
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Embedder-Policy': 'credentialless',
}

// 배경 제거 모델/런타임은 public/imgly 에 번들되어 같은 출처에서 서빙된다 (완전 오프라인).
// (최초 받기: node scripts/fetch-model.mjs)
export default defineConfig({
  plugins: [react()],
  server: { headers: coiHeaders },
  preview: { headers: coiHeaders },
})
