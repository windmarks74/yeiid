// 영어 스토어 스크린샷 6장 — store_upload/en/screenshot-1..6.png (720x1280)
// 재실행: node scripts/make-store-en.mjs
//
// ⚠️ 한글 세트를 그대로 번역하면 안 된다. 영어 로케일에서는 앱이 다르게 보인다:
//   · 시험 규격(큐넷·공무원·토익·KPC)은 isSelectable() 이 숨긴다(usage.ts) → 큐넷 화면은 쓸 수 없다.
//     한글 6번(큐넷)을 번역해 올리면 영어 사용자가 못 쓰는 기능을 광고하게 된다.
//   · 미국 규격은 displayInch 로 "2 × 2 in" 로 표기된다.
//   · 그래서 영어판의 주인공은 미국 여권·비자다(docs/global-us-first-research.md: 미국 우선).
//
// 영어 사용자가 실제로 고를 수 있는 것: Passport / Driver's license / General /
//   U.S. passport / U.S. visa / Schengen.
//
// ⚠️ 수치 동기화 — src/usage.ts 와 일치시킬 것. check-spec-sync 는 PNG 안의 글자를
//    읽지 못하므로 자동 검사가 안 된다. 규격이 바뀌면 이 파일을 손으로 고치고 다시 생성한다.
import sharp from 'sharp'
import { mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const W = 720, H = 1280
const ink = '#17161C', ink2 = '#5b5751', yellow = '#FFD12E', deep = '#F2BE00'
const cream = '#FCFBF7', line = '#ECE7DB', skin = '#E7B58E', hair = '#2A2320', navy = '#2E3A4F'
const green = '#1F9D55', greenSoft = '#E6F6EC'
// 영어 화면이므로 한글 폰트 대신 일반 산세리프 스택
const FONT = 'Segoe UI, Arial, Helvetica, sans-serif'

const dir = fileURLToPath(new URL('../store_upload/en/', import.meta.url))
mkdirSync(dir, { recursive: true })
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')

// ── 공통 골격 ────────────────────────────────────────────────────────
function page({ badge, badgeIcon, head1, head2, sub, phone, headSize = 58 }) {
  return `
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
    <rect width="${badge.length * 11 + 70}" height="48" rx="24" fill="${ink}"/>
    ${badgeIcon}
    <text x="48" y="32" font-family="${FONT}" font-size="21" font-weight="700" fill="#fff">${esc(badge)}</text>
  </g>

  <text x="48" y="206" font-family="${FONT}" font-size="${headSize}" font-weight="800" fill="${ink}">${esc(head1)}</text>
  <text x="48" y="${206 + headSize + 14}" font-family="${FONT}" font-size="${headSize}" font-weight="800" fill="${ink}">${esc(head2)}</text>
  <rect x="50" y="${206 + headSize + 30}" width="290" height="13" rx="6.5" fill="${ink}" opacity="0.16"/>
  <text x="50" y="${206 + headSize + 82}" font-family="${FONT}" font-size="23" font-weight="600" fill="#6a6456">${esc(sub)}</text>

  <g transform="translate(140,452)">
    <rect x="6" y="14" width="440" height="820" rx="42" fill="url(#phoneShadow)"/>
    <rect x="0" y="0" width="440" height="820" rx="40" fill="${cream}" stroke="${line}" stroke-width="2"/>
    <text x="40" y="52" font-family="${FONT}" font-size="20" font-weight="700" fill="${ink}">9:41</text>
    <rect x="372" y="38" width="30" height="15" rx="4" fill="${ink}"/>
    <rect x="404" y="40" width="3" height="11" rx="1.5" fill="${ink}"/>
    ${phone}
  </g>
</svg>`
}

const ico = (d, cx, cy, s, c, sw = 2) => `
  <g fill="none" stroke="${c}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" transform="translate(${cx - s / 2},${cy - s / 2}) scale(${s / 24})">${d}</g>`
const globe = (cx, cy, s, c) => ico('<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a15 15 0 0 1 0 18a15 15 0 0 1 0-18"/>', cx, cy, s, c)
const shield = (cx, cy, s, c) => ico('<path d="M12 3l7 3v5c0 4.4-3 7.7-7 9-4-1.3-7-4.6-7-9V6z"/><path d="M9 12l2 2 4-4"/>', cx, cy, s, c)
const crop = (cx, cy, s, c) => ico('<path d="M6 2v16h16"/><path d="M2 6h16v16"/>', cx, cy, s, c)
const download = (cx, cy, s, c) => ico('<path d="M12 3v12"/><path d="M7 11l5 5 5-5"/><path d="M4 20h16"/>', cx, cy, s, c)
const infinity = (cx, cy, s, c) => ico('<path d="M7 15c-2.2 0-4-1.3-4-3s1.8-3 4-3c3 0 7 6 10 6 2.2 0 4-1.3 4-3s-1.8-3-4-3c-3 0-7 6-10 6z"/>', cx, cy, s, c)
const spark = (cx, cy, s, c) => ico('<path d="M12 3v18"/><path d="M3 12h18"/><path d="M6 6l12 12"/><path d="M18 6L6 18"/>', cx, cy, s, c)
const check = (x, y, c) => `<path d="M${x} ${y + 8} l6 6 l12 -13" fill="none" stroke="${c}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>`
const lock = (x, y, c) => `
  <g transform="translate(${x},${y})" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round">
    <rect x="3" y="7" width="12" height="9" rx="2" fill="${c}" stroke="none"/>
    <path d="M6 7V5a3 3 0 0 1 6 0v2"/>
  </g>`

const header = (title) => `
    <path d="M44 100 l-12 12 l12 12" fill="none" stroke="${ink}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="66" y="121" font-family="${FONT}" font-size="23" font-weight="700" fill="${ink}">${esc(title)}</text>`

// 머리카락은 "얼굴보다 조금 큰 위쪽 반타원"을 먼저 깔고 그 위에 얼굴을 덮어
// 테두리만 남기는 방식이다. 곡선을 손으로 이어 붙이면 정사각(2×2) 비율에서 모양이 깨진다.
const portrait = (x, y, w, h, square = false) => {
  const cx = w / 2
  const cy = h * (square ? 0.5 : 0.56)
  const rx = w * 0.19
  const ry = h * (square ? 0.25 : 0.22)
  const hx = rx * 1.16, hy = ry * 1.16
  return `
    <g transform="translate(${x},${y})">
      <rect x="0" y="0" width="${w}" height="${h}" rx="8" fill="#fff" stroke="${line}" stroke-width="2"/>
      <path d="M${w * 0.22} ${h} q${w * 0.28} -${h * 0.36} ${w * 0.56} 0 z" fill="${navy}"/>
      <path d="M${cx - hx} ${cy} a${hx} ${hy} 0 0 1 ${hx * 2} 0 z" fill="${hair}"/>
      <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${skin}"/>
      <g stroke="${ink}" stroke-width="3" fill="none" stroke-linecap="round">
        <path d="M2 18 V2 H18"/><path d="M${w - 18} 2 H${w - 2} V18"/>
        <path d="M2 ${h - 18} V${h - 2} H18"/><path d="M${w - 2} ${h - 18} V${h - 2} H${w - 18}"/>
      </g>
    </g>`
}

// ── 1. 인트로 ────────────────────────────────────────────────────────
const phoneIntro = `
    <rect x="34" y="150" width="372" height="44" rx="22" fill="${greenSoft}"/>
    ${check(52, 162, green)}
    <text x="86" y="178" font-family="${FONT}" font-size="16" font-weight="700" fill="${green}">Processed entirely on your phone</text>

    <text x="34" y="248" font-family="${FONT}" font-size="30" font-weight="800" fill="${ink}">ID photos at home,</text>
    <text x="34" y="288" font-family="${FONT}" font-size="30" font-weight="800" fill="${ink}">in about a minute.</text>
    <text x="34" y="326" font-family="${FONT}" font-size="16" font-weight="600" fill="${ink2}">Passport, visa and general ID photos —</text>
    <text x="34" y="350" font-family="${FONT}" font-size="16" font-weight="600" fill="${ink2}">no studio, no sign-up.</text>

    ${portrait(120, 380, 200, 266)}

    <rect x="34" y="678" width="372" height="56" rx="28" fill="${deep}"/>
    <text x="220" y="714" text-anchor="middle" font-family="${FONT}" font-size="19" font-weight="800" fill="${ink}">Choose a photo</text>`

// ── 2. 미국 규격 (영어판 주인공) ─────────────────────────────────────
const phoneUS = `
    ${header('Edit')}
    <rect x="34" y="150" width="372" height="44" rx="22" fill="#EFEAE0"/>
    <text x="80" y="178" text-anchor="middle" font-family="${FONT}" font-size="15" font-weight="600" fill="#8b8678">Passport</text>
    <rect x="128" y="153" width="118" height="38" rx="19" fill="#fff"/>
    <text x="187" y="178" text-anchor="middle" font-family="${FONT}" font-size="15" font-weight="800" fill="${ink}">U.S. passport</text>
    <text x="288" y="178" text-anchor="middle" font-family="${FONT}" font-size="15" font-weight="600" fill="#8b8678">U.S. visa</text>
    <text x="370" y="178" text-anchor="middle" font-family="${FONT}" font-size="15" font-weight="600" fill="#8b8678">Schengen</text>

    <rect x="34" y="212" width="372" height="92" rx="16" fill="#FFF7DF" stroke="#EAD58A" stroke-width="2"/>
    ${globe(58, 248, 26, ink)}
    <text x="80" y="256" font-family="${FONT}" font-size="24" font-weight="800" fill="${ink}">U.S. passport</text>
    <rect x="300" y="228" width="92" height="30" rx="15" fill="${ink}"/>
    ${lock(310, 235, '#fff')}
    <text x="354" y="248" text-anchor="middle" font-family="${FONT}" font-size="14" font-weight="700" fill="#fff">Premium</text>
    <text x="58" y="288" font-family="${FONT}" font-size="15" font-weight="600" fill="${ink2}">2 × 2 in · 1200 × 1200 px · head 50–69%</text>

    <g transform="translate(130,326)">
      ${portrait(0, 0, 180, 180, true)}
      <rect x="2" y="70" width="176" height="22" fill="#DCF0F4" opacity="0.5"/>
      <rect x="8" y="72" width="52" height="18" rx="9" fill="#BFE3EA"/>
      <text x="34" y="85" text-anchor="middle" font-family="${FONT}" font-size="11" font-weight="700" fill="#2b5d66">Eye line</text>
    </g>
    <text x="220" y="536" text-anchor="middle" font-family="${FONT}" font-size="15" font-weight="600" fill="${ink2}">Square 2 × 2 with automatic eye-line guide</text>

    <rect x="34" y="560" width="372" height="120" rx="16" fill="#fff" stroke="${line}" stroke-width="2"/>
    <text x="54" y="592" font-family="${FONT}" font-size="16" font-weight="800" fill="${ink}">U.S. visa (DS-160) differs</text>
    <text x="54" y="620" font-family="${FONT}" font-size="15" font-weight="600" fill="${ink2}">600 × 600 px · JPEG only · 240 KB or less</text>
    <rect x="54" y="636" width="332" height="30" rx="8" fill="${greenSoft}"/>
    <text x="220" y="656" text-anchor="middle" font-family="${FONT}" font-size="14" font-weight="700" fill="${green}">Both presets are matched automatically</text>`

// ── 3. 규격 가이드 ───────────────────────────────────────────────────
const phoneGuide = `
    ${header('Edit')}
    <rect x="34" y="150" width="372" height="44" rx="22" fill="#EFEAE0"/>
    <rect x="38" y="153" width="118" height="38" rx="19" fill="#fff"/>
    <text x="97" y="178" text-anchor="middle" font-family="${FONT}" font-size="16" font-weight="800" fill="${ink}">Passport</text>
    <text x="214" y="178" text-anchor="middle" font-family="${FONT}" font-size="15" font-weight="600" fill="#8b8678">Driver's licence</text>
    <text x="340" y="178" text-anchor="middle" font-family="${FONT}" font-size="15" font-weight="600" fill="#8b8678">General</text>

    <rect x="34" y="212" width="372" height="86" rx="16" fill="#FDEEEB" stroke="#F0CFC7" stroke-width="2"/>
    <text x="58" y="246" font-family="${FONT}" font-size="16" font-weight="800" fill="#B4442F">Editing is limited for passports</text>
    <text x="58" y="272" font-family="${FONT}" font-size="14" font-weight="600" fill="#B4442F">Background replacement and retouching are</text>
    <text x="58" y="290" font-family="${FONT}" font-size="14" font-weight="600" fill="#B4442F">turned off automatically to avoid rejection.</text>

    <g transform="translate(120,320)">
      ${portrait(0, 0, 200, 266)}
      ${/* 가이드선 y 는 portrait() 의 얼굴 좌표와 맞춰야 한다. 200×266 기준
            정수리 = cy - ry*1.16 = 266*0.56 - 266*0.22*1.16 ≈ 81, 턱 = cy + ry ≈ 207 */''}
      <rect x="4" y="71" width="192" height="20" fill="#FFF0B8" opacity="0.7"/>
      <rect x="120" y="67" width="72" height="20" rx="10" fill="${yellow}"/>
      <text x="156" y="81" text-anchor="middle" font-family="${FONT}" font-size="11" font-weight="700" fill="${ink}">Crown</text>
      <rect x="4" y="197" width="192" height="20" fill="#FFF0B8" opacity="0.7"/>
      <rect x="128" y="193" width="64" height="20" rx="10" fill="${yellow}"/>
      <text x="160" y="207" text-anchor="middle" font-family="${FONT}" font-size="11" font-weight="700" fill="${ink}">Chin</text>
    </g>

    <rect x="34" y="612" width="372" height="68" rx="16" fill="#fff" stroke="${line}" stroke-width="2"/>
    <text x="220" y="644" text-anchor="middle" font-family="${FONT}" font-size="16" font-weight="700" fill="${ink}">35 × 45 mm · head 70–80%</text>
    <text x="220" y="668" text-anchor="middle" font-family="${FONT}" font-size="14" font-weight="600" fill="${ink2}">Line up your face with the guides — that's it</text>`

// ── 4. 저장 결과 ─────────────────────────────────────────────────────
const phoneDone = `
    ${header('Done')}
    ${portrait(125, 148, 190, 253)}

    <rect x="34" y="428" width="372" height="66" rx="16" fill="#EFEAE0"/>
    <rect x="38" y="432" width="182" height="58" rx="13" fill="#fff"/>
    <text x="129" y="456" text-anchor="middle" font-family="${FONT}" font-size="16" font-weight="800" fill="${ink}">Single photo</text>
    <text x="129" y="479" text-anchor="middle" font-family="${FONT}" font-size="14" font-weight="600" fill="${ink2}">1 copy</text>
    <text x="313" y="456" text-anchor="middle" font-family="${FONT}" font-size="16" font-weight="600" fill="#8b8678">Print sheet</text>
    <text x="313" y="479" text-anchor="middle" font-family="${FONT}" font-size="14" font-weight="600" fill="#8b8678">4 × 6 in</text>

    <rect x="34" y="512" width="372" height="88" rx="16" fill="#fff" stroke="${line}" stroke-width="2"/>
    <text x="56" y="548" font-family="${FONT}" font-size="18" font-weight="800" fill="${ink}">U.S. passport</text>
    <text x="384" y="548" text-anchor="end" font-family="${FONT}" font-size="16" font-weight="700" fill="${ink2}">1200 × 1200 px</text>
    <text x="56" y="578" font-family="${FONT}" font-size="14" font-weight="600" fill="${ink2}">2 × 2 in</text>
    <text x="384" y="578" text-anchor="end" font-family="${FONT}" font-size="14" font-weight="600" fill="${ink2}">600 DPI</text>

    <rect x="34" y="618" width="372" height="120" rx="16" fill="#fff" stroke="${line}" stroke-width="2"/>
    ${['Sized and cropped automatically', 'Crown and chin guides met', 'Saved straight to your gallery']
      .map((s, i) => `
    <g transform="translate(56,${642 + i * 32})">
      <rect width="22" height="22" rx="7" fill="${greenSoft}"/>
      ${check(2, 3, green)}
      <text x="34" y="16" font-family="${FONT}" font-size="15" font-weight="600" fill="${ink}">${esc(s)}</text>
    </g>`).join('')}`

// ── 5. 프라이버시 ────────────────────────────────────────────────────
const phonePrivacy = `
    ${header('Settings · About')}
    <rect x="34" y="150" width="372" height="132" rx="18" fill="${greenSoft}" stroke="#BFE8CC" stroke-width="2"/>
    <circle cx="80" cy="216" r="26" fill="#fff"/>
    ${shield(80, 216, 30, green)}
    <text x="122" y="204" font-family="${FONT}" font-size="19" font-weight="800" fill="${ink}">Your photo never leaves</text>
    <text x="122" y="230" font-family="${FONT}" font-size="15" font-weight="600" fill="${ink2}">Everything is processed on the device.</text>
    <text x="122" y="252" font-family="${FONT}" font-size="15" font-weight="600" fill="${ink2}">Nothing is uploaded or stored.</text>

    ${[
      ['No server upload', 'Photos stay on your phone'],
      ['No account needed', 'Install and start right away'],
      ['No ads', 'One purchase, use it for life'],
      ['Works offline', 'No connection needed to edit or save'],
    ].map(([a, b], i) => `
    <g transform="translate(34,${310 + i * 96})">
      <rect width="372" height="80" rx="16" fill="#fff" stroke="${line}" stroke-width="2"/>
      <rect x="18" y="20" width="40" height="40" rx="12" fill="${greenSoft}"/>
      ${check(28, 32, green)}
      <text x="76" y="36" font-family="${FONT}" font-size="18" font-weight="800" fill="${ink}">${esc(a)}</text>
      <text x="76" y="60" font-family="${FONT}" font-size="14" font-weight="600" fill="${ink2}">${esc(b)}</text>
    </g>`).join('')}

    <rect x="34" y="710" width="372" height="56" rx="28" fill="${ink}"/>
    <text x="220" y="746" text-anchor="middle" font-family="${FONT}" font-size="17" font-weight="700" fill="#fff">View privacy policy</text>`

// ── 6. 1회 결제 ──────────────────────────────────────────────────────
const phoneLifetime = `
    ${infinity(220, 150, 44, ink, 2.6)}
    <text x="220" y="212" text-anchor="middle" font-family="${FONT}" font-size="25" font-weight="800" fill="${ink}">One purchase. Forever.</text>
    <text x="220" y="242" text-anchor="middle" font-family="${FONT}" font-size="15" font-weight="600" fill="${ink2}">Make and save as many photos as you need.</text>

    <rect x="34" y="274" width="372" height="292" rx="18" fill="#fff" stroke="${line}" stroke-width="2"/>
    ${[
      'Unlimited downloads',
      'U.S. passport and visa presets',
      'Schengen and other formats',
      '4 × 6 in print sheet',
      'Spec updates included — no extra cost',
    ].map((s, i) => `
      <g transform="translate(58,${302 + i * 52})">
        <rect width="30" height="30" rx="9" fill="${greenSoft}"/>
        ${check(5, 7, green)}
        <text x="44" y="21" font-family="${FONT}" font-size="15" font-weight="600" fill="${ink}">${esc(s)}</text>
      </g>`).join('')}

    <text x="220" y="614" text-anchor="middle" font-family="${FONT}" font-size="15" font-weight="600" fill="${ink2}">No subscription · No per-photo fee</text>
    <rect x="34" y="640" width="372" height="60" rx="30" fill="${deep}"/>
    <text x="220" y="678" text-anchor="middle" font-family="${FONT}" font-size="19" font-weight="800" fill="${ink}">Unlock for life</text>
    <rect x="34" y="716" width="372" height="48" rx="24" fill="none" stroke="${line}" stroke-width="2"/>
    <text x="220" y="747" text-anchor="middle" font-family="${FONT}" font-size="15" font-weight="600" fill="${ink2}">Restore purchase</text>`

const pages = [
  { file: 'screenshot-1.png', badge: 'Yei ID', badgeIcon: spark(28, 24, 20, yellow),
    head1: 'Skip the photo', head2: 'studio.',
    sub: 'ID photos from your phone in about a minute', phone: phoneIntro },
  { file: 'screenshot-2.png', badge: 'U.S. formats', badgeIcon: globe(28, 24, 22, yellow),
    head1: 'U.S. passport', head2: '& visa, exact.',
    sub: '2 × 2 in · head size and eye line handled for you', phone: phoneUS },
  { file: 'screenshot-3.png', badge: 'Guides', badgeIcon: crop(28, 24, 20, yellow),
    head1: 'Crown and chin', head2: 'lined up.',
    sub: 'Pick a use and the sizing follows automatically', phone: phoneGuide, headSize: 52 },
  { file: 'screenshot-4.png', badge: 'Save', badgeIcon: download(28, 24, 22, yellow),
    head1: 'Shoot, then', head2: 'download.',
    sub: 'Correctly sized files straight to your gallery', phone: phoneDone },
  { file: 'screenshot-5.png', badge: 'Privacy', badgeIcon: shield(28, 24, 22, yellow),
    head1: 'Your photo', head2: 'never leaves.',
    sub: 'No uploads, no account — processed on device', phone: phonePrivacy },
  { file: 'screenshot-6.png', badge: 'Lifetime', badgeIcon: infinity(28, 24, 22, yellow),
    head1: 'One purchase,', head2: 'unlimited.',
    sub: 'No ads · No subscription · Spec updates free', phone: phoneLifetime, headSize: 52 },
]

for (const p of pages) {
  await sharp(Buffer.from(page(p))).png().toFile(dir + p.file)
  console.log(`en/${p.file} 생성 (${W}x${H})`)
}
