import { Header } from "@/components/layout/Header";
import { HeroSection } from "@/components/sections/HeroSection";
import { FeaturesSection } from "@/components/sections/FeaturesSection";
import { DiagnosticForm } from "@/components/forms/DiagnosticForm";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { LocalFeaturesSection } from "@/components/sections/LocalFeaturesSection";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />
        <LocalFeaturesSection />
        <TestimonialsSection />
        <DiagnosticForm />
      </main>
    </div>
  );
};

export default Index;
