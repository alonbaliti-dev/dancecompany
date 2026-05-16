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

export const v6Tone: Record<V6Tone, { text: string; soft: string; grad: string }> = {
  studio: { text: "text-emerald-100", soft: "bg-emerald-300/12", grad: "from-emerald-300/18 via-white/[0.055] to-cyan-300/8" },
  flamenco: { text: "text-amber-100", soft: "bg-red-400/14", grad: "from-red-500/20 via-amber-300/10 to-black/10" },
  hiphop: { text: "text-fuchsia-100", soft: "bg-fuchsia-400/14", grad: "from-violet-500/20 via-fuchsia-400/10 to-black/10" },
  classic: { text: "text-rose-100", soft: "bg-rose-200/12", grad: "from-rose-100/16 via-slate-200/8 to-black/10" },
  modern: { text: "text-cyan-100", soft: "bg-cyan-300/12", grad: "from-slate-400/18 via-cyan-300/8 to-black/10" },
  pointe: { text: "text-pink-100", soft: "bg-pink-200/12", grad: "from-pink-200/18 via-stone-100/8 to-black/10" },
  repertoire: { text: "text-amber-100", soft: "bg-amber-300/12", grad: "from-amber-300/20 via-orange-300/8 to-black/10" },
  management: { text: "text-blue-100", soft: "bg-blue-400/12", grad: "from-blue-500/20 via-cyan-300/8 to-black/10" },
  admin: { text: "text-violet-100", soft: "bg-violet-300/13", grad: "from-violet-300/20 via-zinc-100/8 to-black/10" },
  shop: { text: "text-yellow-100", soft: "bg-yellow-300/12", grad: "from-yellow-300/18 via-emerald-200/8 to-black/10" },
  urgent: { text: "text-rose-100", soft: "bg-rose-500/14", grad: "from-rose-500/20 via-red-300/8 to-black/10" },
  success: { text: "text-emerald-950", soft: "bg-emerald-200", grad: "from-emerald-200/20 via-white/[0.055] to-cyan-200/8" }
};

export const v6Surface = {
  base: "bg-[linear-gradient(155deg,rgba(255,255,255,0.082),rgba(255,255,255,0.032)_58%,rgba(0,0,0,0.16))] shadow-[0_14px_34px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.045)] backdrop-blur-2xl",
  elevated: "bg-white/[0.055] shadow-[0_18px_48px_rgba(0,0,0,0.24),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-2xl",
  quiet: "bg-black/14 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]"
};

export function v6Cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}
