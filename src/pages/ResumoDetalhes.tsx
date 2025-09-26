import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, User, Calendar, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Resumo } from "@/types/database";
import { toast } from "sonner";

export default function ResumoDetalhes() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [resumo, setResumo] = useState<Resumo | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    const carregar = async () => {
      if (!id) {
        setErro('ID do resumo inválido');
        setLoading(false);
        return;
      }
      await loadResumo(id);
    };
    carregar();
  }, [id]);

  const loadResumo = async (resumoId: string) => {
    try {
      setErro(null);
      const { data, error } = await supabase
        .from('resumos')
        .select('*')
        .eq('id', resumoId)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        setResumo(null);
        setErro('Resumo não encontrado');
      } else {
        setResumo(data);
      }
    } catch (error) {
      console.error('Erro ao carregar resumo:', error);
      setErro('Erro ao carregar resumo');
      toast.error('Erro ao carregar resumo');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 pb-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando resumo...</p>
        </div>
      </div>
    );
  }

  if (!resumo) {
    return (
      <div className="min-h-screen pt-20 pb-8 flex items-center justify-center">
        <Card className="study-card max-w-md">
          <CardContent className="p-8 text-center">
            <h3 className="text-xl font-semibold mb-2">{erro || 'Resumo não encontrado'}</h3>
            <p className="text-muted-foreground mb-4">
              {erro ? 'Verifique e tente novamente.' : 'O resumo que você está procurando não existe ou foi removido.'}
            </p>
            <Button onClick={() => navigate('/biblioteca')} className="hero-gradient text-white">
              Voltar à Biblioteca
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="outline" 
            onClick={() => navigate('/biblioteca')}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar à Biblioteca
          </Button>

          <div className="flex flex-wrap items-center gap-3 mb-4">
            <Badge variant="outline" className="text-sm">
              {resumo.materia}
            </Badge>
            {resumo.topico && (
              <Badge variant="secondary" className="text-sm">
                {resumo.topico}
              </Badge>
            )}
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="w-4 h-4 mr-1" />
              {new Date(resumo.created_at).toLocaleDateString('pt-BR')}
            </div>
          </div>

          <h1 className="text-4xl font-bold text-foreground mb-4">
            {resumo.titulo}
          </h1>
        </div>

        {/* Content */}
        <Card className="study-card">
          <CardContent className="p-8">
            <div className="prose prose-gray max-w-none">
              <div className="text-foreground leading-relaxed text-lg whitespace-pre-wrap">
                {resumo.conteudo}
              </div>
            </div>

            {resumo.pdf_url && (
              <div className="mt-8 pt-6 border-t border-border">
                <Button 
                  variant="outline" 
                  className="w-full sm:w-auto"
                  onClick={() => window.open(resumo.pdf_url!, '_blank')}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Baixar PDF
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="mt-8 flex justify-center">
          <Button 
            onClick={() => navigate('/biblioteca')}
            className="hero-gradient text-white"
          >
            Explorar mais resumos
          </Button>
        </div>
      </div>
    </div>
  );
}