import { setRequestLocale } from "next-intl/server";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import TrustBar from "@/components/TrustBar";
import Problem from "@/components/Problem";
import Products from "@/components/Products";
import PlatformDossier from "@/components/PlatformDossier";
import CapabilityMatrix from "@/components/CapabilityMatrix";
import Evolution from "@/components/Evolution";
import Industries from "@/components/Industries";
import Company from "@/components/Company";
import CTAContact from "@/components/CTAContact";
import Footer from "@/components/Footer";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Nav />
      <main>
        <Hero />
        <TrustBar />
        <Problem />
        <Products />
        <PlatformDossier />
        <CapabilityMatrix />
        <Evolution />
        <Industries />
        <Company />
        <CTAContact />
      </main>
      <Footer />
    </>
  );
}
