import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Separator } from './ui/separator';
import { 
  FileText, Download, Upload, Eye, Calendar, Filter, Plus, 
  Users, ShieldCheck, Settings, BarChart3, DollarSign, 
  AlertCircle, CheckCircle, Activity, TrendingUp, Mail, 
  CreditCard, Clock, Award, Star, Building, MessageCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Schemas
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

// Relatórios Content Component
export const RelatoriosContent = ({ reports, fetchReports }) => {
  const [showReportForm, setShowReportForm] = useState(false);
  const [uploadingCSV, setUploadingCSV] = useState(false);

  const reportForm = useForm({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      title: '',
      type: 'custom',
      period: '',
      sections: ['overview', 'clients', 'sales', 'performance'],
      include_charts: true,
      include_insights: true,
    },
  });

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

  const generateCustomReport = async (data) => {
    try {
      const token = localStorage.getItem('growen_token');
      
      // Process date range
      let processedData = { ...data };
      if (data.period === 'custom' && data.date_range) {
        processedData.date_range = {
          start: data.date_range.start,
          end: data.date_range.end
        };
      }

      const response = await axios.post(`${API}/reports/generate-custom`, processedData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Relatório gerado com sucesso!');
      setShowReportForm(false);
      reportForm.reset();
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
            onClick={() => setShowReportForm(true)} 
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Relatório
          </Button>
        </div>
      </div>

      {/* Custom Report Form Modal */}
      <Dialog open={showReportForm} onOpenChange={setShowReportForm}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Gerar Relatório Personalizado</DialogTitle>
            <DialogDescription>
              Configure as opções do seu relatório personalizado
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={reportForm.handleSubmit(generateCustomReport)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Título do Relatório *</Label>
                <Input
                  id="title"
                  {...reportForm.register('title')}
                  placeholder="Ex: Relatório Mensal Janeiro 2025"
                />
                {reportForm.formState.errors.title && (
                  <p className="text-sm text-red-600 mt-1">{reportForm.formState.errors.title.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="period">Período</Label>
                <Select onValueChange={(value) => reportForm.setValue('period', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Semanal</SelectItem>
                    <SelectItem value="monthly">Mensal</SelectItem>
                    <SelectItem value="quarterly">Trimestral</SelectItem>
                    <SelectItem value="custom">Personalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {reportForm.watch('period') === 'custom' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_date">Data Início</Label>
                  <Input
                    id="start_date"
                    type="date"
                    {...reportForm.register('date_range.start')}
                  />
                </div>
                <div>
                  <Label htmlFor="end_date">Data Fim</Label>
                  <Input
                    id="end_date"
                    type="date"
                    {...reportForm.register('date_range.end')}
                  />
                </div>
              </div>
            )}

            <div>
              <Label>Seções do Relatório</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {[
                  { id: 'overview', label: 'Visão Geral' },
                  { id: 'clients', label: 'Análise de Clientes' },
                  { id: 'sales', label: 'Vendas e Pipeline' },
                  { id: 'performance', label: 'Performance' },
                  { id: 'insights', label: 'Insights Avançados' },
                  { id: 'recommendations', label: 'Recomendações' }
                ].map((section) => (
                  <div key={section.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={section.id}
                      defaultChecked={reportForm.getValues('sections').includes(section.id)}
                      onChange={(e) => {
                        const currentSections = reportForm.getValues('sections');
                        if (e.target.checked) {
                          reportForm.setValue('sections', [...currentSections, section.id]);
                        } else {
                          reportForm.setValue('sections', currentSections.filter(s => s !== section.id));
                        }
                      }}
                      className="rounded border-slate-300"
                    />
                    <Label htmlFor={section.id} className="text-sm">{section.label}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="include_charts"
                  {...reportForm.register('include_charts')}
                  className="rounded border-slate-300"
                />
                <Label htmlFor="include_charts">Incluir Gráficos</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="include_insights"
                  {...reportForm.register('include_insights')}
                  className="rounded border-slate-300"
                />
                <Label htmlFor="include_insights">Incluir Insights IA</Label>
              </div>
            </div>
            
            <div className="flex justify-end gap-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowReportForm(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                Gerar Relatório
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Report Templates */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => {
          reportForm.setValue('title', 'Relatório Semanal');
          reportForm.setValue('period', 'weekly');
          generateCustomReport(reportForm.getValues());
        }}>
          <CardContent className="p-6 text-center">
            <Calendar className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Relatório Semanal</h3>
            <p className="text-sm text-slate-600">Análise dos últimos 7 dias</p>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => {
          reportForm.setValue('title', 'Relatório Mensal');
          reportForm.setValue('period', 'monthly');
          generateCustomReport(reportForm.getValues());
        }}>
          <CardContent className="p-6 text-center">
            <BarChart3 className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Relatório Mensal</h3>
            <p className="text-sm text-slate-600">Análise do mês atual</p>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => {
          reportForm.setValue('title', 'Relatório Trimestral');
          reportForm.setValue('period', 'quarterly');
          generateCustomReport(reportForm.getValues());
        }}>
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
              <Button onClick={() => setShowReportForm(true)} className="bg-emerald-600 hover:bg-emerald-700">
                Gerar Primeiro Relatório
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

// Admin Content Component
export const AdminContent = () => {
  const [adminStats, setAdminStats] = useState({});
  const [users, setUsers] = useState([]);
  const [partners, setPartners] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminStats();
    if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'partners') {
      fetchPartners();
    }
  }, [activeTab]);

  const fetchAdminStats = async () => {
    try {
      const token = localStorage.getItem('growen_token');
      const response = await axios.get(`${API}/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAdminStats(response.data);
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('growen_token');
      const response = await axios.get(`${API}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchPartners = async () => {
    try {
      const token = localStorage.getItem('growen_token');
      const response = await axios.get(`${API}/admin/partners`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPartners(response.data);
    } catch (error) {
      console.error('Error fetching partners:', error);
    }
  };

  const updateUser = async (userId, updateData) => {
    try {
      const token = localStorage.getItem('growen_token');
      await axios.put(`${API}/admin/users/${userId}`, updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Usuário atualizado com sucesso!');
      fetchUsers();
    } catch (error) {
      toast.error('Erro ao atualizar usuário');
    }
  };

  const updatePartner = async (partnerId, updateData) => {
    try {
      const token = localStorage.getItem('growen_token');
      await axios.put(`${API}/admin/partners/${partnerId}`, updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Parceiro atualizado com sucesso!');
      fetchPartners();
    } catch (error) {
      toast.error('Erro ao atualizar parceiro');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">
      <Activity className="w-8 h-8 animate-spin text-emerald-600" />
    </div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Painel Administrativo</h2>
        <Badge className="bg-red-600 text-white">
          <ShieldCheck className="w-4 h-4 mr-1" />
          Admin
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="partners">Parceiros</TabsTrigger>
          <TabsTrigger value="system">Sistema</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Admin Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Total Usuários</p>
                    <p className="text-2xl font-bold">{adminStats.total_users || 0}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {adminStats.active_users || 0} ativos
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
                    <p className="text-sm font-medium text-slate-600">Receita Total</p>
                    <p className="text-2xl font-bold">{(adminStats.total_revenue || 0).toLocaleString('pt-AO')} Kz</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Este mês: {(adminStats.monthly_revenue || 0).toLocaleString('pt-AO')} Kz
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Consultas IA</p>
                    <p className="text-2xl font-bold">{adminStats.total_consultations || 0}</p>
                    <p className="text-xs text-slate-500 mt-1">Total plataforma</p>
                  </div>
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-4 h-4 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Relatórios</p>
                    <p className="text-2xl font-bold">{adminStats.total_reports || 0}</p>
                    <p className="text-xs text-slate-500 mt-1">Gerados</p>
                  </div>
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Crescimento de Usuários</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={adminStats.user_growth || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="users" stroke="#2ECC71" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Indústrias</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={adminStats.top_industries || []}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      label={(entry) => entry.industry}
                    >
                      {(adminStats.top_industries || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#2ECC71', '#3498DB', '#E74C3C', '#F39C12', '#9B59B6'][index % 5]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-slate-200">
              <thead>
                <tr className="bg-slate-50">
                  <th className="border border-slate-200 p-3 text-left">Nome</th>
                  <th className="border border-slate-200 p-3 text-left">Email</th>
                  <th className="border border-slate-200 p-3 text-left">Plano</th>
                  <th className="border border-slate-200 p-3 text-left">Status</th>
                  <th className="border border-slate-200 p-3 text-left">Cadastro</th>
                  <th className="border border-slate-200 p-3 text-left">Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50">
                    <td className="border border-slate-200 p-3">
                      <div>
                        <p className="font-medium">{user.name}</p>
                        {user.company && <p className="text-sm text-slate-500">{user.company}</p>}
                      </div>
                    </td>
                    <td className="border border-slate-200 p-3">{user.email}</td>
                    <td className="border border-slate-200 p-3">
                      <Badge variant={user.plan === 'pro' ? 'default' : 'secondary'}>
                        {user.plan}
                      </Badge>
                    </td>
                    <td className="border border-slate-200 p-3">
                      <Badge variant={user.is_active ? 'default' : 'destructive'}>
                        {user.is_active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </td>
                    <td className="border border-slate-200 p-3">
                      {new Date(user.created_at).toLocaleDateString('pt-AO')}
                    </td>
                    <td className="border border-slate-200 p-3">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateUser(user.id, { is_active: !user.is_active })}
                        >
                          {user.is_active ? 'Desativar' : 'Ativar'}
                        </Button>
                        <Select onValueChange={(value) => updateUser(user.id, { plan: value })}>
                          <SelectTrigger className="w-24">
                            <SelectValue placeholder={user.plan} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="free">Free</SelectItem>
                            <SelectItem value="starter">Starter</SelectItem>
                            <SelectItem value="pro">Pro</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="partners" className="space-y-6">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-slate-200">
              <thead>
                <tr className="bg-slate-50">
                  <th className="border border-slate-200 p-3 text-left">Empresa</th>
                  <th className="border border-slate-200 p-3 text-left">Contato</th>
                  <th className="border border-slate-200 p-3 text-left">Categoria</th>
                  <th className="border border-slate-200 p-3 text-left">Avaliação</th>
                  <th className="border border-slate-200 p-3 text-left">Status</th>
                  <th className="border border-slate-200 p-3 text-left">Ações</th>
                </tr>
              </thead>
              <tbody>
                {partners.map((partner) => (
                  <tr key={partner.id} className="hover:bg-slate-50">
                    <td className="border border-slate-200 p-3">
                      <div>
                        <p className="font-medium">{partner.company}</p>
                        <p className="text-sm text-slate-500">{partner.name}</p>
                      </div>
                    </td>
                    <td className="border border-slate-200 p-3">
                      <div>
                        <p className="text-sm">{partner.email}</p>
                        {partner.phone && <p className="text-sm text-slate-500">{partner.phone}</p>}
                      </div>
                    </td>
                    <td className="border border-slate-200 p-3">
                      <Badge variant="secondary">{partner.service_category}</Badge>
                    </td>
                    <td className="border border-slate-200 p-3">
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
                    </td>
                    <td className="border border-slate-200 p-3">
                      <div className="flex gap-1">
                        <Badge variant={partner.is_verified ? 'default' : 'secondary'}>
                          {partner.is_verified ? 'Verificado' : 'Pendente'}
                        </Badge>
                        <Badge variant={partner.is_active ? 'default' : 'destructive'}>
                          {partner.is_active ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </div>
                    </td>
                    <td className="border border-slate-200 p-3">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updatePartner(partner.id, { is_verified: !partner.is_verified })}
                        >
                          {partner.is_verified ? 'Desverificar' : 'Verificar'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updatePartner(partner.id, { is_active: !partner.is_active })}
                        >
                          {partner.is_active ? 'Desativar' : 'Ativar'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Status do Sistema</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>API Backend</span>
                  <Badge className="bg-green-600 text-white">Online</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Base de Dados</span>
                  <Badge className="bg-green-600 text-white">Conectado</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>IA (OpenAI)</span>
                  <Badge className="bg-green-600 text-white">Ativo</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Stripe</span>
                  <Badge className="bg-green-600 text-white">Configurado</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Configurações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="w-4 h-4 mr-2" />
                  Configurar SMTP
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Mail className="w-4 h-4 mr-2" />
                  Templates de Email
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Exportar Dados
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <ShieldCheck className="w-4 h-4 mr-2" />
                  Logs do Sistema
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Plans Content Component
export const PlanosContent = ({ user }) => {
  const currentPlan = user?.plan || 'free';
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [loading, setLoading] = useState(false);

  const plans = {
    free: {
      name: 'Gratuito',
      price_aoa: 0,
      price_usd: 0,
      features: ['5 consultas IA/mês', '10 clientes CRM', '2 relatórios/mês', '10 emails/mês', 'Dashboard básico']
    },
    starter: {
      name: 'Starter',
      price_aoa: 10000,
      price_usd: 12,
      features: ['50 consultas IA/mês', '100 clientes CRM', '10 relatórios/mês', '100 emails/mês', 'Exportação PDF', 'Suporte email']
    },
    pro: {
      name: 'Profissional',
      price_aoa: 20000,
      price_usd: 24,
      features: ['Ilimitado', 'CRM avançado', 'Relatórios ilimitados', 'Emails ilimitados', 'Suporte prioritário', 'Consultoria WhatsApp']
    }
  };

  const upgradePlan = async (planId) => {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = (planId) => {
    upgradePlan(planId);
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
                <div className="flex flex-col space-y-3">
                  <Button 
                    onClick={() => handleUpgrade(planId)}
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                    disabled={loading}
                  >
                    {loading ? 'Processando...' : 'Escolher Plano'}
                  </Button>
                  
                  <Button
                    onClick={() => {
                      const whatsappNumber = "+244943201590";
                      const message = encodeURIComponent(`Olá! Gostaria de alterar meu plano para ${plans[planId].name} (${plans[planId].price_aoa.toLocaleString()} Kz/mês). Podem me ajudar com esse processo?`);
                      window.open(`https://wa.me/${whatsappNumber.replace('+', '')}?text=${message}`, '_blank');
                    }}
                    variant="outline"
                    className="w-full text-green-600 border-green-600 hover:bg-green-50"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Falar via WhatsApp
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Configurações Content Component
export const ConfiguracoesContent = ({ user }) => {
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
export const SuccessPage = () => {
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