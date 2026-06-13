// 스토어 4번째 스크린샷 — 해외 규격(미국·셰겐) 강조. 720x1280, 브랜드 톤(노랑+잉크).
// 재실행: node scripts/make-store-overseas.mjs  → store_upload/screenshot-4.png
import sharp from 'sharp'

const W = 720, H = 1280
const ink = '#17161C', ink2 = '#5b5751', yellow = '#FFD12E', deep = '#F2BE00'
const cream = '#FCFBF7', line = '#ECE7DB', skin = '#E7B58E', hair = '#2A2320', navy = '#2E3A4F'

// 작은 지구본 아이콘 (해외 규격 표식)
const globe = (cx, cy, r, stroke, sw = 2) => `
  <g fill="none" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round">
    <circle cx="${cx}" cy="${cy}" r="${r}"/>
    <path d="M${cx - r} ${cy} h${2 * r}"/>
    <path d="M${cx} ${cy - r} c ${r * 0.9} ${r * 0.6} ${r * 0.9} ${r * 1.4} 0 ${2 * r} c ${-r * 0.9} ${-r * 0.6} ${-r * 0.9} ${-r * 1.4} 0 ${-2 * r} z"/>
  </g>`

// 작은 자물쇠 (프리미엄 표식)
const lock = (x, y, c) => `
  <g fill="${c}">
    <rect x="${x}" y="${y + 6}" width="16" height="12" rx="2.5"/>
    <path d="M${x + 3} ${y + 6} v-3 a5 5 0 0 1 10 0 v3" fill="none" stroke="${c}" stroke-width="2"/>
  </g>`

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <pattern id="dots" width="30" height="30" patternUnits="userSpaceOnUse">
      <circle cx="3" cy="3" r="2.4" fill="${ink}" opacity="0.06"/>
    </pattern>
    <linearGradient id="phoneShadow" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#000" stop-opacity="0.12"/>
      <stop offset="1" stop-color="#000" stop-opacity="0"/>
    </linearGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="${yellow}"/>
  <rect width="${W}" height="${H}" fill="url(#dots)"/>

  <!-- 배지 -->
  <g transform="translate(48,70)">
    <rect width="150" height="48" rx="24" fill="${ink}"/>
    ${globe(28, 24, 11, yellow, 2)}
    <text x="48" y="32" font-family="Malgun Gothic, sans-serif" font-size="22" font-weight="800" fill="#fff">해외 규격</text>
  </g>

  <!-- 헤드라인 -->
  <text x="48" y="210" font-family="Malgun Gothic, sans-serif" font-size="62" font-weight="800" fill="${ink}">미국·셰겐도</text>
  <text x="48" y="284" font-family="Malgun Gothic, sans-serif" font-size="62" font-weight="800" fill="${ink}">규격 딱 맞게.</text>
  <rect x="50" y="298" width="300" height="14" rx="7" fill="${ink}" opacity="0.16"/>

  <!-- 부제 -->
  <text x="50" y="356" font-family="Malgun Gothic, sans-serif" font-size="26" font-weight="700" fill="#6a6456">미국 비자·여권, 셰겐 사진까지 정확히.</text>

  <!-- 폰 목업 -->
  <g transform="translate(140,452)">
    <rect x="6" y="14" width="440" height="820" rx="42" fill="url(#phoneShadow)"/>
    <rect x="0" y="0" width="440" height="820" rx="40" fill="${cream}" stroke="${line}" stroke-width="2"/>

    <!-- 상태바 -->
    <text x="40" y="52" font-family="Malgun Gothic, sans-serif" font-size="20" font-weight="800" fill="${ink}">9:41</text>
    <rect x="372" y="38" width="30" height="15" rx="4" fill="${ink}"/>
    <rect x="404" y="40" width="3" height="11" rx="1.5" fill="${ink}"/>

    <!-- 헤더 -->
    <path d="M44 100 l-12 12 l12 12" fill="none" stroke="${ink}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="66" y="121" font-family="Malgun Gothic, sans-serif" font-size="24" font-weight="800" fill="${ink}">편집</text>

    <!-- 규격 탭 -->
    <rect x="34" y="150" width="372" height="44" rx="22" fill="#EFEAE0"/>
    <text x="74" y="178" text-anchor="middle" font-family="Malgun Gothic, sans-serif" font-size="18" font-weight="700" fill="#8b8678">여권</text>
    <text x="158" y="178" text-anchor="middle" font-family="Malgun Gothic, sans-serif" font-size="18" font-weight="700" fill="#8b8678">일반</text>
    <rect x="218" y="153" width="92" height="38" rx="19" fill="#fff"/>
    <text x="264" y="178" text-anchor="middle" font-family="Malgun Gothic, sans-serif" font-size="18" font-weight="800" fill="${ink}">미국</text>
    <text x="356" y="178" text-anchor="middle" font-family="Malgun Gothic, sans-serif" font-size="18" font-weight="700" fill="#8b8678">셰겐</text>

    <!-- 규격 카드 -->
    <rect x="34" y="212" width="372" height="92" rx="16" fill="#FFF7DF" stroke="#EAD58A" stroke-width="2"/>
    ${globe(58, 252, 13, ink, 2.2)}
    <text x="80" y="260" font-family="Malgun Gothic, sans-serif" font-size="26" font-weight="800" fill="${ink}">미국 2×2</text>
    <rect x="288" y="232" width="100" height="30" rx="15" fill="${ink}"/>
    ${lock(300, 236, '#fff')}
    <text x="322" y="252" font-family="Malgun Gothic, sans-serif" font-size="15" font-weight="700" fill="#fff">프리미엄</text>
    <text x="58" y="292" font-family="Malgun Gothic, sans-serif" font-size="16" font-weight="600" fill="${ink2}">51×51mm · 600×600px · 300DPI · 얼굴 50–69%</text>

    <!-- 정사각 크롭 + 가이드 -->
    <g transform="translate(95,330)">
      <rect x="0" y="0" width="250" height="250" rx="8" fill="#fff" stroke="${line}" stroke-width="2"/>
      <!-- 얼굴 -->
      <path d="M55 250 q70 -90 140 0 z" fill="${navy}"/>
      <ellipse cx="125" cy="150" rx="48" ry="60" fill="${skin}"/>
      <path d="M77 138 a48 60 0 0 1 96 0 q-10 -54 -48 -54 q-38 0 -48 54 z" fill="${hair}"/>
      <!-- 가이드 밴드 -->
      <line x1="0" y1="36" x2="250" y2="36" stroke="#fff" stroke-width="2" stroke-dasharray="5 5"/>
      <rect x="0" y="92" width="250" height="32" fill="#3FC2D6" opacity="0.18"/>
      <rect x="0" y="148" width="250" height="46" fill="${deep}" opacity="0.18"/>
      <text x="6" y="30" font-family="Malgun Gothic, sans-serif" font-size="13" font-weight="700" fill="#fff" stroke="${ink}" stroke-width="0.5">정수리</text>
      <rect x="6" y="98" width="58" height="20" rx="10" fill="#2bb6c8"/>
      <text x="14" y="113" font-family="Malgun Gothic, sans-serif" font-size="12" font-weight="700" fill="#fff">눈높이</text>
      <rect x="186" y="170" width="58" height="20" rx="10" fill="${deep}"/>
      <text x="196" y="185" font-family="Malgun Gothic, sans-serif" font-size="12" font-weight="700" fill="${ink}">턱선</text>
      <!-- 코너 마크 -->
      <g stroke="${ink}" stroke-width="3" fill="none" stroke-linecap="round">
        <path d="M2 18 V2 H18"/><path d="M232 2 H248 V18"/>
        <path d="M2 232 V248 H18"/><path d="M248 232 V248 H232"/>
      </g>
    </g>

    <text x="220" y="620" text-anchor="middle" font-family="Malgun Gothic, sans-serif" font-size="16" font-weight="600" fill="${ink2}">정사각 2×2 · 눈높이 가이드까지 자동</text>
  </g>
</svg>`

await sharp(Buffer.from(svg)).png().toFile('store_upload/screenshot-4.png')
console.log('screenshot-4.png 생성 완료 (720x1280)')
