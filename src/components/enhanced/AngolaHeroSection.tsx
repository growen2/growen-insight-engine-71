import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Star, Shield, Award } from "lucide-react";
import { useMarket } from '@/contexts/MarketContext';
export function AngolaHeroSection() {
  const {
    t
  } = useTranslation();
  const {
    marketConfig
  } = useMarket();
  const scrollToDiagnostic = () => {
    const diagnosticSection = document.getElementById('diagnostico');
    if (diagnosticSection) {
      diagnosticSection.scrollIntoView({
        behavior: 'smooth'
      });
    }
  };
  return <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000" />
      
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
            <Badge variant="secondary" className="flex items-center gap-2 px-4 py-2">
              <Shield className="w-4 h-4" />
              {t('hero.badge')}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-2 px-4 py-2">
              <Star className="w-4 h-4 text-yellow-500" />
              Classificação 4.9/5
            </Badge>
            <Badge variant="outline" className="flex items-center gap-2 px-4 py-2">
              <Award className="w-4 h-4 text-primary" />
              {t('hero.localBadge')}
            </Badge>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            {t('hero.title')}
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
            {t('hero.subtitle')}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="text-lg px-8 py-6 gradient-primary text-white hover:scale-105 transition-transform shadow-lg" onClick={scrollToDiagnostic}>
              {t('hero.cta.primary')}
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="text-lg px-8 py-6 glass-effect hover:scale-105 transition-transform"
              onClick={() => window.location.href = '/como-usar'}
            >
              Conhecer a Plataforma
            </Button>
          </div>

          {/* Benefits Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {(t('hero.benefits', {
            returnObjects: true
          }) as string[]).map((benefit, index) => <div key={index} className="glass-card p-6 hover:scale-105 transition-transform">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                  <span className="text-left font-medium">{benefit}</span>
                </div>
              </div>)}
          </div>

          {/* Trust Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-12 border-t border-border/20">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">2.500+</div>
              <div className="text-sm text-muted-foreground">Empresários Angolanos</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">98%</div>
              <div className="text-sm text-muted-foreground">Taxa de Satisfação</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">Kz 2.8M</div>
              <div className="text-sm text-muted-foreground">Receita média gerada</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">24/7</div>
              <div className="text-sm text-muted-foreground">Suporte em Português</div>
            </div>
          </div>

          {/* Local Trust Badge */}
          <div className="mt-12 p-6 glass-effect rounded-2xl">
            <p className="text-lg font-medium text-primary">
              {marketConfig.trustMetric}
            </p>
            
          </div>
        </div>
      </div>
    </section>;
}