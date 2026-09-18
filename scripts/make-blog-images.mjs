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

const pages = [
  ['gosi-spec.png', spec],
  ['gosi-100kb.png', myth],
  ['gosi-size.png', cmp],
]
for (const [name, svg] of pages) {
  await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(dir + name)
  console.log(`${name} 생성`)
}
