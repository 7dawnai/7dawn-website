import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";

export default function Footer() {
  const t = useTranslations("footer");
  const locale = useLocale();

  const links = [
    { href: `/${locale}#products`, label: t("nav.products") },
    { href: `/${locale}#platform`, label: t("nav.platform") },
    { href: `/${locale}#industries`, label: t("nav.industries") },
    { href: `/${locale}#company`, label: t("nav.company") },
    { href: `/${locale}/docs`, label: t("nav.docs"), route: true },
    { href: `/${locale}/download`, label: t("nav.download"), route: true },
  ];

  return (
    <footer className="border-t border-white/10 px-6 py-12 md:px-12">
      <nav className="mb-8 flex flex-wrap gap-x-7 gap-y-3">
        {links.map((l) =>
          l.route ? (
            <Link key={l.href} href={l.href} className="font-mono text-xs tracking-[0.5px] text-white/50 transition-colors hover:text-white">
              {l.label}
            </Link>
          ) : (
            <a key={l.href} href={l.href} className="font-mono text-xs tracking-[0.5px] text-white/50 transition-colors hover:text-white">
              {l.label}
            </a>
          ),
        )}
      </nav>
      <div className="flex flex-wrap items-center justify-between gap-6">
        <div className="font-mono text-xs tracking-[1px] text-white/50">{t("copy")}</div>
        <div className="font-mono text-xs tracking-[1px] text-white/50">{t("city")}</div>
      </div>
    </footer>
  );
}
