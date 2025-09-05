import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  Users, 
  TrendingUp, 
  Target, 
  BookOpen, 
  ShoppingCart,
  MessageSquare,
  Settings
} from "lucide-react";
import { ContactsList } from "@/components/crm/ContactsList";
import { CoursesList } from "@/components/academy/CoursesList";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");

  const kpiCards = [
    {
      title: "Receita Mensal",
      value: "Kz 1.850.000",
      change: "+12.5%",
      trend: "up",
      icon: TrendingUp
    },
    {
      title: "Clientes Ativos",
      value: "184",
      change: "+15.2%", 
      trend: "up",
      icon: Users
    },
    {
      title: "Taxa Conversão",
      value: "18.5%",
      change: "+2.1%",
      trend: "up", 
      icon: Target
    },
    {
      title: "CAC Médio",
      value: "Kz 25.000",
      change: "-8.3%",
      trend: "down",
      icon: BarChart3
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold gradient-text">Dashboard Growen</h1>
              <p className="text-muted-foreground">Bem-vindo de volta, <strong>João Silva</strong> • Empresa Angolana</p>
            </div>
            <Button variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              Configurações
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {kpiCards.map((kpi, index) => {
            const Icon = kpi.icon;
            return (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{kpi.value}</div>
                  <p className={`text-xs ${kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    {kpi.change} vs mês anterior
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="crm">CRM</TabsTrigger>
            <TabsTrigger value="marketing">Marketing</TabsTrigger>
            <TabsTrigger value="academy">Academia</TabsTrigger>
            <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
            <TabsTrigger value="reports">Relatórios</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Atividade Recente</CardTitle>
                  <CardDescription>Últimas ações no seu negócio</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      "Novo cliente angolano registrado: Maria Santos - Luanda",
                      "Campanha WhatsApp enviada para 250 contactos",
                      "Relatório executivo gerado com IA",
                      "5 novos leads qualificados via Multicaixa"
                    ].map((activity, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <span className="text-sm">{activity}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Próximas Ações</CardTitle>
                  <CardDescription>Tarefas recomendadas pela IA</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { task: "Optimizar integração com Multicaixa", priority: "Alta" },
                      { task: "Actualizar preços em Kwanzas", priority: "Média" },
                      { task: "Campanha para mercado angolano", priority: "Alta" },
                      { task: "Formação equipa sobre mercado local", priority: "Média" }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm">{item.task}</span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          item.priority === 'Alta' ? 'bg-red-100 text-red-800' :
                          item.priority === 'Média' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {item.priority}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="crm">
            <ContactsList />
          </TabsContent>

          <TabsContent value="marketing">
            <Card>
              <CardHeader>
                <CardTitle>Automação de Marketing</CardTitle>
                <CardDescription>Campanhas e automações ativas</CardDescription>
              </CardHeader>
              <CardContent className="text-center py-12">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Marketing Automation</h3>
                <p className="text-muted-foreground mb-4">
                  Automações de WhatsApp, Email Marketing e campanhas para o mercado angolano
                </p>
                <Badge variant="secondary" className="mb-4">Em Desenvolvimento</Badge>
                <div className="text-sm text-muted-foreground">
                  Disponível em: Q2 2024
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="academy">
            <CoursesList />
          </TabsContent>

          <TabsContent value="marketplace">
            <Card>
              <CardHeader>
                <CardTitle>Marketplace de Serviços</CardTitle>
                <CardDescription>Serviços especializados para seu negócio</CardDescription>
              </CardHeader>
              <CardContent className="text-center py-12">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingCart className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Rede de Parceiros Angolanos</h3>
                <p className="text-muted-foreground mb-4">
                  Conecte-se com fornecedores, consultores e especialistas certificados em Angola
                </p>
                <Badge variant="secondary" className="mb-4">Em Desenvolvimento</Badge>
                <div className="text-sm text-muted-foreground">
                  Disponível em: Q3 2024
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Relatórios Inteligentes</CardTitle>
                <CardDescription>Insights gerados por IA</CardDescription>
              </CardHeader>
              <CardContent className="text-center py-12">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Relatórios Executivos Avançados</h3>
                <p className="text-muted-foreground mb-4">
                  Relatórios personalizados com análise de mercado angolano e projecções financeiras
                </p>
                <Badge variant="outline" className="mb-4 text-green-600 border-green-300">Disponível</Badge>
                <Button variant="outline" size="sm">
                  Gerar Relatório
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;