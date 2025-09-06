import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { Phone, Mail } from "lucide-react";
export function Header() {
  const {
    t
  } = useTranslation();
  return <header className="sticky top-0 z-50 glass-effect border-b border-border/10">
      {/* Top bar */}
      <div className="bg-primary/5 py-2">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1 text-muted-foreground">
                <Phone className="w-3 h-3" />
                +244 xxx xxx xxx
              </span>
              <span className="flex items-center gap-1 text-muted-foreground">
                <Mail className="w-3 h-3" />
                info@growen.ao
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">🇦🇴</Badge>
              <Badge variant="secondary" className="text-xs">
                Suporte 24/7
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">G</span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold gradient-text">Growen</span>
              <span className="text-xs text-muted-foreground font-light">Smart Business Consulting</span>
            </div>
          </Link>

          {/* Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            <Link to="/sobre" className="text-muted-foreground hover:text-primary transition-colors font-medium">
              {t('nav.about')}
            </Link>
            <Link to="/planos" className="text-muted-foreground hover:text-primary transition-colors font-medium">
              {t('nav.pricing')}
            </Link>
            <Link to="/parceiros" className="text-muted-foreground hover:text-primary transition-colors font-medium">
              {t('nav.marketplace')}
            </Link>
            <a 
              href="#diagnostico" 
              className="text-primary hover:text-primary/80 transition-colors font-medium"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('diagnostico')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              {t('nav.diagnosis')}
            </a>
          </div>

          {/* CTA Buttons */}
          <div className="flex items-center space-x-3">
            <Link to="/login">
              <Button variant="outline" size="sm" className="glass-effect">
                {t('nav.login')}
              </Button>
            </Link>
            <Button 
              size="sm" 
              className="gradient-primary text-white shadow-lg hover:scale-105 transition-transform"
              onClick={() => document.getElementById('diagnostico')?.scrollIntoView({ behavior: 'smooth' })}
            >
              {t('nav.diagnosis')} Grátis
            </Button>
          </div>
        </nav>
      </div>
    </header>;
}