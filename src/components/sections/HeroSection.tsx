import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle, TrendingUp } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 gradient-hero opacity-10"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <Badge variant="secondary" className="mb-6 inline-flex items-center space-x-2">
            <TrendingUp className="w-4 h-4" />
            <span>Consultoria Inteligente com IA</span>
          </Badge>

          {/* Headline */}
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Transforme o Seu{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Negócio em Angola
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            A primeira plataforma angolana de gestão empresarial inteligente. 
            Desenvolvida especialmente para micro e pequenos empresários que querem 
            crescer no mercado angolano com tecnologia de ponta.
          </p>

          {/* Benefits */}
          <div className="flex flex-wrap justify-center gap-4 mb-10">
            {[
              "Diagnóstico Empresarial Gratuito",
              "Relatórios com IA Generativa",
              "CRM e Automações",
              "Academia Online"
            ].map((benefit) => (
              <div key={benefit} className="flex items-center space-x-2 bg-card px-4 py-2 rounded-full border">
                <CheckCircle className="w-4 h-4 text-secondary" />
                <span className="text-sm font-medium">{benefit}</span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" className="gradient-primary text-white px-8 py-3 text-lg">
              Diagnóstico Gratuito - 100% Angolano
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button variant="outline" size="lg" className="px-8 py-3 text-lg">
              Ver Como Funciona
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="mt-12 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Usado por mais de 200+ empresários angolanos em Luanda, Benguela e Huambo
            </p>
            <div className="flex justify-center items-center space-x-8 opacity-60">
              {/* Placeholder for company logos */}
              <div className="w-20 h-8 bg-muted rounded"></div>
              <div className="w-20 h-8 bg-muted rounded"></div>
              <div className="w-20 h-8 bg-muted rounded"></div>
              <div className="w-20 h-8 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}