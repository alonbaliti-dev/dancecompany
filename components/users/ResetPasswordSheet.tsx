"use client";

import { useEffect, useState } from "react";
import type { DirectoryUser } from "@/lib/types";
import { BottomSheet } from "../BottomSheet";
import { GhostButton, PrimaryButton, inputClass } from "../ui";

type Props = {
  open: boolean;
  user: DirectoryUser | null;
  onClose: () => void;
  onSave: (password: string) => boolean;
};

export function ResetPasswordSheet({ open, user, onClose, onSave }: Props) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!open) return;
    setPassword("");
    setConfirm("");
    setError(null);
    setSuccess(false);
  }, [open, user?.id]);

  function submit() {
    setError(null);
    if (password.length < 6) {
      setError("סיסמה חייבת להכיל לפחות 6 תווים");
      return;
    }
    if (password !== confirm) {
      setError("הסיסמאות אינן תואמות");
      return;
    }
    const ok = onSave(password);
    if (!ok) {
      setError("לא ניתן לעדכן סיסמה — בדקו הרשאות");
      return;
    }
    setSuccess(true);
  }

  return (
    <BottomSheet
      open={open}
      title="איפוס סיסמה"
      onClose={onClose}
      footer={
        success ? (
          <PrimaryButton className="w-full" onClick={onClose}>
            סגירה
          </PrimaryButton>
        ) : (
          <div className="flex gap-2">
            <GhostButton className="flex-1" onClick={onClose}>
              ביטול
            </GhostButton>
            <PrimaryButton className="flex-1" disabled={!password || !confirm} onClick={submit}>
              עדכון סיסמה
            </PrimaryButton>
          </div>
        )
      }
    >
      <SheetBody
        user={user}
        success={success}
        password={password}
        confirm={confirm}
        error={error}
        setPassword={setPassword}
        setConfirm={setConfirm}
      />
    </BottomSheet>
  );
}

function SheetBody({
  user,
  success,
  password,
  confirm,
  error,
  setPassword,
  setConfirm
}: {
  user: DirectoryUser | null;
  success: boolean;
  password: string;
  confirm: string;
  error: string | null;
  setPassword: (v: string) => void;
  setConfirm: (v: string) => void;
}) {
  return (
    <div className="space-y-4 px-1 pb-2" dir="rtl">
      {user ? (
        <p className="text-right text-sm text-white/55">
          משתמש: <span className="font-semibold text-white">{user.name}</span>
        </p>
      ) : null}

      <div className="rounded-xl border border-amber-400/25 bg-amber-500/[0.08] px-3 py-2.5 text-right text-[12px] leading-relaxed text-amber-100/90">
        מצב פיתוח מקומי בלבד — בסביבת production איפוס סיסמה מתבצע בשרת האקדמיה ונשמר כ-hash. סיסמאות אינן מוצגות בממשק.
      </div>

      {success ? (
        <p className="rounded-xl border border-emerald-400/25 bg-emerald-500/10 px-3 py-3 text-center text-sm font-semibold text-emerald-100">
          סיסמה זמנית עודכנה
        </p>
      ) : (
        <>
          <label className="block text-right text-[11px] font-semibold text-white/40">סיסמה זמנית חדשה</label>
          <input
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
            dir="ltr"
          />
          <label className="block text-right text-[11px] font-semibold text-white/40">אימות סיסמה</label>
          <input
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className={inputClass}
            dir="ltr"
          />
          {error ? <p className="text-right text-[12px] text-rose-300/90">{error}</p> : null}
        </>
      )}
    </div>
  );
}
