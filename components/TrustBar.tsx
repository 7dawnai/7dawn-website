import { useTranslations } from "next-intl";
import ScrollReveal from "./ScrollReveal";

export default function TrustBar() {
  const t = useTranslations("trust");

  return (
    <section className="relative border-t border-white/10 px-6 py-12 md:px-12 md:py-16">
      <div className="mx-auto max-w-[1280px]">
        <ScrollReveal>
          {/* Border-separated credibility grid */}
          <div className="grid grid-cols-1 gap-px border border-white/10 bg-white/10 sm:grid-cols-3">
            {/* Design-simulation cycle */}
            <div className="flex flex-col bg-bg px-6 py-7">
              <div className="stat-value">{t("cycle.value")}</div>
              <p className="stat-label">{t("cycle.note")}</p>
            </div>

            {/* Scope */}
            <div className="flex flex-col bg-bg px-6 py-7">
              <div className="stat-value">{t("scope.value")}</div>
              <p className="stat-label">{t("scope.note")}</p>
            </div>

            {/* Physics */}
            <div className="flex flex-col bg-bg px-6 py-7">
              <div className="stat-value">{t("physics.value")}</div>
              <p className="stat-label">{t("physics.note")}</p>
            </div>
          </div>

          {/* Trailing badge */}
          <div className="mt-6 flex justify-center md:justify-start">
            <span className="chip">{t("badge")}</span>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
