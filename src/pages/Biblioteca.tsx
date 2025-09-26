import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Calculator, Book, Globe, Microscope, Languages, MapPin, Search, Download, Star, Clock, Loader2, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Resumo } from "@/types/database";
import { toast } from "sonner";

const subjects = [
  {
    name: "Matemática",
    icon: Calculator,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    resumos: 24,
    topics: ["Álgebra", "Geometria", "Trigonometria", "Estatística"]
  },
  {
    name: "Português",
    icon: Book,
    color: "text-red-600",
    bgColor: "bg-red-100",
    resumos: 18,
    topics: ["Gramática", "Literatura", "Redação", "Interpretação"]
  },
  {
    name: "Redação",
    icon: Book,
    color: "text-indigo-600",
    bgColor: "bg-indigo-100",
    resumos: 15,
    topics: ["ENEM", "Dissertação", "Argumentação", "Estrutura"]
  },
  {
    name: "História",
    icon: Globe,
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
    resumos: 21,
    topics: ["Brasil Colonial", "República", "Mundo Antigo", "Idade Média"]
  },
  {
    name: "Geografia",
    icon: MapPin,
    color: "text-green-600",
    bgColor: "bg-green-100",
    resumos: 16,
    topics: ["Geografia Física", "Humana", "Brasil", "Geopolítica"]
  },
  {
    name: "Inglês",
    icon: Languages,
    color: "text-indigo-600",
    bgColor: "bg-indigo-100",
    resumos: 12,
    topics: ["Grammar", "Vocabulary", "Reading", "Speaking"]
  },
  {
    name: "Artes",
    icon: Book,
    color: "text-pink-600",
    bgColor: "bg-pink-100",
    resumos: 8,
    topics: ["História da Arte", "Movimentos Artísticos", "Técnicas", "Cultura"]
  },
  {
    name: "Sociologia",
    icon: Globe,
    color: "text-orange-600",
    bgColor: "bg-orange-100",
    resumos: 14,
    topics: ["Sociedade", "Movimentos Sociais", "Política", "Cultura"]
  },
  {
    name: "Filosofia",
    icon: Book,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
    resumos: 16,
    topics: ["Ética", "Política", "Conhecimento", "Existência"]
  },
  {
    name: "Biologia",
    icon: Microscope,
    color: "text-green-600",
    bgColor: "bg-green-100",
    resumos: 22,
    topics: ["Citologia", "Genética", "Ecologia", "Evolução"]
  },
  {
    name: "Educação Física",
    icon: Target,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    resumos: 6,
    topics: ["Esportes", "Saúde", "Corpo Humano", "Atividade Física"]
  },
  {
    name: "Química",
    icon: Microscope,
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
    resumos: 20,
    topics: ["Química Geral", "Orgânica", "Físico-Química", "Analítica"]
  },
  {
    name: "Física",
    icon: Calculator,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    resumos: 18,
    topics: ["Mecânica", "Termodinâmica", "Eletromagnetismo", "Óptica"]
  },
];

const recentResumos = [
  {
    title: "Funções Quadráticas",
    subject: "Matemática",
    duration: "5 min",
    rating: 4.9,
    views: "1.2k",
    difficulty: "Intermediário"
  },
  {
    title: "Segunda Guerra Mundial",
    subject: "História",
    duration: "8 min",
    rating: 4.8,
    views: "2.1k",
    difficulty: "Avançado"
  },
  {
    title: "Figuras de Linguagem",
    subject: "Português",
    duration: "4 min",
    rating: 4.7,
    views: "856",
    difficulty: "Básico"
  },
];

export default function Biblioteca() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [resumos, setResumos] = useState<Resumo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('🚀 useEffect executado - carregando resumos...');
    loadResumos();
  }, []);

  const loadResumos = async () => {
    try {
      console.log('🔍 Iniciando carregamento de resumos...');
      setError(null);
      
      console.log('🔗 Fazendo chamada para Supabase...');
      const { data, error } = await supabase
        .from('resumos')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('📊 Resposta do Supabase:', { data, error });

      if (error) {
        console.error('❌ Erro do Supabase:', error);
        throw error;
      }

      console.log('✅ Resumos carregados com sucesso:', data?.length || 0, 'items');
      setResumos(data || []);
    } catch (error: any) {
      console.error('💥 Erro ao carregar resumos:', error);
      setError('Erro ao carregar dados, tente novamente');
    } finally {
      console.log('🏁 Finalizando carregamento...');
      setLoading(false);
    }
  };

  const loadResumosBySubject = async (materia: string) => {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('resumos')
        .select('*')
        .eq('materia', materia)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setResumos(data || []);
      setSelectedSubject(materia);
    } catch (error: any) {
      console.error('Erro ao carregar resumos:', error);
      setError('Erro ao carregar dados, tente novamente');
    } finally {
      setLoading(false);
    }
  };

  const resetFilter = () => {
    setSelectedSubject(null);
    loadResumos();
  };

  const filteredSubjects = subjects.filter(subject =>
    subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subject.topics.some(topic => topic.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredResumos = resumos.filter(resumo =>
    resumo.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (resumo.materia || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (resumo.conteudo || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen pt-20 pb-8 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando resumos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-20 pb-8 flex items-center justify-center">
        <Card className="study-card max-w-md">
          <CardContent className="p-8 text-center">
            <Book className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Erro ao carregar dados, tente novamente</h3>
            <p className="text-muted-foreground mb-4">Verifique sua conexão e tente novamente.</p>
            <Button onClick={() => (selectedSubject ? loadResumosBySubject(selectedSubject) : loadResumos())} className="hero-gradient text-white">Recarregar</Button>
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
            Biblioteca de <span className="text-gradient">Resumos</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Resumos diretos, mapas mentais e exemplos práticos para acelerar seu aprendizado
          </p>
          {selectedSubject && (
            <div className="mt-4">
              <Badge variant="secondary" className="mr-2">
                Filtrando por: {selectedSubject}
              </Badge>
              <Button variant="outline" size="sm" onClick={resetFilter}>
                Ver todos
              </Button>
            </div>
          )}
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              placeholder="Buscar por matéria ou assunto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 py-3 text-lg shadow-card"
            />
          </div>
        </div>

        {/* Subject Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {filteredSubjects.map((subject, index) => {
            const Icon = subject.icon;
            return (
              <Card key={subject.name} className="study-card group cursor-pointer animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardHeader className="text-center pb-4">
                  <div className={`inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-xl mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`w-8 h-8 text-primary`} />
                  </div>
                  <CardTitle className="text-xl mb-2">{subject.name}</CardTitle>
                  <Badge variant="secondary" className="w-fit mx-auto">
                    {subject.resumos} resumos
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Principais tópicos:</p>
                    <div className="flex flex-wrap gap-2">
                      {subject.topics.slice(0, 3).map((topic) => (
                        <Badge key={topic} variant="outline" className="text-xs">
                          {topic}
                        </Badge>
                      ))}
                      {subject.topics.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{subject.topics.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full group-hover:hero-gradient group-hover:text-white transition-all duration-300"
                    onClick={() => loadResumosBySubject(subject.name)}
                  >
                    Explorar resumos
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Resumos */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
            {selectedSubject ? `Resumos de ${selectedSubject}` : 'Resumos disponíveis'}
          </h2>
          
          {filteredResumos.length === 0 ? (
            <Card className="p-8 text-center">
              <CardContent>
                <Book className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum resumo encontrado.</h3>
                <p className="text-muted-foreground">
                  {searchTerm ? 'Tente alterar os termos de busca' : 'Ainda não há resumos cadastrados'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResumos.map((resumo, index) => (
                <Card key={resumo.id} className="study-card group animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2 group-hover:text-primary transition-colors">
                          {resumo.titulo}
                        </CardTitle>
                        <div className="flex gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">
                            {resumo.materia}
                          </Badge>
                          {resumo.topico && (
                            <Badge variant="secondary" className="text-xs">
                              {resumo.topico}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                      {resumo.conteudo}
                    </p>
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {new Date(resumo.created_at).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="group-hover:hero-gradient group-hover:text-white w-full"
                        onClick={() => navigate(`/resumo/${resumo.id}`)}
                      >
                        <Book className="w-4 h-4 mr-1" />
                        Ler resumo
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Tips Section */}
        <Card className="study-card bg-gradient-card">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Dica de Estudo
            </h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Combine resumos com videoaulas para um aprendizado mais eficaz. 
              Primeiro leia o resumo, depois assista à videoaula para fixar o conteúdo!
            </p>
            <Button variant="outline" className="hero-gradient text-white">
              Ver videoaulas
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}