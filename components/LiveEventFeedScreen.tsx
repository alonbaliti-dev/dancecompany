"use client";

import { useState } from "react";
import { useLegacyEvents } from "@/context/LegacyEventsContext";
import { useStudioOS } from "@/context/StudioOSContext";
import { liveFeedStatusLabel } from "@/lib/studio-os-logic";
import type { LiveFeedStatus } from "@/lib/types";
import { Card, Header, PrimaryButton, SectionEyebrow } from "./ui";

export function LiveEventFeedScreen() {
  const { visibleEvents } = useLegacyEvents();
  const { user, liveFeed, postLiveUpdate } = useStudioOS();
  const [eventId, setEventId] = useState(visibleEvents.find((e) => e.status === "current")?.id ?? visibleEvents[0]?.id ?? "");
  const [msg, setMsg] = useState("");
  const [status, setStatus] = useState<LiveFeedStatus>("update");
  const posts = liveFeed.filter((p) => p.eventId === eventId);
  const staff = user.permissions.isTeacher || user.permissions.isManagement;

  return (
    <div className="space-y-8 pb-6">
      <Header title="פיד חי" subtitle="עדכונים בזמן אמת מההופעה או התחרות." />
      <select className="w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-white" value={eventId} onChange={(e) => setEventId(e.target.value)}>
        {visibleEvents.map((e) => <option key={e.id} value={e.id} className="bg-zinc-900">{e.title}</option>)}
      </select>
      {staff ? (
        <Card animated={false}>
          <textarea className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white outline-none" value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="עדכון לפיד..." />
          <select className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-white" value={status} onChange={(e) => setStatus(e.target.value as LiveFeedStatus)}>
            <option value="arrived">הגיעו</option><option value="warming_up">מתחממים</option><option value="on_stage">על הבמה</option><option value="results">תוצאות</option><option value="update">עדכון</option>
          </select>
          <PrimaryButton className="mt-2" disabled={!msg.trim() || !eventId} onClick={() => { postLiveUpdate(eventId, status, msg.trim(), true); setMsg(""); }}>פרסום</PrimaryButton>
        </Card>
      ) : null}
      <div className="space-y-2">{posts.map((p) => (
        <Card key={p.id} animated={false}>
          <p className="text-[10px] text-emerald-300/80">{liveFeedStatusLabel(p.status)}</p>
          <p className="mt-1 text-white">{p.message}</p>
          <p className="mt-1 text-[10px] text-white/35">{p.createdByName} · {new Date(p.createdAt).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })}{p.parentVisible ? " · גלוי להורים" : ""}</p>
        </Card>
      ))}</div>
    </div>
  );
}
