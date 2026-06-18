import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import ScrollReveal from "./ScrollReveal";

export default function CTAContact() {
  const t = useTranslations("cta");
  const tc = useTranslations("contact");
  const locale = useLocale();

  return (
    <section id="contact" className="relative border-t border-white/10 px-6 py-20 md:px-12 md:py-32">
      <div className="mx-auto max-w-[1280px]">
        <ScrollReveal>
          <div className="grid grid-cols-1 items-center gap-10 border border-white/10 bg-white/[0.03] px-8 py-14 md:grid-cols-[1.4fr_1fr] md:px-12 md:py-16">
            <div>
              <div className="mb-4 font-mono text-[11px] uppercase tracking-[2px] text-white">{t("kicker")}</div>
              <h2 className="mb-4 font-mono text-4xl font-light leading-[1.05] tracking-[-0.012em] md:text-5xl lg:text-6xl">
                {t("titleBefore")}
                <br />
                <em className="italic font-light text-white/50">{t("titleEm")}</em>
                {t("titleAfter")}
              </h2>
              <p className="text-[17px] leading-[1.65] text-white/70">{t("lead")}</p>
            </div>
            <div className="flex flex-col gap-2.5">
              <a
                href={`mailto:contact@7dawn.ai?subject=${encodeURIComponent(t("subject"))}`}
                className="btn btn-primary justify-center px-6 py-3.5"
              >
                {t("primary")}
              </a>
              <Link
                href={`/${locale}/download`}
                className="btn btn-secondary justify-center px-6 py-3.5"
              >
                {t("secondary")} →
              </Link>
            </div>
          </div>
        </ScrollReveal>

        <div className="mt-12 grid max-w-[720px] grid-cols-1 gap-10 sm:grid-cols-2">
          <ScrollReveal>
            <div className="border-t border-white/20 pt-5">
              <div className="mb-2.5 font-mono text-xs uppercase tracking-[2px] text-white/50">{tc("email")}</div>
              <a href="mailto:contact@7dawn.ai" className="font-mono text-base text-white transition-colors hover:text-white/50">
                contact@7dawn.ai
              </a>
            </div>
          </ScrollReveal>
          <ScrollReveal>
            <div className="border-t border-white/20 pt-5">
              <div className="mb-2.5 font-mono text-xs uppercase tracking-[2px] text-white/50">{tc("phone")}</div>
              <a href="tel:+8618810308915" className="font-mono text-base text-white transition-colors hover:text-white/50">
                +86 188 1030 8915
              </a>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
