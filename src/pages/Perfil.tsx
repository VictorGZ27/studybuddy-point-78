import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { 
  User, Trophy, Clock, Target, BookOpen, Play, PenTool, 
  Star, TrendingUp, Calendar, Award, Crown, Zap 
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { resultadosService, professoresService } from "@/services/database";
import { toast } from "sonner";

const studentData = {
  name: "Ana Paula Silva",
  avatar: "APS",
  level: 12,
  totalPoints: 2847,
  nextLevelPoints: 3000,
  streak: 7,
  joinDate: "Março 2024"
};

const achievements = [
  { name: "Primeira semana", icon: Calendar, earned: true, description: "Complete 7 dias consecutivos" },
  { name: "Quiz Master", icon: Trophy, earned: true, description: "Acerte 100 questões" },
  { name: "Videoaula Expert", icon: Play, earned: true, description: "Assista 50 videoaulas" },
  { name: "Estudante Dedicado", icon: BookOpen, earned: false, description: "Estude 30 dias consecutivos" },
  { name: "Top 10", icon: Crown, earned: false, description: "Fique no top 10 semanal" },
  { name: "Perfeição", icon: Star, earned: false, description: "Tire nota máxima em 5 quizzes" }
];

const weeklyActivity = [
  { subject: "Matemática", videos: 3, exercises: 5, time: "2h 30min" },
  { subject: "Português", videos: 2, exercises: 4, time: "1h 45min" },
  { subject: "História", videos: 4, exercises: 2, time: "2h 15min" },
  { subject: "Ciências", videos: 1, exercises: 3, time: "1h 20min" }
];

const favoriteTeachers = [
  { name: "Prof. Ana Silva", subject: "Matemática", avatar: "AS", rating: 4.9 },
  { name: "Prof. Maria Costa", subject: "Português", avatar: "MC", rating: 4.9 },
  { name: "Prof. João Santos", subject: "História", avatar: "JS", rating: 4.8 }
];

const performanceData = [
  { subject: "Matemática", score: 85, improvement: "+12%" },
  { subject: "Português", score: 92, improvement: "+8%" }, 
  { subject: "História", score: 78, improvement: "+15%" },
  { subject: "Geografia", score: 88, improvement: "+5%" },
  { subject: "Ciências", score: 81, improvement: "+10%" },
  { subject: "Inglês", score: 95, improvement: "+3%" }
];

export default function Perfil() {
  const { user, profile, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    acertos: 0,
    erros: 0,
    percentual: 0,
  });
  const [resultados, setResultados] = useState([]);
  const [professores, setProfessores] = useState([]);

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      // Carregar estatísticas
      const statsData = await resultadosService.getEstatisticas(user!.id);
      setStats(statsData);
      
      // Carregar resultados
      const resultadosData = await resultadosService.getByAluno(user!.id);
      setResultados(resultadosData);
      
      // Carregar professores (para favoritos)
      const professoresData = await professoresService.getAll();
      setProfessores(professoresData.slice(0, 3)); // Apenas os 3 primeiros como favoritos
      
    } catch (error) {
      console.error('Erro ao carregar dados do perfil:', error);
      toast.error('Erro ao carregar dados do perfil');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 pb-8 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen pt-20 pb-8 flex items-center justify-center">
        <Card className="study-card max-w-md">
          <CardContent className="p-8 text-center">
            <User className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Perfil não encontrado</h3>
            <p className="text-muted-foreground mb-4">
              Não foi possível carregar seus dados do perfil.
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={loadUserData} className="hero-gradient text-white">Tentar novamente</Button>
              <Button variant="outline" onClick={signOut}>Fazer login novamente</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calcular nível baseado nos pontos (a cada 250 pontos = 1 nível)
  const currentLevel = Math.floor(profile.pontos / 250) + 1;
  const pointsInCurrentLevel = profile.pontos % 250;
  const pointsForNextLevel = 250;
  const progressPercent = (pointsInCurrentLevel / pointsForNextLevel) * 100;

  // Dias desde criação da conta
  const joinDate = new Date(profile.created_at).toLocaleDateString('pt-BR', { 
    month: 'long', 
    year: 'numeric' 
  });

  // Conquistas baseadas em dados reais
  const achievements = [
    { 
      name: "Primeiro exercício", 
      icon: Target, 
      earned: stats.total > 0, 
      description: "Complete seu primeiro exercício" 
    },
    { 
      name: "10 acertos", 
      icon: Trophy, 
      earned: stats.acertos >= 10, 
      description: "Acerte 10 questões" 
    },
    { 
      name: "50% de aproveitamento", 
      icon: Star, 
      earned: stats.percentual >= 50, 
      description: "Mantenha 50% de acertos" 
    },
    { 
      name: "100 pontos", 
      icon: Crown, 
      earned: profile.pontos >= 100, 
      description: "Alcance 100 pontos" 
    },
    { 
      name: "Nível 5", 
      icon: Award, 
      earned: currentLevel >= 5, 
      description: "Chegue ao nível 5" 
    },
    { 
      name: "Perfeccionista", 
      icon: Zap, 
      earned: stats.percentual >= 90, 
      description: "Mantenha 90% de acertos" 
    }
  ];

  // Estatísticas por matéria (baseado nos resultados)
  const materiaStats = resultados.reduce((acc: Record<string, { total: number; acertos: number }>, resultado: any) => {
    if (!resultado.exercicio) return acc;
    
    const materia = resultado.exercicio.materia;
    if (!acc[materia]) {
      acc[materia] = { total: 0, acertos: 0 };
    }
    
    acc[materia].total++;
    if (resultado.acertou) {
      acc[materia].acertos++;
    }
    
    return acc;
  }, {});

  const performanceData = Object.entries(materiaStats).map(([materia, data]: [string, { total: number; acertos: number }]) => ({
    subject: materia,
    score: data.total > 0 ? Math.round((data.acertos / data.total) * 100) : 0,
    improvement: "+0%", // Placeholder - seria necessário dados históricos
  }));

  return (
    <div className="min-h-screen pt-20 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Meu <span className="text-gradient">Perfil</span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Acompanhe seu progresso e conquistas na jornada de aprendizado
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="space-y-6">
            {/* User Card */}
            <Card className="study-card">
              <CardContent className="p-6 text-center">
                <Avatar className="w-24 h-24 mx-auto mb-4">
                  <AvatarImage src={profile.foto_url} alt={profile.nome} />
                  <AvatarFallback className="text-2xl font-bold hero-gradient text-white">
                    {profile.nome?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  {profile.nome}
                </h2>
                
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <Badge className="hero-gradient text-white">
                    Nível {currentLevel}
                  </Badge>
                  <Badge variant="outline">
                    {profile.pontos} pontos
                  </Badge>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-sm text-muted-foreground mb-2">
                    <span>Progresso para nível {currentLevel + 1}</span>
                    <span>{pointsInCurrentLevel}/{pointsForNextLevel}</span>
                  </div>
                  <Progress value={progressPercent} className="h-3" />
                </div>

                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 bg-secondary/50 rounded-lg">
                    <Target className="w-6 h-6 text-success mx-auto mb-1" />
                    <div className="text-lg font-bold text-foreground">{stats.percentual}%</div>
                    <div className="text-xs text-muted-foreground">Taxa de acerto</div>
                  </div>
                  <div className="p-3 bg-secondary/50 rounded-lg">
                    <Calendar className="w-6 h-6 text-primary mx-auto mb-1" />
                    <div className="text-lg font-bold text-foreground">{joinDate}</div>
                    <div className="text-xs text-muted-foreground">Membro desde</div>
                  </div>
                </div>

                <Button className="w-full mt-4 hero-gradient text-white">
                  Editar Perfil
                </Button>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card className="study-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trophy className="w-5 h-5 mr-2 text-warning" />
                  Conquistas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {achievements.map((achievement, index) => {
                  const Icon = achievement.icon;
                  return (
                    <div 
                      key={achievement.name}
                      className={`flex items-center space-x-3 p-3 rounded-lg ${
                        achievement.earned ? 'bg-success-light' : 'bg-secondary/50'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        achievement.earned ? 'bg-success text-white' : 'bg-muted text-muted-foreground'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className={`font-medium ${achievement.earned ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {achievement.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {achievement.description}
                        </p>
                      </div>
                      {achievement.earned && (
                        <Badge className="bg-success text-white text-xs">
                          ✓
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="atividade" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="atividade">Atividade</TabsTrigger>
                <TabsTrigger value="desempenho">Desempenho</TabsTrigger>
                <TabsTrigger value="professores">Professores</TabsTrigger>
              </TabsList>

              {/* Activity Tab */}
              <TabsContent value="atividade" className="space-y-6">
                <Card className="study-card">
                  <CardHeader>
                    <CardTitle>📊 Atividade desta semana</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {weeklyActivity.map((activity, index) => (
                        <div key={activity.subject} className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                          <div>
                            <h4 className="font-semibold text-foreground">{activity.subject}</h4>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                              <span className="flex items-center">
                                <Play className="w-4 h-4 mr-1" />
                                {activity.videos} vídeos
                              </span>
                              <span className="flex items-center">
                                <PenTool className="w-4 h-4 mr-1" />
                                {activity.exercises} exercícios
                              </span>
                              <span className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                {activity.time}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Weekly Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="study-card text-center">
                    <CardContent className="p-6">
                      <Target className="w-8 h-8 text-success mx-auto mb-2" />
                      <div className="text-2xl font-bold text-foreground">{stats.total}</div>
                      <p className="text-sm text-muted-foreground">Exercícios feitos</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="study-card text-center">
                    <CardContent className="p-6">
                      <Trophy className="w-8 h-8 text-warning mx-auto mb-2" />
                      <div className="text-2xl font-bold text-foreground">{stats.acertos}</div>
                      <p className="text-sm text-muted-foreground">Questões certas</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="study-card text-center">
                    <CardContent className="p-6">
                      <Crown className="w-8 h-8 text-primary mx-auto mb-2" />
                      <div className="text-2xl font-bold text-foreground">{profile.pontos}</div>
                      <p className="text-sm text-muted-foreground">Pontos totais</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Performance Tab */}
              <TabsContent value="desempenho" className="space-y-6">
                  <Card className="study-card">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <TrendingUp className="w-5 h-5 mr-2 text-success" />
                        Desempenho por matéria
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {performanceData.length > 0 ? (
                        <div className="space-y-4">
                          {performanceData.map((subject, index) => (
                            <div key={subject.subject} className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-foreground">{subject.subject}</span>
                                <div className="flex items-center space-x-2">
                                  <span className="font-bold text-foreground">{subject.score}%</span>
                                </div>
                              </div>
                              <Progress value={subject.score} className="h-2" />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">
                            Faça alguns exercícios para ver seu desempenho por matéria
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                <Card className="study-card bg-gradient-card">
                  <CardContent className="p-8 text-center">
                    <Award className="w-16 h-16 text-warning mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-foreground mb-4">
                      {stats.total > 0 ? '🎯 Continue assim!' : '🚀 Comece sua jornada!'}
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      {stats.total > 0 
                        ? `Você já completou ${stats.total} exercícios com ${stats.percentual}% de aproveitamento. Continue estudando para melhorar ainda mais!`
                        : 'Faça seu primeiro exercício e comece a acompanhar seu progresso no StudyPoint!'
                      }
                    </p>
                    <Button className="hero-gradient text-white">
                      {stats.total > 0 ? 'Fazer mais exercícios' : 'Começar agora'}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Favorite Teachers Tab */}
              <TabsContent value="professores" className="space-y-6">
                <Card className="study-card">
                  <CardHeader>
                    <CardTitle>⭐ Seus professores favoritos</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {professores.length > 0 ? (
                      professores.map((teacher, index) => (
                        <div key={teacher.id} className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarImage src={teacher.foto_url} alt={teacher.nome} />
                              <AvatarFallback className="hero-gradient text-white">
                                {teacher.nome?.charAt(0)?.toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-semibold text-foreground">{teacher.nome}</h4>
                              <p className="text-sm text-primary">{teacher.materia}</p>
                              <p className="text-xs text-muted-foreground">{teacher.descricao}</p>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <Button size="sm" variant="outline">
                              Chat
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">
                          Nenhum professor disponível no momento
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="study-card hero-gradient text-white">
                  <CardContent className="p-8 text-center">
                    <Crown className="w-16 h-16 mx-auto mb-4 text-white/90" />
                    <h3 className="text-2xl font-bold mb-2">Nível {currentLevel}</h3>
                    <div className="text-6xl font-bold mb-2">{profile.pontos}</div>
                    <p className="text-white/90 mb-4">
                      <strong>pontos conquistados</strong>
                    </p>
                    <p className="text-sm text-white/80">
                      Continue estudando para subir de nível! 🚀
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}