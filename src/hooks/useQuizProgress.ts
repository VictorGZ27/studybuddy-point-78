import { useState, useEffect } from 'react';

interface QuizProgress {
  [materia: string]: {
    totalAttempts: number;
    bestScore: number;
    lastScore: number;
    totalQuestions: number;
    lastPlayed: string;
  };
}

export const useQuizProgress = () => {
  const [progress, setProgress] = useState<QuizProgress>({});

  useEffect(() => {
    // Carregar progresso do localStorage
    const saved = localStorage.getItem('quiz-progress');
    if (saved) {
      try {
        setProgress(JSON.parse(saved));
      } catch (error) {
        console.error('Erro ao carregar progresso:', error);
      }
    }
  }, []);

  const saveQuizResult = (materia: string, score: number, totalQuestions: number) => {
    setProgress(prev => {
      const materiaProgress = prev[materia] || {
        totalAttempts: 0,
        bestScore: 0,
        lastScore: 0,
        totalQuestions: 0,
        lastPlayed: ''
      };

      const newProgress = {
        ...prev,
        [materia]: {
          totalAttempts: materiaProgress.totalAttempts + 1,
          bestScore: Math.max(materiaProgress.bestScore, score),
          lastScore: score,
          totalQuestions,
          lastPlayed: new Date().toISOString()
        }
      };

      // Salvar no localStorage
      localStorage.setItem('quiz-progress', JSON.stringify(newProgress));
      return newProgress;
    });
  };

  const getOverallStats = () => {
    const stats = Object.values(progress);
    if (stats.length === 0) {
      return {
        totalQuizzes: 0,
        averageScore: 0,
        bestOverallScore: 0
      };
    }

    const totalQuizzes = stats.reduce((acc, stat) => acc + stat.totalAttempts, 0);
    const totalScores = stats.reduce((acc, stat) => acc + (stat.lastScore * stat.totalAttempts), 0);
    const totalPossibleScores = stats.reduce((acc, stat) => acc + (stat.totalQuestions * stat.totalAttempts), 0);
    const bestOverallScore = Math.max(...stats.map(stat => Math.round((stat.bestScore / stat.totalQuestions) * 100)));

    return {
      totalQuizzes,
      averageScore: totalPossibleScores > 0 ? Math.round((totalScores / totalPossibleScores) * 100) : 0,
      bestOverallScore: isFinite(bestOverallScore) ? bestOverallScore : 0
    };
  };

  return {
    progress,
    saveQuizResult,
    getOverallStats
  };
};