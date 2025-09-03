import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  Users, 
  TrendingUp, 
  Zap, 
  GraduationCap, 
  Store, 
  BarChart3, 
  MessageSquare,
  ShieldCheck 
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "IA Generativa",
    description: "Relatórios automáticos com insights personalizados e recomendações estratégicas baseadas em dados.",
    badge: "Novidade"
  },
  {
    icon: BarChart3,
    title: "Dashboard de Crescimento",
    description: "Acompanhe KPIs em tempo real: receita, CAC, LTV, conversão e outras métricas essenciais.",
    badge: "Popular"
  },
  {
    icon: Users,
    title: "CRM Inteligente",
    description: "Gestão completa de leads e clientes com automações e funil de vendas otimizado.",
    badge: null
  },
  {
    icon: Zap,
    title: "Automações de Marketing",
    description: "E-mail marketing, WhatsApp e campanhas automatizadas baseadas no comportamento do cliente.",
    badge: null
  },
  {
    icon: GraduationCap,
    title: "Academia Growen",
    description: "Cursos, trilhas de aprendizado e certificações para acelerar o crescimento do seu negócio.",
    badge: null
  },
  {
    icon: Store,
    title: "Marketplace de Serviços",
    description: "Acesso a parceiros especializados em design, marketing, jurídico e outras áreas essenciais.",
    badge: null
  },
  {
    icon: MessageSquare,
    title: "GrowenBot",
    description: "Assistente de IA disponível 24/7 para responder dúvidas e fornecer insights estratégicos.",
    badge: "Beta"
  },
  {
    icon: ShieldCheck,
    title: "Conformidade LGPD",
    description: "Proteção total de dados com conformidade às leis de privacidade portuguesas e europeias.",
    badge: null
  }
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            Plataforma Completa
          </Badge>
          <h2 className="text-4xl font-bold mb-6">
            Feito Para{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Empresários Angolanos
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Soluções adaptadas à realidade do mercado angolano, com suporte local 
            e ferramentas que entendem os desafios únicos dos nossos empresários.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="relative hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/20"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 gradient-primary rounded-lg flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  {feature.badge && (
                    <Badge 
                      variant={feature.badge === "Novidade" ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {feature.badge}
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-8 max-w-4xl mx-auto border border-primary/20">
            <h3 className="text-2xl font-bold mb-4">
              Pronto para transformar seu negócio?
            </h3>
            <p className="text-muted-foreground mb-6">
              Comece com nosso diagnóstico gratuito e descubra como podemos acelerar seu crescimento
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a 
                href="#diagnostico" 
                className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Fazer Diagnóstico Grátis
              </a>
              <a 
                href="#planos" 
                className="inline-flex items-center justify-center px-6 py-3 border border-input bg-background rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                Ver Planos
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}