import { supabase } from '@/integrations/supabase/client'
import { Resumo, Videoaula, Professor, Exercicio, Resultado, ChatMessage } from '@/types/database'

// Serviços para Resumos
export const resumosService = {
  async getAll() {
    const { data, error } = await supabase
      .from('resumos')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async getByMateria(materia: string) {
    const { data, error } = await supabase
      .from('resumos')
      .select('*')
      .eq('materia', materia)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },
}

// Serviços para Professores
export const professoresService = {
  async getAll() {
    const { data, error } = await supabase
      .from('professores')
      .select('*')
      .order('nome')
    
    if (error) throw error
    return data || []
  },

  async getByMateria(materia: string) {
    const { data, error } = await supabase
      .from('professores')
      .select('*')
      .eq('materia', materia)
      .order('nome')
    
    if (error) throw error
    return data || []
  },
}

// Serviços para Videoaulas
export const videoaulasService = {
  async getAll() {
    const { data, error } = await supabase
      .from('videoaulas')
      .select(`
        *,
        professor:professores(*)
      `)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async getByMateria(materia: string) {
    const { data, error } = await supabase
      .from('videoaulas')
      .select(`
        *,
        professor:professores(*)
      `)
      .eq('materia', materia)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async getByProfessor(professorId: string) {
    const { data, error } = await supabase
      .from('videoaulas')
      .select(`
        *,
        professor:professores(*)
      `)
      .eq('professor_id', professorId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },
}

// Serviços para Exercícios
export const exerciciosService = {
  async getByMateria(materia: string) {
    const { data, error } = await supabase
      .from('exercicios')
      .select('*')
      .eq('materia', materia)
    
    if (error) throw error
    return data || []
  },

  async salvarResultado(alunoId: string, exercicioId: string, acertou: boolean) {
    const { data, error } = await supabase
      .from('resultados')
      .insert([
        {
          aluno_id: alunoId,
          exercicio_id: exercicioId,
          acertou,
        },
      ])
      .select()
      .single()
    
    if (error) throw error
    
    // Atualizar pontos do usuário
    if (acertou) {
      await supabase.rpc('incrementar_pontos', { user_id: alunoId, pontos: 10 })
    }
    
    return data
  },
}

// Serviços para Resultados
export const resultadosService = {
  async getByAluno(alunoId: string) {
    const { data, error } = await supabase
      .from('resultados')
      .select(`
        *,
        exercicio:exercicios(*)
      `)
      .eq('aluno_id', alunoId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async getEstatisticas(alunoId: string) {
    const { data, error } = await supabase
      .from('resultados')
      .select('acertou')
      .eq('aluno_id', alunoId)
    
    if (error) throw error
    
    const total = data?.length || 0
    const acertos = data?.filter(r => r.acertou).length || 0
    const percentual = total > 0 ? Math.round((acertos / total) * 100) : 0
    
    return {
      total,
      acertos,
      erros: total - acertos,
      percentual,
    }
  },
}

// Serviços para Chat
export const chatService = {
  async getConversas(alunoId: string) {
    const { data, error } = await supabase
      .from('chat')
      .select(`
        *,
        professor:professores(*),
        aluno:profiles(nome, foto_url)
      `)
      .eq('aluno_id', alunoId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  async enviarMensagem(alunoId: string, professorId: string, mensagem: string) {
    const { data, error } = await supabase
      .from('chat')
      .insert([
        {
          aluno_id: alunoId,
          professor_id: professorId,
          mensagem,
        },
      ])
      .select(`
        *,
        professor:professores(*),
        aluno:profiles(nome, foto_url)
      `)
      .single()
    
    if (error) throw error
    return data
  },

  // Função para escutar mensagens em tempo real
  subscribeToMessages(alunoId: string, callback: (message: ChatMessage) => void) {
    return supabase
      .channel('chat')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat',
          filter: `aluno_id=eq.${alunoId}`,
        },
        (payload) => {
          callback(payload.new as ChatMessage)
        }
      )
      .subscribe()
  },
}

// Função auxiliar para criar RPC de incrementar pontos (precisa ser criada no Supabase)
export const criarFuncaoIncrementarPontos = `
CREATE OR REPLACE FUNCTION incrementar_pontos(user_id uuid, pontos integer)
RETURNS void AS $$
BEGIN
  UPDATE profiles 
  SET pontos = pontos + incrementar_pontos.pontos
  WHERE id = incrementar_pontos.user_id;
END;
$$ LANGUAGE plpgsql;
`