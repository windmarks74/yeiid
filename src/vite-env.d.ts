/// <reference types="vite/client" />
// Vite 가 주입하는 import.meta.env 타입. iap.ts 가 개발/프로덕션 빌드를 구분하는 데 쓴다
// (웹 프로덕션 빌드에서 결제 스텁을 막기 위해 — iap.ts purchaseLifetime 주석 참고).
