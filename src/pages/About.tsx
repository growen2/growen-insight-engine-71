import { Header } from "@/components/layout/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Heart, Target, Zap } from "lucide-react";

const team = [
  {
    name: "João Silva",
    role: "CEO & Fundador",
    description: "Empresário angolano com 15 anos de experiência em consultoria empresarial",
    avatar: "JS"
  },
  {
    name: "Maria Santos", 
    role: "CTO",
    description: "Especialista em IA e tecnologia, formada em Portugal com experiência em startups",
    avatar: "MS"
  },
  {
    name: "António Cardoso",
    role: "Head of Business",
    description: "Consultor empresarial especializado no mercado angolano",
    avatar: "AC"
  }
];

const values = [
  {
    icon: <Heart className="w-8 h-8" />,
    title: "Compromisso com Angola",
    description: "Desenvolvemos soluções pensadas especificamente para o mercado e cultura angolana"
  },
  {
    icon: <Target className="w-8 h-8" />,
    title: "Resultados Práticos",
    description: "Focamos em entregar valor real e crescimento mensurável para nossos clientes"
  },
  {
    icon: <Zap className="w-8 h-8" />,
    title: "Inovação Acessível",
    description: "Democratizamos o acesso à tecnologia avançada para pequenos e médios empresários"
  },
  {
    icon: <Users className="w-8 h-8" />,
    title: "Suporte Local",
    description: "Equipa 100% angolana com atendimento em português e entendimento cultural"
  }
];

export default function About() {
  return (
    <div className="min-h-screen">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-b from-background to-muted/30">
          <div className="container mx-auto px-4 text-center">
            <Badge variant="secondary" className="mb-6">
              Sobre o Growen
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Transformando Negócios{" "}
              <span className="gradient-text">em Angola</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Somos a primeira plataforma angolana de gestão empresarial inteligente, 
              criada por angolanos para ajudar empresários locais a crescerem com tecnologia de ponta.
            </p>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Nossa Missão
              </h2>
              <p className="text-lg text-muted-foreground">
                Democratizar o acesso a ferramentas empresariais avançadas para micro e pequenos 
                empresários angolanos, oferecendo soluções inteligentes que respeitam nossa cultura 
                e atendem às necessidades específicas do mercado local.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <Card key={index} className="text-center glass-effect">
                  <CardContent className="p-6">
                    <div className="w-16 h-16 gradient-primary rounded-xl flex items-center justify-center mx-auto mb-4 text-white">
                      {value.icon}
                    </div>
                    <h3 className="text-lg font-semibold mb-3">{value.title}</h3>
                    <p className="text-muted-foreground text-sm">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Nossa Equipa Angolana
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Profissionais experientes e apaixonados por ajudar empresários 
                angolanos a alcançarem o sucesso
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {team.map((member, index) => (
                <Card key={index} className="text-center glass-effect">
                  <CardContent className="p-6">
                    <div className="w-20 h-20 gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 text-white text-xl font-bold">
                      {member.avatar}
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{member.name}</h3>
                    <Badge variant="secondary" className="mb-4">
                      {member.role}
                    </Badge>
                    <p className="text-muted-foreground text-sm">{member.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
                Nossa História
              </h2>
              
              <div className="space-y-8">
                <Card className="glass-effect">
                  <CardContent className="p-8">
                    <h3 className="text-2xl font-semibold mb-4">O Início</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      O Growen nasceu da frustração de empresários angolanos que lutavam para 
                      encontrar soluções tecnológicas adequadas à realidade local. Ferramentas 
                      desenvolvidas para outros mercados simplesmente não funcionavam em Angola.
                    </p>
                  </CardContent>
                </Card>

                <Card className="glass-effect">
                  <CardContent className="p-8">
                    <h3 className="text-2xl font-semibold mb-4">A Solução</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Decidimos criar uma plataforma verdadeiramente angolana - com suporte em 
                      Kwanzas, integração com fornecedores locais, e mais importante: uma equipa 
                      que entende os desafios únicos do mercado angolano.
                    </p>
                  </CardContent>
                </Card>

                <Card className="glass-effect">
                  <CardContent className="p-8">
                    <h3 className="text-2xl font-semibold mb-4">O Futuro</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Hoje, mais de 200 empresários confiam no Growen para gerir e fazer crescer 
                      os seus negócios. Nosso objetivo é ajudar 1000 empresas angolanas a 
                      prosperarem nos próximos 2 anos.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}