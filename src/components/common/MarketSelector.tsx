import React from 'react';
import { useTranslation } from 'react-i18next';
import { useMarket, type Market } from '@/contexts/MarketContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Globe } from 'lucide-react';

export const MarketSelector: React.FC = () => {
  const { t } = useTranslation();
  const { currentMarket, marketConfig, setMarket, getMarketConfigs } = useMarket();
  const marketConfigs = getMarketConfigs();

  const handleMarketChange = (market: Market) => {
    setMarket(market);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{marketConfig.flag} {marketConfig.name}</span>
          <span className="sm:hidden">{marketConfig.flag}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {Object.values(marketConfigs).map((config) => (
          <DropdownMenuItem
            key={config.code}
            onClick={() => handleMarketChange(config.code)}
            className={`cursor-pointer ${
              currentMarket === config.code ? 'bg-accent' : ''
            }`}
          >
            <span className="mr-2">{config.flag}</span>
            <div className="flex flex-col">
              <span className="font-medium">{config.name}</span>
              <span className="text-xs text-muted-foreground">
                {config.currencySymbol} • {config.timezone.split('/')[1]}
              </span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};