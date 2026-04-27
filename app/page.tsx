import Header from "./component/Header";
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
      <main className="">
        <Hero />
        <SchoolLevelSection />
        <FeatureSection />
        <LearningFlowSection />
        <PopularModulesSection />
        <TestimonialSection />
        <CertificateCtaSection />
      </main>
    </div>
  );
}
