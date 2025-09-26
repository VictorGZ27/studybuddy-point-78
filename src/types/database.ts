// Tipos TypeScript para as tabelas do banco de dados
export interface Profile {
  id: string
  nome: string
  email: string
  foto_url?: string
  pontos: number
  tipo_usuario: 'aluno' | 'admin'
  created_at: string
}

export interface Resumo {
  id: string
  materia: string
  titulo: string
  conteudo: string
  topico?: string
  pdf_url?: string
  autor_id?: string
  created_at: string
}

export interface Professor {
  id: string
  nome: string
  materia: string
  descricao: string
  foto_url?: string
}

export interface Videoaula {
  id: string
  materia: string
  titulo: string
  descricao?: string
  url_video: string
  nivel?: string
  duracao?: string
  professor_id?: string
  autor_id?: string
  professor?: Professor
  created_at: string
}

export interface Exercicio {
  id: string
  materia: string
  pergunta: string
  alternativas: string[]
  resposta_correta: string
  nivel?: string
  autor_id?: string
}

export interface Resultado {
  id: string
  aluno_id: string
  exercicio_id: string
  acertou: boolean
  created_at: string
  exercicio?: Exercicio
}

export interface ChatMessage {
  id: string
  aluno_id: string
  professor_id: string
  mensagem: string
  created_at: string
  professor?: Professor
  aluno?: Profile
}