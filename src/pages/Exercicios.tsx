import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { PenTool, Clock, Trophy, Target, Zap, BarChart3, CheckCircle, AlertCircle, Loader2, Play, BookOpen, Calculator, History, MapPin, Languages, Palette, Users, Brain, Dna, Dumbbell, Atom, Zap as Physics } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import questoesData from "@/data/questoes-ensino-medio.json";
import { useQuizProgress } from "@/hooks/useQuizProgress";

interface Questao {
  pergunta: string;
  alternativas: string[];
  correta: string;
}

interface Materia {
  nome: string;
  questoes: Questao[];
}

interface QuizState {
  isActive: boolean;
  currentQuestion: number;
  questions: Questao[];
  selectedAnswers: string[];
  score: number;
  completed: boolean;
  subject: string;
  showCorrectAnswer: boolean;
  answeredCurrentQuestion: boolean;
}

// Ícones para cada matéria
const getMateriaIcon = (materia: string) => {
  const iconMap: Record<string, any> = {
    "Português": BookOpen,
    "Matemática": Calculator,
    "História": History,
    "Geografia": MapPin,
    "Inglês": Languages,
    "Artes": Palette,
    "Sociologia": Users,
    "Filosofia": Brain,
    "Biologia": Dna,
    "Educação Física": Dumbbell,
    "Química": Atom,
    "Física": Physics
  };
  return iconMap[materia] || PenTool;
};

export default function Exercicios() {
  const [quiz, setQuiz] = useState<QuizState>({
    isActive: false,
    currentQuestion: 0,
    questions: [],
    selectedAnswers: [],
    score: 0,
    completed: false,
    subject: "",
    showCorrectAnswer: false,
    answeredCurrentQuestion: false
  });
  const [loading, setLoading] = useState(false);
  const [materias, setMaterias] = useState<Materia[]>([]);
  const { user, profile } = useAuth();
  const { progress, saveQuizResult, getOverallStats } = useQuizProgress();

  useEffect(() => {
    loadQuestoes();
  }, []);

  const loadQuestoes = async () => {
    try {
      setLoading(true);
      // Carregar questões do arquivo JSON
      setMaterias(questoesData.materias as Materia[]);
    } catch (error: any) {
      console.error('Erro ao carregar questões:', error);
      toast.error('Erro ao carregar questões');
    } finally {
      setLoading(false);
    }
  };
  const startQuiz = (subject: string) => {
    const materia = materias.find(m => m.nome === subject);
    if (!materia || materia.questoes.length === 0) {
      toast.error('Não há questões disponíveis para esta matéria');
      return;
    }

    // Embaralhar questões e pegar 10
    const questoesEmbaralhadas = [...materia.questoes].sort(() => Math.random() - 0.5).slice(0, 10);

    setQuiz({
      isActive: true,
      currentQuestion: 0,
      questions: questoesEmbaralhadas,
      selectedAnswers: [],
      score: 0,
      completed: false,
      subject,
      showCorrectAnswer: false,
      answeredCurrentQuestion: false
    });
  };

  const selectAnswer = (answer: string) => {
    if (quiz.answeredCurrentQuestion) return;

    const newAnswers = [...quiz.selectedAnswers];
    newAnswers[quiz.currentQuestion] = answer;
    setQuiz(prev => ({ 
      ...prev, 
      selectedAnswers: newAnswers,
      showCorrectAnswer: true,
      answeredCurrentQuestion: true
    }));
  };

  const nextQuestion = () => {
    if (quiz.currentQuestion < quiz.questions.length - 1) {
      setQuiz(prev => ({ 
        ...prev, 
        currentQuestion: prev.currentQuestion + 1,
        showCorrectAnswer: false,
        answeredCurrentQuestion: false
      }));
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
    let correctAnswers = 0;

    // Calcular pontuação
    for (let i = 0; i < quiz.questions.length; i++) {
      const question = quiz.questions[i];
      const userAnswer = quiz.selectedAnswers[i];
      const isCorrect = userAnswer === question.correta;
      
      if (isCorrect) correctAnswers++;
    }

    // Salvar progresso local
    saveQuizResult(quiz.subject, correctAnswers, quiz.questions.length);

    // Atualizar pontos do usuário
    if (user && correctAnswers > 0) {
      const pontosGanhos = correctAnswers * 10;
      try {
        await supabase.rpc('incrementar_pontos', {
          user_id: user.id,
          pontos: pontosGanhos
        });
        toast.success(`Parabéns! Você ganhou ${pontosGanhos} pontos!`);
      } catch (error) {
        console.error('Erro ao incrementar pontos:', error);
      }
    }

    setQuiz(prev => ({
      ...prev,
      score: correctAnswers,
      completed: true
    }));
  };

  const resetQuiz = () => {
    setQuiz({
      isActive: false,
      currentQuestion: 0,
      questions: [],
      selectedAnswers: [],
      score: 0,
      completed: false,
      subject: "",
      showCorrectAnswer: false,
      answeredCurrentQuestion: false
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 pb-8 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando exercícios...</p>
        </div>
      </div>
    );
  }


  // Interface do Quiz Ativo
  if (quiz.isActive && !quiz.completed) {
    const currentQuestion = quiz.questions[quiz.currentQuestion];
    const progress = ((quiz.currentQuestion + 1) / quiz.questions.length) * 100;
    
    return (
      <div className="min-h-screen pt-20 pb-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold">Quiz de {quiz.subject}</h1>
              <Badge variant="outline">
                {quiz.currentQuestion + 1} de {quiz.questions.length}
              </Badge>
            </div>
            <Progress value={progress} className="w-full" />
          </div>

          <Card className="study-card">
            <CardHeader>
              <CardTitle className="text-xl">
                {currentQuestion.pergunta}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {currentQuestion.alternativas.map((alternativa, index) => {
                  const isSelected = quiz.selectedAnswers[quiz.currentQuestion] === alternativa;
                  const isCorrect = alternativa === currentQuestion.correta;
                  const showFeedback = quiz.showCorrectAnswer;
                  
                  let buttonClass = "w-full text-left p-4 rounded-lg border transition-all duration-200 hover:bg-secondary";
                  
                  if (showFeedback) {
                    if (isSelected && isCorrect) {
                      buttonClass += " bg-green-100 border-green-500 text-green-800 dark:bg-green-900 dark:border-green-400 dark:text-green-100";
                    } else if (isSelected && !isCorrect) {
                      buttonClass += " bg-red-100 border-red-500 text-red-800 dark:bg-red-900 dark:border-red-400 dark:text-red-100";
                    } else if (!isSelected && isCorrect) {
                      buttonClass += " bg-green-50 border-green-300 text-green-700 dark:bg-green-900/50 dark:border-green-500 dark:text-green-200";
                    }
                  } else if (isSelected) {
                    buttonClass += " bg-primary/10 border-primary";
                  }

                  return (
                    <Button
                      key={index}
                      variant="outline"
                      className={buttonClass}
                      onClick={() => selectAnswer(alternativa)}
                      disabled={quiz.showCorrectAnswer}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span>{alternativa}</span>
                        {showFeedback && isCorrect && <CheckCircle className="h-5 w-5 text-green-600" />}
                        {showFeedback && isSelected && !isCorrect && <AlertCircle className="h-5 w-5 text-red-600" />}
                      </div>
                    </Button>
                  );
                })}
              </div>

              <div className="flex justify-between pt-4">
                <Button 
                  variant="outline" 
                  onClick={resetQuiz}
                >
                  Cancelar Quiz
                </Button>
                <Button 
                  onClick={nextQuestion}
                  disabled={!quiz.answeredCurrentQuestion}
                  className="hero-gradient text-white"
                >
                  {quiz.currentQuestion < quiz.questions.length - 1 ? 'Próxima' : 'Finalizar'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Resultado do Quiz
  if (quiz.completed) {
    const percentage = Math.round((quiz.score / quiz.questions.length) * 100);
    
    return (
      <div className="min-h-screen pt-20 pb-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="study-card text-center">
            <CardContent className="p-8">
              <div className="mb-6">
                {percentage >= 70 ? (
                  <CheckCircle className="h-16 w-16 text-success mx-auto mb-4" />
                ) : (
                  <AlertCircle className="h-16 w-16 text-warning mx-auto mb-4" />
                )}
                <h1 className="text-3xl font-bold mb-2">
                  {percentage >= 70 ? 'Parabéns!' : 'Continue tentando!'}
                </h1>
                <p className="text-muted-foreground">
                  Você acertou {quiz.score} de {quiz.questions.length} questões
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="p-4 bg-secondary/50 rounded-lg">
                  <Trophy className="h-8 w-8 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold">{percentage}%</div>
                  <div className="text-sm text-muted-foreground">Aproveitamento</div>
                </div>
                <div className="p-4 bg-secondary/50 rounded-lg">
                  <Target className="h-8 w-8 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold">{quiz.score}</div>
                  <div className="text-sm text-muted-foreground">Acertos</div>
                </div>
                <div className="p-4 bg-secondary/50 rounded-lg">
                  <Zap className="h-8 w-8 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold">{quiz.score * 10}</div>
                  <div className="text-sm text-muted-foreground">Pontos ganhos</div>
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <Button variant="outline" onClick={resetQuiz}>
                  Voltar ao início
                </Button>
                <Button 
                  className="hero-gradient text-white"
                  onClick={() => startQuiz(quiz.subject)}
                >
                  Tentar novamente
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Interface Principal
  return (
    <div className="min-h-screen pt-20 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            <span className="text-gradient">Exercícios</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Teste seus conhecimentos e ganhe pontos respondendo aos exercícios
          </p>
        </div>

        {/* Estatísticas do usuário */}
        {profile && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="study-card text-center">
              <CardContent className="p-6">
                <Trophy className="h-12 w-12 text-primary mx-auto mb-4" />
                <div className="text-3xl font-bold text-primary">{profile.pontos}</div>
                <div className="text-muted-foreground">Pontos totais</div>
              </CardContent>
            </Card>
            <Card className="study-card text-center">
              <CardContent className="p-6">
                <Target className="h-12 w-12 text-primary mx-auto mb-4" />
                <div className="text-3xl font-bold text-primary">{getOverallStats().totalQuizzes}</div>
                <div className="text-muted-foreground">Exercícios feitos</div>
              </CardContent>
            </Card>
            <Card className="study-card text-center">
              <CardContent className="p-6">
                <BarChart3 className="h-12 w-12 text-primary mx-auto mb-4" />
                <div className="text-3xl font-bold text-primary">{getOverallStats().averageScore}%</div>
                <div className="text-muted-foreground">Taxa de acerto média</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Matérias disponíveis */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
            Escolha uma <span className="text-gradient">matéria</span>
          </h2>
          
          {materias.length === 0 ? (
            <Card className="p-8 text-center">
              <CardContent>
                <PenTool className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Carregando questões...</h3>
                <p className="text-muted-foreground">
                  Aguarde enquanto carregamos as questões do Ensino Médio
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {materias.map((materia, index) => {
                const IconComponent = getMateriaIcon(materia.nome);
                const materiaProgress = progress[materia.nome];
                const hasProgress = materiaProgress && materiaProgress.totalAttempts > 0;
                const bestPercentage = hasProgress ? Math.round((materiaProgress.bestScore / materiaProgress.totalQuestions) * 100) : 0;
                
                return (
                  <Card key={materia.nome} className="study-card group cursor-pointer animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                    <CardHeader className="text-center pb-4">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-xl mb-4 group-hover:scale-110 transition-transform duration-300">
                        <IconComponent className="w-8 h-8 text-primary" />
                      </div>
                      <CardTitle className="text-lg mb-2">{materia.nome}</CardTitle>
                      <div className="flex gap-2 justify-center">
                        <Badge variant="secondary" className="text-xs">
                          {materia.questoes.length} questões
                        </Badge>
                        {hasProgress && (
                          <Badge variant={bestPercentage >= 70 ? "default" : "destructive"} className="text-xs">
                            Melhor: {bestPercentage}%
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-center space-y-2">
                        <div className="flex items-center justify-center text-sm text-muted-foreground">
                          <Clock className="w-4 h-4 mr-1" />
                          ~20 min
                        </div>
                        <div className="flex items-center justify-center text-sm text-muted-foreground">
                          <Target className="w-4 h-4 mr-1" />
                          10 questões
                        </div>
                        {hasProgress && (
                          <div className="flex items-center justify-center text-sm text-muted-foreground">
                            <Play className="w-4 h-4 mr-1" />
                            {materiaProgress.totalAttempts} tentativas
                          </div>
                        )}
                      </div>
                      <Button 
                        className="w-full group-hover:hero-gradient group-hover:text-white transition-all duration-300"
                        onClick={() => startQuiz(materia.nome)}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        {hasProgress ? 'Jogar Novamente' : 'Iniciar Quiz'}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Dicas */}
        <Card className="study-card bg-gradient-card">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Como funciona?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div>
                <Play className="w-8 h-8 text-primary mx-auto mb-2" />
                <h4 className="font-semibold mb-2">1. Escolha a matéria</h4>
                <p className="text-sm text-muted-foreground">
                  Selecione a disciplina que deseja praticar
                </p>
              </div>
              <div>
                <PenTool className="w-8 h-8 text-primary mx-auto mb-2" />
                <h4 className="font-semibold mb-2">2. Responda as questões</h4>
                <p className="text-sm text-muted-foreground">
                  Complete o quiz com até 10 questões da matéria
                </p>
              </div>
              <div>
                <Trophy className="w-8 h-8 text-primary mx-auto mb-2" />
                <h4 className="font-semibold mb-2">3. Ganhe pontos</h4>
                <p className="text-sm text-muted-foreground">
                  Cada acerto vale 10 pontos para seu ranking
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}