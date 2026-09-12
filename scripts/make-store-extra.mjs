// 스토어 스크린샷 5~7번 — 프라이버시 · 큐넷 규격 · 1회 결제. 720x1280, 브랜드 톤(노랑+잉크).
// make-store-overseas.mjs와 같은 스타일. 가격 숫자는 넣지 않는다(지역가·변경 대비).
// 재실행: node scripts/make-store-extra.mjs → store_upload/screenshot-5.png, -6.png, -7.png
import sharp from 'sharp'
import { fileURLToPath } from 'node:url'

const W = 720, H = 1280
const ink = '#17161C', ink2 = '#5b5751', yellow = '#FFD12E', deep = '#F2BE00'
const cream = '#FCFBF7', line = '#ECE7DB', skin = '#E7B58E', hair = '#2A2320', navy = '#2E3A4F'
const green = '#1F9D55', greenSoft = '#E6F6EC'
const FONT = 'Malgun Gothic, sans-serif'
const out = (name) => fileURLToPath(new URL(`../store_upload/${name}`, import.meta.url))

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;')

// 공통 페이지 골격: 배지 + 2줄 헤드라인 + 부제 + 폰 목업(본문 SVG 삽입)
function page({ badge, badgeIcon, head1, head2, sub, phone }) {
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
    <rect width="${badge.length * 22 + 62}" height="48" rx="24" fill="${ink}"/>
    ${badgeIcon}
    <text x="48" y="32" font-family="${FONT}" font-size="22" font-weight="800" fill="#fff">${esc(badge)}</text>
  </g>

  <text x="48" y="210" font-family="${FONT}" font-size="62" font-weight="800" fill="${ink}">${esc(head1)}</text>
  <text x="48" y="284" font-family="${FONT}" font-size="62" font-weight="800" fill="${ink}">${esc(head2)}</text>
  <rect x="50" y="298" width="300" height="14" rx="7" fill="${ink}" opacity="0.16"/>
  <text x="50" y="356" font-family="${FONT}" font-size="26" font-weight="700" fill="#6a6456">${esc(sub)}</text>

  <g transform="translate(140,452)">
    <rect x="6" y="14" width="440" height="820" rx="42" fill="url(#phoneShadow)"/>
    <rect x="0" y="0" width="440" height="820" rx="40" fill="${cream}" stroke="${line}" stroke-width="2"/>
    <text x="40" y="52" font-family="${FONT}" font-size="20" font-weight="800" fill="${ink}">9:41</text>
    <rect x="372" y="38" width="30" height="15" rx="4" fill="${ink}"/>
    <rect x="404" y="40" width="3" height="11" rx="1.5" fill="${ink}"/>
    ${phone}
  </g>
</svg>`
}

// 아이콘들
const shield = (cx, cy, s, c, sw = 2) => `
  <g fill="none" stroke="${c}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" transform="translate(${cx - s / 2},${cy - s / 2}) scale(${s / 24})">
    <path d="M12 3l7 3v5c0 4.4-3 7.7-7 9-4-1.3-7-4.6-7-9V6z"/>
    <path d="M9 12l2 2 4-4"/>
  </g>`
const doc = (cx, cy, s, c, sw = 2) => `
  <g fill="none" stroke="${c}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" transform="translate(${cx - s / 2},${cy - s / 2}) scale(${s / 24})">
    <path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/><path d="M8.5 14l2 2 4-4.5"/>
  </g>`
const infinity = (cx, cy, s, c, sw = 2.4) => `
  <g fill="none" stroke="${c}" stroke-width="${sw}" stroke-linecap="round" transform="translate(${cx - s / 2},${cy - s / 2}) scale(${s / 24})">
    <path d="M7 15c-2.2 0-4-1.3-4-3s1.8-3 4-3c3 0 7 6 10 6 2.2 0 4-1.3 4-3s-1.8-3-4-3c-3 0-7 6-10 6z"/>
  </g>`
const check = (x, y, c) => `<path d="M${x} ${y + 8} l6 6 l12 -13" fill="none" stroke="${c}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>`

// 공통: 헤더 + 인물 크롭 프레임(3:4)
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

// ── 5. 프라이버시 ───────────────────────────────────────────────────────────
const phonePrivacy = `
    ${header('설정 · 소개')}
    <rect x="34" y="150" width="372" height="132" rx="18" fill="${greenSoft}" stroke="#BFE8CC" stroke-width="2"/>
    <circle cx="80" cy="216" r="26" fill="#fff"/>
    ${shield(80, 216, 30, green, 2.2)}
    <text x="122" y="204" font-family="${FONT}" font-size="21" font-weight="800" fill="${ink}">사진은 기기를 떠나지 않아요</text>
    <text x="122" y="232" font-family="${FONT}" font-size="15" font-weight="600" fill="${ink2}">모든 편집은 기기 안에서만 처리되며</text>
    <text x="122" y="254" font-family="${FONT}" font-size="15" font-weight="600" fill="${ink2}">서버로 전송·저장되지 않습니다.</text>

    ${[
      ['서버 업로드 없음', '사진이 인터넷으로 나가지 않아요'],
      ['회원가입·로그인 없음', '설치하고 바로 시작'],
      ['광고 없음', '한 번 결제, 평생 이용'],
      ['오프라인에서도 작동', '편집·저장에 인터넷 불필요'],
    ]
      .map(
        ([a, b], i) => `
    <g transform="translate(34,${310 + i * 96})">
      <rect width="372" height="80" rx="16" fill="#fff" stroke="${line}" stroke-width="2"/>
      <rect x="18" y="20" width="40" height="40" rx="12" fill="${greenSoft}"/>
      ${check(28, 32, green)}
      <text x="76" y="36" font-family="${FONT}" font-size="19" font-weight="800" fill="${ink}">${esc(a)}</text>
      <text x="76" y="60" font-family="${FONT}" font-size="14" font-weight="600" fill="${ink2}">${esc(b)}</text>
    </g>`,
      )
      .join('')}
    <rect x="34" y="710" width="372" height="56" rx="28" fill="${ink}"/>
    <text x="220" y="746" text-anchor="middle" font-family="${FONT}" font-size="18" font-weight="800" fill="#fff">개인정보처리방침 보기</text>`

// ── 6. 큐넷 규격 ─────────────────────────────────────────────────────────────
const phoneQnet = `
    ${header('편집')}
    <rect x="34" y="150" width="372" height="44" rx="22" fill="#EFEAE0"/>
    <text x="74" y="178" text-anchor="middle" font-family="${FONT}" font-size="18" font-weight="700" fill="#8b8678">여권</text>
    <text x="158" y="178" text-anchor="middle" font-family="${FONT}" font-size="18" font-weight="700" fill="#8b8678">면허</text>
    <rect x="218" y="153" width="92" height="38" rx="19" fill="#fff"/>
    <text x="264" y="178" text-anchor="middle" font-family="${FONT}" font-size="18" font-weight="800" fill="${ink}">큐넷</text>
    <text x="356" y="178" text-anchor="middle" font-family="${FONT}" font-size="18" font-weight="700" fill="#8b8678">일반</text>

    <rect x="34" y="212" width="372" height="92" rx="16" fill="#FFF7DF" stroke="#EAD58A" stroke-width="2"/>
    ${doc(58, 252, 26, ink, 2.2)}
    <text x="80" y="260" font-family="${FONT}" font-size="26" font-weight="800" fill="${ink}">큐넷 자격증</text>
    <rect x="300" y="232" width="88" height="30" rx="15" fill="${green}"/>
    <text x="344" y="252" text-anchor="middle" font-family="${FONT}" font-size="15" font-weight="800" fill="#fff">무료</text>
    <text x="58" y="292" font-family="${FONT}" font-size="16" font-weight="600" fill="${ink2}">디지털 300×400px · JPG · 용량 자동 맞춤</text>

    ${portrait(120, 326, 200, 266)}

    <rect x="34" y="616" width="372" height="150" rx="16" fill="#fff" stroke="${line}" stroke-width="2"/>
    <text x="54" y="648" font-family="${FONT}" font-size="17" font-weight="800" fill="${ink}">출력 (JPEG)</text>
    <rect x="54" y="664" width="22" height="22" rx="6" fill="${ink}"/>
    ${check(58, 668, '#fff')}
    <text x="86" y="681" font-family="${FONT}" font-size="15" font-weight="600" fill="${ink}">목표 용량 맞추기 · 200 KB 이하</text>
    <rect x="54" y="702" width="332" height="44" rx="12" fill="${greenSoft}"/>
    ${check(70, 716, green)}
    <text x="100" y="731" font-family="${FONT}" font-size="16" font-weight="800" fill="${green}">168.4 KB · 300×400px — 규격 통과</text>`

// ── 7. 1회 결제 ──────────────────────────────────────────────────────────────
const phoneLifetime = `
    <text x="220" y="150" text-anchor="middle" font-family="${FONT}" font-size="46" font-weight="800" fill="${ink}">∞</text>
    <text x="220" y="204" text-anchor="middle" font-family="${FONT}" font-size="26" font-weight="800" fill="${ink}">한 번 결제, 평생 무제한.</text>
    <text x="220" y="234" text-anchor="middle" font-family="${FONT}" font-size="15" font-weight="600" fill="${ink2}">증명사진을 무제한으로 만들고 저장하세요.</text>

    <rect x="34" y="266" width="372" height="300" rx="18" fill="#fff" stroke="${line}" stroke-width="2"/>
    ${[
      '무제한 다운로드',
      '미국·셰겐 등 해외 규격',
      '4×6 인화 시트 출력',
      '규정 바뀌면 업데이트로 반영 · 추가 비용 없음',
      '광고 없음 · 구독 아님',
    ]
      .map(
        (s, i) => `
      <g transform="translate(58,${296 + i * 52})">
        <rect width="30" height="30" rx="9" fill="${greenSoft}"/>
        ${check(5, 7, green)}
        <text x="44" y="21" font-family="${FONT}" font-size="16" font-weight="700" fill="${ink}">${esc(s)}</text>
      </g>`,
      )
      .join('')}

    <text x="220" y="620" text-anchor="middle" font-family="${FONT}" font-size="15" font-weight="600" fill="${ink2}">장당 결제 ✕ · 매달 구독 ✕ · 딱 한 번</text>
    <rect x="34" y="646" width="372" height="60" rx="30" fill="${deep}"/>
    <text x="220" y="684" text-anchor="middle" font-family="${FONT}" font-size="20" font-weight="800" fill="${ink}">평생 이용 시작</text>
    <rect x="34" y="722" width="372" height="48" rx="24" fill="none" stroke="${line}" stroke-width="2"/>
    <text x="220" y="753" text-anchor="middle" font-family="${FONT}" font-size="16" font-weight="700" fill="${ink2}">구매 복원</text>`

const pages = [
  {
    file: 'screenshot-5.png',
    badge: '프라이버시', badgeIcon: shield(28, 24, 22, yellow, 2.2),
    head1: '사진은 폰 밖으로', head2: '나가지 않아요.',
    sub: '서버 업로드·회원가입 없음 — 100% 기기 안에서 처리',
    phone: phonePrivacy,
  },
  {
    file: 'screenshot-6.png',
    badge: '큐넷 자격증', badgeIcon: doc(28, 24, 22, yellow, 2.2),
    head1: '큐넷 접수 규격,', head2: '용량까지 자동.',
    sub: '300×400px · JPG · 용량 초과 걱정 없이 바로 업로드',
    phone: phoneQnet,
  },
  {
    file: 'screenshot-7.png',
    badge: '평생 이용', badgeIcon: infinity(28, 24, 22, yellow, 2.4),
    head1: '한 번 결제,', head2: '평생 무제한.',
    sub: '광고 없음 · 구독 아님 · 규격 업데이트 무료',
    phone: phoneLifetime,
  },
]

for (const p of pages) {
  await sharp(Buffer.from(page(p))).png().toFile(out(p.file))
  console.log(`${p.file} 생성 완료 (${W}x${H})`)
}
