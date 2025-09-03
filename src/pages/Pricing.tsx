import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Star } from "lucide-react";

const plans = [
  {
    name: "Iniciante",
    price: "45.000",
    period: "/mês",
    description: "Perfeito para negócios que estão começando",
    badge: null,
    features: [
      "Diagnóstico empresarial completo",
      "Dashboard básico com métricas essenciais", 
      "CRM para até 100 contactos",
      "Suporte via WhatsApp",
      "Relatórios mensais",
      "1 usuário"
    ],
    cta: "Começar Agora",
    highlighted: false
  },
  {
    name: "Crescimento",
    price: "85.000",
    period: "/mês",
    description: "Para negócios em expansão",
    badge: "Mais Popular",
    features: [
      "Tudo do plano Iniciante",
      "IA Generativa para relatórios",
      "CRM para até 500 contactos",
      "Automações de marketing",
      "Academia Growen completa",
      "Marketplace de parceiros",
      "Suporte prioritário",
      "Até 3 usuários"
    ],
    cta: "Escolher Crescimento",
    highlighted: true
  },
  {
    name: "Empresarial",
    price: "150.000",
    period: "/mês",
    description: "Para empresas estabelecidas",
    badge: "Profissional",
    features: [
      "Tudo do plano Crescimento",
      "CRM ilimitado",
      "GrowenBot IA 24/7",
      "Integrações personalizadas",
      "Consultoria mensal dedicada",
      "Relatórios personalizados",
      "Suporte telefónico",
      "Usuários ilimitados"
    ],
    cta: "Falar com Especialista",
    highlighted: false
  }
];

const faqs = [
  {
    question: "Como funciona o período de teste?",
    answer: "Oferecemos 14 dias grátis em qualquer plano, sem compromisso. Pode cancelar a qualquer momento."
  },
  {
    question: "Posso mudar de plano a qualquer momento?",
    answer: "Sim! Pode fazer upgrade ou downgrade do seu plano a qualquer momento. As alterações são aplicadas no próximo ciclo de faturação."
  },
  {
    question: "Que métodos de pagamento aceitam?",
    answer: "Aceitamos transferência bancária, TPA e pagamento via Multicaixa Express. Todos os preços são em Kwanzas (AOA)."
  },
  {
    question: "Há custos de configuração?",
    answer: "Não! A configuração inicial é gratuita em todos os planos. Nossa equipa ajuda na migração dos seus dados sem custos adicionais."
  },
  {
    question: "O suporte está incluído?",
    answer: "Sim, todos os planos incluem suporte. O nível de suporte varia conforme o plano escolhido, desde WhatsApp até suporte telefónico dedicado."
  }
];

export default function Pricing() {
  return (
    <div className="min-h-screen">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-b from-background to-muted/30">
          <div className="container mx-auto px-4 text-center">
            <Badge variant="secondary" className="mb-6">
              Planos e Preços
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Escolha o Plano{" "}
              <span className="gradient-text">Ideal</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Planos transparentes e acessíveis para empresários angolanos. 
              Comece grátis e escale conforme o seu negócio cresce.
            </p>
            <div className="flex justify-center items-center space-x-4 text-sm text-muted-foreground">
              <span className="flex items-center">
                <Check className="w-4 h-4 text-green-500 mr-2" />
                14 dias grátis
              </span>
              <span className="flex items-center">
                <Check className="w-4 h-4 text-green-500 mr-2" />
                Sem compromisso
              </span>
              <span className="flex items-center">
                <Check className="w-4 h-4 text-green-500 mr-2" />
                Suporte incluído
              </span>
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {plans.map((plan, index) => (
                <Card 
                  key={index} 
                  className={`relative ${
                    plan.highlighted 
                      ? 'ring-2 ring-primary shadow-elegant scale-105' 
                      : 'glass-effect'
                  }`}
                >
                  {plan.badge && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge variant="default" className="gradient-primary text-white">
                        <Star className="w-3 h-3 mr-1" />
                        {plan.badge}
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="text-center pb-6">
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <div className="mt-4">
                      <span className="text-4xl font-bold">AOA {plan.price}</span>
                      <span className="text-muted-foreground">{plan.period}</span>
                    </div>
                    <p className="text-muted-foreground mt-2">{plan.description}</p>
                  </CardHeader>

                  <CardContent>
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start">
                          <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button 
                      className={`w-full ${
                        plan.highlighted 
                          ? 'gradient-primary text-white' 
                          : ''
                      }`}
                      variant={plan.highlighted ? "default" : "outline"}
                    >
                      {plan.cta}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Additional Info */}
            <div className="text-center mt-16">
              <p className="text-muted-foreground mb-4">
                Todos os preços são em Kwanzas (AOA) e não incluem IVA
              </p>
              <Button variant="outline" size="lg">
                Precisa de um Plano Personalizado?
              </Button>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Perguntas Frequentes
              </h2>
              <p className="text-lg text-muted-foreground">
                Respostas às dúvidas mais comuns sobre nossos planos
              </p>
            </div>

            <div className="max-w-3xl mx-auto space-y-6">
              {faqs.map((faq, index) => (
                <Card key={index} className="glass-effect">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-3">{faq.question}</h3>
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center mt-12">
              <p className="text-muted-foreground mb-4">
                Ainda tem dúvidas? Nossa equipa está pronta para ajudar
              </p>
              <Button variant="outline">
                Falar com Nossa Equipa
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}