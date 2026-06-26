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
import { t } from './strings'
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
    setToast(t('app.loadingPhoto'))
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
      setToast(t('app.loadPhotoFailed', { msg: (err as Error)?.message ?? '' }))
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
        setBgError(t('app.bgRemovalFailed', { msg: err?.message ?? err }))
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
        setToast(t('app.previewFailed', { msg: (err as Error)?.message ?? err }))
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
        setToast(t('app.restoreSuccess'))
      } else {
        setToast(t('app.restoreNone'))
      }
    } catch (e) {
      setToast(t('app.restoreFailed', { msg: (e as Error)?.message ?? e }))
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
      setToast(t('app.exportFailed', { msg: (e as Error)?.message ?? e }))
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
      setToast(t('app.saveFailed', { msg: (e as Error)?.message ?? e }))
      return
    }
    setToast(t('app.saved'))
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
            <button className="ghost-btn" onClick={() => setScreen('landing')} aria-label={t('app.back')}>
              <IconChevL />
            </button>
            <span className="head-title">{t('app.editTitle')}</span>
            <button className="ghost-btn" onClick={openSettings} aria-label={t('app.settings')}>
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
            ? t('app.digitalSpec', {
                w: spec.targetW,
                h: spec.targetH,
                kb: spec.maxKB,
                fmt: (spec.format ?? 'jpg').toUpperCase(),
              })
            : t('app.printSpec', {
                w: spec.targetW,
                h: spec.targetH,
                dpi: spec.dpi,
                faceMin: spec.faceMin,
                faceMax: spec.faceMax,
              })}
        </div>
      </div>

      {spec.notice && <RestrictedNotice notice={spec.notice} />}

      {!image ? (
        <button className="upload-cta" onClick={() => fileRef.current?.click()}>
          {t('app.importPhoto')}
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
            busyLabel={t('app.separatingBg')}
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
              {t('app.tabAdjust')}
            </button>
            <button
              role="tab"
              className={tool === 'effects' ? 'active' : ''}
              onClick={() => setTool('effects')}
            >
              {t('app.tabEffects')}
            </button>
            <button
              role="tab"
              className={tool === 'output' ? 'active' : ''}
              onClick={() => setTool('output')}
            >
              {t('app.tabOutput')}
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
              {t('app.anotherPhoto')}
            </button>
            <button
              onClick={() => {
                clearResultCache() // 최신 편집 반영 위해 캐시 비우고 진입
                setScreen('result')
              }}
            >
              {t('app.donePreview')}
            </button>
          </div>
          <TipsCard usage={usage} />
        </>
      )}
        </>
      )}

      {screen === 'result' && (
        <>
          <header className="editor-head">
            <button className="ghost-btn" onClick={() => setScreen('editor')} aria-label={t('app.back')}>
              <IconChevL />
            </button>
            <span className="head-title">{t('app.doneTitle')}</span>
            {billing?.premium && <span className="green-badge sm">PRO</span>}
            <button className="ghost-btn" onClick={openSettings} aria-label={t('app.settings')}>
              ⚙
            </button>
          </header>

          <div className="result-preview">
            {resultUrl ? (
              <img src={resultUrl} alt={t('app.resultAlt')} />
            ) : (
              <div className="result-loading">
                <div className="progress-bar" />
                <span>{t('app.rendering')}</span>
              </div>
            )}
          </div>

          {!isExam(usage) && (
            <div className="seg result-seg">
              <button className={!printSheet ? 'active' : ''} onClick={() => setPrintSheet(false)}>
                {t('app.singlePhoto')}
              </button>
              <button
                className={printSheet ? 'active' : ''}
                onClick={() => {
                  setPrintSheet(true)
                  if (!billing?.premium) setShowPaywall(true)
                }}
              >
                {t('app.printSheet', { count: sheetGrid(spec.targetW, spec.targetH).count })}
                {!billing?.premium && <span className="lock-badge">🔒</span>}
              </button>
            </div>
          )}

          <div className="panel checklist">
            <div className="check-line">
              ✓ {t('app.checkSpec', { label: spec.label })} ·{' '}
              {isExam(usage)
                ? t('app.checkDigital', {
                    w: spec.targetW,
                    h: spec.targetH,
                    fmt: (spec.format ?? 'jpg').toUpperCase(),
                    kb: spec.maxKB,
                  })
                : t('app.checkPrint', { w: spec.targetW, h: spec.targetH, dpi: spec.dpi })}
            </div>
            <div className="check-line">✓ {t('app.checkAutoFit')}</div>
            <div className="check-line">✓ {t('app.checkOnDevice')}</div>
            {outSize && (
              <div className="check-line muted">
                {t('app.checkFileSize', { size: formatBytes(outSize.bytes) })}
              </div>
            )}
            {isRegulated(usage) && (
              <div className="check-line warn">⚠ {t('app.checkRegulatedWarn')}</div>
            )}
          </div>

          {locked ? (
            <>
              <div className="upsell">
                {requiresPremium(usage)
                  ? t('app.upsellOverseas')
                  : t('app.upsellSheet')}
              </div>
              <div className="actions">
                <button onClick={() => setShowPaywall(true)}>{t('app.unlockLifetime')} · ₩4,900</button>
              </div>
            </>
          ) : billing && !canDownload(billing) ? (
            <>
              <div className="upsell">{t('app.upsellFreeUsedUp')}</div>
              <div className="actions">
                <button onClick={() => setShowPaywall(true)}>{t('app.lifetimeUnlimited')} · ₩4,900</button>
              </div>
            </>
          ) : (
            <>
              <div className="actions">
                <button onClick={onDownload}>
                  {billing?.premium
                    ? t('app.download')
                    : billing
                      ? t('app.downloadFreeLeft', { n: freeLeft(billing) })
                      : t('app.downloadFree')}
                </button>
              </div>
              {billing && !billing.premium && (
                <p className="billing-caption">{t('app.billingCaption')}</p>
              )}
            </>
          )}

          {saved && (
            <div className="saved-box">
              <div className="saved-line">
                <span className="saved-check">✓</span> {t('app.savedToGallery')}
              </div>
              {APPLY_SITE[usage] && (
                <>
                  <button className="apply-cta" onClick={() => openExternal(APPLY_SITE[usage]!.url)}>
                    {t('app.applyCta')}
                  </button>
                  <p className="apply-note">{t('app.applyNote', { label: APPLY_SITE[usage]!.label })}</p>
                </>
              )}
            </div>
          )}
        </>
      )}

      {screen === 'settings' && (
        <>
          <header className="editor-head">
            <button className="ghost-btn" onClick={() => setScreen(settingsReturn)} aria-label={t('app.back')}>
              <IconChevL />
            </button>
            <span className="head-title">{t('app.settingsTitle')}</span>
            <span className="head-spacer" />
          </header>

          <div className="privacy-hero">
            <span className="privacy-hero-icon">
              <IconShield size={26} />
            </span>
            <div>
              <strong>{t('app.privacyHeroTitle')}</strong>
              <p>{t('app.privacyHeroBody')}</p>
            </div>
          </div>

          <div className="section-label">{t('app.sectionPlan')}</div>
          <div className="settings-card">
            <SettingsRow
              icon={<IconSpark />}
              title={billing?.premium ? t('app.planPremiumTitle') : t('app.planFreeTitle')}
              desc={
                billing?.premium
                  ? t('app.planPremiumDesc')
                  : billing
                    ? t('app.planFreeDesc', { n: freeLeft(billing) })
                    : ''
              }
              right={
                billing?.premium ? (
                  <span className="green-badge sm">PRO</span>
                ) : (
                  <span className="tonal-tag">{t('app.upgrade')}</span>
                )
              }
              onClick={billing?.premium ? undefined : () => setShowPaywall(true)}
            />
          </div>

          <div className="section-label">{t('app.sectionLegal')}</div>
          <div className="settings-card">
            <SettingsRow icon={<IconLock />} title={t('app.privacyPolicy')} onClick={() => openLegal(PRIVACY)} />
            <div className="hr" />
            <SettingsRow icon={<IconDoc />} title={t('app.terms')} onClick={() => openLegal(TERMS)} />
            <div className="hr" />
            <SettingsRow icon={<IconInfo />} title={t('app.faq')} onClick={() => openLegal(FAQ)} />
          </div>

          <button className="row-btn" onClick={onRestore}>
            {t('app.restorePurchase')}
          </button>

          <div className="notice disclaimer">
            <span className="notice-ic">
              <IconAlert />
            </span>
            <div>
              <strong>{t('app.disclaimerTitle')}</strong>
              {t('app.disclaimerBody')}
            </div>
          </div>

          <p className="settings-footer">{t('app.footerVersion', { version: appVersion })}</p>
        </>
      )}

      {screen === 'legal' && legalDoc && (
        <>
          <header className="editor-head">
            <button className="ghost-btn" onClick={() => setScreen('settings')} aria-label={t('app.back')}>
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
        <span>{t('app.adjustTitle')}</span>
        <button className="link" onClick={() => onChange(NEUTRAL)}>
          {t('app.reset')}
        </button>
      </div>
      <Slider label={t('app.exposure')} min={0.6} max={1.6} step={0.01} value={adjust.exposure} onChange={set('exposure')} />
      <Slider label={t('app.brightness')} min={-40} max={40} step={1} value={adjust.brightness} onChange={set('brightness')} />
      <Slider label={t('app.whiteBalance')} min={-30} max={30} step={1} value={adjust.temp} onChange={set('temp')} />
      <p className="panel-hint">{t('app.adjustHint')}</p>
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
        <span>{t('app.effectsTitle')}</span>
        <button className="link" onClick={() => onChange(NEUTRAL_EFFECTS)}>
          {t('app.reset')}
        </button>
      </div>

      {bgSupported ? (
        <>
          <div className="bg-row">
            <span>{t('app.background')}</span>
            <div className="bg-swatches">
              <button
                className={`swatch none ${effects.bgColor === null ? 'active' : ''}`}
                onClick={() => onChange({ ...effects, bgColor: null })}
                title={t('app.originalBg')}
              >
                {t('app.bgNone')}
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
              <span>{t('app.modelQuality')}</span>
              <div className="seg">
                <button
                  className={bgModel === 'isnet_fp16' ? 'active' : ''}
                  onClick={() => onModelChange('isnet_fp16')}
                >
                  {t('app.modelFast')}
                </button>
                <button
                  className={bgModel === 'isnet' ? 'active' : ''}
                  onClick={() => onModelChange('isnet')}
                >
                  {t('app.modelHighQuality')}
                </button>
              </div>
            </div>
          )}
          {bgBusy && (
            <div className="bg-busy">
              <div className="progress-bar" />
              <span>{bgProgress || t('app.justAMoment')}</span>
            </div>
          )}
          {bgError && <p className="panel-hint error">{bgError}</p>}

          <Slider
            label={t('app.glow')}
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
                label={t('app.smooth')}
                min={0}
                max={100}
                step={1}
                value={effects.smooth}
                onChange={(e) => onChange({ ...effects, smooth: Number(e.target.value) })}
              />
              {faceBusy && <p className="panel-hint">{t('app.analyzingFace')}</p>}
            </>
          )}
        </>
      ) : (
        <p className="panel-hint">
          {t('app.bgRestrictedPre')} <b>{t('app.bgRestrictedBold')}</b> {t('app.bgRestrictedPost')}
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
        <span>{t('app.outputTitle')}</span>
      </div>

      <label className="check-row">
        <input
          type="checkbox"
          checked={targetEnabled}
          onChange={(e) => onToggle(e.target.checked)}
        />
        {t('app.fitTargetSize')}
      </label>
      {targetEnabled && (
        <div className="bg-row">
          <span>{t('app.targetSize')}</span>
          <div className="kb-input">
            <input
              type="number"
              min={10}
              max={5000}
              step={10}
              value={targetKB}
              onChange={(e) => onTargetKB(Number(e.target.value))}
            />
            {t('app.kbOrLess')}
          </div>
        </div>
      )}

      <p className="panel-hint">
        {t('app.outputSizeLabel')}{' '}
        <b className={over ? 'error' : ''}>
          {outSize ? formatBytes(outSize.bytes) : t('app.calculating')}
        </b>
        {outSize && ` ${t('app.qualityPct', { pct: Math.round(outSize.quality * 100) })}`}
        {over && ` ${t('app.overTarget')}`}
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
function SampleCard({ usage }: { usage: Usage }) {
  const spec = USAGE_SPECS[usage]
  return (
    <div className="sample-card">
      <div className="sample-photo" style={{ aspectRatio: `${spec.widthMm} / ${spec.heightMm}` }}>
        <Portrait />
        <span className="cm tl" />
        <span className="cm tr" />
        <span className="cm bl" />
        <span className="cm br" />
      </div>
      <div className="sample-foot">
        <span className="green-badge sm">{t('app.specBadge', { label: spec.label })}</span>
        <span className="sample-dim">
          {spec.widthMm} × {spec.heightMm}mm
        </span>
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
        <button className="ghost-btn floating" onClick={onSettings} aria-label={t('app.settings')}>
          ⚙
        </button>
      </div>
      <h1 className="display">
        {t('app.headlineLine1')}
        <br />
        {t('app.headlineLine2')}
        <br />
        <mark>{t('app.headlineMark')}</mark>.
      </h1>
      <p className="landing-sub">
        {t('app.landingSub')}
      </p>
      <SampleCard usage={usage} />
      <div className="doc-chips">
        {USAGES.filter((u) => isSelectable(u.id)).map((u) => (
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
        <IconUpload /> {t('app.uploadPhoto')}
      </button>
      <button className="cta-secondary" onClick={onCamera}>
        <IconCamera /> {t('app.takePhoto')}
      </button>
      <p className="landing-privacy">
        <IconLock /> {t('app.landingPrivacy')}
      </p>
      <p className="landing-cap">{t('app.landingCap')}</p>
    </div>
  )
}

/** 잘 나오는 팁 카드 (편집 화면 하단) */
function TipsCard({ usage }: { usage: Usage }) {
  const tips: { icon: React.ReactNode; text: string }[] = [
    { icon: <IconSun />, text: t('app.tipLighting') },
    { icon: <IconWall />, text: t('app.tipBackground') },
    { icon: <IconUser size={17} />, text: t('app.tipPose') },
  ]
  // 면허·일반·시험 등 비제한 규격만: 잡티 완화로 인상 산뜻 (여권·해외=원본 보존이라 제외)
  if (!isRegulated(usage)) {
    tips.push({ icon: <IconSpark />, text: t('app.tipSmooth') })
  }
  return (
    <div className="panel tips-card">
      <div className="tips-title">{t('app.tipsTitle')}</div>
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
