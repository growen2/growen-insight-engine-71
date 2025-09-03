import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Star, 
  MapPin, 
  Phone,
  Palette,
  Megaphone,
  Scale,
  Calculator,
  Truck,
  Camera,
  Code,
  Users
} from "lucide-react";

const categories = [
  { name: "Design & Criação", icon: <Palette className="w-5 h-5" />, count: 12 },
  { name: "Marketing Digital", icon: <Megaphone className="w-5 h-5" />, count: 8 },
  { name: "Jurídico", icon: <Scale className="w-5 h-5" />, count: 6 },
  { name: "Contabilidade", icon: <Calculator className="w-5 h-5" />, count: 15 },
  { name: "Logística", icon: <Truck className="w-5 h-5" />, count: 4 },
  { name: "Fotografia", icon: <Camera className="w-5 h-5" />, count: 7 },
  { name: "Desenvolvimento", icon: <Code className="w-5 h-5" />, count: 5 },
  { name: "Consultoria", icon: <Users className="w-5 h-5" />, count: 10 }
];

const partners = [
  {
    name: "Angola Design Studio",
    category: "Design & Criação",
    rating: 4.9,
    reviews: 127,
    location: "Luanda",
    description: "Especialistas em identidade visual e design gráfico para empresas angolanas",
    price: "Desde AOA 25.000",
    badge: "Destaque",
    services: ["Logo Design", "Material Gráfico", "Websites"]
  },
  {
    name: "Digital Marketing AO",
    category: "Marketing Digital", 
    rating: 4.8,
    reviews: 89,
    location: "Luanda",
    description: "Agência focada em marketing digital para o mercado angolano",
    price: "Desde AOA 45.000",
    badge: "Verificado",
    services: ["Redes Sociais", "Google Ads", "SEO"]
  },
  {
    name: "Sociedade de Advogados Santos",
    category: "Jurídico",
    rating: 4.9,
    reviews: 156,
    location: "Luanda",
    description: "Consultoria jurídica empresarial com 20 anos de experiência",
    price: "Consulta gratuita",
    badge: "Premium",
    services: ["Constituição", "Contratos", "Compliance"]
  },
  {
    name: "Contabilidade Express",
    category: "Contabilidade",
    rating: 4.7,
    reviews: 203,
    location: "Benguela",
    description: "Serviços contabilísticos especializados para PMEs",
    price: "Desde AOA 35.000",
    badge: "Popular",
    services: ["Contabilidade", "Fiscalidade", "Relatórios"]
  },
  {
    name: "LogiAngola",
    category: "Logística",
    rating: 4.6,
    reviews: 78,
    location: "Luanda",
    description: "Soluções de transporte e logística para todo Angola",
    price: "Orçamento personalizado",
    badge: null,
    services: ["Transporte", "Armazém", "Distribuição"]
  },
  {
    name: "PhotoPro Angola",
    category: "Fotografia",
    rating: 4.8,
    reviews: 94,
    location: "Huambo",
    description: "Fotografia profissional para empresas e eventos corporativos",
    price: "Desde AOA 15.000",
    badge: "Novo",
    services: ["Eventos", "Produtos", "Corporativo"]
  }
];

export default function Marketplace() {
  return (
    <div className="min-h-screen">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-b from-background to-muted/30">
          <div className="container mx-auto px-4 text-center">
            <Badge variant="secondary" className="mb-6">
              Marketplace de Parceiros
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Encontre os Melhores{" "}
              <span className="gradient-text">Profissionais</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Rede curada de profissionais e empresas angolanas especializadas 
              para ajudar o seu negócio a crescer com qualidade garantida.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input 
                  className="pl-12 py-6 text-lg"
                  placeholder="Procurar por serviço ou especialidade..."
                />
                <Button className="absolute right-2 top-2 gradient-primary text-white">
                  Procurar
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              Categorias de Serviços
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {categories.map((category, index) => (
                <Card key={index} className="glass-effect hover:shadow-elegant transition-all cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 gradient-primary rounded-lg flex items-center justify-center mx-auto mb-4 text-white">
                      {category.icon}
                    </div>
                    <h3 className="font-semibold mb-2">{category.name}</h3>
                    <p className="text-sm text-muted-foreground">{category.count} parceiros</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Partners */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Parceiros em Destaque
              </h2>
              <p className="text-lg text-muted-foreground">
                Profissionais verificados e avaliados pela comunidade Growen
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {partners.map((partner, index) => (
                <Card key={index} className="glass-effect hover:shadow-elegant transition-all">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <CardTitle className="text-xl mb-2">{partner.name}</CardTitle>
                        <Badge variant="outline" className="text-xs">
                          {partner.category}
                        </Badge>
                      </div>
                      {partner.badge && (
                        <Badge 
                          variant={partner.badge === "Destaque" ? "default" : "secondary"}
                          className={partner.badge === "Destaque" ? "gradient-primary text-white" : ""}
                        >
                          {partner.badge}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-500 mr-1" />
                        {partner.rating} ({partner.reviews})
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {partner.location}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <p className="text-muted-foreground mb-4">{partner.description}</p>
                    
                    <div className="mb-4">
                      <h4 className="font-semibold text-sm mb-2">Serviços:</h4>
                      <div className="flex flex-wrap gap-2">
                        {partner.services.map((service, serviceIndex) => (
                          <Badge key={serviceIndex} variant="secondary" className="text-xs">
                            {service}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-primary">{partner.price}</span>
                      <Button variant="outline" size="sm">
                        <Phone className="w-4 h-4 mr-2" />
                        Contactar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center mt-12">
              <Button size="lg" variant="outline">
                Ver Todos os Parceiros
              </Button>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <Card className="glass-effect max-w-4xl mx-auto">
              <CardContent className="p-8 text-center">
                <h2 className="text-3xl font-bold mb-4">
                  É um Profissional ou Empresa?
                </h2>
                <p className="text-muted-foreground mb-8">
                  Junte-se à nossa rede de parceiros e faça parte do ecossistema 
                  que está transformando os negócios em Angola
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" className="gradient-primary text-white">
                    Candidatar-se como Parceiro
                  </Button>
                  <Button size="lg" variant="outline">
                    Saber Mais
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}