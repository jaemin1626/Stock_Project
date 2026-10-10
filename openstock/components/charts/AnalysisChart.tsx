'use client';
import { useEffect, useRef, useState } from 'react';
import { CandlestickSeries, ColorType, createChart, HistogramSeries, LineSeries, type Time } from 'lightweight-charts';
import type { PriceHistory } from '@/lib/domain/market';
export default function AnalysisChart({ histories, mode = 'candles', light = false }: { histories: PriceHistory[]; mode?: 'candles' | 'line' | 'normalized'; light?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [themeLight, setThemeLight] = useState(light);
  useEffect(() => {
    const update = () => setThemeLight(light || document.documentElement.classList.contains('analysis-light'));
    const observer = new MutationObserver(update); observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] }); update();
    return () => observer.disconnect();
  }, [light]);
  useEffect(() => {
    if (!ref.current) return;
    const chart = createChart(ref.current, { height: 340, autoSize: true, layout: { background: { type: ColorType.Solid, color: themeLight ? '#ffffff' : '#182422' }, textColor: themeLight ? '#1b332c' : '#d6e8df', attributionLogo: true }, grid: { vertLines: { visible: false }, horzLines: { color: themeLight ? '#edf2ef' : '#263a33' } } });
    histories.forEach((history, index) => {
      const bars = history.bars;
      if (mode === 'candles' && index === 0) {
        chart.addSeries(CandlestickSeries, { upColor: '#16a085', downColor: '#ef6464', borderVisible: false }).setData(bars.map(b => ({ time: b.date as Time, open: b.open, high: b.high, low: b.low, close: b.close })));
        const volume = chart.addSeries(HistogramSeries, { priceScaleId: 'volume', priceFormat: { type: 'volume' } });
        volume.priceScale().applyOptions({ scaleMargins: { top: 0.82, bottom: 0 } });
        chart.priceScale('right').applyOptions({ scaleMargins: { top: 0.05, bottom: 0.25 } });
        volume.setData(bars.map(b => ({ time: b.date as Time, value: b.volume, color: b.close >= b.open ? '#16a08566' : '#ef646466' })));
      } else {
        chart.addSeries(LineSeries, { color: ['#16a085', '#6a8dff', '#f4b860', '#e977aa', '#a088e8'][index % 5], title: history.instrument.name }).setData(bars.map(b => ({ time: b.date as Time, value: mode === 'normalized' ? b.close / bars[0].close * 100 : b.close })));
      }
    });
    chart.timeScale().fitContent();
    return () => chart.remove();
  }, [histories, mode, themeLight]);
  return <div ref={ref} role="img" aria-label="가격·거래량 차트" className="w-full min-w-0" />;
}
