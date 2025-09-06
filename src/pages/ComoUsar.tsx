import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  FileText, 
  BarChart3, 
  Users, 
  CheckCircle, 
  ArrowRight,
  Lightbulb,
  Target,
  TrendingUp
} from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Diagnóstico Empresarial",
    description: "Comece preenchendo o nosso formulário de diagnóstico detalhado. Leva apenas 5 minutos e fornece uma análise completa da sua empresa.",
    icon: <FileText className="w-8 h-8" />,
    features: ["Análise SWOT automática", "Identificação de oportunidades", "Pontos fortes e fracos", "Recomendações personalizadas"]
  },
  {
    number: "02", 
    title: "Relatório Profissional",
    description: "Receba instantaneamente um relatório executivo completo com insights valiosos e plano de acção para o seu negócio.",
    icon: <BarChart3 className="w-8 h-8" />,
    features: ["Dashboard personalizado", "Métricas de performance", "Análise de mercado", "Projecções financeiras"]
  },
  {
    number: "03",
    title: "Rede de Parceiros",
    description: "Acesse nosso marketplace com profissionais especializados em Angola para implementar as melhorias identificadas.",
    icon: <Users className="w-8 h-8" />,
    features: ["Profissionais verificados", "Avaliações reais", "Preços transparentes", "Suporte local"]
  },
  {
    number: "04",
    title: "Crescimento Contínuo",
    description: "Monitore o progresso da sua empresa e receba novas recomendações à medida que o seu negócio evolui.",
    icon: <TrendingUp className="w-8 h-8" />,
    features: ["Relatórios mensais", "Benchmarking setorial", "Alertas de oportunidades", "Consultoria contínua"]
  }
];

const benefits = [
  "Diagnóstico empresarial profissional GRATUITO",
  "Relatórios executivos em formato PDF",
  "Acesso a profissionais especializados",
  "Suporte 100% em português",
  "Foco específico no mercado angolano",
  "Interface simples e intuitiva"
];

export default function ComoUsar() {
  return (
    <div className="min-h-screen">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-b from-background to-muted/30">
          <div className="container mx-auto px-4 text-center">
            <Badge variant="secondary" className="mb-6">
              Como Usar o Growen
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Transforme o Seu Negócio{" "}
              <span className="gradient-text">em 4 Passos</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Descubra como milhares de empresários angolanos estão usando o Growen 
              para fazer crescer os seus negócios de forma inteligente e estratégica.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="gradient-primary text-white text-lg px-8 py-6 hover:scale-105 transition-transform"
                onClick={() => window.location.href = '/#diagnostico'}
              >
                <Play className="w-5 h-5 mr-2" />
                Começar Agora
              </Button>
              <Button variant="outline" size="lg" className="glass-effect text-lg px-8 py-6">
                <FileText className="w-5 h-5 mr-2" />
                Ver Exemplo de Relatório
              </Button>
            </div>
          </div>
        </section>

        {/* Steps Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Como Funciona o Growen
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Um processo simples e eficaz para transformar o seu negócio
              </p>
            </div>

            <div className="space-y-16">
              {steps.map((step, index) => (
                <div key={index} className={`flex flex-col lg:flex-row items-center gap-12 ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
                  <div className="flex-1">
                    <Card className="glass-effect h-full">
                      <CardHeader>
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-16 h-16 gradient-primary rounded-xl flex items-center justify-center text-white">
                            {step.icon}
                          </div>
                          <div>
                            <Badge variant="outline" className="mb-2">
                              Passo {step.number}
                            </Badge>
                            <CardTitle className="text-2xl">{step.title}</CardTitle>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground text-lg mb-6">
                          {step.description}
                        </p>
                        <div className="space-y-3">
                          {step.features.map((feature, featureIndex) => (
                            <div key={featureIndex} className="flex items-center gap-3">
                              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                              <span className="text-sm">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="flex-1 flex justify-center">
                    <div className="w-80 h-60 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center">
                      <div className="text-6xl font-bold text-primary/30">
                        {step.number}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  Porquê Escolher o Growen?
                </h2>
                <p className="text-lg text-muted-foreground">
                  A plataforma mais completa para empresários angolanos
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {benefits.map((benefit, index) => (
                  <Card key={index} className="glass-effect">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center text-white">
                          <CheckCircle className="w-5 h-5" />
                        </div>
                        <span className="font-medium">{benefit}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  Perguntas Frequentes
                </h2>
              </div>

              <div className="space-y-6">
                <Card className="glass-effect">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-3">
                      O diagnóstico é realmente gratuito?
                    </h3>
                    <p className="text-muted-foreground">
                      Sim! O diagnóstico empresarial e o relatório são 100% gratuitos. 
                      Nossa missão é ajudar empresários angolanos a crescerem.
                    </p>
                  </CardContent>
                </Card>

                <Card className="glass-effect">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-3">
                      Quanto tempo demora para receber o relatório?
                    </h3>
                    <p className="text-muted-foreground">
                      O relatório é gerado instantaneamente após completar o diagnóstico. 
                      Pode fazer o download imediatamente em formato PDF.
                    </p>
                  </CardContent>
                </Card>

                <Card className="glass-effect">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-3">
                      Os profissionais do marketplace são verificados?
                    </h3>
                    <p className="text-muted-foreground">
                      Sim, todos os parceiros passam por um processo rigoroso de verificação 
                      e são avaliados pela comunidade Growen.
                    </p>
                  </CardContent>
                </Card>

                <Card className="glass-effect">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-3">
                      Funciona para todos os tipos de negócio?
                    </h3>
                    <p className="text-muted-foreground">
                      Sim! O Growen é adaptado para PMEs, microempresas, startups e 
                      negócios tradicionais em Angola.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-primary/10 to-accent/10">
          <div className="container mx-auto px-4">
            <Card className="glass-effect max-w-4xl mx-auto">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 gradient-primary rounded-full flex items-center justify-center mx-auto mb-6 text-white">
                  <Lightbulb className="w-10 h-10" />
                </div>
                <h2 className="text-3xl font-bold mb-4">
                  Pronto para Transformar o Seu Negócio?
                </h2>
                <p className="text-muted-foreground mb-8 text-lg">
                  Junte-se a mais de 2.500 empresários que já descobriram 
                  o potencial dos seus negócios com o Growen.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    size="lg" 
                    className="gradient-primary text-white text-lg px-8 py-6"
                    onClick={() => window.location.href = '/#diagnostico'}
                  >
                    Fazer Diagnóstico Gratuito
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="glass-effect text-lg px-8 py-6"
                  >
                    <a 
                      href="https://wa.me/244999999999?text=Preciso de ajuda com o Growen"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center"
                    >
                      💬 Falar Connosco
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}