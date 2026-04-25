import Header from "./component/Header";
import AnimateInView from "./component/AnimateInView";
import FeatureSection from "./component/FeatureSection";
import Hero from "./component/Hero";
import LearningFlowSection from "./component/LearningFlowSection";
import CertificateCtaSection from "./component/CertificateCtaSection";
import PopularModulesSection from "./component/PopularModulesSection";
import SchoolLevelSection from "./component/SchoolLevelSection";
import TestimonialSection from "./component/TestimonialSectionView";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#d9d3e9]">
      <Header />
      <main className="pt-[96px] sm:pt-[104px] md:pt-[90px]">
        <AnimateInView>
          <Hero />
        </AnimateInView>
        <AnimateInView delay={0.04}>
          <SchoolLevelSection />
        </AnimateInView>
        <AnimateInView delay={0.08}>
          <FeatureSection />
        </AnimateInView>
        <AnimateInView delay={0.12}>
          <LearningFlowSection />
        </AnimateInView>
        <AnimateInView delay={0.16}>
          <PopularModulesSection />
        </AnimateInView>
        <AnimateInView delay={0.2}>
          <TestimonialSection />
        </AnimateInView>
        <AnimateInView delay={0.24}>
          <CertificateCtaSection />
        </AnimateInView>
      </main>
    </div>
  );
}
