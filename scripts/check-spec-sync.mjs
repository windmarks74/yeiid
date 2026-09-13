// 규격 사전 페이지(site/yeiid/{qnet,gosi,toeic,kpc}.html)의 수치가
// src/usage.ts 실제 출력값과 일치하는지 확인한다.
//
// 왜 필요한가: 이 페이지들의 유일한 자산은 "검색에 도는 값은 낡았고 우리 값이 맞다"는 것이다.
// 앱과 페이지가 어긋나면 그 자산이 통째로 무너진다. 규격을 고칠 때마다 실행할 것.
//   node scripts/check-spec-sync.mjs
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const read = (p) => readFileSync(fileURLToPath(new URL(p, import.meta.url)), 'utf8').replace(/\r\n/g, '\n')
const usage = read('../src/usage.ts')

function block(key) {
  const i = usage.indexOf(`\n  ${key}: {`)
  if (i < 0) return null
  const rest = usage.slice(i + 1)
  const j = rest.slice(1).search(/\n  [a-z]+: \{/)
  return j < 0 ? rest : rest.slice(0, j + 1)
}
function num(key, field) {
  const b = block(key)
  if (!b) return null
  const m = b.match(new RegExp(`\\b${field}:\\s*(\\d+)`))
  return m ? +m[1] : null
}

// [용도, 필드, 기대값, 페이지에 이 문자열이 박혀 있어야 함]
const CHECKS = [
  ['qnet', 'targetW', 300, '300 × 400px'],
  ['qnet', 'targetH', 400, null],
  ['qnet', 'maxKB', 200, '200KB'],
  ['gosi', 'targetW', 137, '137 × 177px'],
  ['gosi', 'targetH', 177, null],
  ['gosi', 'maxKB', 340, '350KB 미만'], // 앱은 340KB로 인코딩해 "350KB 미만"을 충족
  ['kpc', 'targetW', 225, '225 × 300px'],
  ['kpc', 'targetH', 300, null],
  ['kpc', 'maxKB', 500, '500KB'],
  ['kpc', 'minW', 115, '115~235px'],
  ['kpc', 'minH', 150, '150~315px'],
  ['toeic', 'faceMin', 80, '80~90%'],
  ['toeic', 'faceMax', 90, null],
  // 국내 신분증 · 해외
  ['passport', 'targetW', 826, '826 × 1062px'],
  ['passport', 'targetH', 1062, null],
  ['passport', 'minW', 413, '413 × 531px 이상'],
  ['passport', 'maxKB', 200, '200KB 이하'],
  ['passport', 'faceMin', 70, '70~80%'],
  ['us', 'targetW', 600, '600 × 600px'],
  ['us', 'targetH', 600, null],
  ['us', 'maxKB', 240, '240KB 이하'],
  ['us', 'faceMax', 69, '50~69%'],
  ['license', 'targetW', 413, '413 × 531px'],
  ['license', 'targetH', 531, null],
]

// usage.ts 의 용도 key ↔ 페이지 slug (다른 것만)
const SLUG = { us: 'us-visa' }

let fail = 0
for (const [key, field, expected, mustAppear] of CHECKS) {
  const actual = num(key, field)
  if (actual !== expected) {
    console.error(`✗ usage.ts ${key}.${field} = ${actual} (기대 ${expected})`)
    fail++
    continue
  }
  if (mustAppear) {
    const html = read(`../site/yeiid/${SLUG[key] || key}.html`)
    if (!html.includes(mustAppear)) {
      console.error(`✗ ${key}.html 에 "${mustAppear}" 없음`)
      fail++
    }
  }
}

// JSON-LD 유효성
for (const slug of ['qnet', 'gosi', 'toeic', 'kpc', 'passport', 'us-visa', 'license']) {
  const html = read(`../site/yeiid/${slug}.html`)
  const m = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)
  try {
    const n = JSON.parse(m[1]).mainEntity.length
    if (n < 3) { console.error(`✗ ${slug} FAQ ${n}개 (3개 미만)`); fail++ }
  } catch (e) {
    console.error(`✗ ${slug} JSON-LD 파싱 실패: ${e.message}`)
    fail++
  }
}

if (fail) {
  console.error(`\n${fail}건 불일치 — 페이지와 앱이 다른 값을 말하고 있다.`)
  process.exit(1)
}
console.log(`규격 동기화 OK — usage.ts 대조 ${CHECKS.length}건, JSON-LD 7건 전부 통과`)
