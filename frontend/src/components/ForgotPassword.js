import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ArrowLeft, Mail } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001/api';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Por favor, digite seu email');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API}/auth/forgot-password`, { email });
      setSent(true);
      toast.success('Instruções enviadas! Verifique seu email.');
    } catch (error) {
      toast.error('Erro ao enviar instruções. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center mb-8">
            <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">G</span>
            </div>
            <span className="ml-2 text-2xl font-bold text-slate-900">Growen</span>
          </Link>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Esqueceu sua senha?</CardTitle>
            <CardDescription>
              {sent ? 
                'Verifique seu email para continuar' :
                'Digite seu email e enviaremos instruções para redefinir sua senha'
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {sent ? (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                  <Mail className="w-8 h-8 text-emerald-600" />
                </div>
                <p className="text-slate-600">
                  Se o email <strong>{email}</strong> existir em nossa base de dados, você receberá instruções para redefinir sua senha.
                </p>
                <div className="space-y-2">
                  <Button 
                    onClick={() => setSent(false)}
                    variant="outline" 
                    className="w-full"
                  >
                    Tentar outro email
                  </Button>
                  <Button 
                    onClick={() => navigate('/auth')}
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                  >
                    Voltar ao Login
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    required
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                  disabled={loading}
                >
                  {loading ? 'Enviando...' : 'Enviar Instruções'}
                </Button>
                
                <div className="text-center">
                  <Link 
                    to="/auth" 
                    className="inline-flex items-center text-sm text-emerald-600 hover:text-emerald-700"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Voltar ao Login
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;