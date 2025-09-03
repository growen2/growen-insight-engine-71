import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { FileText, Download, Share, TrendingUp, AlertTriangle, Target, Calendar } from "lucide-react";

interface DiagnosticData {
  company_name: string;
  owner_name: string;
  industry: string;
  city_country: string;
  currency: string;
  monthly_revenue: number;
  employees: number;
  has_website: boolean;
  lead_acquisition: string;
  goals_12m: string[];
  score: number;
  category: 'excelente' | 'ok' | 'atencao' | 'critico';
}

interface AIReport {
  summary: string;
  finance_assessment: {
    strengths: string[];
    risks: string[];
  };
  priorities: Array<{
    action: string;
    impact: 'alto' | 'medio' | 'baixo';
    effort: 'baixo' | 'medio' | 'alto';
    timeline: string;
  }>;
  digital_recommendations: Array<{
    tactic: string;
    budget_range: string;
    expected_roi: string;
  }>;
  recommended_package: {
    plan: 'starter' | 'pro' | 'premium';
    justification: string;
    monthly_value: number;
  };
  kpis: Array<{
    name: string;
    current_estimate: string;
    target: string;
  }>;
  risks: Array<{
    risk: string;
    mitigation: string;
  }>;
}

// Mock AI report generator
const generateAIReport = (data: DiagnosticData): AIReport => {
  const getCurrencySymbol = (currency: string) => {
    switch(currency) {
      case "EUR": return "€";
      case "AOA": return "Kz";
      case "BRL": return "R$";
      case "USD": return "$";
      default: return "€";
    }
  };

  const getCountryContext = (country: string) => {
    switch(country) {
      case "angola": return "mercado angolano";
      case "portugal": return "mercado português";
      case "brasil": return "mercado brasileiro";
      default: return "mercado lusófono";
    }
  };

  const currencySymbol = getCurrencySymbol(data.currency);
  const marketContext = getCountryContext(data.city_country);
  
  const baseReport: AIReport = {
    summary: `${data.company_name} é uma empresa do setor ${data.industry} com receita mensal de ${currencySymbol}${data.monthly_revenue.toLocaleString()} e ${data.employees} colaboradores. Com base no diagnóstico focado no ${marketContext}, identificamos oportunidades significativas de crescimento através da digitalização e otimização de processos.`,
    
    finance_assessment: {
      strengths: [
        data.monthly_revenue > 15000 ? "Receita estável acima da média do setor" : "Base financeira sólida para crescimento",
        data.employees >= 5 ? "Equipe estruturada para suportar expansão" : "Estrutura enxuta e eficiente"
      ],
      risks: [
        "Dependência excessiva de poucos canais de aquisição",
        data.has_website ? "Necessidade de otimização da presença digital" : "Ausência de presença digital forte"
      ]
    },

    priorities: [
      {
        action: data.has_website ? "Otimizar conversão do site existente" : "Criar presença digital profissional",
        impact: "alto",
        effort: data.has_website ? "medio" : "alto",
        timeline: "30 dias"
      },
      {
        action: "Implementar sistema CRM para gestão de clientes",
        impact: "alto", 
        effort: "medio",
        timeline: "60 dias"
      },
      {
        action: "Diversificar canais de aquisição de clientes",
        impact: "medio",
        effort: "medio",
        timeline: "90 dias"
      }
    ],

    digital_recommendations: [
      {
        tactic: "Campanha Google Ads localizada",
        budget_range: data.currency === "AOA" ? "Kz 210.000-350.000/mês" : 
                     data.currency === "BRL" ? "R$ 1.800-3.000/mês" : 
                     "€300-500/mês",
        expected_roi: "150-200%"
      },
      {
        tactic: "Otimização para redes sociais",
        budget_range: data.currency === "AOA" ? "Kz 140.000-210.000/mês" : 
                     data.currency === "BRL" ? "R$ 1.200-1.800/mês" : 
                     "€200-300/mês",
        expected_roi: "120-180%"
      },
      {
        tactic: "Email marketing automatizado",
        budget_range: data.currency === "AOA" ? "Kz 35.000-70.000/mês" : 
                     data.currency === "BRL" ? "R$ 300-600/mês" : 
                     "€50-100/mês",
        expected_roi: "300-500%"
      }
    ],

    recommended_package: (() => {
      // Normalize revenue to EUR for plan selection
      let normalizedRevenue = data.monthly_revenue;
      if (data.currency === "AOA") normalizedRevenue = data.monthly_revenue / 700;
      else if (data.currency === "BRL") normalizedRevenue = data.monthly_revenue / 6;
      
      const plan = normalizedRevenue > 20000 ? "premium" : normalizedRevenue > 10000 ? "pro" : "starter";
      const eurValue = normalizedRevenue > 20000 ? 297 : normalizedRevenue > 10000 ? 197 : 97;
      
      // Convert EUR value to local currency
      const localValue = data.currency === "AOA" ? Math.round(eurValue * 700) :
                        data.currency === "BRL" ? Math.round(eurValue * 6) :
                        eurValue;
      
      return {
        plan,
        justification: normalizedRevenue > 20000 ? 
          "Empresa com receita elevada que beneficiará de consultoria personalizada e automações avançadas" :
          normalizedRevenue > 10000 ?
          "Empresa em crescimento que precisa de ferramentas profissionais de CRM e marketing" :
          "Empresa inicial que beneficiará de estruturação básica e diagnósticos regulares",
        monthly_value: localValue
      };
    })(),

    kpis: [
      {
        name: "Taxa de Conversão",
        current_estimate: data.has_website ? "2-4%" : "N/A",
        target: "5-8%"
      },
      {
        name: "CAC (Custo Aquisição Cliente)",
        current_estimate: currencySymbol + Math.round(data.monthly_revenue * 0.15).toLocaleString(),
        target: currencySymbol + Math.round(data.monthly_revenue * 0.10).toLocaleString()
      },
      {
        name: "LTV (Lifetime Value)",
        current_estimate: currencySymbol + Math.round(data.monthly_revenue * 0.5).toLocaleString(),
        target: currencySymbol + Math.round(data.monthly_revenue * 0.8).toLocaleString()
      }
    ],

    risks: [
      {
        risk: "Dependência de canal único de aquisição",
        mitigation: "Diversificar para pelo menos 3 canais diferentes nos próximos 90 dias"
      },
      {
        risk: data.has_website ? "Site não otimizado para conversão" : "Ausência de presença digital",
        mitigation: data.has_website ? "Implementar ferramentas de análise e A/B testing" : "Criar site profissional com foco em conversão"
      }
    ]
  };

  return baseReport;
};

interface ReportGeneratorProps {
  diagnosticData: DiagnosticData;
}

export function ReportGenerator({ diagnosticData }: ReportGeneratorProps) {
  const [report, setReport] = useState<AIReport | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    
    try {
      // Simulate AI processing time
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const aiReport = generateAIReport(diagnosticData);
      setReport(aiReport);
      
      toast({
        title: "Relatório gerado com sucesso!",
        description: "Seu relatório personalizado está pronto."
      });
      
    } catch (error) {
      toast({
        title: "Erro ao gerar relatório",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    // Create PDF content
    const reportContent = `
      RELATÓRIO EMPRESARIAL - ${diagnosticData.company_name}
      Gerado em: ${new Date().toLocaleDateString('pt-PT')}
      
      RESUMO EXECUTIVO:
      ${report?.summary}
      
      SCORE: ${diagnosticData.score}/100
      CATEGORIA: ${diagnosticData.category.toUpperCase()}
    `;
    
    // Create downloadable text file (in real app, would generate proper PDF)
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-${diagnosticData.company_name.toLowerCase().replace(/\s+/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast({
      title: "Download iniciado!",
      description: "Seu relatório está sendo baixado."
    });
  };

  const handleShare = async () => {
    const shareData = {
      title: `Relatório Empresarial - ${diagnosticData.company_name}`,
      text: `Confira o relatório de diagnóstico empresarial da ${diagnosticData.company_name}. Score: ${diagnosticData.score}/100`,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`);
        toast({
          title: "Link copiado!",
          description: "Link do relatório copiado para a área de transferência."
        });
      }
    } catch (error) {
      toast({
        title: "Erro ao compartilhar",
        description: "Não foi possível compartilhar o relatório.",
        variant: "destructive"
      });
    }
  };

  const getCategoryInfo = (category: string) => {
    switch (category) {
      case 'excelente':
        return { color: 'bg-green-100 text-green-800', icon: TrendingUp };
      case 'ok':
        return { color: 'bg-blue-100 text-blue-800', icon: TrendingUp };
      case 'atencao':
        return { color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle };
      case 'critico':
        return { color: 'bg-red-100 text-red-800', icon: AlertTriangle };
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: FileText };
    }
  };

  const categoryInfo = getCategoryInfo(diagnosticData.category);
  const CategoryIcon = categoryInfo.icon;

  if (!report) {
    return (
      <Card>
        <CardHeader className="text-center">
          <div className="w-16 h-16 gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <CardTitle>Gerar Relatório IA</CardTitle>
          <p className="text-muted-foreground">
            Clique para gerar um relatório personalizado com recomendações específicas para {diagnosticData.company_name}
          </p>
        </CardHeader>
        
        <CardContent className="text-center">
          <div className="mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <CategoryIcon className="w-5 h-5" />
              <span className="font-medium">Score: {diagnosticData.score}/60</span>
            </div>
            <Badge className={categoryInfo.color}>
              {diagnosticData.category.toUpperCase()}
            </Badge>
          </div>
          
          <Button 
            onClick={handleGenerateReport} 
            disabled={isGenerating}
            size="lg"
            className="w-full"
          >
            {isGenerating ? "Gerando relatório..." : "Gerar Relatório Completo"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Relatório Empresarial - {diagnosticData.company_name}</CardTitle>
              <p className="text-muted-foreground">Gerado por IA • {new Date().toLocaleDateString('pt-PT')}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleShare}>
                <Share className="w-4 h-4 mr-2" />
                Compartilhar
              </Button>
              <Button onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Executive Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Resumo Executivo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground leading-relaxed">{report.summary}</p>
        </CardContent>
      </Card>

      {/* Financial Assessment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Avaliação Financeira
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-green-700 mb-3">Pontos Fortes</h4>
              <ul className="space-y-2">
                {report.finance_assessment.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <span className="text-sm">{strength}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-red-700 mb-3">Riscos Identificados</h4>
              <ul className="space-y-2">
                {report.finance_assessment.risks.map((risk, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                    <span className="text-sm">{risk}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Priorities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            3 Ações Prioritárias
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {report.priorities.map((priority, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium">{priority.action}</h4>
                  <div className="flex gap-2">
                    <Badge variant="outline">
                      Impacto: {priority.impact}
                    </Badge>
                    <Badge variant="outline">
                      Esforço: {priority.effort}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  Prazo: {priority.timeline}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Digital Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Recomendações de Digitalização</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {report.digital_recommendations.map((rec, index) => (
              <div key={index} className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">{rec.tactic}</h4>
                <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                  <div>Orçamento: {rec.budget_range}</div>
                  <div>ROI Esperado: {rec.expected_roi}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommended Package */}
      <Card>
        <CardHeader>
          <CardTitle>Pacote Growen Recomendado</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-4">
            <Badge className="text-lg px-4 py-2 gradient-primary text-white">
              Plano {report.recommended_package.plan.toUpperCase()}
            </Badge>
            <p className="text-2xl font-bold mt-2">
              {diagnosticData.currency === "AOA" ? "Kz " : 
               diagnosticData.currency === "BRL" ? "R$ " : 
               "€"}{report.recommended_package.monthly_value.toLocaleString()}/mês
            </p>
          </div>
          <p className="text-muted-foreground text-center">{report.recommended_package.justification}</p>
          <div className="flex gap-2 mt-4">
            <Button className="flex-1">Começar Teste Grátis</Button>
            <Button variant="outline">Saber Mais</Button>
          </div>
        </CardContent>
      </Card>

      {/* KPIs */}
      <Card>
        <CardHeader>
          <CardTitle>Indicadores-Chave (KPIs)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {report.kpis.map((kpi, index) => (
              <div key={index} className="text-center p-4 border rounded-lg">
                <h4 className="font-medium mb-2">{kpi.name}</h4>
                <div className="text-sm text-muted-foreground">
                  <div>Atual: {kpi.current_estimate}</div>
                  <div>Meta: {kpi.target}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Risks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Riscos e Mitigação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {report.risks.map((item, index) => (
              <div key={index} className="border rounded-lg p-4">
                <h4 className="font-medium text-red-700 mb-2">🚨 {item.risk}</h4>
                <p className="text-sm text-muted-foreground">💡 {item.mitigation}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}