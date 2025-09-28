import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Send, 
  Bot, 
  PenTool, 
  HelpCircle, 
  Map, 
  CheckCircle,
  Upload,
  Star,
  Clock,
  MessageCircle,
  Loader2
} from 'lucide-react';
import aiMascot from '@/assets/ai-mascot.png';

interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: string;
}

interface AIConversation {
  id: string;
  titulo: string;
  tipo: string;
  updated_at: string;
}

interface StudentProgress {
  duvidas_respondidas: number;
  redacoes_enviadas: number;
  mapas_mentais: number;
}

const AIChat: React.FC = () => {
  const { user, isPremium } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [currentConversation, setCurrentConversation] = useState<string | null>(null);
  const [conversations, setConversations] = useState<AIConversation[]>([]);
  const [chatType, setChatType] = useState<string>('geral');
  const [professorType, setProfessorType] = useState<string>('');
  const [progress, setProgress] = useState<StudentProgress>({ 
    duvidas_respondidas: 0, 
    redacoes_enviadas: 0, 
    mapas_mentais: 0 
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Essay submission state
  const [essayTitle, setEssayTitle] = useState('');
  const [essayContent, setEssayContent] = useState('');
  const [essayTheme, setEssayTheme] = useState('');
  const [correctionType, setCorrectionType] = useState('geral');

  const quickQuestions = [
    'Como fazer um resumo eficiente?',
    'Explique as leis de Newton',
    'Qual a estrutura de uma redação dissertativa?',
    'Como calcular porcentagem?',
    'Explique o processo de fotossíntese'
  ];

  const professorTypes = [
    { value: 'portugues', label: 'Prof. de Português', description: 'Foco em gramática e linguística' },
    { value: 'redacao', label: 'Prof. de Redação', description: 'Especialista em argumentação' },
    { value: 'matematica', label: 'Prof. de Matemática', description: 'Explicações lógicas e sequenciais' },
    { value: 'historia', label: 'Prof. de História', description: 'Contextualização histórica' },
    { value: 'geografia', label: 'Prof. de Geografia', description: 'Análise espacial e territorial' },
    { value: 'biologia', label: 'Prof. de Biologia', description: 'Processos biológicos claros' },
    { value: 'quimica', label: 'Prof. de Química', description: 'Reações e processos químicos' },
    { value: 'fisica', label: 'Prof. de Física', description: 'Teoria com aplicações práticas' }
  ];

  useEffect(() => {
    if (user) {
      loadConversations();
      loadProgress();
    }
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('ai_conversations')
      .select('*')
      .eq('aluno_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(10);
    
    if (data) setConversations(data);
  };

  const loadProgress = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('progresso_aluno')
      .select('tipo, valor')
      .eq('aluno_id', user.id);
    
    if (data) {
      const progressMap = data.reduce((acc, item) => {
        acc[item.tipo] = item.valor;
        return acc;
      }, {} as any);
      
      setProgress({
        duvidas_respondidas: progressMap.duvidas_respondidas || 0,
        redacoes_enviadas: progressMap.redacoes_enviadas || 0,
        mapas_mentais: progressMap.mapas_mentais || 0
      });
    }
  };

  const loadConversationMessages = async (conversationId: string) => {
    const { data } = await supabase
      .from('ai_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    
    if (data) {
      const formattedMessages: AIMessage[] = data.map(msg => ({
        id: msg.id,
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
        timestamp: new Date(msg.created_at)
      }));
      setMessages(formattedMessages);
    }
  };

  const sendMessage = async (content: string, type: string = chatType) => {
    if (!content.trim() || !user) return;
    
    setIsLoading(true);
    
    try {
      const response = await supabase.functions.invoke('ai-chat', {
        body: {
          message: content,
          conversationId: currentConversation,
          type,
          professorType
        }
      });

      if (response.error) throw response.error;
      
      const { response: aiResponse, conversationId } = response.data;
      
      if (!currentConversation) {
        setCurrentConversation(conversationId);
        loadConversations();
      }
      
      // Add messages to UI
      const userMessage: AIMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content,
        timestamp: new Date()
      };
      
      const aiMessage: AIMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, userMessage, aiMessage]);
      setInput('');
      
      if (type === 'duvida') {
        setProgress(prev => ({ 
          ...prev, 
          duvidas_respondidas: prev.duvidas_respondidas + 1 
        }));
      }
      
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao enviar mensagem',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const submitEssay = async () => {
    if (!essayTitle.trim() || !essayContent.trim() || !user) return;
    
    try {
      // Save essay to database
      const { error } = await supabase
        .from('redacoes')
        .insert({
          aluno_id: user.id,
          titulo: essayTitle,
          conteudo: essayContent,
          tema: essayTheme,
          tipo_correcao: correctionType
        });
      
      if (error) throw error;
      
      // Send for AI correction
      const correctionPrompt = `Analise e corrija a seguinte redação:

Título: ${essayTitle}
${essayTheme ? `Tema: ${essayTheme}` : ''}

Redação:
${essayContent}

Forneça uma correção detalhada focando em ${correctionType === 'portugues' ? 'gramática e linguística' : correctionType === 'redacao' ? 'estrutura e argumentação' : 'aspectos gerais'}.`;
      
      await sendMessage(correctionPrompt, 'correcao');
      
      // Update progress
      setProgress(prev => ({ 
        ...prev, 
        redacoes_enviadas: prev.redacoes_enviadas + 1 
      }));
      
      // Clear form
      setEssayTitle('');
      setEssayContent('');
      setEssayTheme('');
      setActiveTab('chat');
      
      toast({
        title: 'Redação enviada!',
        description: 'Sua redação foi enviada para correção da IA'
      });
      
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao enviar redação',
        variant: 'destructive'
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-80 border-r bg-card flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center gap-3 mb-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={aiMascot} alt="StudyPoint AI" />
              <AvatarFallback>AI</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-lg font-semibold">StudyPoint AI</h2>
              <p className="text-sm text-muted-foreground">Seu assistente educacional</p>
            </div>
          </div>
          
          {/* Progress Stats */}
          <div className="grid grid-cols-1 gap-2">
            <div className="bg-primary/10 p-2 rounded-lg">
              <div className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">{progress.duvidas_respondidas} dúvidas</span>
              </div>
            </div>
            <div className="bg-secondary/10 p-2 rounded-lg">
              <div className="flex items-center gap-2">
                <PenTool className="h-4 w-4 text-secondary" />
                <span className="text-sm font-medium">{progress.redacoes_enviadas} redações</span>
              </div>
            </div>
          </div>
        </div>

        {/* Conversations */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Conversas Recentes</h3>
            {conversations.map((conv) => (
              <Card 
                key={conv.id} 
                className={`cursor-pointer transition-colors hover:bg-accent ${
                  currentConversation === conv.id ? 'bg-accent' : ''
                }`}
                onClick={() => {
                  setCurrentConversation(conv.id);
                  loadConversationMessages(conv.id);
                }}
              >
                <CardContent className="p-3">
                  <p className="text-sm font-medium truncate">{conv.titulo}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {conv.tipo}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(conv.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>

        {/* New Chat Button */}
        <div className="p-4 border-t">
          <Button 
            onClick={() => {
              setCurrentConversation(null);
              setMessages([]);
            }}
            variant="outline" 
            className="w-full"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Nova Conversa
          </Button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <div className="border-b p-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="chat">Chat AI</TabsTrigger>
              <TabsTrigger value="essay">Redações</TabsTrigger>
              <TabsTrigger value="mindmap">Mapas Mentais</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="chat" className="flex-1 flex flex-col m-0">
            {/* Chat Type Selector */}
            <div className="p-4 border-b bg-muted/30">
              <div className="flex items-center gap-4">
                <Select value={chatType} onValueChange={setChatType}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Tipo de conversa" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="geral">Conversa Geral</SelectItem>
                    <SelectItem value="duvida">Tirar Dúvidas</SelectItem>
                    <SelectItem value="mapa_mental">Mapa Mental</SelectItem>
                  </SelectContent>
                </Select>

                {(chatType === 'duvida' || chatType === 'correcao') && (
                  <Select value={professorType} onValueChange={setProfessorType}>
                    <SelectTrigger className="w-64">
                      <SelectValue placeholder="Escolha o professor" />
                    </SelectTrigger>
                    <SelectContent>
                      {professorTypes.map((prof) => (
                        <SelectItem key={prof.value} value={prof.value}>
                          <div>
                            <div className="font-medium">{prof.label}</div>
                            <div className="text-xs text-muted-foreground">{prof.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.length === 0 && (
                  <div className="text-center py-8">
                    <Bot className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">Olá! Como posso ajudar?</h3>
                    <p className="text-muted-foreground mb-4">
                      Sou sua assistente educacional. Posso ajudar com dúvidas, correções e muito mais!
                    </p>
                    
                    {/* Quick Questions */}
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Perguntas rápidas:</p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {quickQuestions.slice(0, 3).map((question, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            onClick={() => sendMessage(question, 'duvida')}
                            className="text-xs"
                          >
                            {question}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {message.role === 'assistant' && (
                      <Avatar className="h-8 w-8 mt-1">
                        <AvatarImage src={aiMascot} alt="AI" />
                        <AvatarFallback>AI</AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground ml-auto'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <span className="text-xs opacity-70 mt-1 block">
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    
                    {message.role === 'user' && (
                      <Avatar className="h-8 w-8 mt-1">
                        <AvatarFallback>
                          {user?.user_metadata?.nome?.[0] || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex gap-3 justify-start">
                    <Avatar className="h-8 w-8 mt-1">
                      <AvatarImage src={aiMascot} alt="AI" />
                      <AvatarFallback>AI</AvatarFallback>
                    </Avatar>
                    <div className="bg-muted rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm">Pensando...</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Digite sua mensagem..."
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button 
                  onClick={() => sendMessage(input)}
                  disabled={isLoading || !input.trim()}
                  size="icon"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="essay" className="flex-1 flex flex-col m-0">
            <div className="flex-1 p-6 space-y-6">
              <div className="text-center">
                <PenTool className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h3 className="text-xl font-semibold mb-2">Enviar Redação</h3>
                <p className="text-muted-foreground">
                  Envie sua redação para correção personalizada da IA
                </p>
              </div>

              <div className="max-w-2xl mx-auto space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Título da Redação
                  </label>
                  <Input
                    value={essayTitle}
                    onChange={(e) => setEssayTitle(e.target.value)}
                    placeholder="Digite o título..."
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Tema (opcional)
                  </label>
                  <Input
                    value={essayTheme}
                    onChange={(e) => setEssayTheme(e.target.value)}
                    placeholder="Tema da redação..."
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Tipo de Correção
                  </label>
                  <Select value={correctionType} onValueChange={setCorrectionType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="geral">Correção Geral</SelectItem>
                      <SelectItem value="portugues">Foco em Português</SelectItem>
                      <SelectItem value="redacao">Foco em Argumentação</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Conteúdo da Redação
                  </label>
                  <Textarea
                    value={essayContent}
                    onChange={(e) => setEssayContent(e.target.value)}
                    placeholder="Cole ou digite sua redação aqui..."
                    className="min-h-[300px]"
                  />
                </div>

                <Button 
                  onClick={submitEssay}
                  disabled={!essayTitle.trim() || !essayContent.trim()}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Enviar para Correção
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="mindmap" className="flex-1 flex flex-col m-0">
            <div className="flex-1 p-6">
              <div className="text-center py-8">
                <Map className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h3 className="text-xl font-semibold mb-2">Mapas Mentais</h3>
                <p className="text-muted-foreground mb-6">
                  Peça ajuda para criar mapas mentais organizados
                </p>
                
                <div className="max-w-md mx-auto">
                  <Button 
                    onClick={() => {
                      setActiveTab('chat');
                      setChatType('mapa_mental');
                      sendMessage('Preciso de ajuda para criar um mapa mental. Qual seria o assunto?', 'mapa_mental');
                    }}
                    className="w-full"
                  >
                    <Map className="h-4 w-4 mr-2" />
                    Criar Mapa Mental
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AIChat;