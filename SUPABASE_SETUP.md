# Configuração do Banco de Dados Supabase

## Instruções para criar as tabelas no Supabase

Vá até o Supabase Dashboard → SQL Editor e execute estes comandos:

### 1. Extensões necessárias
```sql
-- Habilitar extensão UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### 2. Tabela profiles (usuários)
```sql
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  foto_url TEXT,
  pontos INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Trigger para criar perfil automaticamente quando usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, email)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'nome', NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

### 3. Tabela resumos
```sql
CREATE TABLE IF NOT EXISTS resumos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  materia TEXT NOT NULL,
  titulo TEXT NOT NULL,
  conteudo TEXT NOT NULL,
  pdf_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS
ALTER TABLE resumos ENABLE ROW LEVEL SECURITY;

-- Todos podem ler resumos
CREATE POLICY "Anyone can read resumos" ON resumos
  FOR SELECT USING (true);
```

### 4. Tabela professores
```sql
CREATE TABLE IF NOT EXISTS professores (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nome TEXT NOT NULL,
  materia TEXT NOT NULL,
  descricao TEXT NOT NULL,
  foto_url TEXT
);

-- RLS
ALTER TABLE professores ENABLE ROW LEVEL SECURITY;

-- Todos podem ler professores
CREATE POLICY "Anyone can read professores" ON professores
  FOR SELECT USING (true);
```

### 5. Tabela videoaulas
```sql
CREATE TABLE IF NOT EXISTS videoaulas (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  materia TEXT NOT NULL,
  titulo TEXT NOT NULL,
  video_url TEXT NOT NULL,
  professor_id UUID REFERENCES professores(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS
ALTER TABLE videoaulas ENABLE ROW LEVEL SECURITY;

-- Todos podem ler videoaulas
CREATE POLICY "Anyone can read videoaulas" ON videoaulas
  FOR SELECT USING (true);
```

### 6. Tabela exercicios
```sql
CREATE TABLE IF NOT EXISTS exercicios (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  materia TEXT NOT NULL,
  pergunta TEXT NOT NULL,
  opcoes JSONB NOT NULL,
  resposta_correta TEXT NOT NULL
);

-- RLS
ALTER TABLE exercicios ENABLE ROW LEVEL SECURITY;

-- Todos podem ler exercicios
CREATE POLICY "Anyone can read exercicios" ON exercicios
  FOR SELECT USING (true);
```

### 7. Tabela resultados
```sql
CREATE TABLE IF NOT EXISTS resultados (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  aluno_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  exercicio_id UUID REFERENCES exercicios(id) ON DELETE CASCADE,
  acertou BOOLEAN NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS
ALTER TABLE resultados ENABLE ROW LEVEL SECURITY;

-- Usuários podem ver apenas seus próprios resultados
CREATE POLICY "Users can view own results" ON resultados
  FOR SELECT USING (auth.uid() = aluno_id);

-- Usuários podem inserir seus próprios resultados
CREATE POLICY "Users can insert own results" ON resultados
  FOR INSERT WITH CHECK (auth.uid() = aluno_id);
```

### 8. Tabela chat
```sql
CREATE TABLE IF NOT EXISTS chat (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  aluno_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  professor_id UUID REFERENCES professores(id) ON DELETE CASCADE,
  mensagem TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS
ALTER TABLE chat ENABLE ROW LEVEL SECURITY;

-- Usuários podem ver mensagens onde participam
CREATE POLICY "Users can view own messages" ON chat
  FOR SELECT USING (auth.uid() = aluno_id);

-- Usuários podem inserir suas próprias mensagens
CREATE POLICY "Users can insert own messages" ON chat
  FOR INSERT WITH CHECK (auth.uid() = aluno_id);
```

### 9. Função para incrementar pontos
```sql
CREATE OR REPLACE FUNCTION incrementar_pontos(user_id UUID, pontos INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles 
  SET pontos = profiles.pontos + incrementar_pontos.pontos
  WHERE id = incrementar_pontos.user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 10. Dados de exemplo (opcional)

#### Professores
```sql
INSERT INTO professores (nome, materia, descricao, foto_url) VALUES
('Prof. Ana Silva', 'Matemática', 'Especialista em Álgebra e Geometria com 15 anos de experiência', 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150'),
('Prof. João Santos', 'Português', 'Doutor em Literatura Brasileira, focado em interpretação de texto', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'),
('Prof. Maria Costa', 'História', 'Historiadora especializada em História do Brasil', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150'),
('Prof. Carlos Lima', 'Geografia', 'Geógrafo com foco em Geografia Física e Humana', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'),
('Prof. Laura Mendes', 'Ciências', 'Bióloga e Química, especialista em ensino integrado', 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150'),
('Prof. Roberto Brown', 'Inglês', 'Professor nativo com certificação TEFL', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150');
```

#### Resumos
```sql
INSERT INTO resumos (materia, titulo, conteudo) VALUES
('Matemática', 'Funções Quadráticas', 'Uma função quadrática é definida por f(x) = ax² + bx + c, onde a ≠ 0. Características principais: 1) Gráfico em formato de parábola 2) Vértice em x = -b/2a 3) Discriminante Δ = b² - 4ac determina quantidade de raízes'),
('História', 'Segunda Guerra Mundial', 'Conflito global (1939-1945) que envolveu principais potências mundiais. Causas: Imperialismo, nacionalismo, crise econômica. Consequências: Criação da ONU, divisão da Alemanha, início da Guerra Fria'),
('Português', 'Figuras de Linguagem', 'Recursos expressivos da língua: Metáfora (comparação implícita), Metonímia (substituição), Hipérbole (exagero), Personificação (características humanas a seres inanimados)');
```

#### Exercícios
```sql
INSERT INTO exercicios (materia, pergunta, opcoes, resposta_correta) VALUES
('Matemática', 'Qual é o valor da função f(x) = 2x² - 3x + 1 quando x = 2?', '["1", "2", "3", "4"]', '3'),
('História', 'Em que ano terminou a Segunda Guerra Mundial?', '["1944", "1945", "1946", "1947"]', '1945'),
('Português', 'Qual figura de linguagem está presente em "O vento sussurrava segredos"?', '["Metáfora", "Personificação", "Hipérbole", "Metonímia"]', 'Personificação');
```

## Configuração no Lovable

1. No Supabase Dashboard, vá em Settings → API
2. Copie a URL do projeto e a chave pública (anon key)
3. No Lovable, essas chaves serão configuradas automaticamente pela integração

## Testando a conexão

Após executar os comandos SQL acima, o sistema estará pronto para:
- ✅ Cadastro e login de usuários
- ✅ Criação automática de perfis
- ✅ Consulta de resumos, videoaulas e exercícios
- ✅ Sistema de pontuação
- ✅ Chat entre alunos e professores
- ✅ Relatórios de desempenho