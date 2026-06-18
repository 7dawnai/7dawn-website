import { useTranslations } from "next-intl";
import ScrollReveal from "./ScrollReveal";
import SectionHeader from "./SectionHeader";

// Fixed, language-neutral mono labels for the three content rows.
// Body copy comes from i18n (pain / land / expand); these short caps stay constant across locales.
const ROWS = [
  { label: "PAIN", key: "pain" },
  { label: "LAND", key: "land" },
  { label: "EXPAND", key: "expand" },
] as const;

export default function Industries() {
  const t = useTranslations("industries");
  const items = ["0", "1", "2"] as const;
  const chips = t.raw("more.chips") as string[];

  return (
    <section
      id="industries"
      className="relative border-t border-white/10 px-6 py-20 md:px-12 md:py-32"
    >
      <div className="mx-auto max-w-[1280px]">
        <ScrollReveal>
          <SectionHeader
            idx="Industries"
            kicker="INDUSTRIES"
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

        <ScrollReveal>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {items.map((k) => (
              <article
                key={k}
                className="flex flex-col gap-4 border border-white/10 bg-white/[0.03] p-7"
              >
                <div className="flex flex-col gap-2">
                  <span className="font-mono text-[11px] uppercase tracking-wide text-white/30">
                    {t(`items.${k}.code`)}
                  </span>
                  <h3 className="font-mono text-xl font-light">
                    {t(`items.${k}.name`)}
                  </h3>
                </div>

                <div className="flex flex-col gap-3.5 border-t border-white/10 pt-4">
                  {ROWS.map((row) => (
                    <div key={row.key} className="flex flex-col gap-1">
                      <span className="font-mono text-[11px] uppercase tracking-wide text-white/50">
                        {row.label}
                      </span>
                      <p className="text-sm leading-relaxed text-white/70">
                        {t(`items.${k}.${row.key}`)}
                      </p>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <div className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-3 border-t border-dashed border-white/10 pt-7">
            <span className="font-mono text-[11px] uppercase tracking-wide text-white/50">
              {t("more.label")}
            </span>
            <div className="flex flex-wrap gap-2">
              {chips.map((chip) => (
                <span key={chip} className="chip">
                  {chip}
                </span>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
