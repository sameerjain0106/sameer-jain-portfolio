import { phase7Summary } from "@/data/etfResearch";

const ink = "#152349";
const blue = "#2144c8";
const coral = "#ce5247";
const ochre = "#90651b";
const mint = "#1d7774";
const thinInk = "#15234936";
const { statistical_result: result, momentum_comparison: comparison } = phase7Summary;
const yearlyMeans = [
  { label: "2024", mean: result.annual_confirmation_ic["2024"], color: blue },
  { label: "2025", mean: result.annual_confirmation_ic["2025"], color: mint },
  { label: "2026 partial", mean: result.annual_confirmation_ic.partial_2026, color: ochre },
];
const estimates = [
  { label: "Frozen model vs. zero", mean: result.confirmation_mean_spearman_ic, interval: result.hac_95_ci, color: blue },
  { label: "Model minus momentum", mean: comparison.cstar_minus_momentum_ic, interval: comparison.paired_hac_95_ci, color: coral },
];
const fullTicks = [-.05, 0, .05, .10, .15, .20, .25];
const compactTicks = [-.05, 0, .10, .20, .25];
const domain = { min: -.075, max: .26 };

function ease(progress: number, start: number, end: number) {
  const fraction = Math.min(1, Math.max(0, (progress - start) / (end - start)));
  return fraction * fraction * (3 - 2 * fraction);
}

function decimal(value: number, digits = 3) {
  return value.toFixed(digits).replace("-", "−");
}

function text(
  ctx: CanvasRenderingContext2D, label: string, x: number, y: number, size: number,
  color: string, align: CanvasTextAlign = "left", numeric = false,
) {
  ctx.font = numeric
    ? `500 ${size}px ui-monospace, Consolas, monospace`
    : `650 ${size}px system-ui, sans-serif`;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.fillText(label, x, y);
}

function point(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, color: string) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
}

/** Two tests share a fixed zero line and the same Spearman IC domain throughout. */
export function drawEvidenceScope(ctx: CanvasRenderingContext2D, width: number, height: number, progress: number) {
  const compact = width < 480 || height < 330;
  const left = compact ? 15 : 36;
  const right = width - left;
  const top = compact ? 42 : 69;
  const axis = height - (compact ? 54 : 82);
  const plotHeight = Math.max(1, axis - top);
  const small = compact ? 9.5 : 12;
  const labels = compact ? 11 : 17;
  const x = (value: number) => left + (right - left) * (value - domain.min) / (domain.max - domain.min);
  const zero = x(0);
  const caption = ease(progress, .31, .43);
  const ticks = compact ? compactTicks : fullTicks;

  ctx.save();
  const opacity = ctx.globalAlpha;
  ctx.textBaseline = "alphabetic";
  ctx.lineCap = "round";
  text(ctx, width < 300 ? "Confirmation" : "Confirmation evidence", left, compact ? 22 : 37, compact ? 16 : 26, ink);
  text(ctx, compact ? `${result.weekly_decisions} decisions` : `${result.weekly_decisions} weekly decisions`, right, compact ? 22 : 37, small, ink, "right", true);

  ctx.strokeStyle = thinInk;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(left, axis);
  ctx.lineTo(right, axis);
  for (const tick of ticks) {
    const at = x(tick);
    ctx.moveTo(at, top);
    ctx.lineTo(at, axis + 4);
  }
  ctx.stroke();
  ctx.strokeStyle = ink;
  ctx.setLineDash([3, 4]);
  ctx.beginPath();
  ctx.moveTo(zero, top - 5);
  ctx.lineTo(zero, axis + 2);
  ctx.stroke();
  ctx.setLineDash([]);
  for (const tick of ticks) {
    text(ctx, tick === 0 ? "0" : decimal(tick, 2), x(tick), axis + (compact ? 16 : 18), small, ink, "center", true);
  }

  if (caption < 1) {
    ctx.globalAlpha = opacity * (1 - caption);
    text(ctx, "Annual mean Spearman IC", left, top + 7, labels, ink);
    yearlyMeans.forEach(({ label, mean, color }, index) => {
      const y = top + plotHeight * (.34 + index * .23);
      const arrival = ease(progress, index * .048 - .04, .19 + index * .048);
      const tip = zero + (x(mean) - zero) * arrival;
      text(ctx, label, left, y - 8, small, ink);
      ctx.strokeStyle = color;
      ctx.lineWidth = compact ? 2 : 3;
      ctx.beginPath();
      ctx.moveTo(zero, y);
      ctx.lineTo(tip, y);
      ctx.stroke();
      point(ctx, tip, y, compact ? 3 : 4.5, color);
      ctx.globalAlpha = opacity * (1 - caption) * ease(arrival, .65, 1);
      text(ctx, decimal(mean), x(mean) + (compact ? 10 : 12), y + 3.5, small, ink, "left", true);
      ctx.globalAlpha = opacity * (1 - caption);
    });
  }

  if (caption > 0) {
    estimates.forEach(({ label, mean, interval, color }, index) => {
      const intro = ease(progress, .35 + index * .23, .48 + index * .23);
      if (!intro) return;
      const expansion = ease(progress, .38 + index * .22, .62 + index * .28);
      const meanX = x(mean);
      const lo = meanX + (x(interval[0]) - meanX) * expansion;
      const hi = meanX + (x(interval[1]) - meanX) * expansion;
      const y = top + plotHeight * (.31 + index * .47);
      const cap = compact ? 6 : 9;
      ctx.globalAlpha = opacity * intro;
      text(ctx, label, left, y - cap - 9, labels, ink);
      text(ctx, decimal(mean), right, y - cap - 9, labels, color, "right", true);
      ctx.strokeStyle = color;
      ctx.lineWidth = compact ? 2.5 : 4;
      ctx.beginPath();
      ctx.moveTo(lo, y);
      ctx.lineTo(hi, y);
      ctx.moveTo(lo, y - cap);
      ctx.lineTo(lo, y + cap);
      ctx.moveTo(hi, y - cap);
      ctx.lineTo(hi, y + cap);
      ctx.stroke();
      point(ctx, meanX, y, compact ? 4.5 : 6, color);

      const settled = ease(expansion, .66, 1);
      if (settled) {
        ctx.globalAlpha = opacity * settled;
        text(ctx, `HAC 95% CI ${decimal(interval[0])} to ${decimal(interval[1])}`, right, y + cap + 13, small, ink, "right", true);
      }
      const zeroCrossing = index === 1 && lo < zero;
      if (zeroCrossing) {
        // Put a registration mark exactly where the paired interval intersects zero.
        ctx.globalAlpha = opacity * ease(progress, .72, .94);
        ctx.strokeStyle = ink;
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.arc(zero, y, compact ? 6 : 9, 0, Math.PI * 2);
        ctx.stroke();
      }
    });
  }

  const showYears = ease(progress, .48, .74);
  if (showYears) {
    ctx.globalAlpha = opacity * showYears;
    const footer = height - (compact ? 13 : 22);
    const columnWidth = (right - left) / yearlyMeans.length;
    yearlyMeans.forEach(({ label, mean, color }, index) => {
      const column = left + columnWidth * index;
      if (compact) {
        const center = column + columnWidth * .5;
        text(ctx, label, center, footer - 10, small, ink, "center");
        text(ctx, decimal(mean), center, footer + 3, small, color, "center", true);
      } else {
        point(ctx, column + 2, footer - 3, 3, color);
        text(ctx, label, column + 12, footer, small, ink);
        text(ctx, decimal(mean), column + columnWidth - 12, footer, small, color, "right", true);
      }
    });
  }
  ctx.restore();
}
