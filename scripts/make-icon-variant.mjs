// 스토어 아이콘 실험용 대안 아이콘 — store_upload/experiment/icon-512-b*.png
// 재실행: node scripts/make-icon-variant.mjs
//
// 왜 만드는가 (2026-10-31, docs/funnel-2026-10-31.md):
//   깔때기에서 노출 4,230 → 방문 332 = 7.8% 로 92%가 검색 결과에서 떨어진다.
//   반면 방문 → 설치는 48.5% 로 업계 중앙값(~30%)보다 낫다.
//   → 약한 건 "설득"이 아니라 "들어오게 하는 것"이고, 거기서 보이는 건
//     아이콘·앱 이름·별점 셋뿐이다. 이름(여권사진·증명사진 만들기)과 별점(4.93)은
//     이미 좋다. 남은 변수가 아이콘이다.
//
//   현재 아이콘은 노란 바탕의 스마일이라 "증명사진 앱"으로 안 읽힌다는 게 가설이다.
//   ⚠️ 가설이지 확인된 사실이 아니다. 스토어 등록정보 실험이 그걸 가리는 수단이다.
//
// 설계 원칙: **한 번에 하나만 바꾼다.** 브랜드 노란색·그라데이션·라운딩은 그대로 두고
//   가운데 마크만 스마일 → 증명사진으로 바꾼다. 배경까지 바꾸면 뭐가 이겼는지 모른다.
import sharp from 'sharp'
import { mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const S = 512
const ink = '#17161C'
const dir = fileURLToPath(new URL('../store_upload/experiment/', import.meta.url))
mkdirSync(dir, { recursive: true })

// 검색 결과에서 아이콘은 48~72px 로 줄어든다. 디테일은 전부 사라지므로
// 큰 흰 카드 + 진한 실루엣, 두 덩어리로만 읽히게 만든다.
const bg = `
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#FFE066"/>
      <stop offset="1" stop-color="#F2BE00"/>
    </linearGradient>
    <filter id="sh" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="10" stdDeviation="12" flood-color="#000" flood-opacity="0.18"/>
    </filter>
  </defs>
  <rect width="${S}" height="${S}" fill="url(#g)"/>`
// ⚠️ 모서리를 둥글리지 않는다. Play 가 업로드된 512 정사각형에 둥근 마스크를 알아서 입힌다.
//    여기서 미리 둥글리면 이중으로 깎여 다른 앱보다 작아 보인다.
//    현재 운영 아이콘(store_upload/icon-512.png)도 정사각형이다 — 맞춰야 비교가 성립한다.

// 증명사진 카드 — 3:4 비율(실제 증명사진 비율과 같다)
function card({ rotate = 0, shadow = false }) {
  const w = 216, h = 288
  const x = (S - w) / 2, y = (S - h) / 2 - 4
  const t = rotate ? ` transform="rotate(${rotate} ${S / 2} ${S / 2})"` : ''
  const f = shadow ? ' filter="url(#sh)"' : ''
  return `
  <g${t}${f}>
    <clipPath id="cc"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="16"/></clipPath>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="16" fill="#FFFFFF"/>
    <g clip-path="url(#cc)">
      <circle cx="${S / 2}" cy="${y + 108}" r="54" fill="${ink}"/>
      <rect x="${S / 2 - 19}" y="${y + 150}" width="38" height="46" rx="12" fill="${ink}"/>
      <path d="M ${S / 2 - 80} ${y + h} Q ${S / 2 - 80} ${y + 186} ${S / 2} ${y + 186}
               Q ${S / 2 + 80} ${y + 186} ${S / 2 + 80} ${y + h} Z" fill="${ink}"/>
    </g>
  </g>`
}

const variants = [
  ['b1', card({})],                                 // 정면 — 가장 단순하고 작게 줄여도 안 깨진다
  ['b2', card({ rotate: -6, shadow: true })],       // 살짝 기울임 + 그림자 — "사진"으로 더 읽힌다
]

for (const [name, mark] of variants) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}">${bg}${mark}</svg>`
  const out = `${dir}icon-512-${name}.png`
  await sharp(Buffer.from(svg)).png().toFile(out)
  // 작게 줄였을 때 읽히는지 같이 뽑는다 — 검색 결과 크기 확인용
  await sharp(Buffer.from(svg)).resize(72, 72).png().toFile(`${dir}icon-72-${name}.png`)
  console.log(`생성 — ${out}`)
}
