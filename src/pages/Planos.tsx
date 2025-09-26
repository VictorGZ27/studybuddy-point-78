import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Crown, Zap, BookOpen, MessageCircle, PenTool, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const freeFeatures = [
  "Matérias do Ensino Médio com professor fixo",
  "1 redação por semana (4 por mês)",
  "Correções baseadas nos critérios do ENEM",
  "2 das 4 redações com avaliação detalhada",
  "Escolha 2 professores para dúvidas",
  "Chat inteligente básico"
];

const premiumFeatures = [
  "Escolha qualquer professor disponível",
  "Redações ilimitadas",
  "Todas com correções ENEM completas",
  "Todas com avaliação detalhada",
  "Dúvidas ilimitadas com qualquer professor",
  "Chat inteligente completo",
  "Mapas mentais personalizados",
  "Suporte prioritário"
];

export default function Planos() {
  const { isPremium, upgradeToPremium } = useAuth();

  const handleUpgrade = async () => {
    try {
      await upgradeToPremium();
    } catch (error) {
      // Error já é tratado no context
    }
  };

  const handleStartFree = () => {
    toast.success("Você já tem acesso ao plano gratuito!");
  };

  return (
    <div className="min-h-screen pt-20 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Planos e <span className="text-gradient">Preços</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-2">
            Escolha o plano ideal e leve seus estudos ao próximo nível.
          </p>
          <p className="text-muted-foreground">
            Cancele a qualquer momento • Suporte 24/7 • Sem compromisso
          </p>
        </div>

        {/* Plans */}
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Free Plan */}
            <Card className="study-card relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge variant="secondary" className="bg-primary/10 text-primary px-6 py-2">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Gratuito
                </Badge>
              </div>
              
              <CardHeader className="text-center pt-8 pb-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-xl mb-6">
                  <Zap className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-2xl mb-2">Plano Gratuito</CardTitle>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-primary">R$ 0</span>
                  <span className="text-muted-foreground">/mês</span>
                </div>
                <p className="text-muted-foreground">
                  Perfeito para começar seus estudos
                </p>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="space-y-3">
                  {freeFeatures.map((feature, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-3 bg-secondary/50 rounded-lg">
                      <PenTool className="w-6 h-6 text-primary mx-auto mb-1" />
                      <div className="text-sm font-medium">4 redações/mês</div>
                    </div>
                    <div className="p-3 bg-secondary/50 rounded-lg">
                      <Users className="w-6 h-6 text-primary mx-auto mb-1" />
                      <div className="text-sm font-medium">2 professores</div>
                    </div>
                  </div>

                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="w-full"
                    onClick={handleStartFree}
                  >
                    Começar agora
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Premium Plan */}
            <Card className="study-card relative shadow-float border-2 border-primary/20">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="hero-gradient text-white px-6 py-2 shadow-card">
                  <Star className="w-4 h-4 mr-2 fill-current" />
                  Mais Popular
                </Badge>
              </div>
              
              <CardHeader className="text-center pt-8 pb-4">
                <div className="inline-flex items-center justify-center w-16 h-16 hero-gradient rounded-xl mb-6">
                  <Crown className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl mb-2">Plano Premium</CardTitle>
                 <div className="mb-4">
                   <span className="text-4xl font-bold text-gradient">R$ 35,90</span>
                   <span className="text-muted-foreground">/mês</span>
                 </div>
                <p className="text-muted-foreground">
                  Acesso completo a todas as funcionalidades
                </p>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="space-y-3">
                  {premiumFeatures.map((feature, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <Check className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-3 hero-gradient text-white rounded-lg">
                      <PenTool className="w-6 h-6 mx-auto mb-1" />
                      <div className="text-sm font-medium">Ilimitado</div>
                    </div>
                    <div className="p-3 hero-gradient text-white rounded-lg">
                      <MessageCircle className="w-6 h-6 mx-auto mb-1" />
                      <div className="text-sm font-medium">Sem limites</div>
                    </div>
                  </div>

                  <Button 
                    size="lg" 
                    className="w-full hero-gradient text-white shadow-card hover:shadow-float"
                    onClick={handleUpgrade}
                    disabled={isPremium}
                  >
                    {isPremium ? (
                      <>
                        <Crown className="w-5 h-5 mr-2" />
                        Plano Ativo
                      </>
                    ) : (
                      "Assinar Premium"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Features Comparison */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center mb-12">
            Compare os <span className="text-gradient">recursos</span>
          </h2>
          
          <div className="max-w-4xl mx-auto">
            <Card className="study-card">
              <CardContent className="p-8">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-4 px-4">Recursos</th>
                        <th className="text-center py-4 px-4">Gratuito</th>
                        <th className="text-center py-4 px-4">Premium</th>
                      </tr>
                    </thead>
                    <tbody className="space-y-2">
                      <tr className="border-b border-border/50">
                        <td className="py-4 px-4">Redações por mês</td>
                        <td className="text-center py-4 px-4">4</td>
                        <td className="text-center py-4 px-4 text-success font-medium">Ilimitado</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-4 px-4">Avaliação detalhada</td>
                        <td className="text-center py-4 px-4">2 por mês</td>
                        <td className="text-center py-4 px-4 text-success font-medium">Todas</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-4 px-4">Escolha de professores</td>
                        <td className="text-center py-4 px-4">2 fixos</td>
                        <td className="text-center py-4 px-4 text-success font-medium">Todos (28)</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-4 px-4">Chat com professores</td>
                        <td className="text-center py-4 px-4">Limitado</td>
                        <td className="text-center py-4 px-4 text-success font-medium">Ilimitado</td>
                      </tr>
                      <tr className="border-b border-border/50">
                        <td className="py-4 px-4">Mapas mentais</td>
                        <td className="text-center py-4 px-4">-</td>
                        <td className="text-center py-4 px-4 text-success font-medium">✓</td>
                      </tr>
                      <tr>
                        <td className="py-4 px-4">Suporte prioritário</td>
                        <td className="text-center py-4 px-4">-</td>
                        <td className="text-center py-4 px-4 text-success font-medium">✓</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center mb-12">
            Perguntas <span className="text-gradient">Frequentes</span>
          </h2>
          
          <div className="max-w-3xl mx-auto space-y-6">
            <Card className="study-card">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Posso cancelar a qualquer momento?</h3>
                <p className="text-muted-foreground">
                  Sim! Você pode cancelar seu plano Premium a qualquer momento sem multas ou taxas adicionais.
                </p>
              </CardContent>
            </Card>
            
            <Card className="study-card">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Como funciona a correção das redações?</h3>
                <p className="text-muted-foreground">
                  Todas as redações são corrigidas seguindo os critérios oficiais do ENEM por professores especializados, 
                  com feedback detalhado sobre cada competência avaliada.
                </p>
              </CardContent>
            </Card>
            
            <Card className="study-card">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Quantos professores estão disponíveis?</h3>
                <p className="text-muted-foreground">
                  Temos 28 professores especializados em diferentes áreas. No plano gratuito você pode escolher 2, 
                  no Premium tem acesso a todos.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}