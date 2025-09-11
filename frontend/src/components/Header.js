import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import { Menu, X, User, LogOut, Settings, CreditCard, MessageCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Header = ({ variant = 'default' }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Close menus when route changes
  useEffect(() => {
    setIsMenuOpen(false);
    setShowUserMenu(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { to: '/', label: 'Início' },
    { to: '/sobre', label: 'Sobre' },
    { to: '/como-usar', label: 'Como Usar' },
    { to: '/parceiros', label: 'Parceiros' },
    { to: '/contatos', label: 'Contatos' }
  ];

  const whatsappNumber = "+244943201590";
  const whatsappMessage = encodeURIComponent("Olá! Gostaria de consultoria especializada através da Growen - Smart Business Consulting");
  const whatsappUrl = `https://wa.me/${whatsappNumber.replace('+', '')}?text=${whatsappMessage}`;

  return (
    <header className={`sticky top-0 z-50 ${variant === 'dashboard' ? 'bg-white border-b' : 'bg-white/95 backdrop-blur-sm border-b shadow-sm'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">G</span>
            </div>
            <span className="text-2xl font-bold text-slate-900">Growen</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-slate-600 hover:text-emerald-600 transition-colors ${
                  location.pathname === link.to ? 'text-emerald-600 font-medium' : ''
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* WhatsApp Button */}
            <Button
              onClick={() => window.open(whatsappUrl, '_blank')}
              variant="outline"
              size="sm"
              className="text-green-600 border-green-600 hover:bg-green-600 hover:text-white"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              WhatsApp
            </Button>

            {user ? (
              <div className="relative">
                <Button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <User className="w-4 h-4" />
                  <span className="max-w-32 truncate">{user.name}</span>
                </Button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border">
                    <Link
                      to="/dashboard"
                      className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                    >
                      <User className="w-4 h-4 mr-2" />
                      Dashboard
                    </Link>
                    
                    <Link
                      to="/dashboard/configuracoes"
                      className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Configurações
                    </Link>
                    
                    <Link
                      to="/dashboard/planos"
                      className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      Planos
                    </Link>

                    {user.is_admin && (
                      <Link
                        to="/admin"
                        className="flex items-center px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Admin Panel
                      </Link>
                    )}

                    <hr className="my-1" />
                    
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sair
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => navigate('/auth')}
                  variant="outline"
                >
                  Entrar
                </Button>
                <Button
                  onClick={() => navigate('/auth')}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  Cadastrar
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              variant="ghost"
              size="sm"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`block px-3 py-2 text-slate-600 hover:text-emerald-600 hover:bg-slate-50 rounded-md ${
                    location.pathname === link.to ? 'text-emerald-600 bg-emerald-50 font-medium' : ''
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              
              <hr className="my-2" />
              
              {/* Mobile WhatsApp */}
              <button
                onClick={() => window.open(whatsappUrl, '_blank')}
                className="flex items-center px-3 py-2 text-green-600 hover:bg-green-50 rounded-md"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                WhatsApp
              </button>

              {user ? (
                <div className="pt-2">
                  <div className="px-3 py-2 text-sm font-medium text-slate-700 border-b">
                    {user.name}
                  </div>
                  <Link
                    to="/dashboard"
                    className="flex items-center px-3 py-2 text-slate-600 hover:bg-slate-50 rounded-md"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Dashboard
                  </Link>
                  <Link
                    to="/dashboard/configuracoes"
                    className="flex items-center px-3 py-2 text-slate-600 hover:bg-slate-50 rounded-md"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Configurações
                  </Link>
                  <Link
                    to="/dashboard/planos"
                    className="flex items-center px-3 py-2 text-slate-600 hover:bg-slate-50 rounded-md"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Planos
                  </Link>
                  {user.is_admin && (
                    <Link
                      to="/admin"
                      className="flex items-center px-3 py-2 text-red-600 hover:bg-red-50 rounded-md"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-3 py-2 text-red-600 hover:bg-red-50 rounded-md"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sair
                  </button>
                </div>
              ) : (
                <div className="pt-2 space-y-2">
                  <Button
                    onClick={() => navigate('/auth')}
                    variant="outline"
                    className="w-full"
                  >
                    Entrar
                  </Button>
                  <Button
                    onClick={() => navigate('/auth')}
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                  >
                    Cadastrar
                  </Button>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;