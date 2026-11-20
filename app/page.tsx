import Tool from "@/components/Tool";
import { Banner, Faq, Features, Footer, HeroArt, HowItWorks, Languages, Nav, Pricing, Privacy } from "@/components/Sections";
import { S } from "@/lib/strings";

export default function Page() {
  return (
    <>
      <Banner />
      <Nav />
      <main>
        <section className="hero-wash">
          <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-5 pb-16 pt-10 sm:px-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-start lg:gap-6 lg:pb-24 lg:pt-16">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-line bg-paper px-3.5 py-1.5 text-[13px] font-medium text-muted shadow-card">
                <span className="h-1.5 w-1.5 rounded-full bg-accent-soft" aria-hidden="true" />
                Free · No sign-up · Video stays on your phone
              </p>
              <h1 className="mt-6 text-[2.75rem] font-semibold leading-[1.04] sm:text-6xl lg:text-[3.5rem] xl:text-[4rem]">
                One long video.<br />
                Ten posts that <span className="text-gradient">hook.</span>
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">{S.pitch}</p>
              <div className="mt-8 max-w-xl"><Tool /></div>
            </div>
            <div className="mx-auto w-full max-w-md lg:mt-24 lg:max-w-none"><HeroArt /></div>
          </div>
        </section>
        <HowItWorks />
        <Features />
        <Pricing />
        <Privacy />
        <Languages />
        <Faq />
      </main>
      <Footer />
    </>
  );
}
