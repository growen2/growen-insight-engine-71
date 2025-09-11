import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, Link } from 'react-router-dom';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Label } from './components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './components/ui/dialog';
import { AlertCircle, TrendingUp, Users, MessageSquare, FileText, BarChart3, CreditCard, LogOut, Menu, X, ChevronRight, Star, CheckCircle, Zap, Brain, Target, DollarSign, UserPlus, Activity, Settings, Download, Upload, Eye, Edit, Trash2, Plus, Search, Filter, Calendar, Phone, Mail, ExternalLink, ShieldCheck, Clock, Award, ThumbsUp, MapPin, Globe, MessageCircle, Play, BookOpen, HelpCircle, Building, Handshake } from 'lucide-react';
import { toast, Toaster } from 'sonner';

// Import charts
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Form handling
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Phone input
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

// Import remaining components
import ConsultoriaContent from './components/ConsultoriaContent';
import CRMContent from './components/CRMContent';
import { RelatoriosContent, AdminContent, PlanosContent, ConfiguracoesContent, SuccessPage } from './components/RemainingComponents';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Validation schemas
const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  company: z.string().optional(),
  phone: z.string().optional(),
  industry: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

const clientSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  company: z.string().optional(),
  industry: z.string().optional(),
  value: z.number().optional(),
  notes: z.string().optional(),
});

const reportSchema = z.object({
  title: z.string().min(3, 'Título deve ter pelo menos 3 caracteres'),
  type: z.string(),
  period: z.string().optional(),
  date_range: z.object({
    start: z.string(),
    end: z.string()
  }).optional(),
  sections: z.array(z.string()),
  include_charts: z.boolean().default(true),
  include_insights: z.boolean().default(true),
});

const partnerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  company: z.string().min(2, 'Nome da empresa é obrigatório'),
  service_category: z.string().min(1, 'Categoria é obrigatória'),
  description: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres'),
  website: z.string().url('URL inválida').optional().or(z.literal('')),
});

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

  const login = async (credentials) => {
    try {
      const response = await axios.post(`${API}/auth/login`, credentials);
      localStorage.setItem('growen_token', response.data.token);
      setUser(response.data.user);
      toast.success('Login realizado com sucesso!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.detail || 'Erro no login';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post(`${API}/auth/register`, userData);
      localStorage.setItem('growen_token', response.data.token);
      setUser(response.data.user);
      toast.success('Conta criada com sucesso!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.detail || 'Erro ao criar conta';
      toast.error(message);
      return { success: false, error: message };
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

// WhatsApp Floating Button Component
const WhatsAppButton = () => {
  const [whatsappConfig, setWhatsappConfig] = useState(null);

  useEffect(() => {
    fetchWhatsAppConfig();
  }, []);

  const fetchWhatsAppConfig = async () => {
    try {
      const response = await axios.get(`${API}/whatsapp/consultation-config`);
      setWhatsappConfig(response.data);
    } catch (error) {
      console.error('Error fetching WhatsApp config:', error);
    }
  };

  if (!whatsappConfig) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <a
        href={whatsappConfig.link}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group"
      >
        <MessageCircle className="w-6 h-6 mr-2" />
        <span className="font-medium">Consultoria WhatsApp</span>
      </a>
    </div>
  );
};

// Enhanced Landing Page Component
const LandingPage = () => {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleGetStarted = () => {
    navigate('/auth');
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50">
      <WhatsAppButton />
      
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-lg sticky top-0 z-40">
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
              <button onClick={() => scrollToSection('features')} className="text-slate-600 hover:text-emerald-600 transition-colors">Recursos</button>
              <button onClick={() => scrollToSection('pricing')} className="text-slate-600 hover:text-emerald-600 transition-colors">Preços</button>
              <Link to="/sobre" className="text-slate-600 hover:text-emerald-600 transition-colors">Sobre</Link>
              <Link to="/como-usar" className="text-slate-600 hover:text-emerald-600 transition-colors">Como Usar</Link>
              <Link to="/parceiros" className="text-slate-600 hover:text-emerald-600 transition-colors">Parceiros</Link>
              <Button variant="outline" onClick={handleGetStarted}>
                Entrar
              </Button>
              <Button onClick={handleGetStarted} className="bg-emerald-600 hover:bg-emerald-700">
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
              <button onClick={() => scrollToSection('features')} className="block w-full text-left px-3 py-2 text-slate-600 hover:text-emerald-600">Recursos</button>
              <button onClick={() => scrollToSection('pricing')} className="block w-full text-left px-3 py-2 text-slate-600 hover:text-emerald-600">Preços</button>
              <Link to="/sobre" className="block px-3 py-2 text-slate-600 hover:text-emerald-600">Sobre</Link>
              <Link to="/como-usar" className="block px-3 py-2 text-slate-600 hover:text-emerald-600">Como Usar</Link>
              <Link to="/parceiros" className="block px-3 py-2 text-slate-600 hover:text-emerald-600">Parceiros</Link>
              <div className="px-3 py-2">
                <Button variant="outline" className="w-full mb-2" onClick={handleGetStarted}>
                  Entrar
                </Button>
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={handleGetStarted}>
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
                IA para PMEs Angolanas
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
                Smart Business 
                <span className="text-emerald-600"> Consulting</span>
              </h1>
              
              <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                Transforme seu negócio com consultoria inteligente adaptada ao mercado angolano. 
                IA especializada, CRM avançado e relatórios automáticos para PMEs locais.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-lg px-8" onClick={handleGetStarted}>
                  Começar Grátis
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8" onClick={() => navigate('/como-usar')}>
                  Ver Como Funciona
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
                  Em português
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-blue-500 rounded-3xl blur-3xl opacity-20"></div>
              <img 
                src="https://images.unsplash.com/39/lIZrwvbeRuuzqOoWJUEn_Photoaday_CSD%20%281%20of%201%29-5.jpg?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2Mzl8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMGNvbnN1bHRpbmd8ZW58MHx8fHwxNzU3NjE5MjkwfDA&ixlib=rb-4.1.0&q=85"
                alt="Consultoria de Negócios"
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
                Chat inteligente com IA especializada em negócios angolanos. Respostas personalizadas 24/7.
              </p>
            </Card>
            
            <Card className="p-6 hover:shadow-lg transition-shadow border-0 shadow-md">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Relatórios Automáticos</h3>
              <p className="text-slate-600">
                Carregue dados CSV e receba análises completas com recomendações práticas.
              </p>
            </Card>
            
            <Card className="p-6 hover:shadow-lg transition-shadow border-0 shadow-md">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">CRM com Emails</h3>
              <p className="text-slate-600">
                Gerencie clientes, envie emails profissionais e ligue diretamente da plataforma.
              </p>
            </Card>
            
            <Card className="p-6 hover:shadow-lg transition-shadow border-0 shadow-md">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Handshake className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Marketplace Parceiros</h3>
              <p className="text-slate-600">
                Acesse uma rede de prestadores de serviços especializados em Angola.
              </p>
            </Card>
            
            <Card className="p-6 hover:shadow-lg transition-shadow border-0 shadow-md">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <MessageCircle className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Consultoria WhatsApp</h3>
              <p className="text-slate-600">
                Obtenha consultoria especializada diretamente no WhatsApp com nossos experts.
              </p>
            </Card>
            
            <Card className="p-6 hover:shadow-lg transition-shadow border-0 shadow-md">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Exportação PDF</h3>
              <p className="text-slate-600">
                Exporte relatórios, consultorias e análises em formato profissional.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section for Angola */}
      <section id="pricing" className="py-20 bg-gradient-to-br from-slate-50 to-emerald-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Planos adaptados para Angola
            </h2>
            <p className="text-xl text-slate-600">
              Preços em Kwanzas para o mercado local
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <Card className="p-6 border-2 border-slate-200 relative">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">Gratuito</CardTitle>
                <div className="text-3xl font-bold">0 Kz<span className="text-base font-normal text-slate-500">/mês</span></div>
                <CardDescription>Para testar a plataforma</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-emerald-600 mr-3" />
                  <span className="text-sm">5 consultas IA por mês</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-emerald-600 mr-3" />
                  <span className="text-sm">10 clientes no CRM</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-emerald-600 mr-3" />
                  <span className="text-sm">2 relatórios por mês</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-emerald-600 mr-3" />
                  <span className="text-sm">10 emails por mês</span>
                </div>
                <Button className="w-full mt-6" variant="outline" onClick={handleGetStarted}>
                  Começar Grátis
                </Button>
              </CardContent>
            </Card>
            
            {/* Starter Plan */}
            <Card className="p-6 border-2 border-emerald-500 relative shadow-lg scale-105">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-emerald-600 text-white px-3 py-1">Mais Popular</Badge>
              </div>
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">Starter</CardTitle>
                <div className="text-3xl font-bold">10.000 Kz<span className="text-base font-normal text-slate-500">/mês</span></div>
                <CardDescription>Para empresas em crescimento</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-emerald-600 mr-3" />
                  <span className="text-sm">50 consultas IA por mês</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-emerald-600 mr-3" />
                  <span className="text-sm">100 clientes no CRM</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-emerald-600 mr-3" />
                  <span className="text-sm">10 relatórios por mês</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-emerald-600 mr-3" />
                  <span className="text-sm">100 emails por mês</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-emerald-600 mr-3" />
                  <span className="text-sm">Exportação PDF</span>
                </div>
                <Button className="w-full mt-6 bg-emerald-600 hover:bg-emerald-700" onClick={handleGetStarted}>
                  Começar Starter
                </Button>
              </CardContent>
            </Card>
            
            {/* Pro Plan */}
            <Card className="p-6 border-2 border-slate-200 relative">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">Profissional</CardTitle>
                <div className="text-3xl font-bold">20.000 Kz<span className="text-base font-normal text-slate-500">/mês</span></div>
                <CardDescription>Para grandes empresas</CardDescription>
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
                  <span className="text-sm">Emails ilimitados</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-emerald-600 mr-3" />
                  <span className="text-sm">Consultoria WhatsApp</span>
                </div>
                <Button className="w-full mt-6" variant="outline" onClick={handleGetStarted}>
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
            Junte-se a centenas de empresas angolanas que já transformaram sua gestão com IA
          </p>
          <Button 
            size="lg" 
            className="bg-white text-emerald-600 hover:bg-slate-100 text-lg px-8"
            onClick={handleGetStarted}
          >
            Criar Conta Grátis
            <ChevronRight className="ml-2 h-5 w-5" />
          </Button>
          <p className="text-emerald-200 text-sm mt-4">
            Teste grátis por 30 dias • Sem cartão de crédito • Cancelamento fácil
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
              <p className="text-slate-400 mb-4">
                Smart Business Consulting para PMEs angolanas
              </p>
              <div className="flex items-center text-slate-400">
                <MapPin className="w-4 h-4 mr-2" />
                <span className="text-sm">Luanda, Angola</span>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Produto</h3>
              <ul className="space-y-2 text-slate-400">
                <li><button onClick={() => scrollToSection('features')} className="hover:text-white transition-colors">Recursos</button></li>
                <li><button onClick={() => scrollToSection('pricing')} className="hover:text-white transition-colors">Preços</button></li>
                <li><Link to="/como-usar" className="hover:text-white transition-colors">Como Usar</Link></li>
                <li><Link to="/parceiros" className="hover:text-white transition-colors">Parceiros</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Empresa</h3>
              <ul className="space-y-2 text-slate-400">
                <li><Link to="/sobre" className="hover:text-white transition-colors">Sobre</Link></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Carreiras</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Imprensa</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Suporte</h3>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Central de Ajuda</a></li>
                <li><a href="mailto:suporte@growen.com" className="hover:text-white transition-colors">Contato</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
                <li><a href="https://wa.me/244924123456" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center">
                  <MessageCircle className="w-4 h-4 mr-1" />
                  WhatsApp
                </a></li>
              </ul>
            </div>
          </div>
          
          <Separator className="my-8 bg-slate-800" />
          
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-400">© 2025 Growen. Todos os direitos reservados.</p>
            <div className="flex space-x-6 text-slate-400 mt-4 md:mt-0">
              <a href="#" className="hover:text-white transition-colors">Política de Privacidade</a>
              <a href="#" className="hover:text-white transition-colors">Termos de Uso</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Sobre Page Component
const SobrePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">G</span>
              </div>
              <span className="ml-2 text-xl font-bold text-slate-900">Growen</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link to="/" className="text-slate-600 hover:text-emerald-600">Início</Link>
              <Button onClick={() => navigate('/auth')} className="bg-emerald-600 hover:bg-emerald-700">
                Começar Grátis
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-slate-900 mb-6">Sobre a Growen</h1>
          <p className="text-xl text-slate-600 leading-relaxed">
            Democratizando consultoria de negócios através de inteligência artificial para empresas angolanas
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Nossa Missão</h2>
            <p className="text-slate-600 leading-relaxed mb-6">
              A Growen foi criada com o objetivo de democratizar o acesso a consultoria empresarial de qualidade em Angola. 
              Utilizamos inteligência artificial de última geração para fornecer insights, análises e recomendações 
              personalizadas para pequenas e médias empresas.
            </p>
            <p className="text-slate-600 leading-relaxed">
              Acreditamos que toda empresa, independentemente do seu tamanho, merece ter acesso a ferramentas poderosas 
              de gestão e consultoria estratégica.
            </p>
          </div>
          
          <div>
            <img 
              src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDJ8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHRlYW18ZW58MHx8fHwxNzU3NTExODcwfDA&ixlib=rb-4.1.0&q=85"
              alt="Equipe Growen"
              className="rounded-lg shadow-lg w-full h-64 object-cover"
            />
          </div>
        </div>

        <div className="bg-white rounded-lg p-8 shadow-lg mb-16">
          <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">Por que escolher a Growen?</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="font-semibold mb-2">IA Especializada</h3>
              <p className="text-sm text-slate-600">
                Nossa IA é especializada no mercado angolano e entende as particularidades locais
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Foco Local</h3>
              <p className="text-sm text-slate-600">
                Desenvolvida especificamente para as necessidades das empresas em Angola
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">Qualidade Premium</h3>
              <p className="text-sm text-slate-600">
                Consultoria de qualidade profissional acessível para todas as empresas
              </p>
            </div>
          </div>
        </div>

        <div className="bg-emerald-50 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Junte-se a nós</h2>
          <p className="text-slate-600 mb-6">
            Faça parte da revolução digital dos negócios em Angola. Comece hoje mesmo!
          </p>
          <Button onClick={() => navigate('/auth')} className="bg-emerald-600 hover:bg-emerald-700">
            Criar Conta Grátis
          </Button>
        </div>
      </div>
    </div>
  );
};

// Como Usar Page Component
const ComoUsarPage = () => {
  const navigate = useNavigate();

  const steps = [
    {
      number: "01",
      title: "Criar Conta",
      description: "Registre-se gratuitamente com seus dados empresariais",
      icon: UserPlus,
      details: ["Preencha nome, email e dados da empresa", "Escolha seu setor de atividade", "Confirmação por email automática"]
    },
    {
      number: "02", 
      title: "Explorar Dashboard",
      description: "Acesse seu painel executivo com métricas importantes",
      icon: BarChart3,
      details: ["Visualize KPIs do seu negócio", "Acompanhe gráficos de crescimento", "Monitore uso do plano"]
    },
    {
      number: "03",
      title: "Adicionar Clientes",
      description: "Cadastre seus clientes no CRM inteligente",
      icon: Users,
      details: ["Importe ou adicione clientes manualmente", "Organize por status e pipeline", "Adicione valores e observações"]
    },
    {
      number: "04",
      title: "Consultar IA",
      description: "Faça perguntas à nossa IA especializada",
      icon: Brain,
      details: ["Pergunte sobre estratégias de negócio", "Receba respostas contextualizadas", "Salve consultas em PDF"]
    },
    {
      number: "05",
      title: "Gerar Relatórios",
      description: "Crie relatórios automáticos com insights",
      icon: FileText,
      details: ["Upload dados CSV para análise", "Gere relatórios personalizados", "Exporte em PDF profissional"]
    },
    {
      number: "06",
      title: "Comunicar Clientes",
      description: "Envie emails e ligue diretamente da plataforma",
      icon: Mail,
      details: ["Templates de email profissionais", "Links diretos para WhatsApp", "Histórico de comunicações"]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">G</span>
              </div>
              <span className="ml-2 text-xl font-bold text-slate-900">Growen</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link to="/" className="text-slate-600 hover:text-emerald-600">Início</Link>
              <Button onClick={() => navigate('/auth')} className="bg-emerald-600 hover:bg-emerald-700">
                Começar Grátis
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-slate-900 mb-6">Como Usar a Plataforma</h1>
          <p className="text-xl text-slate-600 leading-relaxed max-w-3xl mx-auto">
            Guia completo para aproveitar ao máximo todas as funcionalidades da Growen
          </p>
        </div>

        <div className="space-y-16">
          {steps.map((step, index) => (
            <div key={index} className={`flex items-center gap-12 ${index % 2 === 1 ? 'flex-row-reverse' : ''}`}>
              <div className="flex-1">
                <div className="flex items-center mb-4">
                  <span className="text-4xl font-bold text-emerald-600 mr-4">{step.number}</span>
                  <h2 className="text-2xl font-bold text-slate-900">{step.title}</h2>
                </div>
                <p className="text-lg text-slate-600 mb-6">{step.description}</p>
                <ul className="space-y-2">
                  {step.details.map((detail, idx) => (
                    <li key={idx} className="flex items-center text-slate-600">
                      <CheckCircle className="w-5 h-5 text-emerald-600 mr-3" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex-1">
                <Card className="p-8 bg-gradient-to-br from-emerald-50 to-blue-50">
                  <div className="w-24 h-24 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <step.icon className="w-12 h-12 text-emerald-600" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">{step.title}</h3>
                    <p className="text-slate-600">{step.description}</p>
                  </div>
                </Card>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 bg-emerald-600 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Pronto para Começar?</h2>
          <p className="text-xl text-emerald-100 mb-8">
            Siga estes passos e transforme a gestão do seu negócio em poucos minutos!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => navigate('/auth')} 
              className="bg-white text-emerald-600 hover:bg-slate-100"
              size="lg"
            >
              Criar Conta Grátis
            </Button>
            <Button 
              onClick={() => navigate('/')} 
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-emerald-600"
              size="lg"
            >
              Ver Demonstração
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Parceiros Page Component
const ParceirosPage = () => {
  const navigate = useNavigate();
  const [partners, setPartners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showPartnerForm, setShowPartnerForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const partnerForm = useForm({
    resolver: zodResolver(partnerSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      company: '',
      service_category: '',
      description: '',
      website: '',
    },
  });

  useEffect(() => {
    fetchPartners();
    fetchCategories();
  }, [selectedCategory]);

  const fetchPartners = async () => {
    try {
      const params = selectedCategory ? `?category=${selectedCategory}` : '';
      const response = await axios.get(`${API}/partners${params}`);
      setPartners(response.data);
    } catch (error) {
      console.error('Error fetching partners:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API}/partners/categories`);
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const submitPartnerForm = async (data) => {
    try {
      await axios.post(`${API}/partners`, data);
      toast.success('Parceiro cadastrado com sucesso! Aguarde aprovação.');
      setShowPartnerForm(false);
      partnerForm.reset();
      fetchPartners();
    } catch (error) {
      toast.error('Erro ao cadastrar parceiro');
    }
  };

  const getIconForCategory = (iconName) => {
    const icons = {
      calculator: BarChart3,
      scale: Award,
      megaphone: MessageSquare,
      computer: Brain,
      users: Users,
      palette: Star,
      "dollar-sign": DollarSign,
      "user-check": UserPlus
    };
    return icons[iconName] || Building;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">G</span>
              </div>
              <span className="ml-2 text-xl font-bold text-slate-900">Growen</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link to="/" className="text-slate-600 hover:text-emerald-600">Início</Link>
              <Button onClick={() => setShowPartnerForm(true)} variant="outline">
                Seja Parceiro
              </Button>
              <Button onClick={() => navigate('/auth')} className="bg-emerald-600 hover:bg-emerald-700">
                Entrar
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-slate-900 mb-6">Marketplace de Parceiros</h1>
          <p className="text-xl text-slate-600 leading-relaxed max-w-3xl mx-auto">
            Conecte-se com prestadores de serviços especializados e verificados para o seu negócio
          </p>
        </div>

        {/* Categories Filter */}
        <div className="mb-12">
          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              variant={selectedCategory === '' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('')}
              className={selectedCategory === '' ? 'bg-emerald-600' : ''}
            >
              Todos
            </Button>
            {categories.map((category) => {
              const IconComponent = getIconForCategory(category.icon);
              return (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 ${selectedCategory === category.id ? 'bg-emerald-600' : ''}`}
                >
                  <IconComponent className="w-4 h-4" />
                  {category.name}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Partners Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="p-6 animate-pulse">
                <div className="w-16 h-16 bg-slate-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-slate-200 rounded mb-2"></div>
                <div className="h-3 bg-slate-200 rounded mb-4"></div>
                <div className="h-20 bg-slate-200 rounded"></div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {partners.map((partner) => (
              <Card key={partner.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <Building className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{partner.company}</h3>
                      <p className="text-sm text-slate-600">{partner.name}</p>
                    </div>
                  </div>
                  {partner.is_verified && (
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  )}
                </div>

                <div className="mb-4">
                  <Badge variant="secondary" className="mb-2">
                    {categories.find(c => c.id === partner.service_category)?.name || partner.service_category}
                  </Badge>
                  <p className="text-sm text-slate-600 line-clamp-3">
                    {partner.description}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-4 h-4 ${i < Math.floor(partner.rating) ? 'text-yellow-400 fill-current' : 'text-slate-300'}`} 
                      />
                    ))}
                    <span className="text-sm text-slate-600 ml-1">
                      ({partner.total_reviews})
                    </span>
                  </div>
                  
                  <div className="flex gap-2">
                    {partner.website && (
                      <Button size="sm" variant="outline" asChild>
                        <a href={partner.website} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                    )}
                    <Button size="sm" variant="outline" asChild>
                      <a href={`mailto:${partner.email}`}>
                        <Mail className="w-4 h-4" />
                      </a>
                    </Button>
                    {partner.phone && (
                      <Button size="sm" variant="outline" asChild>
                        <a href={`tel:${partner.phone}`}>
                          <Phone className="w-4 h-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {partners.length === 0 && !loading && (
          <div className="text-center py-12">
            <Building className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Nenhum parceiro encontrado</h3>
            <p className="text-slate-600 mb-6">
              {selectedCategory ? 'Nesta categoria ainda não temos parceiros.' : 'Não há parceiros cadastrados ainda.'}
            </p>
            <Button onClick={() => setShowPartnerForm(true)} className="bg-emerald-600 hover:bg-emerald-700">
              Seja o Primeiro Parceiro
            </Button>
          </div>
        )}

        {/* Partner Registration Modal */}
        <Dialog open={showPartnerForm} onOpenChange={setShowPartnerForm}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Cadastrar como Parceiro</DialogTitle>
              <DialogDescription>
                Junte-se ao nosso marketplace e conecte-se com empresas que precisam dos seus serviços
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={partnerForm.handleSubmit(submitPartnerForm)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome completo *</Label>
                  <Input
                    id="name"
                    {...partnerForm.register('name')}
                    placeholder="Seu nome"
                  />
                  {partnerForm.formState.errors.name && (
                    <p className="text-sm text-red-600 mt-1">{partnerForm.formState.errors.name.message}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    {...partnerForm.register('email')}
                    placeholder="seu@email.com"
                  />
                  {partnerForm.formState.errors.email && (
                    <p className="text-sm text-red-600 mt-1">{partnerForm.formState.errors.email.message}</p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    {...partnerForm.register('phone')}
                    placeholder="+244..."
                  />
                </div>
                
                <div>
                  <Label htmlFor="company">Empresa *</Label>
                  <Input
                    id="company"
                    {...partnerForm.register('company')}
                    placeholder="Nome da empresa"
                  />
                  {partnerForm.formState.errors.company && (
                    <p className="text-sm text-red-600 mt-1">{partnerForm.formState.errors.company.message}</p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="service_category">Categoria de Serviço *</Label>
                  <Select onValueChange={(value) => partnerForm.setValue('service_category', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {partnerForm.formState.errors.service_category && (
                    <p className="text-sm text-red-600 mt-1">{partnerForm.formState.errors.service_category.message}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    {...partnerForm.register('website')}
                    placeholder="https://..."
                  />
                  {partnerForm.formState.errors.website && (
                    <p className="text-sm text-red-600 mt-1">{partnerForm.formState.errors.website.message}</p>
                  )}
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Descrição dos Serviços *</Label>
                <Textarea
                  id="description"
                  {...partnerForm.register('description')}
                  placeholder="Descreva detalhadamente os serviços que oferece..."
                  rows={4}
                />
                {partnerForm.formState.errors.description && (
                  <p className="text-sm text-red-600 mt-1">{partnerForm.formState.errors.description.message}</p>
                )}
              </div>
              
              <div className="flex justify-end gap-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowPartnerForm(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                  Cadastrar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

// Contatos Page Component
const ContatosPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">G</span>
              </div>
              <span className="ml-2 text-xl font-bold text-slate-900">Growen</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link to="/" className="text-slate-600 hover:text-emerald-600">Início</Link>
              <Button onClick={() => navigate('/auth')} className="bg-emerald-600 hover:bg-emerald-700">
                Começar Grátis
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-slate-900 mb-6">Entre em Contato</h1>
          <p className="text-xl text-slate-600 leading-relaxed">
            Estamos aqui para ajudar sua empresa a crescer. Fale conosco!
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Informações de Contato</h2>
            
            <div className="space-y-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mr-4">
                  <Mail className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Email</h3>
                  <p className="text-slate-600">contato@growen.com</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mr-4">
                  <Phone className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Telefone</h3>
                  <p className="text-slate-600">+244 924 123 456</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mr-4">
                  <MessageCircle className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">WhatsApp</h3>
                  <p className="text-slate-600">+244 924 123 456</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mr-4">
                  <MapPin className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Endereço</h3>
                  <p className="text-slate-600">Luanda, Angola</p>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Envie uma Mensagem</h2>
              <form className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome</Label>
                  <Input id="name" placeholder="Seu nome completo" />
                </div>
                
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="seu@email.com" />
                </div>
                
                <div>
                  <Label htmlFor="company">Empresa</Label>
                  <Input id="company" placeholder="Nome da sua empresa" />
                </div>
                
                <div>
                  <Label htmlFor="subject">Assunto</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o assunto" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="suporte">Suporte Técnico</SelectItem>
                      <SelectItem value="vendas">Informações de Vendas</SelectItem>
                      <SelectItem value="parceria">Parceria</SelectItem>
                      <SelectItem value="feedback">Feedback</SelectItem>
                      <SelectItem value="outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="message">Mensagem</Label>
                  <Textarea 
                    id="message" 
                    placeholder="Descreva como podemos ajudar..."
                    rows={4}
                  />
                </div>
                
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                  Enviar Mensagem
                </Button>
              </form>
            </Card>
          </div>
        </div>

        <div className="bg-emerald-50 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Pronto para começar?</h2>
          <p className="text-slate-600 mb-6">
            Experimente nossa plataforma gratuitamente e veja como podemos transformar seu negócio
          </p>
          <Button onClick={() => navigate('/auth')} className="bg-emerald-600 hover:bg-emerald-700">
            Começar Grátis
          </Button>
        </div>
      </div>
    </div>
  );
};

// Enhanced Auth Page Component (without changes, keeping previous implementation)
const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const loginForm = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const registerForm = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      company: '',
      phone: '',
      industry: '',
    },
  });

  const onLoginSubmit = async (data) => {
    setLoading(true);
    try {
      const result = await login(data);
      if (result.success) {
        navigate('/dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  const onRegisterSubmit = async (data) => {
    setLoading(true);
    try {
      const result = await register(data);
      if (result.success) {
        navigate('/dashboard');
      }
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
          {isLogin ? (
            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  {...loginForm.register('email')}
                />
                {loginForm.formState.errors.email && (
                  <p className="text-sm text-red-600 mt-1">{loginForm.formState.errors.email.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Sua senha"
                  {...loginForm.register('password')}
                />
                {loginForm.formState.errors.password && (
                  <p className="text-sm text-red-600 mt-1">{loginForm.formState.errors.password.message}</p>
                )}
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-emerald-600 hover:bg-emerald-700" 
                disabled={loading}
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>
          ) : (
            <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="name">Nome completo</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Seu nome completo"
                  {...registerForm.register('name')}
                />
                {registerForm.formState.errors.name && (
                  <p className="text-sm text-red-600 mt-1">{registerForm.formState.errors.name.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  {...registerForm.register('email')}
                />
                {registerForm.formState.errors.email && (
                  <p className="text-sm text-red-600 mt-1">{registerForm.formState.errors.email.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  {...registerForm.register('password')}
                />
                {registerForm.formState.errors.password && (
                  <p className="text-sm text-red-600 mt-1">{registerForm.formState.errors.password.message}</p>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="company">Empresa</Label>
                  <Input
                    id="company"
                    type="text"
                    placeholder="Sua empresa"
                    {...registerForm.register('company')}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+244..."
                    {...registerForm.register('phone')}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="industry">Setor</Label>
                <Select onValueChange={(value) => registerForm.setValue('industry', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o setor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="comercio">Comércio</SelectItem>
                    <SelectItem value="servicos">Serviços</SelectItem>
                    <SelectItem value="industria">Indústria</SelectItem>
                    <SelectItem value="tecnologia">Tecnologia</SelectItem>
                    <SelectItem value="consultoria">Consultoria</SelectItem>
                    <SelectItem value="educacao">Educação</SelectItem>
                    <SelectItem value="saude">Saúde</SelectItem>
                    <SelectItem value="outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-emerald-600 hover:bg-emerald-700" 
                disabled={loading}
              >
                {loading ? 'Criando conta...' : 'Criar conta'}
              </Button>
            </form>
          )}
          
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

// Main Dashboard - keeping previous implementation with enhancements
const Dashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState({});
  const [clients, setClients] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState([]);
  const [chatSessions, setChatSessions] = useState([]);

  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchDashboardData();
    } else if (activeTab === 'crm') {
      fetchClients();
    } else if (activeTab === 'consultoria') {
      fetchChatHistory();
      fetchChatSessions();
    } else if (activeTab === 'relatorios') {
      fetchReports();
    }
  }, [activeTab]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('growen_token');
      const response = await axios.get(`${API}/dashboard/kpis`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
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

  const fetchChatSessions = async () => {
    try {
      const token = localStorage.getItem('growen_token');
      const response = await axios.get(`${API}/chat/sessions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setChatSessions(response.data);
    } catch (error) {
      console.error('Error fetching chat sessions:', error);
    }
  };

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem('growen_token');
      const response = await axios.get(`${API}/reports`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReports(response.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  const sendMessage = async () => {
    if (!currentMessage.trim()) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('growen_token');
      const response = await axios.post(`${API}/chat`, {
        message: currentMessage,
        session_id: currentSessionId,
        model: 'gpt-4o-mini'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setCurrentSessionId(response.data.session_id);
      
      // Add message to local state for immediate UI update
      const newMessage = {
        id: response.data.message_id,
        message: currentMessage,
        response: response.data.response,
        created_at: new Date().toISOString()
      };
      setChatMessages(prev => [newMessage, ...prev]);
      
      setCurrentMessage('');
      fetchChatSessions(); // Refresh sessions
      toast.success('Resposta recebida!');
    } catch (error) {
      const message = error.response?.data?.detail || 'Erro ao enviar mensagem';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const exportChatToPDF = async (sessionId) => {
    try {
      const token = localStorage.getItem('growen_token');
      const response = await axios.post(`${API}/chat/${sessionId}/export-pdf`, {}, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `growen-consultoria-${sessionId.substring(0, 8)}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('PDF exportado com sucesso!');
    } catch (error) {
      toast.error('Erro ao exportar PDF');
    }
  };



  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
    { id: 'consultoria', name: 'Consultoria IA', icon: Brain },
    { id: 'crm', name: 'CRM', icon: Users },
    { id: 'relatorios', name: 'Relatórios', icon: FileText },
    { id: 'planos', name: 'Planos', icon: CreditCard },
    { id: 'configuracoes', name: 'Configurações', icon: Settings },
  ];

  // Add admin navigation if user is admin
  if (user?.is_admin) {
    navigation.push({ id: 'admin', name: 'Admin', icon: ShieldCheck });
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Chart colors
  const chartColors = ['#2ECC71', '#1A2930', '#3498DB', '#E74C3C', '#F39C12'];

  return (
    <div className="min-h-screen bg-slate-50">
      <WhatsAppButton />
      
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
              <p className="text-xs text-slate-500 truncate">Plano {user.plan || 'Gratuito'}</p>
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
              <h1 className="text-xl font-semibold text-slate-900 capitalize">{activeTab.replace('_', ' ')}</h1>
            </div>
          </div>
          <Badge variant="outline" className="hidden sm:flex">
            {dashboardData.plan_info?.name || user.plan || 'Gratuito'}
          </Badge>
        </div>

        {/* Content */}
        <main className="p-4 lg:p-6">
          {activeTab === 'dashboard' && <DashboardContent data={dashboardData} />}
          {activeTab === 'consultoria' && (
            <ConsultoriaContent
              messages={chatMessages}
              sessions={chatSessions}
              currentMessage={currentMessage}
              setCurrentMessage={setCurrentMessage}
              sendMessage={sendMessage}
              loading={loading}
              exportChatToPDF={exportChatToPDF}
            />
          )}
          {activeTab === 'crm' && <CRMContent clients={clients} fetchClients={fetchClients} />}
          {activeTab === 'relatorios' && <RelatoriosContent reports={reports} fetchReports={fetchReports} />}
          {activeTab === 'planos' && <PlanosContent user={user} />}
          {activeTab === 'configuracoes' && <ConfiguracoesContent user={user} />}
          {activeTab === 'admin' && user?.is_admin && <AdminContent />}
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

// Dashboard Content Component (keeping previous implementation)
const DashboardContent = ({ data }) => {
  const overview = data.overview || {};
  const charts = data.charts || [];
  const planInfo = data.plan_info || {};

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total de Clientes</p>
                <p className="text-2xl font-bold">{overview.total_clients || 0}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {overview.active_clients || 0} ativos
                </p>
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
                <p className="text-sm font-medium text-slate-600">Consultas IA</p>
                <p className="text-2xl font-bold">{overview.monthly_consultations || 0}</p>
                <p className="text-xs text-slate-500 mt-1">Este mês</p>
              </div>
              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Brain className="w-4 h-4 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Emails Enviados</p>
                <p className="text-2xl font-bold">{overview.monthly_emails || 0}</p>
                <p className="text-xs text-slate-500 mt-1">Este mês</p>
              </div>
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Mail className="w-4 h-4 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Pipeline</p>
                <p className="text-2xl font-bold">
                  {overview.pipeline_value_aoa ? `${(overview.pipeline_value_aoa).toLocaleString('pt-AO')} Kz` : '0 Kz'}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Taxa conversão: {overview.conversion_rate || 0}%
                </p>
              </div>
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Evolução Mensal</CardTitle>
            <CardDescription>Atividades nos últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={charts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="clients" stroke="#2ECC71" name="Clientes" />
                <Line type="monotone" dataKey="consultations" stroke="#3498DB" name="Consultas" />
                <Line type="monotone" dataKey="emails" stroke="#E74C3C" name="Emails" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Funil de Vendas</CardTitle>
            <CardDescription>Distribuição de clientes por status</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Novos Leads', value: overview.leads || 0 },
                    { name: 'Em Negociação', value: overview.negotiations || 0 },
                    { name: 'Clientes Ativos', value: overview.active_clients || 0 },
                  ]}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label
                >
                  {[
                    { name: 'Novos Leads', value: overview.leads || 0 },
                    { name: 'Em Negociação', value: overview.negotiations || 0 },
                    { name: 'Clientes Ativos', value: overview.active_clients || 0 },
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#2ECC71', '#F39C12', '#3498DB'][index % 3]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Plan Usage */}
      {planInfo.limits && (
        <Card>
          <CardHeader>
            <CardTitle>Uso do Plano - {planInfo.name}</CardTitle>
            <CardDescription>Acompanhe o uso mensal das funcionalidades</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Consultas IA</span>
                  <span className="text-sm text-slate-500">
                    {planInfo.usage?.ai_chats || 0} / {planInfo.limits.ai_chats === -1 ? '∞' : planInfo.limits.ai_chats}
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className="bg-emerald-600 h-2 rounded-full" 
                    style={{ 
                      width: planInfo.limits.ai_chats === -1 ? '20%' : 
                             `${Math.min((planInfo.usage?.ai_chats || 0) / planInfo.limits.ai_chats * 100, 100)}%` 
                    }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Clientes</span>
                  <span className="text-sm text-slate-500">
                    {planInfo.usage?.clients || 0} / {planInfo.limits.clients === -1 ? '∞' : planInfo.limits.clients}
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ 
                      width: planInfo.limits.clients === -1 ? '30%' : 
                             `${Math.min((planInfo.usage?.clients || 0) / planInfo.limits.clients * 100, 100)}%` 
                    }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Relatórios</span>
                  <span className="text-sm text-slate-500">
                    {planInfo.usage?.reports || 0} / {planInfo.limits.reports === -1 ? '∞' : planInfo.limits.reports}
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full" 
                    style={{ 
                      width: planInfo.limits.reports === -1 ? '25%' : 
                             `${Math.min((planInfo.usage?.reports || 0) / planInfo.limits.reports * 100, 100)}%` 
                    }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Emails</span>
                  <span className="text-sm text-slate-500">
                    {planInfo.usage?.emails || 0} / {planInfo.limits.email_sends === -1 ? '∞' : planInfo.limits.email_sends}
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className="bg-red-600 h-2 rounded-full" 
                    style={{ 
                      width: planInfo.limits.email_sends === -1 ? '15%' : 
                             `${Math.min((planInfo.usage?.emails || 0) / planInfo.limits.email_sends * 100, 100)}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Continue with the remaining components...
// [Due to length constraints, will continue in next message with:]
// - ConsultoriaContent (enhanced)
// - CRMContent (with email/phone integration)
// - RelatoriosContent (with custom generation form)
// - AdminContent (complete admin panel)
// - PlanosContent (updated)
// - ConfiguracoesContent (updated)
// - Success page and other utilities

// Main App Component
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="App">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/sobre" element={<SobrePage />} />
            <Route path="/como-usar" element={<ComoUsarPage />} />
            <Route path="/parceiros" element={<ParceirosPage />} />
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