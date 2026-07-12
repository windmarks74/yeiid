// 자체 카메라 (getUserMedia) + 규격 가이드선 오버레이.
// OS 카메라엔 오버레이를 못 그리므로, 앱 안에서 미리보기+가이드를 직접 띄운다.
// 촬영 결과(blob)는 기존 파이프라인(loadSourcePhoto)으로 그대로 흘려보낸다.
// 실패(권한 거부·미지원) 시 onFallback으로 OS 카메라로 되돌린다.
// ⚠️ 한국은 무음 카메라 불법 → 촬영 시 셔터음 재생(웹오디오, 미디어볼륨/무음모드 영향 가능).
import { useEffect, useRef, useState } from 'react'
import { t } from './strings'

type Props = {
  onCapture: (blob: Blob) => void
  onClose: () => void
  /** getUserMedia 실패 시 OS 카메라로 폴백 */
  onFallback: () => void
}

/** 셔터음(찰칵) — 웹오디오로 합성. 사용자 탭(제스처)에서 호출되므로 재생 가능. */
function playShutter() {
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = new AC()
    const now = ctx.currentTime
    for (const at of [0, 0.09]) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'square'
      osc.frequency.setValueAtTime(1800, now + at)
      gain.gain.setValueAtTime(0.0001, now + at)
      gain.gain.exponentialRampToValueAtTime(0.45, now + at + 0.005)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + at + 0.05)
      osc.connect(gain).connect(ctx.destination)
      osc.start(now + at)
      osc.stop(now + at + 0.06)
    }
    setTimeout(() => ctx.close(), 300)
  } catch {
    // 오디오 실패해도 촬영은 진행
  }
}

export default function CameraCapture({ onCapture, onClose, onFallback }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [facing, setFacing] = useState<'user' | 'environment'>('user')
  const [error, setError] = useState(false)
  const [ready, setReady] = useState(false) // 미리보기 재생 시작 후에만 셔터 활성 (조기 탭 방지)

  useEffect(() => {
    let cancelled = false
    setReady(false)
    async function start() {
      try {
        streamRef.current?.getTracks().forEach((tr) => tr.stop())
        const stream = await navigator.mediaDevices.getUserMedia({
          // 여권 통과 해상도 확보 위해 최대한 높게 요청(기기가 주는 만큼)
          video: { facingMode: facing, width: { ideal: 2560 }, height: { ideal: 2560 } },
          audio: false,
        })
        if (cancelled) {
          stream.getTracks().forEach((tr) => tr.stop())
          return
        }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play().catch(() => {})
        }
      } catch {
        if (!cancelled) setError(true)
      }
    }
    start()
    return () => {
      cancelled = true
      streamRef.current?.getTracks().forEach((tr) => tr.stop())
      streamRef.current = null
    }
  }, [facing])

  function capture() {
    const video = videoRef.current
    if (!video || !video.videoWidth) return
    playShutter() // 셔터음 (무음 불법 대응)
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    // 미러 없이 원본 그대로 캡처(여권 = 실제 좌우 방향). 미러는 미리보기 UX용일 뿐.
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    canvas.toBlob(
      (blob) => {
        if (blob) onCapture(blob)
      },
      'image/jpeg',
      0.95,
    )
  }

  if (error) {
    return (
      <div className="cam-screen">
        <div className="cam-error">
          <p>{t('cam.error')}</p>
          <button className="paywall-buy" onClick={onFallback}>
            {t('cam.useOs')}
          </button>
          <button className="paywall-restore" onClick={onClose}>
            {t('paywall.later')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="cam-screen" role="dialog" aria-modal>
      <video
        ref={videoRef}
        className={`cam-video${facing === 'user' ? ' mirror' : ''}`}
        autoPlay
        playsInline
        muted
        onPlaying={() => setReady(true)}
      />

      {/* 규격 가이드선 (35:45 크롭 프레임 + 얼굴 타원 + 정수리/눈/턱/중앙선) */}
      <svg className="cam-overlay" viewBox="0 0 350 450" preserveAspectRatio="xMidYMid meet">
        <rect x="2" y="2" width="346" height="446" rx="10" className="cam-frame" />
        <ellipse cx="175" cy="225" rx="105" ry="180" className="cam-oval" />
        <line x1="30" y1="45" x2="320" y2="45" className="cam-guide" /> {/* 정수리 */}
        <line x1="30" y1="207" x2="320" y2="207" className="cam-guide" /> {/* 눈높이 */}
        <line x1="30" y1="405" x2="320" y2="405" className="cam-guide" /> {/* 턱 */}
        <line x1="175" y1="20" x2="175" y2="430" className="cam-guide" /> {/* 중앙 */}
      </svg>

      <p className="cam-hint">{ready ? t('cam.hint') : t('cam.loading')}</p>

      <div className="cam-controls">
        <button className="cam-x" onClick={onClose} aria-label={t('paywall.close')}>
          ✕
        </button>
        <button
          className="cam-shutter"
          onClick={capture}
          disabled={!ready}
          aria-label={t('cam.capture')}
        />
        <button
          className="cam-flip"
          onClick={() => setFacing((f) => (f === 'user' ? 'environment' : 'user'))}
          aria-label={t('cam.flip')}
        >
          ⟲
        </button>
      </div>
    </div>
  )
}
