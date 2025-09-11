import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Download, Brain, MessageSquare } from 'lucide-react';

const ConsultoriaContent = ({ messages, sessions, currentMessage, setCurrentMessage, sendMessage, loading, exportChatToPDF }) => {
  const [selectedSession, setSelectedSession] = useState(null);

  return (
    <div className="grid lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
      {/* Sessions Sidebar */}
      <div className="lg:col-span-1">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="text-lg">Histórico de Sessões</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-2 max-h-96 overflow-y-auto p-4">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedSession === session.id ? 'bg-emerald-50 border border-emerald-200' : 'hover:bg-slate-50'
                  }`}
                  onClick={() => setSelectedSession(session.id)}
                >
                  <h4 className="font-medium text-sm truncate">{session.title}</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    {session.message_count} mensagens
                  </p>
                  <div className="flex justify-between items-center mt-2">
                    <div className="flex flex-wrap gap-1">
                      {session.topics?.slice(0, 2).map((topic, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        exportChatToPDF(session.id);
                      }}
                    >
                      <Download className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chat Interface */}
      <div className="lg:col-span-3">
        <Card className="h-full flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-6 h-6 text-emerald-600" />
              Consultoria com IA
            </CardTitle>
            <CardDescription>
              Faça perguntas sobre estratégias de negócio adaptadas para Angola
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <div className="flex-1 space-y-4 max-h-96 overflow-y-auto mb-4">
              {messages.slice(0, 10).map((msg, idx) => (
                <div key={idx} className="space-y-3">
                  <div className="bg-emerald-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-emerald-800">Você:</p>
                      {msg.topic && (
                        <Badge variant="outline" className="text-xs">
                          {msg.topic}
                        </Badge>
                      )}
                    </div>
                    <p className="text-emerald-700">{msg.message}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="w-4 h-4 text-slate-600" />
                      <p className="font-medium text-slate-800">Growen IA:</p>
                    </div>
                    <div className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                      {msg.response}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex gap-4">
              <Textarea
                placeholder="Como posso expandir minha empresa em Angola? Quais são as principais oportunidades no mercado angolano?"
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                className="flex-1"
                rows={3}
              />
              <Button 
                onClick={sendMessage} 
                disabled={loading || !currentMessage.trim()}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {loading ? 'Enviando...' : 'Enviar'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ConsultoriaContent;