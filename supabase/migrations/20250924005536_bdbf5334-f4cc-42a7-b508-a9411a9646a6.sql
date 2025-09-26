-- Inserir dados de exemplo

-- Professores
INSERT INTO public.professores (nome, materia, descricao) VALUES
('Prof. João Silva', 'Matemática', 'Professor de Matemática com 15 anos de experiência'),
('Prof. Maria Santos', 'Português', 'Especialista em Literatura e Gramática'),
('Prof. Carlos Lima', 'História', 'Doutor em História do Brasil');

-- Resumos
INSERT INTO public.resumos (materia, titulo, conteudo) VALUES
('Matemática', 'Funções Quadráticas', 'Uma função quadrática é uma função do tipo f(x) = ax² + bx + c, onde a ≠ 0...'),
('Português', 'Figuras de Linguagem', 'As figuras de linguagem são recursos estilísticos que tornam a linguagem mais expressiva...'),
('História', 'Independência do Brasil', 'A Independência do Brasil foi um processo que culminou com a Proclamação da Independência em 1822...');

-- Exercícios  
INSERT INTO public.exercicios (materia, pergunta, opcoes, resposta_correta) VALUES
('Matemática', 'Qual é o resultado de 2 + 2?', ARRAY['3', '4', '5', '6'], '4'),
('Português', 'Qual é o plural de "cidadão"?', ARRAY['cidadãos', 'cidadões', 'cidadães', 'cidadãs'], 'cidadãos'),
('História', 'Em que ano foi proclamada a Independência do Brasil?', ARRAY['1820', '1821', '1822', '1823'], '1822');