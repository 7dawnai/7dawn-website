"use client";

import { useState, ReactNode } from "react";
import { useTranslations } from "next-intl";

type WsKey = "design" | "verify" | "flow" | "operate" | "command";
const WS_ORDER: WsKey[] = ["design", "verify", "flow", "operate", "command"];

type Step = { ix: string; name: string; st: "pass" | "run" | "wait" };
type Stat = { k: string; v: string };

const GLYPHS: Record<WsKey, ReactNode> = {
  design: <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M3 15 L9 3 L15 15" /><path d="M6 11 L12 11" /></svg>,
  verify: <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4"><rect x="3" y="3" width="12" height="12" /><path d="M6 9 L8.5 11.5 L13 7" /></svg>,
  flow: <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="9" cy="9" r="5" /><path d="M9 4 L11 6 L9 8" /><path d="M9 14 L7 12 L9 10" /></svg>,
  operate: <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M2 14 L7 7 L10 11 L16 4" /><circle cx="16" cy="4" r="1.2" fill="currentColor" /></svg>,
  command: <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M3 15 L3 9 L6 9 L6 15" /><path d="M8 15 L8 5 L11 5 L11 15" /><path d="M13 15 L13 11 L16 11 L16 15" /></svg>,
};

export default function PlatformDossier() {
  const t = useTranslations("platform");
  const [active, setActive] = useState<WsKey>("design");

  const stats = [0, 1, 2, 3] as const;
  const steps = t.raw(`bodies.${active}.steps`) as Step[];
  const bodyStats = t.raw(`bodies.${active}.stats`) as Stat[];

  return (
    <section className="relative border-t border-white/10 px-6 pt-20 pb-24 md:px-12 md:pt-24 md:pb-28">
      <div className="mx-auto max-w-[1280px]">
        {/* 4 stat cells */}
        <div className="grid grid-cols-2 border-t border-white/20 md:grid-cols-4">
          {stats.map((i) => (
            <div
              key={i}
              className="border-b border-r border-white/10 px-5 py-6 pr-6 last:border-r-0 md:border-b-0 md:pr-7 md:[&:last-child]:pr-0"
            >
              <div
                className="font-mono text-[40px] font-light leading-none tracking-[-0.01em]"
                dangerouslySetInnerHTML={{ __html: t.raw(`stats.${i}.num`) as string }}
              />
              <div className="mt-2 font-mono text-[11px] uppercase tracking-[1.6px] text-white/50">{t(`stats.${i}.lbl`)}</div>
            </div>
          ))}
        </div>

        {/* Switcher head */}
        <div className="mb-5 mt-14 flex flex-wrap items-baseline justify-between gap-4">
          <h4 className="font-mono text-[11px] uppercase tracking-[2px] text-white/50">{t("switcher.title")}</h4>
          <div className="flex flex-wrap items-center gap-2">
            <span className="chip text-white/40">{t("illustrative")}</span>
            <span className="chip"><span className="pulse-dot" />{t("switcher.live")}</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-5 overflow-x-auto border border-white/10 bg-white/[0.03]">
          {WS_ORDER.map((key) => {
            const isActive = key === active;
            return (
              <button
                type="button"
                key={key}
                onClick={() => setActive(key)}
                className={`flex min-w-[140px] flex-col gap-2.5 border-r border-white/10 px-6 py-6 text-left transition-colors last:border-r-0 ${
                  isActive ? "bg-white text-[#1f2228]" : "text-white/70 hover:bg-white/[0.05] hover:text-white"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={`border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[1.8px] ${isActive ? "border-[rgba(31,34,40,0.28)] text-[rgba(31,34,40,0.6)]" : "border-white/20 text-white/50"}`}>
                    {t(`tabs.${key}.code`)}
                  </span>
                  <span className="h-[18px] w-[18px]">{GLYPHS[key]}</span>
                </div>
                <div className="font-mono text-[17px] font-normal leading-none tracking-[-0.005em]">
                  {key === "design" ? (
                    <em className="italic font-light opacity-70">{t(`tabs.${key}.nameEm`)}</em>
                  ) : (
                    t(`tabs.${key}.nameEm`)
                  )}
                  {" · "}
                  {t(`tabs.${key}.nameText`)}
                </div>
                <div className={`font-mono text-[11px] tracking-[0.3px] ${isActive ? "text-[rgba(31,34,40,0.58)]" : "text-white/50"}`}>{t(`tabs.${key}.sub`)}</div>
              </button>
            );
          })}
        </div>

        {/* Body */}
        <div className="mt-5 grid grid-cols-1 gap-6 border border-white/10 bg-white/[0.03] px-6 py-6 md:grid-cols-[1.2fr_1fr]">
          <div>
            <h5 className="mb-3.5 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[2px] text-white/50">
              <span className="pulse-dot" />
              {t(`bodies.${active}.title`)}
            </h5>
            {steps.map((s) => (
              <div key={s.ix} className="grid grid-cols-[36px_1fr_auto] items-center gap-2.5 border-b border-dashed border-white/10 py-2.5 text-[13px] last:border-b-0">
                <span className="font-mono text-[10px] text-white/50">{s.ix}</span>
                <span>{s.name}</span>
                <span className={`font-mono text-[10px] uppercase tracking-[1.2px] ${s.st === "run" ? "text-white" : s.st === "wait" ? "text-white/30" : "text-white/70"}`}>{s.st}</span>
              </div>
            ))}
          </div>
          <div>
            <h5 className="mb-3.5 font-mono text-[10px] uppercase tracking-[2px] text-white/50">{t("switcher.metricsLabel")}</h5>
            {bodyStats.map((st) => (
              <div key={st.k} className="flex items-center justify-between border-b border-dashed border-white/10 py-2.5 text-[13px] last:border-b-0">
                <span>{st.k}</span>
                <span className="font-mono font-normal" dangerouslySetInnerHTML={{ __html: st.v }} />
              </div>
            ))}
          </div>
        </div>

        {/* Foot */}
        <div className="mt-4 flex flex-wrap justify-between gap-2 font-mono text-[11px] uppercase tracking-[1px] text-white/50">
          <span>{t("foot.industry")}</span>
          <span>{t("foot.orbitops")}</span>
        </div>
      </div>
    </section>
  );
}
