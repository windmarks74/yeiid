// 효과 (면허증·일반 권장 / 여권 모드는 경고). AI 아님 — 캔버스 합성.

export type Effects = {
  /** 단색 배경 색. null = 원본 배경 유지 (배경 제거 안 함) */
  bgColor: string | null
  /** 뽀샤시/글로우 강도 0~100. 0 = 없음 */
  glow: number
  /** 잡티 완화(얼굴 피부 영역 한정) 강도 0~100. 0 = 없음 (네이티브 얼굴검출 필요) */
  smooth: number
}

export const NEUTRAL_EFFECTS: Effects = { bgColor: null, glow: 0, smooth: 0 }

export const BG_COLORS: { id: string; label: string; color: string }[] = [
  { id: 'white', label: '흰색', color: '#ffffff' },
  { id: 'blue', label: '연하늘', color: '#dCEcFb' },
  { id: 'gray', label: '회색', color: '#d9dce1' },
]

/** 여권 규정상 문제될 수 있는 효과가 켜져 있는지 */
export function hasRiskyEdits(e: Effects): boolean {
  return e.bgColor !== null || e.glow > 0 || e.smooth > 0
}

/** 출력 좌표(px)의 얼굴 영역 — 잡티 완화 마스크용 */
export type SmoothFace = {
  cx: number
  cy: number
  rx: number
  ry: number
  /** 보존할 영역(눈·입) 구멍 */
  holes: { x: number; y: number; r: number }[]
}

/**
 * 잡티 완화: 얼굴 타원(눈·입은 구멍) 안에만 약한 블러를 낮은 불투명도로 합성.
 * 눈·눈썹·입술·윤곽은 보존. 전체 이미지를 뭉개지 않는다. (AI 아님 — 마스킹된 캔버스 블러)
 */
export function applySkinSmooth(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  amount: number,
  face: SmoothFace,
): void {
  if (amount <= 0) return
  const strength = amount / 100
  const minR = Math.max(1, Math.min(face.rx, face.ry))
  const radius = Math.max(1, Math.round(minR * 0.05 * (0.6 + strength)))

  // 1) 블러 사본
  const tmp = document.createElement('canvas')
  tmp.width = w
  tmp.height = h
  const tctx = tmp.getContext('2d')!
  tctx.filter = `blur(${radius}px)`
  tctx.drawImage(ctx.canvas, 0, 0)
  tctx.filter = 'none'

  // 2) 마스크: 페더링된 얼굴 타원만 남김 (destination-in)
  tctx.globalCompositeOperation = 'destination-in'
  tctx.save()
  tctx.translate(face.cx, face.cy)
  tctx.scale(face.rx, face.ry) // 단위원 → 타원
  const g = tctx.createRadialGradient(0, 0, 0.35, 0, 0, 1)
  g.addColorStop(0, 'rgba(0,0,0,1)')
  g.addColorStop(0.7, 'rgba(0,0,0,1)')
  g.addColorStop(1, 'rgba(0,0,0,0)')
  tctx.fillStyle = g
  tctx.fillRect(-1, -1, 2, 2)
  tctx.restore()

  // 3) 눈·입 구멍 (destination-out) → 그 부분은 원본 선명하게 유지
  tctx.globalCompositeOperation = 'destination-out'
  for (const hole of face.holes) {
    const hg = tctx.createRadialGradient(hole.x, hole.y, 0, hole.x, hole.y, hole.r)
    hg.addColorStop(0, 'rgba(0,0,0,1)')
    hg.addColorStop(1, 'rgba(0,0,0,0)')
    tctx.fillStyle = hg
    tctx.beginPath()
    tctx.arc(hole.x, hole.y, hole.r, 0, Math.PI * 2)
    tctx.fill()
  }

  // 4) 낮은 불투명도로 원본 위에 합성 (약하게)
  ctx.save()
  ctx.globalAlpha = Math.min(0.55, strength * 0.6)
  ctx.drawImage(tmp, 0, 0)
  ctx.restore()
}

/**
 * 뽀샤시/글로우: 현재 캔버스를 블러한 사본을 soft-light로 합성.
 * 부드러운 빛 번짐 + 잡티 대비 완화 효과 (AI 아님).
 */
export function applyGlow(ctx: CanvasRenderingContext2D, w: number, h: number, amount: number): void {
  if (amount <= 0) return
  const strength = amount / 100 // 0~1
  const radius = Math.max(1, Math.round((w / 400) * (2 + strength * 4)))

  const tmp = document.createElement('canvas')
  tmp.width = w
  tmp.height = h
  const tctx = tmp.getContext('2d')!
  tctx.filter = `blur(${radius}px)`
  tctx.drawImage(ctx.canvas, 0, 0)

  ctx.save()
  ctx.globalCompositeOperation = 'soft-light'
  ctx.globalAlpha = Math.min(0.85, 0.3 + strength * 0.7)
  ctx.drawImage(tmp, 0, 0)
  ctx.restore()
}
