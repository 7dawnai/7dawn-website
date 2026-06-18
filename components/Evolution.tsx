import { useTranslations } from "next-intl";
import ScrollReveal from "./ScrollReveal";
import SectionHeader from "./SectionHeader";

export default function Evolution() {
  const t = useTranslations("evolution");
  const mechanism = [0, 1, 2, 3] as const;

  return (
    <section id="evolution" className="relative border-t border-white/10 px-6 py-20 md:px-12 md:py-32">
      <div className="mx-auto max-w-[1280px]">
        <ScrollReveal>
          <SectionHeader
            idx="/evolution"
            kicker="EVOLUTION"
            title={
              <>
                {t("titleBefore")}
                <em>{t("titleEm")}</em>
                {t("titleAfter")}
              </>
            }
            lead={t("lead")}
          />
        </ScrollReveal>

        <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-[1.2fr_1fr]">
          {/* Qualitative curve panel (illustrative — no numeric scale) */}
          <ScrollReveal className="flex flex-col gap-3.5 border border-white/10 bg-white/[0.03] px-6 py-6">
            <div className="flex items-baseline justify-between">
              <h4 className="font-mono text-[11px] uppercase tracking-[2px] text-white/50">
                {t("curveLabel")}
              </h4>
              <span className="chip"><span className="pulse-dot" />GAIA #1</span>
            </div>
            <svg className="block h-[240px] w-full" viewBox="0 0 800 300" preserveAspectRatio="none" aria-hidden="true">
              <g stroke="rgba(255,255,255,0.08)" strokeWidth="1">
                <line x1="0" y1="40" x2="800" y2="40" />
                <line x1="0" y1="110" x2="800" y2="110" />
                <line x1="0" y1="180" x2="800" y2="180" />
                <line x1="0" y1="250" x2="800" y2="250" />
              </g>
              <g fontFamily="Geist Mono, monospace" fontSize="10" fill="rgba(255,255,255,0.3)">
                <text x="40" y="292">M0</text>
                <text x="200" y="292">M1</text>
                <text x="430" y="292">M2</text>
                <text x="700" y="292">RL</text>
              </g>
              <path d="M40 240 C 120 230, 180 210, 240 180 S 380 140, 460 100 S 620 60, 780 50" stroke="#ffffff" strokeWidth="2.2" fill="none" />
              <path d="M40 240 C 120 230, 180 210, 240 180 S 380 140, 460 100 S 620 60, 780 50 L 780 280 L 40 280 Z" fill="rgba(255,255,255,0.05)" />
              <circle cx="780" cy="50" r="4" fill="#ffffff" />
            </svg>
            <p className="border-t border-dashed border-white/10 pt-3 text-[12.5px] leading-[1.55] text-white/50">
              {t("future")}
            </p>
          </ScrollReveal>

          {/* Mechanism list */}
          <div className="flex flex-col border border-white/10">
            {mechanism.map((i) => (
              <div key={i} className="border-b border-white/10 px-6 py-5 last:border-b-0">
                <h5 className="mb-1.5 font-mono text-[13px] font-normal tracking-[0.4px] text-white">{t(`mechanism.${i}.k`)}</h5>
                <p className="text-[12.5px] leading-[1.5] text-white/70">{t(`mechanism.${i}.v`)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Public-benchmark evidence */}
        <ScrollReveal className="mt-8 border-t border-white/20 pt-5">
          <p className="font-mono text-[13px] leading-[1.6] tracking-[0.2px] text-white/70">{t("evidence")}</p>
        </ScrollReveal>
      </div>
    </section>
  );
}
