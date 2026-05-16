"use client";
import { getStudioGroups } from "@/lib/studio-groups-access";

import { useMemo, useState } from "react";
import { Link2, Plus, Search, UserRound } from "lucide-react";
import { usePlatform } from "@/context/PlatformContext";
import { useToast } from "@/context/ToastContext";
import { useUserDirectory, type UserDraft } from "@/context/UserDirectoryContext";
import { useDeviceLayout } from "@/context/DeviceLayoutContext";

import {
  directoryVisibleToActor,
  canDeactivateUser,
  canEditUser,
  canManageUsers,
  canRemoveUser,
  canResetPassword,
  canRestoreUser
} from "@/lib/users/user-guards";
import {
  filterDirectoryUsers,
  linkedParentNames,
  linkedStudentNames,
  userTypeLabel,
  type UserMgmtFilters
} from "@/lib/users/user-logic";
import { USER_STATUS_LABELS } from "@/lib/users/user-type";
import type { DirectoryUser, UserProfile, UserType } from "@/lib/types";
import { UserEditorSheet } from "./UserEditorSheet";
import { ResetPasswordSheet } from "./ResetPasswordSheet";
import { Card, GhostButton, Header, PrimaryButton, SectionEyebrow, cx, screenClass } from "../ui";

const TYPE_SECTIONS: { type: UserType; label: string; superAdminOnly?: boolean }[] = [
  { type: "student", label: "תלמידים" },
  { type: "parent", label: "הורים" },
  { type: "teacher", label: "מורים" },
  { type: "management", label: "הנהלה" },
  { type: "super_admin", label: "מנהלי על", superAdminOnly: true }
];

export function UserManagementScreen({
  actor,
  onOpenRelationships
}: {
  actor: UserProfile;
  onOpenRelationships?: () => void;
}) {
  const { studios } = usePlatform();
  const { showToast } = useToast();
  const { users, createUser, updateUser, setStatus, resetPassword } = useUserDirectory();
  const { layoutMode } = useDeviceLayout();
  const split = layoutMode === "desktop" || layoutMode === "tablet";

  const [filters, setFilters] = useState<UserMgmtFilters>({ q: "", type: "all", status: "all", groupId: "all" });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<DirectoryUser | null>(null);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetTarget, setResetTarget] = useState<DirectoryUser | null>(null);

  const sections = useMemo(
    () => TYPE_SECTIONS.filter((s) => !s.superAdminOnly || actor.permissions.isSuperAdmin),
    [actor.permissions.isSuperAdmin]
  );

  const scopeStudio = actor.permissions.isSuperAdmin ? undefined : actor.studioId;
  const visible = useMemo(() => directoryVisibleToActor(actor, users), [actor, users]);

  const filtered = useMemo(() => filterDirectoryUsers(visible, filters, scopeStudio), [visible, filters, scopeStudio]);

  const selected = selectedId ? users.find((u) => u.id === selectedId) : filtered[0];

  if (!canManageUsers(actor)) {
    return (
      <div className={screenClass}>
        <Header title="ניהול משתמשים" subtitle="אין הרשאה לצפות במסך זה." />
      </div>
    );
  }

  function openCreate() {
    setEditTarget(null);
    setEditorOpen(true);
  }

  function openEdit(u: DirectoryUser) {
    setEditTarget(u);
    setEditorOpen(true);
  }

  function openReset(u: DirectoryUser) {
    setResetTarget(u);
    setResetOpen(true);
  }

  function handleStatusChange(u: DirectoryUser, status: UserProfile["status"], label: string) {
    if (!setStatus(actor, u.id, status)) {
      showToast(`לא ניתן לבצע ${label}`, "error");
      return;
    }
    showToast(label, "success");
  }

  function handleSave(draft: UserDraft) {
    if (draft.id) {
      const updated = updateUser(actor, draft.id, draft);
      if (!updated) {
        showToast("לא ניתן לשמור את המשתמש — בדקו הרשאות", "error");
        return;
      }
      showToast("המשתמש נשמר", "success");
    } else {
      if (!draft.initialPassword || draft.initialPassword.trim().length < 6) {
        showToast("נדרשת סיסמה זמנית (לפחות 6 תווים)", "error");
        return;
      }
      const created = createUser(actor, draft);
      if (!created) {
        showToast("לא ניתן ליצור משתמש — בדקו הרשאות ופרטים", "error");
        return;
      }
      showToast("משתמש נוסף", "success");
    }
    setEditorOpen(false);
  }

  return (
    <div className={cx(screenClass, split && "lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-6 lg:items-start")} dir="rtl">
      <div className="space-y-5 min-w-0">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <Header title="ניהול משתמשים" subtitle="הוספה, עריכה, הרשאות וקישורי משפחה — לפי תפקיד וסטודיו." />
          <div className="flex shrink-0 flex-wrap gap-2">
            {onOpenRelationships ? (
              <GhostButton onClick={onOpenRelationships} className="!text-[12px]">
                <Link2 size={16} className="ml-1 inline" />
                קישור הורים ותלמידים
              </GhostButton>
            ) : null}
            <PrimaryButton onClick={openCreate} className="!py-2.5 !text-sm">
              <Plus size={16} className="ml-1 inline" />
              משתמש חדש
            </PrimaryButton>
          </div>
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute right-3.5 top-1/2 size-[1.1rem] -translate-y-1/2 text-white/35" />
          <input
            value={filters.q}
            onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
            placeholder="חיפוש לפי שם, טלפון או אימייל…"
            className="w-full rounded-2xl border border-white/10 bg-white/[0.05] py-3.5 pl-4 pr-11 text-[15px] text-white outline-none placeholder:text-white/35 focus:border-emerald-400/35"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            value={filters.type}
            onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value as UserMgmtFilters["type"] }))}
            className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
          >
            <option value="all">כל הסוגים</option>
            {sections.map((s) => (
              <option key={s.type} value={s.type}>
                {s.label}
              </option>
            ))}
          </select>
          <select
            value={filters.status}
            onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value as UserMgmtFilters["status"] }))}
            className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
          >
            <option value="all">כל הסטטוסים</option>
            <option value="active">פעיל</option>
            <option value="inactive">מושבת</option>
            <option value="removed">הוסר</option>
          </select>
          <select
            value={filters.groupId}
            onChange={(e) => setFilters((f) => ({ ...f, groupId: e.target.value }))}
            className="rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
          >
            <option value="all">כל הקבוצות</option>
            {getStudioGroups().map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>

        <p className="text-right text-xs text-white/38">{filtered.length} משתמשים</p>

        {!split ? (
          <div className="space-y-6">
            {sections.map((sec) => {
              const rows = filtered.filter((u) => u.type === sec.type);
              if (!rows.length) return null;
              return (
                <section key={sec.type}>
                  <SectionEyebrow>{sec.label}</SectionEyebrow>
                  <div className="mt-2 space-y-2">
                    {rows.map((u) => (
                      <UserCard
                        key={u.id}
                        user={u}
                        all={users}
                        actor={actor}
                        onEdit={() => openEdit(u)}
                        onResetPassword={() => openReset(u)}
                        onDeactivate={() => handleStatusChange(u, "inactive", "המשתמש הושבת")}
                        onRemove={() => handleStatusChange(u, "removed", "המשתמש הוסר")}
                        onRestore={() => handleStatusChange(u, "active", "המשתמש שוחזר")}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        ) : (
          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
            {filtered.map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => setSelectedId(u.id)}
                className={cx(
                  "w-full rounded-2xl border px-4 py-3 text-right transition",
                  selected?.id === u.id ? "border-emerald-400/30 bg-emerald-500/10" : "border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.05]"
                )}
              >
                <p className="font-semibold text-white">{u.name}</p>
                <p className="mt-0.5 text-xs text-white/42">
                  {userTypeLabel(u)} · {USER_STATUS_LABELS[u.status]}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>

      {split && selected ? (
        <UserDetailPanel
          user={selected}
          all={users}
          actor={actor}
          onEdit={() => openEdit(selected)}
          onResetPassword={() => openReset(selected)}
          onDeactivate={() => handleStatusChange(selected, "inactive", "המשתמש הושבת")}
          onRemove={() => handleStatusChange(selected, "removed", "המשתמש הוסר")}
          onRestore={() => handleStatusChange(selected, "active", "המשתמש שוחזר")}
        />
      ) : null}

      <UserEditorSheet
        open={editorOpen}
        actor={actor}
        studios={studios.map((s) => ({ id: s.id, name: s.name }))}
        allUsers={users}
        initial={editTarget}
        onClose={() => setEditorOpen(false)}
        onSave={handleSave}
      />

      <ResetPasswordSheet
        open={resetOpen}
        user={resetTarget}
        onClose={() => {
          setResetOpen(false);
          setResetTarget(null);
        }}
        onSave={(password) => {
          if (!resetTarget) return false;
          const ok = resetPassword(actor, resetTarget.id, password);
          if (ok) showToast("סיסמה זמנית עודכנה", "success");
          return ok;
        }}
      />
    </div>
  );
}

function UserCard({
  user,
  all,
  actor,
  onEdit,
  onResetPassword,
  onDeactivate,
  onRemove,
  onRestore
}: {
  user: DirectoryUser;
  all: DirectoryUser[];
  actor: UserProfile;
  onEdit: () => void;
  onResetPassword: () => void;
  onDeactivate: () => void;
  onRemove: () => void;
  onRestore: () => void;
}) {
  const parents = linkedParentNames(user, all);
  const children = linkedStudentNames(user, all);
  const editable = canEditUser(actor, user);

  return (
    <Card animated={false} className="!p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-base font-semibold text-white">
            {user.avatarInitial}
          </div>
          <div className="min-w-0 text-right">
            <p className="font-semibold text-white">{user.name}</p>
            <p className="mt-0.5 text-[11px] text-emerald-200/70">{userTypeLabel(user)}</p>
            <p className="mt-1 text-[12px] tabular-nums text-white/42" dir="ltr">
              {user.phone}
            </p>
            <p className="mt-1 text-[11px] text-white/38">{USER_STATUS_LABELS[user.status]}</p>
            {user.assignedGroups.length > 0 ? (
              <p className="mt-1 text-[11px] text-white/42">קבוצות: {user.assignedGroups.join(" · ")}</p>
            ) : null}
            {parents.length > 0 ? <p className="mt-1 text-[11px] text-white/42">הורים: {parents.join(" · ")}</p> : null}
            {children.length > 0 ? <p className="mt-1 text-[11px] text-white/42">ילדים: {children.join(" · ")}</p> : null}
            <p className="mt-1 text-[11px] text-white/32">
              התחברות: {user.lastLoginAt ?? "—"} · פעילות: {user.lastActiveAt}
            </p>
          </div>
        </div>
      </div>

      {editable ? (
        <div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-white/[0.06] pt-3">
          <GhostButton className="!text-[11px]" onClick={onEdit}>
            עריכה
          </GhostButton>
          {canResetPassword(actor, user) ? (
            <GhostButton className="!text-[11px]" onClick={onResetPassword}>
              איפוס סיסמה
            </GhostButton>
          ) : null}
          {user.status === "active" && canDeactivateUser(actor, user) ? (
            <GhostButton className="!text-[11px] !text-amber-200" onClick={onDeactivate}>
              השבתה
            </GhostButton>
          ) : null}
          {user.status !== "removed" && canRemoveUser(actor, user) ? (
            <GhostButton className="!text-[11px] !text-rose-200" onClick={onRemove}>
              הסרה
            </GhostButton>
          ) : null}
          {user.status !== "active" && canRestoreUser(actor, user) ? (
            <GhostButton className="!text-[11px]" onClick={onRestore}>
              שחזור
            </GhostButton>
          ) : null}
        </div>
      ) : null}
    </Card>
  );
}

function UserDetailPanel({
  user,
  all,
  actor,
  onEdit,
  onResetPassword,
  onDeactivate,
  onRemove,
  onRestore
}: {
  user: DirectoryUser;
  all: DirectoryUser[];
  actor: UserProfile;
  onEdit: () => void;
  onResetPassword: () => void;
  onDeactivate: () => void;
  onRemove: () => void;
  onRestore: () => void;
}) {
  return (
    <Card animated={false} className="sticky top-4 !p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-lg font-semibold text-white">
          <UserRound size={22} className="text-white/50" />
        </div>
        <div className="text-right">
          <h2 className="text-xl font-semibold text-white">{user.name}</h2>
          <p className="text-sm text-white/45">{userTypeLabel(user)}</p>
        </div>
      </div>
      <p className="mt-4 text-sm tabular-nums text-white/50" dir="ltr">{user.phone}</p>
      <p className="mt-2 text-[12px] text-white/40">
        התחברות: {user.lastLoginAt ?? "—"} · פעילות: {user.lastActiveAt}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <GhostButton onClick={onEdit}>עריכה</GhostButton>
        {canResetPassword(actor, user) ? (
          <GhostButton onClick={onResetPassword}>איפוס סיסמה</GhostButton>
        ) : null}
        {user.status === "active" && canDeactivateUser(actor, user) ? (
          <GhostButton className="!text-amber-200" onClick={onDeactivate}>השבתה</GhostButton>
        ) : null}
        {user.status !== "removed" && canRemoveUser(actor, user) ? (
          <GhostButton className="!text-rose-200" onClick={onRemove}>הסרה</GhostButton>
        ) : null}
        {user.status !== "active" && canRestoreUser(actor, user) ? (
          <GhostButton onClick={onRestore}>שחזור</GhostButton>
        ) : null}
      </div>
    </Card>
  );
}
