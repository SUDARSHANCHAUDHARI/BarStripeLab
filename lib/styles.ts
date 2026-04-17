import type { ModifierConfig, SilhouetteDefinition } from "@/types";

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function wavePath(width: number, height: number, modifier: ModifierConfig): string {
  const baseY = height * 0.88;
  const amp = clamp(height * (0.16 + modifier.exaggeration * 0.18), height * 0.12, height * 0.34);
  const c = clamp(0.18 + modifier.curvature * 0.12, 0.12, 0.34) * width;

  return [
    `M 0 ${baseY}`,
    `C ${c} ${baseY - amp}, ${width * 0.28} ${baseY - amp * 0.15}, ${width * 0.36} ${baseY - amp * 0.72}`,
    `C ${width * 0.48} ${baseY - amp * 1.15}, ${width * 0.60} ${baseY - amp * 0.25}, ${width * 0.74} ${baseY - amp * 0.86}`,
    `C ${width * 0.86} ${baseY - amp * 1.28}, ${width * 0.94} ${baseY - amp * 0.45}, ${width} ${baseY - amp * 0.92}`,
    `L ${width} ${height}`,
    `L 0 ${height}`,
    "Z",
  ].join(" ");
}

function mountainPath(width: number, height: number, modifier: ModifierConfig): string {
  const baseY = height * 0.91;
  const ridgeY = height * 0.78;
  const highPeak = clamp(height * 0.18 - modifier.exaggeration * height * 0.03, height * 0.12, height * 0.24);
  const midPeak = clamp(height * 0.31 - modifier.exaggeration * height * 0.02, height * 0.24, height * 0.38);
  const sidePeak = clamp(height * 0.25 - modifier.exaggeration * height * 0.01, height * 0.18, height * 0.32);
  const farPeak = clamp(height * 0.36 - modifier.exaggeration * height * 0.01, height * 0.28, height * 0.44);

  return [
    `M 0 ${baseY}`,
    `L ${width * 0.08} ${baseY}`,
    `L ${width * 0.16} ${ridgeY}`,
    `L ${width * 0.24} ${highPeak + height * 0.1}`,
    `L ${width * 0.34} ${midPeak}`,
    `L ${width * 0.44} ${ridgeY - height * 0.08}`,
    `L ${width * 0.55} ${highPeak}`,
    `L ${width * 0.66} ${ridgeY - height * 0.03}`,
    `L ${width * 0.76} ${sidePeak}`,
    `L ${width * 0.86} ${ridgeY + height * 0.03}`,
    `L ${width * 0.94} ${farPeak}`,
    `L ${width} ${ridgeY}`,
    `L ${width} ${height}`,
    `L 0 ${height}`,
    `Z`,
    `M ${width * 0.22} ${height * 0.56}`,
    `L ${width * 0.28} ${height * 0.38}`,
    `L ${width * 0.34} ${height * 0.56}`,
    `L ${width * 0.31} ${height * 0.56}`,
    `L ${width * 0.31} ${height * 0.61}`,
    `L ${width * 0.25} ${height * 0.61}`,
    `L ${width * 0.25} ${height * 0.56}`,
    `Z`,
  ].join(" ");
}

function cityPath(width: number, height: number, modifier: ModifierConfig): string {
  const baseY = height * 0.92;
  const tall = clamp(height * 0.16 - modifier.exaggeration * height * 0.03, height * 0.12, height * 0.22);
  const mid = clamp(height * 0.34 - modifier.exaggeration * height * 0.02, height * 0.26, height * 0.42);
  const low = clamp(height * 0.54 - modifier.exaggeration * height * 0.01, height * 0.44, height * 0.62);
  const tower = clamp(height * 0.22 - modifier.exaggeration * height * 0.02, height * 0.16, height * 0.3);
  const step = width * 0.06;

  return [
    `M 0 ${baseY}`,
    `L 0 ${height * 0.66}`,
    `L ${step} ${height * 0.66}`,
    `L ${step} ${height * 0.48}`,
    `L ${step * 2.1} ${height * 0.48}`,
    `L ${step * 2.1} ${tall}`,
    `L ${step * 3.3} ${tall}`,
    `L ${step * 3.3} ${height * 0.62}`,
    `L ${step * 4.3} ${height * 0.62}`,
    `L ${step * 4.3} ${low}`,
    `L ${step * 5.5} ${low}`,
    `L ${step * 5.5} ${mid}`,
    `L ${step * 6.6} ${mid}`,
    `L ${step * 6.6} ${tower}`,
    `L ${step * 7.7} ${tower}`,
    `L ${step * 7.7} ${height * 0.58}`,
    `L ${step * 8.9} ${height * 0.58}`,
    `L ${step * 8.9} ${height * 0.4}`,
    `L ${width} ${height * 0.4}`,
    `L ${width} ${baseY}`,
    `L ${width} ${height}`,
    `L 0 ${height}`,
    "Z",
  ].join(" ");
}

function palmPath(width: number, height: number, modifier: ModifierConfig): string {
  const baseY = height * 0.99;
  const crownX = width * 0.5;
  const crownY = height * 0.08;
  const trunkBaseW = width * (0.052 + modifier.thickness * 0.006);
  const trunkTopW = trunkBaseW * 0.38;

  return [
    // trunk
    `M ${crownX - trunkBaseW * 0.72} ${baseY}`,
    `C ${width * 0.474} ${height * 0.84}, ${width * 0.478} ${height * 0.66}, ${width * 0.486} ${height * 0.48}`,
    `C ${width * 0.492} ${height * 0.32}, ${width * 0.495} ${height * 0.2}, ${crownX - trunkTopW * 0.78} ${crownY + height * 0.18}`,
    `L ${crownX + trunkTopW * 0.34} ${crownY + height * 0.18}`,
    `C ${width * 0.505} ${height * 0.22}, ${width * 0.508} ${height * 0.36}, ${width * 0.512} ${height * 0.54}`,
    `C ${width * 0.516} ${height * 0.72}, ${width * 0.522} ${height * 0.88}, ${crownX + trunkBaseW * 0.3} ${baseY}`,
    `Z`,

    // far left upper frond
    `M ${crownX - trunkTopW * 0.16} ${crownY + height * 0.16}`,
    `C ${width * 0.46} ${height * 0.02}, ${width * 0.34} ${height * 0.0}, ${width * 0.16} ${height * 0.06}`,
    `C ${width * 0.15} ${height * 0.12}, ${width * 0.24} ${height * 0.18}, ${crownX - trunkTopW * 0.04} ${crownY + height * 0.24}`,
    `Z`,

    // left upper frond
    `M ${crownX - trunkTopW * 0.18} ${crownY + height * 0.2}`,
    `C ${width * 0.45} ${height * 0.1}, ${width * 0.3} ${height * 0.1}, ${width * 0.08} ${height * 0.22}`,
    `C ${width * 0.07} ${height * 0.3}, ${width * 0.18} ${height * 0.36}, ${crownX - trunkTopW * 0.06} ${crownY + height * 0.3}`,
    `Z`,

    // left lower frond
    `M ${crownX - trunkTopW * 0.18} ${crownY + height * 0.28}`,
    `C ${width * 0.44} ${height * 0.28}, ${width * 0.34} ${height * 0.48}, ${width * 0.18} ${height * 0.68}`,
    `C ${width * 0.17} ${height * 0.76}, ${width * 0.25} ${height * 0.8}, ${crownX - trunkTopW * 0.08} ${crownY + height * 0.42}`,
    `Z`,

    // top center frond
    `M ${crownX - trunkTopW * 0.02} ${crownY + height * 0.1}`,
    `C ${width * 0.49} ${height * 0.0}, ${width * 0.52} ${height * 0.0}, ${width * 0.56} ${height * 0.04}`,
    `C ${width * 0.555} ${height * 0.11}, ${width * 0.53} ${height * 0.16}, ${crownX + trunkTopW * 0.03} ${crownY + height * 0.18}`,
    `Z`,

    // right upper frond
    `M ${crownX + trunkTopW * 0.06} ${crownY + height * 0.16}`,
    `C ${width * 0.55} ${height * 0.04}, ${width * 0.66} ${height * 0.02}, ${width * 0.82} ${height * 0.06}`,
    `C ${width * 0.83} ${height * 0.12}, ${width * 0.76} ${height * 0.18}, ${crownX + trunkTopW * 0.1} ${crownY + height * 0.24}`,
    `Z`,

    // right middle frond
    `M ${crownX + trunkTopW * 0.1} ${crownY + height * 0.22}`,
    `C ${width * 0.57} ${height * 0.14}, ${width * 0.72} ${height * 0.18}, ${width * 0.88} ${height * 0.28}`,
    `C ${width * 0.88} ${height * 0.36}, ${width * 0.8} ${height * 0.42}, ${crownX + trunkTopW * 0.12} ${crownY + height * 0.32}`,
    `Z`,

    // right lower frond
    `M ${crownX + trunkTopW * 0.08} ${crownY + height * 0.28}`,
    `C ${width * 0.56} ${height * 0.28}, ${width * 0.66} ${height * 0.44}, ${width * 0.8} ${height * 0.62}`,
    `C ${width * 0.82} ${height * 0.7}, ${width * 0.74} ${height * 0.74}, ${crownX + trunkTopW * 0.1} ${crownY + height * 0.4}`,
    `Z`,
  ].join(" ");
}

function heartPath(width: number, height: number, modifier: ModifierConfig): string {
  const topY = clamp(height * (0.18 - modifier.exaggeration * 0.05), height * 0.08, height * 0.22);
  const dipY = height * 0.34;
  const bottomTipY = height * 0.9;
  const spread = width * (0.26 + modifier.curvature * 0.08);

  return [
    `M ${width * 0.5} ${bottomTipY}`,
    `C ${width * 0.2} ${height * 0.7}, ${width * 0.04} ${height * 0.42}, ${width * 0.16} ${topY + height * 0.16}`,
    `C ${width * 0.24} ${topY}, ${width * 0.38} ${topY}, ${width * 0.5} ${dipY}`,
    `C ${width * 0.62} ${topY}, ${width * 0.76} ${topY}, ${width * 0.84} ${topY + height * 0.16}`,
    `C ${width * 0.96} ${height * 0.42}, ${width * 0.8} ${height * 0.7}, ${width * 0.5} ${bottomTipY}`,
    `L ${width * (0.5 + spread * 0.02)} ${bottomTipY}`,
    `L ${width} ${height}`,
    `L 0 ${height}`,
    `L ${width * (0.5 - spread * 0.02)} ${bottomTipY}`,
    "Z",
  ].join(" ");
}

function treePath(width: number, height: number, modifier: ModifierConfig): string {
  const baseY = height * 0.92;
  const trunkW = width * (0.08 + modifier.thickness * 0.02);
  const trunkX = width * 0.5;
  const canopyTop = height * (0.16 - modifier.exaggeration * 0.04);

  return [
    `M ${trunkX - trunkW * 0.5} ${baseY}`,
    `L ${trunkX - trunkW * 0.5} ${height * 0.62}`,
    `L ${width * 0.22} ${height * 0.62}`,
    `L ${width * 0.5} ${canopyTop}`,
    `L ${width * 0.78} ${height * 0.62}`,
    `L ${trunkX + trunkW * 0.5} ${height * 0.62}`,
    `L ${trunkX + trunkW * 0.5} ${baseY}`,
    `L ${width} ${baseY}`,
    `L ${width} ${height}`,
    `L 0 ${height}`,
    `L 0 ${baseY}`,
    "Z",
  ].join(" ");
}

function crownPath(width: number, height: number, modifier: ModifierConfig): string {
  const baseY = height * 0.88;
  const lift = modifier.exaggeration * height * 0.12;

  return [
    `M 0 ${baseY}`,
    `L ${width * 0.12} ${baseY}`,
    `L ${width * 0.22} ${height * 0.24 - lift * 0.2}`,
    `L ${width * 0.36} ${baseY - height * 0.18}`,
    `L ${width * 0.5} ${height * 0.1 - lift}`,
    `L ${width * 0.64} ${baseY - height * 0.18}`,
    `L ${width * 0.78} ${height * 0.24 - lift * 0.2}`,
    `L ${width * 0.88} ${baseY}`,
    `L ${width} ${baseY}`,
    `L ${width} ${height}`,
    `L 0 ${height}`,
    "Z",
  ].join(" ");
}

function coffeePath(width: number, height: number, modifier: ModifierConfig): string {
  const baseY = height * 0.92;
  const cupTop = height * 0.44;
  const cupBottom = height * 0.8;
  const steamTop = height * (0.1 - modifier.exaggeration * 0.01);
  const handleOuter = width * 0.9;
  const handleInner = width * 0.77;

  return [
    `M ${width * 0.18} ${baseY}`,
    `L ${width * 0.18} ${cupTop}`,
    `L ${width * 0.66} ${cupTop}`,
    `L ${width * 0.66} ${cupBottom}`,
    `L ${width * 0.62} ${baseY}`,
    `L ${width * 0.3} ${baseY}`,
    `L ${width * 0.18} ${cupBottom}`,
    `Z`,
    `M ${handleOuter} ${height * 0.5}`,
    `C ${width * 0.98} ${height * 0.5}, ${width * 0.98} ${height * 0.76}, ${handleOuter} ${height * 0.76}`,
    `C ${width * 0.84} ${height * 0.76}, ${width * 0.84} ${height * 0.56}, ${handleInner} ${height * 0.56}`,
    `C ${width * 0.86} ${height * 0.56}, ${width * 0.86} ${height * 0.7}, ${handleOuter} ${height * 0.7}`,
    `C ${width * 0.94} ${height * 0.7}, ${width * 0.94} ${height * 0.56}, ${handleOuter} ${height * 0.56}`,
    `Z`,
    `M ${width * 0.3} ${cupTop}`,
    `C ${width * 0.26} ${height * 0.26}, ${width * 0.32} ${height * 0.2}, ${width * 0.28} ${steamTop}`,
    `M ${width * 0.43} ${cupTop}`,
    `C ${width * 0.39} ${height * 0.24}, ${width * 0.48} ${height * 0.18}, ${width * 0.46} ${steamTop + 1}`,
    `M ${width * 0.56} ${cupTop}`,
    `C ${width * 0.52} ${height * 0.27}, ${width * 0.62} ${height * 0.19}, ${width * 0.6} ${steamTop}`,
    `L ${width} ${baseY}`,
    `L ${width} ${height}`,
    `L 0 ${height}`,
    `L 0 ${baseY}`,
    "Z",
  ].join(" ");
}

function starPath(width: number, height: number, modifier: ModifierConfig): string {
  const cx = width * 0.5;
  const cy = height * 0.46;
  const outer = Math.min(width, height) * (0.34 + modifier.exaggeration * 0.05);
  const inner = outer * (0.42 + modifier.simplification * 0.08);

  const points: string[] = [];
  for (let i = 0; i < 10; i += 1) {
    const angle = -Math.PI / 2 + (i * Math.PI) / 5;
    const radius = i % 2 === 0 ? outer : inner;
    points.push(`${cx + Math.cos(angle) * radius} ${cy + Math.sin(angle) * radius}`);
  }

  return [
    `M ${points[0]}`,
    ...points.slice(1).map((point) => `L ${point}`),
    "Z",
    `L ${width} ${height}`,
    `L 0 ${height}`,
    "Z",
  ].join(" ");
}

function whalePath(width: number, height: number, modifier: ModifierConfig): string {
  const baseY = height * 0.9;
  const headLift = height * (0.24 - modifier.exaggeration * 0.03);
  const belly = height * (0.66 + modifier.curvature * 0.04);
  const back = height * 0.38;
  const tailNotch = width * 0.82;

  return [
    `M ${width * 0.06} ${baseY}`,
    `C ${width * 0.14} ${height * 0.58}, ${width * 0.24} ${back}, ${width * 0.42} ${height * 0.34}`,
    `C ${width * 0.56} ${height * 0.22}, ${width * 0.72} ${headLift}, ${width * 0.84} ${height * 0.34}`,
    `C ${width * 0.9} ${height * 0.38}, ${width * 0.94} ${height * 0.48}, ${width * 0.96} ${height * 0.58}`,
    `C ${width * 0.9} ${height * 0.74}, ${width * 0.8} ${baseY}, ${width * 0.64} ${baseY}`,
    `C ${width * 0.5} ${baseY}, ${width * 0.35} ${height * 0.82}, ${width * 0.2} ${height * 0.82}`,
    `C ${width * 0.14} ${height * 0.82}, ${width * 0.1} ${height * 0.86}, ${width * 0.06} ${baseY}`,
    `L ${width * 0.12} ${baseY}`,
    `C ${width * 0.17} ${height * 0.72}, ${width * 0.3} ${belly}, ${width * 0.48} ${height * 0.66}`,
    `C ${width * 0.62} ${height * 0.62}, ${width * 0.72} ${height * 0.62}, ${tailNotch} ${height * 0.7}`,
    `L ${width * 0.9} ${height * 0.56}`,
    `L ${width * 0.86} ${height * 0.74}`,
    `L ${width * 0.98} ${height * 0.82}`,
    `C ${width * 0.88} ${height * 0.9}, ${width * 0.79} ${height * 0.84}, ${width * 0.7} ${height * 0.76}`,
    `C ${width * 0.56} ${height * 0.92}, ${width * 0.38} ${height * 0.96}, ${width * 0.2} ${height * 0.9}`,
    `L ${width} ${height}`,
    `L 0 ${height}`,
    "Z",
  ].join(" ");
}

const baseStyles: Record<string, SilhouetteDefinition> = {
  wave: { id: "wave", label: "Wave", buildPath: wavePath },
  mountain: { id: "mountain", label: "Mountain", buildPath: mountainPath },
  city: { id: "city", label: "City", buildPath: cityPath },
  palm: { id: "palm", label: "Palm", buildPath: palmPath },
  heart: { id: "heart", label: "Heart", buildPath: heartPath },
  tree: { id: "tree", label: "Tree", buildPath: treePath },
  crown: { id: "crown", label: "Crown", buildPath: crownPath },
  coffee: { id: "coffee", label: "Coffee", buildPath: coffeePath },
  star: { id: "star", label: "Star", buildPath: starPath },
  whale: { id: "whale", label: "Whale", buildPath: whalePath },
};

function alias(id: string, label: string, target: keyof typeof baseStyles): SilhouetteDefinition {
  return {
    id,
    label,
    buildPath: baseStyles[target].buildPath,
  };
}

export const styles: Record<string, SilhouetteDefinition> = {
  ...baseStyles,

  minimal: alias("minimal", "Minimal", "city"),
  flowing: alias("flowing", "Flowing", "wave"),
  pyramid: alias("pyramid", "Pyramid", "mountain"),
  volcano: alias("volcano", "Volcano", "mountain"),
  forest: alias("forest", "Forest", "tree"),
  ocean: alias("ocean", "Ocean", "wave"),
  lightning: alias("lightning", "Lightning", "star"),
  fire: alias("fire", "Fire", "crown"),
  rain: alias("rain", "Rain", "wave"),
  snow: alias("snow", "Snow", "star"),
  castle: alias("castle", "Castle", "crown"),
  pineapple: alias("pineapple", "Pineapple", "palm"),
  cat: alias("cat", "Cat", "heart"),
  banana: alias("banana", "Banana", "wave"),
  wizard: alias("wizard", "Wizard", "star"),
  ice_cream: alias("ice_cream", "Ice Cream", "coffee"),
  boat: alias("boat", "Boat", "wave"),
  house: alias("house", "House", "city"),
  bottle: alias("bottle", "Bottle", "coffee"),
  baseball: alias("baseball", "Baseball", "star"),
  infinity: alias("infinity", "Infinity", "wave"),
  organic: alias("organic", "Organic", "wave"),
  geometric: alias("geometric", "Geometric", "city"),
  solar: alias("solar", "Solar", "star"),
  sunset: alias("sunset", "Sunset", "wave"),
  desert: alias("desert", "Desert", "mountain"),
  aurora: alias("aurora", "Aurora", "wave"),
  digital: alias("digital", "Digital", "city"),
  vintage: alias("vintage", "Vintage", "coffee"),
  neon: alias("neon", "Neon", "star"),
  cosmic: alias("cosmic", "Cosmic", "star"),
  zen: alias("zen", "Zen", "wave"),
  retro: alias("retro", "Retro", "city"),
  futuristic: alias("futuristic", "Futuristic", "city"),
  botanical: alias("botanical", "Botanical", "tree"),
  industrial: alias("industrial", "Industrial", "city"),
  vibrant: alias("vibrant", "Vibrant", "wave"),
  smooth: alias("smooth", "Smooth", "wave"),
  sharp: alias("sharp", "Sharp", "mountain"),
  balanced: alias("balanced", "Balanced", "wave"),
  dynamic: alias("dynamic", "Dynamic", "star"),
  ethereal: alias("ethereal", "Ethereal", "wave"),
  bold: alias("bold", "Bold", "crown"),
  elegant: alias("elegant", "Elegant", "heart"),
  playful: alias("playful", "Playful", "star"),
  serious: alias("serious", "Serious", "city"),
  artistic: alias("artistic", "Artistic", "wave"),
  professional: alias("professional", "Professional", "city"),
  creative: alias("creative", "Creative", "star"),
  modern: alias("modern", "Modern", "city"),
  classic: alias("classic", "Classic", "crown"),
  trendy: alias("trendy", "Trendy", "wave"),
  timeless: alias("timeless", "Timeless", "heart"),
  adventurous: alias("adventurous", "Adventurous", "mountain"),
  calm: alias("calm", "Calm", "wave"),
  energetic: alias("energetic", "Energetic", "star"),
  peaceful: alias("peaceful", "Peaceful", "wave"),
  mysterious: alias("mysterious", "Mysterious", "whale"),
  romantic: alias("romantic", "Romantic", "heart"),
  wild: alias("wild", "Wild", "mountain"),
  simple: alias("simple", "Simple", "city"),
  complex: alias("complex", "Complex", "crown"),
  harmony: alias("harmony", "Harmony", "wave"),
  contrast: alias("contrast", "Contrast", "star"),
  fusion: alias("fusion", "Fusion", "wave"),
  native: alias("native", "Native", "tree"),
  urban: alias("urban", "Urban", "city"),
  suburban: alias("suburban", "Suburban", "city"),
  rural: alias("rural", "Rural", "tree"),
  tropical: alias("tropical", "Tropical", "palm"),
  arctic: alias("arctic", "Arctic", "mountain"),
  desert_heat: alias("desert_heat", "Desert Heat", "mountain"),
  spring: alias("spring", "Spring", "tree"),
  summer: alias("summer", "Summer", "wave"),
  autumn: alias("autumn", "Autumn", "tree"),
  winter: alias("winter", "Winter", "mountain"),
};

export function getStyleDefinition(styleId: string): SilhouetteDefinition {
  return styles[styleId] ?? styles.wave;
}
