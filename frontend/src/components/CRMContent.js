import React, { useState } from 'react';
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
import { UserPlus, Edit, Trash2, Phone, Mail, MessageCircle, ExternalLink, FileText } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const clientSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  company: z.string().optional(),
  industry: z.string().optional(),
  value: z.number().optional(),
  notes: z.string().optional(),
});

const emailSchema = z.object({
  subject: z.string().min(3, 'Assunto deve ter pelo menos 3 caracteres'),
  content: z.string().min(10, 'Conteúdo deve ter pelo menos 10 caracteres'),
});

const CRMContent = ({ clients, fetchClients }) => {
  const [showAddClient, setShowAddClient] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [emailTemplates, setEmailTemplates] = useState([]);
  const [showCreateInvoice, setShowCreateInvoice] = useState(false);

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

  const emailForm = useForm({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      subject: '',
      content: '',
    },
  });

  const fetchEmailTemplates = async () => {
    try {
      const token = localStorage.getItem('growen_token');
      const response = await axios.get(`${API}/email-templates`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmailTemplates(response.data);
    } catch (error) {
      console.error('Error fetching email templates:', error);
    }
  };

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

  const handleCallClient = async (client) => {
    try {
      const token = localStorage.getItem('growen_token');
      const response = await axios.get(`${API}/crm/clients/${client.id}/call-link`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Show options to user
      const action = confirm('Como deseja entrar em contato?\n\nOK - Ligar diretamente\nCancelar - WhatsApp');
      
      if (action) {
        window.location.href = response.data.call_link;
      } else {
        window.open(response.data.whatsapp_link, '_blank');
      }
    } catch (error) {
      toast.error('Erro ao processar ligação');
    }
  };

  const openEmailDialog = (client) => {
    setSelectedClient(client);
    setShowEmailDialog(true);
    fetchEmailTemplates();
  };

  const sendEmail = async (data) => {
    try {
      const token = localStorage.getItem('growen_token');
      await axios.post(`${API}/crm/clients/${selectedClient.id}/send-email`, {
        client_id: selectedClient.id,
        subject: data.subject,
        content: data.content
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Email enviado com sucesso!');
      setShowEmailDialog(false);
      emailForm.reset();
      fetchClients();
    } catch (error) {
      const message = error.response?.data?.detail || 'Erro ao enviar email';
      toast.error(message);
    }
  };

  const useEmailTemplate = (template) => {
    const content = template.content
      .replace('[NOME]', selectedClient?.name || '')
      .replace('[EMPRESA]', selectedClient?.company || '');
    
    emailForm.setValue('subject', template.subject);
    emailForm.setValue('content', content);
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

      {/* Email Dialog */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Enviar Email para {selectedClient?.name}</DialogTitle>
            <DialogDescription>
              Envie um email profissional para o cliente
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Email Templates */}
            <div>
              <Label>Templates de Email</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {emailTemplates.map((template) => (
                  <Button
                    key={template.id}
                    variant="outline"
                    size="sm"
                    onClick={() => useEmailTemplate(template)}
                  >
                    {template.name}
                  </Button>
                ))}
              </div>
            </div>

            <form onSubmit={emailForm.handleSubmit(sendEmail)} className="space-y-4">
              <div>
                <Label htmlFor="subject">Assunto *</Label>
                <Input
                  id="subject"
                  {...emailForm.register('subject')}
                  placeholder="Assunto do email"
                />
                {emailForm.formState.errors.subject && (
                  <p className="text-sm text-red-600 mt-1">{emailForm.formState.errors.subject.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="content">Conteúdo *</Label>
                <Textarea
                  id="content"
                  {...emailForm.register('content')}
                  placeholder="Escreva sua mensagem aqui..."
                  rows={8}
                />
                {emailForm.formState.errors.content && (
                  <p className="text-sm text-red-600 mt-1">{emailForm.formState.errors.content.message}</p>
                )}
              </div>
              
              <div className="flex justify-end gap-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowEmailDialog(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                  <Mail className="w-4 h-4 mr-2" />
                  Enviar Email
                </Button>
              </div>
            </form>
          </div>
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
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-slate-600 mb-4">
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
                    <p className="text-sm text-slate-600 mb-4">{client.notes}</p>
                  )}

                  {/* Communication History */}
                  {client.communication_history && client.communication_history.length > 0 && (
                    <div className="border-t pt-4">
                      <h4 className="text-sm font-medium text-slate-700 mb-2">Histórico de Comunicações</h4>
                      <div className="space-y-2">
                        {client.communication_history.slice(0, 3).map((comm, idx) => (
                          <div key={idx} className="text-xs text-slate-500 flex items-center gap-2">
                            {comm.type === 'email' ? <Mail className="w-3 h-3" /> : <Phone className="w-3 h-3" />}
                            <span>{comm.type === 'email' ? comm.subject : 'Ligação'}</span>
                            <span>-</span>
                            <span>{new Date(comm.timestamp).toLocaleDateString('pt-AO')}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col gap-2">
                  {/* Communication buttons */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEmailDialog(client)}
                      title="Enviar Email"
                    >
                      <Mail className="w-4 h-4" />
                    </Button>
                    {client.phone && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCallClient(client)}
                        title="Ligar ou WhatsApp"
                      >
                        <Phone className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  
                  {/* Action buttons */}
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
              </div>
            </CardContent>
          </Card>
        ))}
        
        {clients.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <UserPlus className="w-16 h-16 text-slate-400 mx-auto mb-4" />
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

export default CRMContent;