import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ModernCard } from '@/components/enhanced/ModernCard';
import { Button } from '@/components/ui/button';
import { 
  Brain, 
  FileText, 
  Users2, 
  GraduationCap, 
  BarChart3, 
  Shield, 
  Zap, 
  Globe,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

const features = [
  {
    icon: Brain,
    key: 'diagnosis',
    color: 'text-primary',
    benefits: ['Análise em tempo real', 'IA personalizada', 'Relatórios detalhados']
  },
  {
    icon: FileText,
    key: 'reports',
    color: 'text-secondary',
    benefits: ['Download em PDF', 'Gráficos interativos', 'Recomendações práticas']
  },
  {
    icon: Users2,
    key: 'crm',
    color: 'text-accent',
    benefits: ['Gestão completa', 'Automações inteligentes', 'WhatsApp integrado']
  },
  {
    icon: GraduationCap,
    key: 'academy',
    color: 'text-info',
    benefits: ['Cursos especializados', 'Certificações', 'Comunidade ativa']
  },
];

const additionalFeatures = [
  {
    icon: BarChart3,
    title: 'Analytics Avançado',
    description: 'Dashboards personalizáveis com métricas em tempo real',
    color: 'text-primary'
  },
  {
    icon: Shield,
    title: 'Segurança Total',
    description: 'Dados protegidos com criptografia de nível empresarial',
    color: 'text-secondary'
  },
  {
    icon: Zap,
    title: 'Automações',
    description: 'Workflows inteligentes que economizam tempo',
    color: 'text-accent'
  },
  {
    icon: Globe,
    title: 'Multi-Mercado',
    description: 'Adaptado para Angola, Brasil e Portugal',
    color: 'text-info'
  },
];

export const ModernFeaturesSection: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section id="features-section" className="py-24 bg-gradient-to-br from-background via-muted/10 to-primary/5">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gradient-primary">
            {t('features.title')}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t('features.subtitle')}
          </p>
        </motion.div>

        {/* Main Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <ModernCard variant="glass" hover animate className="h-full group cursor-pointer">
                  <div className="text-center p-2">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={`w-8 h-8 ${feature.color}`} />
                    </div>
                    
                    <h3 className="text-xl font-bold mb-4 group-hover:text-gradient-primary transition-all">
                      {t(`features.items.${feature.key}.title`)}
                    </h3>
                    
                    <p className="text-muted-foreground mb-6 leading-relaxed">
                      {t(`features.items.${feature.key}.description`)}
                    </p>

                    <div className="space-y-2">
                      {feature.benefits.map((benefit, benefitIndex) => (
                        <div key={benefitIndex} className="flex items-center justify-center gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-primary" />
                          <span>{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </ModernCard>
              </motion.div>
            );
          })}
        </div>

        {/* Additional Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h3 className="text-3xl font-bold text-center mb-12">Recursos Adicionais</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {additionalFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <ModernCard variant="default" hover className="text-center p-6 group">
                    <Icon className={`w-10 h-10 ${feature.color} mx-auto mb-4 group-hover:scale-110 transition-transform`} />
                    <h4 className="font-semibold mb-2">{feature.title}</h4>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </ModernCard>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <ModernCard variant="gradient" className="max-w-4xl mx-auto p-12">
            <h3 className="text-3xl font-bold mb-6">Pronto para Transformar o Seu Negócio?</h3>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Junte-se a milhares de empresários que já estão usando a nossa plataforma para crescer os seus negócios.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="premium" className="group">
                Começar Agora - É Grátis
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="outline">
                Ver Demonstração
              </Button>
            </div>
          </ModernCard>
        </motion.div>
      </div>
    </section>
  );
};