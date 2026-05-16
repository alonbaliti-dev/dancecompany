"use client";
import { getStudioGroups } from "@/lib/studio-groups-access";

import { useEffect, useMemo, useState } from "react";

import type { UserDraft } from "@/context/UserDirectoryContext";
import { permissionsForUserType, USER_TYPE_LABELS } from "@/lib/users/user-type";
import type { DirectoryUser, UserPermissions, UserProfile, UserType } from "@/lib/types";
import { BottomSheet } from "../BottomSheet";
import { GhostButton, PrimaryButton, Toggle, cx } from "../ui";

const TYPES: UserType[] = ["student", "parent", "teacher", "management"];

type Props = {
  open: boolean;
  actor: UserProfile;
  studios: { id: string; name: string }[];
  allUsers: DirectoryUser[];
  initial?: DirectoryUser | null;
  onClose: () => void;
  onSave: (draft: UserDraft) => void;
};

function emptyDraft(studioId: string): UserDraft {
  return {
    studioId,
    type: "student",
    name: "",
    phone: "",
    email: "",
    status: "active",
    assignedGroupIds: [],
    permissions: permissionsForUserType("student"),
    linkedStudentIds: [],
    linkedParentIds: [],
    initialPassword: ""
  };
}

export function UserEditorSheet({ open, actor, studios, allUsers, initial, onClose, onSave }: Props) {
  const [draft, setDraft] = useState<UserDraft>(() => emptyDraft(actor.studioId));

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setDraft({
        id: initial.id,
        studioId: initial.studioId,
        type: initial.type,
        name: initial.name,
        phone: initial.phone,
        email: initial.email,
        status: initial.status === "removed" ? "inactive" : initial.status,
        assignedGroupIds: initial.assignedGroupIds ?? [],
        permissions: { ...initial.permissions },
        linkedStudentIds: [...(initial.linkedStudentIds ?? [])],
        linkedParentIds: [...(initial.linkedParentIds ?? [])],
        initialPassword: undefined
      });
    } else {
      setDraft(emptyDraft(actor.permissions.isSuperAdmin ? studios[0]?.id ?? actor.studioId : actor.studioId));
    }
  }, [open, initial, actor, studios]);

  const parents = useMemo(
    () => allUsers.filter((u) => u.type === "parent" && u.studioId === draft.studioId && u.status !== "removed"),
    [allUsers, draft.studioId]
  );
  const students = useMemo(
    () => allUsers.filter((u) => u.type === "student" && u.studioId === draft.studioId && u.status !== "removed"),
    [allUsers, draft.studioId]
  );

  const showSuperAdmin = actor.permissions.isSuperAdmin;

  function setPerm<K extends keyof UserPermissions>(key: K, value: UserPermissions[K]) {
    setDraft((d) => ({ ...d, permissions: { ...d.permissions, [key]: value } }));
  }

  function onTypeChange(type: UserType) {
    setDraft((d) => ({ ...d, type, permissions: permissionsForUserType(type, d.permissions) }));
  }

  return (
    <BottomSheet
      open={open}
      title={initial ? "עריכת משתמש" : "הוספת משתמש"}
      onClose={onClose}
      footer={
        <div className="flex gap-2">
          <GhostButton className="flex-1" onClick={onClose}>
            ביטול
          </GhostButton>
          <PrimaryButton
            className="flex-1"
            disabled={
              !draft.name.trim() ||
              !draft.phone.trim() ||
              (!initial && (draft.initialPassword?.trim().length ?? 0) < 6)
            }
            onClick={() => onSave(draft)}
          >
            שמירה
          </PrimaryButton>
        </div>
      }
    >
      <div className="max-h-[min(70vh,520px)] space-y-4 overflow-y-auto px-1 pb-2" dir="rtl">
        <Field label="שם מלא">
          <input value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} className={inputClass} />
        </Field>
        <Field label="טלפון">
          <input value={draft.phone} onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))} className={inputClass} dir="ltr" />
        </Field>
        <Field label="אימייל (אופציונלי)">
          <input value={draft.email ?? ""} onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))} className={inputClass} dir="ltr" />
        </Field>

        {!initial ? (
          <>
            <div className="rounded-xl border border-amber-400/20 bg-amber-500/[0.07] px-3 py-2 text-right text-[11px] leading-relaxed text-amber-100/85">
              סיסמה זמנית — נשמרת בקובץ auth-credentials (פיתוח מקומי בלבד). ב-production: Supabase Auth.
            </div>
            <Field label="סיסמה זמנית (מינימום 6 תווים)">
              <input
                type="password"
                autoComplete="new-password"
                value={draft.initialPassword ?? ""}
                onChange={(e) => setDraft((d) => ({ ...d, initialPassword: e.target.value }))}
                className={inputClass}
                dir="ltr"
              />
            </Field>
          </>
        ) : (
          <p className="text-right text-[12px] text-white/40">
            התחברות אחרונה: {initial.lastLoginAt ?? "—"} · שינוי סיסמה אחרון: {initial.passwordLastChangedAt ?? "—"}
          </p>
        )}

        {showSuperAdmin ? (
          <Field label="סטודיו">
            <select value={draft.studioId} onChange={(e) => setDraft((d) => ({ ...d, studioId: e.target.value }))} className={inputClass}>
              {studios.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </Field>
        ) : null}

        <Field label="סוג משתמש">
          <div className="flex flex-wrap justify-end gap-2">
            {(showSuperAdmin ? [...TYPES, "super_admin" as UserType] : TYPES).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => onTypeChange(t)}
                className={cx(
                  "rounded-full border px-3 py-1.5 text-[11px] font-semibold",
                  draft.type === t ? "border-emerald-400/35 bg-emerald-400/14 text-emerald-100" : "border-white/10 text-white/45"
                )}
              >
                {USER_TYPE_LABELS[t]}
              </button>
            ))}
          </div>
        </Field>

        <Field label="סטטוס">
          <div className="flex gap-2">
            {(["active", "inactive"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setDraft((d) => ({ ...d, status: s }))}
                className={cx(
                  "flex-1 rounded-xl border py-2 text-sm font-semibold",
                  draft.status === s ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-100" : "border-white/10 text-white/45"
                )}
              >
                {s === "active" ? "חשבון פעיל" : "חשבון מושבת"}
              </button>
            ))}
          </div>
        </Field>

        {draft.type === "teacher" ? (
          <>
            <Field label="קבוצות">
              <div className="flex flex-wrap justify-end gap-2">
                {getStudioGroups()
                  .filter((g) => g.studioId === draft.studioId)
                  .map((g) => {
                    const on = draft.assignedGroupIds.includes(g.id);
                    return (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() =>
                          setDraft((d) => ({
                            ...d,
                            assignedGroupIds: on ? d.assignedGroupIds.filter((x) => x !== g.id) : [...d.assignedGroupIds, g.id]
                          }))
                        }
                        className={cx(
                          "rounded-full border px-3 py-1.5 text-[11px] font-semibold",
                          on ? "border-sky-400/35 bg-sky-400/14 text-sky-100" : "border-white/10 text-white/45"
                        )}
                      >
                        {g.name}
                      </button>
                    );
                  })}
              </div>
            </Field>
            <PermRow label="שליחת התראות" checked={draft.permissions.canSendNotifications} onChange={(v) => setPerm("canSendNotifications", v)} />
            <PermRow label="ניהול גלריה" checked={draft.permissions.canManageGallery} onChange={(v) => setPerm("canManageGallery", v)} />
            <PermRow label="ניהול צ׳אטים" checked={draft.permissions.canModerateChats} onChange={(v) => setPerm("canModerateChats", v)} />
            <PermRow label="ניהול נוכחות" checked={draft.permissions.canManageAttendance} onChange={(v) => setPerm("canManageAttendance", v)} />
            <PermRow label="יצירת משימות" checked={draft.permissions.canCreateTasks} onChange={(v) => setPerm("canCreateTasks", v)} />
            <PermRow label="בדיקת סרטונים" checked={draft.permissions.canReviewVideos} onChange={(v) => setPerm("canReviewVideos", v)} />
          </>
        ) : null}

        {draft.type === "management" ? (
          <>
            <PermRow label="ניהול משתמשים" checked={draft.permissions.canManageUsers} onChange={(v) => setPerm("canManageUsers", v)} />
            <PermRow label="דוחות" checked={draft.permissions.canViewReports} onChange={(v) => setPerm("canViewReports", v)} />
            <PermRow label="ניהול חנות" checked={draft.permissions.canManageShop} onChange={(v) => setPerm("canManageShop", v)} />
            <PermRow label="אירועים" checked={draft.permissions.canManageEvents} onChange={(v) => setPerm("canManageEvents", v)} />
            <PermRow label="גלריה" checked={draft.permissions.canManageGallery} onChange={(v) => setPerm("canManageGallery", v)} />
            <PermRow label="חיוב" checked={draft.permissions.canManageBilling} onChange={(v) => setPerm("canManageBilling", v)} />
            {showSuperAdmin ? (
              <PermRow label="דגלי תכונות" checked={draft.permissions.canManageFeatureFlags} onChange={(v) => setPerm("canManageFeatureFlags", v)} />
            ) : null}
          </>
        ) : null}

        {draft.type === "student" ? (
          <Field label="קישור הורים">
            <div className="space-y-2">
              {parents.map((p) => {
                const linked = draft.linkedParentIds.includes(p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() =>
                      setDraft((d) => ({
                        ...d,
                        linkedParentIds: linked ? d.linkedParentIds.filter((x) => x !== p.id) : [...d.linkedParentIds, p.id]
                      }))
                    }
                    className={cx(
                      "flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-sm",
                      linked ? "border-emerald-400/30 bg-emerald-500/10 text-white" : "border-white/10 text-white/55"
                    )}
                  >
                    <span>{linked ? "✓" : "+"}</span>
                    <span>{p.name}</span>
                  </button>
                );
              })}
              <p className="text-[11px] text-white/38">ניתן לקשר מספר הורים לאותו תלמיד</p>
            </div>
          </Field>
        ) : null}

        {draft.type === "parent" ? (
          <Field label="קישור תלמידים (ילדים)">
            <div className="space-y-2">
              {students.map((s) => {
                const linked = draft.linkedStudentIds.includes(s.id);
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() =>
                      setDraft((d) => ({
                        ...d,
                        linkedStudentIds: linked ? d.linkedStudentIds.filter((x) => x !== s.id) : [...d.linkedStudentIds, s.id]
                      }))
                    }
                    className={cx(
                      "flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-sm",
                      linked ? "border-emerald-400/30 bg-emerald-500/10 text-white" : "border-white/10 text-white/55"
                    )}
                  >
                    <span>{linked ? "✓" : "+"}</span>
                    <span>
                      {s.name}
                      {s.assignedGroups[0] ? ` · ${s.assignedGroups[0]}` : ""}
                    </span>
                  </button>
                );
              })}
            </div>
          </Field>
        ) : null}
      </div>
    </BottomSheet>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="text-right">
      <p className="mb-1.5 text-[11px] font-semibold text-white/45">{label}</p>
      {children}
    </div>
  );
}

function PermRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2.5">
      <Toggle checked={checked} onChange={onChange} aria-label={label} />
      <p className="text-sm font-medium text-white">{label}</p>
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2.5 text-[15px] text-white outline-none focus:border-emerald-400/35";
