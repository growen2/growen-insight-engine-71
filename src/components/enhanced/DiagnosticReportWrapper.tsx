import { useState, useEffect } from 'react';
import { ProfessionalReportGenerator } from './ProfessionalReportGenerator';

interface DiagnosticData {
  company_name: string;
  owner_name: string;
  industry: string;
  city_country: string;
  monthly_revenue: number;
  employees: number;
  has_website: boolean;
  lead_acquisition: string;
  goals_12m: string[];
  score: number;
  category: 'excelente' | 'bom' | 'atencao' | 'critico';
}

export function DiagnosticReportWrapper() {
  const [diagnosticData, setDiagnosticData] = useState<DiagnosticData | null>(null);

  useEffect(() => {
    const handleGenerateReport = (event: CustomEvent<DiagnosticData>) => {
      setDiagnosticData(event.detail);
      
      // Scroll to report section
      setTimeout(() => {
        const reportElement = document.getElementById('diagnostic-report');
        if (reportElement) {
          reportElement.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    };

    window.addEventListener('generateReport', handleGenerateReport as EventListener);
    
    return () => {
      window.removeEventListener('generateReport', handleGenerateReport as EventListener);
    };
  }, []);

  if (!diagnosticData) {
    return null;
  }

  return (
    <div id="diagnostic-report" className="py-20">
      <ProfessionalReportGenerator diagnosticData={diagnosticData} />
    </div>
  );
}