import React from 'react';
import { useTranslation } from 'react-i18next';
import { useMarket } from '@/contexts/MarketContext';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, CheckCircle, Star, Users, TrendingUp } from 'lucide-react';

const trustLogos = [
  { name: 'Angola Telecom', logo: '/placeholder.svg' },
  { name: 'BFA', logo: '/placeholder.svg' },
  { name: 'Sonangol', logo: '/placeholder.svg' },
  { name: 'TAAG', logo: '/placeholder.svg' },
];

export const ModernHeroSection: React.FC = () => {
  const { t } = useTranslation();
  const { marketConfig } = useMarket();

  const benefits = [
    t('hero.benefits.0'),
    t('hero.benefits.1'),
    t('hero.benefits.2'),
    t('hero.benefits.3'),
  ];

  const handleScrollToDiagnosis = () => {
    const diagnosisSection = document.getElementById('diagnosis-section');
    if (diagnosisSection) {
      diagnosisSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLearnMore = () => {
    const featuresSection = document.getElementById('features-section');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Modern Gradient Background */}
      <div className="absolute inset-0 gradient-hero opacity-80" />
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-primary/10 blur-3xl animate-pulse" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-secondary/10 blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-accent/5 blur-2xl animate-pulse delay-500" />
      </div>

      {/* Glass Overlay */}
      <div className="absolute inset-0 backdrop-blur-[1px] bg-background/10" />

      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <Badge variant="secondary" className="px-6 py-2 text-sm font-medium glass-effect">
              <Star className="w-4 h-4 mr-2" />
              {t('hero.badge')}
            </Badge>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
          >
            <span className="text-gradient-hero">{t('hero.title')}</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-4xl mx-auto leading-relaxed"
          >
            {t('hero.subtitle')}
          </motion.p>

          {/* Benefits Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12"
          >
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                className="glass-card p-4 hover-lift"
              >
                <CheckCircle className="w-6 h-6 text-primary mb-2 mx-auto" />
                <p className="text-sm font-medium">{benefit}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.0 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          >
            <Button
              size="xl"
              variant="premium"
              onClick={handleScrollToDiagnosis}
              className="group"
            >
              {t('hero.cta.primary')}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <Button
              size="xl"
              variant="glass"
              onClick={handleLearnMore}
              className="group"
            >
              {t('hero.cta.secondary')}
              <TrendingUp className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </Button>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="space-y-8"
          >
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-gradient-primary mb-2">5,000+</div>
                <p className="text-sm text-muted-foreground">Empresários Atendidos</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gradient-primary mb-2">95%</div>
                <p className="text-sm text-muted-foreground">Taxa de Satisfação</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gradient-primary mb-2">24h</div>
                <p className="text-sm text-muted-foreground">Relatórios Gerados</p>
              </div>
            </div>

            {/* Trust Badge */}
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Users className="w-5 h-5" />
              <span className="text-lg font-medium">{t('hero.trustBadge')}</span>
            </div>

            {/* Partner Logos */}
            <div className="flex items-center justify-center gap-8 opacity-60 grayscale hover:opacity-80 hover:grayscale-0 transition-all duration-500">
              {trustLogos.map((logo, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 1.4 + index * 0.1 }}
                  className="w-16 h-16 flex items-center justify-center"
                >
                  <img
                    src={logo.logo}
                    alt={logo.name}
                    className="max-w-full max-h-full object-contain filter brightness-0 invert"
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.6 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 border-2 border-muted-foreground/30 rounded-full flex justify-center"
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1 h-3 bg-muted-foreground/60 rounded-full mt-2"
          />
        </motion.div>
      </motion.div>
    </section>
  );
};