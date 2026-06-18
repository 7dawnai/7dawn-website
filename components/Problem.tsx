import { useTranslations } from "next-intl";
import ScrollReveal from "./ScrollReveal";
import SectionHeader from "./SectionHeader";

export default function Problem() {
  const t = useTranslations("problem");
  const items = [0, 1, 2, 3, 4, 5] as const;

  return (
    <section id="problem" className="relative border-t border-white/10 px-6 py-20 md:px-12 md:py-32">
      <div className="mx-auto max-w-[1280px]">
        <ScrollReveal>
          <SectionHeader
            idx="/problem"
            kicker="PROBLEM"
            title={
              <>
                {t("titleLine1")}
                <br />
                <em>{t("titleEm")}</em>
                {t("titleAfter")}
              </>
            }
            lead={t("lead")}
          />
        </ScrollReveal>

        <div className="grid grid-cols-1 gap-px bg-white/10 sm:grid-cols-2 md:grid-cols-3">
          {items.map((i) => (
            <div
              key={i}
              className="flex min-h-[200px] flex-col gap-3 bg-[#1f2228] px-6 py-7"
            >
              <div className="flex items-baseline justify-between font-mono text-[10px] uppercase tracking-[1.8px] text-white/50">
                <span>{t(`items.${i}.no`)}</span>
                <span>{t(`items.${i}.tag`)}</span>
              </div>
              <h4 className="font-mono text-[17px] leading-[1.3]">{t(`items.${i}.h4`)}</h4>
              <p className="text-[13.5px] leading-[1.55] text-white/70">{t(`items.${i}.body`)}</p>
              <div className="mt-auto border-t border-dashed border-white/10 pt-3 font-mono text-[11px] tracking-[0.4px] text-white/50">
                {t(`items.${i}.quant`)}
              </div>
            </div>
          ))}
        </div>

        <ScrollReveal className="mt-10 border-t border-white/20 pt-5">
          <p className="max-w-[80ch] font-mono text-[13px] leading-[1.7] tracking-[0.2px] text-white/70">
            {t("whyNow")}
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
