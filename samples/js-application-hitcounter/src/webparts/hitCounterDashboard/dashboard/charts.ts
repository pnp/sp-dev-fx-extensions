import { escape } from '@microsoft/sp-lodash-subset';
import styles from '../HitCounterDashboardWebPart.module.scss';
import { IPoint, IShare, ITopPage, formatCount, safeHref } from '../../../shared/dashboardModel';

/**
 * Plain SVG/HTML chart builders for the dashboard, following the dataviz
 * method: thin marks, 2px lines, 4px rounded data ends square at the
 * baseline, 10% area washes, hairline recessive grids, selective labels, a
 * legend for two or more series, and a hover tooltip on every mark
 * (data-tip, handled by the web part). Colours come from CSS tokens so light
 * and dark each use their own validated steps; text never wears a series colour.
 */

export const VIEWS: string = 'var(--hc-views)';
export const VISITORS: string = 'var(--hc-visitors)';

export function siteColour(colour: number): string {
  return colour >= 0 ? `var(--hc-site-${colour})` : 'var(--hc-other)';
}

function n(value: number): string {
  return String(Math.round(value * 10) / 10);
}

function tip(lines: string[]): string {
  return escape(lines.join('\n'));
}

/** Round tick values from 0 to at least max, about four steps. */
export function niceTicks(max: number): number[] {
  const top: number = Math.max(max, 4);
  const raw: number = top / 4;
  const power: number = Math.pow(10, Math.floor(Math.log(raw) / Math.LN10));
  const steps: number[] = [1, 2, 2.5, 5, 10];
  let step: number = power * 10;
  for (const s of steps) {
    if (power * s >= raw) {
      step = power * s;
      break;
    }
  }
  step = Math.max(1, Math.round(step));
  const ticks: number[] = [];
  for (let v = 0; v < top + step; v += step) {
    ticks.push(v);
    if (v >= top) {
      break;
    }
  }
  return ticks;
}

/** One style per axis: in full below 10,000, compact when the axis reaches it. */
function tickLabel(value: number, top: number): string {
  return top >= 10000 ? formatCount(value) : value.toLocaleString('en-US');
}

/** Rounded data end (4px), square at the baseline. */
function columnPath(x: number, y: number, w: number, h: number): string {
  const r: number = Math.min(4, w / 2, h);
  if (h <= 0) {
    return '';
  }
  return `M${n(x)},${n(y + h)}V${n(y + r)}Q${n(x)},${n(y)} ${n(x + r)},${n(y)}H${n(x + w - r)}Q${n(x + w)},${n(y)} ${n(x + w)},${n(y + r)}V${n(y + h)}Z`;
}

// ---------------------------------------------------------------- sparkline

export function sparkline(values: number[], colour: string): string {
  const w: number = 120;
  const h: number = 32;
  const max: number = values.reduce((m: number, v: number) => Math.max(m, v), 1);
  const step: number = values.length > 1 ? (w - 8) / (values.length - 1) : 0;
  const pts: string[] = values.map((v: number, i: number) => `${n(4 + i * step)},${n(h - 4 - (v / max) * (h - 8))}`);
  const last: string[] = pts[pts.length - 1].split(',');
  return `<svg class="${styles.spark}" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true">
    <path d="M${pts[0].split(',')[0]},${h - 4}L${pts.join('L')}L${last[0]},${h - 4}Z" style="fill:${colour};opacity:.1"></path>
    <polyline points="${pts.join(' ')}" style="fill:none;stroke:${colour};stroke-width:2;stroke-linejoin:round;stroke-linecap:round" vector-effect="non-scaling-stroke"></polyline>
  </svg>`;
}

// -------------------------------------------------------------------- legend

export function legend(items: { label: string; colour: string; line?: boolean }[]): string {
  return `<ul class="${styles.legend}">${items.map((i: { label: string; colour: string; line?: boolean }) =>
    `<li><span class="${i.line ? styles.keyLine : styles.keyDot}" style="background:${i.colour}"></span>${escape(i.label)}</li>`).join('')}</ul>`;
}

// -------------------------------------------------------------- trend (line)

const TH: number = 260;
const ML: number = 48;
const MR: number = 56;
const MT: number = 14;
const MB: number = 28;

/** Page views and visitors per day: two lines on one axis (both are counts), views with an area wash. */
export function trendChart(points: IPoint[], ariaLabel: string, width: number): string {
  const TW: number = Math.max(280, Math.round(width));
  const max: number = points.reduce((m: number, p: IPoint) => Math.max(m, p.views, p.visitors), 0);
  const ticks: number[] = niceTicks(max);
  const top: number = ticks[ticks.length - 1];
  const plotW: number = TW - ML - MR;
  const plotH: number = TH - MT - MB;
  const step: number = points.length > 1 ? plotW / (points.length - 1) : 0;
  const x = (i: number): number => ML + i * step;
  const y = (v: number): number => MT + plotH - (v / top) * plotH;

  const grid: string = ticks.map((t: number) =>
    `<line x1="${ML}" x2="${TW - MR}" y1="${n(y(t))}" y2="${n(y(t))}" class="${t === 0 ? styles.axisLine : styles.gridLine}"></line>
     <text x="${ML - 8}" y="${n(y(t) + 4)}" text-anchor="end" class="${styles.tick}">${tickLabel(t, top)}</text>`).join('');
  const xLabels: string = points.map((p: IPoint, i: number) =>
    (i % 7 === (points.length - 1) % 7)
      ? `<text x="${n(x(i))}" y="${TH - 8}" text-anchor="middle" class="${styles.tick}">${escape(p.label)}</text>` : '').join('');

  const line = (values: number[]): string => values.map((v: number, i: number) => `${n(x(i))},${n(y(v))}`).join(' ');
  const views: number[] = points.map((p: IPoint) => p.views);
  const visitors: number[] = points.map((p: IPoint) => p.visitors);
  const lastI: number = points.length - 1;
  const area: string = `M${n(x(0))},${n(y(0))}L${line(views).split(' ').join('L')}L${n(x(lastI))},${n(y(0))}Z`;

  // End labels only when they don't collide; legend and tooltip carry the rest.
  const yv: number = y(views[lastI]);
  const yu: number = y(visitors[lastI]);
  const endLabels: string = Math.abs(yv - yu) >= 14
    ? `<text x="${n(x(lastI) + 10)}" y="${n(yv + 4)}" class="${styles.endLabel}">${formatCount(views[lastI])}</text>
       <text x="${n(x(lastI) + 10)}" y="${n(yu + 4)}" class="${styles.endLabel}">${formatCount(visitors[lastI])}</text>`
    : `<text x="${n(x(lastI) + 10)}" y="${n(Math.min(yv, yu) + 4)}" class="${styles.endLabel}">${formatCount(views[lastI])}</text>`;

  const band: number = step || plotW;
  const hits: string = points.map((p: IPoint, i: number) =>
    `<rect x="${n(x(i) - band / 2)}" y="${MT}" width="${n(band)}" height="${plotH}" class="${styles.hit}" data-cx="${n(x(i))}"
      data-tip="${tip([p.label, `Page views: ${p.views.toLocaleString('en-US')}`, `Visitors: ${p.visitors.toLocaleString('en-US')}`])}"></rect>`).join('');

  return `<svg class="${styles.chart}" width="${TW}" height="${TH}" viewBox="0 0 ${TW} ${TH}" role="img" aria-label="${escape(ariaLabel)}">
    ${grid}${xLabels}
    <path d="${area}" style="fill:${VIEWS};opacity:.1"></path>
    <polyline points="${line(visitors)}" class="${styles.series}" style="stroke:${VISITORS}"></polyline>
    <polyline points="${line(views)}" class="${styles.series}" style="stroke:${VIEWS}"></polyline>
    <circle cx="${n(x(lastI))}" cy="${n(yu)}" r="4" class="${styles.endDot}" style="fill:${VISITORS}"></circle>
    <circle cx="${n(x(lastI))}" cy="${n(yv)}" r="4" class="${styles.endDot}" style="fill:${VIEWS}"></circle>
    ${endLabels}
    <line data-crosshair="1" x1="0" x2="0" y1="${MT}" y2="${MT + plotH}" class="${styles.crosshair}"></line>
    ${hits}
  </svg>`;
}

// ------------------------------------------------------------ columns (bar)

const CH: number = 240;

/** Page views per month, one series. Labels on the busiest and the current month only. */
export function columnChart(points: IPoint[], ariaLabel: string, width: number): string {
  const CW: number = Math.max(240, Math.round(width));
  const max: number = points.reduce((m: number, p: IPoint) => Math.max(m, p.views), 0);
  const ticks: number[] = niceTicks(max);
  const top: number = ticks[ticks.length - 1];
  const plotW: number = CW - ML - 16;
  const plotH: number = CH - MT - MB;
  const slot: number = plotW / points.length;
  const barW: number = Math.min(24, slot * 0.6);
  const y = (v: number): number => MT + plotH - (v / top) * plotH;
  let busiest: number = -1;
  points.forEach((p: IPoint, i: number) => { if (p.views > 0 && (busiest < 0 || p.views > points[busiest].views)) { busiest = i; } });

  const grid: string = ticks.map((t: number) =>
    `<line x1="${ML}" x2="${CW - 16}" y1="${n(y(t))}" y2="${n(y(t))}" class="${t === 0 ? styles.axisLine : styles.gridLine}"></line>
     <text x="${ML - 8}" y="${n(y(t) + 4)}" text-anchor="end" class="${styles.tick}">${tickLabel(t, top)}</text>`).join('');
  const cols: string = points.map((p: IPoint, i: number) => {
    const cx: number = ML + slot * i + slot / 2;
    const h: number = (p.views / top) * plotH;
    const label: boolean = p.views > 0 && (i === busiest || i === points.length - 1);
    // Narrow chart: label every other month, always including the current one.
    const every: number = slot < 32 ? 2 : 1;
    const axisLabel: boolean = i % every === (points.length - 1) % every;
    return `<g>
      <path d="${columnPath(cx - barW / 2, y(p.views), barW, h)}" style="fill:${VIEWS}"></path>
      ${label ? `<text x="${n(cx)}" y="${n(y(p.views) - 6)}" text-anchor="middle" class="${styles.endLabel}">${formatCount(p.views)}</text>` : ''}
      ${axisLabel ? `<text x="${n(cx)}" y="${CH - 8}" text-anchor="middle" class="${styles.tick}">${escape(p.label.substring(0, 3))}</text>` : ''}
      <rect x="${n(cx - slot / 2)}" y="${MT}" width="${n(slot)}" height="${plotH}" class="${styles.hit}" tabindex="0"
        data-tip="${tip([p.label, `Page views: ${p.views.toLocaleString('en-US')}`, `Visitors: ${p.visitors.toLocaleString('en-US')}`])}"></rect>
    </g>`;
  }).join('');
  return `<svg class="${styles.chart}" width="${CW}" height="${CH}" viewBox="0 0 ${CW} ${CH}" role="img" aria-label="${escape(ariaLabel)}">${grid}${cols}</svg>`;
}

// ----------------------------------------------------------------- donut

function arc(cx: number, cy: number, r0: number, r1: number, a0: number, a1: number): string {
  const p = (r: number, a: number): string => `${n(cx + r * Math.sin(a))},${n(cy - r * Math.cos(a))}`;
  const large: number = a1 - a0 > Math.PI ? 1 : 0;
  return `M${p(r1, a0)}A${r1},${r1} 0 ${large} 1 ${p(r1, a1)}L${p(r0, a1)}A${r0},${r0} 0 ${large} 0 ${p(r0, a0)}Z`;
}

/** This month's page views by site. Segments are separated by a 2px surface gap. */
export function donutChart(shares: IShare[], ariaLabel: string): string {
  const total: number = shares.reduce((s: number, x: IShare) => s + x.views, 0);
  const size: number = 200;
  const c: number = size / 2;
  const r1: number = 92;
  const r0: number = 64;
  let a: number = 0;
  const segments: string = shares.map((s: IShare) => {
    const share: number = total > 0 ? s.views / total : 0;
    const a1: number = a + share * Math.PI * 2;
    const tipText: string = tip([s.name, `Page views: ${s.views.toLocaleString('en-US')}`, `Share: ${Math.round(share * 1000) / 10}%`]);
    const shape: string = shares.length === 1
      ? `<circle cx="${c}" cy="${c}" r="${(r0 + r1) / 2}" style="fill:none;stroke:${siteColour(s.colour)};stroke-width:${r1 - r0}" data-tip="${tipText}" tabindex="0"></circle>`
      : `<path d="${arc(c, c, r0, r1, a, a1)}" class="${styles.segment}" style="fill:${siteColour(s.colour)}" data-tip="${tipText}" tabindex="0"></path>`;
    a = a1;
    return shape;
  }).join('');
  const rows: string = shares.map((s: IShare) =>
    `<li><span class="${styles.keyDot}" style="background:${siteColour(s.colour)}"></span>
      <span class="${styles.shareName}">${escape(s.name)}</span>
      <span class="${styles.shareValue}">${formatCount(s.views)}</span>
      <span class="${styles.sharePct}">${total > 0 ? Math.round((s.views / total) * 100) : 0}%</span></li>`).join('');
  return `<div class="${styles.donutWrap}">
    <svg class="${styles.donut}" viewBox="0 0 ${size} ${size}" role="img" aria-label="${escape(ariaLabel)}">
      ${segments}
      <text x="${c}" y="${c + 2}" text-anchor="middle" class="${styles.donutValue}">${formatCount(total)}</text>
      <text x="${c}" y="${c + 22}" text-anchor="middle" class="${styles.tick}">page views</text>
    </svg>
    <ul class="${styles.shareList}">${rows}</ul>
  </div>`;
}

// ------------------------------------------------------------- top pages

/** Horizontal bars, value at the tip. Bar colour is the page's site; the site name is also printed. */
export function topPagesChart(pages: ITopPage[], showSite: boolean): string {
  const max: number = pages.reduce((m: number, p: ITopPage) => Math.max(m, p.views), 0) || 1;
  return `<ol class="${styles.bars}">${pages.map((p: ITopPage) => {
    const title: string = safeHref(p.url)
      ? `<a href="${escape(safeHref(p.url))}" target="_blank" rel="noopener">${escape(p.title)}</a>`
      : escape(p.title);
    return `<li data-tip="${tip([p.title, ...(showSite ? [p.siteName] : []), `Page views: ${p.views.toLocaleString('en-US')}`, `Visitors: ${p.visitors.toLocaleString('en-US')}`])}">
      <div class="${styles.barLabel}"><span class="${styles.barTitle}">${title}</span>${showSite ? `<span class="${styles.barSite}">${escape(p.siteName)}</span>` : ''}</div>
      <div class="${styles.barRow}">
        <span class="${styles.barFill}" style="width:calc((100% - 64px) * ${Math.max(0.01, p.views / max).toFixed(3)});background:${siteColour(p.colour)}"></span>
        <span class="${styles.barValue}">${formatCount(p.views)}</span>
      </div>
    </li>`;
  }).join('')}</ol>`;
}
