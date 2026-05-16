"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { DEFAULT_EDITABLE_COPY } from "@/lib/content/default-copy";
import { mergeEditableTexts, resolveCopy, type ResolvedCopy } from "@/lib/content/editable-text";
import { useLocalDatabase } from "@/context/LocalDatabaseContext";
import { useDomainMutation } from "@/lib/hooks/useDomainMutation";
import * as textOps from "@/lib/domains/editable-text/operations";
import type { EditableText, UserProfile } from "@/lib/types";

type Ctx = {
  user: UserProfile | null;
  textEditMode: boolean;
  setTextEditMode: (on: boolean) => void;
  texts: EditableText[];
  t: (key: string, fallback?: string, locale?: "he" | "en") => string;
  resolve: (key: string, locale?: "he" | "en") => ResolvedCopy;
  saveText: (input: {
    key: string;
    he: string;
    en?: string;
    scope?: "global" | "studio";
    studioId?: string;
  }) => void;
  resetText: (key: string) => void;
  canEdit: boolean;
  activeEditKey: string | null;
  setActiveEditKey: (key: string | null) => void;
};

const EditableTextContext = createContext<Ctx | null>(null);

export function EditableTextProvider({
  user,
  studioId,
  children
}: {
  user: UserProfile | null;
  studioId: string;
  children: ReactNode;
}) {
  const { db } = useLocalDatabase();
  const mutate = useDomainMutation();
  const [textEditMode, setTextEditMode] = useState(false);
  const [activeEditKey, setActiveEditKey] = useState<string | null>(null);

  const canEdit = Boolean(user?.permissions.isSuperAdmin);
  const overrides = db.editableTexts;

  const texts = useMemo(
    () => mergeEditableTexts(DEFAULT_EDITABLE_COPY, overrides, studioId),
    [overrides, studioId]
  );

  const resolve = useCallback(
    (key: string, locale: "he" | "en" = "he") => resolveCopy(key, texts, locale),
    [texts]
  );

  const t = useCallback(
    (key: string, fallback?: string, locale: "he" | "en" = "he") => {
      const r = resolveCopy(key, texts, locale);
      if (r.he && r.he !== key) return r.he;
      return fallback ?? r.he;
    },
    [texts]
  );

  const saveText = useCallback(
    (input: { key: string; he: string; en?: string; scope?: "global" | "studio"; studioId?: string }) => {
      if (!canEdit || !user) return;
      const base = texts.find((x) => x.key === input.key) ?? DEFAULT_EDITABLE_COPY.find((x) => x.key === input.key);
      if (!base) return;

      const built = textOps.buildSaveEditableTextMutation(user, studioId, texts, input);
      if (built) mutate({ ...built, actor: user });
    },
    [canEdit, user, texts, studioId, mutate]
  );

  const resetText = useCallback(
    (key: string) => {
      if (!canEdit || !user) return;
      const built = textOps.buildResetEditableTextMutation(user, key);
      if (built) mutate({ ...built, actor: user });
    },
    [canEdit, user, mutate]
  );

  const value = useMemo(
    () => ({
      user,
      textEditMode: canEdit && textEditMode,
      setTextEditMode: (on: boolean) => {
        if (canEdit) setTextEditMode(on);
      },
      texts,
      t,
      resolve,
      saveText,
      resetText,
      canEdit,
      activeEditKey,
      setActiveEditKey
    }),
    [user, canEdit, textEditMode, activeEditKey, texts, t, resolve, saveText, resetText]
  );

  return <EditableTextContext.Provider value={value}>{children}</EditableTextContext.Provider>;
}

export function useEditableText() {
  const ctx = useContext(EditableTextContext);
  if (!ctx) throw new Error("useEditableText requires EditableTextProvider");
  return ctx;
}

export function useEditableTextOptional() {
  return useContext(EditableTextContext);
}
