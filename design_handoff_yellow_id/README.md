# Handoff: Yei ID — 증명사진 앱 (모바일 웹/앱)

## Overview
**Yei ID**는 한국 증명사진(여권·운전면허·일반증명)을 사진관 없이 폰에서 직접 만드는 모바일
앱입니다. 사용자는 사진을 올려 규격에 맞게 크롭하고, 가벼운 보정을 한 뒤 다운로드합니다.
핵심 가치는 **개인정보 보호(사진이 기기 밖으로 전송되지 않음)** 와 **규격 정확성**, 그리고
**무료 5장 → 추가는 광고 시청 또는 광고 제거 결제(₩4,900 평생)** 의 수익 흐름입니다.

브랜드는 옐로카드 가사에서 따온 **Yei ID** — 노랑(에너지) + 잉크 블랙(정확함)의 젊고
경쾌한 아이덴티티입니다.

---

## About the Design Files
이 번들의 파일은 **HTML로 만든 디자인 레퍼런스(프로토타입)** 입니다. 의도된 외형과 동작을
보여주기 위한 것이지, 그대로 가져다 쓰는 프로덕션 코드가 아닙니다.

작업의 목표는 이 HTML 디자인을 **대상 코드베이스의 기존 환경(React Native, Flutter, 웹 React/Vue,
네이티브 등)에서 그 환경의 패턴·라이브러리로 다시 구현**하는 것입니다. 아직 환경이 없다면
프로젝트에 가장 적합한 프레임워크를 골라 구현하세요. (프로토타입은 React 18 + 인라인 JSX +
순수 CSS로 작성되어 있습니다 — 구조 참고용입니다.)

> 실제 기능(얼굴 인식, 배경 분리, 이미지 크롭/리사이즈, 결제, 광고 SDK)은 프로토타입에
> 들어있지 않습니다. UI/플로우/디자인 토큰을 정확히 재현하고, 기능은 대상 플랫폼의 라이브러리로
> 연결하세요.

---

## Fidelity
**High-fidelity (hifi).** 최종 색상·타이포·간격·인터랙션이 확정된 픽셀 단위 목업입니다.
색상 hex, 폰트, radius, shadow, 간격을 그대로 재현하세요. 인물 사진만 **일러스트
플레이스홀더**이며, 실제 사용자 사진/카메라 입력으로 대체되어야 합니다.

---

## Brand / Design Tokens

### Colors
| Token | Hex | 용도 |
|---|---|---|
| Signature Yellow | `#FFD12E` | 브랜드, 주요 CTA 채움, 하이라이트 |
| Yellow Bright | `#FFDA4D` | 옐로 그라데이션 상단 |
| Yellow Deep | `#F2BE00` | 버튼 pressed, 강조 텍스트(밝은 배경) |
| Yellow 700 | `#97770A` | 밝은 배경 위 ‘옐로톤’ 가독 텍스트 |
| Yellow Pale (primary-50) | `#FFF6D6` | 선택 칩 배경, 아이콘 타일 배경, 토널 버튼 |
| Ink | `#17161C` | 본문, 다크 버튼, 아이콘, 선택 상태 |
| Ink-2 | `#46454F` | 보조 텍스트 |
| Ink-3 | `#807F8B` | 3차 텍스트/placeholder |
| Ink-4 | `#A8A7B1` | 가장 옅은 텍스트 |
| Line | `#ECE9E1` | hairline 보더(따뜻한 톤) |
| Line-2 | `#DEDACF` | 진한 보더 |
| Cream Canvas (bg) | `#F8F6EF` | 앱 배경 |
| BG-2 | `#F0EDE3` | 세그먼트 트랙, 비활성 배경 |
| Surface | `#FFFFFF` | 카드, 시트 |
| Secure Green (success/teal) | `#15A66E` | ‘기기 내 처리’ 배지, 완료 체크 |
| Green 50 | `#E7F6EE` | 그린 배지 배경 |
| Green 600 | `#0E7E52` | 그린 텍스트 |
| Caution Coral (warn) | `#E8533A` | 여권 규정 경고 |
| Warn-50 | `#FDECE8` | 경고 배너 배경 |
| Warn-100 | `#F8CBC0` | 경고 배너 보더 |
| Warn-700 | `#B23A22` | 경고 텍스트 |
| Danger | `#DB3434` | 위험/삭제 |

> 핵심 원칙: **노랑은 채움/CTA 한 곳에 크게**, **텍스트·아이콘은 잉크로**. 노랑 위 흰색
> 텍스트는 금지(가독성). 노랑을 ‘경고’ 색으로 쓰지 말 것(경고는 코랄).

### Typography
- **Latin / 숫자 / 워드마크**: `Hanken Grotesk` (700, 800, 900) — Google Fonts.
- **Korean / UI 전반**: `Spoqa Han Sans Neo` (400, 500, 700) — `https://spoqa.github.io/spoqa-han-sans/css/SpoqaHanSansNeo.css`.
- Fallback stack: `-apple-system, 'Apple SD Gothic Neo', 'Malgun Gothic', system-ui, sans-serif`.
- 전역: `letter-spacing: -0.01em`, `word-break: keep-all` (한글 단어 중간 줄바꿈 방지).

| 스타일 | size / weight / line-height / tracking |
|---|---|
| Display | 30px / 700 / 1.22 / -0.03em |
| Title | 22px / 700 / 1.3 / -0.02em |
| H2 | 18px / 700 / 1.35 / -0.02em |
| Body | 15px / 400 / 1.55 |
| Body-medium | 15px / 500 / 1.5 |
| Small | 13px / 400~500 / 1.45 |
| Caption | 11.5px / 500 / 1.4 / +0.01em |
| 숫자 | tabular-nums (가격·px·mm) |

### Radius
`xs 8 · sm 12 · md 16 · lg 22 · xl 28 · pill 999` (px)

### Shadows
- sm: `0 1px 2px rgba(23,22,28,.05), 0 1px 3px rgba(23,22,28,.04)`
- md: `0 2px 6px rgba(23,22,28,.06), 0 8px 20px rgba(23,22,28,.07)`
- lg: `0 8px 24px rgba(23,22,28,.10), 0 18px 48px rgba(23,22,28,.12)`
- primary(yellow glow): `0 8px 20px rgba(255,209,46,.55)`

### Spacing
4의 배수 기반(4/8/12/16/20/24). 화면 좌우 패딩 20px, 카드 내부 14~16px.

### Logo
‘웃는 얼굴을 품은 노란 카드’. 라운드 사각 타일(yellow, radius ≈ 30%, **-4~-5° 회전**) + 잉크
페이스(두 눈 점 + 큰 미소 아크). 작은 사이즈에서도 표정 유지. 다크 배경에서는 잉크 타일 +
옐로 페이스로 반전.

---

## Screens / Views
좌우 폭 기준 모바일(디자인 기준 402px 폭의 iPhone). 모든 화면 상단 ~54px(상태바), 하단
~40px(홈 인디케이터) 세이프 영역.

### 1. Landing (`screen='landing'`)
- **목적**: 가치 제안 + 프라이버시 강조 + 시작 CTA.
- **레이아웃(세로 스크롤)**: 상단 옐로→크림 그라데이션 `linear-gradient(180deg,#FFE98A 0%,#FBF2D0 26%,#F8F6EF 52%,#F8F6EF)`.
  - 브랜드 행: 로고 + 워드마크 `Yellow`+`ID`(ID는 `#F2BE00`), 우측 설정 아이콘 버튼(38×38, 반투명 흰색).
  - 그린 배지 `100% 기기 내 처리`(IconShield).
  - Display 헤드라인 3줄, ‘증명사진’에 **노란 형광펜 하이라이트** `linear-gradient(transparent 56%, #FFD12E 56%)`.
  - 본문 카피(Body, ink-2).
  - **샘플 카드**: 흰 카드(radius 24, shadow-lg) 안에 35:45 비율 인물 프리뷰 + 네 모서리 크롭 마크(잉크 2px) + 하단 `여권 규격` 배지 + `35×45mm`.
  - 용도 퀵칩 3개(여권/운전면허/일반증명): 카드, 아이콘 타일(pale yellow 배경 + 잉크 아이콘).
  - CTA: `btn-primary btn-lg`(노랑 채움 + 잉크 텍스트, 800) `사진 올리기`(IconUpload). 하단 캡션 `무료로 5장 다운로드 · 가입 없이 바로 시작`.

### 2. Upload (`screen='upload'`)
- **목적**: 파일/카메라 선택, 친절한 빈 상태.
- 헤더(뒤로 + 제목 ‘사진 올리기’).
- **프라이버시 바**(PrivacyBar): 그린 pill, IconLock + `사진은 기기 밖으로 전송되지 않고 브라우저에서만 처리됩니다`.
- **드롭존**: 2px 대시 보더(hover 시 `#FFD12E` + pale 배경), 큰 IconImage 타일, `사진을 여기로 끌어다 놓기` / `JPG · PNG · HEIC · 최대 20MB`. 클릭 시 editor로.
- 소스 버튼 2개: `갤러리`(outline), `카메라`(dark).
- 팁 카드: 조명/단색 배경/정면 — 아이콘 + 텍스트 3행.

### 3. Editor (`screen='editor'`) — 핵심
- **목적**: 용도 선택, 규정 안내, 크롭/보정/배경/뽀샤시.
- 헤더(뒤로 + ‘편집’ + 우측 `초기화` ghost 버튼, IconRefresh).
- **용도 탭(세그먼트 컨트롤)**: 여권 / 운전면허 / 일반증명. 선택 시 흰 배경 + 잉크 텍스트 + shadow-sm. 용도 변경 시 배경색을 해당 용도 허용값으로 스냅, 여권 선택 시 뽀샤시(smooth)=0으로 리셋.
- **규정 배너**:
  - 여권(strict): 코랄 배너 `여권 사진은 보정·필터가 제한됩니다 / 미백·뽀샤시·배경 합성은 거부 사유가 될 수 있어요. 밝기 조정만 가볍게 권장.`(IconAlert)
  - 그 외: 그린 인라인 `기기 안에서만 처리 중`(IconLock).
- **프리뷰**: 폭 196, 35:45 비율, radius 16, shadow-md. 인물 + (옵션) 규격 가이드 오버레이.
  - 가이드(`guides` on): 점선 얼굴 타원 + 정수리/턱선 수평 점선(라벨 = 노란 pill + 잉크 텍스트) + 중앙 수직 축. 색 `rgba(23,22,28,.78)`.
- **가이드 토글 칩** `규격 가이드`(IconGrid) — on이면 pale/잉크.
- **스펙 카드(SpecCard)**: 아이콘 타일(IconRuler) + `{사이즈mm} · 얼굴 {min}~{max}%` + `{px} @ {dpi}` + 그린 `규격 충족` 배지.
- **툴 칩 행(가로 스크롤)**: 크롭/보정/배경/뽀샤시. 선택 시 잉크 채움 + 흰 텍스트. 여권일 때 ‘뽀샤시’는 잠금(IconLock, opacity 0.5).
  - **크롭**: 확대 슬라이더(zoom 0~60% → scale 1.0~1.6), 상하 위치(offsetY -30~30), `얼굴 인식 자동 정렬`(tonal) → zoom 1.06/offsetY -4.
  - **보정**: 밝기(brightness ±30%), 노출(exposure ±50), 화이트밸런스(warmth ±50). 여권이면 코랄 주의 문구.
  - **배경**: 용도별 허용 배경 스와치(여권: 흰/연회색, 면허: +하늘색, 일반: +핑크/민트 등). 선택 시 잉크 보더 + 체크 배지.
  - **뽀샤시**: 피부 보정(smooth 0~100%). 여권은 잠금 화면(설명).
- **하단 CTA**(고정): `완료 · 미리보기`(btn-primary, IconChevR) → result.

### 4. Result / Download (`screen='result'`) — 전환 지점
- **목적**: 최종 미리보기 + 무료 다운로드 + 업셀.
- 헤더(뒤로 + ‘완성’ + premium이면 `광고 제거됨` 배지).
- **프리뷰**: `증명사진 1매`(168폭 35:45) 또는 `인화용 4컷`(2×2 그리드) — 세그먼트로 전환.
- **체크리스트 카드**: `{용도} 규격` + `{px} @ {dpi}`, 그린 체크 3행(`규격·여백 자동 보정`, `{배경색} 배경 적용`, `얼굴 비율 가이드 충족`).
- **하단 액션(billing 상태에 따라)**:
  - 무료 가능(used < 5 또는 premium 또는 credits>0): `btn-primary`
    - premium: `다운로드`
    - 무료 남음: `무료로 다운로드 (N회 남음)` + 캡션 `무료 5장 제공 · 추가는 광고 시청 또는 광고 제거로`
    - credits 보유: `다운로드 (보유 N회)`
  - 무료 소진: **Upsell** — 그린 체크 + `무료 5장을 모두 받았어요. 더 받으시겠어요?` 아래 2버튼:
    - `광고 보고 1장`(outline, IconPlay) `약 15초 · 무료` → AdModal
    - `광고 없이 무제한`(잉크 채움, `추천` 노란 배지, IconSparkle) `₩4,900 · 평생` → paywall
- **DownloadToast**: 잉크 토스트 + 민트 체크 `저장 완료 / 갤러리에 증명사진이 저장됐어요`(2.6s).
- **AdModal**(바텀시트): 15초 카운트다운 가짜 광고 + 진행바, 완료 후 `1장 받기` → credits +1 후 자동 다운로드.

### 5. Paywall (`screen='paywall'`)
- 옐로→크림 그라데이션. 우측 상단 X(→result).
- 노란 아이콘 타일(IconSparkle, -4° 회전) + `광고 없이, 무제한으로.` + 설명.
- 혜택 카드 4행: 광고 완전 제거 / 무제한 다운로드 / 모든 규격·인화용 4컷 / 기기 내 처리 유지. 각 행 pale 아이콘 타일 + 그린 체크.
- 하단: `₩4,900` + `커피 한 잔 값, 평생 이용` → `btn-primary` `광고 없이 평생 이용` → premium=true 후 result. 아래 `나중에` / `구매 복원` ghost.

### 6. Settings / About (`screen='settings'`)
- 헤더 ‘설정 · 소개’.
- 그린 프라이버시 히어로: `사진은 기기를 떠나지 않아요 / 모든 편집은 브라우저 안에서만…`.
- 플랜 카드: 무료/PRO 상태 + `업그레이드`(tonal) 또는 `PRO` 배지.
- 약관 리스트: 개인정보처리방침 / 이용약관 / 자주 묻는 질문(행 + chevron).
- **고지(코랄 배너)**: `본 앱은 … 정부·공공기관의 공인 서비스가 아니며 심사 합격을 보장하지 않습니다. 최종 규정은 발급 기관 안내를 확인하세요.`
- 푸터 `Yei ID · 버전 1.0.0`.

---

## Interactions & Behavior
- 화면 전환은 단일 `screen` 상태로 스위칭. 헤더 뒤로 = 이전 화면.
- 엔트런스 애니메이션: `fadeUp`(0.42s) / `pop`(0.34s).
- 슬라이더: 즉시 프리뷰 반영. 프리뷰 filter = `brightness(brightness × (1 + exposure/220)) saturate(...)`, warmth는 soft-light 오버레이(따뜻=주황, 차가움=파랑), smooth는 screen 글로우.
- 세그먼트/탭/토글/스와치: 즉시 상태 반영, 0.15~0.2s 트랜지션.
- 버튼 active: `scale(0.975)`.
- AdModal: 1초 간격 카운트다운, 0이 되면 버튼 활성.
- 규격 가이드 토글로 오버레이 on/off.

## State Management
- `screen`: 'landing'|'upload'|'editor'|'result'|'paywall'|'settings'
- `photo`: `{ doc:'passport'|'license'|'general', bg, zoom(1~1.6), brightness(0.7~1.3), exposure(-50~50), warmth(-50~50), smooth(0~100), offsetY(-30~30), guides(bool) }`
- `billing`: `{ premium:bool, used:number(무료 사용 수), credits:number(광고로 적립), adsWatched:number }`
  - 무료 한도 `FREE = 5`. `freeLeft = max(0, 5 - used)`.
  - 다운로드 우선순위: premium → 무료(used<5) → credits.
- 실제 구현 시 추가 필요: 원본 이미지 비트맵, 크롭 영역, 출력 px 렌더링, 얼굴 검출 결과, 결제/광고 SDK 상태, (선택)다운로드 이력.

## 규격 데이터 (SPECS — 반드시 유지)
- **여권**: 35×45mm, 413×531px @300DPI, 얼굴 70~80%, 배경 흰색·균일, **strict(보정/배경합성/필터 금지)**.
- **운전면허**: 35×45mm, 413×531px @300DPI, 얼굴 65~80%, 배경 흰/하늘/옅은회색, 가벼운 보정 허용.
- **일반증명**: 30×40mm, 354×472px @300DPI, 얼굴 60~75%, 배경 자유.
- 각 용도 안내 문구는 `app/components.jsx`의 `SPECS.notes` 참고.

## 꼭 유지할 카피/요소
- 상단 프라이버시 한 줄(업로드/설정).
- 여권 모드 규정 경고 배너(무보정·무필터 원칙).
- 용도 탭, 규격/출력 표시(예: 413×531px @300DPI).
- ‘공인 아님 · 합격 보장 아님’ 고지(설정).

---

## Assets
- **인물 사진**: `app/components.jsx`의 `Portrait` 컴포넌트가 SVG로 그린 **일러스트 플레이스홀더**.
  실제 앱에서는 사용자 업로드/카메라 이미지로 교체. (얼굴 검출 → 크롭/정렬, 배경 분리 →
  배경색 합성, 보정 필터 적용이 실제 기능으로 들어가야 함.)
- **아이콘**: `app/icons.jsx`의 인라인 SVG 라인 아이콘 세트(1.7px stroke, currentColor). 대상
  코드베이스의 아이콘 라이브러리로 매핑 가능.
- **로고/페이스**: SVG 패스(README ‘Logo’ 참고). `store_assets/play-icon-512.png`가 마스터 아이콘.
- **폰트**: Hanken Grotesk(Google), Spoqa Han Sans Neo(CDN).
- **Play Store 자료**(`store_assets/`):
  - `play-icon-512.png` (512×512, 앱 아이콘)
  - `feature-1024x500.png` (1024×500, 피처 그래픽)
  - `screenshot-1.png` / `-2.png` / `-3.png` (720×1280, 9:16 마케팅 스크린샷)

## Files (design_files/)
- `증명사진 메이커.html` — 앱 진입점(스크립트 로드 순서 포함). 하단 ‘화면 점프’ 바는 프로토타입 전용(프로덕션 제외).
- `styles/ds.css` — **디자인 시스템 토큰 + 컴포넌트 CSS(소스 오브 트루스)**.
- `app/icons.jsx` — 라인 아이콘.
- `app/components.jsx` — `SPECS`(규격 데이터), `Portrait`(인물/가이드), `PrivacyBar`, `Slider`, `Toggle`.
- `app/screens-intro.jsx` — Landing, Upload, Logo, SampleCard, ScreenHeader.
- `app/screens-editor.jsx` — Editor + ToolPanel + SpecCard.
- `app/screens-result.jsx` — Result, Upsell, AdModal, Paywall, Sheet, DownloadToast.
- `app/screens-misc.jsx` — Settings.
- `app/app.jsx` — 앱 셸: state(screen/photo/billing) + 화면 라우팅.
- `frames/ios-frame.jsx` — 프리뷰용 iPhone 베젤(프로토타입 전용; 프로덕션 제외).
- `Yei ID — CI.html` — 브랜드/CI 보드(로고·컬러·타이포·톤).

---

## 구현 순서 제안
1. `ds.css` 토큰을 대상 스택의 테마/디자인 토큰으로 이식.
2. 공통 컴포넌트(Button/Card/Badge/Segmented/Slider/Toggle/PrivacyBar) 구현.
3. 6개 화면을 라우팅과 함께 구성, 더미 상태로 플로우 연결.
4. 실제 기능 연결: 이미지 입력 → 얼굴 검출/크롭/정렬 → 배경 분리/색 합성 → 보정 필터 →
   규격 px 출력/다운로드.
5. 결제(인앱) + 보상형 광고 SDK 연결, 무료 5장/credits/premium 로직 반영.
6. 접근성: 대비(노랑 위 잉크), 터치 타겟 ≥44px, 한글 `word-break: keep-all`.
