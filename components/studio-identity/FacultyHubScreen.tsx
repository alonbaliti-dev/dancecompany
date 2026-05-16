"use client";

import { useMemo, useState } from "react";
import { Calendar, ChevronLeft, Users } from "lucide-react";
import Image from "next/image";
import { getSchedule } from "@/lib/schedule-access";
import { getMediaForFaculty } from "@/lib/integrations/media-feed";
import { openExternalMedia } from "@/lib/integrations/open-external";
import { danceStyleToInstitutional, DANCE_STYLE_LABELS_HE } from "@/lib/studio/dance-style";
import { FACULTY_THEME } from "@/lib/studio/faculty-theme";
import { userIdFromFacultyId } from "@/lib/faculty/faculty-access";
import { MENTOR_TEAM_SEASON_LABEL } from "@/lib/studio/staff-roster";
import { groupIdToName } from "@/lib/studio-roster";
import { useStudioIdentity } from "@/context/StudioIdentityContext";
import type { FacultyMember, InstitutionalStyleId } from "@/lib/types";
import { useEditableTextOptional } from "@/context/EditableTextContext";
import { ExternalMediaCard } from "../media/ExternalMediaCard";
import { SocialLinksStrip } from "../media/SocialLinksStrip";
import { StudioMediaFeed } from "../media/StudioMediaFeed";
import { Card, GhostButton, Header, Pill, PrimaryButton, SectionEyebrow, screenClass } from "../ui";

function Portrait({ member }: { member: FacultyMember }) {
  return (
    <div
      className="flex h-[4.5rem] w-[4.5rem] shrink-0 items-center justify-center rounded-full border-2 text-xl font-semibold text-white/90"
      style={{
        background: member.portraitGradient,
        borderColor: FACULTY_THEME.sandBorder
      }}
    >
      {member.fullName.charAt(0)}
    </div>
  );
}

function FacultyCard({ member, onPress }: { member: FacultyMember; onPress: () => void }) {
  return (
    <button type="button" onClick={onPress} className="w-full text-right transition active:scale-[0.99]">
      <Card animated={false} className="!p-4 !border-[rgba(245,230,227,0.22)] !bg-gradient-to-br from-[rgba(245,230,227,0.12)] to-black/40">
        <div className="flex items-center gap-4">
          <ChevronLeft className="shrink-0 text-white/25" size={18} />
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-white">{member.fullName}</p>
            <p className="mt-1 text-sm text-white/50">{member.roleLabelHe}</p>
          </div>
          <Portrait member={member} />
        </div>
      </Card>
    </button>
  );
}

function FacultyProfileContent({
  profile,
  onBack,
  onOpenStyle,
  onBookPrivateLesson,
  bookLabel
}: {
  profile: FacultyMember;
  onBack: () => void;
  onOpenStyle?: (id: InstitutionalStyleId) => void;
  onBookPrivateLesson?: (teacherId: string) => void;
  bookLabel: string;
}) {
  const { styles } = useStudioIdentity();
  const upcoming = useMemo(
    () => getSchedule().filter((s) => s.teacher === profile.fullName).slice(0, 4),
    [profile.fullName]
  );

  const groupNames = useMemo(
    () => profile.assignedGroupIds.map((id) => groupIdToName(id)).filter(Boolean) as string[],
    [profile.assignedGroupIds]
  );

  const media = getMediaForFaculty(profile.id, profile.danceStyles);

  return (
    <div className={screenClass}>
      <GhostButton onClick={onBack} className="!mb-2 !px-0 !py-1 !text-sm">
        ← חזרה לצוות
      </GhostButton>
      <div className="overflow-hidden rounded-[28px] border" style={{ borderColor: FACULTY_THEME.sandBorder }}>
        <div className="relative min-h-[220px] px-6 py-10 text-right" style={{ background: profile.portraitGradient }}>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/92 via-black/35 to-transparent" />
          <div className="relative flex flex-col items-end">
            <Portrait member={profile} />
            <Pill tone={profile.role === "owner" ? "management" : "teacher"} className="mt-4">
              {profile.roleLabelHe}
            </Pill>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white">{profile.fullName}</h2>
            {profile.shortDescription ? (
              <p className="mt-2 max-w-md text-sm leading-relaxed text-white/55">{profile.shortDescription}</p>
            ) : null}
          </div>
        </div>
      </div>

      {onBookPrivateLesson && profile.privateLessonEnabled ? (
        <PrimaryButton
          tone="commercial"
          className="w-full !py-3"
          onClick={() => onBookPrivateLesson(userIdFromFacultyId(profile.id))}
        >
          {bookLabel}
        </PrimaryButton>
      ) : null}

      {profile.privateLessonFocus?.length ? (
        <Card animated={false} className="!border-[rgba(245,230,227,0.22)]">
          <SectionEyebrow>שיעור פרטי</SectionEyebrow>
          <ul className="mt-2 space-y-1 text-right text-sm text-white/55">
            {profile.privateLessonFocus.map((line) => (
              <li key={line}>· {line}</li>
            ))}
          </ul>
        </Card>
      ) : null}

      {groupNames.length ? (
        <Card animated={false}>
          <SectionEyebrow>קבוצות</SectionEyebrow>
          <div className="mt-2 flex flex-wrap justify-end gap-2">
            {groupNames.map((g) => (
              <span
                key={g}
                className="rounded-full border px-3 py-1 text-xs text-white/65"
                style={{ borderColor: FACULTY_THEME.sandBorder, background: FACULTY_THEME.sandMuted }}
              >
                {g}
              </span>
            ))}
          </div>
        </Card>
      ) : null}

      {upcoming.length ? (
        <Card animated={false}>
          <SectionEyebrow>שיעורים קרובים</SectionEyebrow>
          <ul className="mt-3 space-y-2">
            {upcoming.map((s) => (
              <li
                key={s.id}
                className="flex justify-between gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2.5 text-right text-sm"
              >
                <span className="text-white/40">{s.day}</span>
                <span className="text-white/75">
                  {s.title} · {s.time}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      {media.length ? (
        <div>
          <SectionEyebrow>רגעים מהסטודיו</SectionEyebrow>
          <div className="mt-3 space-y-2">
            {media.slice(0, 2).map((item) => (
              <ExternalMediaCard key={item.id} item={item} layout="row" />
            ))}
          </div>
        </div>
      ) : null}

      <div>
        <SectionEyebrow>סגנונות</SectionEyebrow>
        <div className="mt-2 flex flex-wrap justify-end gap-2">
          {profile.danceStyles.map((sid) => {
            const inst = danceStyleToInstitutional(sid);
            const st = styles.find((s) => s.id === inst);
            return (
              <button
                key={sid}
                type="button"
                onClick={() => onOpenStyle?.(inst)}
                className="rounded-full border px-3 py-1.5 text-xs font-semibold transition hover:opacity-90"
                style={{
                  borderColor: st?.signatureColors.border ?? FACULTY_THEME.sandBorder,
                  color: st?.signatureColors.core ?? FACULTY_THEME.sand,
                  background: FACULTY_THEME.sandMuted
                }}
              >
                {DANCE_STYLE_LABELS_HE[sid]}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function FacultyHubScreen({
  onOpenStyle,
  onOpenMedia,
  onBookPrivateLesson
}: {
  onOpenStyle?: (id: InstitutionalStyleId) => void;
  onOpenMedia?: () => void;
  onBookPrivateLesson?: (teacherId: string) => void;
}) {
  const { mission, management, mentors } = useStudioIdentity();
  const [profileId, setProfileId] = useState<string | null>(null);
  const all = [...management, ...mentors.filter((f) => !management.some((m) => m.id === f.id))];
  const profile = profileId ? all.find((f) => f.id === profileId) : undefined;
  const copy = useEditableTextOptional();
  const bookLabel = copy?.t("faculty.book_private", "הזמנת שיעור פרטי") ?? "הזמנת שיעור פרטי";

  if (profile) {
    return (
      <FacultyProfileContent
        profile={profile}
        onBack={() => setProfileId(null)}
        onOpenStyle={onOpenStyle}
        onBookPrivateLesson={onBookPrivateLesson}
        bookLabel={bookLabel}
      />
    );
  }

  return (
    <div className={screenClass}>
      <Header title="צוות המנטורים" subtitle={MENTOR_TEAM_SEASON_LABEL} />

      <div className="overflow-hidden rounded-[22px] border shadow-lg" style={{ borderColor: FACULTY_THEME.sandBorder }}>
        <Image
          src="/team/mentors-25-26.png"
          alt={MENTOR_TEAM_SEASON_LABEL}
          width={1200}
          height={800}
          className="h-auto w-full object-cover"
          priority
        />
      </div>

      {mission ? (
        <Card tone="management" glow animated={false} className="!border-[rgba(245,230,227,0.22)]">
          <SectionEyebrow tone="management">חזון הסטודיו</SectionEyebrow>
          <p className="mt-3 text-right text-[15px] leading-relaxed text-white/60">{mission.vision}</p>
          <p className="mt-4 text-right text-xs text-white/38">LK Dance School · כפר ויתקין</p>
        </Card>
      ) : null}

      <Card animated={false} className="!p-4 !border-[rgba(245,230,227,0.22)]">
        <SectionEyebrow>הסטודיו ברשת</SectionEyebrow>
        <SocialLinksStrip className="mt-3" variant="pills" />
        {onOpenMedia ? (
          <GhostButton className="mt-4 w-full !text-[12px]" onClick={onOpenMedia}>
            כל המדיה והזיכרונות
          </GhostButton>
        ) : null}
      </Card>

      <StudioMediaFeed embedded />

      {management.length ? (
        <div>
          <SectionEyebrow tone="management">הנהלה</SectionEyebrow>
          <div className="mt-3 space-y-2">
            {management.map((m) => (
              <FacultyCard key={m.id} member={m} onPress={() => setProfileId(m.id)} />
            ))}
          </div>
        </div>
      ) : null}

      <div>
        <SectionEyebrow tone="teacher">{MENTOR_TEAM_SEASON_LABEL}</SectionEyebrow>
        <div className="mt-3 space-y-2">
          {mentors.map((m) => (
            <FacultyCard key={m.id} member={m} onPress={() => setProfileId(m.id)} />
          ))}
        </div>
      </div>

      {onOpenStyle ? (
        <GhostButton className="w-full" onClick={() => onOpenStyle("hiphop")}>
          <span className="inline-flex items-center gap-2">
            <Users size={16} />
            לסגנונות המחול
          </span>
        </GhostButton>
      ) : null}
    </div>
  );
}
