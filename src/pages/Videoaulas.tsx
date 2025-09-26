import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Clock, Users, Star, MessageCircle, Filter, Eye, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Videoaula, Professor } from "@/types/database";
import { toast } from "sonner";

const quickLessons = [
  {
    title: "Equações do 2º Grau",
    subject: "Matemática",
    duration: "4 min",
    views: "2.3k",
    rating: 4.9,
    thumbnail: "https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=300&h=200&fit=crop",
    level: "Intermediário"
  },
  {
    title: "Revolução Francesa",
    subject: "História", 
    duration: "5 min",
    views: "1.8k",
    rating: 4.8,
    thumbnail: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=200&fit=crop",
    level: "Avançado"
  },
  {
    title: "Células e Tecidos",
    subject: "Biologia",
    duration: "3 min", 
    views: "3.1k",
    rating: 4.9,
    thumbnail: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300&h=200&fit=crop",
    level: "Básico"
  },
];

const teachers = [
  {
    name: "Prof. Ana Silva",
    subject: "Matemática",
    specialty: "Álgebra e Geometria",
    rating: 4.9,
    students: "1.2k",
    avatar: "AS",
    style: "Didática clara com exemplos práticos do cotidiano",
    experience: "8 anos",
    available: true
  },
  {
    name: "Prof. João Santos",
    subject: "História",
    specialty: "História do Brasil",
    rating: 4.8,
    students: "950",
    avatar: "JS", 
    style: "Storytelling envolvente com contexto histórico",
    experience: "12 anos",
    available: false
  },
  {
    name: "Prof. Maria Costa",
    subject: "Português",
    specialty: "Literatura e Redação",
    rating: 4.9,
    students: "1.5k",
    avatar: "MC",
    style: "Abordagem criativa com análise textual profunda",
    experience: "10 anos", 
    available: true
  },
  {
    name: "Prof. Carlos Lima",
    subject: "Ciências",
    specialty: "Biologia e Química",
    rating: 4.7,
    students: "800",
    avatar: "CL",
    style: "Experimentos práticos e explicações visuais",
    experience: "6 anos",
    available: true
  },
];

export default function Videoaulas() {
  const [activeTab, setActiveTab] = useState("rapidas");
  const [selectedTeacher, setSelectedTeacher] = useState<string | null>(null);
  const [videoaulas, setVideoaulas] = useState<Videoaula[]>([]);
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setError(null);
      const timeout = (ms: number) => new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), ms));

      // Carregar videoaulas com timeout
      const videoPromise = supabase
        .from('videoaulas')
        .select('*')
        .order('created_at', { ascending: false });
      const { data: videoaulasData, error: videoaulasError } = (await Promise.race([videoPromise, timeout(5000)])) as any;
      if (videoaulasError) throw videoaulasError;

      // Carregar professores com timeout
      const profPromise = supabase
        .from('professores')
        .select('*')
        .order('nome');
      const { data: professoresData, error: professoresError } = (await Promise.race([profPromise, timeout(5000)])) as any;
      if (professoresError) throw professoresError;

      setVideoaulas(videoaulasData || []);
      setProfessores(professoresData || []);
    } catch (error: any) {
      console.error('Erro ao carregar dados:', error);
      setError('Erro ao carregar dados, tente novamente');
    } finally {
      setLoading(false);
    }
  };

  const playVideo = (videoaula: Videoaula) => {
    // Criar modal ou página para exibir o vídeo
    window.open(videoaula.url_video, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 pb-8 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando videoaulas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-20 pb-8 flex items-center justify-center">
        <Card className="study-card max-w-md">
          <CardContent className="p-8 text-center">
            <Play className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Erro ao carregar dados, tente novamente</h3>
            <p className="text-muted-foreground mb-4">Verifique sua conexão e tente novamente.</p>
            <Button onClick={loadData} className="hero-gradient text-white">Recarregar</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            <span className="text-gradient">Videoaulas</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Aprenda de forma rápida e eficaz com nossos professores especializados
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-12">
            <TabsTrigger value="rapidas" className="flex items-center gap-2">
              <Play className="w-4 h-4" />
              Aulas Rápidas
            </TabsTrigger>
            <TabsTrigger value="professores" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Professores
            </TabsTrigger>
          </TabsList>

          {/* Quick Lessons Tab */}
          <TabsContent value="rapidas" className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Aulas de 3-7 minutos organizadas por tema
              </h2>
              <p className="text-muted-foreground">
                Conteúdo direto ao ponto para revisão rápida
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videoaulas.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <Play className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhuma videoaula encontrada</h3>
                  <p className="text-muted-foreground">Ainda não há videoaulas cadastradas</p>
                </div>
              ) : (
                videoaulas.map((videoaula, index) => (
                  <Card key={videoaula.id} className="study-card group cursor-pointer animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                    <div className="relative">
                      <div className="w-full h-48 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-t-lg flex items-center justify-center">
                        <Play className="w-12 h-12 text-primary" />
                      </div>
                      <div className="absolute inset-0 bg-black/40 rounded-t-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          size="lg" 
                          className="hero-gradient text-white shadow-float"
                          onClick={() => playVideo(videoaula)}
                        >
                          <Play className="w-6 h-6 mr-2" />
                          Assistir
                        </Button>
                      </div>
                    </div>
                    
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between mb-2">
                        <Badge variant="outline" className="text-xs">
                          {videoaula.materia}
                        </Badge>
                        {videoaula.nivel && (
                          <Badge variant="secondary" className="text-xs">
                            {videoaula.nivel}
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">
                        {videoaula.titulo}
                      </CardTitle>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      {videoaula.descricao && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {videoaula.descricao}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {videoaula.duracao || 'N/A'}
                        </div>
                        <div className="text-xs">
                          {new Date(videoaula.created_at).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        className="w-full group-hover:hero-gradient group-hover:text-white"
                        onClick={() => playVideo(videoaula)}
                      >
                        Assistir Agora
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Categories */}
            <div className="mt-12">
              <h3 className="text-2xl font-bold text-foreground mb-6 text-center">
                Navegue por <span className="text-gradient">categorias</span>
              </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {["Matemática", "Português", "Redação", "História", "Ciências"].map((subject) => (
                  <Card key={subject} className="study-card group cursor-pointer text-center">
                    <CardContent className="p-6">
                      <h4 className="font-semibold text-lg group-hover:text-primary transition-colors">
                        {subject}
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {Math.floor(Math.random() * 20) + 10} aulas
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Teachers Tab */}
          <TabsContent value="professores" className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Escolha seu professor preferido
              </h2>
              <p className="text-muted-foreground">
                Cada professor tem seu estilo único de ensinar
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {professores.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum professor encontrado</h3>
                  <p className="text-muted-foreground">Ainda não há professores cadastrados</p>
                </div>
              ) : (
                professores.map((professor, index) => (
                  <Card key={professor.id} className="study-card group animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                    <CardHeader>
                      <div className="flex items-start space-x-4">
                        <Avatar className="w-16 h-16">
                          <AvatarImage src={professor.foto_url} />
                          <AvatarFallback className="text-lg font-semibold">
                            {professor.nome.split(' ').map(n => n[0]).join('').substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-xl">{professor.nome}</CardTitle>
                            <div className="flex items-center">
                              <div className="w-3 h-3 rounded-full mr-2 bg-success" />
                              <span className="text-sm text-muted-foreground">Online</span>
                            </div>
                          </div>
                          <p className="text-primary font-medium">{professor.materia}</p>
                          {professor.descricao && (
                            <p className="text-sm text-muted-foreground line-clamp-2">{professor.descricao}</p>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center text-warning">
                          <Star className="w-4 h-4 fill-current mr-1" />
                          <span className="font-medium">4.8</span>
                        </div>
                        <div className="flex items-center text-muted-foreground">
                          <Users className="w-4 h-4 mr-1" />
                          <span>100+ alunos</span>
                        </div>
                        <Badge variant="outline">Experiente</Badge>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Play className="w-4 h-4 mr-1" />
                          Ver aulas
                        </Button>
                        <Button size="sm" className="flex-1 hero-gradient text-white">
                          <MessageCircle className="w-4 h-4 mr-1" />
                          Chat
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Benefits Section */}
            <Card className="study-card bg-gradient-card">
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-bold text-foreground mb-4">
                  Vantagens de seguir um professor
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  <div>
                    <MessageCircle className="w-8 h-8 text-primary mx-auto mb-2" />
                    <h4 className="font-semibold mb-2">Chat direto</h4>
                    <p className="text-sm text-muted-foreground">
                      Tire dúvidas diretamente com seu professor favorito
                    </p>
                  </div>
                  <div>
                    <Play className="w-8 h-8 text-primary mx-auto mb-2" />
                    <h4 className="font-semibold mb-2">Aulas personalizadas</h4>
                    <p className="text-sm text-muted-foreground">
                      Receba conteúdo adaptado ao seu ritmo de aprendizado
                    </p>
                  </div>
                  <div>
                    <Star className="w-8 h-8 text-primary mx-auto mb-2" />
                    <h4 className="font-semibold mb-2">Acompanhamento</h4>
                    <p className="text-sm text-muted-foreground">
                      Monitore seu progresso com feedback personalizado
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}