-- Atualizar tabela profiles para incluir tipo_usuario
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS tipo_usuario TEXT DEFAULT 'aluno' CHECK (tipo_usuario IN ('aluno', 'admin'));

-- Atualizar tabela resumos para incluir campos necessários
ALTER TABLE public.resumos 
ADD COLUMN IF NOT EXISTS topico TEXT,
ADD COLUMN IF NOT EXISTS autor_id UUID REFERENCES public.profiles(id);

-- Atualizar tabela videoaulas para incluir campos necessários
ALTER TABLE public.videoaulas 
ADD COLUMN IF NOT EXISTS descricao TEXT,
ADD COLUMN IF NOT EXISTS nivel TEXT,
ADD COLUMN IF NOT EXISTS duracao TEXT,
ADD COLUMN IF NOT EXISTS autor_id UUID REFERENCES public.profiles(id);

-- Renomear video_url para url_video na tabela videoaulas (se ainda não foi renomeado)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'videoaulas' AND column_name = 'video_url') THEN
        ALTER TABLE public.videoaulas RENAME COLUMN video_url TO url_video;
    END IF;
END $$;

-- Atualizar tabela exercicios para incluir campos necessários
ALTER TABLE public.exercicios 
ADD COLUMN IF NOT EXISTS nivel TEXT,
ADD COLUMN IF NOT EXISTS autor_id UUID REFERENCES public.profiles(id);

-- Alterar tipo da coluna opcoes/alternativas para JSON
DO $$ 
BEGIN
    -- Se a coluna se chama opcoes, renomear e alterar tipo
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exercicios' AND column_name = 'opcoes') THEN
        -- Criar nova coluna alternativas como JSON
        ALTER TABLE public.exercicios ADD COLUMN alternativas JSON;
        -- Converter dados existentes de ARRAY para JSON
        UPDATE public.exercicios SET alternativas = array_to_json(opcoes);
        -- Remover coluna antiga
        ALTER TABLE public.exercicios DROP COLUMN opcoes;
    ELSIF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'exercicios' AND column_name = 'alternativas' AND data_type != 'json') THEN
        -- Se já existe alternativas mas não é JSON, alterar tipo
        ALTER TABLE public.exercicios ALTER COLUMN alternativas TYPE JSON USING array_to_json(alternativas::text[]);
    END IF;
END $$;

-- Criar políticas RLS para resumos
DROP POLICY IF EXISTS "Todos podem ver resumos" ON public.resumos;
CREATE POLICY "Todos podem ver resumos" ON public.resumos FOR SELECT USING (true);

CREATE POLICY "Autores podem inserir resumos" ON public.resumos FOR INSERT WITH CHECK (auth.uid() = autor_id);
CREATE POLICY "Autores podem editar próprios resumos" ON public.resumos FOR UPDATE USING (auth.uid() = autor_id);
CREATE POLICY "Admins podem editar todos os resumos" ON public.resumos FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND tipo_usuario = 'admin')
);

-- Criar políticas RLS para videoaulas
DROP POLICY IF EXISTS "Todos podem ver videoaulas" ON public.videoaulas;
CREATE POLICY "Todos podem ver videoaulas" ON public.videoaulas FOR SELECT USING (true);

CREATE POLICY "Autores podem inserir videoaulas" ON public.videoaulas FOR INSERT WITH CHECK (auth.uid() = autor_id);
CREATE POLICY "Autores podem editar próprias videoaulas" ON public.videoaulas FOR UPDATE USING (auth.uid() = autor_id);
CREATE POLICY "Admins podem editar todas as videoaulas" ON public.videoaulas FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND tipo_usuario = 'admin')
);

-- Criar políticas RLS para exercicios
DROP POLICY IF EXISTS "Todos podem ver exercícios" ON public.exercicios;
CREATE POLICY "Todos podem ver exercícios" ON public.exercicios FOR SELECT USING (true);

CREATE POLICY "Autores podem inserir exercicios" ON public.exercicios FOR INSERT WITH CHECK (auth.uid() = autor_id);
CREATE POLICY "Autores podem editar próprios exercicios" ON public.exercicios FOR UPDATE USING (auth.uid() = autor_id);
CREATE POLICY "Admins podem editar todos os exercicios" ON public.exercicios FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND tipo_usuario = 'admin')
);

-- Atualizar dados existentes
UPDATE public.resumos SET autor_id = (SELECT id FROM public.profiles LIMIT 1) WHERE autor_id IS NULL;
UPDATE public.videoaulas SET autor_id = (SELECT id FROM public.profiles LIMIT 1) WHERE autor_id IS NULL;
UPDATE public.exercicios SET autor_id = (SELECT id FROM public.profiles LIMIT 1) WHERE autor_id IS NULL;

-- Inserir dados de exemplo
INSERT INTO public.resumos (materia, titulo, conteudo, topico, autor_id) VALUES
('Física', 'Leis de Newton', 'As três leis de Newton são os fundamentos da mecânica clássica...', 'Mecânica', (SELECT id FROM public.profiles LIMIT 1)),
('Química', 'Tabela Periódica', 'A tabela periódica organiza os elementos químicos por número atômico...', 'Química Geral', (SELECT id FROM public.profiles LIMIT 1)),
('Biologia', 'Células', 'A célula é a unidade básica da vida...', 'Citologia', (SELECT id FROM public.profiles LIMIT 1))
ON CONFLICT DO NOTHING;

INSERT INTO public.videoaulas (materia, titulo, descricao, url_video, nivel, duracao, autor_id) VALUES
('Matemática', 'Funções do 1º Grau', 'Aprenda sobre funções lineares e suas aplicações', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'Básico', '15min', (SELECT id FROM public.profiles LIMIT 1)),
('Física', 'Cinemática', 'Estudo do movimento dos corpos', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'Intermediário', '20min', (SELECT id FROM public.profiles LIMIT 1)),
('Química', 'Ligações Químicas', 'Tipos de ligações entre átomos', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'Avançado', '25min', (SELECT id FROM public.profiles LIMIT 1))
ON CONFLICT DO NOTHING;

INSERT INTO public.exercicios (materia, pergunta, alternativas, resposta_correta, nivel, autor_id) VALUES
('Física', 'Qual é a unidade de força no Sistema Internacional?', '["N (Newton)", "J (Joule)", "W (Watt)", "Pa (Pascal)"]'::json, 'N (Newton)', 'Básico', (SELECT id FROM public.profiles LIMIT 1)),
('Química', 'Qual é o símbolo químico do ouro?', '["Au", "Ag", "Fe", "Cu"]'::json, 'Au', 'Básico', (SELECT id FROM public.profiles LIMIT 1)),
('Biologia', 'Qual organela é responsável pela respiração celular?', '["Mitocôndria", "Núcleo", "Ribossomo", "Cloroplasto"]'::json, 'Mitocôndria', 'Intermediário', (SELECT id FROM public.profiles LIMIT 1))
ON CONFLICT DO NOTHING;