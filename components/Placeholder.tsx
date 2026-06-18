import { useTranslations } from "next-intl";
import Link from "next/link";

export default function Placeholder({
  ns,
  locale,
}: {
  ns: "docs" | "download";
  locale: string;
}) {
  const t = useTranslations(ns);

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center md:px-12">
      <div className="mb-8 inline-block border border-white/20 px-3 py-1 font-mono text-xs uppercase tracking-[2px] text-white/50">
        {t("label")}
      </div>
      <h1 className="mb-6 font-mono text-4xl font-light leading-[1.05] tracking-[-0.01em] md:text-6xl">
        {t("title")}
      </h1>
      <p className="mb-10 max-w-[560px] text-white/70 leading-relaxed">
        {t("body")}
      </p>
      <a
        className="btn btn-primary"
        href={`mailto:contact@7dawn.ai?subject=${encodeURIComponent(t("subject"))}`}
      >
        {t("cta")} →
      </a>
      <Link
        href={`/${locale}`}
        className="mt-10 font-mono text-xs text-white/50 hover:text-white"
      >
        {t("back")}
      </Link>
    </section>
  );
}
