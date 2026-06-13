import { useCallback, useEffect, useRef, useState } from 'react'
import Cropper from './Cropper'
import { USAGES, USAGE_SPECS, APPLY_SITE, isRegulated, requiresPremium, isExam, isSelectable, type Usage } from './usage'
import { openExternal } from './external'
import { NEUTRAL, type Adjust } from './adjust'
import { BG_COLORS, NEUTRAL_EFFECTS, type Effects } from './effects'
import { Capacitor, type PluginListenerHandle } from '@capacitor/core'
import { removeBg, type BgModel } from './bg'
import { detectFace } from './face'
import { saveJpeg } from './save'
import { checkEntitlement, restorePurchases } from './iap'
import { PRIVACY, TERMS, FAQ, type LegalDoc } from './legal'
import Paywall from './Paywall'
import {
  canDownload,
  freeLeft,
  grantPremium,
  loadBilling,
  recordDownload,
  type BillingState,
} from './billing'
import {
  canvasToBlob,
  encodeToTargetSize,
  formatBytes,
  loadSourcePhoto,
  renderCrop,
  renderPrintSheet,
  sheetGrid,
  type CropRect,
  type Cutout,
  type FaceBox,
} from './imageUtils'

// ⚠️ 테스트 전용 — true면 결제 없이 프리미엄 강제. 스토어 AAB 전 반드시 false! (런타임 메모리만)
const DEV_UNLOCK = false

export default function App() {
  const [image, setImage] = useState<HTMLCanvasElement | null>(null)
  const [usage, setUsage] = useState<Usage>('passport')
  const [adjust, setAdjust] = useState<Adjust>(NEUTRAL)
  const [effects, setEffects] = useState<Effects>(NEUTRAL_EFFECTS)
  const [rotation, setRotation] = useState(0)
  const [cutout, setCutout] = useState<Cutout | null>(null)
  const [face, setFace] = useState<FaceBox | null>(null)
  const [faceBusy, setFaceBusy] = useState(false)
  const [bgBusy, setBgBusy] = useState(false)
  const [bgProgress, setBgProgress] = useState('')
  const [bgError, setBgError] = useState<string | null>(null)
  // 모바일은 메모리 한계로 가벼운 fp16 기본, 웹(멀티스레드)은 고품질 isnet 기본
  const [bgModel, setBgModel] = useState<BgModel>(
    Capacitor.isNativePlatform() ? 'isnet_fp16' : 'isnet',
  )
  const [targetEnabled, setTargetEnabled] = useState(false)
  const [targetKB, setTargetKB] = useState(200)
  const [outSize, setOutSize] = useState<{ bytes: number; quality: number } | null>(null)
  const [sizeTick, setSizeTick] = useState(0)
  const [billing, setBilling] = useState<BillingState | null>(null)
  const [showPaywall, setShowPaywall] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [printSheet, setPrintSheet] = useState(false)
  const [screen, setScreen] = useState<'landing' | 'editor' | 'result' | 'settings' | 'legal'>(
    'landing',
  )
  const [legalDoc, setLegalDoc] = useState<LegalDoc | null>(null)
  const [tool, setTool] = useState<'adjust' | 'effects' | 'output'>('adjust')
  const [resultUrl, setResultUrl] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [settingsReturn, setSettingsReturn] = useState<'landing' | 'editor' | 'result'>('landing')
  // 설정 푸터 표시용 앱 버전 (네이티브 실제 버전을 읽어옴 → 빌드마다 자동 반영)
  const [appVersion, setAppVersion] = useState('1.1.7')
  const cropRef = useRef<CropRect | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const cameraRef = useRef<HTMLInputElement>(null)
  const settleRef = useRef<number | undefined>(undefined)
  // 결과 미리보기 캐시 (1매/시트 각각) — 전환 시 재렌더 안 하도록
  const resultCacheRef = useRef<{ single: string | null; sheet: string | null }>({
    single: null,
    sheet: null,
  })

  const spec = USAGE_SPECS[usage]

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = '' // 같은 파일 재선택도 동작하도록
    if (!file) return
    setToast('사진 불러오는 중…')
    try {
      // HEIC 변환 + EXIF 방향 정규화 + 다운스케일 → 캔버스 (재인코딩 없음 = 빠름)
      const canvas = await loadSourcePhoto(file)
      setImage(canvas) // 이전 캔버스는 GC
      setCutout(null)
      setFace(null)
      setEffects(NEUTRAL_EFFECTS)
      setRotation(0)
      setBgError(null)
      setToast(null)
      clearResultCache()
      setScreen('editor')
    } catch (err) {
      console.error('[사진 불러오기 실패]', err)
      setToast(`사진을 불러오지 못했습니다: ${(err as Error)?.message ?? ''}`)
    }
  }

  // 배경 색이 선택됐는데 누끼가 아직 없으면 1회 배경 제거 실행 (무거움).
  // 주의: bgBusy를 의존성에 넣으면 setBgBusy로 effect가 재실행되며 cleanup이
  // 진행 중 작업을 취소해 결과가 버려진다. 의존성은 image/bgColor/cutout만.
  useEffect(() => {
    if (!image || effects.bgColor === null || cutout) return
    let cancelled = false
    setBgBusy(true)
    setBgError(null)
    setBgProgress('')
    // 소스 캔버스를 이때만 JPEG로 인코딩(지연) → 네이티브/엔진에 전달
    canvasToBlob(image, 'image/jpeg', 0.92)
      .then((blob) =>
        removeBg(blob, bgModel, (msg) => {
          if (!cancelled) setBgProgress(msg)
        }),
      )
      .then((c) => {
        if (!cancelled) setCutout(c)
      })
      .catch((err) => {
        if (cancelled) return
        console.error('[배경 제거 실패]', err)
        setBgError(`배경 제거 실패: ${err?.message ?? err}`)
        setEffects((e) => ({ ...e, bgColor: null }))
      })
      .finally(() => {
        // 취소된(이전) 작업의 완료가 새 작업의 busy 표시를 끄지 않도록 가드
        if (!cancelled) setBgBusy(false)
      })
    return () => {
      cancelled = true
      setBgBusy(false) // 새 실행이 시작되면 즉시 다시 true로 켜짐
    }
  }, [image, effects.bgColor, cutout, bgModel])

  // 잡티 완화가 켜졌는데 얼굴 정보가 없으면 1회 검출 (네이티브만). 실패해도 무시(스무딩만 생략).
  useEffect(() => {
    if (!image || effects.smooth === 0 || face) return
    let cancelled = false
    setFaceBusy(true)
    detectFace(image) // 내부에서 720px로 다운스케일 → 빠름
      .then((f) => {
        if (!cancelled && f) setFace(f)
      })
      .finally(() => {
        if (!cancelled) setFaceBusy(false)
      })
    return () => {
      cancelled = true
    }
  }, [image, effects.smooth, face])

  // 모델 품질 변경: 누끼를 비워 새 모델로 다시 생성하게 한다
  function onModelChange(m: BgModel) {
    if (m === bgModel) return
    setBgModel(m)
    if (cutout) setCutout(null) // 새 모델로 다시 생성 (canvas는 GC 대상)
  }

  // 90° 회전(시계방향): 소스 캔버스를 회전한 새 캔버스로 교체 (가로↔세로).
  // 방향이 바뀌므로 누끼·얼굴 캐시는 초기화한다. 미세 기울기(rotation)는 유지.
  function rotate90() {
    if (!image) return
    const w = image.width
    const h = image.height
    const c = document.createElement('canvas')
    c.width = h
    c.height = w
    const ctx = c.getContext('2d')!
    ctx.imageSmoothingQuality = 'high'
    ctx.translate(h / 2, w / 2)
    ctx.rotate(Math.PI / 2)
    ctx.drawImage(image, -w / 2, -h / 2)
    setImage(c)
    setCutout(null)
    setFace(null)
    clearResultCache()
  }

  // 제한 규격(여권·미국): 배경 교체·보정(뽀샤시)을 모두 끔 (면허/일반에서 켠 효과가 남지 않게).
  // 용량 상한이 있는 규격(미국 DV ≤240KB)은 출력 목표 용량을 기본 적용.
  useEffect(() => {
    if (isRegulated(usage)) setEffects(NEUTRAL_EFFECTS)
    if (isExam(usage)) setPrintSheet(false) // 시험=디지털 업로드용, 인화 시트 없음
    const mk = USAGE_SPECS[usage].maxKB
    if (mk) {
      setTargetEnabled(true)
      setTargetKB(mk)
    }
  }, [usage])

  // Cropper가 변환될 때마다 최신 크롭 영역을 ref에 저장(렌더 유발 X).
  // 팬/줌이 멈추면(350ms) 용량 재계산을 트리거한다.
  const onCrop = useCallback((c: CropRect) => {
    cropRef.current = c
    if (settleRef.current) clearTimeout(settleRef.current)
    settleRef.current = window.setTimeout(() => setSizeTick((t) => t + 1), 350)
  }, [])

  // 현재 설정으로 출력 JPEG 인코딩 (목표 용량이 켜지면 이분 탐색)
  async function encodeCurrent(): Promise<{ blob: Blob; quality: number } | null> {
    if (!image || !cropRef.current) return null
    const input = { img: image, cutout, crop: cropRef.current, adjust, effects, face, rotation }
    const canvas = printSheet
      ? renderPrintSheet(input, spec.targetW, spec.targetH, {
          label: spec.label,
          dims: `${spec.widthMm}×${spec.heightMm}mm · ${spec.dpi}DPI`,
        })
      : renderCrop(spec.targetW, spec.targetH, input)
    if (targetEnabled && targetKB > 0) {
      return encodeToTargetSize(canvas, targetKB * 1024)
    }
    const blob = await canvasToBlob(canvas, 'image/jpeg', 0.92)
    return { blob, quality: 0.92 }
  }

  // 결과 화면 미리보기용 — 축소해서 빠르게 인코딩 (다운로드는 encodeCurrent로 풀해상도)
  async function renderPreviewBlob(): Promise<Blob | null> {
    if (!image || !cropRef.current) return null
    const input = { img: image, cutout, crop: cropRef.current, adjust, effects, face, rotation }
    const full = printSheet
      ? renderPrintSheet(input, spec.targetW, spec.targetH, {
          label: spec.label,
          dims: `${spec.widthMm}×${spec.heightMm}mm · ${spec.dpi}DPI`,
        })
      : renderCrop(spec.targetW, spec.targetH, input)
    const cap = 800
    const scale = Math.min(1, cap / Math.max(full.width, full.height))
    let src: HTMLCanvasElement = full
    if (scale < 1) {
      const s = document.createElement('canvas')
      s.width = Math.round(full.width * scale)
      s.height = Math.round(full.height * scale)
      const ctx = s.getContext('2d')!
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(full, 0, 0, s.width, s.height)
      src = s
    }
    return canvasToBlob(src, 'image/jpeg', 0.85)
  }

  // 결과 용량 실시간 표시 (설정/크롭 변경 후 350ms 디바운스 재계산)
  useEffect(() => {
    if (!image) return
    let cancelled = false
    const t = window.setTimeout(async () => {
      try {
        const res = await encodeCurrent()
        if (!cancelled && res) setOutSize({ bytes: res.blob.size, quality: res.quality })
      } catch (err) {
        // 인코딩 실패 시 unhandled rejection 방지 — 용량 표시는 이전 값 유지
        console.error('[용량 계산 실패]', err)
      }
    }, 350)
    return () => {
      cancelled = true
      clearTimeout(t)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [image, adjust, effects, cutout, face, rotation, usage, targetEnabled, targetKB, sizeTick, printSheet])

  // 앱 시작 시 결제/카운터 상태 로드 + (네이티브) RevenueCat entitlement 확인
  useEffect(() => {
    ;(async () => {
      let b = await loadBilling()
      if (DEV_UNLOCK) {
        b = { ...b, premium: true } // 테스트: 메모리상 프리미엄
      } else if (!b.premium && (await checkEntitlement())) {
        // 기존 구매가 있으면(재설치/기기변경, 같은 구글 계정) 자동 해제
        b = await grantPremium(b)
      }
      setBilling(b)
    })()
  }, [])

  // 앱 실제 버전 읽기 (네이티브). 설정 푸터에 "버전 1.1.2 (4)" 형태로 표시 → 빌드마다 자동 갱신
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return
    ;(async () => {
      try {
        const { App } = await import('@capacitor/app')
        const info = await App.getInfo()
        setAppVersion(`${info.version} (${info.build})`)
      } catch {
        // 미지원/실패 시 폴백 버전 유지
      }
    })()
  }, [])

  // 토스트 자동 사라짐
  useEffect(() => {
    if (!toast) return
    const t = window.setTimeout(() => setToast(null), 2600)
    return () => clearTimeout(t)
  }, [toast])

  // 안드로이드 하드웨어 뒤로가기: 화면 상태 기반 내비게이션.
  // 리스너 미등록 시 Capacitor 기본 동작이 앱 종료라 편집 내용이 통째로 소실된다.
  // 핸들러는 마운트 시 1회 등록되므로 최신 화면 상태는 ref로 읽는다.
  const backRef = useRef({ screen, settingsReturn, showPaywall })
  useEffect(() => {
    backRef.current = { screen, settingsReturn, showPaywall }
  })
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return
    let removed = false
    let handle: PluginListenerHandle | undefined
    ;(async () => {
      const { App: CapApp } = await import('@capacitor/app')
      const h = await CapApp.addListener('backButton', () => {
        const { screen, settingsReturn, showPaywall } = backRef.current
        if (showPaywall) setShowPaywall(false)
        else if (screen === 'legal') setScreen('settings')
        else if (screen === 'settings') setScreen(settingsReturn)
        else if (screen === 'result') setScreen('editor')
        else if (screen === 'editor') setScreen('landing')
        else CapApp.exitApp()
      })
      if (removed) h.remove()
      else handle = h
    })()
    return () => {
      removed = true
      handle?.remove()
    }
  }, [])

  // 결과 화면 미리보기 (1매/시트 각각 캐시 → 전환 즉시, 재렌더 X)
  useEffect(() => {
    if (screen !== 'result' || !image) return
    setSaved(false) // 진입/포맷 전환 시 저장 확인 초기화
    const key = printSheet ? 'sheet' : 'single'
    const cached = resultCacheRef.current[key]
    if (cached) {
      setResultUrl(cached)
      return
    }
    let cancelled = false
    setResultUrl(null)
    renderPreviewBlob()
      .then((blob) => {
        if (cancelled || !blob) return
        const url = URL.createObjectURL(blob)
        resultCacheRef.current[key] = url // 캐시(여기서 해제 안 함 — clearResultCache가 관리)
        setResultUrl(url)
      })
      .catch((err) => {
        // 저사양 기기에서 대형 캔버스 인코딩 실패 가능 — '렌더링 중…' 무한 표시 방지
        if (cancelled) return
        console.error('[미리보기 렌더 실패]', err)
        setToast(`미리보기 생성 실패: ${(err as Error)?.message ?? err}`)
        setScreen('editor')
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, printSheet, image])

  async function onUnlock() {
    if (!billing) return
    setBilling(await grantPremium(billing))
    setShowPaywall(false)
  }

  // 설정 진입(어느 화면에서든) → 뒤로 가면 원래 화면 복귀
  function openSettings() {
    if (screen === 'landing' || screen === 'editor' || screen === 'result') {
      setSettingsReturn(screen)
    }
    setScreen('settings')
  }

  function openLegal(doc: LegalDoc) {
    setLegalDoc(doc)
    setScreen('legal')
  }

  // 설정 화면의 구매 복원
  async function onRestore() {
    try {
      if ((await restorePurchases()) && billing) {
        setBilling(await grantPremium(billing))
        setToast('구매가 복원되었습니다')
      } else {
        setToast('복원할 구매 내역이 없습니다')
      }
    } catch (e) {
      setToast(`복원 실패: ${(e as Error)?.message ?? e}`)
    }
  }

  // 결과 미리보기 캐시 비우기 (편집 반영 위해 결과 진입/새 사진 시 호출)
  function clearResultCache() {
    const c = resultCacheRef.current
    if (c.single) URL.revokeObjectURL(c.single)
    if (c.sheet) URL.revokeObjectURL(c.sheet)
    resultCacheRef.current = { single: null, sheet: null }
  }

  // 잠금(프리미엄) 상태: 비프리미엄이 해외 규격 또는 인화 시트를 쓰려 할 때
  const locked = !!billing && !billing.premium && (requiresPremium(usage) || printSheet)

  // 용도 선택: 해외(프리미엄) 규격이면 미리보기는 허용하되 페이월을 띄운다 (선택/내보내기 시 잠금)
  function selectUsage(u: Usage) {
    setUsage(u)
    if (requiresPremium(u) && billing && !billing.premium) setShowPaywall(true)
  }

  async function onDownload() {
    // 해외 규격·인화 시트는 프리미엄 → 페이월
    if (locked) {
      setShowPaywall(true)
      return
    }
    // 무료 소진 + 비프리미엄 → 페이월
    if (billing && !canDownload(billing)) {
      setShowPaywall(true)
      return
    }
    let res: { blob: Blob; quality: number } | null
    try {
      res = await encodeCurrent()
    } catch (e) {
      setToast(`내보내기 실패: ${(e as Error)?.message ?? e}`)
      return
    }
    if (!res) return
    setOutSize({ bytes: res.blob.size, quality: res.quality })
    // 저장마다 유니크 파일명(밀리초까지) → 갤러리에 매번 새 항목으로 누적, 덮어쓰기 방지
    const filename = printSheet
      ? `Yei_${usage}_sheet_${nowStamp()}.jpg`
      : `Yei_${usage}_${nowStamp()}.jpg`
    try {
      await saveJpeg(res.blob, filename)
    } catch (e) {
      setToast(`저장 실패: ${(e as Error)?.message ?? e}`)
      return
    }
    setToast('저장되었습니다')
    setSaved(true) // 결과 화면에 저장 확인 + 신청 CTA 노출
    // 저장 성공 후에만 카운트
    if (billing) setBilling(await recordDownload(billing))
  }

  return (
    <div className="app">
      {screen === 'landing' && (
        <Landing
          usage={usage}
          onSelectUsage={selectUsage}
          premium={!!billing?.premium}
          onStart={() => fileRef.current?.click()}
          onCamera={() => cameraRef.current?.click()}
          onSettings={openSettings}
        />
      )}

      {screen === 'editor' && (
        <>
          <header className="editor-head">
            <button className="ghost-btn" onClick={() => setScreen('landing')} aria-label="뒤로">
              <IconChevL />
            </button>
            <span className="head-title">편집</span>
            <button className="ghost-btn" onClick={openSettings} aria-label="설정">
              ⚙
            </button>
          </header>

      <div className="usage-tabs" role="tablist">
        {/* 미검증(source.verified=false) 시험 규격은 숨김 — 공식 확인 후 verified=true로 켜면 자동 노출 */}
        {USAGES.filter((u) => isSelectable(u.id)).map((u) => (
          <button
            key={u.id}
            role="tab"
            aria-selected={usage === u.id}
            className={usage === u.id ? 'active' : ''}
            onClick={() => selectUsage(u.id)}
          >
            <UsageIcon id={u.id} size={16} />
            {u.label}
            {requiresPremium(u.id) && !billing?.premium && <span className="lock-badge">🔒</span>}
          </button>
        ))}
      </div>

      <div className="spec-card">
        <div className="spec-dims">
          {spec.widthMm} × {spec.heightMm}mm
        </div>
        <div className="spec-sub">
          {isExam(usage)
            ? `디지털 ${spec.targetW}×${spec.targetH}px · ≤${spec.maxKB}KB · ${(spec.format ?? 'jpg').toUpperCase()} 자동 맞춤`
            : `${spec.targetW} × ${spec.targetH}px · ${spec.dpi}DPI · 얼굴 ${spec.faceMin}~${spec.faceMax}%`}
        </div>
      </div>

      {spec.notice && <RestrictedNotice notice={spec.notice} />}

      {!image ? (
        <button className="upload-cta" onClick={() => fileRef.current?.click()}>
          사진 가져오기
        </button>
      ) : (
        <>
          <Cropper
            image={image}
            cutout={cutout}
            aspect={spec.targetW / spec.targetH}
            faceMin={spec.faceMin}
            faceMax={spec.faceMax}
            eyeMin={spec.eyeMin}
            eyeMax={spec.eyeMax}
            busy={bgBusy}
            busyLabel="배경 분리 중…"
            adjust={adjust}
            effects={effects}
            face={face}
            rotation={rotation}
            onRotation={setRotation}
            onRotate90={rotate90}
            onCrop={onCrop}
          />
          <div className="tool-chips" role="tablist">
            <button
              role="tab"
              className={tool === 'adjust' ? 'active' : ''}
              onClick={() => setTool('adjust')}
            >
              보정
            </button>
            <button
              role="tab"
              className={tool === 'effects' ? 'active' : ''}
              onClick={() => setTool('effects')}
            >
              배경·효과
            </button>
            <button
              role="tab"
              className={tool === 'output' ? 'active' : ''}
              onClick={() => setTool('output')}
            >
              출력
            </button>
          </div>

          {tool === 'adjust' && <AdjustPanel adjust={adjust} onChange={setAdjust} />}
          {tool === 'effects' && (
            <EffectsPanel
              effects={effects}
              onChange={setEffects}
              bgBusy={bgBusy}
              bgProgress={bgProgress}
              bgError={bgError}
              bgModel={bgModel}
              onModelChange={onModelChange}
              bgSupported={!isRegulated(usage)}
              isNative={Capacitor.isNativePlatform()}
              faceBusy={faceBusy}
            />
          )}
          {tool === 'output' && (
            <OutputPanel
              targetEnabled={targetEnabled}
              targetKB={targetKB}
              outSize={outSize}
              onToggle={setTargetEnabled}
              onTargetKB={setTargetKB}
            />
          )}
          <div className="actions">
            <button className="secondary" onClick={() => fileRef.current?.click()}>
              다른 사진
            </button>
            <button
              onClick={() => {
                clearResultCache() // 최신 편집 반영 위해 캐시 비우고 진입
                setScreen('result')
              }}
            >
              완료 · 미리보기
            </button>
          </div>
          <TipsCard />
        </>
      )}
        </>
      )}

      {screen === 'result' && (
        <>
          <header className="editor-head">
            <button className="ghost-btn" onClick={() => setScreen('editor')} aria-label="뒤로">
              <IconChevL />
            </button>
            <span className="head-title">완성</span>
            {billing?.premium && <span className="green-badge sm">PRO</span>}
            <button className="ghost-btn" onClick={openSettings} aria-label="설정">
              ⚙
            </button>
          </header>

          <div className="result-preview">
            {resultUrl ? (
              <img src={resultUrl} alt="결과 미리보기" />
            ) : (
              <div className="result-loading">
                <div className="progress-bar" />
                <span>렌더링 중…</span>
              </div>
            )}
          </div>

          {!isExam(usage) && (
            <div className="seg result-seg">
              <button className={!printSheet ? 'active' : ''} onClick={() => setPrintSheet(false)}>
                증명사진 1매
              </button>
              <button
                className={printSheet ? 'active' : ''}
                onClick={() => {
                  setPrintSheet(true)
                  if (!billing?.premium) setShowPaywall(true)
                }}
              >
                인화 시트 ({sheetGrid(spec.targetW, spec.targetH).count}매)
                {!billing?.premium && <span className="lock-badge">🔒</span>}
              </button>
            </div>
          )}

          <div className="panel checklist">
            <div className="check-line">
              ✓ {spec.label} 규격 ·{' '}
              {isExam(usage)
                ? `${spec.targetW}×${spec.targetH}px · ${(spec.format ?? 'jpg').toUpperCase()} · ≤${spec.maxKB}KB 자동`
                : `${spec.targetW}×${spec.targetH}px @${spec.dpi}DPI`}
            </div>
            <div className="check-line">✓ 규격·여백 자동 보정</div>
            <div className="check-line">✓ 기기 안에서만 처리</div>
            {outSize && <div className="check-line muted">파일 {formatBytes(outSize.bytes)}</div>}
            {isRegulated(usage) && (
              <div className="check-line warn">⚠ 6개월 이내 촬영 · AI 편집·필터 사진은 반려될 수 있어요</div>
            )}
          </div>

          {locked ? (
            <>
              <div className="upsell">
                {requiresPremium(usage) ? '해외 규격' : '인화 시트'}은 평생 이용 전용이에요.
              </div>
              <div className="actions">
                <button onClick={() => setShowPaywall(true)}>평생 이용으로 잠금 해제 · ₩4,900</button>
              </div>
            </>
          ) : billing && !canDownload(billing) ? (
            <>
              <div className="upsell">무료 5장을 모두 받았어요. 더 받으시겠어요?</div>
              <div className="actions">
                <button onClick={() => setShowPaywall(true)}>평생 무제한 · ₩4,900</button>
              </div>
            </>
          ) : (
            <>
              <div className="actions">
                <button onClick={onDownload}>
                  {billing?.premium
                    ? '다운로드'
                    : `무료로 다운로드${billing ? ` (${freeLeft(billing)}회 남음)` : ''}`}
                </button>
              </div>
              {billing && !billing.premium && (
                <p className="billing-caption">무료 5장 제공 · 추가는 ₩4,900 평생</p>
              )}
            </>
          )}

          {saved && (
            <div className="saved-box">
              <div className="saved-line">
                <span className="saved-check">✓</span> 갤러리에 저장됨
              </div>
              {APPLY_SITE[usage] && (
                <>
                  <button className="apply-cta" onClick={() => openExternal(APPLY_SITE[usage]!.url)}>
                    신청하러 가기 →
                  </button>
                  <p className="apply-note">{APPLY_SITE[usage]!.label} · 참고 링크 · 정부 제휴 아님</p>
                </>
              )}
            </div>
          )}
        </>
      )}

      {screen === 'settings' && (
        <>
          <header className="editor-head">
            <button className="ghost-btn" onClick={() => setScreen(settingsReturn)} aria-label="뒤로">
              <IconChevL />
            </button>
            <span className="head-title">설정 · 소개</span>
            <span className="head-spacer" />
          </header>

          <div className="privacy-hero">
            <span className="privacy-hero-icon">
              <IconShield size={26} />
            </span>
            <div>
              <strong>사진은 기기를 떠나지 않아요</strong>
              <p>모든 편집은 기기 안에서만 처리되며, 어떤 사진도 서버로 전송·저장되지 않습니다.</p>
            </div>
          </div>

          <div className="section-label">플랜</div>
          <div className="settings-card">
            <SettingsRow
              icon={<IconSpark />}
              title={billing?.premium ? '평생 무제한' : '무료 플랜'}
              desc={
                billing?.premium
                  ? '평생 이용 중'
                  : billing
                    ? `무료 ${freeLeft(billing)}장 남음 · 추가는 ₩4,900 평생`
                    : ''
              }
              right={
                billing?.premium ? (
                  <span className="green-badge sm">PRO</span>
                ) : (
                  <span className="tonal-tag">업그레이드</span>
                )
              }
              onClick={billing?.premium ? undefined : () => setShowPaywall(true)}
            />
          </div>

          <div className="section-label">약관 · 정보</div>
          <div className="settings-card">
            <SettingsRow icon={<IconLock />} title="개인정보처리방침" onClick={() => openLegal(PRIVACY)} />
            <div className="hr" />
            <SettingsRow icon={<IconDoc />} title="이용약관" onClick={() => openLegal(TERMS)} />
            <div className="hr" />
            <SettingsRow icon={<IconInfo />} title="자주 묻는 질문" onClick={() => openLegal(FAQ)} />
          </div>

          <button className="row-btn" onClick={onRestore}>
            구매 복원
          </button>

          <div className="notice disclaimer">
            <span className="notice-ic">
              <IconAlert />
            </span>
            <div>
              <strong>공인 서비스가 아닙니다</strong>
              본 앱은 규격에 맞춘 사진 제작을 돕는 도구이며, 정부·공공기관의 공인 서비스가
              아닙니다. 심사 합격을 보장하지 않으니 최종 규정은 발급 기관 안내를 확인하세요.
            </div>
          </div>

          <p className="settings-footer">Yei ID · 버전 {appVersion}</p>
        </>
      )}

      {screen === 'legal' && legalDoc && (
        <>
          <header className="editor-head">
            <button className="ghost-btn" onClick={() => setScreen('settings')} aria-label="뒤로">
              <IconChevL />
            </button>
            <span className="head-title">{legalDoc.title}</span>
            <span className="head-spacer" />
          </header>
          <div className="legal">
            {legalDoc.updated && <p className="legal-updated">{legalDoc.updated}</p>}
            {legalDoc.sections.map((s, i) => (
              <div className="legal-sec" key={i}>
                {s.h && <h3>{s.h}</h3>}
                <p>{s.body}</p>
                {s.links && (
                  <div className="legal-links">
                    {s.links.map((l) => (
                      <button key={l.url} className="legal-link" onClick={() => openExternal(l.url)}>
                        {l.label} ↗
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        hidden
        onChange={onPick}
      />
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="user"
        hidden
        onChange={onPick}
      />

      {showPaywall && <Paywall onUnlock={onUnlock} onClose={() => setShowPaywall(false)} />}
      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}

/** 가벼운 보정 패널 (여권 모드에서도 허용 범위) */
function AdjustPanel({
  adjust,
  onChange,
}: {
  adjust: Adjust
  onChange: (a: Adjust) => void
}) {
  const set = (key: keyof Adjust) => (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange({ ...adjust, [key]: Number(e.target.value) })

  return (
    <div className="panel">
      <div className="panel-head">
        <span>가벼운 보정</span>
        <button className="link" onClick={() => onChange(NEUTRAL)}>
          초기화
        </button>
      </div>
      <Slider label="노출" min={0.6} max={1.6} step={0.01} value={adjust.exposure} onChange={set('exposure')} />
      <Slider label="밝기" min={-40} max={40} step={1} value={adjust.brightness} onChange={set('brightness')} />
      <Slider label="화이트밸런스" min={-30} max={30} step={1} value={adjust.temp} onChange={set('temp')} />
      <p className="panel-hint">피부톤을 왜곡하지 않는 선에서 사용하세요. (여권 허용 범위)</p>
    </div>
  )
}

function Slider({
  label,
  min,
  max,
  step,
  value,
  onChange,
}: {
  label: string
  min: number
  max: number
  step: number
  value: number
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}) {
  return (
    <label className="slider-row">
      <span>{label}</span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={onChange} />
    </label>
  )
}

/** 효과 패널: 배경 교체 + 뽀샤시/글로우 (면허증·일반 권장) */
function EffectsPanel({
  effects,
  onChange,
  bgBusy,
  bgProgress,
  bgError,
  bgModel,
  onModelChange,
  bgSupported,
  isNative,
  faceBusy,
}: {
  effects: Effects
  onChange: (e: Effects) => void
  bgBusy: boolean
  bgProgress: string
  bgError: string | null
  bgModel: BgModel
  onModelChange: (m: BgModel) => void
  bgSupported: boolean
  isNative: boolean
  faceBusy: boolean
}) {
  return (
    <div className="panel">
      <div className="panel-head">
        <span>배경 · 효과</span>
        <button className="link" onClick={() => onChange(NEUTRAL_EFFECTS)}>
          초기화
        </button>
      </div>

      {bgSupported ? (
        <>
          <div className="bg-row">
            <span>배경</span>
            <div className="bg-swatches">
              <button
                className={`swatch none ${effects.bgColor === null ? 'active' : ''}`}
                onClick={() => onChange({ ...effects, bgColor: null })}
                title="원본 배경"
              >
                없음
              </button>
              {BG_COLORS.map((c) => (
                <button
                  key={c.id}
                  className={`swatch ${effects.bgColor === c.color ? 'active' : ''}`}
                  style={{ background: c.color }}
                  onClick={() => onChange({ ...effects, bgColor: c.color })}
                  title={c.label}
                  aria-label={c.label}
                />
              ))}
            </div>
          </div>
          {/* 모델 품질 선택은 웹(@imgly) 전용 — 네이티브(ML Kit)는 단일 모델 */}
          {!isNative && effects.bgColor !== null && (
            <div className="bg-row">
              <span>모델 품질</span>
              <div className="seg">
                <button
                  className={bgModel === 'isnet_fp16' ? 'active' : ''}
                  onClick={() => onModelChange('isnet_fp16')}
                >
                  빠름
                </button>
                <button
                  className={bgModel === 'isnet' ? 'active' : ''}
                  onClick={() => onModelChange('isnet')}
                >
                  고품질
                </button>
              </div>
            </div>
          )}
          {bgBusy && (
            <div className="bg-busy">
              <div className="progress-bar" />
              <span>배경 분리 중… {bgProgress || '잠시만요'}</span>
            </div>
          )}
          {bgError && <p className="panel-hint error">{bgError}</p>}

          <Slider
            label="뽀샤시"
            min={0}
            max={100}
            step={1}
            value={effects.glow}
            onChange={(e) => onChange({ ...effects, glow: Number(e.target.value) })}
          />
          {/* 잡티 완화는 네이티브 얼굴검출(ML Kit) 필요 → 모바일 전용 */}
          {isNative && (
            <>
              <Slider
                label="잡티 완화"
                min={0}
                max={100}
                step={1}
                value={effects.smooth}
                onChange={(e) => onChange({ ...effects, smooth: Number(e.target.value) })}
              />
              {faceBusy && <p className="panel-hint">얼굴 분석 중… 잠시만요</p>}
            </>
          )}
        </>
      ) : (
        <p className="panel-hint">
          이 규격은 규정상 <b>배경 교체·보정</b>이 제한됩니다. 흰색 배경 앞에서 촬영하세요.
        </p>
      )}
    </div>
  )
}

/** 출력 패널: 목표 용량 맞추기 + 결과 용량 표시 */
function OutputPanel({
  targetEnabled,
  targetKB,
  outSize,
  onToggle,
  onTargetKB,
}: {
  targetEnabled: boolean
  targetKB: number
  outSize: { bytes: number; quality: number } | null
  onToggle: (v: boolean) => void
  onTargetKB: (v: number) => void
}) {
  const over = targetEnabled && outSize ? outSize.bytes > targetKB * 1024 : false
  return (
    <div className="panel">
      <div className="panel-head">
        <span>출력 (JPEG)</span>
      </div>

      <label className="check-row">
        <input
          type="checkbox"
          checked={targetEnabled}
          onChange={(e) => onToggle(e.target.checked)}
        />
        목표 용량 맞추기
      </label>
      {targetEnabled && (
        <div className="bg-row">
          <span>목표 용량</span>
          <div className="kb-input">
            <input
              type="number"
              min={10}
              max={5000}
              step={10}
              value={targetKB}
              onChange={(e) => onTargetKB(Number(e.target.value))}
            />
            KB 이하
          </div>
        </div>
      )}

      <p className="panel-hint">
        결과 용량:{' '}
        <b className={over ? 'error' : ''}>
          {outSize ? formatBytes(outSize.bytes) : '계산 중…'}
        </b>
        {outSize && ` (품질 ${Math.round(outSize.quality * 100)}%)`}
        {over && ' — 목표보다 큼: 규격이 커서 최저 품질로도 초과'}
      </p>
    </div>
  )
}

/** YeiID 워드마크 (Yei = 잉크, ID = 옐로딥) */
function Wordmark() {
  return (
    <span className="wordmark">
      Yei{' '}
      <span className="wm-id">ID</span>
    </span>
  )
}

/** 로고: 노란 라운드 타일(살짝 회전) + 잉크 미소 페이스 */
function Logo({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden className="logo">
      <rect x="7" y="7" width="34" height="34" rx="11" fill="#FFD12E" transform="rotate(-4 24 24)" />
      <circle cx="18.5" cy="22" r="2.3" fill="#17161C" />
      <circle cx="29.5" cy="22" r="2.3" fill="#17161C" />
      <path d="M17 28 Q24 35 31 28" stroke="#17161C" strokeWidth="2.6" fill="none" strokeLinecap="round" />
    </svg>
  )
}

/** 용도 칩 아이콘 (라인, currentColor) */
function IconPassport({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
      <rect x="5" y="3" width="14" height="18" rx="2.5" />
      <circle cx="12" cy="10" r="2.6" />
      <path d="M9.5 15.5h5" strokeLinecap="round" />
    </svg>
  )
}
function IconCard({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
      <rect x="3" y="6" width="18" height="12" rx="2.5" />
      <circle cx="8" cy="12" r="2.2" />
      <path d="M13 10.5h5M13 14h4" strokeLinecap="round" />
    </svg>
  )
}
function IconUser({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
      <circle cx="12" cy="8.5" r="3.6" />
      <path d="M5.5 19c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" strokeLinecap="round" />
    </svg>
  )
}
/** 저장 파일명용 타임스탬프 yyyyMMdd_HHmmss_SSS (밀리초까지 → 연속 저장도 충돌 없음) */
function nowStamp(): string {
  const d = new Date()
  const p = (n: number, w = 2) => String(n).padStart(w, '0')
  return (
    `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}_` +
    `${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}_${p(d.getMilliseconds(), 3)}`
  )
}

/** 해외 규격(미국 등) 아이콘 — 지구본 */
function IconGlobe({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.6 2.4 4 5.6 4 9s-1.4 6.6-4 9c-2.6-2.4-4-5.6-4-9s1.4-6.6 4-9z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
/** 시험·자격증 아이콘 — 문서+체크 */
function IconExam({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
      <path d="M6 3h8l4 4v14H6z" strokeLinejoin="round" />
      <path d="M14 3v4h4" strokeLinejoin="round" />
      <path d="M8.5 14l2 2 4-4.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
/** 용도 id → 아이콘. 해외(프리미엄)=지구본, 시험·자격증=문서, 나라/시험 추가 시 수정 불필요 */
function UsageIcon({ id, size = 20 }: { id: Usage; size?: number }) {
  if (id === 'passport') return <IconPassport size={size} />
  if (id === 'license') return <IconCard size={size} />
  if (USAGE_SPECS[id].group === 'exam') return <IconExam size={size} />
  if (USAGE_SPECS[id].premium) return <IconGlobe size={size} />
  return <IconUser size={size} />
}
/** 뒤로가기 쉐브론 (디자인 IconChevL) */
function IconChevL() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M15 6l-6 6 6 6" />
    </svg>
  )
}
function IconUpload() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M12 16V4M7 9l5-5 5 5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 20h14" strokeLinecap="round" />
    </svg>
  )
}
function IconCamera() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path
        d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="13" r="3.2" />
    </svg>
  )
}
function IconShield({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M12 3l7 3v5c0 4.4-3 7.7-7 9-4-1.3-7-4.6-7-9V6z" strokeLinejoin="round" />
      <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function IconLock() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" strokeLinecap="round" />
    </svg>
  )
}
function IconDoc() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M7 3h7l4 4v14H7z" strokeLinejoin="round" />
      <path d="M14 3v4h4M9.5 12h5M9.5 16h5" strokeLinecap="round" />
    </svg>
  )
}
function IconSpark() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M12 4l1.8 4.7L18.5 10l-4.7 1.8L12 16.5 10.2 11.8 5.5 10l4.7-1.3z" strokeLinejoin="round" />
    </svg>
  )
}
function IconAlert({ size = 17 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M12 4l9 16H3z" strokeLinejoin="round" />
      <path d="M12 10v4M12 17.2v.2" strokeLinecap="round" />
    </svg>
  )
}
function IconChevR() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function IconInfo() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 8v.2" strokeLinecap="round" />
    </svg>
  )
}
function IconSun() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <circle cx="12" cy="12" r="4" />
      <path
        d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"
        strokeLinecap="round"
      />
    </svg>
  )
}
function IconWall() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <rect x="3" y="4" width="18" height="16" rx="1.5" />
      <path d="M3 9h18M3 15h18M9 4v5M15 9v6M9 15v5" strokeLinecap="round" />
    </svg>
  )
}

/** 인물 일러스트 (스튜디오 head&shoulders 플레이스홀더) — 디자인 핸드오프 Portrait 이식 */
function Portrait() {
  return (
    <div className="portrait">
      <div className="portrait-vignette" />
      <div className="portrait-subject">
        <svg viewBox="0 0 200 230" width="100%" preserveAspectRatio="xMidYMax meet" aria-hidden>
          <defs>
            <radialGradient id="pskin" cx="50%" cy="40%" r="62%">
              <stop offset="0%" stopColor="#F6D2BC" />
              <stop offset="62%" stopColor="#EBBD9E" />
              <stop offset="100%" stopColor="#D6A084" />
            </radialGradient>
            <linearGradient id="phair" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3B3230" />
              <stop offset="100%" stopColor="#241D1C" />
            </linearGradient>
            <linearGradient id="pcloth" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#46556A" />
              <stop offset="100%" stopColor="#2E3A4B" />
            </linearGradient>
          </defs>
          <path d="M28 230 C30 178 60 158 100 158 C140 158 170 178 172 230 Z" fill="url(#pcloth)" />
          <path d="M78 150 h44 v22 c0 14 -44 14 -44 0 Z" fill="#E8C0A4" />
          <path d="M82 158 q18 12 36 0 v8 q-18 10 -36 0 Z" fill="#C99576" opacity="0.5" />
          <path d="M58 86 C58 44 78 26 100 26 C122 26 142 44 142 86 C142 110 138 128 132 140 L128 120 C130 96 120 74 100 74 C80 74 70 96 72 120 L68 140 C62 128 58 110 58 86 Z" fill="url(#phair)" />
          <ellipse cx="100" cy="96" rx="38" ry="46" fill="url(#pskin)" />
          <ellipse cx="62" cy="100" rx="7" ry="11" fill="#E3B295" />
          <ellipse cx="138" cy="100" rx="7" ry="11" fill="#E3B295" />
          <path d="M62 90 C60 56 80 40 100 40 C120 40 140 56 138 90 C134 72 124 62 100 62 C76 62 66 72 62 90 Z" fill="url(#phair)" />
          <path d="M76 88 q10 -5 20 -1" stroke="#5A4A44" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M104 87 q10 -4 20 1" stroke="#5A4A44" strokeWidth="3" fill="none" strokeLinecap="round" />
          <ellipse cx="84" cy="98" rx="5.4" ry="3.4" fill="#fff" />
          <ellipse cx="116" cy="98" rx="5.4" ry="3.4" fill="#fff" />
          <circle cx="84.5" cy="98.4" r="2.5" fill="#3A2C25" />
          <circle cx="115.5" cy="98.4" r="2.5" fill="#3A2C25" />
          <path d="M100 100 v12 q-4 4 -7 5" stroke="#C99576" strokeWidth="2.4" fill="none" strokeLinecap="round" />
          <path d="M88 124 q12 7 24 0" stroke="#C57F6E" strokeWidth="3.4" fill="none" strokeLinecap="round" />
          <ellipse cx="76" cy="112" rx="7" ry="5" fill="#F0B69B" opacity="0.45" />
          <ellipse cx="124" cy="112" rx="7" ry="5" fill="#F0B69B" opacity="0.45" />
        </svg>
      </div>
    </div>
  )
}

/** 랜딩의 샘플 미리보기 카드 (35:45, 인물 + 크롭 마크) */
function SampleCard() {
  return (
    <div className="sample-card">
      <div className="sample-photo">
        <Portrait />
        <span className="cm tl" />
        <span className="cm tr" />
        <span className="cm bl" />
        <span className="cm br" />
      </div>
      <div className="sample-foot">
        <span className="green-badge sm">여권 규격</span>
        <span className="sample-dim">35 × 45mm</span>
      </div>
    </div>
  )
}

/** 랜딩 화면 (진입 + 가치 제안 + 시작 CTA) */
function Landing({
  usage,
  onSelectUsage,
  premium,
  onStart,
  onCamera,
  onSettings,
}: {
  usage: Usage
  onSelectUsage: (u: Usage) => void
  premium: boolean
  onStart: () => void
  onCamera: () => void
  onSettings: () => void
}) {
  return (
    <div className="landing">
      <div className="brand-row">
        <Logo />
        <Wordmark />
        <span className="head-spacer" />
        <button className="ghost-btn floating" onClick={onSettings} aria-label="설정">
          ⚙
        </button>
      </div>
      <span className="green-badge">100% 기기 내 처리</span>
      <h1 className="display">
        집에서 1분,
        <br />
        규격 딱 맞는
        <br />
        <mark>증명사진</mark>.
      </h1>
      <p className="landing-sub">
        여권 · 운전면허 · 일반 증명사진을 사진관 없이. 업로드한 사진은 서버로 전송되지 않습니다.
      </p>
      <SampleCard />
      <div className="doc-chips">
        {USAGES.filter((u) => !isExam(u.id)).map((u) => (
          <button
            key={u.id}
            className={`doc-chip ${usage === u.id ? 'active' : ''}`}
            aria-pressed={usage === u.id}
            onClick={() => onSelectUsage(u.id)}
          >
            <span className="doc-tile">
              <UsageIcon id={u.id} />
              {requiresPremium(u.id) && !premium && <span className="lock-badge chip">🔒</span>}
            </span>
            <span className="doc-label">{u.label}</span>
          </button>
        ))}
      </div>
      <button className="cta" onClick={onStart}>
        <IconUpload /> 사진 올리기
      </button>
      <button className="cta-secondary" onClick={onCamera}>
        <IconCamera /> 카메라로 촬영
      </button>
      <p className="landing-cap">무료로 5장 다운로드 · 가입 없이 바로 시작</p>
    </div>
  )
}

/** 잘 나오는 팁 카드 (편집 화면 하단) */
function TipsCard() {
  const tips: { icon: React.ReactNode; text: string }[] = [
    { icon: <IconSun />, text: '밝고 균일한 조명에서 촬영' },
    { icon: <IconWall />, text: '벽 등 단색 배경 앞에 서기' },
    { icon: <IconUser size={17} />, text: '정면을 보고 어깨가 보이게' },
  ]
  return (
    <div className="panel tips-card">
      <div className="tips-title">잘 나오는 팁</div>
      {tips.map((t, i) => (
        <div className="tip-row" key={i}>
          <span className="tip-ic">{t.icon}</span>
          <span>{t.text}</span>
        </div>
      ))}
    </div>
  )
}

/** 설정 행 (아이콘 타일 + 제목 + 설명 + chevron/우측요소) */
function SettingsRow({
  icon,
  title,
  desc,
  right,
  onClick,
}: {
  icon: React.ReactNode
  title: string
  desc?: string
  right?: React.ReactNode
  onClick?: () => void
}) {
  const inner = (
    <>
      <span className="row-icon">{icon}</span>
      <span className="row-text">
        <span className="row-title">{title}</span>
        {desc && <span className="row-desc">{desc}</span>}
      </span>
      {right ? right : onClick ? <span className="row-chev"><IconChevR /></span> : null}
    </>
  )
  return onClick ? (
    <button className="settings-row" onClick={onClick}>
      {inner}
    </button>
  ) : (
    <div className="settings-row">{inner}</div>
  )
}

/** 여권 모드 규정 안내 배너 (외교부 무보정 원칙) */
/** 제한 규격(여권·미국 등) 안내 — 규격 데이터의 notice를 그대로 렌더 */
function RestrictedNotice({ notice }: { notice: { title: string; bullets: string[] } }) {
  return (
    <div className="notice" role="note">
      <strong>{notice.title}</strong>
      <ul>
        {notice.bullets.map((b, i) => (
          <li key={i}>{b}</li>
        ))}
      </ul>
    </div>
  )
}
