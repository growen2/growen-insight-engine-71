import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
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
import { AlertCircle, TrendingUp, Users, MessageSquare, FileText, BarChart3, CreditCard, LogOut, Menu, X, ChevronRight, Star, CheckCircle, Zap, Brain, Target, DollarSign, UserPlus, Activity, Settings, Download, Upload, Eye, Edit, Trash2, Plus, Search, Filter, Calendar } from 'lucide-react';
import { toast, Toaster } from 'sonner';

// Import charts
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Form handling
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

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

// Landing Page Component (Enhanced)
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
              <a href="#features" className="block px-3 py-2 text-slate-600 hover:text-emerald-600">Recursos</a>
              <a href="#pricing" className="block px-3 py-2 text-slate-600 hover:text-emerald-600">Preços</a>
              <a href="#about" className="block px-3 py-2 text-slate-600 hover:text-emerald-600">Sobre</a>
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
                  <span className="text-sm">Suporte prioritário</span>
                </div>
                <Button className="w-full mt-6" variant="outline" onClick={handleGetStarted}>
                  Falar com Vendas
                </Button>
              </CardContent>
            </Card>
          </div>
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
                Smart Business Consulting para PMEs angolanas
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
                <li><a href="#" className="hover:text-white transition-colors">Central de Ajuda</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contato</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
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

// Enhanced Auth Page Component
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

// Enhanced Dashboard Component
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
        session_id: currentSessionId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setCurrentSessionId(response.data.session_id);
      setChatMessages(prev => [{
        id: Date.now(),
        message: currentMessage,
        response: response.data.response,
        timestamp: new Date().toISOString(),
        topic: response.data.topic
      }, ...prev]);
      setCurrentMessage('');
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
      link.setAttribute('download', `consultoria-growen-${sessionId.substring(0, 8)}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('PDF baixado com sucesso!');
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

  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Chart colors
  const chartColors = ['#2ECC71', '#1A2930', '#3498DB', '#E74C3C', '#F39C12'];

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

// Dashboard Content Component
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
                <p className="text-sm font-medium text-slate-600">Relatórios</p>
                <p className="text-2xl font-bold">{overview.monthly_reports || 0}</p>
                <p className="text-xs text-slate-500 mt-1">Este mês</p>
              </div>
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-purple-600" />
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
            <CardDescription>Clientes, consultas e relatórios nos últimos 6 meses</CardDescription>
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
                <Line type="monotone" dataKey="reports" stroke="#E74C3C" name="Relatórios" />
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
            <div className="grid md:grid-cols-3 gap-6">
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
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Consultoria Content Component
const ConsultoriaContent = ({ messages, sessions, currentMessage, setCurrentMessage, sendMessage, loading, exportChatToPDF }) => {
  const [selectedSession, setSelectedSession] = useState(null);

  return (
    <div className="grid lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
      {/* Sessions Sidebar */}
      <div className="lg:col-span-1">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="text-lg">Histórico de Sessões</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-2 max-h-96 overflow-y-auto p-4">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedSession === session.id ? 'bg-emerald-50 border border-emerald-200' : 'hover:bg-slate-50'
                  }`}
                  onClick={() => setSelectedSession(session.id)}
                >
                  <h4 className="font-medium text-sm truncate">{session.title}</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    {session.message_count} mensagens
                  </p>
                  <div className="flex justify-between items-center mt-2">
                    <div className="flex flex-wrap gap-1">
                      {session.topics.slice(0, 2).map((topic, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        exportChatToPDF(session.id);
                      }}
                    >
                      <Download className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chat Interface */}
      <div className="lg:col-span-3">
        <Card className="h-full flex flex-col">
          <CardHeader>
            <CardTitle>Consultoria com IA</CardTitle>
            <CardDescription>
              Faça perguntas sobre estratégias de negócio adaptadas para Angola
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <div className="flex-1 space-y-4 max-h-96 overflow-y-auto mb-4">
              {messages.slice(0, 10).map((msg, idx) => (
                <div key={idx} className="space-y-3">
                  <div className="bg-emerald-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-emerald-800">Você:</p>
                      {msg.topic && (
                        <Badge variant="outline" className="text-xs">
                          {msg.topic}
                        </Badge>
                      )}
                    </div>
                    <p className="text-emerald-700">{msg.message}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <p className="font-medium text-slate-800 mb-2">Growen IA:</p>
                    <div className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                      {msg.response}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex gap-4">
              <Textarea
                placeholder="Como posso melhorar as vendas da minha empresa em Angola?"
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                className="flex-1"
                rows={3}
              />
              <Button 
                onClick={sendMessage} 
                disabled={loading || !currentMessage.trim()}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {loading ? 'Enviando...' : 'Enviar'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// CRM Content Component
const CRMContent = ({ clients, fetchClients }) => {
  const [showAddClient, setShowAddClient] = useState(false);
  const [editingClient, setEditingClient] = useState(null);

  const clientForm = useForm({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      company: '',
      industry: '',
      value: 0,
      notes: '',
    },
  });

  const onSubmit = async (data) => {
    try {
      const token = localStorage.getItem('growen_token');
      
      if (editingClient) {
        await axios.put(`${API}/crm/clients/${editingClient.id}`, data, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Cliente atualizado com sucesso!');
      } else {
        await axios.post(`${API}/crm/clients`, data, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Cliente adicionado com sucesso!');
      }
      
      fetchClients();
      setShowAddClient(false);
      setEditingClient(null);
      clientForm.reset();
    } catch (error) {
      const message = error.response?.data?.detail || 'Erro ao salvar cliente';
      toast.error(message);
    }
  };

  const deleteClient = async (clientId) => {
    if (!confirm('Tem certeza que deseja remover este cliente?')) return;
    
    try {
      const token = localStorage.getItem('growen_token');
      await axios.delete(`${API}/crm/clients/${clientId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Cliente removido com sucesso!');
      fetchClients();
    } catch (error) {
      toast.error('Erro ao remover cliente');
    }
  };

  const updateClientStatus = async (clientId, status) => {
    try {
      const token = localStorage.getItem('growen_token');
      await axios.put(`${API}/crm/clients/${clientId}`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Status atualizado!');
      fetchClients();
    } catch (error) {
      toast.error('Erro ao atualizar status');
    }
  };

  const statusOptions = [
    { value: 'lead_novo', label: 'Novo Lead', color: 'bg-blue-100 text-blue-800' },
    { value: 'em_negociacao', label: 'Em Negociação', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'cliente_ativo', label: 'Cliente Ativo', color: 'bg-green-100 text-green-800' },
    { value: 'retido', label: 'Retido', color: 'bg-red-100 text-red-800' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestão de Clientes</h2>
        <Button onClick={() => setShowAddClient(true)} className="bg-emerald-600 hover:bg-emerald-700">
          <UserPlus className="w-4 h-4 mr-2" />
          Adicionar Cliente
        </Button>
      </div>
      
      {/* Client Form Modal */}
      <Dialog open={showAddClient || editingClient} onOpenChange={(open) => {
        if (!open) {
          setShowAddClient(false);
          setEditingClient(null);
          clientForm.reset();
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingClient ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
            <DialogDescription>
              Preencha as informações do cliente
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={clientForm.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  {...clientForm.register('name')}
                  placeholder="Nome do cliente"
                />
                {clientForm.formState.errors.name && (
                  <p className="text-sm text-red-600 mt-1">{clientForm.formState.errors.name.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  {...clientForm.register('email')}
                  placeholder="email@exemplo.com"
                />
                {clientForm.formState.errors.email && (
                  <p className="text-sm text-red-600 mt-1">{clientForm.formState.errors.email.message}</p>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  {...clientForm.register('phone')}
                  placeholder="+244..."
                />
              </div>
              
              <div>
                <Label htmlFor="company">Empresa</Label>
                <Input
                  id="company"
                  {...clientForm.register('company')}
                  placeholder="Nome da empresa"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="industry">Setor</Label>
                <Select onValueChange={(value) => clientForm.setValue('industry', value)}>
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
              
              <div>
                <Label htmlFor="value">Valor Potencial (Kz)</Label>
                <Input
                  id="value"
                  type="number"
                  {...clientForm.register('value', { valueAsNumber: true })}
                  placeholder="0"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                {...clientForm.register('notes')}
                placeholder="Observações sobre o cliente..."
                rows={3}
              />
            </div>
            
            <div className="flex justify-end gap-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setShowAddClient(false);
                  setEditingClient(null);
                  clientForm.reset();
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                {editingClient ? 'Atualizar' : 'Adicionar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Clients List */}
      <div className="grid gap-4">
        {clients.map((client) => (
          <Card key={client.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <h3 className="font-semibold text-lg">{client.name}</h3>
                    <Select
                      value={client.status}
                      onValueChange={(value) => updateClientStatus(client.id, value)}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${option.color.split(' ')[0]}`} />
                              {option.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-slate-600">
                    <div>
                      <span className="font-medium">Email:</span> {client.email}
                    </div>
                    {client.phone && (
                      <div>
                        <span className="font-medium">Telefone:</span> {client.phone}
                      </div>
                    )}
                    {client.company && (
                      <div>
                        <span className="font-medium">Empresa:</span> {client.company}
                      </div>
                    )}
                    {client.value && (
                      <div>
                        <span className="font-medium">Valor:</span> {client.value.toLocaleString('pt-AO')} Kz
                      </div>
                    )}
                  </div>
                  
                  {client.notes && (
                    <p className="text-sm text-slate-600 mt-2">{client.notes}</p>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingClient(client);
                      clientForm.reset(client);
                    }}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteClient(client.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {clients.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 mb-4">Ainda não há clientes cadastrados</p>
              <Button onClick={() => setShowAddClient(true)} className="bg-emerald-600 hover:bg-emerald-700">
                Adicionar Primeiro Cliente
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

// Relatórios Content Component
const RelatoriosContent = ({ reports, fetchReports }) => {
  const [uploadingCSV, setUploadingCSV] = useState(false);

  const uploadCSV = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploadingCSV(true);
    try {
      const token = localStorage.getItem('growen_token');
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(`${API}/reports/upload-csv`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('Arquivo CSV analisado com sucesso!');
      fetchReports();
    } catch (error) {
      const message = error.response?.data?.detail || 'Erro ao analisar arquivo CSV';
      toast.error(message);
    } finally {
      setUploadingCSV(false);
    }
  };

  const generateReport = async (type = 'automatic', period = 'monthly') => {
    try {
      const token = localStorage.getItem('growen_token');
      const response = await axios.post(`${API}/reports/generate`, {
        title: `Relatório ${type} - ${period}`,
        type,
        period
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Relatório gerado com sucesso!');
      fetchReports();
    } catch (error) {
      const message = error.response?.data?.detail || 'Erro ao gerar relatório';
      toast.error(message);
    }
  };

  const exportReportToPDF = async (reportId) => {
    try {
      const token = localStorage.getItem('growen_token');
      const response = await axios.get(`${API}/reports/${reportId}/pdf`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `relatorio-growen-${reportId.substring(0, 8)}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('PDF baixado com sucesso!');
    } catch (error) {
      toast.error('Erro ao exportar PDF');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Relatórios Automáticos</h2>
        <div className="flex gap-4">
          <label className="cursor-pointer">
            <input
              type="file"
              accept=".csv"
              onChange={uploadCSV}
              className="hidden"
              disabled={uploadingCSV}
            />
            <Button disabled={uploadingCSV} className="bg-blue-600 hover:bg-blue-700">
              <Upload className="w-4 h-4 mr-2" />
              {uploadingCSV ? 'Analisando...' : 'Upload CSV'}
            </Button>
          </label>
          <Button 
            onClick={() => generateReport('automatic', 'monthly')} 
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Gerar Relatório
          </Button>
        </div>
      </div>

      {/* Report Templates */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => generateReport('automatic', 'weekly')}>
          <CardContent className="p-6 text-center">
            <Calendar className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Relatório Semanal</h3>
            <p className="text-sm text-slate-600">Análise dos últimos 7 dias</p>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => generateReport('automatic', 'monthly')}>
          <CardContent className="p-6 text-center">
            <BarChart3 className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Relatório Mensal</h3>
            <p className="text-sm text-slate-600">Análise do mês atual</p>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => generateReport('automatic', 'quarterly')}>
          <CardContent className="p-6 text-center">
            <TrendingUp className="w-12 h-12 text-purple-600 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Relatório Trimestral</h3>
            <p className="text-sm text-slate-600">Análise dos últimos 3 meses</p>
          </CardContent>
        </Card>
      </div>

      {/* Reports List */}
      <div className="grid gap-4">
        {reports.map((report) => (
          <Card key={report.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <h3 className="font-semibold text-lg">{report.title}</h3>
                    <Badge variant="outline">{report.type}</Badge>
                    {report.period && (
                      <Badge variant="secondary">{report.period}</Badge>
                    )}
                  </div>
                  
                  <p className="text-sm text-slate-600 mb-4">
                    Criado em {new Date(report.created_at).toLocaleDateString('pt-AO')}
                  </p>
                  
                  <div className="text-sm text-slate-700 line-clamp-3">
                    {report.content.substring(0, 200)}...
                  </div>
                  
                  {report.insights && report.insights.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {report.insights.slice(0, 3).map((insight, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {insight}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => exportReportToPDF(report.id)}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {reports.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 mb-4">Ainda não há relatórios gerados</p>
              <Button onClick={() => generateReport('automatic', 'monthly')} className="bg-emerald-600 hover:bg-emerald-700">
                Gerar Primeiro Relatório
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

// Planos Content Component
const PlanosContent = ({ user }) => {
  const currentPlan = user?.plan || 'free';
  const [paymentMethod, setPaymentMethod] = useState('stripe');

  const plans = {
    free: {
      name: 'Gratuito',
      price_aoa: 0,
      price_usd: 0,
      features: ['5 consultas IA/mês', '10 clientes CRM', '2 relatórios/mês', 'Dashboard básico']
    },
    starter: {
      name: 'Starter',
      price_aoa: 10000,
      price_usd: 12,
      features: ['50 consultas IA/mês', '100 clientes CRM', '10 relatórios/mês', 'Exportação PDF', 'Suporte email']
    },
    pro: {
      name: 'Profissional',
      price_aoa: 20000,
      price_usd: 24,
      features: ['Ilimitado', 'CRM avançado', 'Relatórios ilimitados', 'Suporte prioritário', 'Integrações']
    }
  };

  const upgradePlan = async (planId) => {
    try {
      const token = localStorage.getItem('growen_token');
      const response = await axios.post(`${API}/payments/checkout/session`, {
        plan_id: planId,
        payment_method: paymentMethod
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      const message = error.response?.data?.detail || 'Erro ao processar pagamento';
      toast.error(message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Planos e Preços</h2>
        <p className="text-xl text-slate-600">Preços em Kwanzas para Angola</p>
        <Badge className="mt-2 text-lg px-4 py-2">
          Plano Atual: {plans[currentPlan]?.name}
        </Badge>
      </div>

      {/* Payment Method Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Método de Pagamento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card 
              className={`cursor-pointer transition-colors ${paymentMethod === 'stripe' ? 'border-emerald-500 bg-emerald-50' : ''}`}
              onClick={() => setPaymentMethod('stripe')}
            >
              <CardContent className="p-4 text-center">
                <CreditCard className="w-8 h-8 mx-auto mb-2" />
                <h3 className="font-medium">Stripe</h3>
                <p className="text-sm text-slate-600">Cartão internacional</p>
              </CardContent>
            </Card>
            
            <Card 
              className={`cursor-pointer transition-colors ${paymentMethod === 'multicaixa' ? 'border-emerald-500 bg-emerald-50' : ''}`}
              onClick={() => setPaymentMethod('multicaixa')}
            >
              <CardContent className="p-4 text-center">
                <DollarSign className="w-8 h-8 mx-auto mb-2" />
                <h3 className="font-medium">Multicaixa Express</h3>
                <p className="text-sm text-slate-600">Pagamento local</p>
              </CardContent>
            </Card>
            
            <Card 
              className={`cursor-pointer transition-colors ${paymentMethod === 'manual' ? 'border-emerald-500 bg-emerald-50' : ''}`}
              onClick={() => setPaymentMethod('manual')}
            >
              <CardContent className="p-4 text-center">
                <FileText className="w-8 h-8 mx-auto mb-2" />
                <h3 className="font-medium">Transferência</h3>
                <p className="text-sm text-slate-600">Pagamento manual</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
      
      {/* Plans */}
      <div className="grid md:grid-cols-3 gap-6">
        {Object.entries(plans).map(([planId, plan]) => (
          <Card key={planId} className={`p-6 ${currentPlan === planId ? 'border-emerald-500 border-2' : 'border-slate-200'}`}>
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <div className="text-3xl font-bold">
                {plan.price_aoa.toLocaleString('pt-AO')} Kz
                <span className="text-base font-normal text-slate-500">/mês</span>
              </div>
              {paymentMethod === 'stripe' && plan.price_usd > 0 && (
                <p className="text-sm text-slate-500">
                  (${plan.price_usd} USD)
                </p>
              )}
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm mb-6">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-emerald-600 mr-2" />
                    {feature}
                  </li>
                ))}
              </ul>
              
              {currentPlan === planId ? (
                <Badge className="w-full justify-center py-2">Plano Atual</Badge>
              ) : planId === 'free' ? (
                <Button className="w-full" variant="outline" disabled>
                  Gratuito
                </Button>
              ) : (
                <Button 
                  className="w-full bg-emerald-600 hover:bg-emerald-700" 
                  onClick={() => upgradePlan(planId)}
                >
                  Fazer Upgrade
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Configurações Content Component
const ConfiguracoesContent = ({ user }) => {
  const [activeSection, setActiveSection] = useState('profile');
  
  const profileForm = useForm({
    defaultValues: {
      name: user?.name || '',
      company: user?.company || '',
      phone: user?.phone || '',
      industry: user?.industry || '',
    },
  });

  const passwordForm = useForm({
    defaultValues: {
      current_password: '',
      new_password: '',
      confirm_password: '',
    },
  });

  const updateProfile = async (data) => {
    try {
      const token = localStorage.getItem('growen_token');
      await axios.put(`${API}/auth/profile`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Perfil atualizado com sucesso!');
    } catch (error) {
      const message = error.response?.data?.detail || 'Erro ao atualizar perfil';
      toast.error(message);
    }
  };

  const changePassword = async (data) => {
    if (data.new_password !== data.confirm_password) {
      toast.error('As senhas não coincidem');
      return;
    }

    try {
      const token = localStorage.getItem('growen_token');
      await axios.post(`${API}/auth/change-password`, {
        current_password: data.current_password,
        new_password: data.new_password,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Senha alterada com sucesso!');
      passwordForm.reset();
    } catch (error) {
      const message = error.response?.data?.detail || 'Erro ao alterar senha';
      toast.error(message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">Configurações</h2>
      
      <Tabs value={activeSection} onValueChange={setActiveSection}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="security">Segurança</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações do Perfil</CardTitle>
              <CardDescription>
                Atualize suas informações pessoais e empresariais
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={profileForm.handleSubmit(updateProfile)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nome completo</Label>
                    <Input
                      id="name"
                      {...profileForm.register('name')}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="company">Empresa</Label>
                    <Input
                      id="company"
                      {...profileForm.register('company')}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      {...profileForm.register('phone')}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="industry">Setor</Label>
                    <Select onValueChange={(value) => profileForm.setValue('industry', value)}>
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
                </div>
                
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                  Salvar Alterações
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Alterar Senha</CardTitle>
              <CardDescription>
                Mantenha sua conta segura com uma senha forte
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={passwordForm.handleSubmit(changePassword)} className="space-y-4">
                <div>
                  <Label htmlFor="current_password">Senha atual</Label>
                  <Input
                    id="current_password"
                    type="password"
                    {...passwordForm.register('current_password')}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="new_password">Nova senha</Label>
                    <Input
                      id="new_password"
                      type="password"
                      {...passwordForm.register('new_password')}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="confirm_password">Confirmar nova senha</Label>
                    <Input
                      id="confirm_password"
                      type="password"
                      {...passwordForm.register('confirm_password')}
                    />
                  </div>
                </div>
                
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                  Alterar Senha
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Preferências de Notificação</CardTitle>
              <CardDescription>
                Configure como deseja receber notificações
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email de boas-vindas</p>
                    <p className="text-sm text-slate-600">Receber email quando criar conta</p>
                  </div>
                  <input type="checkbox" defaultChecked className="toggle" />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Notificações de relatório</p>
                    <p className="text-sm text-slate-600">Receber email quando relatório for gerado</p>
                  </div>
                  <input type="checkbox" defaultChecked className="toggle" />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Lembrete de upgrade</p>
                    <p className="text-sm text-slate-600">Receber lembretes sobre upgrade de plano</p>
                  </div>
                  <input type="checkbox" className="toggle" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
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