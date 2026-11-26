import type { SignalRow } from "@/components/PaperSignalExplorer";

const ink = "#152349";
const blue = "#2144c8";
const positive = "#1d7774";
const negative = "#bd443e";
const clamp = (n: number) => Math.max(0, Math.min(1, n));
const mono = "ui-monospace, Consolas, monospace";

export function drawSignalTrace(ctx: CanvasRenderingContext2D, width: number, height: number, progress: number, row: SignalRow) {
  const compact = width < 470;
  const font = compact ? 10 : 14;
  const edge = compact ? 23 : 45;
  const midpoint = width / 2;
  const origin = height * .48;
  const span = midpoint - edge;
  const ranksY = height * .81;
  const marginY = Math.max(14, height * .064);
  const rows = [row.major_negative_contributors, row.major_positive_contributors];
  const strongest = Math.max(.001, ...rows.flatMap(group => group.map(item => Math.abs(item.contribution))));

  ctx.fillStyle = ink;
  ctx.font = `700 ${compact ? 25 : 43}px system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText(row.ticker, midpoint, height * .17);
  ctx.font = `${font}px ${mono}`;
  ctx.fillText("Published feature contributions", midpoint, height * .26);

  ctx.lineCap = "round";
  ctx.strokeStyle = "#a4a5b4";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(midpoint, origin - marginY * 2.45);
  ctx.lineTo(midpoint, origin + marginY * 2.45);
  ctx.stroke();

  for (let side = 0; side < rows.length; side++) {
    const color = side ? positive : negative;
    const direction = side ? 1 : -1;
    ctx.strokeStyle = ctx.fillStyle = color;
    const group = rows[side];
    for (let i = 0; i < group.length; i++) {
      const point = group[i];
      const draw = clamp((progress - i * .046) / .54);
      if (!draw) continue;
      const distance = span * (.23 + .75 * Math.abs(point.contribution) / strongest);
      const endX = midpoint + direction * distance * draw;
      const endY = origin + (i - (group.length - 1) / 2) * marginY * draw;
      ctx.lineWidth = i === 0 ? 2.7 : 1.3;
      ctx.beginPath();
      ctx.moveTo(midpoint, origin);
      ctx.bezierCurveTo(midpoint + (endX - midpoint) * .4, origin, midpoint + (endX - midpoint) * .58, endY, endX, endY);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(endX, endY, i === 0 ? 4 : 2.4, 0, 2 * Math.PI);
      ctx.fill();
    }
    ctx.textAlign = side ? "right" : "left";
    ctx.fillText(side ? "+ Raised score" : "− Lowered score", side ? width - edge : edge, height * .686);
  }

  const rank = clamp((progress - .47) / .53);
  ctx.strokeStyle = "#a4a5b4";
  ctx.beginPath();
  ctx.moveTo(edge, ranksY);
  ctx.lineTo(width - edge, ranksY);
  ctx.stroke();
  ctx.fillStyle = ink;
  ctx.textAlign = "left";
  ctx.fillText("0", edge, ranksY + marginY);
  ctx.textAlign = "right";
  ctx.fillText("100", width - edge, ranksY + marginY);
  ctx.textAlign = "center";
  ctx.fillText("Model-score percentile", midpoint, ranksY + marginY);
  if (rank > 0) {
    const percentile = row.model_score_percentile;
    const marker = edge + span * 2 * percentile;
    ctx.strokeStyle = blue;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(edge, ranksY);
    ctx.lineTo(edge + (marker - edge) * rank, ranksY);
    ctx.stroke();
    ctx.fillStyle = blue;
    ctx.beginPath();
    ctx.arc(marker, ranksY, 5 * rank, 0, 2 * Math.PI);
    ctx.fill();
    ctx.textAlign = percentile > .7 ? "right" : "left";
    ctx.fillText((percentile * 100).toFixed(1), marker, ranksY - marginY * .7);
  }
}

export function drawEvidenceBoundary(ctx: CanvasRenderingContext2D, width: number, height: number, progress: number) {
  const compact = width < 470;
  const left = width * .09;
  const right = width * .91;
  const cutoff = width * .62;
  const y = height * .40;
  const track = clamp(progress * 1.8);
  const future = clamp((progress - .29) / .63);
  const fontSize = compact ? 10 : 14;

  ctx.fillStyle = ink;
  ctx.textAlign = "left";
  ctx.font = `700 ${compact ? 18 : 31}px system-ui, sans-serif`;
  ctx.fillText("The record ends here", left, height * .18);
  ctx.font = `${fontSize}px ${mono}`;
  ctx.fillText("Sealed confirmation", left, y - 21);
  ctx.textAlign = "right";
  ctx.fillText("Forward test", right, y - 21);

  ctx.strokeStyle = "#bbc0cc";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(left, y);
  ctx.lineTo(cutoff, y);
  ctx.stroke();
  ctx.strokeStyle = blue;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(left, y);
  ctx.lineTo(left + (cutoff - left) * track, y);
  ctx.stroke();

  ctx.fillStyle = blue;
  ctx.textAlign = "left";
  ctx.fillText("2024", left, y + 26);
  ctx.textAlign = "right";
  ctx.fillText("2026 (partial)", cutoff - 8, y + 26);
  if (future <= 0) return;

  // The dotted path conveys the published status, with no realized return drawn.
  ctx.strokeStyle = "#66738d";
  ctx.lineWidth = 2;
  ctx.setLineDash([4, 6]);
  ctx.beginPath();
  ctx.moveTo(cutoff, y);
  ctx.lineTo(cutoff + (right - cutoff) * future, y);
  ctx.stroke();
  ctx.setLineDash([]);

  const aperture = height * .18 * future;
  ctx.strokeStyle = negative;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cutoff, y - aperture);
  ctx.lineTo(cutoff, y + aperture);
  ctx.stroke();
  ctx.fillStyle = negative;
  ctx.beginPath();
  ctx.arc(cutoff, y, 4.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.textAlign = "center";
  ctx.fillText("Outcome pending", (cutoff + right) / 2, y + 26);

  const checks = ["Unseen ETFs", "New dates", "Independent test"];
  const opacity = ctx.globalAlpha;
  const validation = clamp((progress - .47) / .42);
  if (!validation) return;
  const junctionY = height * .61;
  const testY = height * .84;
  const gap = (right - left) / checks.length;
  ctx.globalAlpha = opacity * validation;
  ctx.fillStyle = ink;
  ctx.textAlign = "left";
  ctx.fillText("Further validation", left, junctionY);
  for (let i = 0; i < checks.length; i++) {
    const draw = clamp((validation - i * .13) / .72);
    if (!draw) continue;
    const endX = left + gap * (i + .5);
    const elbowY = junctionY + (8 + i * (compact ? 3 : 7));
    const traceX = cutoff + (endX - cutoff) * draw;
    const traceY = junctionY + (testY - junctionY) * draw;
    ctx.strokeStyle = i === 2 ? positive : blue;
    ctx.fillStyle = ctx.strokeStyle;
    ctx.lineWidth = 1.25;
    ctx.beginPath();
    ctx.moveTo(cutoff, junctionY);
    ctx.bezierCurveTo(cutoff, elbowY, traceX, elbowY + 6, traceX, traceY);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(traceX, traceY, 3.5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.textAlign = "center";
    ctx.globalAlpha = opacity * clamp((draw - .82) / .18);
    ctx.fillText(checks[i], endX, testY + (compact ? 16 : 23));
    ctx.globalAlpha = opacity * validation;
  }
}
