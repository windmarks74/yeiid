// 사진 용도 + 용도별 규격. 용도가 규격(치수·얼굴 비율)과 보정 규정을 함께 결정한다.
// 규격 출처: 디자인 핸드오프 SPECS (한국 기준).

import { t, LANG } from './strings'

export type Usage =
  | 'passport'
  | 'license'
  | 'general'
  | 'us'
  | 'schengen'
  | 'qnet'
  | 'kpc'
  | 'gosi'
  | 'toeic'

export type UsageSpec = {
  label: string
  widthMm: number
  heightMm: number
  dpi: number
  /** 출력 가로 px */
  targetW: number
  /** 출력 세로 px */
  targetH: number
  /** 머리(정수리~턱)가 사진 높이에서 차지하는 권장 비율 % */
  faceMin: number
  faceMax: number
  /** 규정상 AI 배경교체·잡티·강한 보정을 막는 제한 규격(여권·해외 등) */
  restricted: boolean
  /** 프리미엄(해외 규격) 잠금 — 기존 entitlement로 해제 */
  premium?: boolean
  /** 눈높이 가이드 밴드(사진 상단 기준 %). 없으면 미표시 */
  eyeMin?: number
  eyeMax?: number
  /** 권장 파일 용량 상한(KB) — 있으면 출력 기본값으로 적용 (예: 미국 DV ≤240KB) */
  maxKB?: number
  /** 안내문 (있으면 표시 — 제한 규격·시험 규격 공용) */
  notice?: { title: string; bullets: string[] }
  /** 선택 UI 그룹. 미지정=국내. 랜딩 칩은 'exam' 제외(에디터 탭에서 선택). */
  group?: 'domestic' | 'overseas' | 'exam'
  /** 강제 출력 포맷 (기본 jpg) */
  format?: 'jpg' | 'png'
  allowedFormats?: Array<'jpg' | 'png'>
  /** 디지털 최소 px (용량 맞추려 축소 시 위반 금지) */
  minW?: number
  minH?: number
  /** 안경 정책: 'forbid'=반려 경고, 'warn'=권고(시험류) */
  glasses?: 'warn' | 'forbid'
  recencyMonths?: number
  /** 치수 표시 단위가 inch인 규격(미국 등) — 영어 로케일에서 "2 × 2 in"로 표기. */
  displayInch?: boolean
  /**
   * 규격 출처 + 검증 상태. verified=true(공식 직접 확정)인 시험 프리셋만 사용자에게 노출(isSelectable).
   * checked=마지막 점검일(YYYY-MM). 자세한 근거·충돌은 note에. (⚠️ 출시 전 공식 페이지 직접 재확인)
   */
  source?: { url: string; verified: boolean; checked: string; note?: string }
}

export const USAGE_SPECS: Record<Usage, UsageSpec> = {
  passport: {
    label: t('usage.passport.label'),
    widthMm: 35,
    heightMm: 45,
    dpi: 300,
    targetW: 413, // 35mm @300dpi
    targetH: 531, // 45mm @300dpi
    faceMin: 70,
    faceMax: 80,
    restricted: true,
    notice: {
      title: t('usage.passport.notice.title'),
      bullets: [
        t('usage.passport.notice.b1'),
        t('usage.passport.notice.b2'),
        t('usage.passport.notice.b3'),
      ],
    },
  },
  license: {
    label: t('usage.license.label'),
    widthMm: 35,
    heightMm: 45,
    dpi: 300,
    targetW: 413,
    targetH: 531,
    faceMin: 65,
    faceMax: 80,
    restricted: false,
  },
  general: {
    label: t('usage.general.label'),
    widthMm: 30,
    heightMm: 40,
    dpi: 300,
    targetW: 354, // 30mm @300dpi
    targetH: 472, // 40mm @300dpi
    faceMin: 60,
    faceMax: 75,
    restricted: false,
  },
  // 미국 여권·비자: 2×2인치(51×51mm) 정사각, 600×600@300DPI. AI 편집 금지 → 제한 규격.
  // 머리 25~35mm(세로 50~69%), 눈높이 바닥에서 29~35mm(상단 기준 약 31~43%). 디지털 DV ≤240KB JPEG.
  // 출처: travel.state.gov (2026년 기준, AI·필터 편집 사진 반려).
  us: {
    label: t('usage.us.label'),
    widthMm: 51,
    heightMm: 51,
    dpi: 300,
    targetW: 600, // 2in @300dpi
    targetH: 600,
    faceMin: 50,
    faceMax: 69,
    eyeMin: 31, // 눈선 상단 기준 % (바닥 29~35mm → 상단 31~43%)
    eyeMax: 43,
    maxKB: 240, // 비자(DS-160)·DV 디지털 업로드 상한
    displayInch: true, // 영어 로케일에서 "2 × 2 in" 표기
    restricted: true,
    premium: true,
    notice: {
      title: t('usage.us.notice.title'),
      bullets: [
        t('usage.us.notice.b1'),
        t('usage.us.notice.b2'),
        t('usage.us.notice.b3'),
        t('usage.us.notice.b4'),
      ],
    },
  },
  // 셰겐(유럽) 비자·여권: 35×45mm, 머리 32~36mm(세로 70~80%) — 한국 여권과 물리 규격 동일.
  // 배경 흰색이 가장 안전(29개국 전부 수용), 일부는 밝은 회색/파랑. AI 편집 금지 → 제한 규격.
  // 출처: axa-schengen.com / schengenvisainfo.com (ICAO 기준, 최근 6개월·중립 표정).
  schengen: {
    label: t('usage.schengen.label'),
    widthMm: 35,
    heightMm: 45,
    dpi: 300,
    targetW: 413, // 35mm @300dpi (인화 시트 물리 정확성 위해 300DPI 고정)
    targetH: 531, // 45mm @300dpi
    faceMin: 70,
    faceMax: 80,
    restricted: true,
    premium: true,
    notice: {
      title: t('usage.schengen.notice.title'),
      bullets: [
        t('usage.schengen.notice.b1'),
        t('usage.schengen.notice.b2'),
        t('usage.schengen.notice.b3'),
        t('usage.schengen.notice.b4'),
      ],
    },
  },
  // ── 시험·자격증 (국내, 무료). 핵심 = 디지털 업로드 규격 자동 맞춤(특히 용량 캡).
  //    배경 흰색 가능, 보정은 보수적 권고(restricted 아님). 안경=경고 권고.
  // ⚠️ 수치는 1차 골격값 — 출시 전 각 기관 공식 페이지에서 px·용량·머리비율 직접 재확인할 것(source 참고).
  qnet: {
    label: t('usage.qnet.label'),
    widthMm: 30,
    heightMm: 40,
    dpi: 300,
    targetW: 300, // 디지털 업로드 px
    targetH: 400,
    minW: 300,
    minH: 400,
    faceMin: 62,
    faceMax: 78, // TODO: 반명함 머리비율 공식 확인
    maxKB: 200,
    format: 'jpg',
    allowedFormats: ['jpg'],
    glasses: 'warn',
    recencyMonths: 6,
    restricted: false,
    group: 'exam',
    source: {
      url: 'https://www.q-net.or.kr',
      verified: true, // ✅ 공식 직접 확정
      checked: '2026-06',
      note: '공식 확정(q-net 사이트 이용방법, 2025.12.17 갱신): 사진 300×400px 이상·JPEG/JPG. 부적합 사유는 "인쇄물 재촬영"이지 디지털 편집 금지 아님 → 디지털 출력·흰배경 OK. 단 ≤200KB는 q-net 가이드 근거(이 페이지엔 미명시) — 재확인 권장.',
    },
    notice: {
      title: t('usage.qnet.notice.title'),
      bullets: [
        t('usage.qnet.notice.b1'),
        t('usage.qnet.notice.b2'),
        t('usage.qnet.notice.b3'),
        t('usage.qnet.notice.b4'),
      ],
    },
  },
  kpc: {
    label: t('usage.kpc.label'),
    widthMm: 30,
    heightMm: 40,
    dpi: 300,
    targetW: 300,
    targetH: 400,
    minW: 300,
    minH: 400,
    faceMin: 62,
    faceMax: 78,
    maxKB: 200,
    format: 'jpg',
    allowedFormats: ['jpg'],
    glasses: 'warn',
    recencyMonths: 6,
    restricted: false,
    group: 'exam',
    source: {
      url: 'https://license.kpc.or.kr',
      verified: false, // 🔴 디지털 미확인 — 보류
      checked: '2026-06',
      note: '물리만 공식 확정(3×4cm·6개월·상반신 정면 탈모). 디지털 px/용량은 공식 미명시(큐넷 준용 추정, 미확정). KPC 원서접수 화면 확인 후 verified=true.',
    },
    notice: {
      title: t('usage.kpc.notice.title'),
      bullets: [
        t('usage.kpc.notice.b1'),
        t('usage.kpc.notice.b2'),
        t('usage.kpc.notice.b3'),
        t('usage.kpc.notice.b4'),
      ],
    },
  },
  gosi: {
    label: t('usage.gosi.label'),
    widthMm: 35,
    heightMm: 45,
    dpi: 300,
    targetW: 137, // 사이버국가고시센터 업로드 px
    targetH: 177,
    faceMin: 70,
    faceMax: 80,
    maxKB: 100,
    format: 'jpg',
    allowedFormats: ['jpg', 'png'],
    glasses: 'warn',
    recencyMonths: 6,
    restricted: false,
    group: 'exam',
    source: {
      url: 'https://gongmuwon.gosi.kr',
      verified: false, // 🟡 값 신뢰 높음, 공식 원문 미확보 — 폰 1회 확인 후 true
      checked: '2026-06',
      note: '값 신뢰 높음(다수 출처가 센터 인용): JPG/PNG·3.5×4.5cm(137×177px)·100KB 미만. 단 gongmuwon.gosi.kr 공식 원문은 PDF/JS라 직접 미확보 → 폰 원서접수 사진등록 화면 1회 확인 후 verified=true. (2026 사이버국가고시센터→gongmuwon.gosi.kr 전면 이전, 구 사이트 4/30 종료) 시간선택제·중증장애인 선발은 용량 예외.',
    },
    notice: {
      title: t('usage.gosi.notice.title'),
      bullets: [
        t('usage.gosi.notice.b1'),
        t('usage.gosi.notice.b2'),
        t('usage.gosi.notice.b3'),
        t('usage.gosi.notice.b4'),
      ],
    },
  },
  toeic: {
    label: t('usage.toeic.label'),
    widthMm: 30,
    heightMm: 40,
    dpi: 300,
    targetW: 115, // YBM 업로드 px
    targetH: 150,
    faceMin: 72,
    faceMax: 82, // 정수리~턱 3.2~3.6cm(큰 편) — 가이드 범위로 근사. TODO 확인
    maxKB: 500, // TODO: 500KB vs 6MB 출처 충돌 — 공식 확인 후 수정
    format: 'jpg',
    allowedFormats: ['jpg'],
    glasses: 'warn',
    recencyMonths: 6,
    restricted: false,
    group: 'exam',
    source: {
      url: 'https://www.toeic.co.kr',
      verified: false, // 🟡 YBM 내부 충돌 — px만 폰 확인 후 true
      checked: '2026-06',
      note: 'YBM 내부 충돌: 공식 FAQ(m.toeic.co.kr)=3×4cm·6MB 이하 vs 토익위원회(토익스토리)=115×150px·500KB 이하. 안전하게 ≤500KB로 설정(양쪽 충족, 6MB도 자동 통과). 흰배경, 머리 정수리~턱 3.2~3.6cm. px(115×150 저해상)만 폰 1회 확인 후 verified=true.',
    },
    notice: {
      title: t('usage.toeic.notice.title'),
      bullets: [
        t('usage.toeic.notice.b1'),
        t('usage.toeic.notice.b2'),
        t('usage.toeic.notice.b3'),
        t('usage.toeic.notice.b4'),
      ],
    },
  },
}

// 화면 표시 순서: 국내(여권·면허·일반) → 큐넷(시험·무료) → 해외(잠금) → 미검증 시험(숨김).
// 랜딩 칩·에디터 탭 공통 — 순서는 여기 한 곳만 바꾸면 됨.
const DISPLAY_ORDER: Usage[] = [
  'passport', 'license', 'general', 'qnet', 'us', 'schengen', 'kpc', 'gosi', 'toeic',
]
export const USAGES: { id: Usage; label: string }[] = DISPLAY_ORDER.map((id) => ({
  id,
  label: USAGE_SPECS[id].label,
}))

/** 제한 규격(여권·해외 등)은 AI 배경교체·잡티·강한 보정을 막는다. spec 데이터로 판정. */
export function isRegulated(usage: Usage): boolean {
  return USAGE_SPECS[usage].restricted
}

/** 프리미엄(해외 규격) 잠금 여부. 기존 entitlement로 해제. */
export function requiresPremium(usage: Usage): boolean {
  return !!USAGE_SPECS[usage].premium
}

/** 용도별 정부 공식 신청/안내 사이트 (없으면 신청 버튼 미표시). 정부 제휴 아님 — 참고용. */
export const APPLY_SITE: Record<Usage, { label: string; url: string } | null> = {
  passport: { label: t('usage.passport.applyLabel'), url: 'https://www.passport.go.kr' },
  license: { label: t('usage.license.applyLabel'), url: 'https://www.safedriving.or.kr' },
  general: null, // 일반/이력서는 정부 신청 대상 아님
  us: {
    label: t('usage.us.applyLabel'),
    url: 'https://travel.state.gov/content/travel/en/passports/how-apply/photos.html',
  },
  schengen: null, // 셰겐 비자는 목적지국 영사관/VFS에서 신청 — 단일 공식 사이트 없음
  qnet: { label: t('usage.qnet.applyLabel'), url: 'https://www.q-net.or.kr' },
  kpc: { label: t('usage.kpc.applyLabel'), url: 'https://license.kpc.or.kr' },
  gosi: { label: t('usage.gosi.applyLabel'), url: 'https://gongmuwon.gosi.kr' },
  toeic: { label: t('usage.toeic.applyLabel'), url: 'https://www.toeic.co.kr' },
}

/** 시험·자격증 그룹 여부 (랜딩 칩 제외·인화시트 숨김 등 UI 분기용) */
export function isExam(usage: Usage): boolean {
  return USAGE_SPECS[usage].group === 'exam'
}

/**
 * 사용자에게 노출 가능한 규격인지. 미검증(source.verified=false) 시험 프리셋은 숨긴다
 * (추측 규격을 사용자에게 노출하지 않음 — 공식 확인 후 verified=true로 켜면 자동 노출).
 * 시험·자격증(큐넷 등)은 한국 전용이라 비한국어 로케일(영어판)에선 숨긴다.
 */
export function isSelectable(usage: Usage): boolean {
  const spec = USAGE_SPECS[usage]
  if (spec.group === 'exam') return LANG === 'ko' && spec.source?.verified === true
  return true
}

/** 치수 표시 문자열. 영어 로케일 + inch 규격(미국)은 "2 × 2 in", 그 외 "51 × 51mm". */
export function sizeLabel(usage: Usage): string {
  const s = USAGE_SPECS[usage]
  if (LANG === 'en' && s.displayInch) {
    const inch = (mm: number) => String(Math.round((mm / 25.4) * 10) / 10)
    return `${inch(s.widthMm)} × ${inch(s.heightMm)} in`
  }
  return `${s.widthMm} × ${s.heightMm}mm`
}
