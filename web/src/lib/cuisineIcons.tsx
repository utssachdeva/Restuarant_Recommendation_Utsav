"use client";

import { useId, type ReactNode } from "react";

export type CuisineKind =
  | "south"
  | "north"
  | "chinese"
  | "italian"
  | "continental"
  | "cafe"
  | "biryani"
  | "seafood";

export type CuisineIconDef = {
  id: string;
  kind: CuisineKind;
  label: string;
  tint: string;
};

const FEATURED: CuisineIconDef[] = [
  { id: "south indian", kind: "south", label: "South Indian", tint: "#FFF1C9" },
  { id: "north indian", kind: "north", label: "North Indian", tint: "#FFE4D2" },
  { id: "chinese", kind: "chinese", label: "Chinese", tint: "#FBE9E4" },
  { id: "italian", kind: "italian", label: "Italian", tint: "#FFE9E2" },
  { id: "continental", kind: "continental", label: "Continental", tint: "#FFF0D9" },
  { id: "cafe", kind: "cafe", label: "Cafe", tint: "#F3EBE2" },
  { id: "biryani", kind: "biryani", label: "Biryani", tint: "#FFF3D6" },
  { id: "seafood", kind: "seafood", label: "Seafood", tint: "#E3F1F7" },
];

const BY_ID = new Map(FEATURED.map((c) => [c.id, c]));

const KIND_BY_TEST: { test: RegExp; kind: CuisineKind; tint: string }[] = [
  { test: /pizza|italian|pasta/, kind: "italian", tint: "#FFE9E2" },
  {
    test: /south|dosa|idli|uttapam|andhra|kerala|chettinad/,
    kind: "south",
    tint: "#FFF1C9",
  },
  {
    test: /north|punjabi|mughlai|tandoor|curry/,
    kind: "north",
    tint: "#FFE4D2",
  },
  {
    test: /chinese|momos|asian|thai|japanese|korean/,
    kind: "chinese",
    tint: "#FBE9E4",
  },
  {
    test: /cafe|coffee|bakery|dessert|ice cream/,
    kind: "cafe",
    tint: "#F3EBE2",
  },
  { test: /biryani|rice|hyderabadi/, kind: "biryani", tint: "#FFF3D6" },
  {
    test: /seafood|fish|coastal|mangalore/,
    kind: "seafood",
    tint: "#E3F1F7",
  },
  {
    test: /continental|european|american|mexican|burger/,
    kind: "continental",
    tint: "#FFF0D9",
  },
];

export const FEATURED_CUISINE_ICONS = FEATURED;

export function cuisineIconFor(cuisine: string): CuisineIconDef {
  const key = cuisine.trim().toLowerCase();
  const known = BY_ID.get(key);
  if (known) return known;
  for (const fb of KIND_BY_TEST) {
    if (fb.test.test(key)) {
      return {
        id: key,
        kind: fb.kind,
        label: cuisine,
        tint: fb.tint,
      };
    }
  }
  return {
    id: key,
    kind: "italian",
    label: cuisine,
    tint: "#FFE9E2",
  };
}

type GlyphProps = { kind: CuisineKind; className?: string };

export function FoodGlyph({ kind, className = "h-full w-full" }: GlyphProps) {
  const uid = useId().replace(/:/g, "");
  switch (kind) {
    case "italian":
      return <ItalianGlyph uid={uid} className={className} />;
    case "south":
      return <SouthGlyph uid={uid} className={className} />;
    case "north":
      return <NorthGlyph uid={uid} className={className} />;
    case "chinese":
      return <ChineseGlyph uid={uid} className={className} />;
    case "continental":
      return <ContinentalGlyph uid={uid} className={className} />;
    case "cafe":
      return <CafeGlyph uid={uid} className={className} />;
    case "biryani":
      return <BiryaniGlyph uid={uid} className={className} />;
    case "seafood":
      return <SeafoodGlyph uid={uid} className={className} />;
  }
}

type SvgProps = { uid: string; className?: string };

function ItalianGlyph({ uid, className }: SvgProps) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      <defs>
        <linearGradient id={`${uid}-ch`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFDB74" />
          <stop offset="1" stopColor="#F3B13B" />
        </linearGradient>
        <linearGradient id={`${uid}-cr`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#EBAA5E" />
          <stop offset="1" stopColor="#B9692A" />
        </linearGradient>
        <radialGradient id={`${uid}-pep`} cx="0.35" cy="0.35" r="0.7">
          <stop offset="0" stopColor="#E35A42" />
          <stop offset="1" stopColor="#B22D20" />
        </radialGradient>
      </defs>
      <ellipse cx="50" cy="93" rx="20" ry="3.5" fill="#000" opacity="0.1" />
      <path d="M50 90 L20 30 Q50 18 80 30 Z" fill={`url(#${uid}-ch)`} />
      <path d="M33 52 q1.5 7 3.5 0 M63 56 q1.5 6 3 0" fill="#F3B13B" />
      <path
        d="M17 27 Q50 11 83 27 Q85 33 80 35 Q50 21 20 35 Q15 33 17 27Z"
        fill={`url(#${uid}-cr)`}
      />
      <path
        d="M26 24 q4 -1.5 8 -2 M58 19.5 q5 0.5 9 2"
        stroke="#F6CB8A"
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="42" cy="43" r="6.2" fill={`url(#${uid}-pep)`} />
      <circle cx="61" cy="39" r="5.6" fill={`url(#${uid}-pep)`} />
      <circle cx="51" cy="62" r="5.2" fill={`url(#${uid}-pep)`} />
      <circle cx="40" cy="42" r="0.9" fill="#8E1F16" />
      <circle cx="44" cy="45" r="0.8" fill="#8E1F16" />
      <circle cx="60" cy="41" r="0.8" fill="#8E1F16" />
      <circle cx="52" cy="61" r="0.8" fill="#8E1F16" />
      <ellipse
        cx="47"
        cy="53"
        rx="4.2"
        ry="2"
        transform="rotate(-30 47 53)"
        fill="#3E8E4F"
      />
      <ellipse
        cx="64"
        cy="49"
        rx="3.6"
        ry="1.8"
        transform="rotate(25 64 49)"
        fill="#4FA35E"
      />
      <ellipse
        cx="45"
        cy="73"
        rx="3"
        ry="1.6"
        transform="rotate(10 45 73)"
        fill="#3E8E4F"
      />
      <circle cx="33" cy="34" r="2.2" fill="none" stroke="#2B2B2B" strokeWidth="1.6" />
      <circle cx="55" cy="74" r="1.8" fill="none" stroke="#2B2B2B" strokeWidth="1.4" />
    </svg>
  );
}

function SouthGlyph({ uid, className }: SvgProps) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      <defs>
        <linearGradient id={`${uid}-leaf`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#4DAA61" />
          <stop offset="1" stopColor="#2E8044" />
        </linearGradient>
        <linearGradient id={`${uid}-gold`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F8CB6A" />
          <stop offset="0.6" stopColor="#E39A36" />
          <stop offset="1" stopColor="#C2741F" />
        </linearGradient>
      </defs>
      <ellipse cx="50" cy="88" rx="34" ry="4" fill="#000" opacity="0.1" />
      <path d="M5 64 Q46 28 95 50 Q56 94 5 64Z" fill={`url(#${uid}-leaf)`} />
      <path
        d="M9 63 Q50 55 92 51"
        stroke="#25693A"
        strokeWidth="1.2"
        fill="none"
      />
      <g transform="rotate(-14 50 52)">
        <rect x="12" y="43" width="72" height="17" rx="8.5" fill={`url(#${uid}-gold)`} />
        <path
          d="M19 47 H77"
          stroke="#FBE0A3"
          strokeWidth="2.2"
          strokeLinecap="round"
          opacity="0.8"
        />
        <ellipse cx="30" cy="54" rx="2.4" ry="1.2" fill="#A9591A" opacity="0.5" />
        <ellipse cx="48" cy="56" rx="3" ry="1.3" fill="#A9591A" opacity="0.45" />
        <ellipse cx="64" cy="53" rx="2.2" ry="1.1" fill="#A9591A" opacity="0.5" />
        <ellipse cx="83" cy="51.5" rx="3.6" ry="8" fill="#B8681F" />
        <ellipse cx="83.5" cy="51.5" rx="2" ry="5" fill="#F2C14E" />
      </g>
      <circle cx="27" cy="74" r="8.5" fill="#F4F1EA" stroke="#D9D3C6" strokeWidth="1" />
      <circle cx="27" cy="74" r="6" fill="#F6F3E1" />
      <circle cx="25" cy="72.5" r="0.9" fill="#4FA35E" />
      <circle cx="29" cy="75" r="0.9" fill="#4FA35E" />
      <circle cx="26" cy="76.5" r="0.7" fill="#2B2B2B" />
      <circle cx="70" cy="77" r="8.5" fill="#F4F1EA" stroke="#D9D3C6" strokeWidth="1" />
      <circle cx="70" cy="77" r="6" fill="#DD7A2C" />
      <circle cx="68" cy="76" r="1.2" fill="#F3B13B" />
      <circle cx="72" cy="78.5" r="1" fill="#4FA35E" />
    </svg>
  );
}

function NorthGlyph({ uid, className }: SvgProps) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      <defs>
        <linearGradient id={`${uid}-naan`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F7D9A4" />
          <stop offset="1" stopColor="#DDA663" />
        </linearGradient>
        <linearGradient id={`${uid}-cop`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#A9592A" />
          <stop offset="0.45" stopColor="#E9A462" />
          <stop offset="1" stopColor="#A9592A" />
        </linearGradient>
        <radialGradient id={`${uid}-gravy`} cx="0.45" cy="0.4" r="0.7">
          <stop offset="0" stopColor="#F08A3C" />
          <stop offset="1" stopColor="#C9501F" />
        </radialGradient>
      </defs>
      <ellipse cx="54" cy="91" rx="30" ry="3.5" fill="#000" opacity="0.1" />
      <path
        d="M10 48 Q14 20 48 20 Q80 22 78 44 Q60 54 32 54 Z"
        fill={`url(#${uid}-naan)`}
      />
      <ellipse cx="28" cy="36" rx="3" ry="2" fill="#9E5A22" opacity="0.5" />
      <ellipse cx="46" cy="29" rx="2.4" ry="1.6" fill="#9E5A22" opacity="0.5" />
      <ellipse cx="62" cy="33" rx="3" ry="1.8" fill="#9E5A22" opacity="0.45" />
      <ellipse cx="38" cy="44" rx="2" ry="1.3" fill="#9E5A22" opacity="0.45" />
      <path d="M20 58 Q23 86 54 87 Q85 86 88 58 Z" fill={`url(#${uid}-cop)`} />
      <ellipse cx="54" cy="58" rx="34" ry="10" fill={`url(#${uid}-gravy)`} />
      <ellipse
        cx="54"
        cy="58"
        rx="34"
        ry="10"
        fill="none"
        stroke="#F4BE85"
        strokeWidth="2"
      />
      <rect x="38" y="54" width="7" height="5" rx="1.2" fill="#FFF1D6" />
      <rect x="60" y="57" width="6.5" height="4.5" rx="1.2" fill="#FFF1D6" />
      <path
        d="M45 61 q7 -5 14 -1 q-5 4 -10 2"
        stroke="#FFF6E8"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="52" cy="55" r="1.6" fill="#3E8E4F" />
      <circle cx="68" cy="61" r="1.4" fill="#4FA35E" />
      <circle cx="34" cy="60" r="1.4" fill="#3E8E4F" />
    </svg>
  );
}

function ChineseGlyph({ uid, className }: SvgProps) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      <defs>
        <linearGradient id={`${uid}-dmp`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFDF6" />
          <stop offset="1" stopColor="#EBDDC0" />
        </linearGradient>
        <linearGradient id={`${uid}-bam`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#9C6630" />
          <stop offset="0.5" stopColor="#D59E5B" />
          <stop offset="1" stopColor="#9C6630" />
        </linearGradient>
      </defs>
      <ellipse cx="50" cy="92" rx="36" ry="3.5" fill="#000" opacity="0.1" />
      <path
        className="zs-steam"
        d="M38 30 q-4 -6 0 -12 q4 -6 0 -12"
        stroke="#C9BBA6"
        strokeWidth="2.2"
        fill="none"
        strokeLinecap="round"
      />
      <path
        className="zs-steam"
        style={{ animationDelay: "-1.2s" }}
        d="M58 30 q-4 -6 0 -12 q4 -6 0 -12"
        stroke="#C9BBA6"
        strokeWidth="2.2"
        fill="none"
        strokeLinecap="round"
      />
      <path d="M10 60 L10 72 A40 15 0 0 0 90 72 L90 60 Z" fill={`url(#${uid}-bam)`} />
      <path
        d="M10 66 A40 15 0 0 0 90 66"
        stroke="#7E4F20"
        strokeWidth="1.2"
        fill="none"
      />
      <path
        d="M10 70 A40 15 0 0 0 90 70"
        stroke="#7E4F20"
        strokeWidth="0.8"
        fill="none"
        opacity="0.6"
      />
      <ellipse cx="50" cy="60" rx="40" ry="15" fill="#DDA96A" />
      <ellipse cx="50" cy="60" rx="35" ry="12" fill="#F4E8CD" />
      {[
        [37, 56],
        [22, 65],
        [52, 65],
      ].map(([x, y], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          <path d="M0 0 C0 -17 26 -17 26 0 Q13 3 0 0Z" fill={`url(#${uid}-dmp)`} />
          <path
            d="M7 -9 q2 3 1 7 M13 -11 v8 M19 -9 q-2 3 -1 7"
            stroke="#DCCBA8"
            strokeWidth="1.2"
            fill="none"
            strokeLinecap="round"
          />
          <circle cx="13" cy="-12.5" r="1.7" fill="#E6D6B4" />
        </g>
      ))}
      <circle cx="35" cy="54" r="1.6" fill="none" stroke="#4FA35E" strokeWidth="1.2" />
      <circle cx="66" cy="54" r="1.6" fill="none" stroke="#4FA35E" strokeWidth="1.2" />
    </svg>
  );
}

function ContinentalGlyph({ uid, className }: SvgProps) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      <defs>
        <linearGradient id={`${uid}-bun`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F6BD6E" />
          <stop offset="1" stopColor="#D3843A" />
        </linearGradient>
        <linearGradient id={`${uid}-patty`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7C4425" />
          <stop offset="1" stopColor="#4F2914" />
        </linearGradient>
      </defs>
      <ellipse cx="50" cy="90" rx="32" ry="3.5" fill="#000" opacity="0.1" />
      <path d="M21 73 h58 q0 12 -12 12 h-34 q-12 0 -12 -12Z" fill="#D88E46" />
      <rect x="17" y="60" width="66" height="13" rx="6.5" fill={`url(#${uid}-patty)`} />
      <path
        d="M17 58 H83 L79 65 L71 61 L63 68 L55 61 L47 67 L39 61 L31 66 L23 61Z"
        fill="#FFC53D"
      />
      <path
        d="M14 57 q6 -6 12 0 q6 -6 12 0 q6 -6 12 0 q6 -6 12 0 q6 -6 12 0 q5 -4 8 0 v3 H14Z"
        fill="#67B83F"
      />
      <rect x="19" y="51" width="62" height="5" rx="2.5" fill="#E2452F" />
      <path d="M19 52 Q19 22 50 22 Q81 22 81 52 Z" fill={`url(#${uid}-bun)`} />
      <path
        d="M30 33 q8 -7 18 -8"
        stroke="#FBD69D"
        strokeWidth="2.4"
        strokeLinecap="round"
        fill="none"
        opacity="0.8"
      />
      {[
        [38, 38, -20],
        [50, 31, 10],
        [62, 37, 25],
        [56, 44, -10],
        [44, 45, 15],
        [70, 44, -30],
      ].map(([cx, cy, rot], i) => (
        <ellipse
          key={i}
          cx={cx}
          cy={cy}
          rx="1.8"
          ry="1"
          transform={`rotate(${rot} ${cx} ${cy})`}
          fill="#FFF4DC"
        />
      ))}
    </svg>
  );
}

function CafeGlyph({ uid, className }: SvgProps) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      <defs>
        <linearGradient id={`${uid}-cup`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#E4DACB" />
          <stop offset="0.4" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#DCD1C0" />
        </linearGradient>
        <radialGradient id={`${uid}-cof`} cx="0.5" cy="0.5" r="0.6">
          <stop offset="0" stopColor="#A86B3D" />
          <stop offset="1" stopColor="#6E3F1E" />
        </radialGradient>
      </defs>
      <path
        className="zs-steam"
        d="M44 30 q-4 -6 0 -11 q4 -5 0 -11"
        stroke="#C9BBA6"
        strokeWidth="2.2"
        fill="none"
        strokeLinecap="round"
      />
      <path
        className="zs-steam"
        style={{ animationDelay: "-1.3s" }}
        d="M56 30 q-4 -6 0 -11 q4 -5 0 -11"
        stroke="#C9BBA6"
        strokeWidth="2.2"
        fill="none"
        strokeLinecap="round"
      />
      <ellipse cx="50" cy="82" rx="38" ry="9" fill="#E3D9CA" />
      <ellipse
        cx="50"
        cy="80"
        rx="38"
        ry="9"
        fill="#FFFFFF"
        stroke="#E3D9CA"
        strokeWidth="1"
      />
      <ellipse cx="50" cy="80" rx="22" ry="5" fill="#F3EEE6" />
      <path
        d="M74 50 q15 -1 14 11 q-1 10 -16 11"
        fill="none"
        stroke="#E3D9CA"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <path
        d="M74 50 q15 -1 14 11 q-1 10 -16 11"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <path
        d="M22 44 L26 70 Q28 80 50 80 Q72 80 74 70 L78 44 Z"
        fill={`url(#${uid}-cup)`}
      />
      <ellipse cx="50" cy="44" rx="28" ry="8" fill="#F7F2EA" />
      <ellipse cx="50" cy="44.6" rx="24" ry="6.4" fill={`url(#${uid}-cof)`} />
      <path
        d="M50 49 C41 44 43 39.5 47.5 40.5 Q50 41.5 50 43.5 Q50 41.5 52.5 40.5 C57 39.5 59 44 50 49Z"
        fill="#F3DDBB"
      />
    </svg>
  );
}

function BiryaniGlyph({ uid, className }: SvgProps) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      <defs>
        <linearGradient id={`${uid}-brass`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#8C5A1E" />
          <stop offset="0.45" stopColor="#D9A04A" />
          <stop offset="1" stopColor="#8C5A1E" />
        </linearGradient>
        <linearGradient id={`${uid}-rice`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFF7E2" />
          <stop offset="0.7" stopColor="#F7D78C" />
          <stop offset="1" stopColor="#EDB54E" />
        </linearGradient>
      </defs>
      <ellipse cx="50" cy="91" rx="32" ry="3.5" fill="#000" opacity="0.1" />
      <path d="M18 54 Q13 86 50 88 Q87 86 82 54 Z" fill={`url(#${uid}-brass)`} />
      <path
        d="M24 66 Q50 72 76 66"
        stroke="#F2C877"
        strokeWidth="1.4"
        fill="none"
        opacity="0.7"
      />
      <path d="M22 52 Q28 24 50 22 Q72 24 78 52 Z" fill={`url(#${uid}-rice)`} />
      <ellipse cx="38" cy="38" rx="2.2" ry="0.9" transform="rotate(-30 38 38)" fill="#FFF" />
      <ellipse cx="46" cy="30" rx="2.2" ry="0.9" transform="rotate(20 46 30)" fill="#FFF" />
      <ellipse cx="55" cy="33" rx="2.2" ry="0.9" transform="rotate(-10 55 33)" fill="#FFF" />
      <ellipse
        cx="33"
        cy="47"
        rx="2.2"
        ry="0.9"
        transform="rotate(35 33 47)"
        fill="#F2A53A"
      />
      <ellipse
        cx="48"
        cy="44"
        rx="2.2"
        ry="0.9"
        transform="rotate(-25 48 44)"
        fill="#F2A53A"
      />
      <ellipse cx="68" cy="46" rx="2.2" ry="0.9" transform="rotate(15 68 46)" fill="#FFF" />
      <ellipse cx="42" cy="40" rx="2.2" ry="0.9" transform="rotate(60 42 40)" fill="#FFF" />
      <path
        d="M30 42 q3 -3 6 0 M52 47 q3 -3 6 0 M60 28 q3 -3 6 0"
        stroke="#8A4B1C"
        strokeWidth="1.4"
        fill="none"
        strokeLinecap="round"
      />
      <ellipse cx="61" cy="38" rx="6.5" ry="5" fill="#FFFFFF" />
      <circle cx="61" cy="38.5" r="2.8" fill="#F5AE24" />
      <path d="M44 26 q4 -6 10 -4 q-3 5 -10 4Z" fill="#3E8E4F" />
      <rect x="15" y="50" width="70" height="7" rx="3.5" fill="#B57A2F" />
      <rect x="15" y="50" width="70" height="2.4" rx="1.2" fill="#E8B865" opacity="0.8" />
    </svg>
  );
}

function SeafoodGlyph({ uid, className }: SvgProps) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      <defs>
        <linearGradient id={`${uid}-fish`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F5AE66" />
          <stop offset="1" stopColor="#D45E2A" />
        </linearGradient>
      </defs>
      <ellipse cx="50" cy="64" rx="45" ry="24" fill="#D6E6EE" />
      <ellipse cx="50" cy="62" rx="45" ry="24" fill="#EEF5F8" />
      <ellipse cx="50" cy="61" rx="38" ry="19" fill="#FFFFFF" />
      <path d="M64 58 L84 45 Q79 58 84 71 Z" fill="#C9541F" />
      <path d="M16 59 Q38 38 66 58 Q38 78 16 59Z" fill={`url(#${uid}-fish)`} />
      <path d="M44 46 q4 -6 10 -5 q-2 5 -6 8" fill="#D45E2A" />
      <path
        d="M34 49 l7 18 M44 47 l7 19 M54 50 l6 15"
        stroke="#7A3416"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.55"
      />
      <path
        d="M30 52 q-3 7 0 14"
        stroke="#B9481B"
        strokeWidth="1.4"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="24" cy="56" r="2.3" fill="#2B1B12" />
      <circle cx="23.3" cy="55.3" r="0.7" fill="#FFFFFF" />
      <circle cx="76" cy="74" r="7" fill="#FFE27A" stroke="#EFC12E" strokeWidth="1.6" />
      <path
        d="M76 67.5 V80.5 M69.5 74 H82.5 M71.5 69.5 L80.5 78.5 M80.5 69.5 L71.5 78.5"
        stroke="#F6D24F"
        strokeWidth="0.9"
      />
      <ellipse
        cx="22"
        cy="72"
        rx="4"
        ry="2"
        transform="rotate(-25 22 72)"
        fill="#4FA35E"
      />
      <ellipse
        cx="27"
        cy="75"
        rx="3.4"
        ry="1.7"
        transform="rotate(20 27 75)"
        fill="#3E8E4F"
      />
    </svg>
  );
}

/** Floating cover tiles — pastel wells with food illustrations. */
export const COVER_TILES: {
  kind: CuisineKind;
  tint: string;
  size: number;
  glyph: number;
  x: string;
  y: string;
  r: string;
  delay: string;
}[] = [
  {
    kind: "italian",
    tint: "#FFE9E2",
    size: 132,
    glyph: 104,
    x: "4%",
    y: "10%",
    r: "-10deg",
    delay: "-0.5s",
  },
  {
    kind: "south",
    tint: "#FFF1C9",
    size: 112,
    glyph: 92,
    x: "12%",
    y: "58%",
    r: "6deg",
    delay: "-2.2s",
  },
  {
    kind: "cafe",
    tint: "#F3EBE2",
    size: 84,
    glyph: 66,
    x: "1%",
    y: "72%",
    r: "-4deg",
    delay: "-3.6s",
  },
  {
    kind: "chinese",
    tint: "#FBE9E4",
    size: 120,
    glyph: 96,
    x: "auto",
    y: "8%",
    r: "8deg",
    delay: "-1.4s",
  },
  {
    kind: "biryani",
    tint: "#FFF3D6",
    size: 128,
    glyph: 104,
    x: "auto",
    y: "54%",
    r: "-6deg",
    delay: "-4s",
  },
  {
    kind: "seafood",
    tint: "#E3F1F7",
    size: 88,
    glyph: 70,
    x: "auto",
    y: "78%",
    r: "10deg",
    delay: "-2.8s",
  },
];

/** @deprecated kept for any remaining imports */
export const COVER_SYMBOLS: {
  glyph: ReactNode;
  hue: string;
  size: number;
  x: string;
  y: string;
  delay: string;
  spin?: boolean;
}[] = [];
