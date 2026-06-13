// 가벼운 보정 (여권 모드에서도 허용 범위).
// 모두 선형 픽셀 연산 — 미리보기(작은 캔버스)와 출력(원본 크기) 결과가 정확히 일치하고
// CSS 필터/브라우저 호환성에 의존하지 않는다.

export type Adjust = {
  /** 노출: 선형 곱 (0.6~1.6, 1=원본) */
  exposure: number
  /** 밝기: 가산 오프셋 (-40~40, 0=원본) */
  brightness: number
  /** 화이트밸런스: 색온도 (-30~30, 0=중립). +면 따뜻하게(R↑ B↓) */
  temp: number
}

export const NEUTRAL: Adjust = { exposure: 1, brightness: 0, temp: 0 }

export function isNeutral(a: Adjust): boolean {
  return a.exposure === 1 && a.brightness === 0 && a.temp === 0
}

/** 픽셀 데이터를 제자리에서 보정. 적용 순서: 노출(곱) → 밝기(가산) → 색온도(채널) */
export function applyAdjust(data: Uint8ClampedArray, a: Adjust): void {
  const { exposure, brightness, temp } = a
  for (let i = 0; i < data.length; i += 4) {
    let r = data[i] * exposure + brightness
    let g = data[i + 1] * exposure + brightness
    let b = data[i + 2] * exposure + brightness
    r += temp
    b -= temp
    data[i] = r < 0 ? 0 : r > 255 ? 255 : r
    data[i + 1] = g < 0 ? 0 : g > 255 ? 255 : g
    data[i + 2] = b < 0 ? 0 : b > 255 ? 255 : b
    // 알파(i+3)는 그대로
  }
}
