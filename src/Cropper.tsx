import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { drawPhoto, type CropRect, type Cutout, type FaceBox } from './imageUtils'
import type { Adjust } from './adjust'
import type { Effects } from './effects'

type Props = {
  image: HTMLCanvasElement
  cutout: Cutout | null
  /** 출력 가로/세로 비율 (targetW / targetH) */
  aspect: number
  /** 머리(정수리~턱) 권장 비율 % (용도별) */
  faceMin: number
  faceMax: number
  /** 눈높이 가이드 밴드(상단 기준 %). 미국 등 눈높이 규정이 있을 때만 표시 */
  eyeMin?: number
  eyeMax?: number
  /** 처리 중 오버레이 (배경 분리 등) */
  busy?: boolean
  busyLabel?: string
  adjust: Adjust
  effects: Effects
  /** 얼굴 영역 (잡티 완화용, 없으면 생략) */
  face: FaceBox | null
  /** 기울기 보정 각도(도) */
  rotation: number
  onRotation: (deg: number) => void
  /** 90° 회전(가로↔세로) */
  onRotate90: () => void
  onCrop: (crop: CropRect) => void
}

const MAX_ZOOM = 4
const TILT_MAX = 15
/** 0.5° 단위로 ±15° 범위 클램프 */
const clampTilt = (v: number) => Math.max(-TILT_MAX, Math.min(TILT_MAX, Math.round(v * 2) / 2))

/**
 * 고정 비율 크롭 프레임 위에서 이미지를 팬/줌 한다.
 * 미리보기는 프레임 크기 캔버스에 drawPhoto로 그린다 (출력과 동일 파이프라인).
 * tx,ty = 프레임 중심 기준 이미지 중심의 표시 px 오프셋. 줌 1 = cover 배율.
 */
export default function Cropper({
  image,
  cutout,
  aspect,
  faceMin,
  faceMax,
  eyeMin,
  eyeMax,
  busy,
  busyLabel,
  adjust,
  effects,
  face,
  rotation,
  onRotation,
  onRotate90,
  onCrop,
}: Props) {
  const frameRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [frameW, setFrameW] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [tx, setTx] = useState(0)
  const [ty, setTy] = useState(0)

  const frameH = frameW / aspect
  const iw = image.width
  const ih = image.height
  const baseScale = frameW > 0 ? Math.max(frameW / iw, frameH / ih) : 1
  const effScale = baseScale * zoom

  // 프레임 표시 폭을 컨테이너에 맞춰 측정
  useLayoutEffect(() => {
    const el = frameRef.current
    if (!el) return
    const measure = () => setFrameW(el.clientWidth)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // 이미지가 항상 프레임을 덮도록 팬 범위 제한
  const clamp = useCallback(
    (x: number, y: number) => {
      const maxX = Math.max(0, (iw * effScale - frameW) / 2)
      const maxY = Math.max(0, (ih * effScale - frameH) / 2)
      return {
        x: Math.min(maxX, Math.max(-maxX, x)),
        y: Math.min(maxY, Math.max(-maxY, y)),
      }
    },
    [iw, ih, effScale, frameW, frameH],
  )

  // 배율 변경 시 팬 범위 재보정
  useEffect(() => {
    setTx((x) => clamp(x, ty).x)
    setTy((y) => clamp(tx, y).y)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clamp])

  // 현재 변환 → 정규화 크롭 영역
  const crop = useMemo<CropRect | null>(() => {
    if (frameW <= 0) return null
    const sw = frameW / effScale
    const sh = frameH / effScale
    const sx = iw / 2 - (frameW / 2 + tx) / effScale
    const sy = ih / 2 - (frameH / 2 + ty) / effScale
    return { x: sx / iw, y: sy / ih, w: sw / iw, h: sh / ih }
  }, [frameW, frameH, effScale, tx, ty, iw, ih])

  useEffect(() => {
    if (crop) onCrop(crop)
  }, [crop, onCrop])

  // 미리보기 캔버스에 크롭+보정 렌더
  const dpr = Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 2)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !crop || frameW <= 0) return
    const cw = Math.round(frameW * dpr)
    const ch = Math.round(frameH * dpr)
    if (canvas.width !== cw) canvas.width = cw
    if (canvas.height !== ch) canvas.height = ch
    // willReadFrequently: 보정 시 getImageData를 매 프레임 호출하므로 CPU 백킹이 빠름
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!
    drawPhoto(ctx, cw, ch, { img: image, cutout, crop, adjust, effects, face, rotation })
  }, [image, cutout, crop, adjust, effects, face, rotation, frameW, frameH, dpr])

  // 포인터: 1개 = 팬(드래그), 2개 = 핀치 줌. (마우스/터치 공통)
  const pointers = useRef<Map<number, { x: number; y: number }>>(new Map())
  const dragRef = useRef<{ px: number; py: number } | null>(null)
  const pinchRef = useRef<{ dist: number; zoom: number } | null>(null)
  const dist = (a: { x: number; y: number }, b: { x: number; y: number }) =>
    Math.hypot(a.x - b.x, a.y - b.y)

  const onPointerDown = (e: React.PointerEvent) => {
    ;(e.target as Element).setPointerCapture(e.pointerId)
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (pointers.current.size === 1) {
      dragRef.current = { px: e.clientX, py: e.clientY }
    } else if (pointers.current.size === 2) {
      dragRef.current = null
      const [a, b] = [...pointers.current.values()]
      pinchRef.current = { dist: dist(a, b), zoom }
    }
  }
  const onPointerMove = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })

    // 두 손가락: 시작 거리 대비 현재 거리 비율로 줌 (시작 줌에 고정 → 누적 오차 없음)
    if (pointers.current.size >= 2 && pinchRef.current) {
      const [a, b] = [...pointers.current.values()]
      const ratio = dist(a, b) / pinchRef.current.dist
      setZoom(Math.min(MAX_ZOOM, Math.max(1, pinchRef.current.zoom * ratio)))
      return
    }
    // 한 손가락: 팬
    if (dragRef.current) {
      const dx = e.clientX - dragRef.current.px
      const dy = e.clientY - dragRef.current.py
      dragRef.current = { px: e.clientX, py: e.clientY }
      const c = clamp(tx + dx, ty + dy)
      setTx(c.x)
      setTy(c.y)
    }
  }
  const onPointerUp = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId)
    pinchRef.current = null
    // 손가락이 하나 남으면 그 지점에서 팬 재개(좌표 튐 방지)
    if (pointers.current.size === 1) {
      const [p] = [...pointers.current.values()]
      dragRef.current = { px: p.x, py: p.y }
    } else {
      dragRef.current = null
    }
  }

  return (
    <div className="cropper">
      <div className="crop-stage" style={{ maxWidth: `calc(${(aspect * 44).toFixed(1)}vh + 20px)` }}>
        <div
          className="crop-frame"
          ref={frameRef}
          style={{ aspectRatio: String(aspect) }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <canvas className="crop-canvas" ref={canvasRef} />
          <FaceGuide faceMin={faceMin} faceMax={faceMax} eyeMin={eyeMin} eyeMax={eyeMax} />
          {busy && (
            <div className="crop-busy">
              <div className="progress-bar" />
              <span>{busyLabel || '처리 중…'}</span>
            </div>
          )}
        </div>
        <span className="cm tl" />
        <span className="cm tr" />
        <span className="cm bl" />
        <span className="cm br" />
      </div>
      <div className="zoom-row">
        <span className="ctrl-chip">
          <IconZoom /> 확대
        </span>
        <input
          type="range"
          min={1}
          max={MAX_ZOOM}
          step={0.01}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
        />
        <button
          type="button"
          className="ctrl-chip"
          onClick={onRotate90}
          aria-label="90° 회전"
          title="90° 회전"
        >
          <IconRotate /> 회전
        </button>
      </div>
      <div className="zoom-row tilt-row">
        <button
          type="button"
          className="ctrl-chip"
          onClick={() => onRotation(0)}
          title="기울기 초기화"
        >
          <IconTilt /> 기울기{rotation !== 0 ? ` ${rotation > 0 ? '+' : ''}${rotation}°` : ''}
        </button>
        <button
          type="button"
          className="step-btn"
          onClick={() => onRotation(clampTilt(rotation - 0.5))}
          aria-label="기울기 -0.5도"
        >
          −
        </button>
        <input
          type="range"
          min={-15}
          max={15}
          step={0.5}
          value={rotation}
          onChange={(e) => onRotation(Number(e.target.value))}
        />
        <button
          type="button"
          className="step-btn"
          onClick={() => onRotation(clampTilt(rotation + 0.5))}
          aria-label="기울기 +0.5도"
        >
          +
        </button>
      </div>
    </div>
  )
}

/** 확대(돋보기) 아이콘 */
function IconZoom() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M20 20l-4.2-4.2M8 10.5h5M10.5 8v5" />
    </svg>
  )
}

/** 기울기(수평/각도) 아이콘 */
function IconTilt() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 18h16" />
      <path d="M6 14l9-7" />
    </svg>
  )
}

/** 90° 회전 아이콘 (네모=사진 + 시계방향 화살표) */
function IconRotate() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {/* 사진(네모) */}
      <rect x="3.5" y="10" width="10.5" height="10" rx="2.5" />
      {/* 위→오른쪽으로 도는 호 (시계방향) */}
      <path d="M11 4.5A7 7 0 0 1 20 11.5" />
      {/* 끝에서 아래로 향하는 채움 화살촉 = 시계방향 */}
      <path d="M20 14.8 L17.3 10.9 L22.7 10.9 Z" fill="currentColor" stroke="none" />
    </svg>
  )
}

/**
 * 얼굴 위치 가이드. 정수리선(상단 여백 11%)과 턱 허용 밴드를 표시한다.
 * 밴드 = 정수리 + 머리비율[faceMin..faceMax] → 용도별 규격에 맞춰 동적.
 */
function FaceGuide({
  faceMin,
  faceMax,
  eyeMin,
  eyeMax,
}: {
  faceMin: number
  faceMax: number
  eyeMin?: number
  eyeMax?: number
}) {
  const CROWN = 11 // 정수리선 상단 여백 %
  const hasEye = eyeMin != null && eyeMax != null
  return (
    <div className="face-guide" aria-hidden>
      <div className="guide-line crown" style={{ top: `${CROWN}%` }}>
        <span>정수리</span>
      </div>
      <div className="chin-band" style={{ top: `${CROWN + faceMin}%`, height: `${faceMax - faceMin}%` }}>
        <span>턱선 (머리 {faceMin}~{faceMax}%)</span>
      </div>
      {hasEye && (
        <div className="eye-band" style={{ top: `${eyeMin}%`, height: `${eyeMax! - eyeMin!}%` }}>
          <span>눈높이</span>
        </div>
      )}
      <div className="guide-line vcenter" />
    </div>
  )
}
