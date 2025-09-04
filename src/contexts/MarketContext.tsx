import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export type Market = 'angola' | 'brazil' | 'portugal';

export interface MarketConfig {
  code: Market;
  name: string;
  currency: 'AOA' | 'BRL' | 'EUR';
  currencySymbol: string;
  locale: string;
  flag: string;
  timezone: string;
  businessHours: string;
  paymentMethods: string[];
  regulations: string[];
}

const marketConfigs: Record<Market, MarketConfig> = {
  angola: {
    code: 'angola',
    name: 'Angola',
    currency: 'AOA',
    currencySymbol: 'Kz',
    locale: 'pt-AO',
    flag: '🇦🇴',
    timezone: 'Africa/Luanda',
    businessHours: '08:00-17:00',
    paymentMethods: ['Multicaixa', 'Transferência Bancária', 'Dinheiro'],
    regulations: ['Lei de Proteção de Dados de Angola', 'Código Comercial Angolano']
  },
  brazil: {
    code: 'brazil',
    name: 'Brasil',
    currency: 'BRL',
    currencySymbol: 'R$',
    locale: 'pt-BR',
    flag: '🇧🇷',
    timezone: 'America/Sao_Paulo',
    businessHours: '08:00-18:00',
    paymentMethods: ['PIX', 'Cartão de Crédito', 'Boleto', 'Transferência'],
    regulations: ['LGPD', 'Marco Civil da Internet', 'Código de Defesa do Consumidor']
  },
  portugal: {
    code: 'portugal',
    name: 'Portugal',
    currency: 'EUR',
    currencySymbol: '€',
    locale: 'pt-PT',
    flag: '🇵🇹',
    timezone: 'Europe/Lisbon',
    businessHours: '09:00-18:00',
    paymentMethods: ['MB Way', 'Multibanco', 'Cartão de Crédito', 'SEPA'],
    regulations: ['RGPD', 'Código da Publicidade', 'Lei do Comércio Electrónico']
  }
};

interface MarketContextType {
  currentMarket: Market;
  marketConfig: MarketConfig;
  setMarket: (market: Market) => void;
  formatCurrency: (amount: number) => string;
  getMarketConfigs: () => Record<Market, MarketConfig>;
}

const MarketContext = createContext<MarketContextType | undefined>(undefined);

export const useMarket = () => {
  const context = useContext(MarketContext);
  if (!context) {
    throw new Error('useMarket must be used within a MarketProvider');
  }
  return context;
};

interface MarketProviderProps {
  children: React.ReactNode;
}

export const MarketProvider: React.FC<MarketProviderProps> = ({ children }) => {
  const { i18n } = useTranslation();
  const [currentMarket, setCurrentMarket] = useState<Market>('angola');
  
  // Initialize market from localStorage or browser language
  useEffect(() => {
    const savedMarket = localStorage.getItem('growen-market') as Market;
    const browserLang = navigator.language;
    
    let initialMarket: Market = 'angola';
    
    if (savedMarket && marketConfigs[savedMarket]) {
      initialMarket = savedMarket;
    } else if (browserLang.includes('BR')) {
      initialMarket = 'brazil';
    } else if (browserLang.includes('PT')) {
      initialMarket = 'portugal';
    }
    
    setCurrentMarket(initialMarket);
    i18n.changeLanguage(marketConfigs[initialMarket].locale);
  }, [i18n]);

  const setMarket = (market: Market) => {
    setCurrentMarket(market);
    localStorage.setItem('growen-market', market);
    i18n.changeLanguage(marketConfigs[market].locale);
  };

  const formatCurrency = (amount: number): string => {
    const config = marketConfigs[currentMarket];
    try {
      return new Intl.NumberFormat(config.locale, {
        style: 'currency',
        currency: config.currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    } catch {
      return `${config.currencySymbol} ${amount.toLocaleString()}`;
    }
  };

  const getMarketConfigs = () => marketConfigs;

  const value: MarketContextType = {
    currentMarket,
    marketConfig: marketConfigs[currentMarket],
    setMarket,
    formatCurrency,
    getMarketConfigs,
  };

  return (
    <MarketContext.Provider value={value}>
      {children}
    </MarketContext.Provider>
  );
};