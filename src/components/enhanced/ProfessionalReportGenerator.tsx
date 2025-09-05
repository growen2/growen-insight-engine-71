import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useMarket } from '@/contexts/MarketContext';
import { 
  FileText, 
  Download, 
  Share, 
  TrendingUp, 
  AlertTriangle, 
  Target, 
  Calendar,
  BarChart3,
  PieChart,
  DollarSign,
  Users,
  Lightbulb,
  Shield,
  CheckCircle2,
  ArrowRight
} from "lucide-react";

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

interface ProfessionalAIReport {
  executiveSummary: {
    overview: string;
    keyFindings: string[];
    criticalActions: string[];
  };
  businessAnalysis: {
    strengths: Array<{ item: string; impact: 'Alto' | 'Médio' | 'Baixo'; description: string }>;
    weaknesses: Array<{ item: string; risk: 'Alto' | 'Médio' | 'Baixo'; description: string }>;
    opportunities: Array<{ item: string; potential: 'Alto' | 'Médio' | 'Baixo'; description: string }>;
    threats: Array<{ item: string; urgency: 'Alto' | 'Médio' | 'Baixo'; description: string }>;
  };
  financialProjection: {
    currentMetrics: Array<{ metric: string; current: string; benchmark: string; status: 'good' | 'warning' | 'critical' }>;
    projectedGrowth: Array<{ period: string; revenue: number; growth: string }>;
    investmentRecommendations: Array<{ area: string; amount: string; expectedRoi: string; timeline: string }>;
  };
  actionPlan: {
    immediate: Array<{ action: string; timeline: string; cost: string; priority: 'Crítica' | 'Alta' | 'Média' }>;
    shortTerm: Array<{ action: string; timeline: string; cost: string; priority: 'Crítica' | 'Alta' | 'Média' }>;
    longTerm: Array<{ action: string; timeline: string; cost: string; priority: 'Crítica' | 'Alta' | 'Média' }>;
  };
  angolaSpecific: {
    marketOpportunities: string[];
    regulatoryCompliance: string[];
    localPartners: string[];
    economicFactors: string[];
  };
  recommendedServices: {
    plan: 'starter' | 'professional' | 'enterprise';
    justification: string;
    monthlyInvestment: number;
    expectedRoi: string;
    implementation: string[];
  };
}

const generateProfessionalReport = (data: DiagnosticData): ProfessionalAIReport => {
  const revenueKz = data.monthly_revenue;
  const revenueCategory = revenueKz < 500000 ? 'small' : revenueKz < 2000000 ? 'medium' : 'large';
  
  return {
    executiveSummary: {
      overview: `${data.company_name} é uma empresa do setor ${data.industry} com receita mensal de Kz ${revenueKz.toLocaleString()} e ${data.employees} colaboradores. Baseado na nossa análise abrangente, identificamos oportunidades significativas de crescimento e optimização que podem aumentar a receita em 35-60% nos próximos 12 meses através da implementação estratégica de soluções digitais e melhoria de processos operacionais.`,
      keyFindings: [
        `Score atual de maturidade empresarial: ${data.score}/100 - categoria ${data.category}`,
        `Potencial de crescimento identificado: ${revenueCategory === 'small' ? '45-70%' : revenueCategory === 'medium' ? '30-50%' : '20-35%'}`,
        `Principais oportunidades: ${data.has_website ? 'Optimização digital' : 'Presença digital'}, CRM profissional, automação de processos`,
        `Conformidade regulatória: Necessária actualização para legislação angolana atual`
      ],
      criticalActions: [
        'Implementar sistema CRM profissional nos próximos 30 dias',
        data.has_website ? 'Optimizar conversão do website existente' : 'Criar presença digital profissional',
        'Diversificar canais de aquisição de clientes',
        'Estabelecer métricas de desempenho (KPIs) claras'
      ]
    },
    businessAnalysis: {
      strengths: [
        {
          item: 'Base financeira sólida',
          impact: revenueKz > 1000000 ? 'Alto' : 'Médio',
          description: `Receita mensal consistente de Kz ${revenueKz.toLocaleString()} demonstra estabilidade operacional`
        },
        {
          item: 'Equipa estruturada',
          impact: data.employees >= 5 ? 'Alto' : 'Médio',
          description: `${data.employees} colaboradores proporcionam capacidade de execução e crescimento`
        },
        {
          item: 'Posicionamento no mercado',
          impact: 'Médio',
          description: `Experiência no setor ${data.industry} com conhecimento das especificidades angolanas`
        }
      ],
      weaknesses: [
        {
          item: data.has_website ? 'Presença digital suboptimizada' : 'Ausência de presença digital',
          risk: data.has_website ? 'Médio' : 'Alto',
          description: data.has_website ? 'Website existe mas não está optimizado para conversão' : 'Sem presença digital profissional limita alcance e credibilidade'
        },
        {
          item: 'Dependência de canais limitados',
          risk: 'Alto',
          description: 'Aquisição de clientes concentrada em poucos canais aumenta vulnerabilidade'
        },
        {
          item: 'Sistemas de gestão manuais',
          risk: 'Médio',
          description: 'Processos manuais limitam escalabilidade e aumentam probabilidade de erros'
        }
      ],
      opportunities: [
        {
          item: 'Digitalização completa',
          potential: 'Alto',
          description: 'Mercado angolano em processo de digitalização oferece vantagem competitiva para pioneiros'
        },
        {
          item: 'Parcerias estratégicas locais',
          potential: 'Alto',
          description: 'Colaboração com instituições financeiras e fornecedores angolanos'
        },
        {
          item: 'Expansão geográfica',
          potential: 'Médio',
          description: 'Oportunidades de crescimento em outras províncias angolanas'
        }
      ],
      threats: [
        {
          item: 'Concorrência digitalizada',
          urgency: 'Alto',
          description: 'Competidores que adoptarem tecnologia primeiro ganharão vantagem significativa'
        },
        {
          item: 'Mudanças regulatórias',
          urgency: 'Médio',
          description: 'Alterações na legislação empresarial angolana podem impactar operações'
        },
        {
          item: 'Flutuação cambial',
          urgency: 'Médio',
          description: 'Variações no câmbio podem afetar custos operacionais e margens'
        }
      ]
    },
    financialProjection: {
      currentMetrics: [
        {
          metric: 'Receita Mensal',
          current: `Kz ${revenueKz.toLocaleString()}`,
          benchmark: revenueCategory === 'small' ? 'Kz 800.000' : revenueCategory === 'medium' ? 'Kz 2.500.000' : 'Kz 5.000.000',
          status: revenueCategory === 'small' ? 'warning' : 'good'
        },
        {
          metric: 'Custo Aquisição Cliente (CAC)',
          current: `Kz ${Math.round(revenueKz * 0.15).toLocaleString()}`,
          benchmark: `Kz ${Math.round(revenueKz * 0.10).toLocaleString()}`,
          status: 'warning'
        },
        {
          metric: 'Lifetime Value (LTV)',
          current: `Kz ${Math.round(revenueKz * 0.5).toLocaleString()}`,
          benchmark: `Kz ${Math.round(revenueKz * 0.8).toLocaleString()}`,
          status: 'warning'
        },
        {
          metric: 'Taxa Conversão',
          current: data.has_website ? '2.5%' : 'N/A',
          benchmark: '6-8%',
          status: data.has_website ? 'warning' : 'critical'
        }
      ],
      projectedGrowth: [
        {
          period: '3 meses',
          revenue: Math.round(revenueKz * 1.15),
          growth: '+15%'
        },
        {
          period: '6 meses',
          revenue: Math.round(revenueKz * 1.35),
          growth: '+35%'
        },
        {
          period: '12 meses',
          revenue: Math.round(revenueKz * 1.60),
          growth: '+60%'
        }
      ],
      investmentRecommendations: [
        {
          area: 'Plataforma CRM Profissional',
          amount: revenueCategory === 'small' ? 'Kz 45.000/mês' : revenueCategory === 'medium' ? 'Kz 95.000/mês' : 'Kz 185.000/mês',
          expectedRoi: '300-500%',
          timeline: '30 dias'
        },
        {
          area: 'Marketing Digital Estratégico',
          amount: `Kz ${Math.round(revenueKz * 0.12).toLocaleString()}/mês`,
          expectedRoi: '200-350%',
          timeline: '60 dias'
        },
        {
          area: 'Automação de Processos',
          amount: `Kz ${Math.round(revenueKz * 0.08).toLocaleString()}/mês`,
          expectedRoi: '150-250%',
          timeline: '90 dias'
        }
      ]
    },
    actionPlan: {
      immediate: [
        {
          action: 'Implementar CRM profissional com integração Multicaixa',
          timeline: '7-14 dias',
          cost: 'Incluído no plano Growen',
          priority: 'Crítica'
        },
        {
          action: data.has_website ? 'Auditoria e optimização do website' : 'Desenvolvimento de website profissional',
          timeline: '14-21 dias',
          cost: data.has_website ? 'Kz 150.000' : 'Kz 350.000',
          priority: 'Crítica'
        }
      ],
      shortTerm: [
        {
          action: 'Campanha de marketing digital localizada',
          timeline: '30-45 dias',
          cost: `Kz ${Math.round(revenueKz * 0.10).toLocaleString()}/mês`,
          priority: 'Alta'
        },
        {
          action: 'Implementação de automações de email e WhatsApp',
          timeline: '45-60 dias',
          cost: 'Incluído no plano',
          priority: 'Alta'
        },
        {
          action: 'Estabelecimento de KPIs e dashboards',
          timeline: '30-60 dias',
          cost: 'Incluído no plano',
          priority: 'Média'
        }
      ],
      longTerm: [
        {
          action: 'Expansão para novas províncias angolanas',
          timeline: '6-9 meses',
          cost: `Kz ${Math.round(revenueKz * 0.20).toLocaleString()}`,
          priority: 'Média'
        },
        {
          action: 'Desenvolvimento de aplicação móvel',
          timeline: '9-12 meses',
          cost: 'Kz 800.000 - 1.200.000',
          priority: 'Média'
        }
      ]
    },
    angolaSpecific: {
      marketOpportunities: [
        'Crescimento da classe média angolana (+8% ao ano)',
        'Digitalização acelerada pós-COVID (+45% adopção digital)',
        'Programas governamentais de apoio ao empreendedorismo',
        'Expansão do sistema bancário e pagamentos digitais'
      ],
      regulatoryCompliance: [
        'Conformidade com Lei de Protecção de Dados de Angola',
        'Registo no INAPEM para formalização empresarial',
        'Adequação ao Código Comercial Angolano',
        'Certificação ISO para empresas de maior porte'
      ],
      localPartners: [
        'Banco de Fomento Angola (BFA) - financiamento empresarial',
        'Multicaixa - soluções de pagamento digital',
        'Angola Expresso - logística e distribuição',
        'Fundação Lwini - capacitação empresarial'
      ],
      economicFactors: [
        'Estabilização da moeda nacional (Kwanza)',
        'Diversificação económica além do petróleo',
        'Investimento estrangeiro em sectores não petrolíferos',
        'Melhoria da infraestrutura tecnológica nacional'
      ]
    },
    recommendedServices: {
      plan: revenueCategory === 'small' ? 'starter' : revenueCategory === 'medium' ? 'professional' : 'enterprise',
      justification: revenueCategory === 'small' 
        ? 'Plano Starter ideal para estruturar as bases do negócio com ferramentas essenciais e suporte completo'
        : revenueCategory === 'medium'
        ? 'Plano Profissional recomendado para empresas em crescimento que precisam de automações avançadas e consultoria estratégica'
        : 'Plano Empresarial necessário para organizações complexas que requerem soluções personalizadas e suporte dedicado',
      monthlyInvestment: revenueCategory === 'small' ? 45000 : revenueCategory === 'medium' ? 95000 : 185000,
      expectedRoi: revenueCategory === 'small' ? '400-600%' : revenueCategory === 'medium' ? '300-500%' : '250-400%',
      implementation: [
        'Configuração personalizada em 48 horas',
        'Migração de dados existentes incluída',
        'Formação da equipa (2 sessões)',
        'Suporte dedicado nos primeiros 90 dias',
        'Consultoria estratégica mensal'
      ]
    }
  };
};

interface ProfessionalReportGeneratorProps {
  diagnosticData: DiagnosticData;
}

export function ProfessionalReportGenerator({ diagnosticData }: ProfessionalReportGeneratorProps) {
  const [report, setReport] = useState<ProfessionalAIReport | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const { toast } = useToast();
  const { formatCurrency } = useMarket();

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    setGenerationProgress(0);
    
    try {
      // Simulate AI processing with progress
      const progressSteps = [
        { step: 'Analisando dados financeiros...', progress: 20 },
        { step: 'Avaliando mercado angolano...', progress: 40 },
        { step: 'Gerando recomendações estratégicas...', progress: 60 },
        { step: 'Calculando projecções de crescimento...', progress: 80 },
        { step: 'Finalizando relatório profissional...', progress: 100 }
      ];

      for (const { step, progress } of progressSteps) {
        await new Promise(resolve => setTimeout(resolve, 800));
        setGenerationProgress(progress);
      }
      
      const professionalReport = generateProfessionalReport(diagnosticData);
      setReport(professionalReport);
      
      toast({
        title: "Relatório Profissional Gerado!",
        description: "Seu relatório executivo completo está pronto para análise."
      });
      
    } catch (error) {
      toast({
        title: "Erro ao gerar relatório",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };

  const handleDownloadPDF = () => {
    // In a real application, this would generate a professional PDF
    const reportContent = `
RELATÓRIO EXECUTIVO EMPRESARIAL
${diagnosticData.company_name}
Gerado pela Plataforma Growen em ${new Date().toLocaleDateString('pt-AO')}

RESUMO EXECUTIVO:
${report?.executiveSummary.overview}

SCORE DE MATURIDADE: ${diagnosticData.score}/100
CATEGORIA: ${diagnosticData.category.toUpperCase()}

PRINCIPAIS DESCOBERTAS:
${report?.executiveSummary.keyFindings.map(finding => `• ${finding}`).join('\n')}

ACÇÕES CRÍTICAS:
${report?.executiveSummary.criticalActions.map(action => `• ${action}`).join('\n')}

PLANO RECOMENDADO: ${report?.recommendedServices.plan.toUpperCase()}
INVESTIMENTO MENSAL: Kz ${report?.recommendedServices.monthlyInvestment.toLocaleString()}
ROI ESPERADO: ${report?.recommendedServices.expectedRoi}

---
Relatório gerado pela Growen - Plataforma Angolana de Gestão Empresarial
www.growen.ao | Suporte: +244 xxx xxx xxx
    `;
    
    const blob = new Blob([reportContent], { type: 'text/plain; charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-executivo-${diagnosticData.company_name.toLowerCase().replace(/\s+/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast({
      title: "Relatório Descarregado!",
      description: "O seu relatório executivo foi guardado no seu dispositivo."
    });
  };

  const getCategoryBadge = (category: string) => {
    const configs = {
      'excelente': { color: 'bg-green-100 text-green-800 border-green-200', icon: TrendingUp },
      'bom': { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: TrendingUp },
      'atencao': { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: AlertTriangle },
      'critico': { color: 'bg-red-100 text-red-800 border-red-200', icon: AlertTriangle }
    };
    return configs[category as keyof typeof configs] || configs.atencao;
  };

  const categoryConfig = getCategoryBadge(diagnosticData.category);
  const CategoryIcon = categoryConfig.icon;

  if (!report) {
    return (
      <div className="space-y-6">
        <Card className="glass-card">
          <CardHeader className="text-center pb-4">
            <div className="w-20 h-20 gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-2xl mb-2">Relatório Executivo Profissional</CardTitle>
            <p className="text-muted-foreground">
              Gere um relatório executivo completo e detalhado para <strong>{diagnosticData.company_name}</strong> 
              com análise de mercado, projecções financeiras e plano de acção estratégico.
            </p>
          </CardHeader>
          
          <CardContent className="text-center">
            {/* Current Score Display */}
            <div className="mb-8 p-6 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-center gap-3 mb-4">
                <CategoryIcon className="w-6 h-6" />
                <span className="text-2xl font-bold">{diagnosticData.score}/100</span>
              </div>
              <Badge className={`${categoryConfig.color} px-4 py-2 text-sm font-medium`}>
                Categoria: {diagnosticData.category.toUpperCase()}
              </Badge>
            </div>

            {/* Features Preview */}
            <div className="grid md:grid-cols-2 gap-4 mb-8 text-left">
              <div className="space-y-3">
                <h4 className="font-semibold text-primary">Análise Inclusa:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>Análise SWOT completa</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>Projecções financeiras 12 meses</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>KPIs e métricas de desempenho</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>Análise específica do mercado angolano</span>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-primary">Recomendações:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>Plano de acção prioritizado</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>Investimentos recomendados</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>Parceiros e fornecedores locais</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>Conformidade regulatória</span>
                  </div>
                </div>
              </div>
            </div>

            {isGenerating && (
              <div className="mb-6">
                <Progress value={generationProgress} className="mb-2" />
                <p className="text-sm text-muted-foreground">
                  Gerando relatório profissional... {generationProgress}%
                </p>
              </div>
            )}
            
            <Button 
              onClick={handleGenerateReport} 
              disabled={isGenerating}
              size="lg"
              className="w-full text-lg py-6 gradient-primary text-white hover:scale-105 transition-transform"
            >
              {isGenerating ? "Gerando Relatório Executivo..." : "Gerar Relatório Executivo Completo"}
              {!isGenerating && <ArrowRight className="w-5 h-5 ml-2" />}
            </Button>

            <p className="text-xs text-muted-foreground mt-4">
              ⚡ Relatório gerado por IA em menos de 30 segundos
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <Card className="glass-card">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-3xl gradient-text mb-2">
                Relatório Executivo - {diagnosticData.company_name}
              </CardTitle>
              <p className="text-muted-foreground">
                Análise profissional gerada por IA • {new Date().toLocaleDateString('pt-AO')}
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="gap-2">
                <Share className="w-4 h-4" />
                Partilhar
              </Button>
              <Button onClick={handleDownloadPDF} className="gap-2 gradient-primary text-white">
                <Download className="w-4 h-4" />
                Descarregar PDF
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Executive Summary */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            Resumo Executivo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground leading-relaxed text-lg">
            {report.executiveSummary.overview}
          </p>
          
          <Separator />
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold text-primary mb-4 flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                Principais Descobertas
              </h4>
              <ul className="space-y-3">
                {report.executiveSummary.keyFindings.map((finding, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm">{finding}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-red-600 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Acções Críticas
              </h4>
              <ul className="space-y-3">
                {report.executiveSummary.criticalActions.map((action, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm">{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Business Analysis (SWOT) */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            Análise Estratégica (SWOT)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Strengths & Opportunities */}
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-green-600 mb-4">Pontos Fortes</h4>
                <div className="space-y-4">
                  {report.businessAnalysis.strengths.map((strength, index) => (
                    <div key={index} className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium">{strength.item}</h5>
                        <Badge variant="outline" className="text-green-700 border-green-300">
                          Impacto {strength.impact}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{strength.description}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-blue-600 mb-4">Oportunidades</h4>
                <div className="space-y-4">
                  {report.businessAnalysis.opportunities.map((opportunity, index) => (
                    <div key={index} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium">{opportunity.item}</h5>
                        <Badge variant="outline" className="text-blue-700 border-blue-300">
                          Potencial {opportunity.potential}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{opportunity.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Weaknesses & Threats */}
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-yellow-600 mb-4">Pontos Fracos</h4>
                <div className="space-y-4">
                  {report.businessAnalysis.weaknesses.map((weakness, index) => (
                    <div key={index} className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium">{weakness.item}</h5>
                        <Badge variant="outline" className="text-yellow-700 border-yellow-300">
                          Risco {weakness.risk}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{weakness.description}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-red-600 mb-4">Ameaças</h4>
                <div className="space-y-4">
                  {report.businessAnalysis.threats.map((threat, index) => (
                    <div key={index} className="p-4 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium">{threat.item}</h5>
                        <Badge variant="outline" className="text-red-700 border-red-300">
                          Urgência {threat.urgency}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{threat.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Projections */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            Projecções Financeiras e Investimentos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Current Metrics */}
          <div>
            <h4 className="font-semibold mb-4">Métricas Actuais vs. Benchmark</h4>
            <div className="grid md:grid-cols-2 gap-4">
              {report.financialProjection.currentMetrics.map((metric, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium">{metric.metric}</h5>
                    <Badge variant={metric.status === 'good' ? 'default' : metric.status === 'warning' ? 'secondary' : 'destructive'}>
                      {metric.status === 'good' ? 'Bom' : metric.status === 'warning' ? 'Atenção' : 'Crítico'}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Actual:</span>
                      <div className="font-medium">{metric.current}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Benchmark:</span>
                      <div className="font-medium">{metric.benchmark}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Growth Projections */}
          <div>
            <h4 className="font-semibold mb-4">Projecção de Crescimento</h4>
            <div className="grid md:grid-cols-3 gap-6">
              {report.financialProjection.projectedGrowth.map((projection, index) => (
                <div key={index} className="text-center p-6 bg-muted/30 rounded-lg">
                  <div className="text-2xl font-bold text-primary mb-2">
                    Kz {projection.revenue.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground mb-1">{projection.period}</div>
                  <Badge variant="outline" className="text-green-600 border-green-300">
                    {projection.growth}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Investment Recommendations */}
          <div>
            <h4 className="font-semibold mb-4">Recomendações de Investimento</h4>
            <div className="space-y-4">
              {report.financialProjection.investmentRecommendations.map((investment, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <h5 className="font-medium mb-3">{investment.area}</h5>
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Investimento:</span>
                      <div className="font-medium">{investment.amount}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">ROI Esperado:</span>
                      <div className="font-medium text-green-600">{investment.expectedRoi}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Implementação:</span>
                      <div className="font-medium">{investment.timeline}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Angola-Specific Analysis */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">🇦🇴</span>
            </div>
            Análise Específica do Mercado Angolano
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-primary mb-3">Oportunidades de Mercado</h4>
                <ul className="space-y-2">
                  {report.angolaSpecific.marketOpportunities.map((opportunity, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{opportunity}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-primary mb-3">Parceiros Locais Recomendados</h4>
                <ul className="space-y-2">
                  {report.angolaSpecific.localPartners.map((partner, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{partner}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-primary mb-3">Conformidade Regulatória</h4>
                <ul className="space-y-2">
                  {report.angolaSpecific.regulatoryCompliance.map((regulation, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Shield className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{regulation}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-primary mb-3">Factores Económicos</h4>
                <ul className="space-y-2">
                  {report.angolaSpecific.economicFactors.map((factor, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <TrendingUp className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{factor}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Plan */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            Plano de Acção Estratégico
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {/* Immediate Actions */}
            <div>
              <h4 className="font-semibold text-red-600 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Acções Imediatas (0-30 dias)
              </h4>
              <div className="space-y-4">
                {report.actionPlan.immediate.map((action, index) => (
                  <div key={index} className="p-4 border-l-4 border-red-500 bg-red-50 rounded-r-lg">
                    <div className="flex items-start justify-between mb-2">
                      <h5 className="font-medium">{action.action}</h5>
                      <Badge variant="destructive">{action.priority}</Badge>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                      <div>Prazo: {action.timeline}</div>
                      <div>Investimento: {action.cost}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Short Term Actions */}
            <div>
              <h4 className="font-semibold text-yellow-600 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Acções a Curto Prazo (30-90 dias)
              </h4>
              <div className="space-y-4">
                {report.actionPlan.shortTerm.map((action, index) => (
                  <div key={index} className="p-4 border-l-4 border-yellow-500 bg-yellow-50 rounded-r-lg">
                    <div className="flex items-start justify-between mb-2">
                      <h5 className="font-medium">{action.action}</h5>
                      <Badge variant="secondary">{action.priority}</Badge>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                      <div>Prazo: {action.timeline}</div>
                      <div>Investimento: {action.cost}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Long Term Actions */}
            <div>
              <h4 className="font-semibold text-blue-600 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Acções a Longo Prazo (6-12 meses)
              </h4>
              <div className="space-y-4">
                {report.actionPlan.longTerm.map((action, index) => (
                  <div key={index} className="p-4 border-l-4 border-blue-500 bg-blue-50 rounded-r-lg">
                    <div className="flex items-start justify-between mb-2">
                      <h5 className="font-medium">{action.action}</h5>
                      <Badge variant="outline">{action.priority}</Badge>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                      <div>Prazo: {action.timeline}</div>
                      <div>Investimento: {action.cost}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommended Growen Plan */}
      <Card className="glass-card border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            Plano Growen Recomendado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-6">
            <Badge className="text-xl px-6 py-3 gradient-primary text-white mb-4">
              Plano {report.recommendedServices.plan.toUpperCase()}
            </Badge>
            <div className="text-4xl font-bold text-primary mb-2">
              Kz {report.recommendedServices.monthlyInvestment.toLocaleString()}
              <span className="text-lg text-muted-foreground font-normal">/mês</span>
            </div>
            <div className="text-green-600 font-semibold mb-4">
              ROI Esperado: {report.recommendedServices.expectedRoi}
            </div>
          </div>

          <p className="text-muted-foreground text-center mb-6 leading-relaxed">
            {report.recommendedServices.justification}
          </p>

          <div className="space-y-4 mb-6">
            <h4 className="font-semibold">Implementação Incluída:</h4>
            <ul className="space-y-2">
              {report.recommendedServices.implementation.map((item, index) => (
                <li key={index} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex gap-4">
            <Button className="flex-1 gradient-primary text-white">
              Começar Teste Gratuito de 14 Dias
            </Button>
            <Button variant="outline">
              Agendar Demonstração
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center mt-4">
            🎯 Sem compromisso • Cancelamento a qualquer momento • Suporte 24/7 em português
          </p>
        </CardContent>
      </Card>
    </div>
  );
}