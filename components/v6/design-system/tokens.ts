export type V6Tone =
  | "studio"
  | "flamenco"
  | "hiphop"
  | "classic"
  | "modern"
  | "pointe"
  | "repertoire"
  | "management"
  | "admin"
  | "shop"
  | "urgent"
  | "success";

export const v6Tone: Record<V6Tone, { text: string; soft: string; grad: string; beam: string }> = {
  studio: { text: "text-emerald-50", soft: "bg-emerald-200/[0.085]", grad: "from-emerald-100/[0.13] via-[#f4d58d]/[0.055] to-[#2e1423]/[0.18]", beam: "bg-emerald-100/[0.10]" },
  flamenco: { text: "text-rose-50", soft: "bg-[#b72f3d]/[0.11]", grad: "from-[#b72f3d]/[0.18] via-[#f4d58d]/[0.07] to-[#17070b]/[0.22]", beam: "bg-[#ff8068]/[0.11]" },
  hiphop: { text: "text-fuchsia-50", soft: "bg-violet-200/[0.10]", grad: "from-violet-200/[0.16] via-fuchsia-200/[0.055] to-[#130819]/[0.22]", beam: "bg-fuchsia-100/[0.10]" },
  classic: { text: "text-rose-50", soft: "bg-rose-100/[0.095]", grad: "from-rose-100/[0.14] via-[#f4d58d]/[0.045] to-[#1b0d16]/[0.20]", beam: "bg-rose-100/[0.10]" },
  modern: { text: "text-cyan-50", soft: "bg-cyan-100/[0.075]", grad: "from-slate-100/[0.13] via-cyan-100/[0.050] to-[#08141a]/[0.21]", beam: "bg-cyan-100/[0.085]" },
  pointe: { text: "text-pink-50", soft: "bg-pink-100/[0.095]", grad: "from-pink-100/[0.14] via-[#f4d58d]/[0.045] to-[#1d0a16]/[0.20]", beam: "bg-pink-100/[0.10]" },
  repertoire: { text: "text-amber-50", soft: "bg-[#f4d58d]/[0.105]", grad: "from-[#f4d58d]/[0.17] via-[#a66a2a]/[0.065] to-[#180c05]/[0.22]", beam: "bg-[#ffe2a1]/[0.10]" },
  management: { text: "text-sky-50", soft: "bg-sky-200/[0.080]", grad: "from-sky-200/[0.13] via-[#d8d2ff]/[0.048] to-[#07101d]/[0.23]", beam: "bg-sky-100/[0.085]" },
  admin: { text: "text-violet-50", soft: "bg-violet-200/[0.090]", grad: "from-violet-100/[0.15] via-[#f4d58d]/[0.043] to-[#13091d]/[0.24]", beam: "bg-violet-100/[0.095]" },
  shop: { text: "text-yellow-50", soft: "bg-[#f4d58d]/[0.105]", grad: "from-[#f4d58d]/[0.18] via-emerald-100/[0.048] to-[#251206]/[0.23]", beam: "bg-[#f4d58d]/[0.11]" },
  urgent: { text: "text-rose-50", soft: "bg-[#b72f3d]/[0.12]", grad: "from-[#b72f3d]/[0.18] via-red-100/[0.044] to-[#1b0508]/[0.24]", beam: "bg-rose-200/[0.10]" },
  success: { text: "text-emerald-950", soft: "bg-emerald-100", grad: "from-emerald-100/[0.17] via-[#f4d58d]/[0.050] to-[#102217]/[0.14]", beam: "bg-emerald-100/[0.10]" }
};

export const v6Surface = {
  base: "border-transparent bg-[linear-gradient(150deg,rgba(255,247,223,0.040),rgba(255,255,255,0.012)_52%,rgba(0,0,0,0.14)_100%)] shadow-[0_22px_68px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,247,223,0.045)] backdrop-blur-2xl",
  elevated: "border-[rgba(244,213,141,0.055)] bg-[linear-gradient(152deg,rgba(255,247,223,0.055),rgba(255,255,255,0.018)_58%,rgba(0,0,0,0.22)_100%)] shadow-[0_30px_92px_rgba(0,0,0,0.38),inset_0_1px_0_rgba(255,247,223,0.060)] backdrop-blur-2xl",
  quiet: "border-transparent bg-[linear-gradient(145deg,rgba(255,247,223,0.024),rgba(255,255,255,0.010)_62%,rgba(0,0,0,0.08))] shadow-[inset_0_1px_0_rgba(255,247,223,0.028)]",
  editorial: "border-transparent bg-[linear-gradient(180deg,rgba(255,247,223,0.020),rgba(255,255,255,0.008)_72%,rgba(0,0,0,0.07))] shadow-[0_16px_42px_rgba(0,0,0,0.14),inset_0_1px_0_rgba(255,247,223,0.030)] backdrop-blur-xl",
  floating: "border-[rgba(244,213,141,0.090)] bg-[linear-gradient(165deg,rgba(32,24,20,0.96),rgba(9,6,8,0.97)_54%,rgba(14,7,11,0.985)_100%)] shadow-[0_38px_110px_rgba(0,0,0,0.60),0_16px_70px_rgba(244,213,141,0.052),inset_0_1px_0_rgba(255,247,223,0.078)] backdrop-blur-2xl",
  hairline: "border-transparent bg-[rgba(255,247,223,0.014)] shadow-[inset_0_1px_0_rgba(255,247,223,0.024)]",
  open: "border-transparent bg-[linear-gradient(135deg,rgba(255,247,223,0.020),transparent_58%,rgba(244,213,141,0.018))] shadow-[inset_0_1px_0_rgba(255,247,223,0.020)]",
  whisper: "border-transparent bg-white/[0.018] shadow-none"
};

export const v6Visual = {
  canvas:
    "bg-[radial-gradient(ellipse_90%_42%_at_50%_-14%,rgba(255,247,223,0.13),transparent_62%),radial-gradient(ellipse_56%_42%_at_14%_74%,rgba(100,28,63,0.20),transparent_66%),radial-gradient(ellipse_42%_28%_at_86%_18%,rgba(244,213,141,0.070),transparent_58%),linear-gradient(180deg,#030203_0%,#080404_48%,#020203_100%)]",
  texture:
    "before:pointer-events-none before:absolute before:inset-0 before:z-0 before:bg-[linear-gradient(112deg,rgba(255,255,255,0.024),transparent_34%,rgba(244,213,141,0.018)_58%,transparent_84%)] before:opacity-40 before:mix-blend-screen",
  heroOrnaments:
    "after:pointer-events-none after:absolute after:inset-x-10 after:bottom-0 after:h-px after:bg-gradient-to-l after:from-transparent after:via-[#f4d58d]/28 after:to-transparent",
  stageBeam:
    "bg-[linear-gradient(102deg,transparent_0%,rgba(255,247,223,0.16)_38%,rgba(244,213,141,0.070)_48%,transparent_64%)]",
  stageFloor:
    "bg-[radial-gradient(ellipse_at_center,rgba(255,247,223,0.18),rgba(244,213,141,0.070)_38%,transparent_70%)]",
  curtain:
    "bg-[linear-gradient(90deg,rgba(255,255,255,0.018),transparent_15%,rgba(255,255,255,0.022)_32%,transparent_50%,rgba(244,213,141,0.024)_66%,transparent_84%)]",
  plinth:
    "bg-[radial-gradient(ellipse_at_center,rgba(255,247,223,0.24),rgba(244,213,141,0.10)_36%,rgba(0,0,0,0.04)_58%,transparent_72%)]"
};

export const v6ScreenAtmosphere = {
  home: "bg-[radial-gradient(ellipse_86%_38%_at_50%_-2%,rgba(244,213,141,0.120),transparent_62%),radial-gradient(ellipse_52%_42%_at_10%_76%,rgba(100,28,63,0.21),transparent_66%),radial-gradient(ellipse_44%_30%_at_90%_12%,rgba(255,247,223,0.045),transparent_62%),linear-gradient(180deg,#030203,#090505_52%,#030203)]",
  shop: "bg-[radial-gradient(ellipse_78%_36%_at_50%_-6%,rgba(244,213,141,0.135),transparent_64%),radial-gradient(ellipse_48%_34%_at_8%_72%,rgba(16,185,129,0.055),transparent_62%),linear-gradient(180deg,#040302,#090604_54%,#030202)]",
  management: "bg-[radial-gradient(ellipse_78%_36%_at_50%_-8%,rgba(244,213,141,0.075),transparent_58%),radial-gradient(ellipse_50%_38%_at_12%_72%,rgba(125,211,252,0.080),transparent_64%),linear-gradient(180deg,#03050a,#050712_54%,#030308)]",
  admin: "bg-[radial-gradient(ellipse_78%_36%_at_50%_-8%,rgba(244,213,141,0.078),transparent_58%),radial-gradient(ellipse_52%_38%_at_12%_72%,rgba(216,210,255,0.080),transparent_64%),linear-gradient(180deg,#040309,#07040f_54%,#030208)]",
  shopSoft: "bg-[linear-gradient(145deg,rgba(244,213,141,0.13),rgba(16,185,129,0.045),rgba(255,255,255,0.016))]"
};

export const v6Type = {
  kicker: "lk-safe-meta text-[9px] font-semibold uppercase tracking-[0.24em] text-white/34",
  heroTitle: "lk-safe-title text-[clamp(2.05rem,9.5vw,3.1rem)] font-semibold tracking-[-0.052em] text-white",
  screenTitle: "lk-safe-title text-[clamp(1.72rem,8vw,2.45rem)] font-semibold tracking-[-0.046em] text-white",
  editorialTitle: "lk-safe-title text-[clamp(1.62rem,7.6vw,2.45rem)] font-semibold tracking-[-0.046em] text-white",
  statement: "lk-safe-text text-[clamp(1.18rem,5.4vw,1.55rem)] font-medium tracking-[-0.038em] text-white/88",
  subtitle: "text-[14px] font-normal leading-relaxed tracking-[-0.012em] text-white/62",
  metadata: "text-[11px] font-medium leading-snug tracking-[-0.006em] text-white/42",
  sectionTitle: "text-[15px] font-semibold leading-snug tracking-[-0.030em] text-white/82"
};

export const v6Safe = {
  surface: "lk-safe-surface relative isolate mx-auto w-full max-w-full text-start leading-normal",
  content: "lk-safe-content min-w-0 max-w-full",
  row: "lk-safe-row",
  title: "lk-safe-title",
  text: "lk-safe-text",
  meta: "lk-safe-meta",
  badgeGroup: "lk-safe-badge-group",
  control: "lk-safe-control"
};

export const v6Control = {
  field: "lk-safe-control min-h-[56px] w-full max-w-full rounded-[24px] border border-[rgba(244,213,141,0.065)] bg-[linear-gradient(180deg,rgba(255,247,223,0.050),rgba(255,255,255,0.020))] px-4 py-3 text-[16px] leading-normal text-white outline-none placeholder:text-white/30 shadow-[inset_0_1px_0_rgba(255,247,223,0.052)] transition focus:border-[rgba(244,213,141,0.24)] focus:bg-white/[0.070]",
  label: "lk-safe-meta text-[12px] font-semibold tracking-[-0.010em] text-white/48",
  chip: "lk-safe-control max-w-full rounded-full border border-[rgba(244,213,141,0.055)] bg-white/[0.045] px-3 py-2 text-xs font-semibold text-white/58 shadow-[inset_0_1px_0_rgba(255,247,223,0.035)]"
};

export function v6Cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}
