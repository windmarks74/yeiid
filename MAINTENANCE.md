# Yei ID — 규격·신청URL 정기 점검 체크리스트

> **왜:** 정부·시험 기관의 사진 규격(px·용량·배경·안경)과 접수 URL은 **자주 바뀐다.**
> 틀린 규격 = 기관 반려 = 브랜드 최악 실패. **정확·최신 유지 = 이 앱의 해자.**
> 실사례: 2026.4 사이버국가고시센터(gosi.kr) → 국가공무원채용시스템(gongmuwon.gosi.kr) 전면 이전 + 구 사이트 인증서 오류.

## 점검 주기
- **정기: 최소 6개월마다 전체 점검** (권장 3개월 — 고위험 항목은 더 자주).
- **이벤트성:** 각 시험 공채 접수 시즌 직전 / 정부 시스템 개편 뉴스 발견 시 즉시.
- 점검 후 `src/usage.ts` 각 preset의 **`source.verified` 날짜를 갱신**.

## 점검 항목 (preset별)
각 규격마다 공식 페이지에서 확인:
1. **인쇄 크기**(mm) · **머리 비율**(정수리~턱 %) · **배경색** · **안경 규정**
2. **디지털 업로드**: px 범위 · **용량 캡(KB)** · 포맷(JPG/PNG) — *자동검증 포털은 1KB·1px도 거부*
3. **신청/접수 URL** 살아있는지 + **인증서(https) 정상**인지

## 점검 표 (last verified: 2026-06)
| preset | 규격 출처 | 신청 URL | 위험도 | 비고 |
|---|---|---|---|---|
| 여권 | passport.go.kr / 외교부 | passport.go.kr | 낮음 | 안정적 |
| 운전면허 | safedriving.or.kr | safedriving.or.kr ✅ | 낮음 | |
| 일반 | — | (없음) | 낮음 | |
| 미국 | travel.state.gov ✅ | travel.state.gov | 중간 | AI편집 규정 강화 추세 |
| 셰겐 | axa-schengen / ICAO | (없음) | 중간 | 회원국별 배경색 차이 |
| 큐넷 | q-net.or.kr ✅ | q-net.or.kr | **높음** | 디지털 px/용량 재확인 필요 |
| KPC | license.kpc.or.kr ✅ | license.kpc.or.kr | **높음** | 디지털 규격 미확정 |
| 공무원 | **gongmuwon.gosi.kr** ✅ | gongmuwon.gosi.kr | **매우높음** | 2026 시스템 전면 이전 — 규격 재확인 필수 |
| 토익 | toeic.co.kr | toeic.co.kr | **높음** | 용량 캡 500KB/6MB 출처 충돌 |

## 출시 전 1차 검증 TODO (미해결)
- [ ] 토익 용량 캡 확정 (500KB vs 6MB)
- [ ] KPC 디지털 px·용량 확정
- [ ] 큐넷 디지털 px 확정
- [ ] 공무원 새 시스템(gongmuwon.gosi.kr) 사진 규격 재확인 (px·용량·배경)
- [ ] 머리 비율(특히 토익 80~90%) 확정

## 갱신 방법
- 규격 변경: `src/usage.ts`의 해당 preset 값만 수정 (로직 하드코딩 없음).
- URL 변경: `APPLY_SITE` + preset `source.url` 수정.
- (선택·차후) 접수 URL 생존 확인 스크립트: 각 URL에 HEAD 요청 → 죽은 링크/인증서 오류 자동 감지.
