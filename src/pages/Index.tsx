import { Header } from "@/components/layout/Header";
import { ModernHeroSection } from "@/components/enhanced/ModernHeroSection";
import { ModernFeaturesSection } from "@/components/enhanced/ModernFeaturesSection";
import { EnhancedDiagnosticForm } from "@/components/enhanced/EnhancedDiagnosticForm";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { LocalFeaturesSection } from "@/components/sections/LocalFeaturesSection";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <ModernHeroSection />
        <ModernFeaturesSection />
        <LocalFeaturesSection />
        <TestimonialsSection />
        <div id="diagnosis-section">
          <EnhancedDiagnosticForm />
        </div>
      </main>
    </div>
  );
};

export default Index;
