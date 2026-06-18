import { setRequestLocale } from "next-intl/server";
import Placeholder from "@/components/Placeholder";

export default async function DocsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <Placeholder ns="docs" locale={locale} />;
}
