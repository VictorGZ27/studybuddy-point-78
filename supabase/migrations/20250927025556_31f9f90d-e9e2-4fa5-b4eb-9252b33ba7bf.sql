-- Insert new study summaries for all 12 subjects
INSERT INTO public.resumos (titulo, materia, topico, conteudo, autor_id) VALUES
-- Matemática
('Funções do 1º Grau', 'Matemática', 'Álgebra', 'Uma função do 1º grau é dada por f(x) = ax + b, onde a ≠ 0. Seu gráfico é uma reta. O coeficiente "a" define a inclinação (taxa de crescimento ou decrescimento), e "b" é o ponto de interseção com o eixo y. Exemplo: f(x) = 2x + 3 → cresce 2 unidades para cada 1 no eixo x.', null),
('Funções do 2º Grau', 'Matemática', 'Álgebra', 'Uma função do 2º grau é f(x) = ax² + bx + c (a ≠ 0). O gráfico é uma parábola que pode se abrir para cima (a > 0) ou para baixo (a < 0). O vértice indica o ponto máximo ou mínimo da função. A fórmula de Bhaskara resolve ax² + bx + c = 0.', null),

-- Português
('Figuras de Linguagem', 'Português', 'Literatura', 'As figuras de linguagem são recursos usados para dar ênfase ou beleza à expressão. Exemplos: metáfora (comparação implícita), hipérbole (exagero), ironia (dizer o contrário do que se pensa).', null),
('Interpretação de Texto', 'Português', 'Interpretação', 'Exige leitura atenta e compreensão de contexto, tema central, ideias secundárias e implícitas. É preciso identificar elementos como intencionalidade, ponto de vista do autor e possíveis inferências.', null),

-- Redação
('Estrutura da Redação do ENEM', 'Redação', 'ENEM', 'A redação deve ter introdução, desenvolvimento e conclusão. O texto deve ser dissertativo-argumentativo, apresentando uma tese clara, argumentos fundamentados e proposta de intervenção viável.', null),
('Competências Avaliadas', 'Redação', 'ENEM', 'As 5 competências do ENEM avaliam: domínio da norma culta, compreensão da proposta, organização das ideias, uso de argumentos consistentes e proposta de intervenção respeitando os direitos humanos.', null),

-- História
('Brasil Colônia', 'História', 'Brasil Colonial', 'O Brasil Colônia (1500-1822) foi marcado pela exploração portuguesa, com destaque para o ciclo do pau-brasil, da cana-de-açúcar e da mineração. O sistema colonial era baseado no pacto colonial e no trabalho escravo.', null),
('Independência do Brasil', 'História', 'Brasil Colonial', 'Em 1822, o Brasil conquistou sua independência, liderada por D. Pedro I. O movimento foi impulsionado por tensões políticas, econômicas e sociais, além da influência das ideias iluministas.', null),

-- Geografia
('Estrutura da Terra', 'Geografia', 'Geografia Física', 'A Terra é formada por crosta, manto e núcleo. A crosta é a camada externa; o manto, intermediária, com magma em movimento; e o núcleo, interno, composto principalmente por ferro e níquel.', null),
('Globalização', 'Geografia', 'Geopolítica', 'A globalização intensificou a integração mundial nos aspectos econômicos, culturais e políticos. É marcada pelo avanço tecnológico, comércio internacional e desigualdades socioeconômicas.', null),

-- Inglês
('Simple Present', 'Inglês', 'Grammar', 'O Simple Present é usado para ações habituais. Estrutura: sujeito + verbo (no infinitivo, com -s/-es na 3ª pessoa). Exemplo: She works every day.', null),
('Past Simple', 'Inglês', 'Grammar', 'Usado para ações concluídas no passado. Verbos regulares recebem -ed, e os irregulares têm formas próprias. Exemplo: I went to school yesterday.', null),

-- Filosofia
('Sócrates', 'Filosofia', 'Filosofia Antiga', 'Sócrates defendia a busca pelo autoconhecimento e a prática do diálogo como forma de alcançar a verdade. Seu lema era: "Só sei que nada sei".', null),
('Platão', 'Filosofia', 'Filosofia Antiga', 'Platão defendia a teoria das ideias, segundo a qual o mundo sensível é uma cópia imperfeita do mundo inteligível.', null),

-- Sociologia
('Karl Marx', 'Sociologia', 'Teoria Sociológica', 'Marx analisou a sociedade capitalista a partir da luta de classes entre burguesia e proletariado. Defendia a revolução social e o fim da exploração do trabalho.', null),
('Max Weber', 'Sociologia', 'Teoria Sociológica', 'Weber estudou a racionalização e a burocracia, além da ética protestante como fator do desenvolvimento do capitalismo.', null),

-- Química
('Ligações Químicas', 'Química', 'Química Geral', 'As ligações químicas podem ser iônicas (transferência de elétrons), covalentes (compartilhamento de elétrons) e metálicas (rede de cátions imersos em elétrons livres).', null),
('Tabela Periódica', 'Química', 'Química Geral', 'Organiza os elementos de acordo com suas propriedades químicas e número atômico. Os grupos reúnem elementos com características semelhantes.', null),

-- Física
('Leis de Newton', 'Física', 'Mecânica', 'As três leis de Newton explicam o movimento dos corpos: inércia, F = m·a, e ação e reação.', null),
('Energia Mecânica', 'Física', 'Mecânica', 'É a soma da energia cinética e da energia potencial. Em sistemas conservativos, a energia mecânica total permanece constante.', null),

-- Biologia
('Célula Procariótica e Eucariótica', 'Biologia', 'Citologia', 'As células procarióticas não possuem núcleo definido (ex.: bactérias), enquanto as eucarióticas possuem núcleo e organelas membranosas (ex.: células animais e vegetais).', null),
('Ecossistemas', 'Biologia', 'Ecologia', 'Um ecossistema é formado por fatores bióticos (seres vivos) e abióticos (luz, solo, clima). A interação entre eles garante o equilíbrio ambiental.', null);