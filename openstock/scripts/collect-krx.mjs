// Single-day collection uses the same per-security storage and lock as backfill.
const date=process.argv[2];if(!/^\d{8}$/.test(date??''))throw new Error('기준일 YYYYMMDD 필요');
process.argv=[process.argv[0],process.argv[1],date,date,'2'];
await import('./backfill-krx.mjs');
