import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const testimonials = [
  {
    name: "Maria João Silva",
    role: "Proprietária - Loja de Tecidos, Luanda",
    content: "O Growen mudou completamente a forma como gerio o meu negócio. Agora tenho controlo total das vendas e do stock, e a minha loja cresceu 40% em apenas 3 meses.",
    avatar: "MJ"
  },
  {
    name: "António Cardoso",
    role: "Dono de Restaurante, Benguela", 
    content: "Finalmente uma plataforma que entende as necessidades dos empresários angolanos. O sistema de gestão é simples e eficaz, perfeito para o meu restaurante.",
    avatar: "AC"
  },
  {
    name: "Helena Fortunato",
    role: "Consultora de Beleza, Huambo",
    content: "O módulo CRM me ajudou a organizar melhor os meus clientes. Agora sei exatamente quando contactar cada cliente e as minhas vendas aumentaram significativamente.",
    avatar: "HF"
  }
];

export function TestimonialsSection() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            O Que Dizem Os Nossos Clientes Angolanos
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Histórias reais de empresários que transformaram os seus negócios com o Growen
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="glass-effect">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Avatar className="mr-4">
                    <AvatarFallback className="gradient-primary text-white">
                      {testimonial.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-muted-foreground italic">"{testimonial.content}"</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}