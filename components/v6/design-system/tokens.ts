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
  base: "surface-card border-[rgba(244,213,141,0.060)] bg-[linear-gradient(150deg,rgba(255,247,223,0.052),rgba(255,255,255,0.018)_56%,rgba(90,54,30,0.045)_100%)] shadow-[0_10px_28px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,247,223,0.052)] backdrop-blur-xl",
  elevated: "surface-card border-[rgba(244,213,141,0.078)] bg-[radial-gradient(ellipse_82%_70%_at_100%_0%,rgba(244,213,141,0.075),transparent_60%),linear-gradient(152deg,rgba(255,247,223,0.070),rgba(255,255,255,0.022)_58%,rgba(90,54,30,0.055)_100%)] shadow-[0_18px_48px_rgba(0,0,0,0.30),0_10px_32px_rgba(244,213,141,0.030),inset_0_1px_0_rgba(255,247,223,0.070)] backdrop-blur-2xl",
  quiet: "border-[rgba(244,213,141,0.042)] bg-[linear-gradient(145deg,rgba(255,247,223,0.038),rgba(255,255,255,0.014)_64%,rgba(90,54,30,0.030))] shadow-[inset_0_1px_0_rgba(255,247,223,0.034)]",
  editorial: "surface-card border-[rgba(244,213,141,0.056)] bg-[linear-gradient(180deg,rgba(255,247,223,0.038),rgba(255,255,255,0.014)_68%,rgba(90,54,30,0.030))] shadow-[0_10px_28px_rgba(0,0,0,0.14),inset_0_1px_0_rgba(255,247,223,0.040)] backdrop-blur-xl",
  floating: "surface-chrome border-[rgba(244,213,141,0.125)] bg-[linear-gradient(165deg,rgba(26,20,18,0.98),rgba(8,5,7,0.985)_54%,rgba(10,5,8,0.995)_100%)] shadow-[0_28px_86px_rgba(0,0,0,0.62),0_14px_54px_rgba(244,213,141,0.045),inset_0_1px_0_rgba(255,247,223,0.090)] backdrop-blur-2xl",
  hairline: "border-[rgba(244,213,141,0.040)] bg-[rgba(255,247,223,0.020)] shadow-[inset_0_1px_0_rgba(255,247,223,0.034)]",
  open: "border-[rgba(244,213,141,0.050)] bg-[linear-gradient(135deg,rgba(255,247,223,0.040),rgba(255,255,255,0.012)_58%,rgba(244,213,141,0.026))] shadow-[inset_0_1px_0_rgba(255,247,223,0.032)]",
  whisper: "border-[rgba(244,213,141,0.040)] bg-white/[0.028] shadow-[inset_0_1px_0_rgba(255,247,223,0.024)]",
  glass: "surface-card border-[rgba(244,213,141,0.070)] bg-[linear-gradient(180deg,rgba(255,255,255,0.060),rgba(255,255,255,0.026))] shadow-[0_14px_34px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,247,223,0.058)] backdrop-blur-2xl",
  glassStrong: "surface-card border-[rgba(244,213,141,0.092)] bg-[linear-gradient(180deg,rgba(255,255,255,0.096),rgba(255,255,255,0.036))] shadow-[0_22px_58px_rgba(0,0,0,0.34),0_10px_36px_rgba(244,213,141,0.036),inset_0_1px_0_rgba(255,247,223,0.075)] backdrop-blur-2xl",
  tile: "border-[rgba(244,213,141,0.068)] bg-[linear-gradient(165deg,rgba(255,247,223,0.058),rgba(255,255,255,0.018)_62%,rgba(0,0,0,0.13))] shadow-[0_14px_34px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,247,223,0.056)]",
  inset: "border-[rgba(244,213,141,0.045)] bg-black/[0.12] shadow-[inset_0_1px_0_rgba(255,247,223,0.032)]"
};

export const v6TimetableSurface = {
  summaryTile:
    "surface-card border border-[rgba(244,213,141,0.054)] bg-[linear-gradient(180deg,rgba(255,247,223,0.044),rgba(255,255,255,0.015))] shadow-[0_8px_22px_rgba(0,0,0,0.16),inset_0_1px_0_rgba(255,247,223,0.044)] backdrop-blur-lg",
  toolbar:
    "surface-card border border-[rgba(244,213,141,0.066)] bg-[linear-gradient(180deg,rgba(18,22,30,0.72),rgba(8,10,16,0.68))] shadow-[0_14px_38px_rgba(0,0,0,0.24),inset_0_1px_0_rgba(255,247,223,0.052)] backdrop-blur-xl",
  notice:
    "border border-[rgba(244,213,141,0.050)] bg-white/[0.024] shadow-[inset_0_1px_0_rgba(255,247,223,0.030)]",
  emptyState:
    "border border-[rgba(244,213,141,0.046)] bg-[linear-gradient(180deg,rgba(255,255,255,0.028),rgba(255,255,255,0.010))] shadow-[inset_0_1px_0_rgba(255,247,223,0.028)]",
  activityRow:
    "border border-[rgba(244,213,141,0.046)] bg-black/[0.105] shadow-[inset_0_1px_0_rgba(255,247,223,0.028)]",
  dayChip:
    "surface-card border border-[rgba(244,213,141,0.050)] bg-[linear-gradient(180deg,rgba(255,255,255,0.040),rgba(255,255,255,0.016))] shadow-[0_8px_22px_rgba(0,0,0,0.14),inset_0_1px_0_rgba(255,247,223,0.038)] backdrop-blur-lg",
  lessonCard:
    "surface-card border border-[rgba(244,213,141,0.060)] bg-[linear-gradient(180deg,rgba(255,247,223,0.044),rgba(255,255,255,0.016)_70%,rgba(4,6,12,0.14))] shadow-[0_10px_26px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,247,223,0.044)] backdrop-blur-lg",
  lessonInset:
    "border border-[rgba(244,213,141,0.036)] bg-black/[0.135] shadow-[inset_0_1px_0_rgba(255,247,223,0.026)]",
  lessonPill:
    "bg-white/[0.032] shadow-[inset_0_1px_0_rgba(255,247,223,0.020)]"
};

/** Shared hover / press / focus patterns for management timetable controls. */
export const v6TimetableInteraction = {
  dayChip: "touch-manipulation rounded-[18px] text-start",
  dayChipActive:
    "bg-[#f4d58d] text-zinc-950 shadow-[0_10px_24px_rgba(244,213,141,0.14)] ring-1 ring-inset ring-zinc-950/12 motion-safe:active:scale-[0.99] motion-safe:active:shadow-[0_6px_16px_rgba(244,213,141,0.10)]",
  dayChipInactive:
    "text-white/64 motion-safe:hover:-translate-y-px motion-safe:hover:border-[rgba(244,213,141,0.072)] motion-safe:hover:bg-white/[0.050] motion-safe:hover:shadow-[0_10px_26px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,247,223,0.048)] motion-safe:active:translate-y-0 motion-safe:active:scale-[0.99] motion-safe:active:bg-white/[0.036]",
  dayChipDisabled: "cursor-default select-none opacity-55 saturate-[0.88]",
  lessonCard:
    "touch-manipulation motion-safe:hover:border-[rgba(244,213,141,0.078)] motion-safe:hover:bg-white/[0.048] motion-safe:hover:shadow-[0_14px_32px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,247,223,0.052)] motion-safe:active:scale-[0.99] motion-safe:active:shadow-[0_8px_18px_rgba(0,0,0,0.16)]",
  conflictChip:
    "transition-[background-color,border-color,box-shadow] duration-200 motion-safe:hover:border-white/[0.12]",
  conflictSummaryChip:
    "motion-safe:hover:border-white/[0.10] motion-safe:hover:bg-white/[0.028]",
  toolbarActions: "[&>button]:touch-manipulation [&>button:disabled]:pointer-events-none",
  ghostAction:
    "border border-[rgba(244,213,141,0.060)] bg-white/[0.030] text-white/82 shadow-[inset_0_1px_0_rgba(255,247,223,0.038)] motion-safe:hover:-translate-y-px motion-safe:hover:border-[rgba(244,213,141,0.090)] motion-safe:hover:bg-white/[0.050] motion-safe:hover:shadow-[0_10px_24px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,247,223,0.050)] motion-safe:active:translate-y-0 motion-safe:active:scale-[0.985]",
  activityRow:
    "transition-[background-color,border-color] duration-200 motion-safe:hover:bg-white/[0.032] motion-safe:hover:border-[rgba(244,213,141,0.060)]"
};

export const v6Visual = {
  canvas:
    "bg-[radial-gradient(ellipse_94%_44%_at_50%_-14%,rgba(255,247,223,0.145),transparent_64%),radial-gradient(ellipse_58%_44%_at_14%_74%,rgba(100,28,63,0.22),transparent_68%),radial-gradient(ellipse_42%_28%_at_86%_18%,rgba(244,213,141,0.080),transparent_60%),linear-gradient(180deg,#020102_0%,#080405_48%,#020203_100%)]",
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

export const v6Radius = {
  chip: "rounded-[14px]",
  control: "rounded-[16px]",
  row: "rounded-[18px]",
  card: "rounded-[24px]",
  hero: "rounded-[30px]",
  sheet: "rounded-t-[28px] md:rounded-[30px]"
};

export const v6Space = {
  card: "p-3.5 sm:p-4",
  compactCard: "p-2.5 sm:p-3",
  sectionGap: "space-y-3 sm:space-y-4",
  safeBottom: "pb-[calc(var(--safe-bottom)+0.75rem)]",
  navBottom: "pb-[calc(var(--nav-offset)+1rem)]"
};

export const v6Motion = {
  standard: "transition-[transform,border-color,background,box-shadow,filter] duration-200 ease-out motion-reduce:transition-none",
  gentle: "transition-[transform,border-color,background,box-shadow,opacity] duration-300 ease-out motion-reduce:transition-none",
  press: "motion-safe:active:scale-[0.985]",
  pressSoft: "motion-safe:active:scale-[0.99]",
  iconPress: "transition-transform duration-200 ease-out motion-reduce:transition-none motion-safe:group-active:scale-95",
  hoverGlow: "motion-safe:hover:border-[rgba(244,213,141,0.13)] motion-safe:hover:shadow-[0_18px_46px_rgba(0,0,0,0.28),0_10px_34px_rgba(244,213,141,0.040),inset_0_1px_0_rgba(255,247,223,0.070)]",
  focusRing: "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f4d58d]/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050304]"
};

export const v6Interactive = {
  card: "lk-card-press cursor-pointer touch-manipulation motion-safe:hover:-translate-y-0.5",
  row: "cursor-pointer touch-manipulation motion-safe:hover:-translate-y-px motion-safe:hover:bg-white/[0.030]",
  control:
    "touch-manipulation disabled:cursor-not-allowed disabled:opacity-42 disabled:saturate-[0.68] disabled:shadow-none disabled:hover:brightness-100 disabled:hover:translate-y-0 disabled:active:scale-100"
};

export const v6TeacherSurface = {
  greeting:
    "border border-sky-300/[0.10] bg-[linear-gradient(165deg,rgba(125,211,252,0.055),rgba(255,255,255,0.016)_48%,rgba(12,32,48,0.14))] shadow-[0_14px_36px_rgba(0,0,0,0.20),inset_0_1px_0_rgba(125,211,252,0.050)] backdrop-blur-xl",
  flowRow:
    "border border-sky-300/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.034),rgba(255,255,255,0.010))] shadow-[inset_0_1px_0_rgba(125,211,252,0.028)]",
  flowRowActive: "border-sky-300/[0.14] bg-[linear-gradient(180deg,rgba(125,211,252,0.10),rgba(255,255,255,0.018))]",
  metric:
    "border border-sky-300/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.030),rgba(255,255,255,0.010))] shadow-[inset_0_1px_0_rgba(125,211,252,0.026)]",
  quickAction: "border border-sky-300/[0.09] bg-white/[0.026] shadow-[inset_0_1px_0_rgba(125,211,252,0.024)]",
  empty:
    "border border-sky-300/[0.07] bg-[linear-gradient(180deg,rgba(255,255,255,0.024),rgba(255,255,255,0.008))] shadow-[inset_0_1px_0_rgba(125,211,252,0.022)]"
};

export const v6StudentSurface = {
  greeting:
    "border border-[rgba(244,213,141,0.062)] bg-[linear-gradient(165deg,rgba(255,247,223,0.055),rgba(255,255,255,0.018)_48%,rgba(80,28,52,0.12))] shadow-[0_16px_40px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,247,223,0.055)] backdrop-blur-xl",
  scheduleRow:
    "border border-[rgba(244,213,141,0.044)] bg-[linear-gradient(180deg,rgba(255,255,255,0.038),rgba(255,255,255,0.012))] shadow-[inset_0_1px_0_rgba(255,247,223,0.034)]",
  scheduleRowNext: "border-[rgba(244,213,141,0.12)] bg-[linear-gradient(180deg,rgba(244,213,141,0.10),rgba(255,255,255,0.020))]",
  progress:
    "border border-[rgba(244,213,141,0.052)] bg-[linear-gradient(180deg,rgba(255,247,223,0.040),rgba(255,255,255,0.014))] shadow-[0_10px_28px_rgba(0,0,0,0.16),inset_0_1px_0_rgba(255,247,223,0.042)]",
  quickAction:
    "border border-[rgba(244,213,141,0.050)] bg-white/[0.028] shadow-[inset_0_1px_0_rgba(255,247,223,0.030)]",
  empty:
    "border border-[rgba(244,213,141,0.040)] bg-[linear-gradient(180deg,rgba(255,255,255,0.026),rgba(255,255,255,0.008))] shadow-[inset_0_1px_0_rgba(255,247,223,0.026)]"
};

export const v6ScreenAtmosphere = {
  home: "bg-[radial-gradient(ellipse_88%_40%_at_50%_-2%,rgba(244,213,141,0.135),transparent_64%),radial-gradient(ellipse_54%_44%_at_10%_76%,rgba(100,28,63,0.23),transparent_68%),radial-gradient(ellipse_44%_30%_at_90%_12%,rgba(255,247,223,0.052),transparent_64%),linear-gradient(180deg,#020102,#090505_52%,#020102)]",
  student:
    "bg-[radial-gradient(ellipse_86%_42%_at_50%_-4%,rgba(244,213,141,0.118),transparent_62%),radial-gradient(ellipse_50%_40%_at_8%_78%,rgba(183,47,61,0.16),transparent_66%),radial-gradient(ellipse_40%_28%_at_92%_14%,rgba(255,247,223,0.048),transparent_60%),linear-gradient(180deg,#030102,#0a0506_54%,#020102)]",
  teacher:
    "bg-[radial-gradient(ellipse_84%_40%_at_50%_-6%,rgba(125,211,252,0.092),transparent_62%),radial-gradient(ellipse_48%_38%_at_10%_78%,rgba(16,185,129,0.08),transparent_66%),radial-gradient(ellipse_42%_30%_at_90%_12%,rgba(244,213,141,0.040),transparent_60%),linear-gradient(180deg,#020408,#060a10_54%,#020408)]",
  shop: "bg-[radial-gradient(ellipse_80%_38%_at_50%_-6%,rgba(244,213,141,0.148),transparent_66%),radial-gradient(ellipse_48%_34%_at_8%_72%,rgba(16,185,129,0.062),transparent_64%),linear-gradient(180deg,#030202,#090604_54%,#020202)]",
  management: "bg-[radial-gradient(ellipse_80%_38%_at_50%_-8%,rgba(244,213,141,0.088),transparent_60%),radial-gradient(ellipse_52%_40%_at_12%_72%,rgba(125,211,252,0.090),transparent_66%),linear-gradient(180deg,#020409,#050712_54%,#020207)]",
  admin: "bg-[radial-gradient(ellipse_80%_38%_at_50%_-8%,rgba(244,213,141,0.090),transparent_60%),radial-gradient(ellipse_54%_40%_at_12%_72%,rgba(216,210,255,0.090),transparent_66%),linear-gradient(180deg,#030208,#07040f_54%,#020207)]",
  shopSoft: "bg-[linear-gradient(145deg,rgba(244,213,141,0.13),rgba(16,185,129,0.045),rgba(255,255,255,0.016))]"
};

export const v6Type = {
  kicker: "lk-safe-meta text-[8.5px] font-semibold uppercase tracking-[0.14em] text-white/32",
  heroTitle: "lk-safe-title text-[clamp(1.24rem,5.4vw,1.62rem)] font-semibold tracking-[-0.030em] text-white",
  screenTitle: "lk-safe-title text-[clamp(1.12rem,5vw,1.48rem)] font-semibold tracking-[-0.028em] text-white",
  editorialTitle: "lk-safe-title text-[clamp(1.08rem,4.8vw,1.42rem)] font-semibold tracking-[-0.026em] text-white",
  statement: "lk-safe-text text-[clamp(0.96rem,4vw,1.12rem)] font-medium tracking-[-0.020em] text-white/86",
  subtitle: "text-[11.5px] font-normal leading-relaxed tracking-[-0.006em] text-white/56",
  metadata: "text-[10px] font-medium leading-snug tracking-[-0.004em] text-white/40",
  sectionTitle: "text-[13.5px] font-semibold leading-snug tracking-[-0.020em] text-white/80"
};

export const v6Safe = {
  surface: "lk-safe-surface relative isolate mx-auto w-full max-w-full text-start leading-normal",
  content: "lk-safe-content min-w-0 max-w-full",
  row: "lk-safe-row",
  title: "lk-safe-title",
  text: "lk-safe-text",
  meta: "lk-safe-meta",
  badgeGroup: "lk-safe-badge-group",
  control: "lk-safe-control",
  screen: "min-h-app px-safe",
  page: "lk-scroll-page scroll-touch",
  bottom: "pb-safe",
  navBottom: "pb-nav-safe"
};

export const v6Control = {
  field: "lk-safe-control min-h-[50px] w-full max-w-full appearance-none rounded-[18px] border border-[rgba(244,213,141,0.085)] !bg-[linear-gradient(180deg,rgba(255,247,223,0.052),rgba(255,255,255,0.020))] px-3.5 py-2.5 text-[16px] leading-normal text-white outline-none placeholder:text-white/30 shadow-[inset_0_1px_0_rgba(255,247,223,0.060)] transition duration-200 focus:border-[rgba(244,213,141,0.30)] focus:!bg-[linear-gradient(180deg,rgba(255,247,223,0.070),rgba(255,255,255,0.026))] focus:shadow-[0_0_0_4px_rgba(244,213,141,0.070),inset_0_1px_0_rgba(255,247,223,0.075)]",
  label: "lk-safe-meta text-[12px] font-semibold tracking-[-0.010em] text-white/48",
  chip: "lk-safe-control max-w-full rounded-[16px] border border-[rgba(244,213,141,0.070)] bg-white/[0.038] px-3 py-2 text-xs font-semibold text-white/64 shadow-[inset_0_1px_0_rgba(255,247,223,0.040)]"
};

export function v6Cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}
