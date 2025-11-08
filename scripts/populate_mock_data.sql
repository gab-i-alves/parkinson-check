-- ========================================
-- MOCK DATA POPULATION SCRIPT
-- ========================================
-- Este script popula o banco de dados com dados mock para testes
-- Senha para todos os usuários: #Password01
-- ========================================

-- Limpar dados existentes (opcional - comentar se não quiser limpar)
-- TRUNCATE TABLE note, spiral_test, voice_test, test, bind, doctor, patient, "user", address RESTART IDENTITY CASCADE;

-- ========================================
-- INSERÇÃO DE ENDEREÇOS
-- ========================================

INSERT INTO address (cep, street, number, neighborhood, city, state) VALUES
('24220002', 'Rua Miguel de Frias', '405', 'Icaraí', 'Niterói', 'RJ'),
('89215480', 'Rua Argemiro Petry', '996', 'Morro do Meio', 'Joinville', 'SC'),
('71720999', 'Avenida Central Blocos 518/680 Lote 626', '851', 'Núcleo Bandeirante', 'Brasília', 'DF'),
('69313345', 'Rua VIII', '766', 'Cambará', 'Boa Vista', 'RR'),
('58071100', 'Rua Arnaldo Costa', '922', 'Cristo Redentor', 'João Pessoa', 'PB'),
('85506670', 'Rua Sueli Biazus', '879', 'Jardim Floresta', 'Pato Branco', 'PR'),
('94960517', 'Rua Samambaia', '404', 'Jardim do Bosque', 'Cachoeirinha', 'RS'),
('68902864', 'Avenida dos Xavantes', '676', 'Buritizal', 'Macapá', 'AP'),
('79018712', 'Rua Turuparí', '554', 'Loteamento José Prates', 'Campo Grande', 'MS'),
('35900155', 'Rua Álvaro Alvarenga', '569', 'Eldorado', 'Itabira', 'MG'),
('68908042', 'Rua Yasmin dos Santos Brito', '452', 'Infraero', 'Macapá', 'AP'),
('78070340', 'Rua Long Beach', '118', 'Jardim Califórnia', 'Cuiabá', 'MT'),
('88514240', 'Rua Guy Lucena', '738', 'Promorar', 'Lages', 'SC'),
('68552410', 'Rua Trinta e Quatro', '401', 'Ademar Guimarães', 'Redenção', 'PA'),
('58432548', 'Rua Pedro Victor Sampaio', '964', 'Malvinas', 'Campina Grande', 'PB');

-- ========================================
-- INSERÇÃO DE USUÁRIOS PACIENTES (12 pacientes)
-- ========================================
-- Senha hash: $argon2id$v=19$m=65536,t=3,p=4$gWHuKVL6TFqFa7FingrMFQ$hNuyVn7Tyo8DbivrsweK5SxMJTkxMxQCd57kldpqnEA
-- Senha original: #Password01

INSERT INTO "user" (type, name, email, hashed_password, cpf, birthdate, address_id, is_active) VALUES
('PATIENT', 'Bernardo Thiago Miguel Cavalcanti', 'bernardo_cavalcanti@marktechbr.com.br', '$argon2id$v=19$m=65536,t=3,p=4$gWHuKVL6TFqFa7FingrMFQ$hNuyVn7Tyo8DbivrsweK5SxMJTkxMxQCd57kldpqnEA', '89972327388', '1998-07-13 00:00:00', 1, TRUE),
('PATIENT', 'Oliver Victor da Rosa', 'oliver-darosa88@grupoarteoficio.com.br', '$argon2id$v=19$m=65536,t=3,p=4$gWHuKVL6TFqFa7FingrMFQ$hNuyVn7Tyo8DbivrsweK5SxMJTkxMxQCd57kldpqnEA', '62247722407', '1993-10-27 00:00:00', 2, TRUE),
('PATIENT', 'Rita Cecília Mendes', 'rita-mendes96@original-veiculos.com.br', '$argon2id$v=19$m=65536,t=3,p=4$gWHuKVL6TFqFa7FingrMFQ$hNuyVn7Tyo8DbivrsweK5SxMJTkxMxQCd57kldpqnEA', '82817024940', '1947-07-08 00:00:00', 3, TRUE),
('PATIENT', 'Mariana Luzia Liz Freitas', 'mariana_freitas@maccropropaganda.com.br', '$argon2id$v=19$m=65536,t=3,p=4$gWHuKVL6TFqFa7FingrMFQ$hNuyVn7Tyo8DbivrsweK5SxMJTkxMxQCd57kldpqnEA', '72681917581', '1983-01-16 00:00:00', 4, TRUE),
('PATIENT', 'Juliana Lúcia Sabrina da Costa', 'julianaluciadacosta@eletrovip.com', '$argon2id$v=19$m=65536,t=3,p=4$gWHuKVL6TFqFa7FingrMFQ$hNuyVn7Tyo8DbivrsweK5SxMJTkxMxQCd57kldpqnEA', '39946661713', '2000-02-25 00:00:00', 5, TRUE),
('PATIENT', 'Valentina Lorena Alves', 'valentinalorenaalves@yahoo.com.ar', '$argon2id$v=19$m=65536,t=3,p=4$gWHuKVL6TFqFa7FingrMFQ$hNuyVn7Tyo8DbivrsweK5SxMJTkxMxQCd57kldpqnEA', '02337673987', '2000-06-08 00:00:00', 6, TRUE),
('PATIENT', 'Isabella Mariane Aparecida Araújo', 'isabella.mariane.araujo@rafaeladson.com', '$argon2id$v=19$m=65536,t=3,p=4$gWHuKVL6TFqFa7FingrMFQ$hNuyVn7Tyo8DbivrsweK5SxMJTkxMxQCd57kldpqnEA', '48596317902', '1953-01-23 00:00:00', 7, TRUE),
('PATIENT', 'Felipe Carlos Ramos', 'felipe.carlos.ramos@ozsurfing.com.br', '$argon2id$v=19$m=65536,t=3,p=4$gWHuKVL6TFqFa7FingrMFQ$hNuyVn7Tyo8DbivrsweK5SxMJTkxMxQCd57kldpqnEA', '40706852788', '1950-08-27 00:00:00', 8, TRUE),
('PATIENT', 'Luiza Isabelle Emanuelly Aragão', 'luiza-aragao94@securitycontrol.com.br', '$argon2id$v=19$m=65536,t=3,p=4$gWHuKVL6TFqFa7FingrMFQ$hNuyVn7Tyo8DbivrsweK5SxMJTkxMxQCd57kldpqnEA', '32526424097', '1978-04-05 00:00:00', 9, TRUE),
('PATIENT', 'Fabiana Renata Viana', 'fabianarenataviana@profiledesign.com.br', '$argon2id$v=19$m=65536,t=3,p=4$gWHuKVL6TFqFa7FingrMFQ$hNuyVn7Tyo8DbivrsweK5SxMJTkxMxQCd57kldpqnEA', '95261069033', '1989-05-21 00:00:00', 10, TRUE),
('PATIENT', 'Emanuelly Josefa Nunes', 'emanuelly_nunes@vieiradarocha.adv.br', '$argon2id$v=19$m=65536,t=3,p=4$gWHuKVL6TFqFa7FingrMFQ$hNuyVn7Tyo8DbivrsweK5SxMJTkxMxQCd57kldpqnEA', '92891450566', '2007-07-16 00:00:00', 11, TRUE),
('PATIENT', 'Rafael Murilo Thomas Almeida', 'rafael-almeida80@vectrausinagem.com.br', '$argon2id$v=19$m=65536,t=3,p=4$gWHuKVL6TFqFa7FingrMFQ$hNuyVn7Tyo8DbivrsweK5SxMJTkxMxQCd57kldpqnEA', '27164365091', '1982-03-25 00:00:00', 12, TRUE);

-- ========================================
-- INSERÇÃO DE USUÁRIOS MÉDICOS (3 médicos)
-- ========================================

INSERT INTO "user" (type, name, email, hashed_password, cpf, birthdate, address_id, is_active) VALUES
('DOCTOR', 'Dr. Samuel César Julio Castro', 'samuel_cesar_castro@projetti.com', '$argon2id$v=19$m=65536,t=3,p=4$gWHuKVL6TFqFa7FingrMFQ$hNuyVn7Tyo8DbivrsweK5SxMJTkxMxQCd57kldpqnEA', '21950092410', '1992-07-07 00:00:00', 13, TRUE),
('DOCTOR', 'Dra. Fernanda Flávia Melissa Carvalho', 'fernanda_flavia_carvalho@cbsdobrasil.com.br', '$argon2id$v=19$m=65536,t=3,p=4$gWHuKVL6TFqFa7FingrMFQ$hNuyVn7Tyo8DbivrsweK5SxMJTkxMxQCd57kldpqnEA', '51675617600', '1966-10-27 00:00:00', 14, TRUE),
('DOCTOR', 'Dra. Heloisa Giovana Malu Pereira', 'heloisa_pereira@castromobile.com.br', '$argon2id$v=19$m=65536,t=3,p=4$gWHuKVL6TFqFa7FingrMFQ$hNuyVn7Tyo8DbivrsweK5SxMJTkxMxQCd57kldpqnEA', '29852779303', '1974-11-08 00:00:00', 15, TRUE);

-- ========================================
-- INSERÇÃO DE PACIENTES (referencia user)
-- ========================================

INSERT INTO patient (id) VALUES
(1), (2), (3), (4), (5), (6), (7), (8), (9), (10), (11), (12);

-- ========================================
-- INSERÇÃO DE MÉDICOS (referencia user + CRM)
-- ========================================

INSERT INTO doctor (id, crm, expertise_area, status_approval) VALUES
(13, 'SC123456', 'Neurologia', TRUE),
(14, 'PA789012', 'Geriatria', TRUE),
(15, 'PB345678', 'Neurologia', TRUE);

-- ========================================
-- INSERÇÃO DE VÍNCULOS (BINDS)
-- ========================================

-- Vínculos ATIVOS (médicos vinculados a pacientes)
INSERT INTO bind (status, doctor_id, patient_id, created_by_type) VALUES
-- Dr. Samuel com pacientes idosos (Parkinson é mais comum em idosos)
('ACTIVE', 13, 3, 'PATIENT'),  -- Dr. Samuel com Rita (78 anos)
('ACTIVE', 13, 7, 'PATIENT'),  -- Dr. Samuel com Isabella (72 anos)
('ACTIVE', 13, 8, 'DOCTOR'),   -- Dr. Samuel com Felipe (75 anos)

-- Dra. Fernanda com pacientes de meia-idade
('ACTIVE', 14, 4, 'PATIENT'),  -- Dra. Fernanda com Mariana (42 anos)
('ACTIVE', 14, 9, 'PATIENT'),  -- Dra. Fernanda com Luiza (47 anos)
('ACTIVE', 14, 12, 'DOCTOR'),  -- Dra. Fernanda com Rafael (43 anos)

-- Dra. Heloisa com pacientes variados
('ACTIVE', 15, 1, 'PATIENT'),  -- Dra. Heloisa com Bernardo (27 anos)
('ACTIVE', 15, 2, 'PATIENT'),  -- Dra. Heloisa com Oliver (32 anos)
('ACTIVE', 15, 10, 'DOCTOR'),  -- Dra. Heloisa com Fabiana (36 anos)

-- Vínculos PENDENTES (aguardando aprovação)
('PENDING', 13, 5, 'PATIENT'),  -- Juliana aguardando Dr. Samuel
('PENDING', 14, 6, 'PATIENT'),  -- Valentina aguardando Dra. Fernanda
('PENDING', 15, 11, 'DOCTOR'),  -- Dra. Heloisa solicitou vínculo com Emanuelly

-- Vínculos REJEITADOS
('REJECTED', 13, 1, 'PATIENT'),  -- Dr. Samuel rejeitou Bernardo 
('REJECTED', 14, 11, 'PATIENT'); -- Dra. Fernanda rejeitou Emanuelly

-- ========================================
-- INSERÇÃO DE TESTES CLÍNICOS
-- ========================================
-- Distribuindo testes pelos últimos 6 meses com scores variados
-- Scores: 0.3-0.5 (indicativo de Parkinson), 0.6-0.8 (moderado), 0.8-0.95 (saudável)

-- Testes de Rita (78 anos - paciente com sinais de Parkinson)
INSERT INTO test (patient_id, execution_date, status, score, type) VALUES
(3, '2025-05-08 10:30:00', 'NOTED', 0.42, 'SPIRAL_TEST'),
(3, '2025-06-15 14:20:00', 'NOTED', 0.38, 'SPIRAL_TEST'),
(3, '2025-07-20 09:15:00', 'VIEWED', 0.35, 'VOICE_TEST'),
(3, '2025-08-10 11:00:00', 'NOTED', 0.40, 'SPIRAL_TEST'),
(3, '2025-09-25 15:30:00', 'VIEWED', 0.36, 'VOICE_TEST'),
(3, '2025-10-30 10:45:00', 'DONE', 0.34, 'SPIRAL_TEST');

-- Testes de Isabella (72 anos - paciente com Parkinson moderado)
INSERT INTO test (patient_id, execution_date, status, score, type) VALUES
(7, '2025-06-05 13:00:00', 'NOTED', 0.45, 'SPIRAL_TEST'),
(7, '2025-07-12 16:30:00', 'VIEWED', 0.48, 'VOICE_TEST'),
(7, '2025-08-18 10:20:00', 'NOTED', 0.43, 'SPIRAL_TEST'),
(7, '2025-10-05 14:15:00', 'DONE', 0.41, 'VOICE_TEST');

-- Testes de Felipe (75 anos - paciente em estágio inicial)
INSERT INTO test (patient_id, execution_date, status, score, type) VALUES
(8, '2025-06-20 11:30:00', 'NOTED', 0.52, 'SPIRAL_TEST'),
(8, '2025-08-08 09:45:00', 'VIEWED', 0.55, 'VOICE_TEST'),
(8, '2025-10-12 15:00:00', 'DONE', 0.50, 'SPIRAL_TEST');

-- Testes de Mariana (42 anos - suspeita inicial)
INSERT INTO test (patient_id, execution_date, status, score, type) VALUES
(4, '2025-07-05 10:00:00', 'NOTED', 0.68, 'SPIRAL_TEST'),
(4, '2025-09-10 14:30:00', 'VIEWED', 0.65, 'VOICE_TEST'),
(4, '2025-11-01 11:20:00', 'DONE', 0.62, 'SPIRAL_TEST');

-- Testes de Luiza (47 anos - paciente com sintomas leves)
INSERT INTO test (patient_id, execution_date, status, score, type) VALUES
(9, '2025-06-25 13:45:00', 'NOTED', 0.58, 'SPIRAL_TEST'),
(9, '2025-08-30 10:15:00', 'VIEWED', 0.60, 'VOICE_TEST'),
(9, '2025-10-20 16:00:00', 'DONE', 0.56, 'SPIRAL_TEST');

-- Testes de Rafael (43 anos - monitoramento preventivo)
INSERT INTO test (patient_id, execution_date, status, score, type) VALUES
(12, '2025-07-18 09:30:00', 'NOTED', 0.72, 'SPIRAL_TEST'),
(12, '2025-09-22 15:45:00', 'VIEWED', 0.75, 'VOICE_TEST');

-- Testes de Bernardo (27 anos - saudável, controle)
INSERT INTO test (patient_id, execution_date, status, score, type) VALUES
(1, '2025-08-05 11:00:00', 'VIEWED', 0.88, 'SPIRAL_TEST'),
(1, '2025-10-15 14:00:00', 'DONE', 0.90, 'VOICE_TEST');

-- Testes de Oliver (32 anos - saudável)
INSERT INTO test (patient_id, execution_date, status, score, type) VALUES
(2, '2025-07-28 10:30:00', 'VIEWED', 0.85, 'SPIRAL_TEST'),
(2, '2025-10-10 13:15:00', 'DONE', 0.87, 'VOICE_TEST');

-- Testes de Fabiana (36 anos - saudável)
INSERT INTO test (patient_id, execution_date, status, score, type) VALUES
(10, '2025-08-12 15:20:00', 'VIEWED', 0.82, 'SPIRAL_TEST'),
(10, '2025-10-25 09:45:00', 'DONE', 0.84, 'VOICE_TEST');

-- ========================================
-- DETALHES DOS TESTES DE ESPIRAL
-- ========================================

-- IDs dos testes do tipo SPIRAL_TEST: 1, 2, 4, 6, 7, 9, 11, 13, 14, 16, 17, 19, 20, 22, 24, 26
INSERT INTO spiral_test (id, draw_duration, method) VALUES
(1, 45.5, 'WEBCAM'),   -- Rita (0.42)
(2, 52.3, 'PAPER'),    -- Rita (0.38)
(4, 48.7, 'WEBCAM'),   -- Rita (0.40)
(6, 50.2, 'PAPER'),    -- Rita (0.34)
(7, 43.8, 'WEBCAM'),   -- Isabella (0.45)
(9, 46.5, 'PAPER'),    -- Isabella (0.43)
(11, 38.2, 'WEBCAM'),  -- Felipe (0.52)
(13, 40.1, 'PAPER'),   -- Felipe (0.50)
(14, 35.7, 'WEBCAM'),  -- Mariana (0.68)
(16, 32.5, 'WEBCAM'),  -- Mariana (0.62)
(17, 30.8, 'PAPER'),   -- Luiza (0.58)
(19, 28.3, 'WEBCAM'),  -- Luiza (0.56)
(20, 26.5, 'WEBCAM'),  -- Rafael (0.72)
(22, 25.2, 'PAPER'),   -- Bernardo (0.88)
(24, 24.8, 'WEBCAM'),  -- Oliver (0.85)
(26, 23.5, 'PAPER');   -- Fabiana (0.82)

-- ========================================
-- DETALHES DOS TESTES DE VOZ
-- ========================================

-- IDs dos testes do tipo VOICE_TEST: 3, 5, 8, 10, 12, 15, 18, 21, 23, 25, 27
INSERT INTO voice_test (id, record_duration) VALUES
(3, 15.5),   -- Rita (0.35)
(5, 18.2),   -- Rita (0.36)
(8, 16.8),   -- Isabella (0.48)
(10, 17.5),  -- Isabella (0.41)
(12, 12.3),  -- Felipe (0.55)
(15, 14.7),  -- Mariana (0.65)
(18, 13.2),  -- Luiza (0.60)
(21, 11.8),  -- Rafael (0.75)
(23, 10.5),  -- Bernardo (0.90)
(25, 9.8),   -- Oliver (0.87)
(27, 9.2);   -- Fabiana (0.84)

-- ========================================
-- INSERÇÃO DE NOTAS DOS MÉDICOS
-- ========================================

-- Notas do Dr. Samuel (ID 13) sobre Rita (paciente 3)
INSERT INTO note (content, patient_view, category, test_id, doctor_id, parent_note_id) VALUES
('Paciente apresenta tremores característicos de Parkinson em estágio inicial. Score de 0.42 indica necessidade de acompanhamento mais próximo.', TRUE, 'OBSERVATION', 1, 13, NULL),
('Score em declínio progressivo (0.42 → 0.38). Recomendo ajuste na medicação.', FALSE, 'RECOMMENDATION', 2, 13, NULL),
('Tremor na voz bastante perceptível. Considerar encaminhamento para fonoaudiologia.', TRUE, 'RECOMMENDATION', 3, 13, NULL),
('ALERTA: Score continua caindo (0.40). Paciente deve retornar em 15 dias para reavaliação.', TRUE, 'ALERT', 4, 13, NULL);

-- Notas do Dr. Samuel sobre Isabella (paciente 7)
INSERT INTO note (content, patient_view, category, test_id, doctor_id, parent_note_id) VALUES
('Primeira avaliação: sinais moderados de Parkinson. Score 0.45 dentro do esperado para o quadro.', TRUE, 'OBSERVATION', 7, 13, NULL),
('Paciente respondendo bem ao tratamento. Manter protocolo atual.', TRUE, 'OBSERVATION', 9, 13, NULL);

-- Notas da Dra. Fernanda (ID 14) sobre Mariana (paciente 4)
INSERT INTO note (content, patient_view, category, test_id, doctor_id, parent_note_id) VALUES
('Score de 0.68 sugere sintomas muito leves. Recomendo monitoramento semestral.', TRUE, 'OBSERVATION', 13, 14, NULL),
('Leve piora no score (0.68 → 0.65). Agendar consulta para investigação mais detalhada.', FALSE, 'RECOMMENDATION', 14, 14, NULL),
('Score em 0.62. Avaliar necessidade de iniciar medicação preventiva.', TRUE, 'RECOMMENDATION', 15, 14, NULL);

-- Notas da Dra. Fernanda sobre Luiza (paciente 9)
INSERT INTO note (content, patient_view, category, test_id, doctor_id, parent_note_id) VALUES
('Paciente relata tremores ocasionais. Score 0.58 confirma sintomas iniciais de Parkinson.', TRUE, 'OBSERVATION', 17, 14, NULL),
('ALERTA: Paciente faltou à última consulta. Necessário contato urgente para seguimento.', FALSE, 'ALERT', 19, 14, NULL);

-- Notas da Dra. Heloisa (ID 15) sobre Bernardo (paciente 1)
INSERT INTO note (content, patient_view, category, test_id, doctor_id, parent_note_id) VALUES
('Paciente jovem com score excelente (0.88). Sem sinais de Parkinson. Alta do acompanhamento.', TRUE, 'OBSERVATION', 23, 15, NULL);

-- Notas da Dra. Heloisa sobre Oliver (paciente 2)
INSERT INTO note (content, patient_view, category, test_id, doctor_id, parent_note_id) VALUES
('Score saudável (0.85). Paciente está bem, não há indicação de Parkinson nesta faixa etária.', TRUE, 'OBSERVATION', 25, 15, NULL);

-- Notas com thread (respostas)
INSERT INTO note (content, patient_view, category, test_id, doctor_id, parent_note_id) VALUES
('Paciente questionou sobre tremor matinal. Expliquei que pode ser relacionado ao medicamento.', FALSE, 'OBSERVATION', 4, 13, 4);

-- ========================================
-- FIM DO SCRIPT
-- ========================================
