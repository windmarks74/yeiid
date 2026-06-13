# Yei (YeiID) — 증명사진/여권사진 앱 · 프로젝트 헌법 (Always Loaded)

> 상세: `README.md` · 결제 `IAP_SETUP.md` · 스토어 `STORE_LISTING.md` · 데이터보안 `DATA_SAFETY.md`
> · 규격 점검 `MAINTENANCE.md` · 매뉴얼 `docs/manuals/` · 직원 `.claude/agents/staff-{pm,dev,qa}.md`

## 명의 / 소속 (중요)

- **이 프로젝트의 명의 = 개인.** (법인 iTBROWN ERP 와 별개)
- **ERP 연결 금지:** 이 앱의 데이터·인증·결제·DB·git 작성자를 iTBROWN ERP 와 섞지 않는다.
  - git 작성자 이메일은 개인 이메일(`shhwang0424@gmail.com`)로 — 법인 `@itbrown.com` 사용 금지.
  - ERP Supabase/테이블/계정과 연결하지 않는다. (단, 개발실 `dev_worklog`/`dev_commands` 같은
    **개발 추적 레이어**에 진행 상황을 기록하는 것은 예외로 허용 — 그건 데이터 연결이 아니라 메모다.)

## 절대 규칙 (베타 진행 중)

1. **앱 코드와 스토어 설정은 절대 변경하지 않는다 — 읽기·기록·문서화만.** 베타 검증 중이라
   작은 변경도 결제/심사/서명에 영향을 줄 수 있다. 코드·`android/`·스토어 자료 수정 금지.
2. **비밀·서명키 커밋 금지.** `android/yei-upload.keystore`, `android/keystore.properties` 는
   `.gitignore` 로 차단돼 있다. 절대 커밋·푸시하지 말 것. (분실 대비 USB·비번관리자에 별도 백업.)
3. **결제는 코드만으론 테스트 불가.** 내부 테스트 트랙 업로드 + 서명키 일치 + 플레이 설치본이어야 동작
   (sideload 불가). 상세 `IAP_SETUP.md`.

## 기술 메모

- React + TS + Vite + **Capacitor 8** (`appId: com.yei.idphoto`, appName `YeiID`).
- 결제: **RevenueCat**(`@revenuecat/purchases-capacitor`). 상품 `yei_lifetime`(일회성 ₩4,900),
  entitlement `premium`. 키는 `src/iap.ts` `RC_API_KEY`.
- 사진은 **전부 온디바이스 처리**(서버 전송 없음) — 데이터보안 신고의 핵심.
- 배경제거 모델 ~300MB 는 저장소 제외(`public/imgly/`, gitignore). 모바일 빌드는
  `npm run sync:android` 가 모델을 제외해 AAB 용량을 줄인다.

## 작업일지 (세션 규칙)

- **세션 시작 시:** 먼저 `git pull` 로 최신을 받고(충돌 시 멈추고 쉬운 말로 보고),
  `docs/worklog.md` 맨 위 항목을 읽어 "지난번 여기까지, 다음은 이것" 브리핑.
- **사용자가 "오늘 마무리"라고 하면:** `docs/worklog.md` 맨 위에 오늘 항목
  (`날짜 / 장소 / 오늘 한 일 / 다음 할 일`)을 추가하고 커밋·푸시한다.

## 작업 시

설계가 모호하거나 결제·스토어·서명·심사에 닿는 결정은 추측 금지 — 본인 확인.
직원(PM·개발자·QA)은 데이터·배포를 스스로 바꾸지 않는다: **제안 → 확인.**
