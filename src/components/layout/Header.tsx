import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

export function Header() {
  return (
    <header className="sticky top-0 z-50 glass-effect">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">G</span>
            </div>
            <span className="text-2xl font-bold text-primary">Growen</span>
            <Badge variant="secondary" className="ml-2 text-xs">
              Smart Business
            </Badge>
          </Link>

          {/* Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/sobre" className="text-muted-foreground hover:text-primary transition-colors">
              Sobre
            </Link>
            <Link to="/precos" className="text-muted-foreground hover:text-primary transition-colors">
              Preços
            </Link>
            <Link to="/marketplace" className="text-muted-foreground hover:text-primary transition-colors">
              Marketplace
            </Link>
            <a href="#diagnostico" className="text-muted-foreground hover:text-primary transition-colors">
              Diagnóstico
            </a>
          </div>

          {/* CTA Buttons */}
          <div className="flex items-center space-x-3">
            <Link to="/login">
              <Button variant="outline" size="sm">
                Entrar
              </Button>
            </Link>
            <a href="#diagnostico">
              <Button size="sm" className="gradient-primary text-white">
                Diagnóstico Grátis
              </Button>
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
}