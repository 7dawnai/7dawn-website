import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import ScrollReveal from "./ScrollReveal";
import SectionHeader from "./SectionHeader";

export default function Products() {
  const t = useTranslations("products");
  const tc = useTranslations("cta");
  const locale = useLocale();

  return (
    <section id="products" className="relative border-t border-white/10 px-6 py-20 md:px-12 md:py-32">
      <div className="mx-auto max-w-[1280px]">
        <ScrollReveal>
          <SectionHeader
            idx="/products"
            kicker="PRODUCTS"
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

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {/* 3Studio — primary (large) card */}
          <ScrollReveal className="md:col-span-2">
            <article className="flex h-full flex-col border border-white/10 bg-white/[0.03] p-7 md:p-9">
              <span className="font-mono text-[10px] uppercase tracking-[2px] text-white/50">{t("studio.for")}</span>
              <h3 className="mt-4 font-mono text-3xl font-light tracking-[-0.01em] md:text-4xl">{t("studio.name")}</h3>
              <p className="mt-4 max-w-[48ch] text-[15px] leading-relaxed text-white/70 md:text-base">{t("studio.desc")}</p>
              <div className="mt-auto pt-6">
                <a
                  className="btn btn-primary"
                  href={`mailto:contact@7dawn.ai?subject=${encodeURIComponent(tc("subject"))}`}
                >
                  {t("studio.cta")} →
                </a>
              </div>
            </article>
          </ScrollReveal>

          {/* vibe CAE — secondary (small) card */}
          <ScrollReveal delay={120} className="md:col-span-1">
            <article className="flex h-full flex-col border border-white/10 bg-white/[0.03] p-7 md:p-9">
              <span className="font-mono text-[10px] uppercase tracking-[2px] text-white/50">{t("vibe.for")}</span>
              <h3 className="mt-4 font-mono text-2xl font-light tracking-[-0.01em] md:text-3xl">{t("vibe.name")}</h3>
              <p className="mt-4 text-[13px] leading-relaxed text-white/70">{t("vibe.desc")}</p>
              <div className="mt-auto pt-6">
                <Link className="btn btn-secondary" href={`/${locale}/download`}>
                  {t("vibe.cta")} →
                </Link>
              </div>
            </article>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
