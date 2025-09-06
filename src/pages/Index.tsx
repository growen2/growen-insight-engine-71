import { Header } from "@/components/layout/Header";
import { AngolaHeroSection } from "@/components/enhanced/AngolaHeroSection";
import { ModernFeaturesSection } from "@/components/enhanced/ModernFeaturesSection";
import { EnhancedDiagnosticForm } from "@/components/enhanced/EnhancedDiagnosticForm";
import { DiagnosticReportWrapper } from "@/components/enhanced/DiagnosticReportWrapper";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { LocalFeaturesSection } from "@/components/sections/LocalFeaturesSection";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <AngolaHeroSection />
        <ModernFeaturesSection />
        <LocalFeaturesSection />
        <TestimonialsSection />
        <div id="diagnostico">
          <EnhancedDiagnosticForm />
          <DiagnosticReportWrapper />
        </div>
      </main>
    </div>
  );
};

export default Index;
