import argparse
import json
import math
import os
from pathlib import Path
import re
import time
from datetime import date, datetime, timezone
import sys
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / '.python-deps'))

ROOT = Path(__file__).resolve().parents[1]

def atomic(file, value):
    file.parent.mkdir(parents=True, exist_ok=True)
    temporary = file.with_suffix('.json.tmp')
    temporary.write_text(json.dumps(value, ensure_ascii=False, indent=2, allow_nan=False), encoding='utf-8')
    os.replace(temporary, file)

def fetch_stock(item, start, end):
    import yfinance as yf
    frame = yf.Ticker(item['code']).history(start=start, end=end, interval='1d', auto_adjust=False, actions=True, raise_errors=True, timeout=20)
    if frame.empty:
        raise ValueError('가격 응답 없음')
    bars = []
    for stamp, row in frame.iterrows():
        values = [float(row[k]) for k in ['Open', 'High', 'Low', 'Close', 'Volume']]
        if not all(math.isfinite(v) for v in values):
            raise ValueError('가격 필드 누락')
        adjusted = float(row.get('Adj Close', float('nan')))
        bars.append(dict(date=stamp.date().isoformat(), open=values[0], high=values[1], low=values[2], close=values[3], volume=int(values[4]), adjustedClose=adjusted if math.isfinite(adjusted) else None, dividends=float(row.get('Dividends', 0)), stockSplits=float(row.get('Stock Splits', 0))))
    return bars

def save(item, bars, start):
    root = ROOT / 'stocks'
    idxfile = root / 'us-index.json'
    index = json.loads(idxfile.read_text(encoding='utf-8')) if idxfile.exists() else {'schemaVersion': 1, 'entries': {}}
    key = 'US:' + item['code']
    name = re.sub(r'[<>:"/\\|?*\x00-\x1f]', '_', item['name']).rstrip('. ') or 'Stock'
    relative = f"US/{item['exchange']}/{name}_{item['code']}.json"
    previous = index['entries'].get(key)
    oldfile = root / previous['path'] if previous else root / relative
    if not oldfile.resolve().is_relative_to(root.resolve()):
        raise ValueError('저장 경로 오류')
    existing = json.loads(oldfile.read_text(encoding='utf-8')) if oldfile.exists() else {'bars': []}
    merged = {b['date']: b for b in existing['bars']}
    merged.update({b['date']: b for b in bars})
    ordered = sorted(merged.values(), key=lambda b: b['date'])
    doc = dict(schemaVersion=1, code=item['code'], name=item['name'], market=item['exchange'], currency='USD', source='Yahoo Finance via yfinance', priceBasis='yahoo-unadjusted-ohlc', updatedAt=datetime.now(timezone.utc).isoformat(), coverage=dict(requestedFrom=start, collectedFrom=ordered[0]['date'], collectedThrough=ordered[-1]['date'], status='partial'), bars=ordered)
    atomic(root / relative, doc)
    index['entries'][key] = dict(code=item['code'], name=item['name'], market=item['exchange'], path=relative, asOf=ordered[-1]['date'])
    atomic(idxfile, index)
    if oldfile != root / relative and oldfile.exists():
        oldfile.unlink()

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--manifest', default=str(ROOT / 'config/us-stocks.json'))
    parser.add_argument('--start', default='2010-01-04')
    parser.add_argument('--end', default=date.today().isoformat(), help='Exclusive end date')
    parser.add_argument('--check', action='store_true', help='One ticker only; no stock files written')
    parser.add_argument('--ticker', default='AAPL')
    parser.add_argument('--write', action='store_true', help='Explicit opt-in to storing the manifest')
    args = parser.parse_args()
    if not args.check and not args.write:
        parser.error('조회 검증은 --check, 수집 저장은 --write를 명시하세요')
    if date.fromisoformat(args.start) >= date.fromisoformat(args.end):
        parser.error('종료일은 시작일 이후여야 합니다')
    manifest = json.loads(Path(args.manifest).read_text(encoding='utf-8-sig'))
    items = manifest['stocks']
    for item in items:
        if not re.fullmatch(r'[A-Z0-9][A-Z0-9.-]{0,19}', item['code']) or item['exchange'] not in ['NASDAQ', 'NYSE', 'NYSEAMERICAN', 'NYSEARCA', 'CBOEBZX', 'IEX', 'NYSECHICAGO', 'LTSE', 'NASDAQBX', 'NYSENATIONAL', 'NASDAQTEXAS']:
            raise ValueError('종목 목록 형식 오류')
    if args.check:
        items = [i for i in items if i['code'] == args.ticker]
        if len(items) != 1:
            parser.error('검증 종목이 목록에 없습니다')
    lockfile = ROOT / 'stocks/us-collection.lock'
    lock = None
    failures = 0
    try:
        if not args.check:
            lock = os.open(lockfile, os.O_CREAT | os.O_EXCL | os.O_WRONLY)
        for item in items:
            try:
                bars = fetch_stock(item, args.start, args.end)
                if not args.check:
                    save(item, bars, args.start)
                print(json.dumps(dict(ticker=item['code'], records=len(bars), first=bars[0]['date'], last=bars[-1]['date'], written=not args.check)))
            except Exception as exc:
                failures += 1
                print(json.dumps(dict(ticker=item['code'], error=type(exc).__name__, written=False)))
            if not args.check:
                time.sleep(2)
    finally:
        if lock is not None:
            os.close(lock)
            lockfile.unlink()
    sys.exit(1 if failures else 0)

