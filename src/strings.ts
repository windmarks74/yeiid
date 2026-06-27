// 다국어 문자열 + 경량 t() 헬퍼. i18n 라이브러리 없이 키맵 + 보간.
//   - 로케일 = 기기 언어 자동감지. 영어면 'en', 그 외는 'ko'(기본).
//   - 기존 한국 사용자/라이브 앱은 영향 0 (한국어 기기는 그대로 ko).
//   - 보간: 문자열에 {name} 형식을 쓰고 t(key, { name: ... }).
//   - 새 문자열은 STRINGS에 키를 추가하며 화면별로 점진 이행한다.

export type Lang = 'ko' | 'en'

function detectLang(): Lang {
  try {
    // 테스트/QA: URL에 ?lang=en 또는 ?lang=ko 로 강제 가능 (네이티브에선 보통 무효).
    const forced = new URLSearchParams(window.location.search).get('lang')
    if (forced === 'en' || forced === 'ko') return forced
    const l = (navigator.language || 'ko').toLowerCase()
    return l.startsWith('en') ? 'en' : 'ko'
  } catch {
    return 'ko'
  }
}

/** 앱 시작 시 1회 확정되는 현재 언어. */
export const LANG: Lang = detectLang()

// 키 → 언어별 문자열. ko는 항상 채우고(폴백), en은 점진적으로 채운다.
const STRINGS = {
  // 공통
  'common.errorPrefix': { ko: '오류: {msg}', en: 'Error: {msg}' },

  // 페이월 (Paywall) — 가격(₩) 표시는 결제·스토어 영역이라 별도 처리, 여기선 제외
  'paywall.close': { ko: '닫기', en: 'Close' },
  'paywall.title': { ko: '한 번 결제, 평생 무제한.', en: 'Pay once. Unlimited forever.' },
  'paywall.sub': {
    ko: '증명사진을 무제한으로 만들고 저장하세요.',
    en: 'Create and save ID photos without limits.',
  },
  'paywall.benefit.unlimited': { ko: '무제한 다운로드', en: 'Unlimited downloads' },
  'paywall.benefit.intl': { ko: '미국 등 해외 규격', en: 'International specs (US, etc.)' },
  'paywall.benefit.printsheet': { ko: '인화 시트 출력 (4×6)', en: 'Print sheet (4×6)' },
  'paywall.benefit.ondevice': {
    ko: '기기 내 처리 유지 (사진 전송 없음)',
    en: 'Stays on your device (no photo upload)',
  },
  'paywall.priceNote': { ko: '· 커피 한 잔 값, 평생 이용', en: '· One-time, yours forever' },
  'paywall.processing': { ko: '처리 중…', en: 'Processing…' },
  'paywall.buy': { ko: '평생 이용 시작', en: 'Get lifetime access' },
  'paywall.purchaseIncomplete': { ko: '구매가 완료되지 않았습니다.', en: 'Purchase was not completed.' },
  'paywall.restore': { ko: '구매 복원', en: 'Restore purchase' },
  'paywall.noRestore': { ko: '복원할 구매 내역이 없습니다.', en: 'No purchases to restore.' },
  'paywall.later': { ko: '나중에', en: 'Later' },

  // 작은 컴포넌트 — ErrorBoundary / 배경색 / Cropper / iap 에러
  'error.title': { ko: '문제가 발생했어요', en: 'Something went wrong' },
  'error.body': { ko: '일시적인 오류로 화면을 표시할 수 없습니다. 처음 화면으로 돌아가 다시 시도해 주세요.', en: 'A temporary error stopped this screen from loading. Go back to the start and try again.' },
  'error.back': { ko: '처음으로 돌아가기', en: 'Back to start' },

  'bgcolor.white': { ko: '흰색', en: 'White' },
  'bgcolor.blue': { ko: '연하늘', en: 'Light blue' },
  'bgcolor.gray': { ko: '회색', en: 'Gray' },

  'cropper.zoom': { ko: '확대', en: 'Zoom' },
  'cropper.rotate': { ko: '회전', en: 'Rotate' },
  'cropper.rotate90': { ko: '90° 회전', en: 'Rotate 90°' },
  'cropper.tilt': { ko: '기울기', en: 'Tilt' },
  'cropper.tiltReset': { ko: '기울기 초기화', en: 'Reset tilt' },
  'cropper.tiltMinus': { ko: '기울기 -0.5도', en: 'Tilt -0.5°' },
  'cropper.tiltPlus': { ko: '기울기 +0.5도', en: 'Tilt +0.5°' },
  'cropper.processing': { ko: '처리 중…', en: 'Processing…' },
  'cropper.crown': { ko: '정수리', en: 'Crown' },
  'cropper.chin': { ko: '턱선 (머리 {min}~{max}%)', en: 'Chin (head {min}–{max}%)' },
  'cropper.eye': { ko: '눈높이', en: 'Eye level' },

  'iap.noKey': { ko: 'RevenueCat API 키가 설정되지 않았습니다. (src/iap.ts의 RC_API_KEY)', en: 'RevenueCat API key is not set. (RC_API_KEY in src/iap.ts)' },
  'iap.noProduct': { ko: '판매 상품을 불러오지 못했습니다. (RevenueCat 오퍼링/상품 설정 확인)', en: 'Could not load the product for sale. (Check RevenueCat offerings/product setup)' },

  // 규격 (usage.ts) — label · notice · applyLabel
  'usage.passport.label': { ko: '여권', en: 'Passport' },
  'usage.passport.notice.title': { ko: '여권 사진은 무보정·무필터가 원칙입니다.', en: 'Passport photos must be unretouched and unfiltered.' },
  'usage.passport.notice.b1': { ko: '배경 제거·교체, 과도한 보정(뽀샤시·피부 미백·눈 키우기 등)은 반려 사유입니다.', en: 'Background removal/replacement and heavy edits (smoothing, skin whitening, eye enlargement, etc.) are grounds for rejection.' },
  'usage.passport.notice.b2': { ko: '원래 피부톤을 그대로 표현해야 합니다.', en: 'Your natural skin tone must be preserved.' },
  'usage.passport.notice.b3': { ko: '권장: 크롭·규격·용량 맞추기 + 피부톤을 왜곡하지 않는 가벼운 밝기·노출·화이트밸런스까지.', en: 'Recommended: crop, sizing, and file-size adjustment, plus light brightness, exposure, and white-balance tweaks that do not distort skin tone.' },

  'usage.license.label': { ko: '운전면허증', en: "Driver's license" },

  'usage.general.label': { ko: '일반', en: 'General' },

  'usage.us.label': { ko: '미국', en: 'United States' },
  'usage.us.notice.title': { ko: '미국 비자·여권 사진은 원본 그대로여야 합니다.', en: 'U.S. visa and passport photos must be unaltered originals.' },
  'usage.us.notice.b1': { ko: 'AI·앱·필터로 편집한 사진은 반려됩니다 (미 국무부가 변조 사진을 검출).', en: 'Photos edited with AI, apps, or filters will be rejected (the U.S. State Department detects altered photos).' },
  'usage.us.notice.b2': { ko: '순백·오프화이트 배경, 그림자 없이 균일하게 — 흰 벽 앞에서 촬영하세요.', en: 'Use a plain white or off-white background, evenly lit with no shadows — shoot against a white wall.' },
  'usage.us.notice.b3': { ko: '안경 불가(의료 예외만), 정면·중립 표정, 최근 6개월 이내 촬영.', en: 'No glasses (medical exceptions only), face forward with a neutral expression, taken within the last 6 months.' },
  'usage.us.notice.b4': { ko: '권장: 크롭·규격·용량 맞추기 + 피부톤을 왜곡하지 않는 가벼운 밝기·노출까지.', en: 'Recommended: crop, sizing, and file-size adjustment, plus light brightness and exposure tweaks that do not distort skin tone.' },

  'usage.schengen.label': { ko: '셰겐', en: 'Schengen' },
  'usage.schengen.notice.title': { ko: '셰겐(유럽) 비자·여권 사진 규정입니다.', en: 'Requirements for Schengen (Europe) visa and passport photos.' },
  'usage.schengen.notice.b1': { ko: 'AI·앱·필터로 보정한 사진은 반려될 수 있습니다 — 원본 그대로 제출하세요.', en: 'Photos retouched with AI, apps, or filters may be rejected — submit the unaltered original.' },
  'usage.schengen.notice.b2': { ko: '흰색(가장 안전) 또는 밝은 회색 배경, 그림자 없이 균일하게 — 밝은 벽 앞에서 촬영.', en: 'Use a white (safest) or light-gray background, evenly lit with no shadows — shoot against a light-colored wall.' },
  'usage.schengen.notice.b3': { ko: '정면·중립 표정, 두 눈 또렷이, 최근 6개월 이내. 안경은 반사·눈가림 없을 때만.', en: 'Face forward with a neutral expression, both eyes clearly visible, taken within the last 6 months. Glasses only if there is no glare or eye obstruction.' },
  'usage.schengen.notice.b4': { ko: '권장: 크롭·규격·용량 맞추기 + 피부톤을 왜곡하지 않는 가벼운 밝기·노출까지.', en: 'Recommended: crop, sizing, and file-size adjustment, plus light brightness and exposure tweaks that do not distort skin tone.' },

  'usage.qnet.label': { ko: '큐넷', en: 'Q-Net' },
  'usage.qnet.notice.title': { ko: '큐넷(국가기술·전문자격) 사진 안내', en: '큐넷(국가기술·전문자격) 사진 안내' },
  'usage.qnet.notice.b1': { ko: '흰색 배경, 정면·상반신, 최근 6개월 이내 촬영.', en: '흰색 배경, 정면·상반신, 최근 6개월 이내 촬영.' },
  'usage.qnet.notice.b2': { ko: '안경은 반사·눈가림 없이(권고). 과도한 보정은 피하세요.', en: '안경은 반사·눈가림 없이(권고). 과도한 보정은 피하세요.' },
  'usage.qnet.notice.b3': { ko: '디지털 업로드는 JPG · 300×400px · 용량 자동 200KB 이하 맞춤.', en: '디지털 업로드는 JPG · 300×400px · 용량 자동 200KB 이하 맞춤.' },
  'usage.qnet.notice.b4': { ko: '※ 규격은 접수 시 큐넷 공지 기준으로 최종 확인하세요.', en: '※ 규격은 접수 시 큐넷 공지 기준으로 최종 확인하세요.' },

  'usage.kpc.label': { ko: 'KPC', en: 'KPC' },
  'usage.kpc.notice.title': { ko: 'KPC 자격(ITQ·GTQ·SMAT 등) 사진 안내', en: 'KPC 자격(ITQ·GTQ·SMAT 등) 사진 안내' },
  'usage.kpc.notice.b1': { ko: '흰색 배경, 정면·상반신, 최근 6개월 이내 촬영.', en: '흰색 배경, 정면·상반신, 최근 6개월 이내 촬영.' },
  'usage.kpc.notice.b2': { ko: '안경은 반사·눈가림 없이(권고). 과도한 보정은 피하세요.', en: '안경은 반사·눈가림 없이(권고). 과도한 보정은 피하세요.' },
  'usage.kpc.notice.b3': { ko: '디지털 업로드는 JPG · 자동 용량 맞춤(≤200KB).', en: '디지털 업로드는 JPG · 자동 용량 맞춤(≤200KB).' },
  'usage.kpc.notice.b4': { ko: '※ 디지털 규격이 변동될 수 있어 접수 페이지에서 확인하세요.', en: '※ 디지털 규격이 변동될 수 있어 접수 페이지에서 확인하세요.' },

  'usage.gosi.label': { ko: '공무원', en: 'Civil service' },
  'usage.gosi.notice.title': { ko: '공무원 채용(사이버국가고시센터) 사진 안내', en: '공무원 채용(사이버국가고시센터) 사진 안내' },
  'usage.gosi.notice.b1': { ko: '흰색 배경, 정면·상반신, 최근 6개월 이내 촬영.', en: '흰색 배경, 정면·상반신, 최근 6개월 이내 촬영.' },
  'usage.gosi.notice.b2': { ko: '안경은 반사·눈가림 없이(권고).', en: '안경은 반사·눈가림 없이(권고).' },
  'usage.gosi.notice.b3': { ko: '디지털 업로드는 JPG/PNG · 137×177px · 자동 100KB 이하 맞춤.', en: '디지털 업로드는 JPG/PNG · 137×177px · 자동 100KB 이하 맞춤.' },
  'usage.gosi.notice.b4': { ko: '※ 시간선택제·중증장애인 선발 등 일부 전형은 용량 기준이 다를 수 있어요.', en: '※ 시간선택제·중증장애인 선발 등 일부 전형은 용량 기준이 다를 수 있어요.' },

  'usage.toeic.label': { ko: '토익', en: 'TOEIC' },
  'usage.toeic.notice.title': { ko: 'TOEIC / TOEIC Speaking(YBM) 사진 안내', en: 'TOEIC / TOEIC Speaking(YBM) 사진 안내' },
  'usage.toeic.notice.b1': { ko: '흰색 배경, 정면, 두 귀가 보이게 어깨까지, 최근 6개월 이내.', en: '흰색 배경, 정면, 두 귀가 보이게 어깨까지, 최근 6개월 이내.' },
  'usage.toeic.notice.b2': { ko: '안경은 반사·눈가림 없이(권고). 과도한 보정은 피하세요.', en: '안경은 반사·눈가림 없이(권고). 과도한 보정은 피하세요.' },
  'usage.toeic.notice.b3': { ko: '디지털 업로드는 JPG · 자동 용량 맞춤.', en: '디지털 업로드는 JPG · 자동 용량 맞춤.' },
  'usage.toeic.notice.b4': { ko: '※ 용량 기준이 변동될 수 있어 접수 페이지에서 확인하세요.', en: '※ 용량 기준이 변동될 수 있어 접수 페이지에서 확인하세요.' },

  'usage.passport.applyLabel': { ko: '여권 신청·안내 (외교부)', en: 'Passport application & info (MOFA)' },
  'usage.license.applyLabel': { ko: '운전면허 민원 (도로교통공단)', en: "Driver's license services (KoROAD)" },
  'usage.us.applyLabel': { ko: '미국 여권·비자 사진 안내 (미 국무부)', en: 'U.S. passport & visa photo guide (U.S. State Dept.)' },
  'usage.qnet.applyLabel': { ko: '큐넷 원서접수·자격안내', en: '큐넷 원서접수·자격안내' },
  'usage.kpc.applyLabel': { ko: 'KPC 자격 접수·안내', en: 'KPC 자격 접수·안내' },
  'usage.gosi.applyLabel': { ko: '국가공무원채용시스템', en: '국가공무원채용시스템' },
  'usage.toeic.applyLabel': { ko: 'TOEIC 접수 (YBM)', en: 'TOEIC registration (YBM)' },

  // App.tsx — 화면 전반
  'app.loadingPhoto': { ko: '사진 불러오는 중…', en: 'Loading photo…' },
  'app.loadPhotoFailed': { ko: '사진을 불러오지 못했습니다: {msg}', en: 'Couldn’t load the photo: {msg}' },
  'app.bgRemovalFailed': { ko: '배경 제거 실패: {msg}', en: 'Background removal failed: {msg}' },
  'app.restoreSuccess': { ko: '구매가 복원되었습니다', en: 'Purchase restored' },
  'app.restoreNone': { ko: '복원할 구매 내역이 없습니다', en: 'No purchases to restore' },
  'app.restoreFailed': { ko: '복원 실패: {msg}', en: 'Restore failed: {msg}' },
  'app.previewFailed': { ko: '미리보기 생성 실패: {msg}', en: 'Couldn’t create preview: {msg}' },
  'app.exportFailed': { ko: '내보내기 실패: {msg}', en: 'Export failed: {msg}' },
  'app.saveFailed': { ko: '저장 실패: {msg}', en: 'Save failed: {msg}' },
  'app.saved': { ko: '저장되었습니다', en: 'Saved' },

  'app.back': { ko: '뒤로', en: 'Back' },
  'app.settings': { ko: '설정', en: 'Settings' },
  'app.editTitle': { ko: '편집', en: 'Edit' },
  'app.doneTitle': { ko: '완성', en: 'Done' },
  'app.settingsTitle': { ko: '설정 · 소개', en: 'Settings & About' },

  'app.digitalSpec': { ko: '디지털 {w}×{h}px · ≤{kb}KB · {fmt} 자동 맞춤', en: 'Digital {w}×{h}px · ≤{kb}KB · {fmt}, auto-fit' },
  'app.printSpec': { ko: '{w} × {h}px · {dpi}DPI · 얼굴 {faceMin}~{faceMax}%', en: '{w} × {h}px · {dpi}DPI · face {faceMin}–{faceMax}%' },

  'app.importPhoto': { ko: '사진 가져오기', en: 'Import photo' },
  'app.separatingBg': { ko: '배경 분리 중…', en: 'Separating background…' },

  'app.tabAdjust': { ko: '보정', en: 'Adjust' },
  'app.tabEffects': { ko: '배경·효과', en: 'Background' },
  'app.tabOutput': { ko: '출력', en: 'Output' },

  'app.anotherPhoto': { ko: '다른 사진', en: 'Another photo' },
  'app.donePreview': { ko: '완료 · 미리보기', en: 'Done · Preview' },

  'app.resultAlt': { ko: '결과 미리보기', en: 'Result preview' },
  'app.rendering': { ko: '렌더링 중…', en: 'Rendering…' },

  'app.singlePhoto': { ko: '증명사진 1매', en: 'Single photo' },
  'app.printSheet': { ko: '인화 시트 ({count}매)', en: 'Print sheet ({count})' },

  'app.checkSpec': { ko: '{label} 규격', en: '{label} spec' },
  'app.checkDigital': { ko: '{w}×{h}px · {fmt} · ≤{kb}KB 자동', en: '{w}×{h}px · {fmt} · ≤{kb}KB auto' },
  'app.checkPrint': { ko: '{w}×{h}px @{dpi}DPI', en: '{w}×{h}px @{dpi}DPI' },
  'app.checkAutoFit': { ko: '규격·여백 자동 보정', en: 'Spec & margins auto-fit' },
  'app.checkOnDevice': { ko: '기기 안에서만 처리', en: 'Processed only on your device' },
  'app.checkFileSize': { ko: '파일 {size}', en: 'File {size}' },
  'app.checkRegulatedWarn': { ko: '6개월 이내 촬영 · AI 편집·필터 사진은 반려될 수 있어요', en: 'Taken within 6 months · AI-edited or filtered photos may be rejected' },

  'app.upsellOverseas': { ko: '해외 규격은 평생 이용 전용이에요.', en: 'International specs are lifetime-only.' },
  'app.upsellSheet': { ko: '인화 시트는 평생 이용 전용이에요.', en: 'Print sheets are lifetime-only.' },
  'app.unlockLifetime': { ko: '평생 이용으로 잠금 해제', en: 'Unlock with lifetime' },
  'app.upsellFreeUsedUp': { ko: '무료 5장을 모두 받았어요. 더 받으시겠어요?', en: 'You’ve used all 5 free downloads. Want more?' },
  'app.lifetimeUnlimited': { ko: '평생 무제한', en: 'Lifetime, unlimited' },

  'app.download': { ko: '다운로드', en: 'Download' },
  'app.downloadFree': { ko: '무료로 다운로드', en: 'Download free' },
  'app.downloadFreeLeft': { ko: '무료로 다운로드 ({n}회 남음)', en: 'Download free ({n} left)' },
  'app.billingCaption': { ko: '무료 5장 제공 · 추가는 {price} 평생', en: '5 free downloads · more for {price}, lifetime' },

  'app.savedToGallery': { ko: '갤러리에 저장됨', en: 'Saved to your gallery' },
  'app.applyCta': { ko: '신청하러 가기 →', en: 'Go apply →' },
  'app.applyNote': { ko: '{label} · 참고 링크 · 정부 제휴 아님', en: '{label} · reference link · not government-affiliated' },

  'app.privacyHeroTitle': { ko: '사진은 기기를 떠나지 않아요', en: 'Your photos never leave your device' },
  'app.privacyHeroBody': { ko: '모든 편집은 기기 안에서만 처리되며, 어떤 사진도 서버로 전송·저장되지 않습니다.', en: 'All editing happens on your device — no photo is ever uploaded or stored on a server.' },

  'app.sectionPlan': { ko: '플랜', en: 'Plan' },
  'app.planPremiumTitle': { ko: '평생 무제한', en: 'Lifetime, unlimited' },
  'app.planFreeTitle': { ko: '무료 플랜', en: 'Free plan' },
  'app.planPremiumDesc': { ko: '평생 이용 중', en: 'Lifetime access active' },
  'app.planFreeDesc': { ko: '무료 {n}장 남음 · 추가는 {price} 평생', en: '{n} free left · more for {price}, lifetime' },
  'app.upgrade': { ko: '업그레이드', en: 'Upgrade' },

  'app.sectionLegal': { ko: '약관 · 정보', en: 'Terms & info' },
  'app.privacyPolicy': { ko: '개인정보처리방침', en: 'Privacy policy' },
  'app.terms': { ko: '이용약관', en: 'Terms of service' },
  'app.faq': { ko: '자주 묻는 질문', en: 'FAQ' },
  'app.restorePurchase': { ko: '구매 복원', en: 'Restore purchase' },

  'app.disclaimerTitle': { ko: '공인 서비스가 아닙니다', en: 'Not an official service' },
  'app.disclaimerBody': { ko: '본 앱은 규격에 맞춘 사진 제작을 돕는 도구이며, 정부·공공기관의 공인 서비스가 아닙니다. 심사 합격을 보장하지 않으니 최종 규정은 발급 기관 안내를 확인하세요.', en: 'This app is a tool that helps you make spec-compliant photos. It is not an official government or public-agency service and does not guarantee approval — always check the issuing authority’s rules for the final requirements.' },
  'app.footerVersion': { ko: 'Yei ID · 버전 {version}', en: 'Yei ID · version {version}' },

  'app.adjustTitle': { ko: '가벼운 보정', en: 'Light adjustments' },
  'app.reset': { ko: '초기화', en: 'Reset' },
  'app.exposure': { ko: '노출', en: 'Exposure' },
  'app.brightness': { ko: '밝기', en: 'Brightness' },
  'app.whiteBalance': { ko: '화이트밸런스', en: 'White balance' },
  'app.adjustHint': { ko: '피부톤을 왜곡하지 않는 선에서 사용하세요. (여권 허용 범위)', en: 'Use lightly so skin tone isn’t distorted. (Within passport limits)' },

  'app.effectsTitle': { ko: '배경 · 효과', en: 'Background & effects' },
  'app.background': { ko: '배경', en: 'Background' },
  'app.originalBg': { ko: '원본 배경', en: 'Original background' },
  'app.bgNone': { ko: '없음', en: 'None' },
  'app.modelQuality': { ko: '모델 품질', en: 'Model quality' },
  'app.modelFast': { ko: '빠름', en: 'Fast' },
  'app.modelHighQuality': { ko: '고품질', en: 'High quality' },
  'app.separatingBgProgress': { ko: '배경 분리 중… {progress}', en: 'Separating background… {progress}' },
  'app.justAMoment': { ko: '잠시만요', en: 'just a moment' },
  'app.glow': { ko: '뽀샤시', en: 'Glow' },
  'app.smooth': { ko: '잡티 완화', en: 'Skin smoothing' },
  'app.analyzingFace': { ko: '얼굴 분석 중… 잠시만요', en: 'Analyzing face… just a moment' },
  'app.bgRestrictedPre': { ko: '이 규격은 규정상', en: 'For this spec, rules restrict' },
  'app.bgRestrictedBold': { ko: '배경 교체·보정', en: 'background replacement & retouching' },
  'app.bgRestrictedPost': { ko: '이 제한됩니다. 흰색 배경 앞에서 촬영하세요.', en: '. Shoot in front of a white background.' },

  'app.outputTitle': { ko: '출력 (JPEG)', en: 'Output (JPEG)' },
  'app.fitTargetSize': { ko: '목표 용량 맞추기', en: 'Fit to target size' },
  'app.targetSize': { ko: '목표 용량', en: 'Target size' },
  'app.kbOrLess': { ko: 'KB 이하', en: 'KB or less' },
  'app.outputSizeLabel': { ko: '결과 용량:', en: 'Output size:' },
  'app.calculating': { ko: '계산 중…', en: 'Calculating…' },
  'app.qualityPct': { ko: '(품질 {pct}%)', en: '(quality {pct}%)' },
  'app.overTarget': { ko: '— 목표보다 큼: 규격이 커서 최저 품질로도 초과', en: '— over target: the spec is large enough to exceed it even at lowest quality' },

  'app.headlineLine1': { ko: '집에서 가볍고 산뜻하게,', en: 'Crisp and easy, right at home —' },
  'app.headlineLine2': { ko: '규격에 딱 맞는', en: 'perfectly sized' },
  'app.headlineMark': { ko: '증명사진', en: 'ID photos' },
  'app.landingSub': { ko: '여권 · 운전면허 · 자격증 · 일반 증명사진을 사진관 없이. 업로드한 사진은 서버로 전송되지 않습니다.', en: 'Passport, driver’s license, certification, and general ID photos — no studio needed. Your photos are never uploaded to a server.' },
  'app.uploadPhoto': { ko: '사진 올리기', en: 'Upload photo' },
  'app.takePhoto': { ko: '카메라로 촬영', en: 'Take a photo' },
  'app.landingPrivacy': { ko: '프라이버시 보장 — 사진은 기기 밖으로 나가지 않아요', en: 'Privacy guaranteed — your photos never leave your device' },
  'app.landingCap': { ko: '무료로 5장 다운로드 · 가입 없이 바로 시작', en: '5 free downloads · start right away, no sign-up' },

  'app.tipsTitle': { ko: '잘 나오는 팁', en: 'Tips for a great shot' },
  'app.tipLighting': { ko: '밝고 균일한 조명에서 촬영', en: 'Shoot in bright, even lighting' },
  'app.tipBackground': { ko: '벽 등 단색 배경 앞에 서기', en: 'Stand in front of a plain background, like a wall' },
  'app.tipPose': { ko: '정면을 보고 어깨가 보이게', en: 'Face forward with your shoulders visible' },
  'app.tipSmooth': { ko: '잡티 살짝 완화하면 인상이 산뜻·젊어 보여요', en: 'A touch of skin smoothing makes you look fresher and younger' },

  'app.specBadge': { ko: '{label} 규격', en: '{label} spec' },
  'app.docTitle': { ko: '증명사진 만들기 — 여권·운전면허·자격증', en: 'Yei — ID & Passport Photo Maker' },

  // 배경 진행(bg.ts) · 이미지 에러(imageUtils.ts)
  'bgprogress.separating': { ko: '배경 분리 중…', en: 'Separating background…' },
  'bgprogress.refining': { ko: '가장자리 정제 중…', en: 'Refining edges…' },
  'bgprogress.preparingModel': { ko: '모델 준비', en: 'Preparing model' },
  'bgprogress.processing': { ko: '처리', en: 'Processing' },

  'img.cannotLoad': { ko: '이미지를 불러올 수 없습니다.', en: 'Couldn’t load the image.' },
  'img.cannotRead': { ko: '이미지를 읽을 수 없습니다.', en: 'Couldn’t read the image.' },
  'img.exportFailed': { ko: '내보내기 실패', en: 'Export failed' },
  'img.sheetCount': { ko: '{count}장', en: '{count} photos' },
} satisfies Record<string, Record<Lang, string>>

export type StringKey = keyof typeof STRINGS

/** 키 → 현재 언어 문자열. en 미작성 시 ko로 폴백. params로 {name} 보간(누락값은 빈 문자열). */
export function t(
  key: StringKey,
  params?: Record<string, string | number | undefined>,
): string {
  const entry = STRINGS[key]
  let s: string = entry[LANG] ?? entry.ko
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      s = s.split(`{${k}}`).join(v == null ? '' : String(v))
    }
  }
  return s
}
