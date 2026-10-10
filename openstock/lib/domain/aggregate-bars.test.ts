import {describe,it,expect} from 'vitest';
import {aggregateBars} from './aggregate-bars';
const bars=[{date:'2023-12-29',open:10,high:14,low:8,close:12,volume:100},{date:'2024-01-02',open:12,high:20,low:11,close:18,volume:200},{date:'2024-01-05',open:18,high:22,low:9,close:10,volume:300},{date:'2024-01-08',open:10,high:15,low:7,close:14,volume:400}];
describe('calendar OHLCV aggregation',()=>{
 it('uses first open, extrema, final close and summed volume within Monday weeks',()=>{expect(aggregateBars(bars,'week')[1]).toEqual({date:'2024-01-02',open:12,high:22,low:9,close:10,volume:500});expect(aggregateBars(bars,'week')).toHaveLength(3);});
 it('separates years and months and preserves input',()=>{expect(aggregateBars(bars,'year')).toHaveLength(2);expect(aggregateBars(bars,'month')[1].volume).toBe(900);expect(bars[1].volume).toBe(200);});
 it('sorts daily rows and handles empty inputs',()=>{expect(aggregateBars([...bars].reverse(),'day')).toEqual(bars);expect(aggregateBars([],'year')).toEqual([]);});
});
