# Claude Code 프롬프트 — Yei ID 구현

> 아래 블록을 그대로 복사해 Claude Code에 붙여넣으세요. `[ ]` 부분만 본인 상황에 맞게 채우면 됩니다.

---

## 한 번에 붙여넣는 프롬프트

```
이 폴더(design_handoff_yellow_id)에는 "Yei ID"라는 한국 증명사진 앱의 디자인 레퍼런스가 들어있어.
README.md에 디자인 토큰·화면·인터랙션·상태·규격 데이터가 전부 정리돼 있어. design_files/ 의 HTML/JSX는
의도된 외형과 동작을 보여주는 프로토타입이지 그대로 쓸 프로덕션 코드가 아니야.

[내 코드베이스: 예) "React Native + Expo, TypeScript, 상태는 Zustand" / "아직 없음 — 추천해줘"]

할 일:
1. 먼저 README.md를 끝까지 읽고, design_files/styles/ds.css의 디자인 토큰과 app/*.jsx의 화면 구조를 파악해.
2. 이 디자인을 위 코드베이스 환경에서 그 환경의 패턴·라이브러리로 다시 구현해. HTML을 그대로 옮기지 말고
   네이티브하게 재현하되, 색상 hex·폰트·radius·shadow·간격·카피는 README 토큰 그대로 픽셀 단위로 맞춰.
3. 6개 화면(Landing, Upload, Editor, Result, Paywall, Settings)과 화면 전환을 먼저 더미 상태로 연결해.
4. 공통 컴포넌트(Button/Card/Badge/Segmented/Slider/Toggle/PrivacyBar)부터 토큰 기반으로 만들고 재사용해.
5. 상태 모델은 README의 photo / billing 구조를 따르고, 무료 5장 → 광고 시청(credits) → ₩4,900 평생
   광고제거(premium) 로직을 그대로 반영해.

반드시 지킬 것:
- "사진은 기기 밖으로 전송되지 않고 브라우저/기기에서만 처리됩니다" — 실제로도 온디바이스 처리로 구현.
- 여권 모드의 규정 경고 배너(무보정·무필터·흰 배경)와 뽀샤시 잠금.
- 규격 데이터(SPECS): 여권 35×45mm 413×531px@300DPI 얼굴70~80% 등 README 표 그대로.
- 설정의 "공인 아님 · 합격 보장 아님" 고지.
- 브랜드 원칙: 노랑은 CTA/채움에만 크게, 텍스트·아이콘은 잉크(#17161C). 노랑 위 흰 텍스트 금지,
  경고색은 코랄(#E8533A).

아직 구현하지 말고 먼저 (a) 선택한 기술스택과 폴더 구조, (b) 컴포넌트/화면 목록,
(c) 실제 기능(얼굴검출·크롭·배경분리·보정·규격 px 출력·인앱결제·보상형광고)에 쓸 라이브러리 후보를
제안해줘. 내가 확인하면 진행하자.
```

---

## 실제 기능 라이브러리 힌트 (스택 정해지면 참고)
- **이미지 크롭/리사이즈/규격 px 출력**: 웹 `Canvas`/`OffscreenCanvas`, RN `react-native-image-crop-picker` + `@shopify/react-native-skia`, Flutter `image` + `crop_your_image`.
- **얼굴 검출(정수리·턱선 자동 정렬)**: 웹 `@mediapipe/face_detection` 또는 `face-api.js`(전부 온디바이스),
  네이티브 `Google ML Kit Face Detection`(온디바이스).
- **배경 분리/교체**: `@mediapipe/selfie_segmentation`(온디바이스), 네이티브 ML Kit Subject Segmentation.
- **보정(밝기·노출·화이트밸런스·뽀샤시)**: 셰이더/Skia 필터 또는 Canvas 픽셀 처리.
- **인앱결제(₩4,900 평생, 비소모성)**: `RevenueCat` 또는 StoreKit/Google Play Billing.
- **보상형 광고**: `Google AdMob (react-native-google-mobile-ads / 네이티브 SDK)`.
- 온디바이스 원칙 유지: 사진 비트맵을 서버로 전송하지 말 것.

## Play Store 등록 자료 (store_assets/)
- `play-icon-512.png` — 앱 아이콘 512×512
- `feature-1024x500.png` — 피처 그래픽 1024×500
- `screenshot-1~3.png` — 스크린샷 9:16 (720×1280)
(앱 화면이 바뀌면 스크린샷은 새 화면으로 다시 캡처/합성 권장.)
