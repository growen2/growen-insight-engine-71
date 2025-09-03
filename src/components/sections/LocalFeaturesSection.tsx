import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Banknote, Users, TrendingUp } from "lucide-react";

const localFeatures = [
  {
    icon: <Banknote className="w-8 h-8" />,
    title: "Suporte Kwanza (AOA)",
    description: "Sistema totalmente adaptado à moeda angolana, com conversões automáticas e relatórios em Kwanzas"
  },
  {
    icon: <MapPin className="w-8 h-8" />,
    title: "Logística Local",
    description: "Integração com transportadoras angolanas e sistema de entregas adaptado às principais cidades do país"
  },
  {
    icon: <Users className="w-8 h-8" />,
    title: "Suporte em Português",
    description: "Equipa de suporte 100% angolana, disponível via WhatsApp e telefone em horário comercial local"
  },
  {
    icon: <TrendingUp className="w-8 h-8" />,
    title: "Mercado Angolano",
    description: "Análises e insights específicos do mercado angolano para ajudar a tomar melhores decisões empresariais"
  }
];

export function LocalFeaturesSection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Adaptado à Realidade Angolana
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Desenvolvido por angolanos, para angolanos. Entendemos os desafios únicos 
            do mercado local e criamos soluções específicas para superá-los
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {localFeatures.map((feature, index) => (
            <Card key={index} className="glass-effect hover:shadow-elegant transition-all duration-300">
              <CardHeader>
                <div className="w-16 h-16 gradient-primary rounded-xl flex items-center justify-center mb-4 text-white">
                  {feature.icon}
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}