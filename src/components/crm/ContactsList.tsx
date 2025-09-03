import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Phone, Mail, MoreHorizontal, Edit, Trash } from "lucide-react";

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'novo' | 'engajado' | 'qualificado' | 'convertido' | 'perdido';
  tags: string[];
  source: string;
  value: number;
  lastContact: string;
  nextFollowUp: string;
  notes: string;
}

const mockContacts: Contact[] = [
  {
    id: "1",
    name: "Maria Santos",
    email: "maria@exemplo.com",
    phone: "+351 912 345 678",
    status: "engajado",
    tags: ["lead_interessado", "premium"],
    source: "Diagnóstico",
    value: 2500,
    lastContact: "2024-01-15",
    nextFollowUp: "2024-01-22",
    notes: "Interessada em consultoria premium para salão"
  },
  {
    id: "2", 
    name: "João Silva",
    email: "joao@restaurante.pt",
    phone: "+351 913 456 789",
    status: "qualificado",
    tags: ["cliente_starter"],
    source: "Referência",
    value: 1200,
    lastContact: "2024-01-16",
    nextFollowUp: "2024-01-20",
    notes: "Restaurante com 15 funcionários, precisa de CRM"
  },
  {
    id: "3",
    name: "Ana Costa",
    email: "ana@beleza.com",
    phone: "+351 914 567 890", 
    status: "novo",
    tags: ["lead_novo"],
    source: "Facebook Ads",
    value: 0,
    lastContact: "2024-01-17",
    nextFollowUp: "2024-01-18",
    notes: "Acabou de preencher diagnóstico"
  }
];

const statusColors = {
  novo: "bg-blue-100 text-blue-800",
  engajado: "bg-yellow-100 text-yellow-800", 
  qualificado: "bg-green-100 text-green-800",
  convertido: "bg-purple-100 text-purple-800",
  perdido: "bg-red-100 text-red-800"
};

export function ContactsList() {
  const [contacts, setContacts] = useState<Contact[]>(mockContacts);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const { toast } = useToast();

  const [newContact, setNewContact] = useState({
    name: "",
    email: "",
    phone: "",
    status: "novo" as const,
    source: "",
    value: 0,
    notes: ""
  });

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || contact.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddContact = () => {
    const contact: Contact = {
      id: Math.random().toString(),
      ...newContact,
      tags: ["lead_novo"],
      lastContact: new Date().toISOString().split('T')[0],
      nextFollowUp: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };

    setContacts(prev => [contact, ...prev]);
    setIsDialogOpen(false);
    setNewContact({
      name: "",
      email: "",
      phone: "",
      status: "novo",
      source: "",
      value: 0,
      notes: ""
    });

    toast({
      title: "Contato adicionado",
      description: "Novo contato foi adicionado ao CRM."
    });
  };

  const handleUpdateStatus = (contactId: string, newStatus: Contact['status']) => {
    setContacts(prev => prev.map(contact => 
      contact.id === contactId ? { ...contact, status: newStatus } : contact
    ));

    toast({
      title: "Status atualizado",
      description: "Status do contato foi alterado com sucesso."
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">CRM - Gestão de Contatos</h2>
          <p className="text-muted-foreground">Gerencie seus leads e clientes</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Novo Contato
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Adicionar Novo Contato</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  value={newContact.name}
                  onChange={(e) => setNewContact(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nome completo"
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email" 
                  type="email"
                  value={newContact.email}
                  onChange={(e) => setNewContact(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="email@exemplo.com"
                />
              </div>
              
              <div>
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={newContact.phone}
                  onChange={(e) => setNewContact(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+351 912 345 678"
                />
              </div>
              
              <div>
                <Label htmlFor="source">Origem</Label>
                <Input
                  id="source"
                  value={newContact.source}
                  onChange={(e) => setNewContact(prev => ({ ...prev, source: e.target.value }))}
                  placeholder="Ex: Diagnóstico, Referência"
                />
              </div>
              
              <div>
                <Label htmlFor="value">Valor Potencial (€)</Label>
                <Input
                  id="value"
                  type="number"
                  value={newContact.value}
                  onChange={(e) => setNewContact(prev => ({ ...prev, value: Number(e.target.value) }))}
                  placeholder="0"
                />
              </div>
              
              <div>
                <Label htmlFor="notes">Notas</Label>
                <Textarea
                  id="notes"
                  value={newContact.notes}
                  onChange={(e) => setNewContact(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Informações adicionais..."
                />
              </div>
              
              <Button onClick={handleAddContact} className="w-full">
                Adicionar Contato
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar contatos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="novo">Novo</SelectItem>
            <SelectItem value="engajado">Engajado</SelectItem>
            <SelectItem value="qualificado">Qualificado</SelectItem>
            <SelectItem value="convertido">Convertido</SelectItem>
            <SelectItem value="perdido">Perdido</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {Object.entries(statusColors).map(([status, colorClass]) => {
          const count = contacts.filter(c => c.status === status).length;
          return (
            <Card key={status}>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">{count}</p>
                  <p className="text-sm capitalize text-muted-foreground">{status}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Contacts List */}
      <div className="grid gap-4">
        {filteredContacts.map((contact) => (
          <Card key={contact.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">{contact.name}</h3>
                    <Badge className={statusColors[contact.status]}>
                      {contact.status}
                    </Badge>
                    {contact.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {contact.email}
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      {contact.phone}
                    </div>
                    <div>
                      <strong>Origem:</strong> {contact.source}
                    </div>
                    <div>
                      <strong>Valor:</strong> €{contact.value}
                    </div>
                    <div>
                      <strong>Último contato:</strong> {contact.lastContact}
                    </div>
                    <div>
                      <strong>Próximo follow-up:</strong> {contact.nextFollowUp}
                    </div>
                  </div>
                  
                  {contact.notes && (
                    <p className="mt-3 text-sm bg-muted/50 p-3 rounded">
                      {contact.notes}
                    </p>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Select 
                    value={contact.status} 
                    onValueChange={(value) => handleUpdateStatus(contact.id, value as Contact['status'])}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="novo">Novo</SelectItem>
                      <SelectItem value="engajado">Engajado</SelectItem>
                      <SelectItem value="qualificado">Qualificado</SelectItem>
                      <SelectItem value="convertido">Convertido</SelectItem>
                      <SelectItem value="perdido">Perdido</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                  
                  <Button variant="outline" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredContacts.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <p>Nenhum contato encontrado com os filtros aplicados.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}