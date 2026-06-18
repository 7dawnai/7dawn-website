import { useTranslations } from "next-intl";
import ScrollReveal from "./ScrollReveal";

export default function TrustBar() {
  const t = useTranslations("trust");

  return (
    <section className="relative border-t border-white/10 px-6 py-12 md:px-12 md:py-16">
      <div className="mx-auto max-w-[1280px]">
        <ScrollReveal>
          {/* Border-separated 4-up credibility grid */}
          <div className="grid grid-cols-2 gap-px border border-white/10 bg-white/10 md:grid-cols-4">
            {/* GAIA */}
            <div className="flex flex-col bg-bg px-6 py-7">
              <div className="stat-value">
                {t("gaia.value")}
                <em className="ml-2 font-light not-italic text-white/40">{t("gaia.metric")}</em>
              </div>
              <p className="stat-label">{t("gaia.note")}</p>
              <a
                href={t("gaia.href")}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 self-start text-xs text-white/50 underline transition-colors hover:text-white"
              >
                {t("gaia.linkLabel")}
              </a>
            </div>

            {/* Leak */}
            <div className="flex flex-col bg-bg px-6 py-7">
              <div className="stat-value">{t("leak.value")}</div>
              <p className="stat-label">{t("leak.note")}</p>
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
