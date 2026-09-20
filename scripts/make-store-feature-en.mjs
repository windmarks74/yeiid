// 영어 피처 그래픽 (1024×500) — store_upload/en/feature-1024x500.png
// 재실행: node scripts/make-store-feature-en.mjs
//
// 왜 필요한가: Play 는 현지화된 그래픽이 없으면 기본 언어(한국어)의 것을 그대로 쓴다.
//   그래서 en-US 등록정보에 한글 피처 그래픽("집에서 1분, 규격 딱 맞는 증명사진")이
//   영어 사용자에게 노출되고 있었다.
//
// ⚠️ 한국어판(store_upload/feature-1024x500.png)의 번역이 아니다.
//   · 영어판 앱에는 시험 규격이 없고 운전면허는 중립 라벨이라 "여권·운전면허·일반증명"을
//     그대로 옮기면 안 된다 → 미국 여권·비자·셰겐으로 바꿨다.
//   · 한국어판의 "100% 기기 내 처리" 문구도 쓰지 않는다. 영어에서 "100%"는 보장 뉘앙스로
//     읽힐 수 있고, STORE_LISTING.md 의 금지 워딩 규칙과 부딪힌다 → "Never uploaded".
//   · 카드 라벨은 미국 규격이므로 inch 표기(2 × 2 in).
//
// 한국어판 생성기는 없다(수작업 자산). 그쪽을 고칠 일이 생기면 이 파일을 복사해 쓰면 된다.
import sharp from 'sharp'
import { mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const W = 1024, H = 500
const ink = '#17161C', yellow = '#FFD12E', cream = '#FFF6DC', card = '#FFFCF2'
const green = '#1F9D55'
const FONT = 'Segoe UI, Arial, Helvetica, sans-serif'

const dir = fileURLToPath(new URL('../store_upload/en/', import.meta.url))
mkdirSync(dir, { recursive: true })

const smile = (cx, cy, s, c) => `
  <g transform="translate(${cx - s / 2},${cy - s / 2}) scale(${s / 24})">
    <circle cx="8.5" cy="9" r="1.9" fill="${c}"/>
    <circle cx="15.5" cy="9" r="1.9" fill="${c}"/>
    <path d="M7 14 q5 5 10 0" fill="none" stroke="${c}" stroke-width="2.4" stroke-linecap="round"/>
  </g>`

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <pattern id="dots" width="34" height="34" patternUnits="userSpaceOnUse">
      <circle cx="4" cy="4" r="2.6" fill="${ink}" opacity="0.07"/>
    </pattern>
    <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="10" stdDeviation="14" flood-color="#000" flood-opacity="0.13"/>
    </filter>
  </defs>

  <rect width="${W}" height="${H}" fill="${yellow}"/>
  <rect width="${W}" height="${H}" fill="url(#dots)"/>

  <!-- 브랜드 -->
  <g transform="translate(64,86)">
    <rect width="72" height="72" rx="22" fill="${ink}"/>
    ${smile(36, 36, 44, yellow)}
    <text x="92" y="52" font-family="${FONT}" font-size="46" font-weight="800" fill="${ink}">Yei ID</text>
  </g>

  <!-- 헤드라인 -->
  <text x="64" y="253" font-family="${FONT}" font-size="46" font-weight="800" fill="${ink}">ID photos at home,</text>
  <text x="64" y="309" font-family="${FONT}" font-size="46" font-weight="800" fill="${ink}">exact to spec.</text>

  <rect x="60" y="333" width="268" height="56" rx="14" fill="${ink}"/>
  <text x="80" y="372" font-family="${FONT}" font-size="36" font-weight="800" fill="${yellow}">2 × 2 in, right.</text>

  <text x="64" y="432" font-family="${FONT}" font-size="21" font-weight="700" fill="#5a5238">U.S. passport · DS-160 visa · Schengen · Never uploaded</text>

  <!-- 사진 카드 -->
  <g transform="translate(672,44)" filter="url(#soft)">
    <rect x="0" y="0" width="286" height="412" rx="26" fill="${card}" transform="rotate(4 143 206)"/>
    <g transform="rotate(4 143 206)">
      <rect x="26" y="30" width="234" height="252" rx="12" fill="${cream}"/>
      ${smile(143, 156, 104, ink)}
      <rect x="40" y="318" width="188" height="48" rx="12" fill="${cream}"/>
      <text x="134" y="350" text-anchor="middle" font-family="${FONT}" font-size="25" font-weight="800" fill="${ink}">2 × 2 in</text>
    </g>
  </g>

  <!-- 배지 -->
  <g transform="translate(800,414)">
    <rect width="194" height="52" rx="26" fill="${green}"/>
    <path d="M22 26 l9 9 l17 -18" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="122" y="34" text-anchor="middle" font-family="${FONT}" font-size="22" font-weight="800" fill="#fff">Spec ready</text>
  </g>
</svg>`

await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(dir + 'feature-1024x500.png')
console.log('en/feature-1024x500.png 생성 (1024x500)')
