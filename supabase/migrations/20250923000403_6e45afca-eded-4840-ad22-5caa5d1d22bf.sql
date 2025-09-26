-- Ativar extensão para gerar UUIDs (se não existir)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Criar tabelas que não existem ainda
CREATE TABLE IF NOT EXISTS public.professores (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  materia TEXT,
  descricao TEXT,
  foto_url TEXT,
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.resumos (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  materia TEXT,
  titulo TEXT NOT NULL,
  conteudo TEXT,
  pdf_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.videoaulas (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  materia TEXT,
  titulo TEXT NOT NULL,
  video_url TEXT NOT NULL,
  professor_id UUID REFERENCES public.professores(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.exercicios (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  materia TEXT,
  pergunta TEXT NOT NULL,
  opcoes TEXT[] NOT NULL,
  resposta_correta TEXT NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.resultados (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  aluno_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exercicio_id UUID NOT NULL REFERENCES public.exercicios(id) ON DELETE CASCADE,
  acertou BOOLEAN NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.chat (
  id UUID NOT NULL DEFAULT uuid_generate_v4(),
  aluno_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  professor_id UUID NOT NULL REFERENCES public.professores(id) ON DELETE CASCADE,
  mensagem TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (id)
);

-- Adicionar colunas que podem estar faltando na tabela profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS pontos INTEGER DEFAULT 0;

-- Habilitar Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videoaulas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercicios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resultados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat ENABLE ROW LEVEL SECURITY;

-- Políticas RLS (usar IF NOT EXISTS quando possível)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Usuários podem ver todos os perfis' AND tablename = 'profiles') THEN
        CREATE POLICY "Usuários podem ver todos os perfis" ON public.profiles FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Usuários podem atualizar próprio perfil' AND tablename = 'profiles') THEN
        CREATE POLICY "Usuários podem atualizar próprio perfil" ON public.profiles FOR UPDATE USING (auth.uid() = id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Usuários podem inserir próprio perfil' AND tablename = 'profiles') THEN
        CREATE POLICY "Usuários podem inserir próprio perfil" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Todos podem ver professores' AND tablename = 'professores') THEN
        CREATE POLICY "Todos podem ver professores" ON public.professores FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Todos podem ver resumos' AND tablename = 'resumos') THEN
        CREATE POLICY "Todos podem ver resumos" ON public.resumos FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Todos podem ver videoaulas' AND tablename = 'videoaulas') THEN
        CREATE POLICY "Todos podem ver videoaulas" ON public.videoaulas FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Todos podem ver exercícios' AND tablename = 'exercicios') THEN
        CREATE POLICY "Todos podem ver exercícios" ON public.exercicios FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Usuários podem ver próprios resultados' AND tablename = 'resultados') THEN
        CREATE POLICY "Usuários podem ver próprios resultados" ON public.resultados FOR SELECT USING (auth.uid() = aluno_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Usuários podem inserir próprios resultados' AND tablename = 'resultados') THEN
        CREATE POLICY "Usuários podem inserir próprios resultados" ON public.resultados FOR INSERT WITH CHECK (auth.uid() = aluno_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Usuários podem ver próprias mensagens' AND tablename = 'chat') THEN
        CREATE POLICY "Usuários podem ver próprias mensagens" ON public.chat FOR SELECT USING (auth.uid() = aluno_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Usuários podem enviar mensagens' AND tablename = 'chat') THEN
        CREATE POLICY "Usuários podem enviar mensagens" ON public.chat FOR INSERT WITH CHECK (auth.uid() = aluno_id);
    END IF;
END $$;

-- Função para incrementar pontos
CREATE OR REPLACE FUNCTION incrementar_pontos(user_id uuid, pontos integer)
RETURNS void AS $$
BEGIN
  UPDATE profiles 
  SET pontos = profiles.pontos + incrementar_pontos.pontos
  WHERE id = incrementar_pontos.user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente quando usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, email)
  VALUES (new.id, new.raw_user_meta_data->>'nome', new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remover trigger se existir e recriar
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();