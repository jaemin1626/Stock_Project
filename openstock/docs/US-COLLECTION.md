# 미국 일봉 수집 구조

설치: python -m pip install --target .python-deps -r scripts/requirements-us.txt
조회만 검증: python scripts/collect-us.py --check --ticker AAPL --start 2010-01-04 --end 2026-10-10
명시적 수집 저장: python scripts/collect-us.py --write --start 2010-01-04 --end 2026-10-10

현재 전체 수집은 중지 상태입니다. 이번 검증은 --check로 종목 한 개만 조회하며 실제 stocks 파일은 저장하지 않습니다. 종료일은 미포함입니다.

config/us-stocks.json에 코드, 이름, 거래소를 등록합니다. 현재 3개 대표 종목은 예시이며 나스닥 전체 목록이나 다우 구성 목록이 아닙니다. 전체 종목 목록과 지수 구성은 별도 공식 출처와 기준일을 확보해야 합니다.

저장 경로: stocks/US/NASDAQ/Apple_AAPL.json 등. stocks/us-index.json으로 미국 종목 경로를 관리하며 국내 index.json과 분리합니다. 미국 데이터는 아직 앱 검색/기업 상세에 연결하지 않았습니다. indices 폴더는 향후 지수 구성 목록용입니다.

일봉 OHLCV, 별도 adjustedClose, 배당, 분할 이벤트, 출처, 수집 범위를 저장합니다. auto_adjust=False라도 Yahoo의 OHLC는 분할 반영 방식이 적용될 수 있으므로 KRX의 raw와 같다고 가정하지 않습니다. priceBasis=yahoo-unadjusted-ohlc로 구분합니다. 과거 수정종가가 기업 이벤트로 바뀔 수 있으므로 갱신 시 전체 기간 재조회가 필요할 수 있습니다.

중복 거래일은 갱신하고 임시 파일 교체로 저장합니다. 순차 조회하며 종목 간 2초 간격을 둡니다. 조회/저장 실패는 종목과 오류 종류로 표시하고 종료 코드 1을 반환합니다. API 제공 기간과 상장폐지 종목 완전성은 보장되지 않습니다. yfinance는 Yahoo의 공식 지원 API가 아니며 개인 연구용 데이터 이용 조건을 확인해야 합니다.

미국 종목 목록 확장: node scripts/update-us-universe.mjs로 Nasdaq Trader 현재 상장 종목 목록을 갱신합니다. ETF와 테스트 종목은 제외하고 우선주/워런트/권리/유닛 및 매핑이 불확실한 기호는 config/us-stocks-excluded.json에 기록합니다. 현재 상장 종목 기준이며 OTC/과거 상장폐지 종목은 포함하지 않습니다. 등록된 전체 티커가 Yahoo에서 조회 가능하다는 의미는 아닙니다. 종목 목록 갱신은 가격 수집을 실행하지 않습니다. 다우/S&P500 지수 구성은 별도 목록입니다.
