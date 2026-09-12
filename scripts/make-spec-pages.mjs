// 규격 사전 페이지 생성 — /qnet /gosi /toeic /kpc
// 재실행: node scripts/make-spec-pages.mjs → site/yeiid/{qnet,gosi,toeic,kpc}.html
//
// 목적(docs/marketing-strategy-2026-09-12.md §4):
//   "큐넷 사진 규격", "공무원 원서 사진 크기" 같은 검색은 앱을 찾는 검색이 아니라
//   답을 찾는 검색이다. Play 스토어엔 답이 없고 네이버·구글에 있는데, 거기 있는 답이 낡았다.
//   우리는 기관 공식 안내를 직접 확인한 값을 갖고 있으므로 그 자리를 가져온다.
//
// ⚠️ 수치 동기화 — 여기 SPECS 의 값은 src/usage.ts 및 MAINTENANCE.md 와 반드시 일치해야 한다.
//   앱이 실제로 뽑는 값과 페이지가 다르면 신뢰가 깨지고, 그게 이 페이지들의 유일한 자산이다.
//   규격을 고칠 땐 세 곳을 같이 고친다: src/usage.ts · MAINTENANCE.md · 이 파일.
//
// 페이지 구성 순서는 의도된 것이다:
//   ① 답을 맨 위에(검색해서 온 사람은 3초 안에 답을 원한다) → ② 출처·갱신일 →
//   ③ 흔히 틀리는 값 바로잡기 → ④ 반려 사유 → ⑤ 맞추는 법 → ⑥ CTA → ⑦ FAQ → ⑧ 다른 규격
//   답을 주기 전에 팔면 이탈한다.
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const ORIGIN = 'https://yeiid.itbrown.com'
const PLAY = 'https://play.google.com/store/apps/details?id=com.yei.idphoto'
const out = (name) => fileURLToPath(new URL(`../site/yeiid/${name}`, import.meta.url))
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const attr = (s) => esc(s).replace(/"/g, '&quot;')

const SPECS = [
  {
    slug: 'qnet',
    nav: '큐넷',
    title: '큐넷 사진 규격 — 300×400px · JPG · 200KB 이하',
    h1: '큐넷(Q-Net) 증명사진 규격',
    lede: '국가기술·전문자격 원서접수에 올리는 사진 기준입니다. 픽셀과 용량만 맞으면 등록이 막히지 않습니다.',
    desc: '큐넷 국가기술자격 원서접수 사진 규격 — 300×400px 이상, JPG, 200KB 이하. 공식 안내 확인값과 흔한 반려 사유, 폰으로 맞추는 법.',
    answer: [
      ['크기', '300 × 400px 이상', '3 × 4cm 기준'],
      ['형식', 'JPG (JPEG)', ''],
      ['용량', '200KB 이하', '접수 가이드 기준'],
      ['배경', '흰색', ''],
      ['촬영 시점', '최근 6개월 이내', ''],
    ],
    source: { name: '큐넷 원서접수·자격안내', url: 'https://www.q-net.or.kr' },
    checked: '2026년 9월',
    sourceNote:
      '공식 사이트 이용방법 안내(2025.12.17 갱신)에서 300×400px 이상·JPEG/JPG를 확인했습니다. 200KB 이하는 접수 가이드 기준이며 이용방법 페이지에는 명시돼 있지 않습니다 — 접수 시 공지로 한 번 더 확인하세요.',
    myth: {
      title: '"디지털로 만든 사진은 안 된다"는 오해',
      body: '큐넷이 부적합으로 드는 것은 <span class="wrong">인쇄물을 다시 촬영한 사진</span>입니다. <span class="right">디지털 편집 자체를 금지하지 않습니다.</span> 규격에 맞게 만든 디지털 파일과 흰 배경 처리는 문제가 되지 않습니다.',
    },
    rejects: [
      '용량 초과 — 300×400px로 잘라도 화질이 높으면 200KB를 넘긴다',
      '인쇄한 사진을 다시 찍어서 올림 (명시적 부적합 사유)',
      '배경에 그림자·무늬가 남아 단색으로 보이지 않음',
      '안경 반사나 눈가림으로 본인 식별이 어려움',
    ],
    faq: [
      ['큐넷 사진 용량은 몇 KB까지인가요?', '접수 가이드 기준 200KB 이하입니다. 300×400px로 크기를 맞춰도 화질이 높으면 이 값을 넘기기 쉬워, 업로드 단계에서 막히는 가장 흔한 원인입니다.'],
      ['큐넷 사진을 집에서 찍어도 되나요?', '됩니다. 밝은 곳에서 단색 벽을 등지고 정면으로 찍으면 충분합니다. 큐넷이 부적합으로 드는 것은 인쇄물을 다시 촬영한 사진이지 디지털 파일이 아닙니다.'],
      ['안경을 쓰고 찍어도 되나요?', '반사나 눈가림이 없으면 괜찮습니다. 조명이 렌즈에 비쳐 눈이 가려지면 본인 식별이 어려워 문제가 될 수 있습니다.'],
      ['큐넷과 KPC 자격 사진 규격이 같나요?', '다릅니다. KPC(ITQ·GTQ·SMAT 등)는 자체 규격을 쓰며 가로 115~235px·세로 150~315px, 500KB 이하입니다. 큐넷 규격을 그대로 올리면 크기 범위를 벗어납니다.'],
    ],
  },
  {
    slug: 'gosi',
    nav: '공무원',
    title: '공무원 원서 사진 규격 — 137×177px · 350KB 미만',
    h1: '공무원 채용 원서 사진 규격',
    lede: '국가공무원채용시스템에 올리는 사진 기준입니다. 널리 퍼진 100KB는 지금 기준이 아닙니다.',
    desc: '공무원 채용 원서접수 사진 규격 — 3.5×4.5cm(137×177px), JPG·PNG, 350KB 미만. 국가공무원채용시스템 공식 안내 확인값.',
    answer: [
      ['크기', '3.5 × 4.5cm', '137 × 177px 기준'],
      ['형식', 'JPG 또는 PNG', ''],
      ['용량', '350KB 미만', '중증장애인 선발시험 제외'],
      ['배경', '단색', '권장'],
      ['촬영 시점', '최근 6개월 이내', '권장'],
    ],
    source: { name: '국가공무원채용시스템 — 응시원서 제출 안내', url: 'https://gongmuwon.gosi.kr/oprut/AppApAplfSbmsnAplfRcptGd.do' },
    checked: '2026년 9월',
    sourceNote:
      '국가공무원채용시스템 원서접수 > 응시원서 제출 안내 원문에서 확인했습니다. 단색 배경·이마와 귀 노출·6개월 이내는 정부민원안내 기준의 권장 사항으로, 본인 식별이 명확하면 허용됩니다. 안경에 대한 별도 규정은 없습니다.',
    myth: {
      title: '검색에 도는 "100KB"는 폐기된 값입니다',
      body: '<span class="wrong">100KB</span>는 옛 사이버국가고시센터(gosi.kr)의 기준이었고, 그 사이트는 <b>2026년 4월 30일 종료</b>됐습니다. 지금 기준은 국가공무원채용시스템의 <span class="right">350KB 미만</span>입니다. 100KB에 맞추려고 화질을 과하게 낮출 이유가 없습니다.',
    },
    rejects: [
      '옛 기준(100KB)에 맞추느라 화질을 과하게 낮춤',
      '3.5×4.5cm가 아닌 3×4cm 일반 증명사진을 그대로 올림',
      '배경에 그림자가 남아 단색으로 보이지 않음',
      '얼굴이 작아 본인 식별이 어려움',
    ],
    faq: [
      ['공무원 원서 사진 용량은 몇 KB인가요?', '350KB 미만입니다(중증장애인 선발시험 제외). 검색에 자주 나오는 100KB는 2026년 4월 30일 종료된 옛 사이버국가고시센터 기준으로, 지금은 적용되지 않습니다.'],
      ['공무원 사진 크기는 3×4cm인가요 3.5×4.5cm인가요?', '3.5×4.5cm입니다. 픽셀로는 137×177px 기준입니다. 일반 증명사진(3×4cm)과 비율이 달라 그대로 올리면 맞지 않습니다.'],
      ['안경을 쓰고 찍어도 되나요?', '안경에 대한 별도 규정은 없습니다. 다만 반사나 눈가림으로 본인 식별이 어려워지면 문제가 될 수 있습니다.'],
      ['사진을 꼭 6개월 안에 찍어야 하나요?', '최근 6개월 이내는 권장 사항입니다. 본인 식별이 명확하면 허용됩니다. 다만 외모가 크게 달라졌다면 다시 찍는 편이 안전합니다.'],
    ],
  },
  {
    slug: 'toeic',
    nav: '토익',
    title: '토익 사진 규격 — 3×4cm · JPG · 머리 비율 80~90%',
    h1: '토익 · 토익스피킹 사진 규격',
    lede: 'YBM 접수에 올리는 사진 기준입니다. 토익에는 공식 픽셀 규정이 없습니다.',
    desc: '토익·토익스피킹(YBM) 접수 사진 규격 — 3×4cm, JPG, 6MB 이하, 정수리~턱 3.2~3.6cm. 공식 FAQ 확인값과 흔히 잘못 도는 옛 수치 정리.',
    answer: [
      ['크기', '3 × 4cm', '공식 픽셀 규정 없음'],
      ['머리 비율', '정수리~턱 3.2~3.6cm', '전체 높이의 80~90%'],
      ['형식', 'JPG', ''],
      ['용량', '6MB 이하', ''],
      ['배경', '흰색', ''],
      ['촬영 시점', '최근 6개월 이내', ''],
    ],
    source: { name: 'TOEIC 접수 (YBM)', url: 'https://www.toeic.co.kr' },
    checked: '2026년 9월',
    sourceNote:
      'm.toeic.co.kr 및 m.toeicswt.co.kr 고객센터 FAQ에서 확인했습니다. TOEIC과 TOEIC Speaking 기준이 동일합니다. 업로드 화면이 3:4 비율로 재단한 뒤 최대 300×400px로 저장하므로, 픽셀을 직접 맞출 필요는 없습니다.',
    myth: {
      title: '"115×150px · 500KB"는 10년 가까이 된 값입니다',
      body: '검색 상위에 도는 <span class="wrong">115×150px · 500KB</span>는 2016~2018년 블로그에서 퍼진 수치입니다. <span class="right">공식 FAQ에는 픽셀 규정이 없고, 용량 상한은 6MB입니다.</span> 픽셀을 억지로 맞추려다 얼굴이 작아지면 오히려 머리 비율(80~90%)을 못 맞춥니다.',
    },
    rejects: [
      '머리가 작아 정수리~턱 비율이 80%에 못 미침',
      '옛 블로그 수치(115×150px)에 맞추려다 화질이 뭉개짐',
      '귀가 머리카락에 가려짐 (두 귀가 보여야 함)',
      '배경이 흰색이 아니거나 그림자가 남음',
    ],
    faq: [
      ['토익 사진 픽셀 규격이 어떻게 되나요?', '공식 픽셀 규정이 없습니다. 3×4cm 비율과 머리 비율(정수리~턱 3.2~3.6cm)만 맞으면 됩니다. 업로드 화면이 3:4로 재단한 뒤 최대 300×400px로 저장합니다.'],
      ['토익 사진 용량은 몇 KB까지인가요?', '6MB 이하입니다. 검색에 자주 나오는 500KB는 2016~2018년 옛 값으로 공식 근거가 없습니다.'],
      ['토익스피킹도 같은 사진을 쓸 수 있나요?', '네. TOEIC과 TOEIC Speaking의 사진 기준이 동일합니다.'],
      ['머리 비율 80~90%는 어떻게 맞추나요?', '사진 전체 높이가 4cm일 때 정수리에서 턱까지가 3.2~3.6cm가 되도록 잡습니다. 일반 증명사진보다 얼굴이 크게 들어갑니다.'],
    ],
  },
  {
    slug: 'kpc',
    nav: 'KPC',
    title: 'ITQ·GTQ 사진 규격 — 225×300px · 500KB 이하 (KPC)',
    h1: 'KPC 자격 사진 규격 (ITQ · GTQ · SMAT)',
    lede: '한국생산성본부 자격 접수에 올리는 사진 기준입니다. 큐넷과 규격이 다릅니다.',
    desc: 'KPC 자격(ITQ·GTQ·SMAT 등) 접수 사진 규격 — 가로 115~235px·세로 150~315px, 500KB 이하, PNG 권장. 공식 사진 등록 규정 확인값.',
    answer: [
      ['크기', '가로 115~235px', '세로 150~315px'],
      ['권장 출력', '225 × 300px', '3 × 4cm · 300dpi 권장'],
      ['형식', 'PNG 권장', 'JPG · GIF 가능'],
      ['용량', '500KB 이하', ''],
      ['배경', '단색 (별도 배경 없음)', ''],
      ['촬영 시점', '최근 6개월 이내', ''],
    ],
    source: { name: 'KPC 자격 — 사진 등록 규정', url: 'https://license.kpc.or.kr/nasec/rceptexmncnfirm/orgrcept/selectAcceptPhotoRule.do' },
    checked: '2026년 9월',
    sourceNote:
      'KPC 자격 사진 등록 규정 페이지와 FAQ("사진 등록이 되지 않아요")에서 동일하게 확인했습니다. 컬러·정면 상반신(어깨까지), 모자 없이 정수리부터 턱까지 모두 보여야 합니다.',
    myth: {
      title: 'KPC는 큐넷 규격을 쓰지 않습니다',
      body: '자격증 사진이라고 해서 <span class="wrong">큐넷과 같은 300×400px</span>를 올리면 가로 상한(235px)을 넘겨 등록이 막힙니다. KPC는 <span class="right">가로 115~235px · 세로 150~315px</span>라는 자체 범위를 씁니다. 같은 "자격증 사진"이어도 기관마다 값이 다릅니다.',
    },
    rejects: [
      '큐넷 규격(300×400px)을 그대로 올려 가로 상한 초과',
      '용량 500KB 초과',
      '모자·머리카락으로 정수리나 턱이 가려짐',
      '배경에 무늬나 사물이 있어 단색이 아님',
    ],
    faq: [
      ['ITQ와 GTQ 사진 규격이 같나요?', '같습니다. 둘 다 한국생산성본부(KPC) 자격이라 사진 등록 규정이 동일합니다. SMAT 등 다른 KPC 자격도 같습니다.'],
      ['KPC 사진은 큐넷 사진을 그대로 써도 되나요?', '안 됩니다. 큐넷은 300×400px인데 KPC는 가로 상한이 235px입니다. 그대로 올리면 크기 범위를 벗어나 등록이 막힙니다.'],
      ['PNG로 올려야 하나요?', 'PNG가 권장이지만 JPG와 GIF도 가능합니다. 용량 500KB 이하만 지키면 됩니다.'],
      ['사진에 얼굴이 어디까지 나와야 하나요?', '모자 없이 정수리부터 턱까지 모두 보여야 하고, 어깨까지 나오는 정면 상반신이어야 합니다.'],
    ],
  },
]

const navLinks = (current) =>
  SPECS.filter((s) => s.slug !== current)
    .map((s) => `      <a href="/${s.slug}"><b>${esc(s.nav)}</b><span>${esc(s.answer[0][1])}</span></a>`)
    .join('\n')

const playSvg = `<svg viewBox="0 0 20 22" aria-hidden="true" fill="currentColor">
        <path d="M.7.6A1.7 1.7 0 0 0 .3 1.8v18.4c0 .5.2.9.4 1.2l.1.1L11 11.1v-.2L.8.6H.7Z"/>
        <path d="m14.4 14.5-3.4-3.4v-.2l3.4-3.4.1.1 4 2.3c1.2.7 1.2 1.8 0 2.4l-4 2.2Z"/>
        <path d="M14.5 14.4 11 11 .7 21.4c.4.4 1 .5 1.8.1l12-6.9Z"/>
        <path d="M14.5 7.6 2.5.7C1.7.3 1.1.3.7.7L11 11l3.5-3.4Z"/>
      </svg>`

function page(s) {
  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: s.faq.map(([q, a]) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  }

  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="robots" content="index, follow" />

<!-- 생성 파일 — 직접 고치지 말 것. scripts/make-spec-pages.mjs 를 고치고 다시 실행한다. -->

<title>${attr(s.title)} | Yei ID</title>
<meta name="description" content="${attr(s.desc)}" />
<link rel="canonical" href="${ORIGIN}/${s.slug}" />

<meta property="og:type" content="article" />
<meta property="og:site_name" content="Yei ID" />
<meta property="og:title" content="${attr(s.title)}" />
<meta property="og:description" content="${attr(s.desc)}" />
<meta property="og:url" content="${ORIGIN}/${s.slug}" />
<meta property="og:image" content="${ORIGIN}/icon-512.png" />
<meta name="twitter:card" content="summary" />

<link rel="icon" href="/icon-512.png" />
<link rel="stylesheet" href="/spec.css" />
</head>
<body>

<div class="top">
  <div class="wrap">
    <a href="/"><img src="/icon-512.png" alt="" width="24" height="24" /> Yei ID — 증명사진 규격 사전</a>
  </div>
</div>

<header class="page">
  <div class="wrap">
    <span class="kicker">${esc(s.nav)}</span>
    <h1>${esc(s.h1)}</h1>
    <p class="lede">${esc(s.lede)}</p>
  </div>
</header>

<main>
  <div class="wrap">
    <div class="answer">
      <dl>
${s.answer
  .map(
    ([k, v, note]) => `        <div>
          <dt>${esc(k)}</dt>
          <dd>${esc(v)}${note ? `<small>${esc(note)}</small>` : ''}</dd>
        </div>`,
  )
  .join('\n')}
      </dl>
    </div>
    <p class="stamp">
      <b>확인:</b> ${esc(s.checked)}
      <span>·</span>
      <b>출처:</b> <a href="${attr(s.source.url)}" rel="nofollow noopener" target="_blank">${esc(s.source.name)}</a>
    </p>
  </div>

  <section>
    <div class="wrap">
      <div class="myth">
        <h3>${s.myth.title}</h3>
        <p>${s.myth.body}</p>
      </div>
      <p class="sub" style="margin-top:16px">${esc(s.sourceNote)}</p>
    </div>
  </section>

  <section>
    <div class="wrap">
      <h2>등록이 막히는 흔한 이유</h2>
      <p class="sub">온라인 접수는 값이 조금만 어긋나도 업로드 단계에서 걸립니다.</p>
      <ul class="plain warn">
${s.rejects.map((r) => `        <li>${esc(r)}</li>`).join('\n')}
      </ul>
    </div>
  </section>

  <section>
    <div class="wrap">
      <h2>폰으로 맞추는 법</h2>
      <p class="sub">벽 앞에서 찍은 셀카 한 장이면 됩니다.</p>
      <ol class="steps">
        <li><b>밝은 곳에서 정면으로 찍기</b><br />단색 벽을 등지고, 얼굴에 그림자가 지지 않게 창을 마주 봅니다.</li>
        <li><b>Yei ID에서 «${esc(s.nav)}» 선택</b><br />크기·머리 비율·눈높이 가이드가 자동으로 잡힙니다.</li>
        <li><b>저장</b><br />${esc(s.answer[0][1])} 규격과 용량에 맞춘 파일이 갤러리에 저장됩니다. 그대로 업로드하세요.</li>
      </ol>

      <div class="cta-box">
        <a class="cta" href="${PLAY}">${playSvg} Google Play에서 받기</a>
        <p class="cta-note">처음 몇 장은 무료 · 광고 없음 · 사진은 기기 밖으로 나가지 않아요</p>
      </div>
    </div>
  </section>

  <section>
    <div class="wrap">
      <h2>자주 묻는 질문</h2>
${s.faq
  .map(
    ([q, a], i) => `      <details${i === 0 ? ' open' : ''}>
        <summary>${esc(q)}</summary>
        <p>${esc(a)}</p>
      </details>`,
  )
  .join('\n')}
    </div>
  </section>

  <section>
    <div class="wrap">
      <h2>다른 규격</h2>
      <div class="others">
${navLinks(s.slug)}
      </div>
      <p class="note" style="margin-top:20px">
        이 페이지는 각 기관의 공개 안내를 확인해 정리한 것이며, 최종 기준은 접수 시점의 해당 기관 공지입니다.
        규격은 기관·시점에 따라 달라질 수 있으니 제출 전 확인하시기 바랍니다.
        Yei ID는 정부·공공기관의 공인 서비스가 아닙니다.
      </p>
    </div>
  </section>
</main>

<footer>
  <div class="wrap">
    <div class="flinks">
      <a href="/">Yei ID</a>
      <a href="${PLAY}">Google Play</a>
      <a href="/privacy">개인정보처리방침</a>
      <a href="mailto:shhwang0424@gmail.com">문의</a>
    </div>
    <div>© 2026 Yei ID · 증명사진·여권사진 앱</div>
  </div>
</footer>

<script type="application/ld+json">
${JSON.stringify(faqLd, null, 2)}
</script>

</body>
</html>
`
}

for (const s of SPECS) {
  writeFileSync(out(`${s.slug}.html`), page(s), 'utf8')
  console.log(`${s.slug}.html 생성 — ${s.title}`)
}

// sitemap — 규격 페이지가 늘어나면 SPECS 에만 추가하면 여기도 따라온다
const today = new Date().toISOString().slice(0, 10)
const urls = [
  { loc: `${ORIGIN}/`, pri: '1.0' },
  ...SPECS.map((s) => ({ loc: `${ORIGIN}/${s.slug}`, pri: '0.8' })),
  { loc: `${ORIGIN}/privacy`, pri: '0.3' },
]
writeFileSync(
  out('sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${today}</lastmod>\n    <priority>${u.pri}</priority>\n  </url>`).join('\n')}
</urlset>
`,
  'utf8',
)
console.log(`sitemap.xml 생성 — ${urls.length}개 URL`)
