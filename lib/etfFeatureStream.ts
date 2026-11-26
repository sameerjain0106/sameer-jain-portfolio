import { phase7Summary } from "@/data/etfResearch";
import { etfFeatureFamilies } from "@/data/etfStory";

const ink = "#152349";
const cobalt = "#2144c8";
const paper = "#fbf5e8";
const channels = ["#2144c8", "#1d7774", "#ce5247", "#d49b28"];
const exampleOrder = ["C", "A", "E", "B", "D"];
const scores = phase7Summary.model.configuration;
const inputCount = phase7Summary.feature_names.length;
const parameters = `α ${scores.alpha}   L1 ratio ${scores.l1_ratio}`;

const clamp = (value: number) => Math.max(0, Math.min(1, value));
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

function smooth(value: number) {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
}

// Draw only the traveled portion of the curve using de Casteljau subdivision.
function trace(ctx: CanvasRenderingContext2D, x0: number, y0: number, x3: number, y3: number, t: number) {
  const x1 = mix(x0, x3, .46);
  const x2 = mix(x0, x3, .6);
  const ax = mix(x0, x1, t);
  const bx = mix(x1, x2, t);
  const cx = mix(x2, x3, t);
  const by = mix(y0, y3, t);
  const dx = mix(ax, bx, t);
  const dy = mix(y0, by, t);
  const ex = mix(bx, cx, t);
  const ey = mix(by, y3, t);
  const x = mix(dx, ex, t);
  const y = mix(dy, ey, t);
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.bezierCurveTo(ax, y0, dx, dy, x, y);
  ctx.stroke();
  return { x, y };
}

function dot(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

export function drawFeatureStream(ctx: CanvasRenderingContext2D, w: number, h: number, progress: number) {
  const compact = w < 490;
  const margin = compact ? 12 : 27;
  const inputX = margin + (compact ? 71 : 121);
  const modelX = w * (compact ? .51 : .53);
  const modelY = h * .48;
  const radius = Math.min(compact ? 16 : 31, h * .085);
  const rankX = w - margin - (compact ? 15 : 25);
  const rankTop = h * .26;
  const rankGap = h * .113;
  const familyGap = h * .166;
  const incoming = smooth(progress / .67);
  const writing = smooth((progress - .32) / .38);
  const ordering = smooth((progress - .56) / .44);
  const baseAlpha = ctx.globalAlpha;
  const font = "system-ui, sans-serif";

  ctx.save();
  ctx.textBaseline = "middle";
  ctx.lineCap = "round";

  ctx.fillStyle = ink;
  ctx.font = `700 ${compact ? 11 : 16}px ${font}`;
  ctx.fillText(`${inputCount} model inputs`, margin, h * .11);
  ctx.textAlign = "right";
  ctx.fillText("Weekly rank", rankX + 10, h * .11);
  ctx.textAlign = "left";

  etfFeatureFamilies.forEach((family, familyIndex) => {
    const middle = modelY + (familyIndex - 1.5) * familyGap;
    const channel = channels[familyIndex];
    const span = Math.min(compact ? 3.3 : 5.5, familyGap / (family.features.length + 1));
    ctx.fillStyle = channel;
    ctx.fillRect(margin, middle - 5, 2, 10);
    ctx.fillStyle = ink;
    ctx.font = `550 ${compact ? 10 : 13}px ${font}`;
    ctx.fillText(family.name, margin + 6, middle);
    for (let index = 0; index < family.features.length; index += 1) {
      const strand = index - (family.features.length - 1) / 2;
      const y0 = middle + strand * span;
      const y1 = modelY + (familyIndex - 1.5) * radius * .33 + strand * radius * .15;
      const length = smooth((incoming - (familyIndex + index * .35) * .035) * 1.2);
      ctx.lineWidth = compact ? .9 : 1.35;
      ctx.strokeStyle = channel;
      if (length < 1) {
        ctx.globalAlpha = baseAlpha * .19;
        trace(ctx, inputX, y0, modelX, y1, 1);
      }
      ctx.globalAlpha = baseAlpha * .9;
      const step = trace(ctx, inputX, y0, modelX, y1, length);
      if (length < .99) {
        ctx.fillStyle = channel;
        dot(ctx, step.x, step.y, compact ? 1 : 1.55);
      }
    }
    ctx.globalAlpha = baseAlpha;
  });

  ctx.strokeStyle = "#1523492a";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(rankX + 1, rankTop - 5);
  ctx.lineTo(rankX + 1, rankTop + (exampleOrder.length - 1) * rankGap + 5);
  ctx.stroke();

  exampleOrder.forEach((symbol, rank) => {
    const initialLane = symbol.charCodeAt(0) - 65;
    const finish = rankTop + rank * rankGap;
    const initial = rankTop + initialLane * rankGap;
    const endY = mix(initial, finish, ordering);
    const length = smooth((writing - rank * .055) * 1.3);
    ctx.globalAlpha = baseAlpha * mix(.16, .79, length);
    ctx.strokeStyle = cobalt;
    ctx.lineWidth = compact ? .85 : 1.3;
    const mark = trace(ctx, modelX, modelY + (initialLane - 2) * radius * .24, rankX, endY, length);
    ctx.fillStyle = cobalt;
    if (length > 0) {
      dot(ctx, mark.x, mark.y, compact ? 2.8 : 3.8);
      ctx.textAlign = "right";
      ctx.font = `700 ${compact ? 10 : 15}px ${font}`;
      if (writing > .22) ctx.fillText(symbol, mark.x - 6, mark.y - (compact ? 4 : 6));
    }
    ctx.globalAlpha = baseAlpha;
    ctx.fillStyle = ink;
    ctx.textAlign = "left";
    ctx.font = `500 ${compact ? 9 : 12}px ${font}`;
    ctx.fillText(String(rank + 1), rankX + 8, finish);
  });

  // The circular score head locks its position as the rank curves pass through.
  ctx.lineWidth = compact ? 1.2 : 1.8;
  ctx.fillStyle = paper;
  dot(ctx, modelX, modelY, radius);
  ctx.strokeStyle = "#15234950";
  ctx.stroke();
  ctx.strokeStyle = cobalt;
  ctx.beginPath();
  ctx.arc(modelX, modelY, radius, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * smooth((progress - .09) / .51));
  ctx.stroke();
  ctx.fillStyle = cobalt;
  ctx.beginPath();
  ctx.moveTo(modelX, modelY - radius * .42);
  ctx.lineTo(modelX + radius * .42, modelY);
  ctx.lineTo(modelX, modelY + radius * .42);
  ctx.lineTo(modelX - radius * .42, modelY);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = paper;
  dot(ctx, modelX, modelY, radius * .12);

  const footer = h * .89;
  ctx.fillStyle = ink;
  ctx.textAlign = "left";
  ctx.font = `650 ${compact ? 11 : 16}px ${font}`;
  ctx.fillText("Frozen Elastic Net", margin, footer);
  ctx.font = `500 ${compact ? 10 : 12}px ${font}`;
  ctx.fillText(parameters, margin, footer + (compact ? 13 : 19));
  ctx.textAlign = "right";
  ctx.fillText("Illustrative ETF order", w - margin, footer + (compact ? 13 : 19));
  ctx.restore();
}
