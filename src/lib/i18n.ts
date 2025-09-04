import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation resources for multi-market support
const resources = {
  'pt-AO': {
    translation: {
      // Navigation
      nav: {
        home: 'Início',
        about: 'Sobre',
        pricing: 'Preços',
        marketplace: 'Marketplace',
        diagnosis: 'Diagnóstico',
        login: 'Entrar',
        register: 'Registar',
        dashboard: 'Painel'
      },
      // Hero Section
      hero: {
        badge: 'Consultoria Inteligente com IA',
        title: 'Transforme o Seu Negócio em Angola',
        subtitle: 'Plataforma inteligente de gestão empresarial para empreendedores angolanos. Diagnósticos gratuitos, relatórios com IA, CRM e muito mais.',
        cta: {
          primary: 'Diagnóstico Gratuito - 100% Angolano',
          secondary: 'Ver Como Funciona'
        },
        benefits: [
          'Diagnóstico Empresarial Gratuito',
          'Relatórios com IA Generativa',
          'CRM e Automações',
          'Academia Online'
        ],
        trustBadge: 'Já usado por mais de 1.000 empreendedores angolanos'
      },
      // Features
      features: {
        title: 'Tudo o que precisa para fazer crescer o seu negócio',
        subtitle: 'Ferramentas completas para gestão empresarial adaptadas à realidade angolana',
        items: {
          diagnosis: {
            title: 'Diagnóstico Inteligente',
            description: 'Análise completa do seu negócio com recomendações personalizadas para o mercado angolano'
          },
          reports: {
            title: 'Relatórios com IA',
            description: 'Relatórios detalhados gerados automaticamente com insights e oportunidades de crescimento'
          },
          crm: {
            title: 'CRM Avançado',
            description: 'Gestão completa de clientes com automações e integração WhatsApp Business'
          },
          academy: {
            title: 'Academia Online',
            description: 'Cursos e formações especializadas para empreendedores angolanos'
          }
        }
      },
      // Market Selection
      market: {
        select: 'Selecionar Mercado',
        angola: 'Angola',
        brazil: 'Brasil',
        portugal: 'Portugal',
        currency: {
          'AOA': 'Kz',
          'BRL': 'R$',
          'EUR': '€'
        }
      },
      // Common
      common: {
        loading: 'A carregar...',
        error: 'Erro',
        success: 'Sucesso',
        cancel: 'Cancelar',
        save: 'Guardar',
        continue: 'Continuar',
        back: 'Voltar',
        next: 'Próximo',
        finish: 'Finalizar',
        download: 'Descarregar',
        share: 'Partilhar'
      }
    }
  },
  'pt-BR': {
    translation: {
      // Navigation
      nav: {
        home: 'Início',
        about: 'Sobre',
        pricing: 'Preços',
        marketplace: 'Marketplace',
        diagnosis: 'Diagnóstico',
        login: 'Entrar',
        register: 'Cadastrar',
        dashboard: 'Dashboard'
      },
      // Hero Section
      hero: {
        badge: 'Consultoria Inteligente com IA',
        title: 'Transforme o Seu Negócio no Brasil',
        subtitle: 'Plataforma inteligente de gestão empresarial para empreendedores brasileiros. Diagnósticos gratuitos, relatórios com IA, CRM e muito mais.',
        cta: {
          primary: 'Diagnóstico Gratuito - 100% Brasileiro',
          secondary: 'Ver Como Funciona'
        },
        benefits: [
          'Diagnóstico Empresarial Gratuito',
          'Relatórios com IA Generativa',
          'CRM e Automações',
          'Academia Online'
        ],
        trustBadge: 'Já usado por mais de 5.000 empreendedores brasileiros'
      },
      // Features
      features: {
        title: 'Tudo o que você precisa para fazer seu negócio crescer',
        subtitle: 'Ferramentas completas para gestão empresarial adaptadas ao mercado brasileiro',
        items: {
          diagnosis: {
            title: 'Diagnóstico Inteligente',
            description: 'Análise completa do seu negócio com recomendações personalizadas para o mercado brasileiro'
          },
          reports: {
            title: 'Relatórios com IA',
            description: 'Relatórios detalhados gerados automaticamente com insights e oportunidades de crescimento'
          },
          crm: {
            title: 'CRM Avançado',
            description: 'Gestão completa de clientes com automações e integração WhatsApp Business'
          },
          academy: {
            title: 'Academia Online',
            description: 'Cursos e formações especializadas para empreendedores brasileiros'
          }
        }
      },
      // Market Selection
      market: {
        select: 'Selecionar Mercado',
        angola: 'Angola',
        brazil: 'Brasil',
        portugal: 'Portugal',
        currency: {
          'AOA': 'Kz',
          'BRL': 'R$',
          'EUR': '€'
        }
      },
      // Common
      common: {
        loading: 'Carregando...',
        error: 'Erro',
        success: 'Sucesso',
        cancel: 'Cancelar',
        save: 'Salvar',
        continue: 'Continuar',
        back: 'Voltar',
        next: 'Próximo',
        finish: 'Finalizar',
        download: 'Baixar',
        share: 'Compartilhar'
      }
    }
  },
  'pt-PT': {
    translation: {
      // Navigation
      nav: {
        home: 'Início',
        about: 'Sobre',
        pricing: 'Preços',
        marketplace: 'Marketplace',
        diagnosis: 'Diagnóstico',
        login: 'Entrar',
        register: 'Registar',
        dashboard: 'Painel'
      },
      // Hero Section
      hero: {
        badge: 'Consultoria Inteligente com IA',
        title: 'Transforme o Seu Negócio em Portugal',
        subtitle: 'Plataforma inteligente de gestão empresarial para empreendedores portugueses. Diagnósticos gratuitos, relatórios com IA, CRM e muito mais.',
        cta: {
          primary: 'Diagnóstico Gratuito - 100% Português',
          secondary: 'Ver Como Funciona'
        },
        benefits: [
          'Diagnóstico Empresarial Gratuito',
          'Relatórios com IA Generativa',
          'CRM e Automações',
          'Academia Online'
        ],
        trustBadge: 'Já usado por mais de 2.000 empreendedores portugueses'
      },
      // Features
      features: {
        title: 'Tudo o que precisa para fazer crescer o seu negócio',
        subtitle: 'Ferramentas completas para gestão empresarial adaptadas ao mercado português',
        items: {
          diagnosis: {
            title: 'Diagnóstico Inteligente',
            description: 'Análise completa do seu negócio com recomendações personalizadas para o mercado português'
          },
          reports: {
            title: 'Relatórios com IA',
            description: 'Relatórios detalhados gerados automaticamente com insights e oportunidades de crescimento'
          },
          crm: {
            title: 'CRM Avançado',
            description: 'Gestão completa de clientes com automações e integração WhatsApp Business'
          },
          academy: {
            title: 'Academia Online',
            description: 'Cursos e formações especializadas para empreendedores portugueses'
          }
        }
      },
      // Market Selection
      market: {
        select: 'Seleccionar Mercado',
        angola: 'Angola',
        brazil: 'Brasil',
        portugal: 'Portugal',
        currency: {
          'AOA': 'Kz',
          'BRL': 'R$',
          'EUR': '€'
        }
      },
      // Common
      common: {
        loading: 'A carregar...',
        error: 'Erro',
        success: 'Sucesso',
        cancel: 'Cancelar',
        save: 'Guardar',
        continue: 'Continuar',
        back: 'Voltar',
        next: 'Próximo',
        finish: 'Finalizar',
        download: 'Descarregar',
        share: 'Partilhar'
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