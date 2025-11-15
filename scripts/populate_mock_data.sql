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

INSERT INTO "user" (type, name, email, hashed_password, cpf, birthdate, gender, address_id, is_active) VALUES
('PATIENT', 'Bernardo Thiago Miguel Cavalcanti', 'bernardo_cavalcanti@marktechbr.com.br', '$argon2id$v=19$m=65536,t=3,p=4$gWHuKVL6TFqFa7FingrMFQ$hNuyVn7Tyo8DbivrsweK5SxMJTkxMxQCd57kldpqnEA', '89972327388', '1998-07-13 00:00:00', 'MALE', 1, TRUE),
('PATIENT', 'Oliver Victor da Rosa', 'oliver-darosa88@grupoarteoficio.com.br', '$argon2id$v=19$m=65536,t=3,p=4$gWHuKVL6TFqFa7FingrMFQ$hNuyVn7Tyo8DbivrsweK5SxMJTkxMxQCd57kldpqnEA', '62247722407', '1993-10-27 00:00:00', 'MALE', 2, TRUE),
('PATIENT', 'Rita Cecília Mendes', 'rita-mendes96@original-veiculos.com.br', '$argon2id$v=19$m=65536,t=3,p=4$gWHuKVL6TFqFa7FingrMFQ$hNuyVn7Tyo8DbivrsweK5SxMJTkxMxQCd57kldpqnEA', '82817024940', '1947-07-08 00:00:00', 'FEMALE', 3, TRUE),
('PATIENT', 'Mariana Luzia Liz Freitas', 'mariana_freitas@maccropropaganda.com.br', '$argon2id$v=19$m=65536,t=3,p=4$gWHuKVL6TFqFa7FingrMFQ$hNuyVn7Tyo8DbivrsweK5SxMJTkxMxQCd57kldpqnEA', '72681917581', '1983-01-16 00:00:00', 'FEMALE', 4, TRUE),
('PATIENT', 'Juliana Lúcia Sabrina da Costa', 'julianaluciadacosta@eletrovip.com', '$argon2id$v=19$m=65536,t=3,p=4$gWHuKVL6TFqFa7FingrMFQ$hNuyVn7Tyo8DbivrsweK5SxMJTkxMxQCd57kldpqnEA', '39946661713', '2000-02-25 00:00:00', 'FEMALE', 5, TRUE),
('PATIENT', 'Valentina Lorena Alves', 'valentinalorenaalves@yahoo.com.ar', '$argon2id$v=19$m=65536,t=3,p=4$gWHuKVL6TFqFa7FingrMFQ$hNuyVn7Tyo8DbivrsweK5SxMJTkxMxQCd57kldpqnEA', '02337673987', '2000-06-08 00:00:00', 'FEMALE', 6, TRUE),
('PATIENT', 'Isabella Mariane Aparecida Araújo', 'isabella.mariane.araujo@rafaeladson.com', '$argon2id$v=19$m=65536,t=3,p=4$gWHuKVL6TFqFa7FingrMFQ$hNuyVn7Tyo8DbivrsweK5SxMJTkxMxQCd57kldpqnEA', '48596317902', '1953-01-23 00:00:00', 'FEMALE', 7, TRUE),
('PATIENT', 'Felipe Carlos Ramos', 'felipe.carlos.ramos@ozsurfing.com.br', '$argon2id$v=19$m=65536,t=3,p=4$gWHuKVL6TFqFa7FingrMFQ$hNuyVn7Tyo8DbivrsweK5SxMJTkxMxQCd57kldpqnEA', '40706852788', '1950-08-27 00:00:00', 'MALE', 8, TRUE),
('PATIENT', 'Luiza Isabelle Emanuelly Aragão', 'luiza-aragao94@securitycontrol.com.br', '$argon2id$v=19$m=65536,t=3,p=4$gWHuKVL6TFqFa7FingrMFQ$hNuyVn7Tyo8DbivrsweK5SxMJTkxMxQCd57kldpqnEA', '32526424097', '1978-04-05 00:00:00', 'FEMALE', 9, TRUE),
('PATIENT', 'Fabiana Renata Viana', 'fabianarenataviana@profiledesign.com.br', '$argon2id$v=19$m=65536,t=3,p=4$gWHuKVL6TFqFa7FingrMFQ$hNuyVn7Tyo8DbivrsweK5SxMJTkxMxQCd57kldpqnEA', '95261069033', '1989-05-21 00:00:00', 'FEMALE', 10, TRUE),
('PATIENT', 'Emanuelly Josefa Nunes', 'emanuelly_nunes@vieiradarocha.adv.br', '$argon2id$v=19$m=65536,t=3,p=4$gWHuKVL6TFqFa7FingrMFQ$hNuyVn7Tyo8DbivrsweK5SxMJTkxMxQCd57kldpqnEA', '92891450566', '2007-07-16 00:00:00', 'FEMALE', 11, TRUE),
('PATIENT', 'Rafael Murilo Thomas Almeida', 'rafael-almeida80@vectrausinagem.com.br', '$argon2id$v=19$m=65536,t=3,p=4$gWHuKVL6TFqFa7FingrMFQ$hNuyVn7Tyo8DbivrsweK5SxMJTkxMxQCd57kldpqnEA', '27164365091', '1982-03-25 00:00:00', 'MALE', 12, TRUE);

-- ========================================
-- INSERÇÃO DE USUÁRIOS MÉDICOS (3 médicos)
-- ========================================

INSERT INTO "user" (type, name, email, hashed_password, cpf, birthdate, gender, address_id, is_active) VALUES
('DOCTOR', 'Dr. Samuel César Julio Castro', 'samuel_cesar_castro@projetti.com', '$argon2id$v=19$m=65536,t=3,p=4$gWHuKVL6TFqFa7FingrMFQ$hNuyVn7Tyo8DbivrsweK5SxMJTkxMxQCd57kldpqnEA', '21950092410', '1992-07-07 00:00:00', 'MALE', 13, TRUE),
('DOCTOR', 'Dra. Fernanda Flávia Melissa Carvalho', 'fernanda_flavia_carvalho@cbsdobrasil.com.br', '$argon2id$v=19$m=65536,t=3,p=4$gWHuKVL6TFqFa7FingrMFQ$hNuyVn7Tyo8DbivrsweK5SxMJTkxMxQCd57kldpqnEA', '51675617600', '1966-10-27 00:00:00', 'FEMALE', 14, TRUE),
('DOCTOR', 'Dra. Heloisa Giovana Malu Pereira', 'heloisa_pereira@castromobile.com.br', '$argon2id$v=19$m=65536,t=3,p=4$gWHuKVL6TFqFa7FingrMFQ$hNuyVn7Tyo8DbivrsweK5SxMJTkxMxQCd57kldpqnEA', '29852779303', '1974-11-08 00:00:00', 'FEMALE', 15, TRUE);

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
-- Distribuindo testes pelos últimos 18 meses com scores variados
-- Scores: 0.3-0.5 (indicativo de Parkinson), 0.6-0.8 (moderado), 0.8-0.95 (saudável)

-- Testes de Rita (78 anos - paciente com sinais de Parkinson progressivo)
-- 25 testes ao longo de 18 meses mostrando declínio gradual
INSERT INTO test (patient_id, execution_date, status, score, type) VALUES
(3, '2024-05-10 10:30:00', 'NOTED', 0.52, 'SPIRAL_TEST'),
(3, '2024-05-25 14:20:00', 'NOTED', 0.54, 'VOICE_TEST'),
(3, '2024-06-08 09:15:00', 'NOTED', 0.50, 'SPIRAL_TEST'),
(3, '2024-06-22 11:00:00', 'NOTED', 0.51, 'VOICE_TEST'),
(3, '2024-07-05 15:30:00', 'NOTED', 0.48, 'SPIRAL_TEST'),
(3, '2024-07-20 10:45:00', 'NOTED', 0.49, 'VOICE_TEST'),
(3, '2024-08-03 13:20:00', 'NOTED', 0.46, 'SPIRAL_TEST'),
(3, '2024-08-18 16:10:00', 'NOTED', 0.47, 'VOICE_TEST'),
(3, '2024-09-02 09:30:00', 'NOTED', 0.44, 'SPIRAL_TEST'),
(3, '2024-09-16 14:45:00', 'NOTED', 0.45, 'VOICE_TEST'),
(3, '2024-10-01 11:20:00', 'NOTED', 0.42, 'SPIRAL_TEST'),
(3, '2024-10-15 15:00:00', 'NOTED', 0.43, 'VOICE_TEST'),
(3, '2024-11-05 10:10:00', 'NOTED', 0.40, 'SPIRAL_TEST'),
(3, '2024-11-20 13:30:00', 'NOTED', 0.41, 'VOICE_TEST'),
(3, '2024-12-03 09:45:00', 'NOTED', 0.38, 'SPIRAL_TEST'),
(3, '2024-12-18 14:15:00', 'NOTED', 0.39, 'VOICE_TEST'),
(3, '2025-01-08 10:30:00', 'NOTED', 0.37, 'SPIRAL_TEST'),
(3, '2025-01-22 15:20:00', 'NOTED', 0.38, 'VOICE_TEST'),
(3, '2025-02-05 11:10:00', 'NOTED', 0.36, 'SPIRAL_TEST'),
(3, '2025-02-19 14:40:00', 'NOTED', 0.37, 'VOICE_TEST'),
(3, '2025-03-05 09:25:00', 'NOTED', 0.35, 'SPIRAL_TEST'),
(3, '2025-03-20 13:50:00', 'NOTED', 0.36, 'VOICE_TEST'),
(3, '2025-04-02 10:15:00', 'VIEWED', 0.34, 'SPIRAL_TEST'),
(3, '2025-04-16 15:05:00', 'VIEWED', 0.35, 'VOICE_TEST'),
(3, '2025-05-01 11:30:00', 'DONE', 0.33, 'SPIRAL_TEST');

-- Testes de Isabella (72 anos - paciente com Parkinson moderado estável)
-- 22 testes mostrando estabilidade com tratamento
INSERT INTO test (patient_id, execution_date, status, score, type) VALUES
(7, '2024-05-15 13:00:00', 'NOTED', 0.46, 'SPIRAL_TEST'),
(7, '2024-06-01 16:30:00', 'NOTED', 0.47, 'VOICE_TEST'),
(7, '2024-06-20 10:20:00', 'NOTED', 0.45, 'SPIRAL_TEST'),
(7, '2024-07-08 14:15:00', 'NOTED', 0.46, 'VOICE_TEST'),
(7, '2024-07-25 09:40:00', 'NOTED', 0.44, 'SPIRAL_TEST'),
(7, '2024-08-12 13:25:00', 'NOTED', 0.45, 'VOICE_TEST'),
(7, '2024-08-28 11:10:00', 'NOTED', 0.46, 'SPIRAL_TEST'),
(7, '2024-09-15 15:50:00', 'NOTED', 0.45, 'VOICE_TEST'),
(7, '2024-10-03 10:30:00', 'NOTED', 0.47, 'SPIRAL_TEST'),
(7, '2024-10-20 14:05:00', 'NOTED', 0.46, 'VOICE_TEST'),
(7, '2024-11-08 09:20:00', 'NOTED', 0.45, 'SPIRAL_TEST'),
(7, '2024-11-25 13:45:00', 'NOTED', 0.44, 'VOICE_TEST'),
(7, '2024-12-10 11:15:00', 'NOTED', 0.45, 'SPIRAL_TEST'),
(7, '2024-12-28 15:30:00', 'NOTED', 0.46, 'VOICE_TEST'),
(7, '2025-01-15 10:00:00', 'NOTED', 0.44, 'SPIRAL_TEST'),
(7, '2025-02-02 14:20:00', 'NOTED', 0.45, 'VOICE_TEST'),
(7, '2025-02-20 09:50:00', 'NOTED', 0.43, 'SPIRAL_TEST'),
(7, '2025-03-10 13:10:00', 'NOTED', 0.44, 'VOICE_TEST'),
(7, '2025-03-28 11:40:00', 'NOTED', 0.42, 'SPIRAL_TEST'),
(7, '2025-04-15 15:25:00', 'VIEWED', 0.43, 'VOICE_TEST'),
(7, '2025-05-05 10:35:00', 'VIEWED', 0.41, 'SPIRAL_TEST'),
(7, '2025-05-22 14:55:00', 'DONE', 0.42, 'VOICE_TEST');

-- Testes de Felipe (75 anos - paciente em estágio inicial com flutuações)
-- 20 testes com variações típicas do Parkinson inicial
INSERT INTO test (patient_id, execution_date, status, score, type) VALUES
(8, '2024-06-05 11:30:00', 'NOTED', 0.58, 'SPIRAL_TEST'),
(8, '2024-06-22 09:45:00', 'NOTED', 0.56, 'VOICE_TEST'),
(8, '2024-07-10 15:00:00', 'NOTED', 0.54, 'SPIRAL_TEST'),
(8, '2024-07-28 13:20:00', 'NOTED', 0.55, 'VOICE_TEST'),
(8, '2024-08-15 10:40:00', 'NOTED', 0.53, 'SPIRAL_TEST'),
(8, '2024-09-02 14:10:00', 'NOTED', 0.54, 'VOICE_TEST'),
(8, '2024-09-20 11:25:00', 'NOTED', 0.52, 'SPIRAL_TEST'),
(8, '2024-10-08 15:45:00', 'NOTED', 0.53, 'VOICE_TEST'),
(8, '2024-10-25 09:15:00', 'NOTED', 0.51, 'SPIRAL_TEST'),
(8, '2024-11-12 13:35:00', 'NOTED', 0.52, 'VOICE_TEST'),
(8, '2024-11-30 10:50:00', 'NOTED', 0.50, 'SPIRAL_TEST'),
(8, '2024-12-18 14:20:00', 'NOTED', 0.51, 'VOICE_TEST'),
(8, '2025-01-05 11:10:00', 'NOTED', 0.49, 'SPIRAL_TEST'),
(8, '2025-01-23 15:30:00', 'NOTED', 0.50, 'VOICE_TEST'),
(8, '2025-02-10 09:40:00', 'NOTED', 0.48, 'SPIRAL_TEST'),
(8, '2025-02-28 13:55:00', 'NOTED', 0.49, 'VOICE_TEST'),
(8, '2025-03-18 11:20:00', 'VIEWED', 0.47, 'SPIRAL_TEST'),
(8, '2025-04-05 15:10:00', 'VIEWED', 0.48, 'VOICE_TEST'),
(8, '2025-04-23 10:30:00', 'VIEWED', 0.46, 'SPIRAL_TEST'),
(8, '2025-05-12 14:45:00', 'DONE', 0.47, 'VOICE_TEST');

-- Testes de Mariana (42 anos - suspeita inicial, monitoramento)
-- 18 testes mostrando leve declínio
INSERT INTO test (patient_id, execution_date, status, score, type) VALUES
(4, '2024-06-10 10:00:00', 'NOTED', 0.75, 'SPIRAL_TEST'),
(4, '2024-06-28 14:30:00', 'NOTED', 0.74, 'VOICE_TEST'),
(4, '2024-07-18 11:20:00', 'NOTED', 0.73, 'SPIRAL_TEST'),
(4, '2024-08-05 15:40:00', 'NOTED', 0.72, 'VOICE_TEST'),
(4, '2024-08-25 09:50:00', 'NOTED', 0.71, 'SPIRAL_TEST'),
(4, '2024-09-12 13:15:00', 'NOTED', 0.70, 'VOICE_TEST'),
(4, '2024-10-01 10:30:00', 'NOTED', 0.69, 'SPIRAL_TEST'),
(4, '2024-10-20 14:45:00', 'NOTED', 0.68, 'VOICE_TEST'),
(4, '2024-11-08 11:10:00', 'NOTED', 0.67, 'SPIRAL_TEST'),
(4, '2024-11-28 15:25:00', 'NOTED', 0.66, 'VOICE_TEST'),
(4, '2024-12-16 09:35:00', 'NOTED', 0.65, 'SPIRAL_TEST'),
(4, '2025-01-05 13:50:00', 'NOTED', 0.64, 'VOICE_TEST'),
(4, '2025-01-25 10:20:00', 'NOTED', 0.63, 'SPIRAL_TEST'),
(4, '2025-02-14 14:40:00', 'NOTED', 0.62, 'VOICE_TEST'),
(4, '2025-03-05 11:00:00', 'NOTED', 0.61, 'SPIRAL_TEST'),
(4, '2025-03-25 15:15:00', 'VIEWED', 0.60, 'VOICE_TEST'),
(4, '2025-04-14 09:45:00', 'VIEWED', 0.59, 'SPIRAL_TEST'),
(4, '2025-05-05 13:30:00', 'DONE', 0.58, 'VOICE_TEST');

-- Testes de Luiza (47 anos - paciente com sintomas leves progressivos)
-- 20 testes mostrando progressão lenta
INSERT INTO test (patient_id, execution_date, status, score, type) VALUES
(9, '2024-05-20 13:45:00', 'NOTED', 0.65, 'SPIRAL_TEST'),
(9, '2024-06-05 10:15:00', 'NOTED', 0.64, 'VOICE_TEST'),
(9, '2024-06-25 16:00:00', 'NOTED', 0.63, 'SPIRAL_TEST'),
(9, '2024-07-12 11:30:00', 'NOTED', 0.62, 'VOICE_TEST'),
(9, '2024-07-30 14:50:00', 'NOTED', 0.61, 'SPIRAL_TEST'),
(9, '2024-08-18 09:20:00', 'NOTED', 0.60, 'VOICE_TEST'),
(9, '2024-09-05 13:40:00', 'NOTED', 0.59, 'SPIRAL_TEST'),
(9, '2024-09-25 10:55:00', 'NOTED', 0.58, 'VOICE_TEST'),
(9, '2024-10-13 15:10:00', 'NOTED', 0.57, 'SPIRAL_TEST'),
(9, '2024-11-01 11:25:00', 'NOTED', 0.56, 'VOICE_TEST'),
(9, '2024-11-20 14:35:00', 'NOTED', 0.55, 'SPIRAL_TEST'),
(9, '2024-12-08 09:50:00', 'NOTED', 0.54, 'VOICE_TEST'),
(9, '2024-12-28 13:05:00', 'NOTED', 0.53, 'SPIRAL_TEST'),
(9, '2025-01-16 10:20:00', 'NOTED', 0.52, 'VOICE_TEST'),
(9, '2025-02-05 14:40:00', 'NOTED', 0.51, 'SPIRAL_TEST'),
(9, '2025-02-25 11:55:00', 'NOTED', 0.50, 'VOICE_TEST'),
(9, '2025-03-15 15:10:00', 'VIEWED', 0.49, 'SPIRAL_TEST'),
(9, '2025-04-03 09:25:00', 'VIEWED', 0.48, 'VOICE_TEST'),
(9, '2025-04-22 13:40:00', 'VIEWED', 0.47, 'SPIRAL_TEST'),
(9, '2025-05-12 10:50:00', 'DONE', 0.46, 'VOICE_TEST');

-- Testes de Rafael (43 anos - monitoramento preventivo, estável)
-- 16 testes mostrando valores saudáveis
INSERT INTO test (patient_id, execution_date, status, score, type) VALUES
(12, '2024-06-15 09:30:00', 'NOTED', 0.78, 'SPIRAL_TEST'),
(12, '2024-07-05 15:45:00', 'NOTED', 0.77, 'VOICE_TEST'),
(12, '2024-07-28 11:15:00', 'NOTED', 0.76, 'SPIRAL_TEST'),
(12, '2024-08-20 14:30:00', 'NOTED', 0.75, 'VOICE_TEST'),
(12, '2024-09-12 10:45:00', 'NOTED', 0.74, 'SPIRAL_TEST'),
(12, '2024-10-05 13:20:00', 'NOTED', 0.73, 'VOICE_TEST'),
(12, '2024-10-28 09:50:00', 'NOTED', 0.74, 'SPIRAL_TEST'),
(12, '2024-11-20 15:10:00', 'NOTED', 0.75, 'VOICE_TEST'),
(12, '2024-12-13 11:35:00', 'NOTED', 0.76, 'SPIRAL_TEST'),
(12, '2025-01-08 14:50:00', 'NOTED', 0.77, 'VOICE_TEST'),
(12, '2025-02-01 10:20:00', 'NOTED', 0.78, 'SPIRAL_TEST'),
(12, '2025-02-25 13:40:00', 'NOTED', 0.77, 'VOICE_TEST'),
(12, '2025-03-20 09:55:00', 'VIEWED', 0.76, 'SPIRAL_TEST'),
(12, '2025-04-12 14:15:00', 'VIEWED', 0.75, 'VOICE_TEST'),
(12, '2025-05-05 11:30:00', 'VIEWED', 0.74, 'SPIRAL_TEST'),
(12, '2025-05-28 15:45:00', 'DONE', 0.75, 'VOICE_TEST');

-- Testes de Bernardo (27 anos - saudável, controle)
-- 14 testes mostrando valores excelentes e estáveis
INSERT INTO test (patient_id, execution_date, status, score, type) VALUES
(1, '2024-06-20 11:00:00', 'VIEWED', 0.90, 'SPIRAL_TEST'),
(1, '2024-07-15 14:00:00', 'VIEWED', 0.91, 'VOICE_TEST'),
(1, '2024-08-10 10:30:00', 'VIEWED', 0.89, 'SPIRAL_TEST'),
(1, '2024-09-05 15:15:00', 'VIEWED', 0.90, 'VOICE_TEST'),
(1, '2024-10-01 11:45:00', 'VIEWED', 0.92, 'SPIRAL_TEST'),
(1, '2024-10-28 14:20:00', 'VIEWED', 0.91, 'VOICE_TEST'),
(1, '2024-11-22 10:10:00', 'VIEWED', 0.90, 'SPIRAL_TEST'),
(1, '2024-12-18 13:35:00', 'VIEWED', 0.89, 'VOICE_TEST'),
(1, '2025-01-15 09:50:00', 'VIEWED', 0.91, 'SPIRAL_TEST'),
(1, '2025-02-10 14:25:00', 'VIEWED', 0.90, 'VOICE_TEST'),
(1, '2025-03-08 11:15:00', 'VIEWED', 0.92, 'SPIRAL_TEST'),
(1, '2025-04-03 15:40:00', 'VIEWED', 0.91, 'VOICE_TEST'),
(1, '2025-04-28 10:55:00', 'DONE', 0.90, 'SPIRAL_TEST'),
(1, '2025-05-25 14:10:00', 'DONE', 0.89, 'VOICE_TEST');

-- Testes de Oliver (32 anos - saudável)
-- 15 testes com valores saudáveis
INSERT INTO test (patient_id, execution_date, status, score, type) VALUES
(2, '2024-06-12 10:30:00', 'VIEWED', 0.87, 'SPIRAL_TEST'),
(2, '2024-07-08 13:15:00', 'VIEWED', 0.86, 'VOICE_TEST'),
(2, '2024-08-03 09:45:00', 'VIEWED', 0.88, 'SPIRAL_TEST'),
(2, '2024-08-30 14:30:00', 'VIEWED', 0.87, 'VOICE_TEST'),
(2, '2024-09-25 11:20:00', 'VIEWED', 0.86, 'SPIRAL_TEST'),
(2, '2024-10-20 15:50:00', 'VIEWED', 0.85, 'VOICE_TEST'),
(2, '2024-11-15 10:40:00', 'VIEWED', 0.87, 'SPIRAL_TEST'),
(2, '2024-12-10 13:55:00', 'VIEWED', 0.88, 'VOICE_TEST'),
(2, '2025-01-05 09:25:00', 'VIEWED', 0.86, 'SPIRAL_TEST'),
(2, '2025-02-01 14:10:00', 'VIEWED', 0.87, 'VOICE_TEST'),
(2, '2025-02-28 11:35:00', 'VIEWED', 0.85, 'SPIRAL_TEST'),
(2, '2025-03-25 15:20:00', 'VIEWED', 0.86, 'VOICE_TEST'),
(2, '2025-04-20 10:50:00', 'DONE', 0.88, 'SPIRAL_TEST'),
(2, '2025-05-15 14:05:00', 'DONE', 0.87, 'VOICE_TEST'),
(2, '2025-06-08 11:30:00', 'DONE', 0.86, 'VOICE_TEST');

-- Testes de Fabiana (36 anos - saudável)
-- 16 testes mostrando saúde neurológica
INSERT INTO test (patient_id, execution_date, status, score, type) VALUES
(10, '2024-06-08 15:20:00', 'VIEWED', 0.84, 'SPIRAL_TEST'),
(10, '2024-07-02 09:45:00', 'VIEWED', 0.83, 'VOICE_TEST'),
(10, '2024-07-28 13:30:00', 'VIEWED', 0.85, 'SPIRAL_TEST'),
(10, '2024-08-22 10:15:00', 'VIEWED', 0.84, 'VOICE_TEST'),
(10, '2024-09-18 14:40:00', 'VIEWED', 0.83, 'SPIRAL_TEST'),
(10, '2024-10-15 11:25:00', 'VIEWED', 0.82, 'VOICE_TEST'),
(10, '2024-11-10 15:10:00', 'VIEWED', 0.84, 'SPIRAL_TEST'),
(10, '2024-12-05 09:55:00', 'VIEWED', 0.85, 'VOICE_TEST'),
(10, '2025-01-02 13:20:00', 'VIEWED', 0.83, 'SPIRAL_TEST'),
(10, '2025-01-28 10:45:00', 'VIEWED', 0.84, 'VOICE_TEST'),
(10, '2025-02-22 14:30:00', 'VIEWED', 0.82, 'SPIRAL_TEST'),
(10, '2025-03-18 11:50:00', 'VIEWED', 0.83, 'VOICE_TEST'),
(10, '2025-04-12 15:15:00', 'VIEWED', 0.85, 'SPIRAL_TEST'),
(10, '2025-05-08 10:35:00', 'VIEWED', 0.84, 'VOICE_TEST'),
(10, '2025-06-02 14:00:00', 'DONE', 0.83, 'SPIRAL_TEST'),
(10, '2025-06-28 11:20:00', 'DONE', 0.82, 'VOICE_TEST');

-- Testes de Juliana (25 anos - jovem saudável)
-- 12 testes de acompanhamento preventivo
INSERT INTO test (patient_id, execution_date, status, score, type) VALUES
(5, '2024-07-10 10:00:00', 'VIEWED', 0.92, 'SPIRAL_TEST'),
(5, '2024-08-15 14:30:00', 'VIEWED', 0.93, 'VOICE_TEST'),
(5, '2024-09-20 11:15:00', 'VIEWED', 0.91, 'SPIRAL_TEST'),
(5, '2024-10-25 15:45:00', 'VIEWED', 0.92, 'VOICE_TEST'),
(5, '2024-11-30 10:30:00', 'VIEWED', 0.94, 'SPIRAL_TEST'),
(5, '2025-01-05 14:20:00', 'VIEWED', 0.93, 'VOICE_TEST'),
(5, '2025-02-10 11:50:00', 'VIEWED', 0.92, 'SPIRAL_TEST'),
(5, '2025-03-18 15:10:00', 'VIEWED', 0.91, 'VOICE_TEST'),
(5, '2025-04-22 10:40:00', 'VIEWED', 0.93, 'SPIRAL_TEST'),
(5, '2025-05-28 14:00:00', 'VIEWED', 0.94, 'VOICE_TEST'),
(5, '2025-07-02 11:25:00', 'DONE', 0.92, 'SPIRAL_TEST'),
(5, '2025-08-08 15:35:00', 'DONE', 0.93, 'VOICE_TEST');

-- Testes de Valentina (25 anos - jovem saudável)
-- 13 testes preventivos
INSERT INTO test (patient_id, execution_date, status, score, type) VALUES
(6, '2024-06-25 09:30:00', 'VIEWED', 0.89, 'SPIRAL_TEST'),
(6, '2024-07-30 13:45:00', 'VIEWED', 0.90, 'VOICE_TEST'),
(6, '2024-09-05 10:20:00', 'VIEWED', 0.88, 'SPIRAL_TEST'),
(6, '2024-10-12 14:50:00', 'VIEWED', 0.89, 'VOICE_TEST'),
(6, '2024-11-18 11:10:00', 'VIEWED', 0.91, 'SPIRAL_TEST'),
(6, '2024-12-22 15:30:00', 'VIEWED', 0.90, 'VOICE_TEST'),
(6, '2025-01-28 10:55:00', 'VIEWED', 0.89, 'SPIRAL_TEST'),
(6, '2025-03-05 14:15:00', 'VIEWED', 0.88, 'VOICE_TEST'),
(6, '2025-04-10 11:40:00', 'VIEWED', 0.90, 'SPIRAL_TEST'),
(6, '2025-05-16 15:05:00', 'VIEWED', 0.91, 'VOICE_TEST'),
(6, '2025-06-20 10:25:00', 'DONE', 0.89, 'SPIRAL_TEST'),
(6, '2025-07-25 13:50:00', 'DONE', 0.90, 'VOICE_TEST'),
(6, '2025-08-30 11:15:00', 'DONE', 0.88, 'VOICE_TEST');

-- Testes de Emanuelly (18 anos - muito jovem, acompanhamento por histórico familiar)
-- 10 testes preventivos
INSERT INTO test (patient_id, execution_date, status, score, type) VALUES
(11, '2024-08-05 10:00:00', 'VIEWED', 0.95, 'SPIRAL_TEST'),
(11, '2024-09-15 14:30:00', 'VIEWED', 0.94, 'VOICE_TEST'),
(11, '2024-10-25 11:20:00', 'VIEWED', 0.96, 'SPIRAL_TEST'),
(11, '2024-12-05 15:45:00', 'VIEWED', 0.95, 'VOICE_TEST'),
(11, '2025-01-18 10:15:00', 'VIEWED', 0.94, 'SPIRAL_TEST'),
(11, '2025-03-02 14:40:00', 'VIEWED', 0.95, 'VOICE_TEST'),
(11, '2025-04-15 11:30:00', 'VIEWED', 0.96, 'SPIRAL_TEST'),
(11, '2025-05-28 15:50:00', 'VIEWED', 0.95, 'VOICE_TEST'),
(11, '2025-07-10 10:25:00', 'DONE', 0.94, 'SPIRAL_TEST'),
(11, '2025-08-22 14:10:00', 'DONE', 0.95, 'VOICE_TEST');

-- ========================================
-- DETALHES DOS TESTES DE ESPIRAL
-- ========================================
-- Inserir apenas os testes do tipo SPIRAL_TEST (IDs ímpares na maioria)

INSERT INTO spiral_test (id, draw_duration, method) VALUES
-- Rita - testes 1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25
(1, 55.2, 'WEBCAM'), (3, 58.5, 'PAPER'), (5, 62.3, 'WEBCAM'), (7, 65.8, 'PAPER'),
(9, 68.4, 'WEBCAM'), (11, 70.2, 'PAPER'), (13, 72.5, 'WEBCAM'), (15, 74.8, 'PAPER'),
(17, 76.3, 'WEBCAM'), (19, 78.5, 'PAPER'), (21, 80.2, 'WEBCAM'), (23, 82.4, 'PAPER'),
(25, 83.7, 'WEBCAM'),
-- Isabella - testes 26, 28, 30, 32, 34, 36, 38, 40, 42, 44, 46
(26, 52.8, 'WEBCAM'), (28, 53.5, 'PAPER'), (30, 54.2, 'WEBCAM'), (32, 53.8, 'PAPER'),
(34, 54.5, 'WEBCAM'), (36, 53.2, 'PAPER'), (38, 52.9, 'WEBCAM'), (40, 53.6, 'PAPER'),
(42, 54.8, 'WEBCAM'), (44, 55.2, 'PAPER'), (46, 56.5, 'WEBCAM'),
-- Felipe - testes 48, 50, 52, 54, 56, 58, 60, 62, 64, 66
(48, 48.3, 'WEBCAM'), (50, 49.7, 'PAPER'), (52, 51.2, 'WEBCAM'), (54, 52.4, 'PAPER'),
(56, 53.8, 'WEBCAM'), (58, 54.5, 'PAPER'), (60, 55.9, 'WEBCAM'), (62, 57.2, 'PAPER'),
(64, 58.8, 'WEBCAM'), (66, 60.1, 'PAPER'),
-- Mariana - testes 68, 70, 72, 74, 76, 78, 80, 82, 84
(68, 42.5, 'WEBCAM'), (70, 43.8, 'PAPER'), (72, 45.2, 'WEBCAM'), (74, 46.5, 'PAPER'),
(76, 47.8, 'WEBCAM'), (78, 49.2, 'PAPER'), (80, 50.5, 'WEBCAM'), (82, 51.8, 'PAPER'),
(84, 53.2, 'WEBCAM'),
-- Luiza - testes 86, 88, 90, 92, 94, 96, 98, 100, 102, 104
(86, 45.8, 'WEBCAM'), (88, 47.2, 'PAPER'), (90, 48.5, 'WEBCAM'), (92, 49.8, 'PAPER'),
(94, 51.2, 'WEBCAM'), (96, 52.5, 'PAPER'), (98, 53.8, 'WEBCAM'), (100, 55.2, 'PAPER'),
(102, 56.5, 'WEBCAM'), (104, 57.8, 'PAPER'),
-- Rafael - testes 106, 108, 110, 112, 114, 116, 118, 120
(106, 35.5, 'WEBCAM'), (108, 36.2, 'PAPER'), (110, 36.8, 'WEBCAM'), (112, 37.5, 'PAPER'),
(114, 38.2, 'WEBCAM'), (116, 37.8, 'PAPER'), (118, 37.2, 'WEBCAM'), (120, 36.5, 'PAPER'),
-- Bernardo - testes 122, 124, 126, 128, 130, 132, 134
(122, 28.5, 'WEBCAM'), (124, 27.8, 'PAPER'), (126, 28.2, 'WEBCAM'), (128, 27.5, 'PAPER'),
(130, 28.8, 'WEBCAM'), (132, 27.2, 'PAPER'), (134, 28.0, 'WEBCAM'),
-- Oliver - testes 136, 138, 140, 142, 144, 146, 148
(136, 30.2, 'WEBCAM'), (138, 29.8, 'PAPER'), (140, 30.5, 'WEBCAM'), (142, 29.5, 'PAPER'),
(144, 30.8, 'WEBCAM'), (146, 29.2, 'PAPER'), (148, 30.0, 'WEBCAM'),
-- Fabiana - testes 151, 153, 155, 157, 159, 161, 163, 165
(151, 31.5, 'WEBCAM'), (153, 32.2, 'PAPER'), (155, 31.8, 'WEBCAM'), (157, 32.5, 'PAPER'),
(159, 31.2, 'WEBCAM'), (161, 32.8, 'PAPER'), (163, 31.0, 'WEBCAM'), (165, 32.0, 'PAPER'),
-- Juliana - testes 167, 169, 171, 173, 175, 177
(167, 25.5, 'WEBCAM'), (169, 25.2, 'PAPER'), (171, 25.8, 'WEBCAM'), (173, 25.0, 'PAPER'),
(175, 25.5, 'WEBCAM'), (177, 25.3, 'PAPER'),
-- Valentina - testes 179, 181, 183, 185, 187, 189, 191
(179, 27.8, 'WEBCAM'), (181, 27.5, 'PAPER'), (183, 28.2, 'WEBCAM'), (185, 27.2, 'PAPER'),
(187, 28.0, 'WEBCAM'), (189, 27.0, 'PAPER'), (191, 28.5, 'WEBCAM'),
-- Emanuelly - testes 192, 194, 196, 198, 200
(192, 24.2, 'WEBCAM'), (194, 24.0, 'PAPER'), (196, 24.5, 'WEBCAM'), (198, 23.8, 'PAPER'),
(200, 24.3, 'WEBCAM');

-- ========================================
-- DETALHES DOS TESTES DE VOZ
-- ========================================
-- Inserir apenas os testes do tipo VOICE_TEST (IDs pares na maioria)

INSERT INTO voice_test (id, record_duration) VALUES
-- Rita - testes 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24
(2, 18.5), (4, 19.2), (6, 20.5), (8, 21.8), (10, 22.5), (12, 23.2),
(14, 24.5), (16, 25.8), (18, 26.5), (20, 27.2), (22, 28.5), (24, 29.2),
-- Isabella - testes 27, 29, 31, 33, 35, 37, 39, 41, 43, 45, 47
(27, 17.2), (29, 17.5), (31, 17.8), (33, 18.2), (35, 18.5), (37, 18.8),
(39, 19.2), (41, 19.5), (43, 19.8), (45, 20.2), (47, 20.5),
-- Felipe - testes 49, 51, 53, 55, 57, 59, 61, 63, 65, 67
(49, 15.8), (51, 16.2), (53, 16.5), (55, 16.8), (57, 17.2), (59, 17.5),
(61, 17.8), (63, 18.2), (65, 18.5), (67, 18.8),
-- Mariana - testes 69, 71, 73, 75, 77, 79, 81, 83, 85
(69, 13.5), (71, 13.8), (73, 14.2), (75, 14.5), (77, 14.8), (79, 15.2),
(81, 15.5), (83, 15.8), (85, 16.2),
-- Luiza - testes 87, 89, 91, 93, 95, 97, 99, 101, 103, 105
(87, 14.2), (89, 14.5), (91, 14.8), (93, 15.2), (95, 15.5), (97, 15.8),
(99, 16.2), (101, 16.5), (103, 16.8), (105, 17.2),
-- Rafael - testes 107, 109, 111, 113, 115, 117, 119, 121
(107, 12.5), (109, 12.8), (111, 13.2), (113, 13.5), (115, 13.8), (117, 14.2),
(119, 14.5), (121, 14.8),
-- Bernardo - testes 123, 125, 127, 129, 131, 133, 135
(123, 10.2), (125, 10.5), (127, 10.8), (129, 11.2), (131, 11.5), (133, 11.8),
(135, 12.2),
-- Oliver - testes 137, 139, 141, 143, 145, 147, 149, 150
(137, 10.8), (139, 11.2), (141, 11.5), (143, 11.8), (145, 12.2), (147, 12.5),
(149, 12.8), (150, 13.2),
-- Fabiana - testes 152, 154, 156, 158, 160, 162, 164, 166
(152, 11.5), (154, 11.8), (156, 12.2), (158, 12.5), (160, 12.8), (162, 13.2),
(164, 13.5), (166, 13.8),
-- Juliana - testes 168, 170, 172, 174, 176, 178
(168, 9.5), (170, 9.8), (172, 10.2), (174, 10.5), (176, 10.8), (178, 11.2),
-- Valentina - testes 180, 182, 184, 186, 188, 190
(180, 10.2), (182, 10.5), (184, 10.8), (186, 11.2), (188, 11.5), (190, 11.8),
-- Emanuelly - testes 193, 195, 197, 199, 201
(193, 8.5), (195, 8.8), (197, 9.2), (199, 9.5), (201, 9.8);

-- ========================================
-- INSERÇÃO DE NOTAS DOS MÉDICOS
-- ========================================
-- Expandindo significativamente as notas para testar paginação
-- Total de ~300+ notas distribuídas entre os pacientes e médicos

-- ============================================================
-- NOTAS DO DR. SAMUEL (ID 13) - Especialista em casos avançados
-- ============================================================

-- Notas sobre Rita (paciente 3) - Parkinson progressivo - ~40 notas
INSERT INTO note (content, patient_view, category, test_id, doctor_id, parent_note_id) VALUES
('Primeira avaliação: Score 0.52 indica possíveis sinais iniciais. Necessário acompanhamento regular.', TRUE, 'OBSERVATION', 1, 13, NULL),
('Paciente apresenta tremores característicos ao desenhar a espiral. Score 0.54 mantém-se estável.', TRUE, 'OBSERVATION', 2, 13, NULL),
('Leve declínio observado (0.52 → 0.50). Monitorar evolução nas próximas semanas.', TRUE, 'OBSERVATION', 3, 13, NULL),
('Teste de voz confirma tremor vocal. Score 0.51. Recomendo fonoaudiologia.', TRUE, 'RECOMMENDATION', 4, 13, NULL),
('Score em 0.48 mostra progressão. Iniciando protocolo medicamentoso.', FALSE, 'ALERT', 5, 13, NULL),
('Paciente relata melhora subjetiva, mas score 0.49 ainda indica Parkinson.', TRUE, 'OBSERVATION', 6, 13, NULL),
('Declínio para 0.46 é preocupante. Ajustando dosagem de Levodopa.', FALSE, 'RECOMMENDATION', 7, 13, NULL),
('Teste de voz (0.47) mostra leve melhora após ajuste medicamentoso.', TRUE, 'OBSERVATION', 8, 13, NULL),
('Score 0.44 - progressão continua apesar da medicação. Considerar terapia adjuvante.', FALSE, 'ALERT', 9, 13, NULL),
('Paciente respondeu bem ao exercício fisioterapêutico. Score 0.45 estável.', TRUE, 'OBSERVATION', 10, 13, NULL),
('Score 0.42 indica necessidade de reavaliação neurológica completa.', TRUE, 'ALERT', 11, 13, NULL),
('Teste de voz (0.43) consistente com progressão esperada do quadro.', TRUE, 'OBSERVATION', 12, 13, NULL),
('ALERTA: Score caiu para 0.40. Paciente deve retornar em 7 dias.', TRUE, 'ALERT', 13, 13, NULL),
('Família relata piora na qualidade de vida. Score 0.41 confirma.', FALSE, 'OBSERVATION', 14, 13, NULL),
('Score 0.38 - estágio moderado confirmado. Discussão sobre opções terapêuticas.', FALSE, 'RECOMMENDATION', 15, 13, NULL),
('Paciente iniciou fisioterapia motora. Score 0.39 mostra estabilização temporária.', TRUE, 'OBSERVATION', 16, 13, NULL),
('Score 0.37 - menor valor registrado. Encaminhamento para neurologista especializado.', TRUE, 'ALERT', 17, 13, NULL),
('Consulta realizada com especialista. Score 0.38 mantém tendência de declínio.', TRUE, 'OBSERVATION', 18, 13, NULL),
('Score 0.36 após mudança de medicação. Aguardar estabilização do novo protocolo.', FALSE, 'OBSERVATION', 19, 13, NULL),
('Teste de voz (0.37) mostra leve melhora. Protocolo atual parece adequado.', TRUE, 'OBSERVATION', 20, 13, NULL),
('Score 0.35 estável. Paciente adaptado à nova medicação.', TRUE, 'OBSERVATION', 21, 13, NULL),
('Tremor vocal persistente. Score 0.36. Fonoaudiologia mostrando resultados.', TRUE, 'RECOMMENDATION', 22, 13, NULL),
('Score 0.34 - novo mínimo. Avaliando necessidade de DBS (estimulação cerebral profunda).', FALSE, 'ALERT', 23, 13, NULL),
('Família quer discutir opções cirúrgicas. Score 0.35 indica elegibilidade para DBS.', FALSE, 'RECOMMENDATION', 24, 13, NULL),
('Score 0.33 - paciente foi aprovado para DBS. Aguardando programação cirúrgica.', TRUE, 'ALERT', 25, 13, NULL);

-- Respostas e anotações complementares sobre Rita
INSERT INTO note (content, patient_view, category, test_id, doctor_id, parent_note_id) VALUES
('Paciente questionou sobre efeitos colaterais da Levodopa. Orientações fornecidas sobre náusea e discinesia.', FALSE, 'OBSERVATION', 7, 13, 7),
('Familiar perguntou sobre progressão esperada. Explicado que cada caso é único.', FALSE, 'OBSERVATION', 13, 13, 13),
('Paciente expressa ansiedade sobre DBS. Encaminhada para suporte psicológico.', TRUE, 'RECOMMENDATION', 25, 13, 25),
('Revisão do histórico medicamentoso. Todas as doses estão adequadas para o peso e idade.', FALSE, 'OBSERVATION', 15, 13, 15),
('Paciente relata tremores matinais intensos. Ajustado horário da primeira dose.', TRUE, 'RECOMMENDATION', 11, 13, 11);

-- Notas sobre Isabella (paciente 7) - Parkinson estável - ~30 notas
INSERT INTO note (content, patient_view, category, test_id, doctor_id, parent_note_id) VALUES
('Primeira avaliação: Score 0.46 indica Parkinson moderado. Histórico familiar positivo.', TRUE, 'OBSERVATION', 26, 13, NULL),
('Score 0.47 mostra leve melhora. Paciente respondendo bem à medicação inicial.', TRUE, 'OBSERVATION', 27, 13, NULL),
('Estabilidade no score (0.45). Protocolo atual mantendo controle adequado.', TRUE, 'OBSERVATION', 28, 13, NULL),
('Teste de voz (0.46) consistente com quadro estável de Parkinson.', TRUE, 'OBSERVATION', 29, 13, NULL),
('Score 0.44 - leve flutuação esperada. Sem necessidade de ajuste medicamentoso.', TRUE, 'OBSERVATION', 30, 13, NULL),
('Paciente relatou discinesia leve. Score 0.45. Ajustando dosagem.', TRUE, 'RECOMMENDATION', 31, 13, NULL),
('Score 0.46 após ajuste. Discinesia controlada sem comprometer eficácia.', TRUE, 'OBSERVATION', 32, 13, NULL),
('Excelente adesão ao tratamento. Score 0.45 mostra estabilidade.', TRUE, 'OBSERVATION', 33, 13, NULL),
('Score 0.47 - melhor resultado em 6 meses. Fisioterapia fazendo diferença.', TRUE, 'OBSERVATION', 34, 13, NULL),
('Teste de voz (0.46) estável. Qualidade vocal mantida.', TRUE, 'OBSERVATION', 35, 13, NULL),
('Score 0.45 consistente. Paciente é exemplo de bom controle da doença.', TRUE, 'OBSERVATION', 36, 13, NULL),
('Leve queda para 0.44. Investigar se paciente está pulando doses.', FALSE, 'ALERT', 37, 13, NULL),
('Confirmado que paciente estava esquecendo doses. Orientações reforçadas. Score 0.45.', TRUE, 'OBSERVATION', 38, 13, NULL),
('Score 0.46 após retomada correta da medicação. Sugerido uso de alarmes.', TRUE, 'RECOMMENDATION', 39, 13, NULL),
('Estabilidade mantida (0.45). Controle excelente há 12 meses.', TRUE, 'OBSERVATION', 40, 13, NULL),
('Score 0.44 - dentro da variação normal. Sem alterações necessárias.', TRUE, 'OBSERVATION', 41, 13, NULL),
('Score 0.45 consistente. Renovar receitas e agendar retorno trimestral.', TRUE, 'OBSERVATION', 42, 13, NULL),
('Teste de voz (0.46) estável. Fonoaudiologia preventiva recomendada.', TRUE, 'RECOMMENDATION', 43, 13, NULL),
('Score 0.44 - paciente questionou sobre novos tratamentos. Explicado sobre pesquisas atuais.', TRUE, 'OBSERVATION', 44, 13, NULL),
('Leve declínio para 0.45. Monitorar próximos testes para identificar tendência.', TRUE, 'OBSERVATION', 45, 13, NULL),
('Score 0.41 preocupante após 6 meses estável. Solicitados exames complementares.', TRUE, 'ALERT', 46, 13, NULL),
('Exames descartaram outras causas. Score 0.42 pode indicar progressão natural.', FALSE, 'OBSERVATION', 47, 13, NULL);

-- Respostas sobre Isabella
INSERT INTO note (content, patient_view, category, test_id, doctor_id, parent_note_id) VALUES
('Paciente perguntou sobre atividades físicas permitidas. Incentivada a continuar caminhadas e yoga.', TRUE, 'RECOMMENDATION', 34, 13, 34),
('Familiar questionou sobre hereditariedade. Explicado risco aumentado para filhos.', FALSE, 'OBSERVATION', 26, 13, 26),
('Discutido sobre qualidade de vida e expectativas realistas de controle.', TRUE, 'OBSERVATION', 40, 13, 40);

-- Notas sobre Felipe (paciente 8) - Parkinson inicial - ~25 notas
INSERT INTO note (content, patient_view, category, test_id, doctor_id, parent_note_id) VALUES
('Avaliação inicial: Score 0.58 sugere estágio muito inicial ou forma leve de Parkinson.', TRUE, 'OBSERVATION', 48, 13, NULL),
('Score 0.56 confirma tendência. Iniciando tratamento conservador.', TRUE, 'OBSERVATION', 49, 13, NULL),
('Declínio para 0.54. Monitorar evolução antes de intensificar tratamento.', TRUE, 'OBSERVATION', 50, 13, NULL),
('Teste de voz (0.55) mostra flutuações típicas do estágio inicial.', TRUE, 'OBSERVATION', 51, 13, NULL),
('Score 0.53 - progressão lenta conforme esperado. Medicação mantida.', TRUE, 'OBSERVATION', 52, 13, NULL),
('Paciente adaptou-se bem à medicação. Score 0.54 mostra leve melhora.', TRUE, 'OBSERVATION', 53, 13, NULL),
('Score 0.52 após 6 meses de tratamento. Resposta adequada ao protocolo.', TRUE, 'OBSERVATION', 54, 13, NULL),
('Teste de voz (0.53) estável. Sem necessidade de fonoaudiologia no momento.', TRUE, 'OBSERVATION', 55, 13, NULL),
('Score 0.51 - primeiro teste abaixo de 0.52. Aumento gradual da dose programado.', TRUE, 'RECOMMENDATION', 56, 13, NULL),
('Após ajuste, score 0.52 mostra estabilização. Dose atual apropriada.', TRUE, 'OBSERVATION', 57, 13, NULL),
('Score 0.50 indica progressão esperada. Paciente consciente da evolução natural.', TRUE, 'OBSERVATION', 58, 13, NULL),
('Teste de voz (0.51) consistente. Qualidade de vida mantida.', TRUE, 'OBSERVATION', 59, 13, NULL),
('Score 0.49 - discussão sobre quando iniciar fisioterapia especializada.', FALSE, 'RECOMMENDATION', 60, 13, NULL),
('Paciente iniciou fisioterapia preventiva. Score 0.50 estável.', TRUE, 'OBSERVATION', 61, 13, NULL),
('Score 0.48 após 12 meses de acompanhamento. Progressão dentro do esperado.', TRUE, 'OBSERVATION', 62, 13, NULL),
('Teste de voz (0.49) mostra manutenção da função vocal.', TRUE, 'OBSERVATION', 63, 13, NULL),
('Score 0.47 - novo mínimo. Avaliando necessidade de terapia adjuvante.', TRUE, 'ALERT', 64, 13, NULL),
('Adicionado agonista dopaminérgico ao protocolo. Score 0.48 após 2 semanas.', TRUE, 'OBSERVATION', 65, 13, NULL),
('Score 0.46 mostra que medicação combinada não está sendo suficiente.', FALSE, 'ALERT', 66, 13, NULL),
('Teste de voz (0.47) estável. Concentrar ajustes na medicação motora.', TRUE, 'OBSERVATION', 67, 13, NULL);

-- Respostas sobre Felipe
INSERT INTO note (content, patient_view, category, test_id, doctor_id, parent_note_id) VALUES
('Paciente questionou sobre tempo de progressão esperado. Explicado que varia muito individualmente.', TRUE, 'OBSERVATION', 54, 13, 54),
('Discutido efeitos colaterais possíveis do novo medicamento adicionado.', FALSE, 'RECOMMENDATION', 65, 13, 65);

-- ============================================================
-- NOTAS DA DRA. FERNANDA (ID 14) - Especialista em casos moderados
-- ============================================================

-- Notas sobre Mariana (paciente 4) - Suspeita inicial - ~30 notas
INSERT INTO note (content, patient_view, category, test_id, doctor_id, parent_note_id) VALUES
('Primeira avaliação: Score 0.75 está na faixa limítrofe. Sintomas clínicos sugerem investigação.', TRUE, 'OBSERVATION', 68, 14, NULL),
('Score 0.74 mostra leve declínio. Solicitando RM cerebral para descartar outras causas.', TRUE, 'RECOMMENDATION', 69, 14, NULL),
('RM normal. Score 0.73 sugere Parkinson inicial ou parkinsonismo atípico.', FALSE, 'OBSERVATION', 70, 14, NULL),
('Teste de voz (0.72) corrobora hipótese diagnóstica. Iniciando trial terapêutico.', TRUE, 'OBSERVATION', 71, 14, NULL),
('Score 0.71 após 30 dias de medicação. Resposta terapêutica favorável ao diagnóstico.', TRUE, 'OBSERVATION', 72, 14, NULL),
('Paciente relata melhora dos tremores. Score 0.70 confirma resposta positiva.', TRUE, 'OBSERVATION', 73, 14, NULL),
('Score 0.69 estável há 2 meses. Diagnóstico de Parkinson inicial confirmado.', TRUE, 'OBSERVATION', 74, 14, NULL),
('Teste de voz (0.68) mostra estabilização. Tratamento atual adequado.', TRUE, 'OBSERVATION', 75, 14, NULL),
('Score 0.67 - leve declínio esperado. Ajuste fino da dosagem.', TRUE, 'OBSERVATION', 76, 14, NULL),
('Após ajuste, score 0.66 mantém tendência. Monitoramento continuado.', TRUE, 'OBSERVATION', 77, 14, NULL),
('Score 0.65 aos 9 meses de tratamento. Progressão lenta e controlada.', TRUE, 'OBSERVATION', 78, 14, NULL),
('Teste de voz (0.64) consistente. Qualidade vocal preservada.', TRUE, 'OBSERVATION', 79, 14, NULL),
('Score 0.63 - paciente questionou sobre expectativas de longo prazo.', TRUE, 'OBSERVATION', 80, 14, NULL),
('Discussão ampla sobre prognóstico. Score 0.62 indica bom controle atual.', FALSE, 'OBSERVATION', 81, 14, NULL),
('Score 0.61 após 15 meses de diagnóstico. Evolução favorável com tratamento.', TRUE, 'OBSERVATION', 82, 14, NULL),
('Teste de voz (0.60) mostra declínio gradual. Fonoaudiologia pode ser benéfica.', TRUE, 'RECOMMENDATION', 83, 14, NULL),
('Score 0.59 - encaminhamento para fonoaudiologia realizado.', TRUE, 'OBSERVATION', 84, 14, NULL),
('Paciente iniciou fono. Score 0.58 mostra que tratamento multidisciplinar é essencial.', TRUE, 'RECOMMENDATION', 85, 14, NULL);

-- Respostas sobre Mariana
INSERT INTO note (content, patient_view, category, test_id, doctor_id, parent_note_id) VALUES
('Paciente ansiosa com diagnóstico. Oferecido suporte psicológico e grupos de apoio.', TRUE, 'RECOMMENDATION', 68, 14, 68),
('Familiar perguntou sobre opções de tratamento não-medicamentoso. Explicado sobre fisioterapia e exercícios.', FALSE, 'OBSERVATION', 74, 14, 74),
('Discutido sobre impacto no trabalho. Paciente ainda totalmente funcional.', TRUE, 'OBSERVATION', 80, 14, 80),
('Paciente expressou satisfação com resultados da fonoterapia após 2 meses.', TRUE, 'OBSERVATION', 85, 14, 85);

-- Notas sobre Luiza (paciente 9) - Sintomas leves progressivos - ~35 notas
INSERT INTO note (content, patient_view, category, test_id, doctor_id, parent_note_id) VALUES
('Primeira consulta: Score 0.65 com sintomas clínicos evidentes. Diagnóstico provável de Parkinson.', TRUE, 'OBSERVATION', 86, 14, NULL),
('Score 0.64 confirma tendência de declínio. Iniciando protocolo terapêutico.', TRUE, 'OBSERVATION', 87, 14, NULL),
('Paciente respondendo à medicação. Score 0.63 estável após 1 mês.', TRUE, 'OBSERVATION', 88, 14, NULL),
('Teste de voz (0.62) mostra envolvimento vocal. Recomendado acompanhamento fono.', TRUE, 'RECOMMENDATION', 89, 14, NULL),
('Score 0.61 - declínio gradual esperado. Dose ajustada profilaticamente.', TRUE, 'OBSERVATION', 90, 14, NULL),
('Após ajuste, score 0.60 mostra estabilização temporária.', TRUE, 'OBSERVATION', 91, 14, NULL),
('Score 0.59 indica progressão contínua. Adicionado exercício físico ao plano.', TRUE, 'RECOMMENDATION', 92, 14, NULL),
('Teste de voz (0.58) após início de exercícios. Benefícios ainda não aparentes.', TRUE, 'OBSERVATION', 93, 14, NULL),
('Score 0.57 - paciente relatou melhora na rigidez com exercícios regulares.', TRUE, 'OBSERVATION', 94, 14, NULL),
('Qualidade de vida melhorou apesar de score 0.56. Importância do tratamento holístico.', TRUE, 'OBSERVATION', 95, 14, NULL),
('Score 0.55 aos 6 meses de tratamento integrado. Evolução adequada.', TRUE, 'OBSERVATION', 96, 14, NULL),
('Teste de voz (0.54) mostra declínio vocal. Intensificar fonoterapia.', TRUE, 'RECOMMENDATION', 97, 14, NULL),
('Score 0.53 - família questiona sobre medicações alternativas. Explicado evidências científicas.', FALSE, 'OBSERVATION', 98, 14, NULL),
('Paciente interessada em tai chi. Score 0.52. Atividade aprovada e encorajada.', TRUE, 'RECOMMENDATION', 99, 14, NULL),
('Score 0.51 após 3 meses de tai chi. Possível correlação com estabilização relativa.', TRUE, 'OBSERVATION', 100, 14, NULL),
('Teste de voz (0.50) - limiar importante. Discussão sobre intensificação terapêutica.', TRUE, 'ALERT', 101, 14, NULL),
('Score 0.49 indica entrada em fase moderada. Reavaliação completa do protocolo.', TRUE, 'ALERT', 102, 14, NULL),
('Após reavaliação, ajustado esquema medicamentoso. Score 0.48 aguardando resposta.', FALSE, 'OBSERVATION', 103, 14, NULL),
('Score 0.47 mostra que ajuste não foi suficiente. Considerar segunda linha de tratamento.', TRUE, 'RECOMMENDATION', 104, 14, NULL),
('ALERTA: Paciente faltou à última consulta presencial. Contato telefônico realizado. Score 0.46.', FALSE, 'ALERT', 105, 14, NULL);

-- Respostas sobre Luiza
INSERT INTO note (content, patient_view, category, test_id, doctor_id, parent_note_id) VALUES
('Paciente justificou falta por problema familiar. Reagendado e orientado sobre importância do acompanhamento.', TRUE, 'OBSERVATION', 105, 14, 105),
('Filha da paciente presente na consulta. Discutido papel da família no tratamento.', FALSE, 'OBSERVATION', 98, 14, 98),
('Paciente emocionada com diagnóstico de fase moderada. Suporte emocional e encaminhamento para psicologia.', TRUE, 'RECOMMENDATION', 102, 14, 102),
('Discutido sobre grupos de apoio para pacientes com Parkinson. Paciente interessada.', TRUE, 'RECOMMENDATION', 100, 14, 100);

-- Notas sobre Rafael (paciente 12) - Monitoramento preventivo - ~25 notas
INSERT INTO note (content, patient_view, category, test_id, doctor_id, parent_note_id) VALUES
('Avaliação inicial: Score 0.78 saudável, mas paciente tem histórico familiar forte. Monitoramento preventivo.', TRUE, 'OBSERVATION', 106, 14, NULL),
('Score 0.77 estável. Sem sintomas clínicos. Acompanhamento anual suficiente.', TRUE, 'OBSERVATION', 107, 14, NULL),
('Score 0.76 - leve variação normal. Paciente assintomático.', TRUE, 'OBSERVATION', 108, 14, NULL),
('Teste de voz (0.75) dentro da normalidade. Monitoramento mantido.', TRUE, 'OBSERVATION', 109, 14, NULL),
('Score 0.74 após 6 meses. Questionado sobre sintomas subjetivos - nenhum relatado.', TRUE, 'OBSERVATION', 110, 14, NULL),
('Paciente preocupado com declínio nos scores. Explicado que ainda está em faixa normal.', TRUE, 'OBSERVATION', 111, 14, NULL),
('Score 0.73 - limítrofe superior da normalidade. Exame neurológico normal.', TRUE, 'OBSERVATION', 112, 14, NULL),
('Teste de voz (0.74) mostra leve melhora. Variação dentro do esperado.', TRUE, 'OBSERVATION', 113, 14, NULL),
('Score 0.75 - paciente tranquilizado sobre variações normais nos testes.', TRUE, 'OBSERVATION', 114, 14, NULL),
('Score 0.76 confirma que oscilações são benignas. Sem sinais de Parkinson.', TRUE, 'OBSERVATION', 115, 14, NULL),
('Score 0.77 aos 18 meses de seguimento. Continuar monitoramento anual.', TRUE, 'OBSERVATION', 116, 14, NULL),
('Teste de voz (0.76) estável. Paciente saudável, acompanhamento por precaução.', TRUE, 'OBSERVATION', 117, 14, NULL),
('Score 0.75 - discutido sobre sinais de alerta para retorno antecipado.', TRUE, 'OBSERVATION', 118, 14, NULL),
('Paciente compreende quando deve buscar avaliação fora do cronograma. Score 0.74.', TRUE, 'OBSERVATION', 119, 14, NULL),
('Score 0.76 - resultado tranquilizador. Próximo retorno em 12 meses.', TRUE, 'OBSERVATION', 120, 14, NULL),
('Teste de voz (0.75) normal. Familiar presente questionou sobre prevenção.', TRUE, 'OBSERVATION', 121, 14, NULL);

-- Respostas sobre Rafael
INSERT INTO note (content, patient_view, category, test_id, doctor_id, parent_note_id) VALUES
('Explicado ao familiar que exercícios físicos regulares podem ter efeito neuroprotetor.', TRUE, 'RECOMMENDATION', 121, 14, 121),
('Paciente perguntou sobre suplementação. Orientado que não há evidência robusta de prevenção medicamentosa.', TRUE, 'OBSERVATION', 111, 14, 111);

-- ============================================================
-- NOTAS DA DRA. HELOISA (ID 15) - Acompanhamento geral e casos leves
-- ============================================================

-- Notas sobre Bernardo (paciente 1) - Saudável - ~20 notas
INSERT INTO note (content, patient_view, category, test_id, doctor_id, parent_note_id) VALUES
('Avaliação inicial por queixa de tremor ocasional. Score 0.90 excelente, descarta Parkinson.', TRUE, 'OBSERVATION', 122, 15, NULL),
('Score 0.91 confirma ausência de sinais parkinsonianos. Tremor likely benigno ou ansioso.', TRUE, 'OBSERVATION', 123, 15, NULL),
('Paciente jovem sem fatores de risco. Score 0.89 dentro da normalidade.', TRUE, 'OBSERVATION', 124, 15, NULL),
('Teste de voz (0.90) excelente. Qualidade vocal preservada.', TRUE, 'OBSERVATION', 125, 15, NULL),
('Score 0.92 - melhor resultado até agora. Tremor foi transitório.', TRUE, 'OBSERVATION', 126, 15, NULL),
('Paciente assintomático há 3 meses. Score 0.91 excelente. Alta do acompanhamento neurológico.', TRUE, 'OBSERVATION', 127, 15, NULL),
('Retorno por insistência do paciente. Score 0.90 mantém-se ótimo.', TRUE, 'OBSERVATION', 128, 15, NULL),
('Teste de voz (0.89) normal. Explicado que testes ocasionais são desnecessários.', TRUE, 'OBSERVATION', 129, 15, NULL),
('Score 0.91 - paciente tem ansiedade de saúde. Sugerido acompanhamento psicológico.', TRUE, 'RECOMMENDATION', 130, 15, NULL),
('Após início de terapia, paciente mais tranquilo. Score 0.90 estável.', TRUE, 'OBSERVATION', 131, 15, NULL),
('Score 0.92 excelente. Paciente concordou com alta definitiva.', TRUE, 'OBSERVATION', 132, 15, NULL),
('Teste de voz (0.91) ótimo. Alta do serviço de neurologia.', TRUE, 'OBSERVATION', 133, 15, NULL),
('Última avaliação: Score 0.90. Orientado retornar apenas se sintomas novos.', TRUE, 'OBSERVATION', 134, 15, NULL),
('Teste final de voz (0.89) normal. Alta confirmada.', TRUE, 'OBSERVATION', 135, 15, NULL);

-- Respostas sobre Bernardo
INSERT INTO note (content, patient_view, category, test_id, doctor_id, parent_note_id) VALUES
('Paciente questionou se precisa retornos anuais. Orientado que não há necessidade sem sintomas.', TRUE, 'OBSERVATION', 132, 15, 132),
('Familiar preocupado com hereditariedade. Explicado que risco é baixo na idade do paciente.', FALSE, 'OBSERVATION', 122, 15, 122);

-- Notas sobre Oliver (paciente 2) - Saudável - ~20 notas
INSERT INTO note (content, patient_view, category, test_id, doctor_id, parent_note_id) VALUES
('Encaminhado por clínico geral por histórico familiar. Score 0.87 excelente, sem Parkinson.', TRUE, 'OBSERVATION', 136, 15, NULL),
('Score 0.86 normal para a idade. Exame neurológico sem alterações.', TRUE, 'OBSERVATION', 137, 15, NULL),
('Paciente assintomático. Score 0.88 ótimo resultado.', TRUE, 'OBSERVATION', 138, 15, NULL),
('Teste de voz (0.87) dentro da normalidade esperada.', TRUE, 'OBSERVATION', 139, 15, NULL),
('Score 0.86 estável. Acompanhamento anual por histórico familiar.', TRUE, 'OBSERVATION', 140, 15, NULL),
('Paciente tem pai com Parkinson. Score 0.85 ainda muito bom. Monitoramento preventivo.', TRUE, 'OBSERVATION', 141, 15, NULL),
('Score 0.87 aos 12 meses. Sem sinais de desenvolvimento da doença.', TRUE, 'OBSERVATION', 142, 15, NULL),
('Teste de voz (0.88) excelente. Continuar acompanhamento anual.', TRUE, 'OBSERVATION', 143, 15, NULL),
('Score 0.86 - paciente perguntou sobre prevenção. Orientado sobre exercícios.', TRUE, 'RECOMMENDATION', 144, 15, NULL),
('Paciente iniciou atividade física regular. Score 0.87 mantido.', TRUE, 'OBSERVATION', 145, 15, NULL),
('Score 0.85 - leve oscilação normal. Exame clínico sem alterações.', TRUE, 'OBSERVATION', 146, 15, NULL),
('Teste de voz (0.86) normal. Acompanhamento anual adequado.', TRUE, 'OBSERVATION', 147, 15, NULL),
('Score 0.88 após 24 meses de seguimento. Prognóstico favorável.', TRUE, 'OBSERVATION', 148, 15, NULL),
('Teste de voz (0.87) estável. Próximo retorno em 1 ano.', TRUE, 'OBSERVATION', 149, 15, NULL),
('Score 0.86 - paciente saudável, monitoramento continuado por precaução.', TRUE, 'OBSERVATION', 148, 15, NULL),
('Teste de voz (0.86) final - sem sinais de Parkinson. Manter vigilância.', TRUE, 'OBSERVATION', 150, 15, NULL);

-- Respostas sobre Oliver
INSERT INTO note (content, patient_view, category, test_id, doctor_id, parent_note_id) VALUES
('Discutido risco genético. Explicado que maioria dos casos de Parkinson não é hereditária.', TRUE, 'OBSERVATION', 136, 15, 136),
('Paciente quer fazer teste genético. Orientado sobre limitações dos testes disponíveis.', FALSE, 'OBSERVATION', 141, 15, 141),
('Elogiado paciente por adotar estilo de vida saudável. Exercício é importante fator protetor.', TRUE, 'RECOMMENDATION', 145, 15, 145);

-- Notas sobre Fabiana (paciente 10) - Saudável - ~22 notas
INSERT INTO note (content, patient_view, category, test_id, doctor_id, parent_note_id) VALUES
('Primeira avaliação: Score 0.84 normal. Paciente preocupada com tremor postural.', TRUE, 'OBSERVATION', 151, 15, NULL),
('Tremor é essencial familiar, não Parkinson. Score 0.83 confirma. Tranquilizada.', TRUE, 'OBSERVATION', 152, 15, NULL),
('Score 0.85 excelente. Tremor essencial é benigno e não evolui para Parkinson.', TRUE, 'OBSERVATION', 153, 15, NULL),
('Teste de voz (0.84) normal. Sem comprometimento vocal.', TRUE, 'OBSERVATION', 154, 15, NULL),
('Score 0.83 estável. Discutido tratamento do tremor essencial se incomodar.', TRUE, 'OBSERVATION', 155, 15, NULL),
('Paciente optou por não tratar tremor por enquanto. Score 0.82 mantém-se bom.', TRUE, 'OBSERVATION', 156, 15, NULL),
('Score 0.84 - tremor essencial estável. Acompanhamento semestral.', TRUE, 'OBSERVATION', 157, 15, NULL),
('Teste de voz (0.85) excelente. Qualidade de vida preservada.', TRUE, 'OBSERVATION', 158, 15, NULL),
('Score 0.83 aos 9 meses. Sem progressão do tremor.', TRUE, 'OBSERVATION', 159, 15, NULL),
('Paciente adaptada ao tremor. Score 0.84 normal. Sem necessidade de medicação.', TRUE, 'OBSERVATION', 160, 15, NULL),
('Score 0.82 - leve oscilação. Tremor essencial permanece estável.', TRUE, 'OBSERVATION', 161, 15, NULL),
('Teste de voz (0.83) dentro da normalidade.', TRUE, 'OBSERVATION', 162, 15, NULL),
('Score 0.85 - melhor resultado recente. Paciente bem adaptada.', TRUE, 'OBSERVATION', 163, 15, NULL),
('Teste de voz (0.84) ótimo. Acompanhamento anual suficiente.', TRUE, 'OBSERVATION', 164, 15, NULL),
('Score 0.83 aos 18 meses. Tremor essencial não piorou.', TRUE, 'OBSERVATION', 165, 15, NULL),
('Teste de voz (0.82) normal. Alta do acompanhamento neurológico regular.', TRUE, 'OBSERVATION', 166, 15, NULL);

-- Respostas sobre Fabiana
INSERT INTO note (content, patient_view, category, test_id, doctor_id, parent_note_id) VALUES
('Paciente perguntou se tremor pode piorar com idade. Explicado que pode, mas não é Parkinson.', TRUE, 'OBSERVATION', 155, 15, 155),
('Discutido opções de tratamento futuro caso tremor interfira em atividades.', TRUE, 'RECOMMENDATION', 157, 15, 157),
('Paciente satisfeita com decisão de não medicar. Qualidade de vida excelente.', TRUE, 'OBSERVATION', 160, 15, 160);

-- Notas adicionais sobre pacientes menos acompanhados
-- Juliana (paciente 5), Valentina (6), Emanuelly (11) - Notas esparsas

-- Juliana
INSERT INTO note (content, patient_view, category, test_id, doctor_id, parent_note_id) VALUES
('Avaliação preventiva: Score 0.92 excelente. Sem sinais de Parkinson.', TRUE, 'OBSERVATION', 168, 15, NULL),
('Score 0.93 ótimo. Retorno anual recomendado por histórico familiar.', TRUE, 'OBSERVATION', 169, 15, NULL),
('Score 0.91 normal. Acompanhamento mantido.', TRUE, 'OBSERVATION', 170, 15, NULL),
('Score 0.92 estável. Paciente saudável.', TRUE, 'OBSERVATION', 171, 15, NULL),
('Score 0.94 excelente. Sem necessidade de acompanhamento frequente.', TRUE, 'OBSERVATION', 172, 15, NULL);

-- Valentina
INSERT INTO note (content, patient_view, category, test_id, doctor_id, parent_note_id) VALUES
('Avaliação inicial: Score 0.89 muito bom. Sem alterações neurológicas.', TRUE, 'OBSERVATION', 180, 15, NULL),
('Score 0.90 excelente. Acompanhamento anual por precaução.', TRUE, 'OBSERVATION', 181, 15, NULL),
('Score 0.88 normal. Paciente assintomática.', TRUE, 'OBSERVATION', 182, 15, NULL),
('Score 0.89 estável. Retorno programado.', TRUE, 'OBSERVATION', 183, 15, NULL),
('Score 0.91 ótimo resultado. Continuar monitoramento leve.', TRUE, 'OBSERVATION', 184, 15, NULL);

-- Emanuelly
INSERT INTO note (content, patient_view, category, test_id, doctor_id, parent_note_id) VALUES
('Muito jovem, avaliação por histórico familiar. Score 0.95 excelente.', TRUE, 'OBSERVATION', 193, 15, NULL),
('Score 0.94 perfeito para a idade. Retorno em 2 anos suficiente.', TRUE, 'OBSERVATION', 194, 15, NULL),
('Score 0.96 - melhor possível. Sem risco imediato.', TRUE, 'OBSERVATION', 195, 15, NULL),
('Score 0.95 ótimo. Paciente extremamente saudável.', TRUE, 'OBSERVATION', 196, 15, NULL);

-- ========================================
-- FIM DO SCRIPT
-- ========================================
