"use client";

import { useState } from "react";
import { usePlatform } from "@/context/PlatformContext";
import { Card, Header, PrimaryButton, screenClass, inputClass } from "../ui";

export function BrandingEditorScreen() {
  const { branding, updateBranding } = usePlatform();
  const [name, setName] = useState(branding.studioName);
  const [logo, setLogo] = useState(branding.logoText);
  const [app, setApp] = useState(branding.appName);
  const [primary, setPrimary] = useState(branding.primaryColor);
  const [accent, setAccent] = useState(branding.accentColor);

  return (
    <div className={screenClass}>
      <Header title="מיתוג" subtitle="שם, צבעים וזהות ויזואלית לסטודיו." />
      <Card animated={false} className="space-y-3">
        <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="שם סטודיו" />
        <input className={inputClass} value={logo} onChange={(e) => setLogo(e.target.value)} placeholder="טקסט לוגו" />
        <input className={inputClass} value={app} onChange={(e) => setApp(e.target.value)} placeholder="שם האפליקציה" />
        <input className={inputClass} value={primary} onChange={(e) => setPrimary(e.target.value)} placeholder="צבע ראשי (#hex)" />
        <input className={inputClass} value={accent} onChange={(e) => setAccent(e.target.value)} placeholder="צבע הדגשה" />
        <PrimaryButton onClick={() => updateBranding({ studioName: name, logoText: logo, appName: app, primaryColor: primary, accentColor: accent })}>שמירה</PrimaryButton>
      </Card>
    </div>
  );
}
