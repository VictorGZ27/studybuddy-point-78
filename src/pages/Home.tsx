import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Play, PenTool, MessageCircle, User, Trophy, Target, Zap, ArrowRight, Crown, CreditCard } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import logoStudyPoint from "@/assets/logo-studypoint.png";

const features = [
  {
    title: "Biblioteca de Resumos",
    description: "Resumos diretos e mapas mentais para todas as matérias",
    icon: BookOpen,
    path: "/biblioteca",
    color: "text-primary",
    bgColor: "bg-primary-light",
  },
  {
    title: "Videoaulas",
    description: "Aulas rápidas e professores especializados",
    icon: Play,
    path: "/videoaulas",
    color: "text-red-500",
    bgColor: "bg-red-100",
  },
  {
    title: "Exercícios Práticos",
    description: "Quizzes cronometrados com relatórios de desempenho",
    icon: PenTool,
    path: "/exercicios",
    color: "text-warning",
    bgColor: "bg-yellow-100",
  },
  {
    title: "Chat de Dúvidas",
    description: "Converse com professores especializados",
    icon: MessageCircle,
    path: "/chat",
    color: "text-success",
    bgColor: "bg-success-light",
  },
  {
    title: "Redação ENEM",
    description: "Correções detalhadas baseadas nos critérios oficiais",
    icon: PenTool,
    path: "/planos",
    color: "text-indigo-500",
    bgColor: "bg-indigo-100",
  },
  {
    title: "Meu Perfil",
    description: "Acompanhe seu progresso e conquistas",
    icon: User,
    path: "/perfil",
    color: "text-purple-500",
    bgColor: "bg-purple-100",
  },
];

const stats = [
  { icon: Trophy, value: "10k+", label: "Estudantes ativos" },
  { icon: Target, value: "95%", label: "Taxa de aprovação" },
  { icon: Zap, value: "5min", label: "Tempo médio de resposta" },
];

export default function Home() {
  const { isPremium } = useAuth();
  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <section className="hero-gradient text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in">
            <div className="w-20 h-20 mx-auto mb-6 bg-white rounded-xl p-3 shadow-lg">
              <img src={logoStudyPoint} alt="StudyPoint" className="w-full h-full" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              StudyPoint
            </h1>
            <p className="text-2xl md:text-3xl text-white/90 mb-4">
              Estudar ficou mais fácil
            </p>
            <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
              A plataforma educativa que revoluciona seus estudos com resumos inteligentes, 
              videoaulas rápidas e suporte personalizado.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="btn-float text-lg px-8 py-3">
                Começar agora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-secondary/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="inline-flex items-center justify-center w-16 h-16 hero-gradient rounded-xl mb-4">
                  <stat.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Tudo que você precisa para <span className="text-gradient">estudar melhor</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Ferramentas inteligentes, conteúdo de qualidade e suporte personalizado 
              para turbinar seus estudos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.path} className="study-card group cursor-pointer animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                  <Link to={feature.path}>
                    <CardHeader className="text-center pb-4">
                      <div className={`inline-flex items-center justify-center w-16 h-16 ${feature.bgColor} rounded-xl mb-4 group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className={`w-8 h-8 ${feature.color}`} />
                      </div>
                      <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
                      <CardDescription className="text-muted-foreground">
                        {feature.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <Button variant="outline" className="w-full group-hover:hero-gradient group-hover:text-white transition-all duration-300">
                        Explorar
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </CardContent>
                  </Link>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

        {/* CTA Section */}
        <section className="py-20 hero-gradient text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {isPremium ? (
              <>
                <Crown className="w-16 h-16 mx-auto mb-6 text-yellow-300 fill-current" />
                <h2 className="text-4xl font-bold mb-6">
                  Você é Premium! 🎉
                </h2>
                <p className="text-xl text-white/90 mb-8">
                  Aproveite todos os recursos exclusivos da plataforma e leve seus estudos ao próximo nível.
                </p>
                <Button size="lg" variant="secondary" className="btn-float text-lg px-8 py-3" asChild>
                  <Link to="/biblioteca">
                    Começar a estudar
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <h2 className="text-4xl font-bold mb-6">
                  Pronto para revolucionar seus estudos?
                </h2>
                <p className="text-xl text-white/90 mb-8">
                  Junte-se a milhares de estudantes que já transformaram sua forma de aprender.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" variant="secondary" className="btn-float text-lg px-8 py-3" asChild>
                    <Link to="/biblioteca">
                      Começar gratuitamente
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button size="lg" className="bg-white/20 hover:bg-white/30 text-white border border-white/30 btn-float text-lg px-8 py-3" asChild>
                    <Link to="/planos">
                      <Crown className="mr-2 h-5 w-5" />
                      Ver Planos Premium
                    </Link>
                  </Button>
                </div>
              </>
            )}
          </div>
        </section>
    </div>
  );
}