# 인앱결제(IAP) 설정 — RevenueCat + 구글 플레이

코드는 이미 연동돼 있습니다(`src/iap.ts`, `src/Paywall.tsx`, `src/billing.ts`).
**실제 ₩4,900 구매를 테스트하려면 아래 수동 설정이 필요**합니다. 코드만으론 테스트 불가합니다.

> ⚠️ 핵심 제약: 구글 플레이 결제는 (1) 앱이 **플레이 트랙(내부 테스트)에 업로드**돼 상품이 존재하고,
> (2) 폰에 설치된 앱의 **서명키가 업로드본과 일치**해야 동작합니다.
> **USB 디버그 설치(sideload)로는 결제가 안 됩니다** — 내부 테스트 링크로 설치해야 합니다.

---

## A. 서명된 AAB — ✅ 이미 생성됨 (Claude가 처리)

키스토어 생성 + Gradle 서명 + 모델 제외 + **서명된 AAB 빌드**까지 완료했습니다.

- **AAB 파일**: `android/app/build/outputs/bundle/release/app-release.aab` (약 14MB)
- **업로드 키스토어**: `android/yei-upload.keystore` · 별칭 `yei`
- **비밀번호**: `android/keystore.properties` 안에 있음 (storePassword/keyPassword)

> 🔐 **반드시 백업**: `android/yei-upload.keystore` 파일과 `android/keystore.properties`(비밀번호)를
> 안전한 곳(USB·비밀번호 관리자 등)에 복사해 두세요. (단, Play App Signing 사용 시 업로드 키는
> 분실해도 구글에서 재설정 가능 — 콘솔 업로드 때 Play App Signing을 그대로 수락하세요.)

**다시 빌드해야 할 때(예: RevenueCat 키 입력 후)** — 이 두 줄이면 됩니다:
```
npm run sync:android      # 웹 빌드 + 모바일용 모델 제외 + 안드로이드 동기화
cd android && ./gradlew bundleRelease   # (Windows: .\gradlew.bat bundleRelease)
```
> 모바일은 배경제거가 PC 전용이라 `sync:android`가 모델(300MB)을 자동 제외 → AAB가 작아 업로드 한도를 통과합니다.

## B. 플레이 콘솔 — 앱 + 내부 테스트

1. [Play Console](https://play.google.com/console) → **앱 만들기** (이름: Yei, 무료, 앱)
2. 패키지명은 첫 AAB 업로드로 자동 고정됨 → **`com.yei.idphoto`** (변경 불가, 이미 코드에 설정됨)
3. **테스트 → 내부 테스트 → 새 버전 만들기** → A에서 만든 **AAB 업로드**
   - (내부 테스트는 프로덕션의 12명/14일 요건 없이 바로 가능)
4. **테스터** 탭에 본인 구글 계정 이메일 추가 → **참여 링크(opt-in URL)** 확보

## C. 플레이 콘솔 — 인앱 상품

> 상품 생성은 **AAB가 한 번 업로드된 뒤** 가능합니다.

1. **수익 창출 → 제품 → 인앱 상품 → 상품 만들기**
2. **상품 ID: `yei_lifetime`** (← `src/iap.ts`의 `PRODUCT_ID`와 반드시 동일)
3. 유형: **일회성(non-consumable / managed product)**
4. 이름/설명 입력, 가격 **₩4,900**, **활성화(Active)**

## D. 라이센스 테스터 (실제 청구 없이 테스트)

1. Play Console **설정 → 라이센스 테스트** → 본인 구글 계정 추가
2. 이 계정으로는 테스트 구매가 **실제 청구되지 않음**

## E. RevenueCat 설정

1. [RevenueCat](https://app.revenuecat.com) 가입 → **프로젝트 생성**
2. **Play Store 앱 추가**: 패키지명 `com.yei.idphoto`
   - 구글 서비스 계정 JSON 연결 (RevenueCat 안내대로 Play Console에서 발급/권한 부여)
3. **Products**: `yei_lifetime` 추가
4. **Entitlements**: `premium` 생성 → `yei_lifetime` 상품을 이 entitlement에 연결
   - (← `src/iap.ts`의 `ENTITLEMENT_ID = 'premium'` 와 동일)
5. **Offerings**: 기본 offering(current)에 `yei_lifetime` 패키지 추가
6. **API keys → Google** 의 공개 키(`goog_...`) 복사

## F. 키 넣고 다시 빌드

1. `src/iap.ts` 의 `RC_API_KEY = ''` 에 위 `goog_...` 키 입력
2. 웹 빌드 + 동기화 + AAB 재생성:
   ```
   npm run build
   npx cap sync android
   # Android Studio에서 release AAB 다시 생성 (A-2~4)
   ```
3. 새 AAB를 내부 테스트에 **새 버전으로 업로드**

## G. 테스트 (폰)

1. 폰에서 **내부 테스트 참여 링크**로 옵트인 → **플레이에서 앱 설치**(USB 설치본 말고!)
2. 무료 5회 다운로드 → 6회째 **페이월**
3. **"광고 없이 평생 이용"** → 구글 결제 시트(테스트 계정이라 무청구) → **즉시 무제한 해제**
4. 앱 삭제 후 재설치 → **"구매 복원"** → 다시 무제한 (또는 시작 시 자동 entitlement 확인으로 해제)

---

## 성공 판정 (결제)

- [ ] 내부 테스트로 설치한 앱에서 무료 5회 → 6회째 페이월
- [ ] 테스트 계정으로 ₩4,900 결제 시트 → 무청구 구매 → 즉시 무제한
- [ ] 삭제·재설치 후 복원(또는 자동 확인)으로 무제한
- [ ] 사진은 네트워크로 안 나감(결제 토큰만 RevenueCat/구글과 오감)

## 참고: 코드 동작 (설정 전/후)

- **웹(`npm run dev`)**: 결제는 스텁 — "구매" 누르면 바로 해제(플로우 검증용).
- **폰, 키 미설정**: "구매" 시 *"RevenueCat API 키가 설정되지 않았습니다"* 안내(정상 — F단계 전까지).
- **폰, 키+콘솔 설정 완료**: 실제 구글 결제 동작.
