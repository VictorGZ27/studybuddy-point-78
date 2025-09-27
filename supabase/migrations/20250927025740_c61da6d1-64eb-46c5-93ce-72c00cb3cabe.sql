-- Add missing summaries for Artes and Educação Física
INSERT INTO public.resumos (titulo, materia, topico, conteudo, autor_id) VALUES
-- Artes
('História da Arte Moderna', 'Artes', 'História da Arte', 'A arte moderna (séc. XIX-XX) rompeu com os padrões clássicos, valorizando a expressão individual e a experimentação. Movimentos como Impressionismo, Cubismo e Surrealismo revolucionaram a forma de criar e interpretar arte.', null),
('Técnicas Artísticas Fundamentais', 'Artes', 'Técnicas', 'As principais técnicas artísticas incluem desenho, pintura, escultura e gravura. Cada uma utiliza materiais específicos e permite diferentes formas de expressão, desde o realismo até a abstração.', null),

-- Educação Física
('Importância da Atividade Física', 'Educação Física', 'Saúde', 'A atividade física regular traz benefícios cardiovasculares, fortalece músculos e ossos, melhora a coordenação motora e contribui para a saúde mental, reduzindo stress e ansiedade.', null),
('Modalidades Esportivas Coletivas', 'Educação Física', 'Esportes', 'Esportes coletivos como futebol, basquete, vôlei e handebol desenvolvem trabalho em equipe, coordenação, resistência física e habilidades táticas. Cada modalidade tem regras e características específicas.', null);