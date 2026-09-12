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
  /** 정수리선 상단 여백 %(크롭 가이드). 미지정=11. 머리 비율이 큰 규격(토익 80~90%)은 줄여야 턱선 밴드가 프레임 안에 들어온다 */
  crownPct?: number
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
  /** 목표 용량 인코딩 시 선호 품질 하한(용량 상한과 충돌하면 용량 상한이 우선). */
  minQuality?: number
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
    dpi: 600, // 300→600: 저화질 반려 대응 — 같은 35×45mm를 2배 해상도로(200KB 여유 안에서 더 선명)
    targetW: 826, // 35mm @600dpi (413→826, 2배)
    targetH: 1062, // 45mm @600dpi (531→1062, 2배)
    minW: 413, // 저해상 경고 기준 = 외교부 최소(413×531). 목표(826)로 재면 정상 사진도 오경고 → 최소로 비교
    minH: 531,
    faceMin: 70,
    faceMax: 80,
    maxKB: 200, // 외교부 온라인 제출 상한 (하드 상한 — 이 안에서 최고 품질로 인코딩)
    minQuality: 0.75, // 선호 품질 하한 (413×531 q0.75가 200KB 초과 시엔 용량 상한이 이김)
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
  // 4종 모두 공식 페이지 라이브 확인값(MAINTENANCE.md 2026-09-02). 접수 시즌 직전 재점검 — 각 source.url 참고.
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
    targetW: 225, // 공식 범위(가로 115~235·세로 150~315) 안의 3:4 — 큐넷(300×400)과 다름
    targetH: 300,
    minW: 115,
    minH: 150,
    faceMin: 62,
    faceMax: 78,
    maxKB: 500,
    format: 'jpg',
    allowedFormats: ['jpg', 'png'], // 공식: PNG 권장, JPG·GIF 가능
    glasses: 'warn',
    recencyMonths: 6,
    restricted: false,
    group: 'exam',
    source: {
      url: 'https://license.kpc.or.kr/nasec/rceptexmncnfirm/orgrcept/selectAcceptPhotoRule.do',
      verified: true, // ✅ 공식 직접 확정 (2026-09-02 라이브 재확인, 2026-06-19 1차 확인과 동일)
      checked: '2026-09',
      note: '공식 확정(KPC 사진 등록 규정 페이지 + FAQ "사진 등록이 되지 않아요" 동일): 가로 115~235px·세로 150~315px, 500KB 이하, PNG 권장(JPG·GIF 가능), 300dpi 권장, 3×4cm, 최근 6개월 이내, 단색 배경(별도 배경 없음), 컬러·정면 상반신(어깨까지)·탈모·정수리~턱 전부 노출. 큐넷 준용 아님(자체 규격, 값 다름). 앱 출력 225×300(3:4, 범위 내)·JPG.',
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
    targetW: 137, // 국가공무원채용시스템 업로드 px (공식: 3.5×4.5cm = 137×177 pixel 기준)
    targetH: 177,
    faceMin: 70,
    faceMax: 80,
    maxKB: 340, // 공식 "350KB 미만" — 단위 해석(1000/1024) 어느 쪽이든 미만이 되도록 340KB로 인코딩
    format: 'jpg',
    allowedFormats: ['jpg', 'png'],
    glasses: 'warn',
    recencyMonths: 6,
    restricted: false,
    group: 'exam',
    source: {
      url: 'https://gongmuwon.gosi.kr/oprut/AppApAplfSbmsnAplfRcptGd.do',
      verified: true, // ✅ 공식 직접 확정 (2026-09-02 안내 페이지 원문 + 인사혁신처 공고 제2026-1호, 2026-06-19 1차 확인과 동일)
      checked: '2026-09',
      note: '공식 확정(국가공무원채용시스템 > 원서접수 > 응시원서 제출 안내): "사진파일(JPG, PNG) 규격 ① 3.5cm×4.5cm(137×177 pixel) 기준 ② 파일용량 350KB 미만(중증장애인 선발시험 제외)". 옛 100KB는 구 사이버국가고시센터(gosi.kr, 2026-04-30 종료) 값 → 폐기. 6개월 이내·단색 배경·이마/귀 노출은 정부민원안내(110.go.kr) 기준 "권장"(본인 식별 명확하면 허용) — 필수 아님. 안경 규정 없음.',
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
    targetW: 300, // 공식 px 규정 없음 — 업로드 시스템이 3:4 재단 후 최대 300×400으로 저장 → 그 크기로 출력
    targetH: 400,
    faceMin: 80, // 공식: 정수리~턱 3.2~3.6cm / 4cm = 80~90%
    faceMax: 90,
    crownPct: 5, // 머리가 커서 기본 정수리 여백(11%)이면 턱선 밴드가 프레임 밖 → 상단 여백 5%
    maxKB: 500, // 공식 상한 6MB — 500KB는 그 안의 안전값(표기는 notice에서 6MB로)
    format: 'jpg',
    allowedFormats: ['jpg'],
    glasses: 'warn',
    recencyMonths: 6,
    restricted: false,
    group: 'exam',
    source: {
      url: 'https://m.toeic.co.kr/customer/csFaq.php',
      verified: true, // ✅ 공식 직접 확정 (FAQ 라이브 2026-09-02 + 사진등록 팝업 JS 2024-06 캡처, 2026-06-19 1차 확인과 동일)
      checked: '2026-09',
      note: '공식 확정(m.toeic.co.kr / m.toeicswt.co.kr FAQ, TOEIC·Speaking 동일): JPG만, 6MB 이하, 3×4cm, 최근 6개월 이내, 흰 배경, 정수리~턱 3.2~3.6cm(80~90%), 천연색·정면·탈모·두 귀 노출·어깨까지. 공식 px 규정 없음 — 업로드 팝업이 3:4 크로퍼로 재단 후 최대 300×400 저장(photoUpload.php JS). 500KB·115×150px는 토익스토리 2016~18 옛값(폐기). 잔여 리스크: 로그인 필요한 업로드 화면은 2024-06 캡처 기준 — 접수 시즌에 1회 육안 확인 권장.',
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

// 화면 표시 순서: 국내(여권·면허·일반) → 시험·자격증(큐넷·KPC·공무원·토익, 무료) → 해외(잠금). 미검증 시험은 isSelectable이 숨김.
// 랜딩 칩·에디터 탭 공통 — 순서는 여기 한 곳만 바꾸면 됨.
const DISPLAY_ORDER: Usage[] = [
  'passport', 'license', 'general', 'qnet', 'kpc', 'gosi', 'toeic', 'us', 'schengen',
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
