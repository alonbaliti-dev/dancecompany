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
  studio: { text: "text-emerald-50", soft: "bg-emerald-200/10", grad: "from-emerald-200/12 via-[#d7b56d]/5 to-[#3d1027]/14", beam: "bg-emerald-200/10" },
  flamenco: { text: "text-rose-50", soft: "bg-[#b72f3d]/12", grad: "from-[#b72f3d]/18 via-[#d7b56d]/7 to-[#16050a]/18", beam: "bg-[#ff735f]/11" },
  hiphop: { text: "text-fuchsia-50", soft: "bg-violet-300/10", grad: "from-violet-300/14 via-fuchsia-300/6 to-[#120719]/18", beam: "bg-fuchsia-200/10" },
  classic: { text: "text-rose-50", soft: "bg-rose-100/10", grad: "from-rose-100/13 via-[#d7b56d]/5 to-[#1d0b15]/16", beam: "bg-rose-100/10" },
  modern: { text: "text-cyan-50", soft: "bg-slate-200/9", grad: "from-slate-200/12 via-cyan-100/5 to-[#09141c]/18", beam: "bg-cyan-100/9" },
  pointe: { text: "text-pink-50", soft: "bg-pink-100/10", grad: "from-pink-100/13 via-[#d7b56d]/5 to-[#1e0a17]/16", beam: "bg-pink-100/10" },
  repertoire: { text: "text-amber-50", soft: "bg-[#d7b56d]/11", grad: "from-[#d7b56d]/16 via-[#8a2c18]/7 to-[#150905]/18", beam: "bg-[#ffd98a]/10" },
  management: { text: "text-sky-50", soft: "bg-sky-300/9", grad: "from-sky-300/13 via-violet-200/5 to-[#080e1d]/19", beam: "bg-sky-200/9" },
  admin: { text: "text-violet-50", soft: "bg-violet-300/10", grad: "from-violet-200/15 via-[#d8d2ff]/5 to-[#12091d]/20", beam: "bg-violet-200/10" },
  shop: { text: "text-yellow-50", soft: "bg-[#d7b56d]/11", grad: "from-[#f4d58d]/15 via-emerald-100/5 to-[#2a1305]/18", beam: "bg-[#f4d58d]/10" },
  urgent: { text: "text-rose-50", soft: "bg-[#b72f3d]/12", grad: "from-[#b72f3d]/17 via-red-200/5 to-[#1b0508]/18", beam: "bg-rose-300/10" },
  success: { text: "text-emerald-950", soft: "bg-emerald-100", grad: "from-emerald-100/16 via-white/[0.04] to-[#d7b56d]/6", beam: "bg-emerald-100/10" }
};

export const v6Surface = {
  base: "border-[rgba(255,255,255,0.044)] bg-[linear-gradient(146deg,rgba(255,255,255,0.052),rgba(255,255,255,0.018)_54%,rgba(0,0,0,0.18))] shadow-[0_14px_38px_rgba(0,0,0,0.24),inset_0_1px_0_rgba(255,255,255,0.050)] backdrop-blur-xl",
  elevated: "border-[rgba(255,255,255,0.054)] bg-[linear-gradient(148deg,rgba(255,255,255,0.068),rgba(255,255,255,0.024)_58%,rgba(0,0,0,0.22))] shadow-[0_20px_58px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(255,255,255,0.060)] backdrop-blur-xl",
  quiet: "border-[rgba(255,255,255,0.034)] bg-[rgba(255,255,255,0.030)] shadow-[inset_0_1px_0_rgba(255,255,255,0.036)]",
  editorial: "border-[rgba(255,255,255,0.036)] bg-[rgba(255,255,255,0.026)] shadow-[0_10px_28px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.038)]"
};

export const v6Visual = {
  canvas:
    "bg-[radial-gradient(ellipse_72%_36%_at_50%_-12%,rgba(255,247,223,0.095),transparent_62%),radial-gradient(ellipse_54%_42%_at_14%_72%,rgba(100,28,63,0.20),transparent_66%),linear-gradient(180deg,#040203_0%,#080405_46%,#030203_100%)]",
  texture:
    "before:pointer-events-none before:absolute before:inset-0 before:z-0 before:bg-[linear-gradient(115deg,rgba(255,255,255,0.020),transparent_35%,rgba(215,181,109,0.014)_58%,transparent_82%)] before:opacity-32 before:mix-blend-screen",
  heroOrnaments:
    "after:pointer-events-none after:absolute after:inset-x-8 after:bottom-0 after:h-px after:bg-gradient-to-l after:from-transparent after:via-[#d7b56d]/24 after:to-transparent",
  stageBeam:
    "bg-[linear-gradient(102deg,transparent_0%,rgba(255,247,223,0.13)_38%,rgba(215,181,109,0.055)_48%,transparent_62%)]",
  stageFloor:
    "bg-[radial-gradient(ellipse_at_center,rgba(255,247,223,0.14),rgba(215,181,109,0.052)_38%,transparent_68%)]",
  curtain:
    "bg-[linear-gradient(90deg,rgba(255,255,255,0.018),transparent_16%,rgba(255,255,255,0.020)_31%,transparent_48%,rgba(215,181,109,0.022)_64%,transparent_82%)]",
  plinth:
    "bg-[radial-gradient(ellipse_at_center,rgba(255,247,223,0.22),rgba(215,181,109,0.09)_36%,rgba(0,0,0,0.04)_58%,transparent_70%)]"
};

export const v6ScreenAtmosphere = {
  home: "bg-[radial-gradient(ellipse_72%_34%_at_50%_0%,rgba(215,181,109,0.085),transparent_62%),radial-gradient(ellipse_50%_40%_at_10%_76%,rgba(100,28,63,0.20),transparent_66%),linear-gradient(180deg,#050304,#080405_50%,#040203)]",
  shop: "bg-[radial-gradient(ellipse_70%_34%_at_50%_-4%,rgba(244,213,141,0.105),transparent_64%),linear-gradient(180deg,#050403,#090604_54%,#040302)]",
  management: "bg-[radial-gradient(ellipse_70%_34%_at_50%_-8%,rgba(125,211,252,0.085),transparent_64%),linear-gradient(180deg,#03050a,#050712_54%,#030308)]",
  admin: "bg-[radial-gradient(ellipse_70%_34%_at_50%_-8%,rgba(216,210,255,0.095),transparent_64%),linear-gradient(180deg,#040309,#07040f_54%,#030208)]",
  shopSoft: "bg-[linear-gradient(145deg,rgba(244,213,141,0.12),rgba(16,185,129,0.045),rgba(255,255,255,0.018))]"
};

export function v6Cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}
