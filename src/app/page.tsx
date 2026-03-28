import { Hero } from "@/components/marketing/hero";
import { HowItWorks } from "@/components/marketing/how-it-works";
import {
  ProductHighlightsSection,
  TrustResolutionSection,
  WhyMarketsSection,
} from "@/components/marketing/product-sections";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { WaitlistCta } from "@/components/marketing/waitlist-cta";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <WhyMarketsSection />
        <ProductHighlightsSection />
        <TrustResolutionSection />
        <HowItWorks />
        <WaitlistCta />
      </main>
      <SiteFooter />
    </>
  );
}
