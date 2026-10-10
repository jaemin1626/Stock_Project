import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {saveRows,readJson,safeName} from './stock-store.mjs';
test('stock documents merge days, rename safely, and preserve latest metadata',async()=>{
 const root=await fs.mkdtemp(path.join(os.tmpdir(),'stock-store-test-'));
 try{
 const row={ISU_CD:'005930',ISU_NM:'삼성전자',MKT_NM:'KOSPI',BAS_DD:'20200102',TDD_OPNPRC:'10',TDD_HGPRC:'12',TDD_LWPRC:'9',TDD_CLSPRC:'11',ACC_TRDVOL:'100'};
 await saveRows(root,[row]);await saveRows(root,[{...row,TDD_CLSPRC:'12'}]);
 await saveRows(root,[{...row,ISU_NM:'새/이름',BAS_DD:'20200103'}]);
 await saveRows(root,[{...row,BAS_DD:'20100104'}]);
 const index=await readJson(path.join(root,'index.json'));const entry=index.entries['KR:005930'];
 assert.equal(entry.path,'KR/KOSPI/새_이름_005930.json');assert.equal(entry.asOf,'2020-01-03');
 const doc=await readJson(path.join(root,entry.path));assert.equal(doc.bars.length,3);assert.equal(doc.bars[1].close,12);assert.equal(doc.bars[0].date,'2010-01-04');assert.equal(doc.priceBasis,'raw');assert.equal(safeName('a*b'),'a_b');
 }finally{if(!path.resolve(root).startsWith(path.resolve(os.tmpdir())+path.sep+'stock-store-test-'))throw new Error('test cleanup path mismatch');await fs.rm(root,{recursive:true,force:true});}
});
