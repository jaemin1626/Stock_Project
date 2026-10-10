# 2단계 기반 작업

## 출발점

Open-Dev-Society/OpenStock의 커밋 `38da6d45e714b36b1cf56e945c290b70684eb03b`을 openstock 폴더에 clone하여 확장했다. GitHub 계정의 remote fork는 생성하지 않았다. AGPL-3.0 및 원본 고지를 유지한다.

## 실행

PowerShell에서 openstock 폴더를 열고 실행한다.

```powershell
Copy-Item .env.example .env.local
npm install
npm run dev
```

.env.example은 USE_MOCK=true가 기본이다. API 키·MongoDB·Redis 없이 `/themes`, `/flows`, `/etfs`, `/company/005930`을 열 수 있다. 기존 로그인/계정/관심종목 기능은 실제 DB 설정이 필요하다. 목업 화면은 기존 서비스의 로그인 사용자를 가장하지 않으며 관심종목 기능은 후속 구현 대상이다.

```powershell
npm run typecheck
npm test
$env:USE_MOCK='true'
npm run build
npm start
```

배포 전에는 .env.local 대신 배포 환경변수를 사용한다. 실데이터는 USE_MOCK=false와 MONGODB_URI, REDIS_URL, KIS/Finnhub 키, 토큰 암호화 키를 설정한다. Redis는 접근 제한된 서버/서비스를 사용한다. TOKEN_ENCRYPTION_KEY는 32바이트 랜덤 키의 64자리 hex 표현이다. 비밀키를 NEXT_PUBLIC 변수에 넣지 않는다.

## 포함된 기능

- 네 페이지 라우트, 분석 메뉴, 다크/라이트 전환, 면책 문구.
- 공통 PriceProvider 계약, KIS/Finnhub 일봉 mapper, DART 공시검색 adapter, 결정적 합성 목업.
- KIS 암호화 토큰 공유 캐시, 만료 5분 전 갱신, 분산 잠금, 발급 간격, 공유 직렬 요청 제한.
- 실데이터 Redis 결과 캐시 및 MongoDB 가격 스냅샷 재사용.
- Lightweight Charts 캔들·라인·거래량·정규화 차트 컴포넌트와 여러 시계열 입력.
- 서버 API `/api/analysis/history?code=005930`; 실데이터 모드는 세션 필수.
- 목업 화면 날짜 필터·정렬, 로딩·오류·빈 결과 표시.
- PWA manifest, 아이콘, production 서비스워커와 오프라인 안내. 서버 API·인증 응답은 캐싱하지 않는다.
- 인증 DB 연결을 모듈 import 시점에서 요청 시점으로 이동. 원본 Finnhub 공개키 환경변수 참조 제거. 빌드 TypeScript 오류 무시 설정 해제.

## 단계 경계 및 미확인 사항

현재 화면은 가격 기반 연결을 확인하는 화면이다. 테마 계산·수급 랭킹·ETF 메타데이터·DART 재무 매핑·AI 요약·장마감 배치는 다음 승인 단계에서 구현한다. 가격 스냅샷 저장은 초기 캐시이며 종목/일별 장기 이력 모델과 수집 상태 관리가 아직 추가되지 않았다.

지원 종목은 삼성전자, SK하이닉스, KODEX 200, SPY이다. 전체 국내 마스터 및 검색 통합은 후속 단계 대상이다. 목업은 실제 공휴일을 반영하지 않는 합성 시계열이며 화면에서 명시한다.

KIS 경로/TR ID는 1단계 공식 샘플을 기반으로 고정했으나 실제 키가 없어 실계정 호출은 검증하지 않았다. 투자자 반환 일수/단위와 ETF AUM/비중은 아직 검증하지 않았다. DART 공시 검색 adapter만 연결했고 기업코드 ZIP 매핑/재무 adapter는 기업 페이지 단계에서 검증한다. Finnhub 일봉 권한은 계정별 확인이 필요하다. 실데이터 장애는 목업으로 자동 전환하지 않는다.

토큰 갱신은 응답 expires_in 기준이며 API 토큰 오류에 의한 강제 재발급은 아직 구현하지 않았다. 최소 발급간격에 걸리면 재시도 안내 오류를 반환한다. 분산 작업은 30초 잠금을 사용하며 각 외부 호출에 10초 timeout을 적용한다. 멀티 서버 Redis 통합 테스트는 실제 Redis 설정 후 필요하다.

브라우저에서 테마 기반 화면의 375px 다크/라이트 렌더링과 모드 전환을 확인했다. 문서 너비와 scrollWidth가 일치해 가로 넘침이 없었다. 네 페이지 HTTP 200 및 목업/면책 표시도 확인했다. PWA 실제 설치와 오프라인 재접속, 다른 페이지의 모든 모바일 상호작용은 후속 검증이 필요하다.

검증 결과: typecheck 통과, Vitest 102개 통과·기존 4개 skipped, USE_MOCK=true 프로덕션 빌드 통과. 테스트에는 토큰 암호화/캐시 재사용/잘못된 응답 거부와 결정적 목업 OHLC 검증을 추가했다. 실제 Redis/KIS/DART/Finnhub 키를 사용하는 통합 테스트는 수행하지 않았다.

원본 의존성 설치 시 감사에서 51개 취약점이 보고되었다. 후속 로컬 audit 결과와 일치하지 않아 배포 준비 시 네트워크가 가능한 환경에서 공식 advisory와 전체 lockfile 감사를 다시 수행해야 한다. 자동 강제 버전 업그레이드는 하지 않았다.

## 코드 전달

`foundation-full-code.md`에 이 단계의 생성·수정 파일 전체를 생략 없이 수록한다. package-lock.json은 원본 파일을 그대로 제공하며 문서에서는 별도 파일로 연결한다. 생성 스크립트는 현재 파일을 수정하는 내부 작업 기록이므로 재실행하지 않는다.
