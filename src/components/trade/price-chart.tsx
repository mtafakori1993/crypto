"use client";
import { useEffect, useRef, useState } from "react";
import type { IChartApi, ISeriesApi, UTCTimestamp } from "lightweight-charts";
import { Skeleton } from "@/components/ui/misc";
import { formatPrice } from "@/lib/format";
import { getCandles, type Timeframe } from "@/lib/market/candles";
import { NOISE_MS } from "@/lib/market/model";
import { getPair } from "@/lib/market/pairs";
import { useNow } from "@/lib/store/sim-provider";

const css = (n: string) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
const tz = "Asia/Tehran";
const hm = new Intl.DateTimeFormat("fa-IR", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: tz });
const md = new Intl.DateTimeFormat("fa-IR", { month: "short", day: "numeric", timeZone: tz });
const full = new Intl.DateTimeFormat("fa-IR", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false, timeZone: tz });

function palette() {
  return {
    text: css("--muted"),
    grid: css("--line"),
    up: css("--up"),
    down: css("--down"),
    upSoft: css("--up-soft"),
    downSoft: css("--down-soft"),
    accent: css("--accent"),
    bg: css("--surface"),
  };
}

export default function PriceChart({ pair, tf, height = 420 }: { pair: string; tf: Timeframe; height?: number | string }) {
  const host = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const [ready, setReady] = useState(false);
  const now = useNow();
  const nowRef = useRef(now);
  useEffect(() => {
    nowRef.current = now;
  });
  const bucket = Math.floor(now / NOISE_MS);
  const info = getPair(pair)!;

  // create chart once (lazy-loads the charting library)
  useEffect(() => {
    let disposed = false;
    let mo: MutationObserver | null = null;
    (async () => {
      const lw = await import("lightweight-charts");
      if (disposed || !host.current) return;
      const p = palette();
      const chart = lw.createChart(host.current, {
        autoSize: true,
        layout: { background: { type: lw.ColorType.Solid, color: "transparent" }, textColor: p.text, fontFamily: "var(--font-vazir), Tahoma, sans-serif", fontSize: 11, attributionLogo: false },
        grid: { vertLines: { color: p.grid }, horzLines: { color: p.grid } },
        rightPriceScale: { borderColor: p.grid, scaleMargins: { top: 0.08, bottom: 0.25 } },
        timeScale: { borderColor: p.grid, timeVisible: true, secondsVisible: false, rightOffset: 4, tickMarkFormatter: (t: number, type: number) => (type >= 3 ? hm.format(new Date(t * 1000)) : md.format(new Date(t * 1000))) },
        crosshair: { mode: lw.CrosshairMode.Normal, vertLine: { color: p.text, labelBackgroundColor: p.accent }, horzLine: { color: p.text, labelBackgroundColor: p.accent } },
        localization: { timeFormatter: (t: number) => full.format(new Date(t * 1000)) },
      });
      const candles = chart.addSeries(lw.CandlestickSeries, { upColor: p.up, downColor: p.down, borderUpColor: p.up, borderDownColor: p.down, wickUpColor: p.up, wickDownColor: p.down });
      const vol = chart.addSeries(lw.HistogramSeries, { priceFormat: { type: "volume" }, priceScaleId: "vol", lastValueVisible: false, priceLineVisible: false });
      chart.priceScale("vol").applyOptions({ scaleMargins: { top: 0.82, bottom: 0 } });
      chartRef.current = chart;
      candleRef.current = candles;
      volRef.current = vol;
      setReady(true);
      mo = new MutationObserver(() => {
        const q = palette();
        chart.applyOptions({ layout: { textColor: q.text }, grid: { vertLines: { color: q.grid }, horzLines: { color: q.grid } }, rightPriceScale: { borderColor: q.grid }, timeScale: { borderColor: q.grid } });
        candles.applyOptions({ upColor: q.up, downColor: q.down, borderUpColor: q.up, borderDownColor: q.down, wickUpColor: q.up, wickDownColor: q.down });
      });
      mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    })();
    return () => {
      disposed = true;
      mo?.disconnect();
      chartRef.current?.remove();
      chartRef.current = candleRef.current = volRef.current = null;
    };
  }, []);

  // full data load on pair / timeframe change
  useEffect(() => {
    if (!ready || !candleRef.current || !volRef.current || !chartRef.current) return;
    const c = getCandles(pair, tf, nowRef.current, 240);
    const p = palette();
    candleRef.current.applyOptions({ priceFormat: { type: "custom", minMove: info.tick, formatter: (v: number) => formatPrice(v, info.priceDecimals) } });
    candleRef.current.setData(c.map((k) => ({ time: k.time as UTCTimestamp, open: k.open, high: k.high, low: k.low, close: k.close })));
    volRef.current.setData(c.map((k) => ({ time: k.time as UTCTimestamp, value: k.volume, color: k.close >= k.open ? `${p.up}80` : `${p.down}80` })));
    chartRef.current.timeScale().setVisibleLogicalRange({ from: c.length - 90, to: c.length + 3 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, pair, tf]);

  // live update of the forming candle
  useEffect(() => {
    if (!ready || !candleRef.current || !volRef.current) return;
    const c = getCandles(pair, tf, now, 2);
    const k = c[c.length - 1];
    const p = palette();
    candleRef.current.update({ time: k.time as UTCTimestamp, open: k.open, high: k.high, low: k.low, close: k.close });
    volRef.current.update({ time: k.time as UTCTimestamp, value: k.volume, color: k.close >= k.open ? `${p.up}80` : `${p.down}80` });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bucket, ready]);

  return (
    <div className="relative w-full" style={{ height }} dir="ltr" data-testid="price-chart" data-ready={ready}>
      <div ref={host} className="absolute inset-0" role="img" aria-label={`نمودار شمعی ${info.label} در بازه ${tf}`} />
      {!ready && <Skeleton className="absolute inset-0" />}
    </div>
  );
}
