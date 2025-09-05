import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

// Angola-only configuration
export interface MarketConfig {
  name: string;
  currency: 'AOA';
  currencySymbol: string;
  locale: string;
  flag: string;
  timezone: string;
  businessHours: string;
  paymentMethods: string[];
  regulations: string[];
  trustMetric: string;
  localPartners: string[];
}

const angolaConfig: MarketConfig = {
  name: 'Angola',
  currency: 'AOA',
  currencySymbol: 'Kz',
  locale: 'pt-AO',
  flag: '🇦🇴',
  timezone: 'Africa/Luanda',
  businessHours: '08:00-17:00',
  paymentMethods: ['Multicaixa', 'Transferência Bancária', 'Dinheiro', 'Angola Expresso'],
  regulations: ['Lei de Proteção de Dados de Angola', 'Código Comercial Angolano', 'Lei do Investimento Privado'],
  trustMetric: 'Já usado por mais de 2.500 empreendedores angolanos',
  localPartners: ['BFA', 'BAI', 'Multicaixa', 'Angola Expresso', 'Fundação Lwini']
};

interface MarketContextType {
  marketConfig: MarketConfig;
  formatCurrency: (amount: number) => string;
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
  
  // Initialize Angola locale
  useEffect(() => {
    i18n.changeLanguage(angolaConfig.locale);
  }, [i18n]);

  const formatCurrency = (amount: number): string => {
    try {
      return new Intl.NumberFormat(angolaConfig.locale, {
        style: 'currency',
        currency: angolaConfig.currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    } catch {
      return `${angolaConfig.currencySymbol} ${amount.toLocaleString()}`;
    }
  };

  const value: MarketContextType = {
    marketConfig: angolaConfig,
    formatCurrency,
  };

  return (
    <MarketContext.Provider value={value}>
      {children}
    </MarketContext.Provider>
  );
};