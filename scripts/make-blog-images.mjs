// 네이버 블로그용 이미지 생성 — 본문에 업로드해서 쓴다.
// 재실행: node scripts/make-blog-images.mjs → docs/blog/img/*.png
//
// 왜 파일로 만드나: 네이버 블로그 에디터는 파일 업로드 방식이라 외부 URL 이미지를
// 넣을 수 없다(이미지는 pstatic.net 으로 올라간다). 설령 된다 해도 우리가 파일을
// 바꾸면 글이 깨지고, 네이버가 "이 블로그의 이미지"로 쳐주지도 않는다.
//
// 크기: 가로 800px. 네이버 블로그 본문 폭이 대략 그 정도라 확대·축소 없이 선명하게 보인다.
//
// ⚠️ 수치는 src/usage.ts 와 일치시킬 것. scripts/check-spec-sync.mjs 가 사이트 페이지는
//    검사하지만 이 이미지는 검사하지 못한다(PNG 안의 글자라 읽을 수 없다).
//    규격이 바뀌면 이 파일을 손으로 고치고 다시 생성해야 한다.
import sharp from 'sharp'
import { mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const W = 800
const ink = '#17161C', ink2 = '#5b5751', yellow = '#FFD12E', pale = '#FFF6D6'
const cream = '#FCFBF7', line = '#ECE7DB'
const green = '#1F9D55', greenSoft = '#E6F6EC'
const red = '#C2412B', redSoft = '#FDEEEB'
const FONT = 'Malgun Gothic, sans-serif'

const dir = fileURLToPath(new URL('../docs/blog/img/', import.meta.url))
mkdirSync(dir, { recursive: true })
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')

const dots = `
  <defs>
    <pattern id="d" width="26" height="26" patternUnits="userSpaceOnUse">
      <circle cx="3" cy="3" r="2" fill="${ink}" opacity="0.05"/>
    </pattern>
  </defs>`

// ── ① 규격 요약표 ───────────────────────────────────────────────────
const ROWS = [
  ['크기', '3.5 × 4.5cm', '137 × 177 픽셀 기준'],
  ['파일 형식', 'JPG 또는 PNG', ''],
  ['용량', '350KB 미만', '중증장애인 선발시험 제외'],
  ['배경', '단색', '권장'],
  ['촬영 시점', '최근 6개월 이내', '권장'],
]
const H1 = 150 + ROWS.length * 78 + 80
const spec = `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H1}" viewBox="0 0 ${W} ${H1}">
  ${dots}
  <rect width="${W}" height="${H1}" fill="${cream}"/>
  <rect width="${W}" height="${H1}" fill="url(#d)"/>
  <rect x="0" y="0" width="${W}" height="8" fill="${yellow}"/>

  <text x="44" y="78" font-family="${FONT}" font-size="34" font-weight="800" fill="${ink}">공무원 원서 사진 규격</text>
  <text x="44" y="116" font-family="${FONT}" font-size="18" font-weight="600" fill="${ink2}">국가공무원채용시스템 · 2026년 9월 확인</text>

  ${ROWS.map(([k, v, note], i) => {
    const y = 150 + i * 78
    return `
  <rect x="36" y="${y}" width="${W - 72}" height="66" rx="12" fill="#fff" stroke="${line}" stroke-width="2"/>
  <text x="62" y="${y + 41}" font-family="${FONT}" font-size="19" font-weight="650" fill="${ink2}">${esc(k)}</text>
  <text x="${W - 62}" y="${y + (note ? 34 : 41)}" text-anchor="end" font-family="${FONT}" font-size="23" font-weight="800" fill="${ink}">${esc(v)}</text>
  ${note ? `<text x="${W - 62}" y="${y + 54}" text-anchor="end" font-family="${FONT}" font-size="15" font-weight="600" fill="${ink2}">${esc(note)}</text>` : ''}`
  }).join('')}
</svg>`

// ── ② 100KB 오해 바로잡기 ───────────────────────────────────────────
const H2 = 430
const myth = `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H2}" viewBox="0 0 ${W} ${H2}">
  ${dots}
  <rect width="${W}" height="${H2}" fill="${cream}"/>
  <rect width="${W}" height="${H2}" fill="url(#d)"/>
  <rect x="0" y="0" width="${W}" height="8" fill="${yellow}"/>

  <text x="44" y="74" font-family="${FONT}" font-size="32" font-weight="800" fill="${ink}">공무원 사진 용량, 100KB 아닙니다</text>

  <rect x="36" y="108" width="352" height="150" rx="16" fill="${redSoft}" stroke="#F0CFC7" stroke-width="2"/>
  <text x="212" y="152" text-anchor="middle" font-family="${FONT}" font-size="17" font-weight="700" fill="${red}">검색에 도는 값</text>
  <text x="212" y="205" text-anchor="middle" font-family="${FONT}" font-size="46" font-weight="800" fill="${red}">100KB</text>
  <line x1="120" y1="192" x2="304" y2="192" stroke="${red}" stroke-width="4" stroke-linecap="round"/>
  <text x="212" y="236" text-anchor="middle" font-family="${FONT}" font-size="15" font-weight="600" fill="${red}">옛 사이버국가고시센터 기준</text>

  <text x="400" y="192" text-anchor="middle" font-family="${FONT}" font-size="34" font-weight="800" fill="${ink2}">→</text>

  <rect x="412" y="108" width="352" height="150" rx="16" fill="${greenSoft}" stroke="#BFE8CC" stroke-width="2"/>
  <text x="588" y="152" text-anchor="middle" font-family="${FONT}" font-size="17" font-weight="700" fill="${green}">지금 기준</text>
  <text x="588" y="205" text-anchor="middle" font-family="${FONT}" font-size="46" font-weight="800" fill="${green}">350KB 미만</text>
  <text x="588" y="236" text-anchor="middle" font-family="${FONT}" font-size="15" font-weight="600" fill="${green}">국가공무원채용시스템</text>

  <rect x="36" y="286" width="${W - 72}" height="104" rx="14" fill="${pale}" stroke="#EAD58A" stroke-width="2"/>
  <text x="62" y="326" font-family="${FONT}" font-size="18" font-weight="700" fill="${ink}">사이버국가고시센터(gosi.kr)는 2026년 4월 30일 종료됐습니다.</text>
  <text x="62" y="358" font-family="${FONT}" font-size="18" font-weight="600" fill="${ink2}">100KB에 맞추려고 화질을 낮출 이유가 없습니다.</text>
</svg>`

// ── ③ 크기 비교 ─────────────────────────────────────────────────────
const CMP = [
  ['이력서 · 일반 증명사진', '3 × 4cm', false],
  ['공무원 원서', '3.5 × 4.5cm', true],
  ['여권 · 운전면허', '3.5 × 4.5cm', false],
]
const H3 = 130 + CMP.length * 76 + 60
const cmp = `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H3}" viewBox="0 0 ${W} ${H3}">
  ${dots}
  <rect width="${W}" height="${H3}" fill="${cream}"/>
  <rect width="${W}" height="${H3}" fill="url(#d)"/>
  <rect x="0" y="0" width="${W}" height="8" fill="${yellow}"/>

  <text x="44" y="72" font-family="${FONT}" font-size="32" font-weight="800" fill="${ink}">용도마다 크기가 다릅니다</text>
  <text x="44" y="106" font-family="${FONT}" font-size="17" font-weight="600" fill="${ink2}">이력서용 사진을 그대로 올리면 비율이 맞지 않습니다</text>

  ${CMP.map(([use, size, here], i) => {
    const y = 130 + i * 76
    return `
  <rect x="36" y="${y}" width="${W - 72}" height="64" rx="12" fill="${here ? pale : '#fff'}" stroke="${here ? '#EAD58A' : line}" stroke-width="2"/>
  <text x="62" y="${y + 40}" font-family="${FONT}" font-size="20" font-weight="${here ? 800 : 650}" fill="${ink}">${esc(use)}</text>
  <text x="${W - 62}" y="${y + 40}" text-anchor="end" font-family="${FONT}" font-size="23" font-weight="800" fill="${here ? '#8a6a00' : ink2}">${esc(size)}</text>`
  }).join('')}
</svg>`

// ── 2편(큐넷) ───────────────────────────────────────────────────────
// ① 규격 요약표
const QROWS = [
  ['크기', '300 × 400px 이상', '3 × 4cm 기준'],
  ['파일 형식', 'JPG (JPEG)', ''],
  ['용량', '200KB 이하', '접수 가이드 기준'],
  ['배경', '흰색', ''],
  ['촬영 시점', '최근 6개월 이내', ''],
]
const QH1 = 150 + QROWS.length * 78 + 80
const qspec = `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${QH1}" viewBox="0 0 ${W} ${QH1}">
  ${dots}
  <rect width="${W}" height="${QH1}" fill="${cream}"/>
  <rect width="${W}" height="${QH1}" fill="url(#d)"/>
  <rect x="0" y="0" width="${W}" height="8" fill="${yellow}"/>

  <text x="44" y="78" font-family="${FONT}" font-size="34" font-weight="800" fill="${ink}">큐넷 원서접수 사진 규격</text>
  <text x="44" y="116" font-family="${FONT}" font-size="18" font-weight="600" fill="${ink2}">국가기술자격 · 이용방법 안내 2025.12.17 갱신 기준</text>

  ${QROWS.map(([k, v, note], i) => {
    const y = 150 + i * 78
    return `
  <rect x="36" y="${y}" width="${W - 72}" height="66" rx="12" fill="#fff" stroke="${line}" stroke-width="2"/>
  <text x="62" y="${y + 41}" font-family="${FONT}" font-size="19" font-weight="650" fill="${ink2}">${esc(k)}</text>
  <text x="${W - 62}" y="${y + (note ? 34 : 41)}" text-anchor="end" font-family="${FONT}" font-size="23" font-weight="800" fill="${ink}">${esc(v)}</text>
  ${note ? `<text x="${W - 62}" y="${y + 54}" text-anchor="end" font-family="${FONT}" font-size="15" font-weight="600" fill="${ink2}">${esc(note)}</text>` : ''}`
  }).join('')}
</svg>`

// ② "디지털은 안 된다"는 오해 — 이 글의 핵심
const QH2 = 430
const qdigital = `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${QH2}" viewBox="0 0 ${W} ${QH2}">
  ${dots}
  <rect width="${W}" height="${QH2}" fill="${cream}"/>
  <rect width="${W}" height="${QH2}" fill="url(#d)"/>
  <rect x="0" y="0" width="${W}" height="8" fill="${yellow}"/>

  <text x="44" y="74" font-family="${FONT}" font-size="32" font-weight="800" fill="${ink}">디지털 사진이 안 되는 게 아닙니다</text>

  <rect x="36" y="108" width="352" height="150" rx="16" fill="${redSoft}" stroke="#F0CFC7" stroke-width="2"/>
  <text x="212" y="150" text-anchor="middle" font-family="${FONT}" font-size="17" font-weight="700" fill="${red}">부적합</text>
  <text x="212" y="192" text-anchor="middle" font-family="${FONT}" font-size="27" font-weight="800" fill="${red}">인쇄물을 다시 촬영</text>
  <text x="212" y="228" text-anchor="middle" font-family="${FONT}" font-size="15" font-weight="600" fill="${red}">화질이 두 번 깎이고 종이 결·반사가 남는다</text>

  <rect x="412" y="108" width="352" height="150" rx="16" fill="${greenSoft}" stroke="#BFE8CC" stroke-width="2"/>
  <text x="588" y="150" text-anchor="middle" font-family="${FONT}" font-size="17" font-weight="700" fill="${green}">문제 없음</text>
  <text x="588" y="192" text-anchor="middle" font-family="${FONT}" font-size="27" font-weight="800" fill="${green}">디지털 파일 그대로</text>
  <text x="588" y="228" text-anchor="middle" font-family="${FONT}" font-size="15" font-weight="600" fill="${green}">규격에 맞으면 흰 배경 처리도 괜찮다</text>

  <rect x="36" y="286" width="${W - 72}" height="104" rx="14" fill="${pale}" stroke="#EAD58A" stroke-width="2"/>
  <text x="62" y="326" font-family="${FONT}" font-size="18" font-weight="700" fill="${ink}">사진관에서 인화본만 받으셨다면 폰으로 찍지 마세요.</text>
  <text x="62" y="358" font-family="${FONT}" font-size="18" font-weight="600" fill="${ink2}">요즘은 대부분 파일도 같이 줍니다.</text>
</svg>`

// ③ 용량이 걸릴 때의 순서
const QSTEP = [
  ['1', '크기를 300 × 400px로 맞춘다', true],
  ['2', '그러면 200KB는 대체로 여유가 생긴다', true],
  ['✗', '화질부터 낮추면 얼굴이 뭉개져 다른 이유로 걸린다', false],
]
const QH3 = 140 + QSTEP.length * 86 + 50
const qsize = `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${QH3}" viewBox="0 0 ${W} ${QH3}">
  ${dots}
  <rect width="${W}" height="${QH3}" fill="${cream}"/>
  <rect width="${W}" height="${QH3}" fill="url(#d)"/>
  <rect x="0" y="0" width="${W}" height="8" fill="${yellow}"/>

  <text x="44" y="72" font-family="${FONT}" font-size="32" font-weight="800" fill="${ink}">200KB가 넘을 때, 순서가 중요합니다</text>
  <text x="44" y="108" font-family="${FONT}" font-size="17" font-weight="600" fill="${ink2}">화질을 낮추는 건 마지막 수단입니다</text>

  ${QSTEP.map(([n, txt, ok], i) => {
    const y = 140 + i * 86
    return `
  <rect x="36" y="${y}" width="${W - 72}" height="72" rx="14" fill="${ok ? greenSoft : redSoft}" stroke="${ok ? '#BFE8CC' : '#F0CFC7'}" stroke-width="2"/>
  <circle cx="84" cy="${y + 36}" r="22" fill="${ok ? green : red}"/>
  <text x="84" y="${y + 45}" text-anchor="middle" font-family="${FONT}" font-size="22" font-weight="800" fill="#fff">${esc(n)}</text>
  <text x="126" y="${y + 45}" font-family="${FONT}" font-size="21" font-weight="${ok ? 700 : 650}" fill="${ok ? ink : red}">${esc(txt)}</text>`
  }).join('')}
</svg>`

// ── 3편(이력서·크기 비교) ────────────────────────────────────────────
// ① "공식 규격 없음" — 이 글의 핵심
const RH1 = 400
const rnospec = `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${RH1}" viewBox="0 0 ${W} ${RH1}">
  ${dots}
  <rect width="${W}" height="${RH1}" fill="${cream}"/>
  <rect width="${W}" height="${RH1}" fill="url(#d)"/>
  <rect x="0" y="0" width="${W}" height="8" fill="${yellow}"/>

  <text x="44" y="74" font-family="${FONT}" font-size="32" font-weight="800" fill="${ink}">이력서 사진엔 "공식 규격"이 없습니다</text>

  <rect x="36" y="108" width="352" height="132" rx="16" fill="${greenSoft}" stroke="#BFE8CC" stroke-width="2"/>
  <text x="212" y="146" text-anchor="middle" font-family="${FONT}" font-size="17" font-weight="700" fill="${green}">규격을 정한 기관이 있다</text>
  <text x="212" y="186" text-anchor="middle" font-family="${FONT}" font-size="24" font-weight="800" fill="${green}">여권 · 운전면허</text>
  <text x="212" y="218" text-anchor="middle" font-family="${FONT}" font-size="15" font-weight="600" fill="${green}">발급 기관이 크기를 정해둔다</text>

  <rect x="412" y="108" width="352" height="132" rx="16" fill="${pale}" stroke="#EAD58A" stroke-width="2"/>
  <text x="588" y="146" text-anchor="middle" font-family="${FONT}" font-size="17" font-weight="700" fill="#8a6a00">정한 곳이 없다</text>
  <text x="588" y="186" text-anchor="middle" font-family="${FONT}" font-size="24" font-weight="800" fill="#8a6a00">이력서 사진</text>
  <text x="588" y="218" text-anchor="middle" font-family="${FONT}" font-size="15" font-weight="600" fill="#8a6a00">3 × 4cm 는 관행이다</text>

  <rect x="36" y="268" width="${W - 72}" height="98" rx="14" fill="#fff" stroke="${line}" stroke-width="2"/>
  <text x="62" y="306" font-family="${FONT}" font-size="18" font-weight="700" fill="${ink}">정작 막히는 건 크기가 아니라 제출처의 픽셀·용량 조건입니다.</text>
  <text x="62" y="338" font-family="${FONT}" font-size="18" font-weight="600" fill="${ink2}">채용 사이트 안내를 먼저 보는 게 순서입니다.</text>
</svg>`

// ② 용도별 비교표 — 이 글의 무기
const RCMP = [
  ['이력서 · 반명함 · 일반', '3 × 4cm', '354 × 472px', true],
  ['큐넷 · 토익', '3 × 4cm', '300 × 400px', false],
  ['여권', '3.5 × 4.5cm', '826 × 1062px', false],
  ['운전면허', '3.5 × 4.5cm', '413 × 531px', false],
  ['공무원 원서', '3.5 × 4.5cm', '137 × 177px', false],
  ['미국 여권 · 비자', '2 × 2인치', '600~1200px 정사각', false],
]
const RH2 = 128 + RCMP.length * 66 + 56
const rcompare = `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${RH2}" viewBox="0 0 ${W} ${RH2}">
  ${dots}
  <rect width="${W}" height="${RH2}" fill="${cream}"/>
  <rect width="${W}" height="${RH2}" fill="url(#d)"/>
  <rect x="0" y="0" width="${W}" height="8" fill="${yellow}"/>

  <text x="44" y="70" font-family="${FONT}" font-size="32" font-weight="800" fill="${ink}">용도별 크기 한 장 정리</text>
  <text x="44" y="104" font-family="${FONT}" font-size="17" font-weight="600" fill="${ink2}">같은 "증명사진"이어도 제출처에 따라 갈립니다</text>

  ${RCMP.map(([use, size, px, here], i) => {
    const y = 128 + i * 66
    return `
  <rect x="36" y="${y}" width="${W - 72}" height="56" rx="12" fill="${here ? pale : '#fff'}" stroke="${here ? '#EAD58A' : line}" stroke-width="2"/>
  <text x="62" y="${y + 35}" font-family="${FONT}" font-size="19" font-weight="${here ? 800 : 650}" fill="${ink}">${esc(use)}</text>
  <text x="472" y="${y + 35}" text-anchor="end" font-family="${FONT}" font-size="20" font-weight="800" fill="${here ? '#8a6a00' : ink}">${esc(size)}</text>
  <text x="${W - 62}" y="${y + 35}" text-anchor="end" font-family="${FONT}" font-size="16" font-weight="600" fill="${ink2}">${esc(px)}</text>`
  }).join('')}
</svg>`

// ③ 흔한 실수 — 3×4 를 3.5×4.5 에 쓰면
const RH3 = 400
const rmistake = `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${RH3}" viewBox="0 0 ${W} ${RH3}">
  ${dots}
  <rect width="${W}" height="${RH3}" fill="${cream}"/>
  <rect width="${W}" height="${RH3}" fill="url(#d)"/>
  <rect x="0" y="0" width="${W}" height="8" fill="${yellow}"/>

  <text x="44" y="74" font-family="${FONT}" font-size="32" font-weight="800" fill="${ink}">가장 흔한 실수</text>
  <text x="44" y="108" font-family="${FONT}" font-size="17" font-weight="600" fill="${ink2}">이력서용 3 × 4cm 를 공무원 원서·운전면허에 그대로 쓰는 것</text>

  ${/* 머리카락은 "얼굴보다 조금 큰 위쪽 반타원"을 먼저 깔고 얼굴로 덮어 테두리만 남긴다.
        곡선을 손으로 이어 붙이면 비율이 바뀔 때 모양이 깨진다. */''}
  <defs>
    <clipPath id="cutFrame"><rect x="0" y="0" width="150" height="200" rx="8"/></clipPath>
  </defs>

  <g transform="translate(120,146)">
    <rect x="0" y="0" width="150" height="200" rx="8" fill="#fff" stroke="${line}" stroke-width="2"/>
    <text x="75" y="-12" text-anchor="middle" font-family="${FONT}" font-size="16" font-weight="700" fill="${ink2}">3 × 4cm 원본</text>
    <path d="M34 200 q41 -54 82 0 z" fill="#2E3A4F"/>
    <path d="M36 92 a39 48 0 0 1 78 0 z" fill="#2A2320"/>
    <ellipse cx="75" cy="92" rx="34" ry="42" fill="#E7B58E"/>
  </g>

  <text x="330" y="256" font-family="${FONT}" font-size="30" font-weight="800" fill="${red}">→</text>

  ${/* 3.5×4.5 는 세로가 더 길다. 같은 폭을 채우려고 확대하면 정수리가 위로 밀려 잘린다.
        clipPath 로 실제로 잘라 보여준다 — 라벨만 붙이면 설득이 안 된다. */''}
  <g transform="translate(410,146)">
    <g clip-path="url(#cutFrame)">
      <rect x="0" y="0" width="150" height="200" fill="#fff"/>
      <g transform="translate(75,118) scale(1.28) translate(-75,-118)">
        <path d="M34 200 q41 -54 82 0 z" fill="#2E3A4F"/>
        <path d="M36 92 a39 48 0 0 1 78 0 z" fill="#2A2320"/>
        <ellipse cx="75" cy="92" rx="34" ry="42" fill="#E7B58E"/>
      </g>
    </g>
    <rect x="0" y="0" width="150" height="200" rx="8" fill="none" stroke="${red}" stroke-width="2" stroke-dasharray="6 5"/>
    <line x1="0" y1="0" x2="150" y2="0" stroke="${red}" stroke-width="4"/>
    <text x="75" y="-12" text-anchor="middle" font-family="${FONT}" font-size="16" font-weight="700" fill="${red}">3.5 × 4.5cm 에 맞추면</text>
    <text x="75" y="222" text-anchor="middle" font-family="${FONT}" font-size="14" font-weight="700" fill="${red}">정수리가 잘립니다</text>
  </g>

  <rect x="596" y="146" width="168" height="200" rx="14" fill="${redSoft}" stroke="#F0CFC7" stroke-width="2"/>
  <text x="680" y="212" text-anchor="middle" font-family="${FONT}" font-size="17" font-weight="700" fill="${red}">비율이 다릅니다</text>
  <text x="680" y="248" text-anchor="middle" font-family="${FONT}" font-size="15" font-weight="600" fill="${red}">늘리면 어색해지고</text>
  <text x="680" y="274" text-anchor="middle" font-family="${FONT}" font-size="15" font-weight="600" fill="${red}">자르면 머리·턱이</text>
  <text x="680" y="300" text-anchor="middle" font-family="${FONT}" font-size="15" font-weight="600" fill="${red}">잘립니다</text>
</svg>`

const pages = [
  ['gosi-spec.png', spec],
  ['gosi-100kb.png', myth],
  ['gosi-size.png', cmp],
  ['qnet-spec.png', qspec],
  ['qnet-digital.png', qdigital],
  ['qnet-size.png', qsize],
  ['resume-nospec.png', rnospec],
  ['resume-compare.png', rcompare],
  ['resume-mistake.png', rmistake],
]
for (const [name, svg] of pages) {
  await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(dir + name)
  console.log(`${name} 생성`)
}
