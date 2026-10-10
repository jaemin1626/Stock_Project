import fs from 'node:fs/promises';
const urls=['https://www.nasdaqtrader.com/dynamic/SymDir/nasdaqlisted.txt','https://www.nasdaqtrader.com/dynamic/SymDir/otherlisted.txt'];
const exchangeMap={A:'NYSEAMERICAN',N:'NYSE',P:'NYSEARCA',Z:'CBOEBZX',V:'IEX',M:'NYSECHICAGO',L:'LTSE',B:'NASDAQBX',C:'NYSENATIONAL',W:'NASDAQTEXAS'};
const stocks=[],excluded=[];const counts={};const sources=[];
for(const [i,url] of urls.entries()){
 const res=await fetch(url,{signal:AbortSignal.timeout(30000)});if(!res.ok)throw new Error(`종목 목록 HTTP ${res.status}`);
 const lines=(await res.text()).trim().split(/\r?\n/);const header=lines.shift().split('|');
 if(!header.includes('Security Name')||!header.includes('Test Issue')||!header.includes('ETF'))throw new Error('목록 형식 오류');
 const footer=lines.find(l=>l.startsWith('File Creation Time:'));sources.push({url,fileCreationTime:footer??null});
 for(const line of lines){if(line.startsWith('File Creation Time:')||!line.trim())continue;const cells=line.split('|');const row=Object.fromEntries(header.map((h,j)=>[h,cells[j]]));
 if(row['Test Issue']!=='N'||row.ETF!=='N')continue;
 const sourceSymbol=i===0?row.Symbol:row['ACT Symbol'];const exchange=i===0?'NASDAQ':exchangeMap[row.Exchange];
 // Yahoo uses hyphens for share classes. Preferred/warrant/unit mappings need separate verification.
 if(!exchange||!sourceSymbol||! /^[A-Z0-9]+(?:\.[A-Z])?$/.test(sourceSymbol)||/\b(preferred|warrant|rights|units|depositary shares)\b/i.test(row['Security Name'])){excluded.push({symbol:sourceSymbol,exchange:row.Exchange,reason:'종목 유형/티커 매핑 확인 필요'});continue;}
 const code=sourceSymbol.replace('.','-');if(stocks.some(s=>s.code===code)){excluded.push({symbol:sourceSymbol,reason:'Yahoo 티커 중복'});continue;}
 stocks.push({code,name:row['Security Name'],exchange,sourceSymbol});counts[exchange]=(counts[exchange]??0)+1;
 }
}
if(stocks.length<1000||!stocks.some(s=>s.code==='AAPL')||!stocks.some(s=>s.code==='IBM'))throw new Error('종목 목록 완전성 검사 실패');
stocks.sort((a,b)=>a.exchange.localeCompare(b.exchange)||a.code.localeCompare(b.code));
const doc={schemaVersion:1,description:'Nasdaq Trader 현재 상장 목록. ETF/테스트/특수증권 제외. 과거 상장폐지·OTC 미포함.',updatedAt:new Date().toISOString(),sources,counts,stocks};
await fs.writeFile('config/us-stocks.json.tmp',JSON.stringify(doc,null,2));await fs.rename('config/us-stocks.json.tmp','config/us-stocks.json');
await fs.writeFile('config/us-stocks-excluded.json',JSON.stringify({updatedAt:doc.updatedAt,excluded},null,2));
console.log(JSON.stringify({stocks:stocks.length,counts,reviewRequired:excluded.length}));
