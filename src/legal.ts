// 개인정보처리방침 · 이용약관 본문 (Yei). 온디바이스 처리·무수집 기준.
// 연락처·시행일 실제 정보 반영됨. 공개 호스팅본은 프로젝트 루트 privacy.html (동일 내용 유지).

import { LANG } from './strings'

export type LegalDoc = {
  title: string
  updated: string
  sections: { h?: string; body: string; links?: { label: string; url: string }[] }[]
}

const CONTACT = 'shhwang0424@gmail.com'

const PRIVACY_KO: LegalDoc = {
  title: '개인정보처리방침',
  updated: '시행일: 2026년 6월 12일',
  sections: [
    {
      body: 'Yei(이하 "앱")는 이용자의 개인정보를 중요하게 생각하며 「개인정보 보호법」 등 관련 법령을 준수합니다. 앱은 사진을 기기 밖으로 전송하지 않고, 모든 편집을 이용자의 기기 내에서만 처리하는 것을 원칙으로 합니다.',
    },
    {
      h: '1. 사진의 처리 (핵심)',
      body: '이용자가 불러온 사진은 기기 내에서만 처리되며, 앱의 서버나 외부로 전송·수집·저장되지 않습니다. 크롭·규격 맞추기·밝기 보정·배경 처리 등 모든 작업은 기기에서 수행되고, 결과물은 이용자가 직접 저장하거나 공유할 때에만 기기 밖으로 나갑니다.',
    },
    {
      h: '2. 처리하는 정보',
      body:
        '앱은 회원가입·로그인이 없으며 이름·이메일 등 개인정보를 직접 수집하지 않습니다. 다만 아래 정보가 처리될 수 있습니다.\n\n' +
        '가. 기기 내 저장\n무료 다운로드 횟수, 구매(라이선스) 상태 — 이용자 기기에 로컬로 저장됩니다. 앱이 이를 별도 서버로 전송하지 않으나, 기기 설정에 따라 Android 자동 백업(이용자 본인의 Google 계정)에 포함될 수 있습니다.\n\n' +
        '나. 결제·구매 관리 (제3자 처리)\n유료 기능 결제는 Google Play 인앱결제가 처리하며, 구매 상태 확인·복원을 위해 RevenueCat을 이용합니다. 구매 여부와 관계없이 앱 실행 시 구매 상태 확인을 위해 익명 식별자, 기기 식별자, IP 주소, 국가, OS·앱 버전 등이 RevenueCat에 전송·처리될 수 있습니다. 앱은 카드번호 등 금융정보를 직접 수집·보관하지 않습니다.\n\n' +
        '다. 온디바이스 얼굴인식·인물분리 (Google ML Kit)\n얼굴 검출과 인물 분리(배경 제거)는 Google ML Kit 온디바이스 API로 기기 안에서 처리되며, 사진은 전송되지 않습니다. 다만 ML Kit SDK가 기기 메타데이터, 앱 식별자, 성능 진단 데이터를 Google에 전송할 수 있습니다.',
    },
    {
      h: '3. 제3자 제공 및 처리위탁',
      body:
        '결제·구매 관리와 온디바이스 이미지 처리를 위해 아래 사업자의 서비스를 이용합니다. 각 사의 처리방침을 참고하세요.\n' +
        '• Google LLC (Google Play 인앱결제)\n' +
        '• RevenueCat, Inc. (구매 상태 관리·복원)\n' +
        '• Google LLC (ML Kit 온디바이스 얼굴인식·인물분리 — 진단·사용 데이터)',
      links: [
        { label: 'Google 개인정보처리방침', url: 'https://policies.google.com/privacy' },
        { label: 'RevenueCat Privacy', url: 'https://www.revenuecat.com/privacy' },
        { label: 'ML Kit 데이터 공개', url: 'https://developers.google.com/ml-kit/android-data-disclosure' },
      ],
    },
    {
      h: '4. 보유 및 이용 기간',
      body: '기기 내 저장 정보는 앱 또는 앱 데이터 삭제 시 함께 삭제됩니다. 구매 관련 정보는 관련 법령 및 위 제3자 서비스의 정책에 따라 보관·관리됩니다.',
    },
    {
      h: '5. 이용자의 권리',
      body: '이용자는 기기 설정에서 앱 데이터를 삭제할 수 있으며, 구매 관련 정보의 열람·삭제 등은 아래 문의처로 요청할 수 있습니다.',
    },
    {
      h: '6. 아동의 개인정보',
      body: '앱은 만 14세 미만 아동을 주 대상으로 하지 않으며, 아동의 개인정보를 알면서 수집하지 않습니다.',
    },
    {
      h: '7. 문의처',
      body: `운영자 / 개인정보 보호책임자: 황성훈\n이메일: ${CONTACT}`,
    },
    {
      h: '8. 변경 고지',
      body: '본 방침이 변경되는 경우 변경 내용과 시행일을 앱 내 또는 공개 페이지를 통해 고지합니다.',
    },
  ],
}

// 자주 묻는 질문 — LegalDoc 형식 재사용 (h=질문, body=답변).
// 가격·무료횟수는 앱 실제 값(5회 · ₩4,900) 반영. 지원 규격은 현재 구현 기준.
const FAQ_KO: LegalDoc = {
  title: '자주 묻는 질문',
  updated: '',
  sections: [
    {
      h: '제 사진이 서버로 전송되나요? 개인정보는 안전한가요?',
      body: '아니요. Yei ID는 모든 편집을 기기 안에서만 처리합니다. 사진은 서버로 업로드되지 않고, 회원가입·로그인도 없어요. 사진 편집·저장은 인터넷 연결 없이도 작동합니다. (결제·구매 상태 확인 등에 네트워크가 사용됩니다 — 자세한 내용은 개인정보처리방침 참고.)',
    },
    {
      h: '이 앱으로 만든 사진이 꼭 통과되나요?',
      body: '규격(크기·머리 비율·배경·표정)에 맞게 만들어 통과 확률을 높여주지만, 최종 합격 여부는 발급 기관이 판단합니다. Yei ID는 정부 공인 앱이 아니며 합격을 보장하지 않아요. 제출 전 해당 기관의 규정을 확인하세요.',
    },
    {
      h: "여권 모드에선 왜 배경 교체·보정이 안 되나요?",
      body: '한국 여권은 배경 편집과 과도한 보정을 금지합니다(외교부 규정). 반려를 막기 위해 여권 모드에선 해당 기능을 꺼둡니다. 배경 교체·보정은 운전면허·일반 모드에서 사용할 수 있어요.',
    },
    {
      h: '어떤 규격을 지원하나요?',
      body: '여권, 운전면허증, 일반 증명사진을 지원합니다. (주민등록증·이력서 등 추가 규격과 직접 크기 지정 커스텀은 준비 중이에요.)',
    },
    {
      h: '무료로 몇 번 쓸 수 있나요? 요금은요?',
      body: '무료로 5회까지 저장할 수 있고, 이후엔 ₩4,900을 한 번만 결제하면 평생 무제한입니다. 구독이 아니라 1회 결제예요.',
    },
    {
      h: '기기를 바꾸거나 재설치하면 다시 결제해야 하나요?',
      body: "아니요. 구매는 구글 플레이 계정에 연결됩니다. 같은 계정이면 '구매 복원'으로 다시 살 필요 없이 복원돼요.",
    },
    {
      h: '사진 인화(출력)는 어떻게 하나요?',
      body: '완성한 사진을 저장하거나, 4×6 인화 시트(여러 장 배치)로 만들어 편의점 키오스크나 포토 프린터에서 저렴하게 뽑을 수 있어요.',
    },
    {
      h: '사진을 만든 뒤 신청은 어디서 하나요?',
      body:
        '신청은 정부 공식 사이트에서 진행하세요. Yei ID는 정부 기관과 제휴되어 있지 않으며, 아래는 참고용 링크입니다.\n\n' +
        '• 여권: 규정 확인은 외교부 여권안내, 온라인 신청은 정부24. 단, 생애 최초 여권은 시군구청 등 방문 접수만 가능합니다(전자여권 발급 이력이 있는 만 18세 이상만 온라인 신청 가능).\n' +
        '• 운전면허: 도로교통공단 안전운전 통합민원에서 갱신·재발급·적성검사를 신청할 수 있어요.\n' +
        '• 주민등록증 등 기타: 정부24.\n\n' +
        '※ 신분증 사진은 접수일 기준 6개월 이내에 촬영한 것을 사용하세요.',
      links: [
        { label: '외교부 여권안내', url: 'https://www.passport.go.kr' },
        { label: '정부24', url: 'https://www.gov.kr' },
        { label: '도로교통공단 안전운전 통합민원', url: 'https://www.safedriving.or.kr' },
      ],
    },
    {
      h: '배경 제거가 어색하거나 머리카락 경계가 이상해요.',
      body: '배경 분리는 기기에서 처리되며, 단순한 배경과 고른 조명에서 가장 깔끔하게 나옵니다. 복잡한 배경이나 잔머리에서는 경계가 완벽하지 않을 수 있어요. 가능하면 단색 벽 앞에서 촬영해 보세요.',
    },
    {
      h: '인터넷이 안 되는 곳에서도 쓸 수 있나요?',
      body: '네. 사진 편집·저장은 모두 기기 안에서 이뤄지므로 오프라인에서도 사용할 수 있어요. 결제와 구매 복원 시에만 인터넷이 필요합니다.',
    },
  ],
}

const TERMS_KO: LegalDoc = {
  title: '이용약관',
  updated: '시행일: 2026년 6월 2일',
  sections: [
    {
      h: '1. 서비스',
      body: 'Yei ID(이하 "앱")는 이용자가 사진을 규격(여권·운전면허·일반 증명사진 등)에 맞게 편집하고 저장하도록 돕는 도구입니다.',
    },
    {
      h: '2. 공인 여부 안내',
      body: '본 앱은 규격에 맞춘 사진 제작을 돕는 보조 도구이며, 정부·공공기관의 공인 서비스가 아닙니다. 사진의 심사 합격이나 규정 충족을 보장하지 않습니다. 최종 규격·규정은 여권·면허 등 발급 기관의 공식 안내를 반드시 확인하세요.',
    },
    {
      h: '3. 유료 서비스',
      body: '무료로 일정 횟수의 다운로드를 제공하며, 추가 이용은 일회성 영구 라이센스(₩4,900) 구매로 가능합니다. 결제 및 환불은 Google Play 정책을 따릅니다.',
    },
    {
      h: '4. 이용자의 책임',
      body: '이용자는 본인이 사용 권리를 가진 사진만 사용해야 하며, 결과물의 용도·제출에 대한 책임은 이용자에게 있습니다.',
    },
    {
      h: '5. 책임의 한계',
      body: '앱은 관련 법령이 허용하는 범위에서 결과물의 적합성·심사 결과 등에 대해 책임을 지지 않습니다.',
    },
    {
      h: '6. 약관 변경',
      body: '본 약관은 변경될 수 있으며, 변경 시 앱을 통해 고지합니다.',
    },
    {
      h: '7. 준거법',
      body: '본 약관은 대한민국 법률에 따릅니다.',
    },
  ],
}

// ── English (U.S.-context draft) ───────────────────────────────────────────
// ⚠️ 초안 — 법률 자문 아님. 미국 맥락 재작성(PIPA 인용 제거, COPPA 13세, CCPA 섹션 추가,
//    준거법 소비자보호 단서). 운영자 법적 이름·주소는 공개 범위 결정 후 보완. 공개 전 검토 권장.
const PRIVACY_EN: LegalDoc = {
  title: 'Privacy Policy',
  updated: 'Effective: June 12, 2026',
  sections: [
    {
      body: 'Yei ID ("the App") respects your privacy and complies with applicable data-protection laws. The App processes your photos entirely on your device and does not transmit them off your device.',
    },
    {
      h: '1. How your photos are handled (core)',
      body: 'Photos you load are processed only on your device. They are not sent to, collected by, or stored on our servers or any third party. Cropping, sizing, brightness adjustment, background processing, and all other editing happen on your device. A photo leaves your device only when you choose to save or share it.',
    },
    {
      h: '2. Information we process',
      body:
        'The App has no account or login and does not directly collect personal information such as your name or email. However, the following may be processed:\n\n' +
        'a. Stored on your device\nYour number of free downloads and your purchase (license) status are stored locally on your device. The App does not send these to a separate server, although depending on your device settings they may be included in Android automatic backup (your own Google account).\n\n' +
        'b. Payments and purchase management (third parties)\nPurchases are handled by Google Play in-app billing, and purchase-status checks and restores use RevenueCat. To verify purchase status when the App runs, an anonymous identifier, device identifier, IP address, country, and OS/app version may be sent to and processed by RevenueCat. The App does not directly collect or store financial information such as card numbers.\n\n' +
        'c. On-device face detection and person segmentation (Google ML Kit)\nFace detection and person segmentation (background removal) run on your device through Google ML Kit on-device APIs, and your photos are not transmitted. However, the ML Kit SDK may send device metadata, app identifiers, and performance diagnostics to Google.',
    },
    {
      h: '3. Third-party services',
      body:
        'We use the following providers for payment/purchase management and on-device image processing. Please refer to each provider’s privacy policy.\n' +
        '• Google LLC (Google Play in-app billing)\n' +
        '• RevenueCat, Inc. (purchase-status management and restore)\n' +
        '• Google LLC (ML Kit on-device face detection and segmentation — diagnostics and usage data)',
      links: [
        { label: 'Google Privacy Policy', url: 'https://policies.google.com/privacy' },
        { label: 'RevenueCat Privacy', url: 'https://www.revenuecat.com/privacy' },
        { label: 'ML Kit Data Disclosure', url: 'https://developers.google.com/ml-kit/android-data-disclosure' },
      ],
    },
    {
      h: '4. Retention',
      body: 'Information stored on your device is deleted when you delete the App or its data. Purchase-related information is retained and managed in accordance with applicable law and the policies of the third-party services above.',
    },
    {
      h: '5. Your choices',
      body: 'You can delete the App’s data through your device settings. For access to or deletion of purchase-related information, contact us using the details below.',
    },
    {
      h: '6. Children’s privacy',
      body: 'The App is not directed to children under 13, and we do not knowingly collect personal information from children. If you believe a child has provided information, contact us and we will address it.',
    },
    {
      h: '7. California privacy rights',
      body: 'The App processes photos only on your device and does not collect, sell, or share your personal information. Because we do not sell or share personal information, no "Do Not Sell or Share My Personal Information" option applies. California residents may contact us with any privacy questions or requests using the contact below.',
    },
    {
      h: '8. Contact',
      body: `Operator / privacy contact: Yei (individual developer)\nEmail: ${CONTACT}`,
    },
    {
      h: '9. Changes to this policy',
      body: 'If this policy changes, we will post the changes and their effective date within the App or on a public page.',
    },
  ],
}

const FAQ_EN: LegalDoc = {
  title: 'Frequently Asked Questions',
  updated: '',
  sections: [
    {
      h: 'Are my photos sent to a server? Is my privacy safe?',
      body: 'No. Yei ID does all editing on your device. Photos are not uploaded to a server, and there is no account or login. Editing and saving work even without an internet connection. (A network is used for payments and purchase-status checks — see the Privacy Policy for details.)',
    },
    {
      h: 'Will photos made with this app always be accepted?',
      body: 'The app helps you match the spec (size, head ratio, background, expression) to improve your chances, but the final decision is made by the issuing authority. Yei ID is not a government-certified app and does not guarantee acceptance. Check the relevant authority’s rules before you submit.',
    },
    {
      h: 'Why can’t I replace the background or retouch in passport mode?',
      body: 'Many passport and visa authorities — including the U.S. — prohibit background editing and heavy retouching and may reject altered photos. To help avoid rejection, these features are turned off in passport and other regulated modes. You can use background replacement and retouching in driver’s license and general modes.',
    },
    {
      h: 'Which specs are supported?',
      body: 'Passport, driver’s license, and general ID photos, plus international specs such as the United States (2×2 in) and Schengen. (More specs and custom sizing are in the works.)',
    },
    {
      h: 'How many times can I use it for free? What does it cost?',
      body: 'You can save up to 5 photos for free. After that, a one-time purchase unlocks unlimited use for life — it’s a single purchase, not a subscription. See the in-app price for your region.',
    },
    {
      h: 'Do I have to pay again if I change devices or reinstall?',
      body: 'No. Your purchase is tied to your Google Play account. On the same account, use "Restore purchase" to restore it without buying again.',
    },
    {
      h: 'How do I print the photo?',
      body: 'Save your finished photo, or make a 4×6 print sheet (several photos arranged together) and print it inexpensively at a photo printer or print shop.',
    },
    {
      h: 'Where do I apply after making the photo?',
      body:
        'Apply on the official government site. Yei ID is not affiliated with any government agency; the link below is for reference.\n\n' +
        '• U.S. passports: requirements and online renewal at travel.state.gov.\n' +
        '• For other countries or document types, check your local issuing authority.\n\n' +
        '※ Use a photo taken within 6 months of your application date.',
      links: [
        { label: 'U.S. Passports (travel.state.gov)', url: 'https://travel.state.gov/content/travel/en/passports.html' },
      ],
    },
    {
      h: 'Background removal looks off, or the hair edges look strange.',
      body: 'Background separation runs on your device and looks cleanest with a simple background and even lighting. With busy backgrounds or flyaway hair, the edges may not be perfect. If you can, shoot in front of a plain, solid-colored wall.',
    },
    {
      h: 'Can I use it where there’s no internet?',
      body: 'Yes. Editing and saving all happen on your device, so you can use it offline. An internet connection is only needed for purchases and restoring a purchase.',
    },
  ],
}

const TERMS_EN: LegalDoc = {
  title: 'Terms of Service',
  updated: 'Effective: June 2, 2026',
  sections: [
    {
      h: '1. Service',
      body: 'Yei ID ("the App") is a tool that helps you edit and save photos to match common specifications (passport, driver’s license, general ID photos, and more).',
    },
    {
      h: '2. Not an official service',
      body: 'The App is a supporting tool that helps you create spec-compliant photos. It is not an official government or public-agency service and does not guarantee that a photo will be accepted or meet requirements. Always check the official guidance of the issuing authority (passport, license, etc.) for the final specifications and rules.',
    },
    {
      h: '3. Paid service',
      body: 'A limited number of free downloads is provided; further use is available through a one-time, perpetual license purchase. Payments and refunds follow Google Play policies. See the in-app price for your region.',
    },
    {
      h: '4. Your responsibilities',
      body: 'You must use only photos you have the right to use, and you are responsible for how the output is used and submitted.',
    },
    {
      h: '5. Limitation of liability',
      body: 'To the extent permitted by applicable law, the App is not liable for the suitability of the output, the outcome of any review, or similar matters.',
    },
    {
      h: '6. Changes to these terms',
      body: 'These terms may change. We will give notice through the App when they do.',
    },
    {
      h: '7. Governing law',
      body: 'These terms are governed by the laws of the Republic of Korea, except where mandatory consumer-protection laws of your place of residence apply.',
    },
  ],
}

// 로케일 선택: 영어 기기 → 영문, 그 외 → 한국어. (소비 코드는 PRIVACY/TERMS/FAQ 그대로 사용.)
const EN = LANG === 'en'
export const PRIVACY: LegalDoc = EN ? PRIVACY_EN : PRIVACY_KO
export const FAQ: LegalDoc = EN ? FAQ_EN : FAQ_KO
export const TERMS: LegalDoc = EN ? TERMS_EN : TERMS_KO
