import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';

// Import UI components
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from './components/ui/avatar';
import { Textarea } from './components/ui/textarea';
import { Separator } from './components/ui/separator';
import { AlertCircle, TrendingUp, Users, MessageSquare, FileText, BarChart3, CreditCard, LogOut, Menu, X, ChevronRight, Star, CheckCircle, Zap, Brain, Target, DollarSign, UserPlus, Activity } from 'lucide-react';
import { toast, Toaster } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Auth Context
const AuthContext = React.createContext();

const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('growen_token');
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem('growen_token');
      const response = await axios.get(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data);
    } catch (error) {
      localStorage.removeItem('growen_token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API}/auth/login`, { email, password });
      localStorage.setItem('growen_token', response.data.token);
      setUser(response.data.user);
      toast.success('Login realizado com sucesso!');
      return true;
    } catch (error) {
      toast.error('Credenciais inválidas');
      return false;
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await axios.post(`${API}/auth/register`, { name, email, password });
      localStorage.setItem('growen_token', response.data.token);
      setUser(response.data.user);
      toast.success('Conta criada com sucesso!');
      return true;
    } catch (error) {
      toast.error('Erro ao criar conta');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('growen_token');
    setUser(null);
    toast.success('Logout realizado com sucesso!');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// Landing Page Component
const LandingPage = () => {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">G</span>
                </div>
                <span className="ml-2 text-xl font-bold text-slate-900">Growen</span>
              </div>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-slate-600 hover:text-emerald-600 transition-colors">Recursos</a>
              <a href="#pricing" className="text-slate-600 hover:text-emerald-600 transition-colors">Preços</a>
              <a href="#about" className="text-slate-600 hover:text-emerald-600 transition-colors">Sobre</a>
              <Button variant="outline" onClick={() => window.location.href = '#auth'}>
                Entrar
              </Button>
              <Button onClick={() => window.location.href = '#auth'} className="bg-emerald-600 hover:bg-emerald-700">
                Começar Grátis
              </Button>
            </div>

            <div className="md:hidden flex items-center">
              <Button variant="ghost" size="sm" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
              <a href="#features" className="block px-3 py-2 text-slate-600 hover:text-emerald-600">Recursos</a>
              <a href="#pricing" className="block px-3 py-2 text-slate-600 hover:text-emerald-600">Preços</a>
              <a href="#about" className="block px-3 py-2 text-slate-600 hover:text-emerald-600">Sobre</a>
              <div className="px-3 py-2">
                <Button variant="outline" className="w-full mb-2" onClick={() => window.location.href = '#auth'}>
                  Entrar
                </Button>
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={() => window.location.href = '#auth'}>
                  Começar Grátis
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-emerald-100 text-emerald-800 text-sm font-medium mb-6">
                <Zap className="w-4 h-4 mr-2" />
                Inteligência Artificial para PMEs
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
                Smart Business 
                <span className="text-emerald-600"> Consulting</span>
              </h1>
              
              <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                Democratize consultoria de negócios através de IA, automação e insights acessíveis. 
                Acelere o crescimento da sua empresa com relatórios instantâneos e CRM inteligente.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-lg px-8" onClick={() => window.location.href = '#auth'}>
                  Criar Conta Grátis
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8">
                  Ver Demo
                </Button>
              </div>
              
              <div className="flex items-center space-x-6 text-sm text-slate-500">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-emerald-600 mr-2" />
                  Teste gratuito
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-emerald-600 mr-2" />
                  Sem cartão de crédito
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-emerald-600 mr-2" />
                  Setup em 5 minutos
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-blue-500 rounded-3xl blur-3xl opacity-20"></div>
              <img 
                src="https://images.unsplash.com/39/lIZrwvbeRuuzqOoWJUEn_Photoaday_CSD%20%281%20of%201%29-5.jpg?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2Mzl8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMGNvbnN1bHRpbmd8ZW58MHx8fHwxNzU3NjE5MjkwfDA&ixlib=rb-4.1.0&q=85"
                alt="Business Team"
                className="relative rounded-3xl shadow-2xl w-full h-96 object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Tudo que sua empresa precisa para crescer
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Ferramentas poderosas de IA e automação para transformar sua gestão empresarial
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="p-6 hover:shadow-lg transition-shadow border-0 shadow-md">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                <Brain className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Consultoria IA</h3>
              <p className="text-slate-600">
                Chat inteligente com IA especializada em negócios. Obtenha respostas personalizadas para suas estratégias.
              </p>
            </Card>
            
            <Card className="p-6 hover:shadow-lg transition-shadow border-0 shadow-md">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Relatórios Automáticos</h3>
              <p className="text-slate-600">
                Carregue dados e receba insights automáticos com recomendações práticas para seu negócio.
              </p>
            </Card>
            
            <Card className="p-6 hover:shadow-lg transition-shadow border-0 shadow-md">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">CRM Inteligente</h3>
              <p className="text-slate-600">
                Gerencie clientes com etiquetas automáticas e funil de vendas visual para maximizar conversões.
              </p>
            </Card>
            
            <Card className="p-6 hover:shadow-lg transition-shadow border-0 shadow-md">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">KPIs Automáticos</h3>
              <p className="text-slate-600">
                Dashboard com métricas essenciais do seu negócio atualizadas em tempo real.
              </p>
            </Card>
            
            <Card className="p-6 hover:shadow-lg transition-shadow border-0 shadow-md">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Insights Personalizados</h3>
              <p className="text-slate-600">
                Recomendações específicas baseadas no perfil e dados do seu negócio.
              </p>
            </Card>
            
            <Card className="p-6 hover:shadow-lg transition-shadow border-0 shadow-md">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Exportação PDF</h3>
              <p className="text-slate-600">
                Exporte todos os relatórios e análises em formato profissional para apresentações.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* AI Technology Showcase */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">
                Tecnologia de IA Avançada
              </h2>
              <p className="text-xl text-slate-300 mb-8">
                Powered by GPT-5 e modelos de linguagem de última geração para fornecer consultoria empresarial de qualidade profissional.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-emerald-400 mr-3" />
                  <span>Análise preditiva de mercado</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-emerald-400 mr-3" />
                  <span>Recommendations baseadas em dados reais</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-emerald-400 mr-3" />
                  <span>Respostas contextualizadas para seu setor</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-emerald-400 mr-3" />
                  <span>Aprendizado contínuo com seus dados</span>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1677442136019-21780ecad995?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDJ8MHwxfHNlYXJjaHwyfHxBSSUyMHRlY2hub2xvZ3l8ZW58MHx8fHwxNzU3NTExODcwfDA&ixlib=rb-4.1.0&q=85"
                alt="AI Technology"
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-600/20 to-transparent rounded-2xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gradient-to-br from-slate-50 to-emerald-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Planos que crescem com seu negócio
            </h2>
            <p className="text-xl text-slate-600">
              Comece grátis e escale conforme necessário
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <Card className="p-6 border-2 border-slate-200 relative">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">Free</CardTitle>
                <div className="text-3xl font-bold">R$ 0<span className="text-base font-normal text-slate-500">/mês</span></div>
                <CardDescription>Para testar a plataforma</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-emerald-600 mr-3" />
                  <span className="text-sm">Até 5 consultas IA por mês</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-emerald-600 mr-3" />
                  <span className="text-sm">Até 10 clientes no CRM</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-emerald-600 mr-3" />
                  <span className="text-sm">2 relatórios por mês</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-emerald-600 mr-3" />
                  <span className="text-sm">Dashboard básico</span>
                </div>
                <Button className="w-full mt-6" variant="outline" onClick={() => window.location.href = '#auth'}>
                  Começar Grátis
                </Button>
              </CardContent>
            </Card>
            
            {/* Pro Plan */}
            <Card className="p-6 border-2 border-emerald-500 relative shadow-lg scale-105">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-emerald-600 text-white px-3 py-1">Mais Popular</Badge>
              </div>
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">Pro</CardTitle>
                <div className="text-3xl font-bold">R$ 99<span className="text-base font-normal text-slate-500">/mês</span></div>
                <CardDescription>Para empresas em crescimento</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-emerald-600 mr-3" />
                  <span className="text-sm">Consultas IA ilimitadas</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-emerald-600 mr-3" />
                  <span className="text-sm">CRM ilimitado</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-emerald-600 mr-3" />
                  <span className="text-sm">Relatórios ilimitados</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-emerald-600 mr-3" />
                  <span className="text-sm">Dashboard avançado</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-emerald-600 mr-3" />
                  <span className="text-sm">Exportação PDF</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-emerald-600 mr-3" />
                  <span className="text-sm">Suporte prioritário</span>
                </div>
                <Button className="w-full mt-6 bg-emerald-600 hover:bg-emerald-700" onClick={() => window.location.href = '#auth'}>
                  Iniciar Pro
                </Button>
              </CardContent>
            </Card>
            
            {/* Enterprise Plan */}
            <Card className="p-6 border-2 border-slate-200 relative">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">Enterprise</CardTitle>
                <div className="text-3xl font-bold">R$ 299<span className="text-base font-normal text-slate-500">/mês</span></div>
                <CardDescription>Para grandes empresas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-emerald-600 mr-3" />
                  <span className="text-sm">Tudo do Pro +</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-emerald-600 mr-3" />
                  <span className="text-sm">API personalizada</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-emerald-600 mr-3" />
                  <span className="text-sm">Múltiplos usuários</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-emerald-600 mr-3" />
                  <span className="text-sm">Integrações customizadas</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-emerald-600 mr-3" />
                  <span className="text-sm">Consultoria dedicada</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-emerald-600 mr-3" />
                  <span className="text-sm">SLA garantido</span>
                </div>
                <Button className="w-full mt-6" variant="outline" onClick={() => window.location.href = '#auth'}>
                  Falar com Vendas
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-emerald-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Pronto para revolucionar seu negócio?
          </h2>
          <p className="text-xl text-emerald-100 mb-8">
            Junte-se a centenas de empresas que já transformaram sua gestão com IA
          </p>
          <Button 
            size="lg" 
            className="bg-white text-emerald-600 hover:bg-slate-100 text-lg px-8"
            onClick={() => window.location.href = '#auth'}
          >
            Criar Conta Grátis
            <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
          <p className="text-emerald-200 text-sm mt-4">
            Teste grátis por 14 dias • Sem cartão de crédito • Cancelamento fácil
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">G</span>
                </div>
                <span className="ml-2 text-xl font-bold">Growen</span>
              </div>
              <p className="text-slate-400">
                Smart Business Consulting para PMEs e startups
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Produto</h3>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Recursos</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Preços</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Empresa</h3>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Sobre</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Carreiras</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Suporte</h3>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Ajuda</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contato</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>
          </div>
          
          <Separator className="my-8 bg-slate-800" />
          
          <div className="flex justify-between items-center">
            <p className="text-slate-400">© 2025 Growen. Todos os direitos reservados.</p>
            <div className="flex space-x-6 text-slate-400">
              <a href="#" className="hover:text-white transition-colors">Privacidade</a>
              <a href="#" className="hover:text-white transition-colors">Termos</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Auth Page Component
const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  
  const { login, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let success;
      if (isLogin) {
        success = await login(formData.email, formData.password);
      } else {
        success = await register(formData.name, formData.email, formData.password);
      }
      
      if (success) {
        window.location.href = '/dashboard';
      }
    } catch (error) {
      console.error('Auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">G</span>
            </div>
          </div>
          <CardTitle className="text-2xl">
            {isLogin ? 'Bem-vindo de volta' : 'Criar conta'}
          </CardTitle>
          <CardDescription>
            {isLogin ? 'Faça login em sua conta Growen' : 'Comece sua jornada com a Growen'}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium mb-2">Nome completo</label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Seu nome completo"
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                placeholder="seu@email.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Senha</label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                placeholder="Sua senha"
              />
            </div>
            
            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={loading}>
              {loading ? 'Processando...' : (isLogin ? 'Entrar' : 'Criar conta')}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-emerald-600 hover:text-emerald-700 text-sm"
            >
              {isLogin ? 'Não tem conta? Criar conta' : 'Já tem conta? Fazer login'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Dashboard Component
const Dashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [kpis, setKpis] = useState({});
  const [clients, setClients] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchKPIs();
    } else if (activeTab === 'crm') {
      fetchClients();
    } else if (activeTab === 'consultoria') {
      fetchChatHistory();
    }
  }, [activeTab]);

  const fetchKPIs = async () => {
    try {
      const token = localStorage.getItem('growen_token');
      const response = await axios.get(`${API}/dashboard/kpis`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setKpis(response.data);
    } catch (error) {
      console.error('Error fetching KPIs:', error);
    }
  };

  const fetchClients = async () => {
    try {
      const token = localStorage.getItem('growen_token');
      const response = await axios.get(`${API}/crm/clients`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClients(response.data);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const fetchChatHistory = async () => {
    try {
      const token = localStorage.getItem('growen_token');
      const response = await axios.get(`${API}/chat/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setChatMessages(response.data);
    } catch (error) {
      console.error('Error fetching chat history:', error);
    }
  };

  const sendMessage = async () => {
    if (!currentMessage.trim()) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('growen_token');
      const response = await axios.post(`${API}/chat`, {
        message: currentMessage,
        session_id: currentSessionId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setCurrentSessionId(response.data.session_id);
      setChatMessages(prev => [{
        message: currentMessage,
        response: response.data.response,
        timestamp: new Date()
      }, ...prev]);
      setCurrentMessage('');
      toast.success('Resposta recebida!');
    } catch (error) {
      toast.error('Erro ao enviar mensagem');
    } finally {
      setLoading(false);
    }
  };

  const addClient = async (clientData) => {
    try {
      const token = localStorage.getItem('growen_token');
      await axios.post(`${API}/crm/clients`, clientData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchClients();
      toast.success('Cliente adicionado com sucesso!');
    } catch (error) {
      toast.error('Erro ao adicionar cliente');
    }
  };

  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
    { id: 'consultoria', name: 'Consultoria IA', icon: Brain },
    { id: 'crm', name: 'CRM', icon: Users },
    { id: 'relatorios', name: 'Relatórios', icon: FileText },
    { id: 'planos', name: 'Planos', icon: CreditCard },
  ];

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-center h-16 px-4 border-b">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">G</span>
          </div>
          <span className="ml-2 text-xl font-bold text-slate-900">Growen</span>
        </div>
        
        <nav className="mt-8">
          {navigation.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center px-6 py-3 text-left hover:bg-emerald-50 transition-colors ${
                activeTab === item.id ? 'bg-emerald-50 text-emerald-600 border-r-2 border-emerald-600' : 'text-slate-600'
              }`}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </button>
          ))}
        </nav>
        
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center p-3 bg-slate-50 rounded-lg">
            <Avatar className="h-8 w-8">
              <AvatarFallback>{user.name?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">{user.name}</p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>
            <Button size="sm" variant="ghost" onClick={logout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-slate-200 bg-white px-4 shadow-sm lg:px-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </Button>
          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <h1 className="text-xl font-semibold text-slate-900 capitalize">{activeTab}</h1>
            </div>
          </div>
          <Badge variant="outline" className="hidden sm:flex">
            Plano {user.plan || 'Free'}
          </Badge>
        </div>

        {/* Content */}
        <main className="p-4 lg:p-6">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600">Total Clientes</p>
                        <p className="text-2xl font-bold">{kpis.total_clients || 0}</p>
                      </div>
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Users className="w-4 h-4 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600">Clientes Ativos</p>
                        <p className="text-2xl font-bold">{kpis.active_clients || 0}</p>
                      </div>
                      <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <UserPlus className="w-4 h-4 text-emerald-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600">Consultas IA</p>
                        <p className="text-2xl font-bold">{kpis.total_consultations || 0}</p>
                      </div>
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Brain className="w-4 h-4 text-purple-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600">Relatórios</p>
                        <p className="text-2xl font-bold">{kpis.total_reports || 0}</p>
                      </div>
                      <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-4 h-4 text-orange-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Receita Mensal</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-emerald-600">
                      R$ {kpis.monthly_revenue?.toLocaleString('pt-BR') || '0,00'}
                    </div>
                    <p className="text-sm text-slate-600 mt-2">
                      <span className="text-emerald-600">+{kpis.revenue_growth || 0}%</span> vs mês anterior
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Taxa de Conversão</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-blue-600">
                      {kpis.conversion_rate || 0}%
                    </div>
                    <p className="text-sm text-slate-600 mt-2">
                      Leads para clientes ativos
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'consultoria' && (
            <div className="max-w-4xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle>Consultoria com IA</CardTitle>
                  <CardDescription>
                    Faça perguntas sobre estratégias de negócio, marketing, vendas e gestão
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <Textarea
                        placeholder="Como posso melhorar as vendas do meu negócio?"
                        value={currentMessage}
                        onChange={(e) => setCurrentMessage(e.target.value)}
                        className="flex-1"
                      />
                      <Button 
                        onClick={sendMessage} 
                        disabled={loading || !currentMessage.trim()}
                        className="bg-emerald-600 hover:bg-emerald-700"
                      >
                        {loading ? 'Enviando...' : 'Enviar'}
                      </Button>
                    </div>
                    
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {chatMessages.map((msg, idx) => (
                        <div key={idx} className="space-y-2">
                          <div className="bg-emerald-50 p-3 rounded-lg">
                            <p className="font-medium">Você:</p>
                            <p>{msg.message}</p>
                          </div>
                          <div className="bg-slate-50 p-3 rounded-lg">
                            <p className="font-medium">Growen IA:</p>
                            <p className="whitespace-pre-wrap">{msg.response}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'crm' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Gerenciar Clientes</h2>
                <ClientForm onAddClient={addClient} />
              </div>
              
              <div className="grid gap-4">
                {clients.map((client) => (
                  <Card key={client.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">{client.name}</h3>
                          <p className="text-sm text-slate-600">{client.email}</p>
                          {client.phone && <p className="text-sm text-slate-600">{client.phone}</p>}
                        </div>
                        <Badge 
                          variant={client.status === 'cliente_ativo' ? 'default' : 'secondary'}
                        >
                          {client.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'relatorios' && (
            <Card>
              <CardHeader>
                <CardTitle>Relatórios Automáticos</CardTitle>
                <CardDescription>
                  Em breve: Upload de dados e geração automática de relatórios com IA
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600">Funcionalidade em desenvolvimento</p>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'planos' && <PlansSection user={user} />}
        </main>
      </div>
      
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

// Client Form Component
const ClientForm = ({ onAddClient }) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddClient(formData);
    setFormData({ name: '', email: '', phone: '' });
    setOpen(false);
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} className="bg-emerald-600 hover:bg-emerald-700">
        <UserPlus className="w-4 h-4 mr-2" />
        Adicionar Cliente
      </Button>
      
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md m-4">
            <CardHeader>
              <CardTitle>Novo Cliente</CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setOpen(false)}
                className="absolute top-4 right-4"
              >
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nome</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Telefone</label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700">
                  Adicionar Cliente
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

// Plans Section Component
const PlansSection = ({ user }) => {
  const currentPlan = user?.plan || 'free';

  const upgradeToProPlan = async () => {
    try {
      const token = localStorage.getItem('growen_token');
      const response = await axios.post(`${API}/payments/checkout/session`, {
        package_id: 'pro'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      window.location.href = response.data.url;
    } catch (error) {
      toast.error('Erro ao processar pagamento');
    }
  };

  const upgradeToEnterprisePlan = async () => {
    try {
      const token = localStorage.getItem('growen_token');
      const response = await axios.post(`${API}/payments/checkout/session`, {
        package_id: 'enterprise'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      window.location.href = response.data.url;
    } catch (error) {
      toast.error('Erro ao processar pagamento');
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Seu Plano Atual</h2>
        <Badge className="text-lg px-4 py-2">
          {currentPlan === 'free' ? 'Free' : currentPlan === 'pro' ? 'Pro' : 'Enterprise'}
        </Badge>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6">
        <Card className={`p-6 ${currentPlan === 'free' ? 'border-emerald-500 border-2' : 'border-slate-200'}`}>
          <CardHeader>
            <CardTitle>Free</CardTitle>
            <div className="text-2xl font-bold">R$ 0/mês</div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>✓ 5 consultas IA/mês</li>
              <li>✓ 10 clientes no CRM</li>
              <li>✓ 2 relatórios/mês</li>
            </ul>
            {currentPlan === 'free' && (
              <Badge className="mt-4">Plano Atual</Badge>
            )}
          </CardContent>
        </Card>
        
        <Card className={`p-6 ${currentPlan === 'pro' ? 'border-emerald-500 border-2' : 'border-slate-200'}`}>
          <CardHeader>
            <CardTitle>Pro</CardTitle>
            <div className="text-2xl font-bold">R$ 99/mês</div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>✓ Consultas IA ilimitadas</li>
              <li>✓ CRM ilimitado</li>
              <li>✓ Relatórios ilimitados</li>
              <li>✓ Suporte prioritário</li>
            </ul>
            {currentPlan === 'pro' ? (
              <Badge className="mt-4">Plano Atual</Badge>
            ) : (
              <Button className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700" onClick={upgradeToProPlan}>
                Upgrade para Pro
              </Button>
            )}
          </CardContent>
        </Card>
        
        <Card className={`p-6 ${currentPlan === 'enterprise' ? 'border-emerald-500 border-2' : 'border-slate-200'}`}>
          <CardHeader>
            <CardTitle>Enterprise</CardTitle>
            <div className="text-2xl font-bold">R$ 299/mês</div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>✓ Tudo do Pro +</li>
              <li>✓ API personalizada</li>
              <li>✓ Múltiplos usuários</li>
              <li>✓ SLA garantido</li>
            </ul>
            {currentPlan === 'enterprise' ? (
              <Badge className="mt-4">Plano Atual</Badge>
            ) : (
              <Button className="w-full mt-4" variant="outline" onClick={upgradeToEnterprisePlan}>
                Upgrade para Enterprise
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Success Page Component
const SuccessPage = () => {
  const [paymentStatus, setPaymentStatus] = useState('checking');
  const sessionId = new URLSearchParams(window.location.search).get('session_id');

  useEffect(() => {
    if (sessionId) {
      checkPaymentStatus();
    }
  }, [sessionId]);

  const checkPaymentStatus = async () => {
    try {
      const token = localStorage.getItem('growen_token');
      const response = await axios.get(`${API}/payments/checkout/status/${sessionId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.payment_status === 'paid') {
        setPaymentStatus('success');
        toast.success('Pagamento realizado com sucesso!');
      } else {
        setPaymentStatus('failed');
      }
    } catch (error) {
      setPaymentStatus('failed');
      toast.error('Erro ao verificar pagamento');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <Card className="max-w-md text-center">
        <CardContent className="p-8">
          {paymentStatus === 'checking' && (
            <>
              <Activity className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-spin" />
              <h2 className="text-2xl font-bold mb-2">Verificando pagamento...</h2>
              <p className="text-slate-600">Aguarde um momento</p>
            </>
          )}
          
          {paymentStatus === 'success' && (
            <>
              <CheckCircle className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Pagamento realizado!</h2>
              <p className="text-slate-600 mb-6">Seu plano foi atualizado com sucesso</p>
              <Button onClick={() => window.location.href = '/dashboard'} className="bg-emerald-600 hover:bg-emerald-700">
                Voltar ao Dashboard
              </Button>
            </>
          )}
          
          {paymentStatus === 'failed' && (
            <>
              <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Erro no pagamento</h2>
              <p className="text-slate-600 mb-6">Tente novamente ou entre em contato</p>
              <Button onClick={() => window.location.href = '/dashboard/planos'} variant="outline">
                Tentar novamente
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Main App Component
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="App">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/dashboard/*" element={<Dashboard />} />
            <Route path="/dashboard/success" element={<SuccessPage />} />
          </Routes>
          <Toaster position="top-right" />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;