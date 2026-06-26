// 이미지 로드 / 크롭 렌더 / 용량 포맷. 모두 클라이언트(Canvas)에서 처리한다.

import { applyAdjust, isNeutral, type Adjust } from './adjust'
import { applyGlow, applySkinSmooth, type Effects } from './effects'
import { t } from './strings'

/** 정규화된 크롭 영역 (이미지 자연크기 대비 0~1) */
export type CropRect = { x: number; y: number; w: number; h: number }

/** 정제된 누끼는 원본과 동일 치수의 캔버스로 보관한다 */
export type Cutout = HTMLCanvasElement

/** 얼굴 영역 (소스 이미지 대비 0~1 정규화). 잡티 완화 마스크용 */
export type FaceBox = {
  cx: number
  cy: number
  rx: number
  ry: number
  eyes: { x: number; y: number }[]
  mouth?: { x: number; y: number }
}

/** 렌더에 필요한 입력 묶음 (미리보기·출력 공용) */
export type RenderInput = {
  /** 정규화된 소스 캔버스 (loadSourcePhoto 결과) */
  img: HTMLCanvasElement
  /** 배경 제거 누끼 (없으면 null). bgColor가 지정되면 이걸 합성한다. */
  cutout: Cutout | null
  crop: CropRect
  adjust: Adjust
  effects: Effects
  /** 얼굴 영역 (없으면 잡티 완화 생략) */
  face?: FaceBox | null
  /** 기울기 보정 각도(도). 빈 모서리 없게 자동 확대. 기본 0 */
  rotation?: number
}

/** w×h 콘텐츠를 각도 rad로 회전했을 때 빈 모서리가 안 생기는 최소 확대율 */
function coverScale(w: number, h: number, rad: number): number {
  const c = Math.abs(Math.cos(rad))
  const s = Math.abs(Math.sin(rad))
  return Math.max((w * c + h * s) / w, (w * s + h * c) / h)
}

export function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      // 객체 URL은 해제하지 않는다 — 미리보기 <img>가 같은 src를 재사용한다.
      // 교체 시 호출부에서 이전 src를 해제한다.
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error(t('img.cannotLoad')))
    }
    img.src = url
  })
}

/** 소스 사진 다운스케일 상한 (긴 변 px) — 메모리/속도, 출력(최대 ~600px)엔 충분 */
const MAX_SOURCE = 2000

async function convertHeic(file: File): Promise<Blob> {
  const heic2any = (await import('heic2any')).default
  const out = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.92 })
  return Array.isArray(out) ? out[0] : (out as Blob)
}

/**
 * 사용자 업로드 사진 로더: HEIC 변환 → EXIF 방향 적용(똑바로) → 대용량 다운스케일.
 * 정규화된 캔버스를 반환한다(JPEG 재인코딩 안 함 → 빠름).
 * 배경제거·얼굴검출용 blob은 호출부에서 필요할 때만 캔버스를 인코딩(지연).
 * 실패 시 reject — 호출부에서 안내한다.
 */
export async function loadSourcePhoto(file: File): Promise<HTMLCanvasElement> {
  let src: Blob = file
  if (/image\/hei[cf]/i.test(file.type) || /\.(heic|heif)$/i.test(file.name)) {
    src = await convertHeic(file)
  }

  // 디코드 + EXIF 방향 적용. 미지원 브라우저는 <img>로 폴백(브라우저가 방향 적용).
  let source: ImageBitmap | HTMLImageElement
  let sw: number
  let sh: number
  try {
    const bmp = await createImageBitmap(src, { imageOrientation: 'from-image' })
    source = bmp
    sw = bmp.width
    sh = bmp.height
  } catch {
    const img = await loadImageFromFile(
      src instanceof File ? src : new File([src], 'photo', { type: src.type || 'image/jpeg' }),
    )
    source = img
    sw = img.naturalWidth
    sh = img.naturalHeight
  }
  if (!sw || !sh) throw new Error(t('img.cannotRead'))

  const scale = Math.min(1, MAX_SOURCE / Math.max(sw, sh))
  const w = Math.round(sw * scale)
  const h = Math.round(sh * scale)
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(source, 0, 0, w, h)
  if (source instanceof ImageBitmap) source.close()
  return canvas
}

/**
 * 전체 렌더 파이프라인을 ctx의 (0,0,w,h)에 그린다. 순서:
 * 배경(단색 채우기→누끼 합성 / 또는 원본) → 보정 → 글로우.
 * 미리보기(작은 캔버스)와 출력(원본 크기)이 같은 파이프라인을 쓴다.
 */
export function drawPhoto(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  input: RenderInput,
): void {
  const { img, cutout, crop, adjust, effects, face, rotation } = input
  ctx.imageSmoothingQuality = 'high'
  ctx.clearRect(0, 0, w, h)

  // 배경 교체: 단색 채우고 누끼를 그 위에 합성. 누끼 준비 전이면 원본으로 폴백.
  // 누끼는 원본과 동일 치수이므로 크롭 좌표는 항상 원본 기준으로 계산한다.
  const useCutout = effects.bgColor !== null && cutout !== null
  const src: CanvasImageSource = useCutout ? cutout : img
  if (useCutout) {
    ctx.fillStyle = effects.bgColor as string
    ctx.fillRect(0, 0, w, h)
  }
  const sx = crop.x * img.width
  const sy = crop.y * img.height
  const sw = crop.w * img.width
  const sh = crop.h * img.height

  const rad = ((rotation ?? 0) * Math.PI) / 180
  const cov = rad ? coverScale(w, h, rad) : 1
  if (rad) {
    // 중심 기준 회전 + 빈 모서리 없게 cover 확대
    ctx.save()
    ctx.translate(w / 2, h / 2)
    ctx.rotate(rad)
    ctx.scale(cov, cov)
    ctx.drawImage(src, sx, sy, sw, sh, -w / 2, -h / 2, w, h)
    ctx.restore()
  } else {
    ctx.drawImage(src, sx, sy, sw, sh, 0, 0, w, h)
  }

  if (!isNeutral(adjust)) {
    const imageData = ctx.getImageData(0, 0, w, h)
    applyAdjust(imageData.data, adjust)
    ctx.putImageData(imageData, 0, 0)
  }

  applyGlow(ctx, w, h, effects.glow)

  // 잡티 완화: 얼굴(source-정규화)을 출력 좌표로 매핑(회전·cover 반영) 후 피부 영역에만 적용
  if (effects.smooth > 0 && face) {
    const cosv = Math.cos(rad)
    const sinv = Math.sin(rad)
    // 미회전 매핑 → 중심 기준 cover 확대 → 회전 (drawImage 변환과 동일)
    const tf = (nx: number, ny: number) => {
      const ux = ((nx - crop.x) / crop.w) * w
      const uy = ((ny - crop.y) / crop.h) * h
      const dx = (ux - w / 2) * cov
      const dy = (uy - h / 2) * cov
      return { x: w / 2 + dx * cosv - dy * sinv, y: h / 2 + dx * sinv + dy * cosv }
    }
    const rx = (face.rx / crop.w) * w * cov
    const ry = (face.ry / crop.h) * h * cov
    const fc = tf(face.cx, face.cy)
    const holes = face.eyes.map((e) => {
      const p = tf(e.x, e.y)
      return { x: p.x, y: p.y, r: rx * 0.32 }
    })
    if (face.mouth) {
      const p = tf(face.mouth.x, face.mouth.y)
      holes.push({ x: p.x, y: p.y, r: rx * 0.3 })
    }
    applySkinSmooth(ctx, w, h, effects.smooth, { cx: fc.x, cy: fc.y, rx, ry, holes })
  }
}

/** 전체 파이프라인을 정확한 출력 픽셀로 렌더한 캔버스를 반환 (출력용) */
export function renderCrop(targetW: number, targetH: number, input: RenderInput): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = targetW
  canvas.height = targetH
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!
  drawPhoto(ctx, targetW, targetH, input)
  return canvas
}

/**
 * 누끼 가장자리 정제 튜닝값 (폰에서 보며 조정). ↑/↓ 의미는 주석 참고.
 * 모델(ML Kit) 마스크가 저해상도라 흐릿한 가장자리를 원본 윤곽에 맞춰 정교화한다.
 */
const REFINE = {
  /** guided filter 윈도우(px 비례 계산) 상·하한 */
  radiusDiv: 240, // 클수록 윈도우 작아짐(세밀) — max(w,h)/이 값
  radiusMin: 5,
  radiusMax: 16,
  /** guided filter 에지 민감도 — 작을수록 원본 윤곽에 더 '딱' 붙음(샤프) */
  eps: 4e-4,
  /** 전이 가파름(딱딱함). 1.5~3.5 */
  contrast: 2.3,
  /** 안쪽 수축(헤일로 제거). 0~0.15 (0.05=약, 0.1=강) */
  erode: 0.05,
  /** 가장자리 색 정화 반복(전경색을 fringe로 번지게). 0~5 */
  decontamPasses: 3,
}

/**
 * 누끼 가장자리 정제: guided filter로 모델 알파를 원본 명암 경계에 스냅 →
 * 전이 가파르게 + 안쪽 수축(헤일로 제거) + 가장자리 색 정화(흰배경 fringe 감소).
 * 원본과 동일 치수의 캔버스를 반환한다. (배경 선택 시 1회만 실행)
 */
export function refineCutoutAlpha(img: HTMLImageElement): Cutout {
  const w = img.naturalWidth
  const h = img.naturalHeight
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!
  ctx.drawImage(img, 0, 0)
  if (w === 0 || h === 0) return canvas

  const id = ctx.getImageData(0, 0, w, h)
  const data = id.data
  const n = w * h

  // 가이드 I = 원본 명암(0~1), 입력 p = 모델 알파(0~1)
  const I = new Float32Array(n)
  const p = new Float32Array(n)
  for (let i = 0; i < n; i++) {
    const o = i * 4
    I[i] = (0.299 * data[o] + 0.587 * data[o + 1] + 0.114 * data[o + 2]) / 255
    p[i] = data[o + 3] / 255
  }

  // 1) guided filter — 흐릿한 알파를 원본 윤곽에 스냅
  const r = Math.min(REFINE.radiusMax, Math.max(REFINE.radiusMin, Math.round(Math.max(w, h) / REFINE.radiusDiv)))
  const q = guidedFilter(I, p, w, h, r, REFINE.eps)

  // 2) 전이 가파르게(contrast) + 안쪽 수축(erode → 헤일로 제거)
  for (let i = 0; i < n; i++) {
    const a = (q[i] - 0.5) * REFINE.contrast + 0.5 - REFINE.erode
    q[i] = a < 0 ? 0 : a > 1 ? 1 : a
  }

  // 3) 가장자리 색 정화 — 단단한 전경색을 fringe로 번지게(흰배경 헤일로 감소)
  if (REFINE.decontamPasses > 0) bleedForeground(data, q, w, h, REFINE.decontamPasses)

  for (let i = 0; i < n; i++) data[i * 4 + 3] = Math.round(q[i] * 255)
  ctx.putImageData(id, 0, 0)
  return canvas
}

/** He et al. guided filter (가이드 I, 입력 p, 윈도우 r, eps) → 결과 q[0~1]. 박스평균 재사용. */
function guidedFilter(
  I: Float32Array,
  p: Float32Array,
  w: number,
  h: number,
  r: number,
  eps: number,
): Float32Array {
  const n = I.length
  const Ip = new Float32Array(n)
  const II = new Float32Array(n)
  for (let i = 0; i < n; i++) {
    Ip[i] = I[i] * p[i]
    II[i] = I[i] * I[i]
  }
  const meanI = boxBlurChannel(I, w, h, r)
  const meanP = boxBlurChannel(p, w, h, r)
  const meanIp = boxBlurChannel(Ip, w, h, r)
  const meanII = boxBlurChannel(II, w, h, r)
  const a = new Float32Array(n)
  const b = new Float32Array(n)
  for (let i = 0; i < n; i++) {
    const varI = meanII[i] - meanI[i] * meanI[i]
    const covIp = meanIp[i] - meanI[i] * meanP[i]
    const ai = covIp / (varI + eps)
    a[i] = ai
    b[i] = meanP[i] - ai * meanI[i]
  }
  const meanA = boxBlurChannel(a, w, h, r)
  const meanB = boxBlurChannel(b, w, h, r)
  const q = new Float32Array(n)
  for (let i = 0; i < n; i++) {
    const v = meanA[i] * I[i] + meanB[i]
    q[i] = v < 0 ? 0 : v > 1 ? 1 : v
  }
  return q
}

/** 전경색 번짐: 알파 낮은 가장자리의 RGB를 알파 높은 이웃 색으로 채워 헤일로(배경색 띠) 정화. */
function bleedForeground(
  data: Uint8ClampedArray,
  alpha: Float32Array,
  w: number,
  h: number,
  passes: number,
): void {
  const n = w * h
  const R = new Float32Array(n)
  const G = new Float32Array(n)
  const B = new Float32Array(n)
  const wt = new Float32Array(n)
  for (let i = 0; i < n; i++) {
    const o = i * 4
    R[i] = data[o]
    G[i] = data[o + 1]
    B[i] = data[o + 2]
    wt[i] = alpha[i] // 가중치 = 알파(전경일수록 ↑)
  }
  for (let pass = 0; pass < passes; pass++) {
    const nR = R.slice()
    const nG = G.slice()
    const nB = B.slice()
    const nW = wt.slice()
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = y * w + x
        if (alpha[i] > 0.9 || alpha[i] <= 0.001) continue // 단단한 전경·배경은 유지
        let sr = R[i] * wt[i]
        let sg = G[i] * wt[i]
        let sb = B[i] * wt[i]
        let sw = wt[i]
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (!dx && !dy) continue
            const xx = x + dx
            const yy = y + dy
            if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue
            const j = yy * w + xx
            const ww = wt[j]
            sr += R[j] * ww
            sg += G[j] * ww
            sb += B[j] * ww
            sw += ww
          }
        }
        if (sw > 1e-4) {
          nR[i] = sr / sw
          nG[i] = sg / sw
          nB[i] = sb / sw
          nW[i] = Math.max(wt[i], sw / 9) // 번진 색이 다음 패스의 전경 소스가 되도록
        }
      }
    }
    R.set(nR)
    G.set(nG)
    B.set(nB)
    wt.set(nW)
  }
  for (let i = 0; i < n; i++) {
    const o = i * 4
    data[o] = R[i]
    data[o + 1] = G[i]
    data[o + 2] = B[i]
  }
}

/** 단일 채널 분리형 박스 평균 (러닝섬 = 반경 무관 O(n), 가장자리 클램프) */
function boxBlurChannel(src: Float32Array, w: number, h: number, r: number): Float32Array {
  const win = 2 * r + 1
  const tmp = new Float32Array(src.length)
  const out = new Float32Array(src.length)
  const cl = (v: number, max: number) => (v < 0 ? 0 : v > max ? max : v)
  // 가로
  for (let y = 0; y < h; y++) {
    const row = y * w
    let sum = 0
    for (let k = -r; k <= r; k++) sum += src[row + cl(k, w - 1)]
    tmp[row] = sum / win
    for (let x = 1; x < w; x++) {
      sum += src[row + cl(x + r, w - 1)] - src[row + cl(x - r - 1, w - 1)]
      tmp[row + x] = sum / win
    }
  }
  // 세로
  for (let x = 0; x < w; x++) {
    let sum = 0
    for (let k = -r; k <= r; k++) sum += tmp[cl(k, h - 1) * w + x]
    out[x] = sum / win
    for (let y = 1; y < h; y++) {
      sum += tmp[cl(y + r, h - 1) * w + x] - tmp[cl(y - r - 1, h - 1) * w + x]
      out[y * w + x] = sum / win
    }
  }
  return out
}

/** 인화 시트 규격: 4×6인치(10×15cm) @300DPI 세로 */
export const PRINT_SHEET = { w: 1200, h: 1800 }
/** 하단 브랜드·규격 라벨 띠 높이(px). 잘려나가는 여백이며 셀 배치에서 제외된다. */
const FOOTER_H = 70

/** 셀(증명사진) 크기로 시트에 몇 칸이 들어가는지 (하단 라벨 띠 제외) */
export function sheetGrid(cellW: number, cellH: number) {
  const cols = Math.max(1, Math.floor(PRINT_SHEET.w / cellW))
  const rows = Math.max(1, Math.floor((PRINT_SHEET.h - FOOTER_H) / cellH))
  return { cols, rows, count: cols * rows }
}

/**
 * 완성 사진을 4×6 인화지에 그리드로 배치(물리 크기 정확 — 셀 = 규격 px 그대로).
 * 각 셀에 얇은 컷 가이드. 하단 footer(여백, 잘라내면 사라짐)에 Yei 로고 + 규격 라벨.
 * 셀은 한 번만 렌더해 재사용한다.
 */
export function renderPrintSheet(
  input: RenderInput,
  cellW: number,
  cellH: number,
  footer?: { label: string; dims: string },
): HTMLCanvasElement {
  const { w, h } = PRINT_SHEET
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, w, h)

  const { cols, rows } = sheetGrid(cellW, cellH)
  const cell = renderCrop(cellW, cellH, input) // 셀 1회 렌더
  const gridH = h - FOOTER_H // 그리드는 footer 위 영역에 배치
  const ox = Math.round((w - cols * cellW) / 2)
  const oy = Math.round((gridH - rows * cellH) / 2)

  ctx.strokeStyle = 'rgba(0,0,0,0.28)'
  ctx.lineWidth = 1
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = ox + c * cellW
      const y = oy + r * cellH
      ctx.drawImage(cell, x, y, cellW, cellH)
      ctx.strokeRect(x + 0.5, y + 0.5, cellW, cellH) // 자르기용 컷 가이드
    }
  }

  drawSheetFooter(ctx, w, h, cols * rows, footer)
  return canvas
}

/** 하단 브랜드·규격 라벨 띠. 셀과 옅은 선으로 구분. footer 없으면 생략. */
function drawSheetFooter(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  count: number,
  footer?: { label: string; dims: string },
): void {
  if (!footer) return
  const top = h - FOOTER_H
  const midY = top + FOOTER_H / 2
  ctx.strokeStyle = 'rgba(0,0,0,0.16)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(40, top + 0.5)
  ctx.lineTo(w - 40, top + 0.5)
  ctx.stroke()

  const FONT = 'Pretendard, system-ui, -apple-system, sans-serif'
  const labelText = `${footer.label} · ${footer.dims} · ${t('img.sheetCount', { count })}`
  const logo = 30
  const gap1 = 9
  const gap2 = 16
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'left'
  ctx.font = `800 23px ${FONT}`
  const wordW = ctx.measureText('Yei ID').width
  ctx.font = `600 20px ${FONT}`
  const labelW = ctx.measureText(labelText).width
  let x = Math.round((w - (logo + gap1 + wordW + gap2 + labelW)) / 2)

  drawSmiley(ctx, x, midY - logo / 2, logo)
  x += logo + gap1
  ctx.fillStyle = '#17161C'
  ctx.font = `800 23px ${FONT}`
  ctx.fillText('Yei ID', x, midY + 1)
  x += wordW + gap2
  ctx.fillStyle = '#6a6456'
  ctx.font = `600 20px ${FONT}`
  ctx.fillText(labelText, x, midY + 1)
}

/** Yei 스마일 로고 (노랑 라운드 사각 + 잉크 얼굴) */
function drawSmiley(ctx: CanvasRenderingContext2D, x: number, y: number, s: number): void {
  const r = s * 0.28
  ctx.fillStyle = '#FFD12E'
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + s, y, x + s, y + s, r)
  ctx.arcTo(x + s, y + s, x, y + s, r)
  ctx.arcTo(x, y + s, x, y, r)
  ctx.arcTo(x, y, x + s, y, r)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = '#17161C'
  const ey = y + s * 0.42
  const er = s * 0.08
  ctx.beginPath()
  ctx.arc(x + s * 0.35, ey, er, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(x + s * 0.65, ey, er, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = '#17161C'
  ctx.lineWidth = s * 0.085
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.arc(x + s / 2, y + s * 0.48, s * 0.22, Math.PI * 0.15, Math.PI * 0.85)
  ctx.stroke()
}

export function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality?: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error(t('img.exportFailed')))),
      type,
      quality,
    )
  })
}

/**
 * JPEG 품질을 이분 탐색해 목표 용량(바이트) 이하 중 가장 높은 품질로 인코딩.
 * 최저 품질에서도 목표를 못 맞추면 그 결과를 반환한다.
 */
export async function encodeToTargetSize(
  canvas: HTMLCanvasElement,
  targetBytes: number,
): Promise<{ blob: Blob; quality: number }> {
  let lo = 0.3
  let hi = 0.95
  let best: { blob: Blob; quality: number } | null = null

  // 먼저 최저 품질이 목표를 넘으면 그걸로 확정(더 줄일 수 없음)
  const lowest = await canvasToBlob(canvas, 'image/jpeg', lo)
  if (lowest.size > targetBytes) return { blob: lowest, quality: lo }

  for (let i = 0; i < 7; i++) {
    const q = (lo + hi) / 2
    const blob = await canvasToBlob(canvas, 'image/jpeg', q)
    if (blob.size <= targetBytes) {
      best = { blob, quality: q } // 목표 이하 → 더 높은 품질 시도
      lo = q
    } else {
      hi = q
    }
  }
  return best ?? { blob: lowest, quality: lo }
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / (1024 * 1024)).toFixed(2)} MB`
}
