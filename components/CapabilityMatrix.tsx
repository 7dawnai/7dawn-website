import { useTranslations } from "next-intl";
import ScrollReveal from "./ScrollReveal";
import SectionHeader from "./SectionHeader";

type Row = { name: string; cells: string[] };

export default function CapabilityMatrix() {
  const t = useTranslations("capability");
  const stages = t.raw("stages") as string[];
  const rows = t.raw("rows") as Row[];
  // Last stage column (Manufacturing) is a later phase — dimmed throughout.
  const lastStageIdx = stages.length - 1;

  return (
    <section
      id="platform"
      className="relative border-t border-white/10 px-6 py-20 md:px-12 md:py-32"
    >
      <div className="mx-auto max-w-[1280px]">
        <ScrollReveal>
          <SectionHeader
            idx="/platform"
            kicker="PLATFORM"
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
          <div className="overflow-x-auto">
            <div
              className="grid min-w-[640px] border border-white/10"
              style={{
                gridTemplateColumns: `minmax(120px, 1.4fr) repeat(${stages.length}, minmax(0, 1fr))`,
              }}
            >
              {/* Header row — first cell left empty (locale-neutral, no hardcoded copy) */}
              <div
                className="border-b border-r border-white/10 px-4 py-3.5"
                aria-hidden="true"
              />
              {stages.map((stage, ci) => {
                const isLast = ci === lastStageIdx;
                return (
                  <div
                    key={stage}
                    className={`border-b border-white/10 px-3 py-3.5 text-center font-mono text-[11px] tracking-[0.4px] ${
                      ci < lastStageIdx ? "border-r" : ""
                    } ${isLast ? "text-white/30" : "text-white/70"}`}
                  >
                    {stage}
                  </div>
                );
              })}

              {/* Data rows */}
              {rows.map((row, ri) => {
                const isLastRow = ri === rows.length - 1;
                return (
                  <div key={row.name} className="contents">
                    <div
                      className={`border-r border-white/10 px-4 py-4 text-[13px] text-white ${
                        isLastRow ? "" : "border-b"
                      }`}
                    >
                      {row.name}
                    </div>
                    {row.cells.map((cell, ci) => {
                      const isLast = ci === lastStageIdx;
                      const supported = cell === "y";
                      return (
                        <div
                          key={ci}
                          className={`flex items-center justify-center px-3 py-4 ${
                            ci < lastStageIdx ? "border-r border-white/10" : ""
                          } ${isLastRow ? "" : "border-b border-white/10"} ${
                            isLast ? "bg-white/[0.015]" : ""
                          }`}
                        >
                          {supported ? (
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 14 14"
                              fill="none"
                              aria-hidden="true"
                              className={isLast ? "text-white/30" : "text-white"}
                            >
                              <path
                                d="M2.5 7.5L5.5 10.5L11.5 3.5"
                                stroke="currentColor"
                                strokeWidth="1.4"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          ) : (
                            <span
                              className="font-mono text-[13px] leading-none text-white/30"
                              aria-hidden="true"
                            >
                              ·
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </ScrollReveal>

        {/* Stage note: Manufacturing is a later phase */}
        <p className="mt-3 font-mono text-[11px] tracking-[0.4px] text-white/30">
          {t("stageNote")}
        </p>

        {/* Governance promise */}
        <p className="mt-8 text-[13px] leading-relaxed text-white/50">
          {t("governance")}
        </p>
      </div>
    </section>
  );
}
