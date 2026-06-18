import { useTranslations } from "next-intl";
import ScrollReveal from "./ScrollReveal";
import SectionHeader from "./SectionHeader";

export default function Company() {
  const t = useTranslations("company");

  return (
    <section
      id="company"
      className="relative border-t border-white/10 px-6 py-20 md:px-12 md:py-32"
    >
      <div className="mx-auto max-w-[1280px]">
        <ScrollReveal>
          <SectionHeader
            idx="/company"
            kicker="COMPANY"
            title={
              <>
                {t("titleBefore")}
                <em>{t("titleEm")}</em>
                {t("titleAfter")}
              </>
            }
            lead=""
          />
        </ScrollReveal>

        <ScrollReveal>
          {/* Primary statement: the vision, set large and light. */}
          <p className="max-w-[60ch] text-xl font-light leading-relaxed text-white/80 md:text-2xl">
            {t("vision")}
          </p>
        </ScrollReveal>

        <ScrollReveal>
          {/* Two secondary statements: institutional gene + market reach. */}
          <div className="mt-16 grid grid-cols-1 gap-px bg-white/10 md:grid-cols-2">
            <div className="flex flex-col gap-4 bg-[#1f2228] px-0 py-8 md:px-10">
              <span className="font-mono text-[10px] uppercase tracking-[2px] text-white/40">
                Gene
              </span>
              <p className="text-base leading-[1.65] text-white/70 md:text-lg">
                {t("gene")}
              </p>
            </div>
            <div className="flex flex-col gap-4 bg-[#1f2228] px-0 py-8 md:px-10">
              <span className="font-mono text-[10px] uppercase tracking-[2px] text-white/40">
                Market
              </span>
              <p className="text-base leading-[1.65] text-white/70 md:text-lg">
                {t("market")}
              </p>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
