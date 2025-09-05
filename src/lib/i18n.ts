import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Angola-focused translation resources
const resources = {
  'pt-AO': {
    translation: {
      // Navigation
      nav: {
        home: 'Início',
        about: 'Sobre Nós',
        pricing: 'Planos',
        marketplace: 'Parceiros',
        diagnosis: 'Diagnóstico Grátis',
        login: 'Entrar',
        register: 'Registar',
        dashboard: 'Painel',
        contact: 'Contacto',
        testimonials: 'Testemunhos'
      },
      // Hero Section
      hero: {
        badge: 'Liderança em Consultoria Empresarial em Angola',
        title: 'Transforme o Seu Negócio com Tecnologia Angolana',
        subtitle: 'A primeira plataforma 100% angolana de gestão empresarial inteligente. Diagnósticos gratuitos, relatórios avançados com IA, CRM profissional e muito mais para fazer o seu negócio crescer em Angola.',
        cta: {
          primary: 'Diagnóstico Gratuito - Feito em Angola',
          secondary: 'Conhecer a Plataforma'
        },
        benefits: [
          'Diagnóstico Empresarial Profissional e Gratuito',
          'Relatórios Inteligentes com IA Generativa',
          'CRM Completo com Automações Locais',
          'Academia Empresarial Angolana',
          'Parceria com Instituições Financeiras'
        ],
        trustBadge: 'Plataforma de confiança de mais de 2.500 empresários angolanos',
        localBadge: 'Desenvolvido em Angola, para Angola'
      },
      // Features
      features: {
        title: 'Tecnologia Avançada Adaptada à Realidade Angolana',
        subtitle: 'Soluções completas e profissionais para empresários que querem crescer no mercado angolano',
        items: {
          diagnosis: {
            title: 'Diagnóstico Empresarial Inteligente',
            description: 'Análise profunda e detalhada do seu negócio com recomendações específicas para o mercado angolano e oportunidades locais'
          },
          reports: {
            title: 'Relatórios Avançados com IA',
            description: 'Relatórios executivos completos, gerados por inteligência artificial, com insights de mercado e estratégias de crescimento'
          },
          crm: {
            title: 'CRM Profissional Angolano',
            description: 'Sistema de gestão de clientes com integração Multicaixa, WhatsApp Business e automações adaptadas ao contexto angolano'
          },
          academy: {
            title: 'Academia Empresarial Online',
            description: 'Formação especializada com mentores angolanos e conteúdos focados no empreendedorismo local'
          },
          marketplace: {
            title: 'Rede de Parceiros Locais',
            description: 'Conecte-se com fornecedores, consultores e especialistas certificados em Angola'
          },
          compliance: {
            title: 'Conformidade Legal Angolana',
            description: 'Mantenha-se sempre em conformidade com as leis e regulamentações empresariais de Angola'
          }
        }
      },
      // Pricing
      pricing: {
        title: 'Planos Pensados para Empresários Angolanos',
        subtitle: 'Escolha o plano ideal para o seu negócio, com preços justos em Kwanzas',
        starter: {
          name: 'Starter',
          price: '45.000',
          features: [
            'Diagnóstico mensal gratuito',
            'Relatórios básicos com IA',
            'CRM para até 100 clientes',
            'Suporte via WhatsApp',
            'Integração Multicaixa'
          ]
        },
        professional: {
          name: 'Profissional',
          price: '95.000',
          popular: true,
          features: [
            'Tudo do plano Starter',
            'Relatórios avançados ilimitados',
            'CRM para até 1.000 clientes',
            'Automações de marketing',
            'Academia empresarial',
            'Suporte prioritário',
            'Consultoria mensal'
          ]
        },
        enterprise: {
          name: 'Empresarial',
          price: '185.000',
          features: [
            'Tudo do plano Profissional',
            'CRM ilimitado',
            'API personalizada',
            'Gestor de conta dedicado',
            'Relatórios personalizados',
            'Integração com bancos angolanos',
            'Consultoria semanal'
          ]
        }
      },
      // Common
      common: {
        loading: 'A carregar...',
        error: 'Erro',
        success: 'Sucesso!',
        cancel: 'Cancelar',
        save: 'Guardar',
        continue: 'Continuar',
        back: 'Voltar',
        next: 'Próximo',
        finish: 'Finalizar',
        download: 'Descarregar',
        share: 'Partilhar',
        getStarted: 'Começar Agora',
        learnMore: 'Saber Mais',
        inDevelopment: 'Em Desenvolvimento',
        comingSoon: 'Brevemente',
        currency: 'Kz',
        perMonth: '/mês',
        popular: 'Mais Popular'
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'pt-AO',
    debug: false,
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage']
    }
  });

export default i18n;