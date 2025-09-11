import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001/api';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [reset, setReset] = useState(false);

  useEffect(() => {
    if (token) {
      verifyToken();
    } else {
      setTokenValid(false);
    }
  }, [token]);

  const verifyToken = async () => {
    try {
      const response = await axios.get(`${API}/auth/verify-reset-token/${token}`);
      setTokenValid(response.data.valid);
      if (!response.data.valid) {
        toast.error(response.data.message);
      }
    } catch (error) {
      setTokenValid(false);
      toast.error('Token inválido ou expirado');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newPassword) {
      toast.error('Por favor, digite sua nova senha');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API}/auth/reset-password`, {
        token,
        new_password: newPassword
      });
      
      setReset(true);
      toast.success('Senha redefinida com sucesso!');
    } catch (error) {
      const message = error.response?.data?.detail || 'Erro ao redefinir senha';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (tokenValid === null) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (tokenValid === false) {
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
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <CardTitle className="text-2xl font-bold">Token Inválido</CardTitle>
              <CardDescription>
                O link para redefinir senha é inválido ou expirou
              </CardDescription>
            </CardHeader>
            
            <CardContent className="text-center space-y-4">
              <p className="text-slate-600">
                O link pode ter expirado ou já ter sido usado. Solicite um novo link para redefinir sua senha.
              </p>
              <Button 
                onClick={() => navigate('/forgot-password')}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
              >
                Solicitar Novo Link
              </Button>
              <Button 
                onClick={() => navigate('/auth')}
                variant="outline"
                className="w-full"
              >
                Voltar ao Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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
            {reset ? (
              <>
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-emerald-600" />
                </div>
                <CardTitle className="text-2xl font-bold">Senha Redefinida!</CardTitle>
                <CardDescription>
                  Sua senha foi alterada com sucesso
                </CardDescription>
              </>
            ) : (
              <>
                <CardTitle className="text-2xl font-bold">Nova Senha</CardTitle>
                <CardDescription>
                  Digite sua nova senha abaixo
                </CardDescription>
              </>
            )}
          </CardHeader>
          
          <CardContent>
            {reset ? (
              <div className="text-center space-y-4">
                <p className="text-slate-600">
                  Sua senha foi redefinida com sucesso! Agora você pode fazer login com sua nova senha.
                </p>
                <Button 
                  onClick={() => navigate('/auth')}
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                >
                  Fazer Login
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="newPassword">Nova Senha</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Digite sua nova senha"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-slate-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-slate-400" />
                      )}
                    </button>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirme sua nova senha"
                    required
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                  disabled={loading}
                >
                  {loading ? 'Redefinindo...' : 'Redefinir Senha'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResetPasswordPage;