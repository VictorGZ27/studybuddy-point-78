import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { PenTool, Clock, Trophy, Target, Zap, BarChart3, CheckCircle, AlertCircle, Loader2, Play } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Exercicio } from "@/types/database";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface QuizState {
  isActive: boolean;
  currentQuestion: number;
  exercises: Exercicio[];
  selectedAnswers: string[];
  score: number;
  completed: boolean;
  subject: string;
}

const materias = ["Matemática", "Português", "Redação", "História", "Física", "Química", "Biologia"];

export default function Exercicios() {
  const [quiz, setQuiz] = useState<QuizState>({
    isActive: false,
    currentQuestion: 0,
    exercises: [],
    selectedAnswers: [],
    score: 0,
    completed: false,
    subject: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exercisesBySubject, setExercisesBySubject] = useState<Record<string, Exercicio[]>>({});
  const { user, profile } = useAuth();

  useEffect(() => {
    loadExercises();
  }, []);

  const loadExercises = async () => {
    try {
      setLoading(true);
      setError(null);

      // Tenta ordenar por created_at; caso a coluna não exista, faz fallback sem ordenação
      let dataResult: any[] | null = null;
      const { data, error } = await supabase
        .from('exercicios')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        if (error.code === '42703' || (error.message && error.message.includes('created_at'))) {
          const { data: fallbackData, error: fallbackError } = await supabase
            .from('exercicios')
            .select('*');
          if (fallbackError) throw fallbackError;
          dataResult = fallbackData;
        } else {
          throw error;
        }
      } else {
        dataResult = data;
      }

      // Agrupar exercícios por matéria
      const grouped = (dataResult || []).reduce((acc, exercise) => {
        const materia = exercise.materia || 'Outros';
        if (!acc[materia]) acc[materia] = [];
        // Converter alternativas de JSON para array de strings
        const exerciseWithParsedAlternativas = {
          ...exercise,
          alternativas: Array.isArray(exercise.alternativas) 
            ? exercise.alternativas 
            : JSON.parse(exercise.alternativas as string)
        };
        acc[materia].push(exerciseWithParsedAlternativas as Exercicio);
        return acc;
      }, {} as Record<string, Exercicio[]>);

      setExercisesBySubject(grouped);
    } catch (error: any) {
      console.error('Erro ao carregar exercícios:', error);
      setError('Erro ao carregar dados, tente novamente');
    } finally {
      setLoading(false);
    }
  };
  const startQuiz = (subject: string) => {
    const exercises = exercisesBySubject[subject] || [];
    if (exercises.length === 0) {
      toast.error('Não há exercícios disponíveis para esta matéria');
      return;
    }

    setQuiz({
      isActive: true,
      currentQuestion: 0,
      exercises: exercises.slice(0, 10), // Máximo 10 questões
      selectedAnswers: [],
      score: 0,
      completed: false,
      subject
    });
  };

  const selectAnswer = (answer: string) => {
    const newAnswers = [...quiz.selectedAnswers];
    newAnswers[quiz.currentQuestion] = answer;
    setQuiz(prev => ({ ...prev, selectedAnswers: newAnswers }));
  };

  const nextQuestion = () => {
    if (quiz.currentQuestion < quiz.exercises.length - 1) {
      setQuiz(prev => ({ ...prev, currentQuestion: prev.currentQuestion + 1 }));
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
    let correctAnswers = 0;

    // Calcular pontuação
    for (let i = 0; i < quiz.exercises.length; i++) {
      const exercise = quiz.exercises[i];
      const userAnswer = quiz.selectedAnswers[i];
      const isCorrect = userAnswer === exercise.resposta_correta;
      
      if (isCorrect) correctAnswers++;

      // Salvar resultado no banco
      if (user) {
        try {
          await supabase.from('resultados').insert({
            aluno_id: user.id,
            exercicio_id: exercise.id,
            acertou: isCorrect
          });
        } catch (error) {
          console.error('Erro ao salvar resultado:', error);
        }
      }
    }

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
      exercises: [],
      selectedAnswers: [],
      score: 0,
      completed: false,
      subject: ""
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

  // Estado de erro de carregamento
  if (error) {
    return (
      <div className="min-h-screen pt-20 pb-8 flex items-center justify-center">
        <Card className="study-card max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-warning mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Erro ao carregar dados, tente novamente</h3>
            <p className="text-muted-foreground mb-4">Verifique sua conexão e tente novamente.</p>
            <Button onClick={loadExercises} className="hero-gradient text-white">Recarregar</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Interface do Quiz Ativo
  if (quiz.isActive && !quiz.completed) {
    const currentExercise = quiz.exercises[quiz.currentQuestion];
    const progress = ((quiz.currentQuestion + 1) / quiz.exercises.length) * 100;
    
    return (
      <div className="min-h-screen pt-20 pb-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold">Quiz de {quiz.subject}</h1>
              <Badge variant="outline">
                {quiz.currentQuestion + 1} de {quiz.exercises.length}
              </Badge>
            </div>
            <Progress value={progress} className="w-full" />
          </div>

          <Card className="study-card">
            <CardHeader>
              <CardTitle className="text-xl">
                {currentExercise.pergunta}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup
                value={quiz.selectedAnswers[quiz.currentQuestion] || ""}
                onValueChange={selectAnswer}
              >
                {(currentExercise.alternativas as string[]).map((alternativa, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem value={alternativa} id={`option-${index}`} />
                    <Label 
                      htmlFor={`option-${index}`} 
                      className="flex-1 cursor-pointer p-3 rounded-lg hover:bg-secondary"
                    >
                      {alternativa}
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              <div className="flex justify-between pt-4">
                <Button 
                  variant="outline" 
                  onClick={resetQuiz}
                >
                  Cancelar Quiz
                </Button>
                <Button 
                  onClick={nextQuestion}
                  disabled={!quiz.selectedAnswers[quiz.currentQuestion]}
                  className="hero-gradient text-white"
                >
                  {quiz.currentQuestion < quiz.exercises.length - 1 ? 'Próxima' : 'Finalizar'}
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
    const percentage = Math.round((quiz.score / quiz.exercises.length) * 100);
    
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
                  Você acertou {quiz.score} de {quiz.exercises.length} questões
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
                <div className="text-3xl font-bold text-primary">-</div>
                <div className="text-muted-foreground">Exercícios feitos</div>
              </CardContent>
            </Card>
            <Card className="study-card text-center">
              <CardContent className="p-6">
                <BarChart3 className="h-12 w-12 text-primary mx-auto mb-4" />
                <div className="text-3xl font-bold text-primary">-</div>
                <div className="text-muted-foreground">Taxa de acerto</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Matérias disponíveis */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
            Escolha uma <span className="text-gradient">matéria</span>
          </h2>
          
          {Object.keys(exercisesBySubject).length === 0 ? (
            <Card className="p-8 text-center">
              <CardContent>
                <PenTool className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum exercício disponível no momento.</h3>
                <p className="text-muted-foreground">
                  Ainda não há exercícios cadastrados no sistema
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(exercisesBySubject).map(([materia, exercises], index) => (
                <Card key={materia} className="study-card group cursor-pointer animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                  <CardHeader className="text-center pb-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-xl mb-4 group-hover:scale-110 transition-transform duration-300">
                      <PenTool className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle className="text-xl mb-2">{materia}</CardTitle>
                    <Badge variant="secondary" className="w-fit mx-auto">
                      {exercises.length} questões
                    </Badge>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center space-y-2">
                      <div className="flex items-center justify-center text-sm text-muted-foreground">
                        <Clock className="w-4 h-4 mr-1" />
                        ~{Math.min(exercises.length * 2, 20)} min
                      </div>
                      <div className="flex items-center justify-center text-sm text-muted-foreground">
                        <Target className="w-4 h-4 mr-1" />
                        {exercises.length} questões
                      </div>
                    </div>
                    <Button 
                      className="w-full group-hover:hero-gradient group-hover:text-white transition-all duration-300"
                      onClick={() => startQuiz(materia)}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Iniciar Quiz
                    </Button>
                  </CardContent>
                </Card>
              ))}
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