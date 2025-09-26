import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Send, Image, Clock, CheckCircle2, Camera, Paperclip } from "lucide-react";

const availableTeachers = [
  {
    name: "Prof. Ana Silva",
    subject: "Matemática",
    avatar: "AS",
    status: "online",
    responseTime: "Responde agora",
    rating: 4.9,
    isOnline: true
  },
  {
    name: "Prof. João Santos", 
    subject: "História",
    avatar: "JS",
    status: "away",
    responseTime: "Responde em até 2h",
    rating: 4.8,
    isOnline: false
  },
  {
    name: "Prof. Maria Costa",
    subject: "Português", 
    avatar: "MC",
    status: "online",
    responseTime: "Responde agora",
    rating: 4.9,
    isOnline: true
  },
  {
    name: "Prof. Carlos Lima",
    subject: "Ciências",
    avatar: "CL", 
    status: "busy",
    responseTime: "Responde em até 1h",
    rating: 4.7,
    isOnline: true
  }
];

const recentChats = [
  {
    teacher: "Prof. Ana Silva",
    subject: "Matemática",
    lastMessage: "Perfeito! Agora tente resolver exercício 15...",
    time: "2 min",
    unread: 0,
    avatar: "AS"
  },
  {
    teacher: "Prof. Maria Costa", 
    subject: "Português",
    lastMessage: "Você: Obrigado pela explicação!",
    time: "1 hora",
    unread: 2,
    avatar: "MC"
  },
  {
    teacher: "Prof. João Santos",
    subject: "História", 
    lastMessage: "A Revolução Francesa teve várias fases...",
    time: "1 dia",
    unread: 0,
    avatar: "JS"
  }
];

const quickQuestions = [
  "Como resolver esta equação?",
  "Pode explicar este conceito?", 
  "Tenho dúvida neste exercício",
  "Qual a diferença entre X e Y?"
];

export default function Chat() {
  const [selectedTeacher, setSelectedTeacher] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState<"available" | "chats">("available");

  return (
    <div className="min-h-screen pt-20 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            👩‍🏫 Chat de <span className="text-gradient">Dúvidas</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Converse diretamente com professores especializados e tire suas dúvidas em tempo real
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Teachers/Chats Sidebar */}
          <div className="space-y-6">
            {/* Tabs */}
            <div className="flex space-x-1 bg-secondary rounded-lg p-1">
              <Button
                variant={activeTab === "available" ? "default" : "ghost"}
                size="sm"
                className={`flex-1 ${activeTab === "available" ? "hero-gradient text-white" : ""}`}
                onClick={() => setActiveTab("available")}
              >
                Professores
              </Button>
              <Button
                variant={activeTab === "chats" ? "default" : "ghost"}
                size="sm"  
                className={`flex-1 ${activeTab === "chats" ? "hero-gradient text-white" : ""}`}
                onClick={() => setActiveTab("chats")}
              >
                Conversas
              </Button>
            </div>

            {/* Available Teachers */}
            {activeTab === "available" && (
              <Card className="study-card">
                <CardHeader>
                  <CardTitle className="text-lg">Professores disponíveis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {availableTeachers.map((teacher, index) => (
                    <div 
                      key={teacher.name}
                      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-secondary/50 cursor-pointer transition-colors"
                      onClick={() => setSelectedTeacher(teacher.name)}
                    >
                      <div className="relative">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${teacher.name}`} />
                          <AvatarFallback className="text-sm font-semibold">
                            {teacher.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                          teacher.isOnline ? 'bg-success' : 'bg-muted-foreground'
                        }`} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{teacher.name}</p>
                        <p className="text-xs text-primary">{teacher.subject}</p>
                        <p className="text-xs text-muted-foreground flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {teacher.responseTime}
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <div className="flex items-center text-warning text-xs">
                          <span>{teacher.rating}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Recent Chats */}
            {activeTab === "chats" && (
              <Card className="study-card">
                <CardHeader>
                  <CardTitle className="text-lg">Conversas recentes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recentChats.map((chat, index) => (
                    <div 
                      key={chat.teacher}
                      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-secondary/50 cursor-pointer transition-colors"
                      onClick={() => setSelectedTeacher(chat.teacher)}
                    >
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${chat.teacher}`} />
                        <AvatarFallback className="text-sm font-semibold">
                          {chat.avatar}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-sm truncate">{chat.teacher}</p>
                          <span className="text-xs text-muted-foreground">{chat.time}</span>
                        </div>
                        <p className="text-xs text-primary mb-1">{chat.subject}</p>
                        <p className="text-xs text-muted-foreground truncate">{chat.lastMessage}</p>
                      </div>
                      
                      {chat.unread > 0 && (
                        <Badge className="bg-primary text-white text-xs px-2 py-1">
                          {chat.unread}
                        </Badge>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Tips */}
            <Card className="study-card bg-gradient-card">
              <CardContent className="p-6">
                <h3 className="font-bold mb-3 flex items-center">
                  💡 Dicas para o chat
                </h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Seja específico na sua dúvida</li>
                  <li>• Envie foto do exercício se necessário</li>
                  <li>• Mencione a matéria e o tópico</li>
                  <li>• Seja respeitoso e paciente</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2">
            {!selectedTeacher ? (
              <Card className="study-card h-96 flex items-center justify-center">
                <CardContent className="text-center">
                  <MessageCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    Selecione um professor
                  </h3>
                  <p className="text-muted-foreground">
                    Escolha um professor disponível para começar a conversar
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card className="study-card h-96 flex flex-col">
                {/* Chat Header */}
                <CardHeader className="border-b border-border">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${selectedTeacher}`} />
                      <AvatarFallback>
                        {selectedTeacher.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{selectedTeacher}</CardTitle>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-success rounded-full" />
                        <span className="text-sm text-muted-foreground">Online agora</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                {/* Chat Messages */}
                <CardContent className="flex-1 p-6 overflow-y-auto">
                  <div className="space-y-4">
                    {/* Sample messages */}
                    <div className="flex items-start space-x-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="text-xs">
                          {selectedTeacher.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="bg-secondary rounded-lg p-3 max-w-xs">
                        <p className="text-sm">Olá! Como posso te ajudar hoje?</p>
                        <span className="text-xs text-muted-foreground">14:30</span>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 justify-end">
                      <div className="hero-gradient text-white rounded-lg p-3 max-w-xs">
                        <p className="text-sm">Tenho dúvida sobre funções quadráticas</p>
                        <div className="flex items-center justify-end mt-1">
                          <span className="text-xs text-white/80 mr-1">14:32</span>
                          <CheckCircle2 className="w-3 h-3" />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="text-xs">
                          {selectedTeacher.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="bg-secondary rounded-lg p-3 max-w-xs">
                        <p className="text-sm">Claro! Qual parte específica está te causando dificuldade?</p>
                        <span className="text-xs text-muted-foreground">14:33</span>
                      </div>
                    </div>
                  </div>
                </CardContent>

                {/* Message Input */}
                <div className="border-t border-border p-4">
                  {/* Quick Questions */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {quickQuestions.map((question) => (
                      <Button
                        key={question}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => setMessage(question)}
                      >
                        {question}
                      </Button>
                    ))}
                  </div>

                  {/* Input Area */}
                  <div className="flex items-end space-x-2">
                    <div className="flex-1 space-y-2">
                      <Textarea
                        placeholder="Digite sua dúvida aqui..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={2}
                        className="resize-none"
                      />
                    </div>
                    <div className="flex flex-col space-y-1">
                      <Button size="sm" variant="outline">
                        <Camera className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Paperclip className="w-4 h-4" />
                      </Button>
                      <Button size="sm" className="hero-gradient text-white">
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}