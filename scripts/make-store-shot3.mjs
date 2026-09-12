// 스토어 스크린샷 3번 — 저장 결과(완성 화면). 720x1280, make-store-extra.mjs와 같은 스타일.
// 재실행: node scripts/make-store-shot3.mjs → store_upload/screenshot-3.png
//
// 왜 다시 만드나 (2026-09-12):
//   기존 3번에는 "여권 규격 413 × 531 px @ 300 DPI", "인화용 4컷"이 찍혀 있었다. 둘 다 낡았다.
//   · 1.2.1에서 여권 출력을 2배로 올렸다 → 826 × 1062 px @ 600 DPI (src/usage.ts)
//   · 인화 시트 DPI 환산 수정 후 여권은 2열×3행 = 6매 (src/imageUtils.ts sheetGrid)
//   스토어 화면이 실제 앱보다 낮은 화질을 광고하고 있던 셈이라 교체한다.
//
// 문구 원칙: 수치는 전부 코드 실제값과 일치시킨다. "보장/100% 통과/공인" 워딩 금지.
//   여권은 restricted:true 라 배경 교체·보정이 자동으로 꺼진다 → "흰색 배경 자동" 류의
//   문구를 여권 화면에 쓰면 앱 동작과 어긋난다. 넣지 않는다.
import sharp from 'sharp'
import { fileURLToPath } from 'node:url'

const W = 720, H = 1280
const ink = '#17161C', ink2 = '#5b5751', yellow = '#FFD12E'
const cream = '#FCFBF7', line = '#ECE7DB', skin = '#E7B58E', hair = '#2A2320', navy = '#2E3A4F'
const green = '#1F9D55', greenSoft = '#E6F6EC'
const FONT = 'Malgun Gothic, sans-serif'
const out = (name) => fileURLToPath(new URL(`../store_upload/${name}`, import.meta.url))

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;')

const check = (x, y, c) =>
  `<path d="M${x} ${y + 8} l6 6 l12 -13" fill="none" stroke="${c}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>`

const download = (cx, cy, s, c, sw = 2.2) => `
  <g fill="none" stroke="${c}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" transform="translate(${cx - s / 2},${cy - s / 2}) scale(${s / 24})">
    <path d="M12 3v12"/><path d="M7 11l5 5 5-5"/><path d="M4 20h16"/>
  </g>`

const header = (title) => `
    <path d="M44 100 l-12 12 l12 12" fill="none" stroke="${ink}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="66" y="121" font-family="${FONT}" font-size="24" font-weight="800" fill="${ink}">${esc(title)}</text>`

const portrait = (x, y, w, h) => `
    <g transform="translate(${x},${y})">
      <rect x="0" y="0" width="${w}" height="${h}" rx="8" fill="#fff" stroke="${line}" stroke-width="2"/>
      <path d="M${w * 0.22} ${h} q${w * 0.28} -${h * 0.36} ${w * 0.56} 0 z" fill="${navy}"/>
      <ellipse cx="${w / 2}" cy="${h * 0.56}" rx="${w * 0.19}" ry="${h * 0.22}" fill="${skin}"/>
      <path d="M${w / 2 - w * 0.19} ${h * 0.52} a${w * 0.19} ${h * 0.22} 0 0 1 ${w * 0.38} 0 q-${w * 0.04} -${h * 0.2} -${w * 0.19} -${h * 0.2} q-${w * 0.15} 0 -${w * 0.19} ${h * 0.2} z" fill="${hair}"/>
      <g stroke="${ink}" stroke-width="3" fill="none" stroke-linecap="round">
        <path d="M2 18 V2 H18"/><path d="M${w - 18} 2 H${w - 2} V18"/>
        <path d="M2 ${h - 18} V${h - 2} H18"/><path d="M${w - 2} ${h - 18} V${h - 2} H${w - 18}"/>
      </g>
    </g>`

// ── 완성 화면 ────────────────────────────────────────────────────────────────
const phoneDone = `
    ${header('완성')}

    ${portrait(125, 148, 190, 253)}

    <!-- 증명사진 / 인화 시트 전환 -->
    <rect x="34" y="428" width="372" height="66" rx="16" fill="#EFEAE0"/>
    <rect x="38" y="432" width="182" height="58" rx="13" fill="#fff"/>
    <text x="129" y="456" text-anchor="middle" font-family="${FONT}" font-size="17" font-weight="800" fill="${ink}">증명사진</text>
    <text x="129" y="479" text-anchor="middle" font-family="${FONT}" font-size="15" font-weight="700" fill="${ink2}">1매</text>
    <text x="313" y="456" text-anchor="middle" font-family="${FONT}" font-size="17" font-weight="700" fill="#8b8678">인화용</text>
    <text x="313" y="479" text-anchor="middle" font-family="${FONT}" font-size="15" font-weight="700" fill="#8b8678">6컷</text>

    <!-- 출력 규격 -->
    <rect x="34" y="512" width="372" height="88" rx="16" fill="#fff" stroke="${line}" stroke-width="2"/>
    <text x="56" y="548" font-family="${FONT}" font-size="19" font-weight="800" fill="${ink}">여권 규격</text>
    <text x="384" y="548" text-anchor="end" font-family="${FONT}" font-size="17" font-weight="700" fill="${ink2}">826 × 1062 px</text>
    <text x="56" y="578" font-family="${FONT}" font-size="15" font-weight="600" fill="${ink2}">35 × 45mm</text>
    <text x="384" y="578" text-anchor="end" font-family="${FONT}" font-size="15" font-weight="600" fill="${ink2}">600 DPI</text>

    <!-- 체크리스트 -->
    <rect x="34" y="618" width="372" height="168" rx="16" fill="#fff" stroke="${line}" stroke-width="2"/>
    ${[
      '규격·여백 자동 맞춤',
      '정수리·턱선 가이드 충족',
      '200 KB 이하 — 온라인 제출 규격',
    ]
      .map(
        (s, i) => `
    <g transform="translate(56,${644 + i * 48})">
      <rect width="30" height="30" rx="9" fill="${greenSoft}"/>
      ${check(5, 7, green)}
      <text x="44" y="21" font-family="${FONT}" font-size="16" font-weight="700" fill="${ink}">${esc(s)}</text>
    </g>`,
      )
      .join('')}`

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

  <g transform="translate(48,70)">
    <rect width="172" height="48" rx="24" fill="${ink}"/>
    ${download(28, 24, 22, yellow)}
    <text x="48" y="32" font-family="${FONT}" font-size="22" font-weight="800" fill="#fff">무료 5장</text>
  </g>

  <text x="48" y="210" font-family="${FONT}" font-size="62" font-weight="800" fill="${ink}">찍고, 바로</text>
  <text x="48" y="284" font-family="${FONT}" font-size="62" font-weight="800" fill="${ink}">다운로드.</text>
  <rect x="50" y="298" width="300" height="14" rx="7" fill="${ink}" opacity="0.16"/>
  <text x="50" y="356" font-family="${FONT}" font-size="26" font-weight="700" fill="#6a6456">규격·용량 맞춘 파일이 바로 갤러리에</text>

  <g transform="translate(140,452)">
    <rect x="6" y="14" width="440" height="820" rx="42" fill="url(#phoneShadow)"/>
    <rect x="0" y="0" width="440" height="820" rx="40" fill="${cream}" stroke="${line}" stroke-width="2"/>
    <text x="40" y="52" font-family="${FONT}" font-size="20" font-weight="800" fill="${ink}">9:41</text>
    <rect x="372" y="38" width="30" height="15" rx="4" fill="${ink}"/>
    <rect x="404" y="40" width="3" height="11" rx="1.5" fill="${ink}"/>
    ${phoneDone}
  </g>
</svg>`

await sharp(Buffer.from(svg)).png().toFile(out('screenshot-3.png'))
console.log(`screenshot-3.png 생성 완료 (${W}x${H})`)
