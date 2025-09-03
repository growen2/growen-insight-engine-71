import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { FileText, Loader2, TrendingUp, CheckCircle } from "lucide-react";
import { ReportGenerator } from "@/components/ai/ReportGenerator";

interface DiagnosticFormData {
  company_name: string;
  owner_name: string;
  email: string;
  phone: string;
  city_country: string;
  currency: string;
  industry: string;
  monthly_revenue: number;
  fixed_costs: string[];
  employees: number;
  lead_acquisition: string;
  has_website: string;
  website_url?: string;
  current_crm: string;
  goals_12m: string[];
  interested_consulting: string;
  comments: string;
}

export function DiagnosticForm() {
  const [formData, setFormData] = useState<DiagnosticFormData>({
    company_name: "",
    owner_name: "",
    email: "",
    phone: "",
    city_country: "",
    currency: "",
    industry: "",
    monthly_revenue: 0,
    fixed_costs: [],
    employees: 0,
    lead_acquisition: "",
    has_website: "",
    website_url: "",
    current_crm: "",
    goals_12m: [],
    interested_consulting: "",
    comments: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState<any>(null);
  const [showReport, setShowReport] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Calculate score and category
      const score = calculateScore(formData);
      const category = getCategory(score);
      
      // Create diagnostic result object
      const result = {
        company_name: formData.company_name,
        owner_name: formData.owner_name,
        industry: formData.industry,
        city_country: formData.city_country,
        currency: formData.currency,
        monthly_revenue: formData.monthly_revenue,
        employees: formData.employees,
        has_website: formData.has_website === "sim",
        lead_acquisition: formData.lead_acquisition,
        goals_12m: formData.goals_12m,
        score,
        category,
        submission_date: new Date().toISOString()
      };
      
      // Simulate API call - In real implementation, would save to Supabase
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setDiagnosticResult(result);
      setShowReport(true);
      
      toast({
        title: "✅ Diagnóstico Concluído!",
        description: `Score: ${score}/100 • Categoria: ${category.toUpperCase()}`,
      });

    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao processar seu diagnóstico. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateScore = (data: DiagnosticFormData): number => {
    let score = 0;
    
    // Revenue score (0-40 points) - normalized by currency
    let normalizedRevenue = data.monthly_revenue;
    
    // Convert to EUR for standardized scoring
    if (data.currency === "AOA") {
      normalizedRevenue = data.monthly_revenue / 700; // Approx AOA to EUR
    } else if (data.currency === "BRL") {
      normalizedRevenue = data.monthly_revenue / 6; // Approx BRL to EUR
    }
    
    if (normalizedRevenue >= 50000) score += 40; // 50K+ EUR equivalent
    else if (normalizedRevenue >= 25000) score += 35; // 25K+ EUR equivalent
    else if (normalizedRevenue >= 10000) score += 30; // 10K+ EUR equivalent
    else if (normalizedRevenue >= 5000) score += 25; // 5K+ EUR equivalent
    else if (normalizedRevenue >= 2500) score += 20; // 2.5K+ EUR equivalent
    else if (normalizedRevenue > 0) score += 10;
    
    // Digital presence (0-20 points)
    if (data.has_website === "sim") {
      score += 15;
      if (data.website_url) score += 5; // Bonus for providing URL
    }
    
    // Lead acquisition diversity (0-15 points)
    if (data.lead_acquisition === "anuncio_pago") score += 15;
    else if (data.lead_acquisition === "google") score += 12;
    else if (data.lead_acquisition === "redes_sociais") score += 10;
    else if (data.lead_acquisition === "marketplace") score += 8;
    else if (data.lead_acquisition === "boca_boca") score += 5;
    
    // Team structure (0-15 points)
    if (data.employees >= 20) score += 15;
    else if (data.employees >= 10) score += 12;
    else if (data.employees >= 5) score += 8;
    else if (data.employees >= 2) score += 5;
    
    // Business maturity (0-10 points)
    if (data.current_crm && data.current_crm.toLowerCase() !== "nenhum") score += 5;
    if (data.goals_12m.length >= 3) score += 5;
    
    return Math.min(score, 100);
  };

  const getCategory = (score: number): 'excelente' | 'ok' | 'atencao' | 'critico' => {
    if (score >= 80) return 'excelente';
    if (score >= 60) return 'ok';
    if (score >= 40) return 'atencao';
    return 'critico';
  };

  const resetForm = () => {
    setFormData({
      company_name: "",
      owner_name: "",
      email: "",
      phone: "",
      city_country: "",
      currency: "",
      industry: "",
      monthly_revenue: 0,
      fixed_costs: [],
      employees: 0,
      lead_acquisition: "",
      has_website: "",
      website_url: "",
      current_crm: "",
      goals_12m: [],
      interested_consulting: "",
      comments: ""
    });
    setDiagnosticResult(null);
    setShowReport(false);
  };

  const handleFixedCostChange = (cost: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        fixed_costs: [...prev.fixed_costs, cost]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        fixed_costs: prev.fixed_costs.filter(c => c !== cost)
      }));
    }
  };

  const handleGoalsChange = (goal: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        goals_12m: [...prev.goals_12m, goal]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        goals_12m: prev.goals_12m.filter(g => g !== goal)
      }));
    }
  };

  // Show report if diagnostic is completed
  if (showReport && diagnosticResult) {
    return (
      <section id="diagnostico" className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="mb-6 text-center">
              <Button 
                variant="outline" 
                onClick={resetForm}
                className="mb-4"
              >
                Fazer Novo Diagnóstico
              </Button>
            </div>
            <ReportGenerator diagnosticData={diagnosticResult} />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="diagnostico" className="py-20 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="w-16 h-16 gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-3xl">Diagnóstico Empresarial 100% Gratuito</CardTitle>
              <CardDescription className="text-lg">
                Avaliação personalizada do seu negócio por especialistas que conhecem 
                o mercado angolano. Receba recomendações práticas em 48 horas.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="company_name">Nome da Empresa *</Label>
                    <Input
                      id="company_name"
                      value={formData.company_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
                      required
                      placeholder="Ex: Sua Empresa Lda"
                    />
                  </div>
                  <div>
                    <Label htmlFor="owner_name">Nome do Responsável *</Label>
                    <Input
                      id="owner_name"
                      value={formData.owner_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, owner_name: e.target.value }))}
                      required
                      placeholder="Seu nome completo"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">E-mail *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      required
                      placeholder="seu@email.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">WhatsApp/Telefone *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      required
                      placeholder="+244 123 456 789"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city_country">País/Região *</Label>
                    <Select value={formData.city_country} onValueChange={(value) => {
                      const currencyMap: Record<string, string> = {
                        portugal: "EUR",
                        angola: "AOA", 
                        brasil: "BRL"
                      };
                      setFormData(prev => ({ 
                        ...prev, 
                        city_country: value,
                        currency: currencyMap[value] || ""
                      }));
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione sua localização" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="portugal">Portugal</SelectItem>
                        <SelectItem value="angola">Angola</SelectItem>
                        <SelectItem value="brasil">Brasil</SelectItem>
                        <SelectItem value="outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="currency">Moeda *</Label>
                    <Select value={formData.currency} onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a moeda" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="AOA">AOA (Kz)</SelectItem>
                        <SelectItem value="BRL">BRL (R$)</SelectItem>
                        <SelectItem value="USD">USD ($)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="industry">Setor de Atividade *</Label>
                    <Select value={formData.industry} onValueChange={(value) => setFormData(prev => ({ ...prev, industry: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione seu setor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="salao">Salão de Beleza</SelectItem>
                        <SelectItem value="restaurante">Restaurante/Food</SelectItem>
                        <SelectItem value="oficina">Oficina/Mecânica</SelectItem>
                        <SelectItem value="comercio">Comércio</SelectItem>
                        <SelectItem value="servicos">Serviços Profissionais</SelectItem>
                        <SelectItem value="outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Financial Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="monthly_revenue">
                      Receita Média Mensal {formData.currency ? `(${formData.currency})` : ""} *
                    </Label>
                    <Input
                      id="monthly_revenue"
                      type="number"
                      min="0"
                      value={formData.monthly_revenue}
                      onChange={(e) => setFormData(prev => ({ ...prev, monthly_revenue: Number(e.target.value) }))}
                      required
                      placeholder={
                        formData.currency === "AOA" ? "Ex: 2500000" :
                        formData.currency === "EUR" ? "Ex: 15000" :
                        formData.currency === "BRL" ? "Ex: 50000" :
                        "Ex: 15000"
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="employees">Número de Colaboradores *</Label>
                    <Input
                      id="employees"
                      type="number"
                      min="0"
                      value={formData.employees}
                      onChange={(e) => setFormData(prev => ({ ...prev, employees: Number(e.target.value) }))}
                      required
                      placeholder="Ex: 5"
                    />
                  </div>
                </div>

                {/* Fixed Costs */}
                <div>
                  <Label className="text-base font-medium">Principais Custos Fixos Mensais</Label>
                  <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-3">
                    {["Salários", "Aluguer", "Matéria-prima", "Marketing", "Seguros", "Outros"].map((cost) => (
                      <div key={cost} className="flex items-center space-x-2">
                        <Checkbox
                          id={cost}
                          checked={formData.fixed_costs.includes(cost)}
                          onCheckedChange={(checked) => handleFixedCostChange(cost, checked as boolean)}
                        />
                        <Label htmlFor={cost} className="text-sm">{cost}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Lead Acquisition */}
                <div>
                  <Label className="text-base font-medium">Como capta clientes atualmente? *</Label>
                  <RadioGroup
                    value={formData.lead_acquisition}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, lead_acquisition: value }))}
                    className="mt-3"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="boca_boca" id="boca_boca" />
                      <Label htmlFor="boca_boca">Boca-a-boca / Indicações</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="redes_sociais" id="redes_sociais" />
                      <Label htmlFor="redes_sociais">Redes Sociais Orgânicas</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="google" id="google" />
                      <Label htmlFor="google">Google (SEO/Busca)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="anuncio_pago" id="anuncio_pago" />
                      <Label htmlFor="anuncio_pago">Anúncios Pagos</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="marketplace" id="marketplace" />
                      <Label htmlFor="marketplace">Marketplace</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="outro" id="outro" />
                      <Label htmlFor="outro">Outro</Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Digital Presence */}
                <div>
                  <Label className="text-base font-medium">Possui site ou presença digital ativa? *</Label>
                  <RadioGroup
                    value={formData.has_website}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, has_website: value }))}
                    className="mt-3"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="sim" id="website_sim" />
                      <Label htmlFor="website_sim">Sim</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="nao" id="website_nao" />
                      <Label htmlFor="website_nao">Não</Label>
                    </div>
                  </RadioGroup>

                  {formData.has_website === "sim" && (
                    <div className="mt-3">
                      <Label htmlFor="website_url">URL do Site</Label>
                      <Input
                        id="website_url"
                        type="url"
                        value={formData.website_url}
                        onChange={(e) => setFormData(prev => ({ ...prev, website_url: e.target.value }))}
                        placeholder="https://seusite.com"
                      />
                    </div>
                  )}
                </div>

                {/* CRM */}
                <div>
                  <Label htmlFor="current_crm">Tem CRM ou sistema de vendas? Qual?</Label>
                  <Input
                    id="current_crm"
                    value={formData.current_crm}
                    onChange={(e) => setFormData(prev => ({ ...prev, current_crm: e.target.value }))}
                    placeholder="Ex: HubSpot, Excel, Nenhum"
                  />
                </div>

                {/* Goals */}
                <div>
                  <Label className="text-base font-medium">Principais objetivos nos próximos 12 meses</Label>
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                    {["Aumentar receita", "Reduzir custos", "Digitalizar processos", "Expandir negócio", "Contratar equipe", "Melhorar atendimento"].map((goal) => (
                      <div key={goal} className="flex items-center space-x-2">
                        <Checkbox
                          id={goal}
                          checked={formData.goals_12m.includes(goal)}
                          onCheckedChange={(checked) => handleGoalsChange(goal, checked as boolean)}
                        />
                        <Label htmlFor={goal} className="text-sm">{goal}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Consulting Interest */}
                <div>
                  <Label className="text-base font-medium">Está interessado em suporte/consultoria ativa? *</Label>
                  <RadioGroup
                    value={formData.interested_consulting}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, interested_consulting: value }))}
                    className="mt-3"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="sim" id="consulting_sim" />
                      <Label htmlFor="consulting_sim">Sim, preciso de ajuda especializada</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="nao" id="consulting_nao" />
                      <Label htmlFor="consulting_nao">Não, só quero o diagnóstico</Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Comments */}
                <div>
                  <Label htmlFor="comments">Comentários adicionais (principais dores ou urgências)</Label>
                  <Textarea
                    id="comments"
                    value={formData.comments}
                    onChange={(e) => setFormData(prev => ({ ...prev, comments: e.target.value }))}
                    placeholder="Conte-nos sobre seus principais desafios..."
                    rows={4}
                  />
                </div>

                {/* Submit Button */}
                <div className="text-center pt-6">
                  <Button
                    type="submit"
                    disabled={isSubmitting || !formData.company_name || !formData.owner_name || !formData.email}
                    size="lg"
                    className="w-full gradient-primary text-white"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Analisando dados empresariais...
                      </>
                    ) : (
                      <>
                        <TrendingUp className="w-5 h-5 mr-2" />
                        Gerar Relatório Personalizado
                      </>
                    )}
                  </Button>
                  
                  <p className="text-xs text-muted-foreground text-center mt-4">
                    ⚡ Análise instantânea • 🔒 Dados seguros • 📧 Relatório por email
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}