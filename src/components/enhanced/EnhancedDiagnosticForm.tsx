import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMarket } from '@/contexts/MarketContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ModernCard } from '@/components/enhanced/ModernCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, ArrowRight, ArrowLeft, Building, Users, TrendingUp, Target } from 'lucide-react';

interface FormData {
  // Company Info
  companyName: string;
  industry: string;
  companySize: string;
  yearsInBusiness: string;
  location: string;
  
  // Business Model
  businessModel: string;
  mainProducts: string;
  targetMarket: string;
  revenueRange: string;
  
  // Current Challenges
  mainChallenges: string;
  digitalPresence: string;
  competitionLevel: string;
  
  // Goals
  businessGoals: string;
  growthAreas: string;
  investmentCapacity: string;
}

const steps = [
  {
    id: 'company',
    title: 'Informações da Empresa',
    icon: Building,
    description: 'Dados básicos sobre o seu negócio'
  },
  {
    id: 'model',
    title: 'Modelo de Negócio',
    icon: TrendingUp,
    description: 'Como funciona o seu negócio'
  },
  {
    id: 'challenges',
    title: 'Desafios Atuais',
    icon: Users,
    description: 'Principais obstáculos e dificuldades'
  },
  {
    id: 'goals',
    title: 'Objetivos',
    icon: Target,
    description: 'Metas e planos de crescimento'
  }
];

const industries = [
  'Tecnologia', 'Comércio', 'Serviços', 'Indústria', 'Agricultura',
  'Construção', 'Saúde', 'Educação', 'Turismo', 'Alimentação',
  'Moda', 'Automóveis', 'Imobiliário', 'Finanças', 'Outro'
];

const companySizes = [
  '1-5 funcionários',
  '6-20 funcionários',
  '21-50 funcionários',
  '51-200 funcionários',
  'Mais de 200 funcionários'
];

export const EnhancedDiagnosticForm: React.FC = () => {
  const { t } = useTranslation();
  const { marketConfig } = useMarket();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    companyName: '',
    industry: '',
    companySize: '',
    yearsInBusiness: '',
    location: '',
    businessModel: '',
    mainProducts: '',
    targetMarket: '',
    revenueRange: '',
    mainChallenges: '',
    digitalPresence: '',
    competitionLevel: '',
    businessGoals: '',
    growthAreas: '',
    investmentCapacity: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Transform form data to diagnostic data format
      const diagnosticData = {
        company_name: formData.companyName,
        owner_name: 'Proprietário', // Could be collected in form
        industry: formData.industry,
        city_country: formData.location || 'Luanda, Angola',
        monthly_revenue: getRevenueFromRange(formData.revenueRange),
        employees: getEmployeesFromSize(formData.companySize),
        has_website: formData.digitalPresence !== 'none',
        lead_acquisition: formData.digitalPresence || 'Tradicional',
        goals_12m: [formData.businessGoals, formData.growthAreas].filter(Boolean),
        score: calculateScore(),
        category: getCategory()
      };
      
      // Trigger report generation
      const event = new CustomEvent('generateReport', { detail: diagnosticData });
      window.dispatchEvent(event);
      
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const getRevenueFromRange = (range: string): number => {
    switch (range) {
      case '0-50k': return 25000;
      case '50k-200k': return 125000;
      case '200k-500k': return 350000;
      case '500k-1m': return 750000;
      case '1m+': return 1500000;
      default: return 100000;
    }
  };
  
  const getEmployeesFromSize = (size: string): number => {
    switch (size) {
      case '1-5 funcionários': return 3;
      case '6-20 funcionários': return 13;
      case '21-50 funcionários': return 35;
      case '51-200 funcionários': return 125;
      case 'Mais de 200 funcionários': return 300;
      default: return 10;
    }
  };
  
  const calculateScore = (): number => {
    let score = 50; // Base score
    
    // Revenue impact
    const revenue = getRevenueFromRange(formData.revenueRange);
    if (revenue > 500000) score += 20;
    else if (revenue > 200000) score += 10;
    
    // Digital presence impact
    switch (formData.digitalPresence) {
      case 'advanced': score += 25; break;
      case 'intermediate': score += 15; break;
      case 'basic': score += 5; break;
      default: score -= 10;
    }
    
    // Business maturity
    const years = parseInt(formData.yearsInBusiness) || 0;
    if (years > 5) score += 15;
    else if (years > 2) score += 10;
    
    return Math.min(100, Math.max(0, score));
  };
  
  const getCategory = (): 'excelente' | 'bom' | 'atencao' | 'critico' => {
    const score = calculateScore();
    if (score >= 80) return 'excelente';
    if (score >= 65) return 'bom';
    if (score >= 45) return 'atencao';
    return 'critico';
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0:
        return formData.companyName && formData.industry && formData.companySize;
      case 1:
        return formData.businessModel && formData.mainProducts;
      case 2:
        return formData.mainChallenges && formData.digitalPresence;
      case 3:
        return formData.businessGoals;
      default:
        return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="companyName">Nome da Empresa *</Label>
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) => handleInputChange('companyName', e.target.value)}
                placeholder="Ex: MinhaEmpresa Lda"
                className="input-modern"
              />
            </div>
            
            <div>
              <Label htmlFor="industry">Setor de Atividade *</Label>
              <Select value={formData.industry} onValueChange={(value) => handleInputChange('industry', value)}>
                <SelectTrigger className="input-modern">
                  <SelectValue placeholder="Selecione o setor" />
                </SelectTrigger>
                <SelectContent>
                  {industries.map((industry) => (
                    <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="companySize">Tamanho da Empresa *</Label>
              <Select value={formData.companySize} onValueChange={(value) => handleInputChange('companySize', value)}>
                <SelectTrigger className="input-modern">
                  <SelectValue placeholder="Número de funcionários" />
                </SelectTrigger>
                <SelectContent>
                  {companySizes.map((size) => (
                    <SelectItem key={size} value={size}>{size}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="yearsInBusiness">Anos de Atividade</Label>
              <Input
                id="yearsInBusiness"
                value={formData.yearsInBusiness}
                onChange={(e) => handleInputChange('yearsInBusiness', e.target.value)}
                placeholder="Ex: 3 anos"
                className="input-modern"
              />
            </div>

            <div>
              <Label htmlFor="location">Localização</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder={`Ex: Luanda, ${marketConfig.name}`}
                className="input-modern"
              />
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="businessModel">Modelo de Negócio *</Label>
              <Textarea
                id="businessModel"
                value={formData.businessModel}
                onChange={(e) => handleInputChange('businessModel', e.target.value)}
                placeholder="Descreva como o seu negócio funciona, como gera receita..."
                className="input-modern min-h-20"
              />
            </div>

            <div>
              <Label htmlFor="mainProducts">Principais Produtos/Serviços *</Label>
              <Textarea
                id="mainProducts"
                value={formData.mainProducts}
                onChange={(e) => handleInputChange('mainProducts', e.target.value)}
                placeholder="Liste os principais produtos ou serviços que oferece..."
                className="input-modern min-h-20"
              />
            </div>

            <div>
              <Label htmlFor="targetMarket">Mercado-Alvo</Label>
              <Textarea
                id="targetMarket"
                value={formData.targetMarket}
                onChange={(e) => handleInputChange('targetMarket', e.target.value)}
                placeholder="Quem são os seus clientes ideais?"
                className="input-modern min-h-20"
              />
            </div>

            <div>
              <Label htmlFor="revenueRange">Faturação Mensal Aproximada</Label>
              <Select value={formData.revenueRange} onValueChange={(value) => handleInputChange('revenueRange', value)}>
                <SelectTrigger className="input-modern">
                  <SelectValue placeholder="Selecione a faixa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0-50k">0 - 50.000 {marketConfig.currencySymbol}</SelectItem>
                  <SelectItem value="50k-200k">50.000 - 200.000 {marketConfig.currencySymbol}</SelectItem>
                  <SelectItem value="200k-500k">200.000 - 500.000 {marketConfig.currencySymbol}</SelectItem>
                  <SelectItem value="500k-1m">500.000 - 1M {marketConfig.currencySymbol}</SelectItem>
                  <SelectItem value="1m+">Mais de 1M {marketConfig.currencySymbol}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="mainChallenges">Principais Desafios *</Label>
              <Textarea
                id="mainChallenges"
                value={formData.mainChallenges}
                onChange={(e) => handleInputChange('mainChallenges', e.target.value)}
                placeholder="Quais são os maiores obstáculos que enfrenta atualmente?"
                className="input-modern min-h-24"
              />
            </div>

            <div>
              <Label htmlFor="digitalPresence">Presença Digital *</Label>
              <Select value={formData.digitalPresence} onValueChange={(value) => handleInputChange('digitalPresence', value)}>
                <SelectTrigger className="input-modern">
                  <SelectValue placeholder="Nível de digitalização" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem presença digital</SelectItem>
                  <SelectItem value="basic">Básica (redes sociais)</SelectItem>
                  <SelectItem value="intermediate">Intermediária (website + redes)</SelectItem>
                  <SelectItem value="advanced">Avançada (e-commerce, CRM, etc.)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="competitionLevel">Nível de Concorrência</Label>
              <Select value={formData.competitionLevel} onValueChange={(value) => handleInputChange('competitionLevel', value)}>
                <SelectTrigger className="input-modern">
                  <SelectValue placeholder="Como avalia a concorrência?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baixa</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="very-high">Muito Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="businessGoals">Objetivos de Negócio *</Label>
              <Textarea
                id="businessGoals"
                value={formData.businessGoals}
                onChange={(e) => handleInputChange('businessGoals', e.target.value)}
                placeholder="Quais são os seus principais objetivos para os próximos 12 meses?"
                className="input-modern min-h-24"
              />
            </div>

            <div>
              <Label htmlFor="growthAreas">Áreas de Crescimento</Label>
              <Textarea
                id="growthAreas"
                value={formData.growthAreas}
                onChange={(e) => handleInputChange('growthAreas', e.target.value)}
                placeholder="Em que áreas pretende investir para crescer?"
                className="input-modern min-h-20"
              />
            </div>

            <div>
              <Label htmlFor="investmentCapacity">Capacidade de Investimento</Label>
              <Select value={formData.investmentCapacity} onValueChange={(value) => handleInputChange('investmentCapacity', value)}>
                <SelectTrigger className="input-modern">
                  <SelectValue placeholder="Orçamento disponível" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baixo (até 10.000 {marketConfig.currencySymbol})</SelectItem>
                  <SelectItem value="medium">Médio (10.000 - 50.000 {marketConfig.currencySymbol})</SelectItem>
                  <SelectItem value="high">Alto (50.000 - 200.000 {marketConfig.currencySymbol})</SelectItem>
                  <SelectItem value="very-high">Muito Alto (mais de 200.000 {marketConfig.currencySymbol})</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <section className="py-20 bg-gradient-to-br from-background via-muted/20 to-accent/10">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold mb-4 text-gradient-primary">
            Diagnóstico Empresarial Inteligente
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Responda algumas perguntas sobre o seu negócio e receba um relatório completo com recomendações personalizadas
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = index === currentStep;
                const isCompleted = index < currentStep;
                
                return (
                  <div key={step.id} className="flex items-center">
                    <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all ${
                      isCompleted 
                        ? 'bg-primary border-primary text-white' 
                        : isActive 
                        ? 'border-primary text-primary bg-primary/10' 
                        : 'border-muted text-muted-foreground'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="h-6 w-6" />
                      ) : (
                        <Icon className="h-6 w-6" />
                      )}
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`hidden sm:block w-20 h-0.5 ml-4 ${
                        isCompleted ? 'bg-primary' : 'bg-muted'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
            
            <Progress value={progress} className="h-2" />
            
            <div className="mt-4 text-center">
              <h3 className="text-lg font-semibold">{steps[currentStep].title}</h3>
              <p className="text-sm text-muted-foreground">{steps[currentStep].description}</p>
            </div>
          </div>

          {/* Form Content */}
          <ModernCard variant="glass" className="mb-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderStepContent()}
              </motion.div>
            </AnimatePresence>
          </ModernCard>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              {t('common.back')}
            </Button>

            {currentStep === steps.length - 1 ? (
              <Button
                onClick={handleSubmit}
                disabled={!isStepValid() || isSubmitting}
                className="flex items-center gap-2"
                variant="gradient"
                size="lg"
              >
                {isSubmitting ? 'A processar...' : 'Gerar Relatório'}
                <TrendingUp className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={!isStepValid()}
                className="flex items-center gap-2"
                variant="default"
              >
                {t('common.next')}
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};