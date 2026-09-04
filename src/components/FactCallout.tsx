import ScrollReveal from "./ScrollReveal";

type Props = {
  stat: string;
  detail: string;
  source: string;
  sourceUrl: string;
  // 2+ hex stops, extracted from a specific Calendly reference screenshot —
  // not the earlier flat brand palette. Order matters: it's the gradient's
  // colour sequence.
  colours: string[];
  // Matches the decorative texture visible in the reference screenshot the
  // colours were pulled from: thin vertical streaks, or a diamond lattice.
  pattern?: "lines" | "diamonds";
  // Overrides the default top-margin spacing — needed when this sits inside
  // a grid column (e.g. paired beside the hero) instead of stacked in the
  // page's normal vertical flow.
  className?: string;
  // Stretches the card to a taller fixed height than its content needs —
  // used to line its bottom edge up with something in a neighbouring column
  // (content otherwise stays top-aligned inside the extra space).
  minHeight?: string;
};

// Lightens a hex colour toward white by `ratio` so a multi-stop gradient can
// fill the whole card behind dark text and still clear WCAG AA contrast
// everywhere along it. The Calendly screenshots this is sourced from include
// genuinely dark navy — darker than anything in the original brand palette —
// so this needs a bigger push toward white than the flat-palette version did.
function lighten(hex: string, ratio: number): string {
  const n = parseInt(hex.replace("#", ""), 16);
  const mix = (channel: number) => Math.round(channel * (1 - ratio) + 255 * ratio);
  const r = mix((n >> 16) & 255);
  const g = mix((n >> 8) & 255);
  const b = mix(n & 255);
  return `rgb(${r}, ${g}, ${b})`;
}

// Vertical rays of irregular length that don't run edge-to-edge — matches
// the Product Demo screenshot's line texture, not the uniform full-height
// stripe from the Callie screenshot. A single repeating-linear-gradient
// can't vary each line's length, so this tiles a small SVG instead.
const RAY_TILE_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="140">' +
  '<g stroke="white" stroke-width="1.5" stroke-linecap="round" opacity="0.4">' +
  '<line x1="8" y1="14" x2="8" y2="52"/>' +
  '<line x1="20" y1="55" x2="20" y2="118"/>' +
  '<line x1="34" y1="8" x2="34" y2="36"/>' +
  '<line x1="48" y1="62" x2="48" y2="128"/>' +
  '<line x1="58" y1="22" x2="58" y2="58"/>' +
  "</g></svg>";
const LINE_TEXTURE = `url("data:image/svg+xml,${encodeURIComponent(RAY_TILE_SVG)}")`;
const DIAMOND_TEXTURE =
  "repeating-linear-gradient(45deg, rgba(255,255,255,0.2) 0px, rgba(255,255,255,0.2) 1px, transparent 1px, transparent 18px), " +
  "repeating-linear-gradient(-45deg, rgba(255,255,255,0.2) 0px, rgba(255,255,255,0.2) 1px, transparent 1px, transparent 18px)";

export default function FactCallout({ stat, detail, source, sourceUrl, colours, pattern, className = "mt-14", minHeight }: Props) {
  const gradient = `linear-gradient(150deg, ${colours.map((c) => lighten(c, 0.5)).join(", ")})`;
  const backgroundImage =
    pattern === "lines" ? `${LINE_TEXTURE}, ${gradient}` : pattern === "diamonds" ? `${DIAMOND_TEXTURE}, ${gradient}` : gradient;

  return (
    <ScrollReveal className={className}>
      <div className="rounded-[28px] p-6 sm:p-8" style={{ backgroundImage, minHeight }}>
        <p className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">{stat}</p>
        <p className="mt-2 max-w-prose text-ink">{detail}</p>
        <a
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-block text-xs text-ink underline underline-offset-2 hover:no-underline"
        >
          {source}
        </a>
      </div>
    </ScrollReveal>
  );
}
