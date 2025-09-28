-- Create tables for AI chat system

-- Table for storing AI conversations
CREATE TABLE public.ai_conversations (
    id uuid NOT NULL DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    aluno_id uuid NOT NULL,
    titulo text,
    tipo text NOT NULL DEFAULT 'geral', -- 'redacao', 'duvida', 'mapa_mental', 'correcao'
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Table for storing AI messages
CREATE TABLE public.ai_messages (
    id uuid NOT NULL DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    conversation_id uuid NOT NULL,
    role text NOT NULL, -- 'user', 'assistant', 'system'
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

-- Table for storing student essays
CREATE TABLE public.redacoes (
    id uuid NOT NULL DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    aluno_id uuid NOT NULL,
    titulo text NOT NULL,
    conteudo text NOT NULL,
    tema text,
    tipo_correcao text DEFAULT 'geral', -- 'portugues', 'redacao', 'argumentacao'
    status text DEFAULT 'pendente', -- 'pendente', 'corrigida'
    nota numeric(4,2),
    feedback text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Table for tracking student progress
CREATE TABLE public.progresso_aluno (
    id uuid NOT NULL DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    aluno_id uuid NOT NULL,
    tipo text NOT NULL, -- 'redacao', 'duvidas_respondidas', 'mapas_mentais'
    valor integer DEFAULT 0,
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE(aluno_id, tipo)
);

-- Enable RLS
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.redacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progresso_aluno ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ai_conversations
CREATE POLICY "Users can view their own conversations" 
ON public.ai_conversations 
FOR SELECT 
USING (auth.uid() = aluno_id);

CREATE POLICY "Users can create their own conversations" 
ON public.ai_conversations 
FOR INSERT 
WITH CHECK (auth.uid() = aluno_id);

CREATE POLICY "Users can update their own conversations" 
ON public.ai_conversations 
FOR UPDATE 
USING (auth.uid() = aluno_id);

-- RLS Policies for ai_messages
CREATE POLICY "Users can view messages from their conversations" 
ON public.ai_messages 
FOR SELECT 
USING (EXISTS (
    SELECT 1 FROM public.ai_conversations 
    WHERE ai_conversations.id = ai_messages.conversation_id 
    AND ai_conversations.aluno_id = auth.uid()
));

CREATE POLICY "Users can create messages in their conversations" 
ON public.ai_messages 
FOR INSERT 
WITH CHECK (EXISTS (
    SELECT 1 FROM public.ai_conversations 
    WHERE ai_conversations.id = ai_messages.conversation_id 
    AND ai_conversations.aluno_id = auth.uid()
));

-- RLS Policies for redacoes
CREATE POLICY "Users can view their own essays" 
ON public.redacoes 
FOR SELECT 
USING (auth.uid() = aluno_id);

CREATE POLICY "Users can create their own essays" 
ON public.redacoes 
FOR INSERT 
WITH CHECK (auth.uid() = aluno_id);

CREATE POLICY "Users can update their own essays" 
ON public.redacoes 
FOR UPDATE 
USING (auth.uid() = aluno_id);

-- RLS Policies for progresso_aluno
CREATE POLICY "Users can view their own progress" 
ON public.progresso_aluno 
FOR SELECT 
USING (auth.uid() = aluno_id);

CREATE POLICY "Users can update their own progress" 
ON public.progresso_aluno 
FOR ALL 
USING (auth.uid() = aluno_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_ai_conversations_updated_at
    BEFORE UPDATE ON public.ai_conversations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_redacoes_updated_at
    BEFORE UPDATE ON public.redacoes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_progresso_aluno_updated_at
    BEFORE UPDATE ON public.progresso_aluno
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();