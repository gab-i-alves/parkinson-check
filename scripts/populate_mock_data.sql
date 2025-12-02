-- ========================================
-- MOCK DATA POPULATION SCRIPT
-- ========================================
-- Este script popula o banco de dados com dados mock para demonstração do sistema
-- Senha para todos os usuários: #Password01
--
-- PERSONAS E CENÁRIOS:
--
-- PACIENTES:
-- - Rita (78): Parkinson severo progressivo (0.33-0.54) - 25 testes
-- - Isabella (72): Parkinson moderado estável (0.41-0.47) - 22 testes
-- - Felipe (75): Parkinson inicial (0.46-0.58) - 20 testes
-- - Luiza (47): Sintomas leves (0.46-0.65) - 20 testes
-- - Mariana (42): Suspeita, monitoramento (0.58-0.75) - 18 testes
-- - Rafael (43): Preventivo saudável (0.73-0.78) - 16 testes
-- - Fabiana (36): Saudável (0.82-0.85) - 16 testes
-- - Oliver (32): Saudável (0.85-0.88) - 15 testes
-- - Bernardo (27): Saudável (0.89-0.92) - 14 testes
-- - Valentina (25): Saudável (0.88-0.91) - 13 testes
-- - Juliana (25): Saudável (0.91-0.94) - 12 testes
-- - Emanuelly (18): Muito jovem, preventivo (0.94-0.96) - 10 testes
-- - Carlos (55): NOVO - Apenas 2 testes (onboarding)
-- - Ana (68): NOVA - Apenas 1 teste (primeiro teste)
-- - Pedro (31): NOVO - 0 testes (cadastrado mas sem testes)
--
-- MÉDICOS:
-- - Dr. Samuel (33): Neurologista experiente, aprovado
-- - Dra. Fernanda (59): Geriatra, aprovada
-- - Dra. Heloisa (51): Neurologista, aprovada
-- - Dr. Roberto (45): Neurologista, PENDENTE DE APROVAÇÃO
-- - Dra. Patricia (38): Geriatra, PENDENTE DE APROVAÇÃO
-- - Dr. João (52): Cardiologista, REJEITADO (especialidade inadequada)
--
-- ADMINISTRADORES:
-- - Admin Principal: Gestor do sistema
-- - Admin Assistente: Suporte
--
-- PERÍODO DOS DADOS: Maio/2024 - Novembro/2025 (18 meses)
-- ========================================

-- Limpar dados existentes (descomente para limpar antes de popular)
TRUNCATE TABLE note, spiral_test, voice_test, test, bind, doctor, admin, patient, "user", address RESTART IDENTITY CASCADE;

-- ========================================
-- INSERÇÃO DE ENDEREÇOS
-- ========================================

INSERT INTO address (cep, street, number, neighborhood, city, state) VALUES
-- Endereços dos 12 pacientes originais
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
('58432548', 'Rua Pedro Victor Sampaio', '964', 'Malvinas', 'Campina Grande', 'PB'),
-- Endereços dos 3 novos pacientes
('01310100', 'Avenida Paulista', '1578', 'Bela Vista', 'São Paulo', 'SP'),
('30130100', 'Avenida Afonso Pena', '1500', 'Centro', 'Belo Horizonte', 'MG'),
('40020000', 'Rua Chile', '10', 'Centro', 'Salvador', 'BA'),
-- Endereços dos 3 novos médicos
('80010000', 'Rua XV de Novembro', '1299', 'Centro', 'Curitiba', 'PR'),
('50010000', 'Avenida Guararapes', '111', 'Santo Antônio', 'Recife', 'PE'),
('60010000', 'Rua Barão de Aracati', '1500', 'Centro', 'Fortaleza', 'CE'),
-- Endereços dos 2 administradores
('20040020', 'Rua Primeiro de Março', '33', 'Centro', 'Rio de Janeiro', 'RJ'),
('70040000', 'Esplanada dos Ministérios', 'S/N', 'Zona Cívico-Administrativa', 'Brasília', 'DF');

-- ========================================
-- INSERÇÃO DE USUÁRIOS PACIENTES (15 pacientes)
-- ========================================
-- Senha hash: $argon2id$v=19$m=65536,t=3,p=4$gWHuKVL6TFqFa7FingrMFQ$hNuyVn7Tyo8DbivrsweK5SxMJTkxMxQCd57kldpqnEA
-- Senha original: #Password01

INSERT INTO "user" (type, name, email, hashed_password, cpf, birthdate, gender, address_id, is_active) VALUES
-- 12 pacientes originais
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
('PATIENT', 'Rafael Murilo Thomas Almeida', 'rafael-almeida80@vectrausinagem.com.br', '$argon2id$v=19$m=65536,t=3,p=4$gWHuKVL6TFqFa7FingrMFQ$hNuyVn7Tyo8DbivrsweK5SxMJTkxMxQCd57kldpqnEA', '27164365091', '1982-03-25 00:00:00', 'MALE', 12, TRUE),
('PATIENT', 'Carlos Eduardo Souza', 'carlos.souza@example.com', '$argon2id$v=19$m=65536,t=3,p=4$gWHuKVL6TFqFa7FingrMFQ$hNuyVn7Tyo8DbivrsweK5SxMJTkxMxQCd57kldpqnEA', '45678912345', '1970-03-15 00:00:00', 'MALE', 16, TRUE),
('PATIENT', 'Ana Paula Santos', 'ana.santos@example.com', '$argon2id$v=19$m=65536,t=3,p=4$gWHuKVL6TFqFa7FingrMFQ$hNuyVn7Tyo8DbivrsweK5SxMJTkxMxQCd57kldpqnEA', '78945612378', '1957-11-22 00:00:00', 'FEMALE', 17, TRUE),
('PATIENT', 'Pedro Henrique Lima', 'pedro.lima@example.com', '$argon2id$v=19$m=65536,t=3,p=4$gWHuKVL6TFqFa7FingrMFQ$hNuyVn7Tyo8DbivrsweK5SxMJTkxMxQCd57kldpqnEA', '32165498732', '1994-06-10 00:00:00', 'MALE', 18, TRUE);

-- ========================================
-- INSERÇÃO DE USUÁRIOS MÉDICOS (6 médicos)
-- ========================================

INSERT INTO "user" (type, name, email, hashed_password, cpf, birthdate, gender, address_id, is_active) VALUES
-- 3 médicos aprovados
('DOCTOR', 'Samuel César Julio Castro', 'samuel_cesar_castro@projetti.com', '$argon2id$v=19$m=65536,t=3,p=4$gWHuKVL6TFqFa7FingrMFQ$hNuyVn7Tyo8DbivrsweK5SxMJTkxMxQCd57kldpqnEA', '21950092410', '1992-07-07 00:00:00', 'MALE', 16,TRUE),
('DOCTOR', 'Fernanda Flávia Melissa Carvalho', 'fernanda_flavia_carvalho@cbsdobrasil.com.br', '$argon2id$v=19$m=65536,t=3,p=4$gWHuKVL6TFqFa7FingrMFQ$hNuyVn7Tyo8DbivrsweK5SxMJTkxMxQCd57kldpqnEA', '51675617600', '1966-10-27 00:00:00', 'FEMALE', 17,TRUE),
('DOCTOR', 'Heloisa Giovana Malu Pereira', 'heloisa_pereira@castromobile.com.br', '$argon2id$v=19$m=65536,t=3,p=4$gWHuKVL6TFqFa7FingrMFQ$hNuyVn7Tyo8DbivrsweK5SxMJTkxMxQCd57kldpqnEA', '29852779303', '1974-11-08 00:00:00', 'FEMALE', 18,TRUE),
-- 3 médicos para demonstrar fluxo de aprovação
('DOCTOR', 'Roberto Silva Santos', 'roberto.santos@example.com', '$argon2id$v=19$m=65536,t=3,p=4$gWHuKVL6TFqFa7FingrMFQ$hNuyVn7Tyo8DbivrsweK5SxMJTkxMxQCd57kldpqnEA', '12345678910', '1980-05-12 00:00:00', 'MALE', 19, TRUE),
('DOCTOR', 'Patricia Oliveira Costa', 'patricia.costa@example.com', '$argon2id$v=19$m=65536,t=3,p=4$gWHuKVL6TFqFa7FingrMFQ$hNuyVn7Tyo8DbivrsweK5SxMJTkxMxQCd57kldpqnEA', '98765432100', '1987-09-28 00:00:00', 'FEMALE', 20, TRUE),
('DOCTOR', 'João Pedro Almeida', 'joao.almeida@example.com', '$argon2id$v=19$m=65536,t=3,p=4$gWHuKVL6TFqFa7FingrMFQ$hNuyVn7Tyo8DbivrsweK5SxMJTkxMxQCd57kldpqnEA', '11122233344', '1973-02-18 00:00:00', 'MALE', 21, FALSE);

-- ========================================
-- INSERÇÃO DE USUÁRIOS ADMINISTRADORES (2 admins)
-- ========================================

INSERT INTO "user" (type, name, email, hashed_password, cpf, birthdate, gender, address_id, is_active) VALUES
('ADMIN', 'Alexandre Ricardo Brito', 'admin@parkinsoncheck.com.br', '$argon2id$v=19$m=65536,t=3,p=4$gWHuKVL6TFqFa7FingrMFQ$hNuyVn7Tyo8DbivrsweK5SxMJTkxMxQCd57kldpqnEA', '55566677788', '1985-01-10 00:00:00', 'MALE', 22, TRUE),
('ADMIN', 'Carolina Ferreira Lima', 'carolina.admin@parkinsoncheck.com.br', '$argon2id$v=19$m=65536,t=3,p=4$gWHuKVL6TFqFa7FingrMFQ$hNuyVn7Tyo8DbivrsweK5SxMJTkxMxQCd57kldpqnEA', '66677788899', '1990-07-22 00:00:00', 'FEMALE', 23, TRUE);

-- ========================================
-- INSERÇÃO DE PACIENTES (referencia user)
-- ========================================

INSERT INTO patient (id, share_data_for_statistics) VALUES
(1, TRUE),   -- Bernardo: Compartilha dados
(2, TRUE),   -- Oliver: Compartilha dados
(3, TRUE),   -- Rita: Compartilha dados
(4, FALSE),  -- Mariana: NÃO compartilha (privacidade)
(5, TRUE),   -- Juliana: Compartilha dados
(6, TRUE),   -- Valentina: Compartilha dados
(7, TRUE),   -- Isabella: Compartilha dados
(8, TRUE),   -- Felipe: Compartilha dados
(9, TRUE),   -- Luiza: Compartilha dados
(10, FALSE), -- Fabiana: NÃO compartilha (privacidade)
(11, TRUE),  -- Emanuelly: Compartilha dados
(12, TRUE),  -- Rafael: Compartilha dados
(13, TRUE),  -- Carlos: Compartilha dados
(14, TRUE),  -- Ana: Compartilha dados
(15, TRUE);  -- Pedro: Compartilha dados

-- ========================================
-- INSERÇÃO DE MÉDICOS (referencia user + CRM)
-- ========================================

INSERT INTO doctor (id, crm, expertise_area, status) VALUES
-- 3 médicos aprovados
(16, '123456/SC', 'Neurologia', 'APPROVED'),
(17, '789012/PA', 'Geriatria', 'APPROVED'),
(18, '345678/PB', 'Neurologia', 'APPROVED'),
-- 2 médicos pendentes de aprovação
(19, '456789/PR', 'Neurologia', 'PENDING'),
(20, '987654/PE', 'Geriatria', 'PENDING'),
-- 1 médico rejeitado
(21, '112233/CE', 'Cardiologia', 'REJECTED');

-- ========================================
-- INSERÇÃO DE ADMINISTRADORES (referencia user)
-- ========================================

INSERT INTO admin (id, is_superuser) VALUES
(22, TRUE),   -- Alexandre Ricardo Brito - Admin Principal (superusuário)
(23, FALSE);  -- Carolina Ferreira Lima - Admin Assistente

-- ========================================
-- INSERÇÃO DE VÍNCULOS (BINDS)
-- ========================================
-- IMPORTANTE: IDs dos médicos mudaram (16, 17, 18 ao invés de 13, 17,15)
-- Total: 13 ACTIVE | 3 PENDING | 2 REJECTED | 1 REVERSED

INSERT INTO bind (status, doctor_id, patient_id, created_by_type, message) VALUES
-- Vínculos ATIVOS (13 vínculos ativos)
-- Dr. Samuel (16) com pacientes idosos (Parkinson é mais comum em idosos)
('ACTIVE', 16, 3, 'PATIENT', NULL),  -- Dr. Samuel com Rita (78 anos) - Parkinson severo
('ACTIVE', 16, 7, 'PATIENT', NULL),  -- Dr. Samuel com Isabella (72 anos) - Parkinson moderado
('ACTIVE', 16, 8, 'DOCTOR', 'Gostaria de acompanhar o caso do Sr. Felipe. Tenho experiência com Parkinson inicial.'),  -- Dr. Samuel com Felipe (75 anos)
('ACTIVE', 16, 13,'DOCTOR', 'Carlos, notei que você iniciou os testes recentemente. Como neurologista, posso auxiliar no acompanhamento.'),  -- Dr. Samuel com Carlos (55 anos - novo)

-- Dra. Fernanda (17) com pacientes de meia-idade e preventivo
('ACTIVE', 17, 4, 'PATIENT', NULL),  -- Dra. Fernanda com Mariana (42 anos)
('ACTIVE', 17, 9, 'PATIENT', NULL),  -- Dra. Fernanda com Luiza (47 anos)
('ACTIVE', 17, 12, 'DOCTOR', 'Rafael tem histórico familiar importante. Gostaria de fazer o acompanhamento preventivo.'),  -- Dra. Fernanda com Rafael (43 anos)
('ACTIVE', 17, 14,'PATIENT', 'Dra. Fernanda, acabei de fazer meu primeiro teste e gostaria de orientação.'),  -- Dra. Fernanda com Ana (68 anos - nova)

-- Dra. Heloisa (18) com pacientes variados
('ACTIVE', 18, 1, 'PATIENT', NULL),  -- Dra. Heloisa com Bernardo (27 anos)
('ACTIVE', 18, 2, 'PATIENT', NULL),  -- Dra. Heloisa com Oliver (32 anos)
('ACTIVE', 18, 10, 'DOCTOR', 'Fabiana apresenta tremor essencial. Gostaria de acompanhar a evolução.'),  -- Dra. Heloisa com Fabiana (36 anos)
('ACTIVE', 18, 5, 'PATIENT', 'Dra. Heloisa, minha amiga me indicou. Gostaria de iniciar acompanhamento preventivo.'),  -- Dra. Heloisa com Juliana (25 anos)
('ACTIVE', 18, 6, 'PATIENT', NULL),  -- Dra. Heloisa com Valentina (25 anos)

-- Vínculos PENDENTES (3 aguardando aprovação)
('PENDING', 16, 11, 'PATIENT', 'Dr. Samuel, tenho 18 anos e minha família tem histórico de Parkinson. Posso ser sua paciente?'),  -- Emanuelly aguardando Dr. Samuel
('PENDING', 17, 15,'PATIENT', 'Dra. Fernanda, acabei de me cadastrar no sistema. Poderia me acompanhar?'),  -- Pedro (novo) aguardando Dra. Fernanda
('PENDING', 18, 14,'DOCTOR', 'Ana, percebi que você fez apenas um teste. Gostaria de oferecer acompanhamento mais frequente.'),  -- Dra. Heloisa solicitou vínculo com Ana (sobreposição com Dra. Fernanda para demonstrar cenário)

-- Vínculos REJEITADOS (2 rejeitados)
('REJECTED', 16, 1, 'PATIENT', 'Dr. Samuel, estou com alguns tremores ocasionais e gostaria de uma avaliação.'),  -- Dr. Samuel rejeitou Bernardo (já tem Dra. Heloisa)
('REJECTED', 17, 11, 'PATIENT', 'Dra. Fernanda, tenho 18 anos e minha avó tem Parkinson. Poderia me acompanhar?'),  -- Dra. Fernanda rejeitou Emanuelly (muito jovem)

-- Vínculo REVERSED (1 revertido - paciente desfez)
('REVERSED', 18, 12, 'PATIENT', 'Dra. Heloisa, gostaria de continuar apenas com a Dra. Fernanda. Obrigado pelo atendimento!');

-- ========================================
-- INSERÇÃO DE TESTES CLÍNICOS
-- ========================================
-- Distribuindo testes pelos últimos 18 meses com scores variados
-- Scores: 0.3-0.5 (indicativo de Parkinson), 0.6-0.8 (moderado), 0.8-0.95 (saudável)

-- Testes de Rita (78 anos - paciente com sinais de Parkinson progressivo)
-- 25 testes ao longo de 18 meses mostrando declínio gradual
INSERT INTO test (patient_id, doctor_id, execution_date, score, type) VALUES
(3, 16, '2024-05-10 10:30:00', 0.52, 'SPIRAL_TEST'),
(3, 16, '2024-05-25 14:20:00', 0.54, 'VOICE_TEST'),
(3, 16, '2024-06-08 09:15:00', 0.50, 'SPIRAL_TEST'),
(3, 16, '2024-06-22 11:00:00', 0.51, 'VOICE_TEST'),
(3, 16, '2024-07-05 15:30:00', 0.48, 'SPIRAL_TEST'),
(3, 16, '2024-07-20 10:45:00', 0.49, 'VOICE_TEST'),
(3, 16, '2024-08-03 13:20:00', 0.46, 'SPIRAL_TEST'),
(3, 16, '2024-08-18 16:10:00', 0.47, 'VOICE_TEST'),
(3, 16, '2024-09-02 09:30:00', 0.44, 'SPIRAL_TEST'),
(3, 16, '2024-09-16 14:45:00', 0.45, 'VOICE_TEST'),
(3, 16, '2024-10-01 11:20:00', 0.42, 'SPIRAL_TEST'),
(3, 16, '2024-10-15 15:00:00', 0.43, 'VOICE_TEST'),
(3, 16, '2024-11-05 10:10:00', 0.40, 'SPIRAL_TEST'),
(3, 16, '2024-11-20 13:30:00', 0.41, 'VOICE_TEST'),
(3, 16, '2024-12-03 09:45:00', 0.38, 'SPIRAL_TEST'),
(3, 16, '2024-12-18 14:15:00', 0.39, 'VOICE_TEST'),
(3, 16, '2025-01-08 10:30:00', 0.37, 'SPIRAL_TEST'),
(3, 16, '2025-01-22 15:20:00', 0.38, 'VOICE_TEST'),
(3, 16, '2025-02-05 11:10:00', 0.36, 'SPIRAL_TEST'),
(3, 16, '2025-02-19 14:40:00', 0.37, 'VOICE_TEST'),
(3, 16, '2025-03-05 09:25:00', 0.35, 'SPIRAL_TEST'),
(3, 16, '2025-03-20 13:50:00', 0.36, 'VOICE_TEST'),
(3, 16, '2025-04-02 10:15:00', 0.34, 'SPIRAL_TEST'),
(3, 16, '2025-04-16 15:05:00', 0.35, 'VOICE_TEST'),
(3, 16, '2025-05-01 11:30:00', 0.33, 'SPIRAL_TEST');

-- Testes de Isabella (72 anos - paciente com Parkinson moderado estável)
-- 22 testes mostrando estabilidade com tratamento
INSERT INTO test (patient_id, doctor_id, execution_date, score, type) VALUES
(7, 16, '2024-05-15 13:00:00', 0.46, 'SPIRAL_TEST'),
(7, 16, '2024-06-01 16:30:00', 0.47, 'VOICE_TEST'),
(7, 16, '2024-06-20 10:20:00', 0.45, 'SPIRAL_TEST'),
(7, 16, '2024-07-08 14:15:00', 0.46, 'VOICE_TEST'),
(7, 16, '2024-07-25 09:40:00', 0.44, 'SPIRAL_TEST'),
(7, 16, '2024-08-12 13:25:00', 0.45, 'VOICE_TEST'),
(7, 16, '2024-08-28 11:10:00', 0.46, 'SPIRAL_TEST'),
(7, 16, '2024-09-15 15:50:00', 0.45, 'VOICE_TEST'),
(7, 16, '2024-10-03 10:30:00', 0.47, 'SPIRAL_TEST'),
(7, 16, '2024-10-20 14:05:00', 0.46, 'VOICE_TEST'),
(7, 16, '2024-11-08 09:20:00', 0.45, 'SPIRAL_TEST'),
(7, 16, '2024-11-25 13:45:00', 0.44, 'VOICE_TEST'),
(7, 16, '2024-12-10 11:15:00', 0.45, 'SPIRAL_TEST'),
(7, 16, '2024-12-28 15:30:00', 0.46, 'VOICE_TEST'),
(7, 16, '2025-01-15 10:00:00', 0.44, 'SPIRAL_TEST'),
(7, 16, '2025-02-02 14:20:00', 0.45, 'VOICE_TEST'),
(7, 16, '2025-02-20 09:50:00', 0.43, 'SPIRAL_TEST'),
(7, 16, '2025-03-10 13:10:00', 0.44, 'VOICE_TEST'),
(7, 16, '2025-03-28 11:40:00', 0.42, 'SPIRAL_TEST'),
(7, 16, '2025-04-15 15:25:00', 0.43, 'VOICE_TEST'),
(7, 16, '2025-05-05 10:35:00', 0.41, 'SPIRAL_TEST'),
(7, 16, '2025-05-22 14:55:00', 0.42, 'VOICE_TEST');

-- Testes de Felipe (75 anos - paciente em estágio inicial com flutuações)
-- 20 testes com variações típicas do Parkinson inicial
INSERT INTO test (patient_id, doctor_id, execution_date, score, type) VALUES
(8, 16, '2024-06-05 11:30:00', 0.58, 'SPIRAL_TEST'),
(8, 16, '2024-06-22 09:45:00', 0.56, 'VOICE_TEST'),
(8, 16, '2024-07-10 15:00:00', 0.54, 'SPIRAL_TEST'),
(8, 16, '2024-07-28 13:20:00', 0.55, 'VOICE_TEST'),
(8, 16, '2024-08-15 10:40:00', 0.53, 'SPIRAL_TEST'),
(8, 16, '2024-09-02 14:10:00', 0.54, 'VOICE_TEST'),
(8, 16, '2024-09-20 11:25:00', 0.52, 'SPIRAL_TEST'),
(8, 16, '2024-10-08 15:45:00', 0.53, 'VOICE_TEST'),
(8, 16, '2024-10-25 09:15:00', 0.51, 'SPIRAL_TEST'),
(8, 16, '2024-11-12 13:35:00', 0.52, 'VOICE_TEST'),
(8, 16, '2024-11-30 10:50:00', 0.50, 'SPIRAL_TEST'),
(8, 16, '2024-12-18 14:20:00', 0.51, 'VOICE_TEST'),
(8, 16, '2025-01-05 11:10:00', 0.49, 'SPIRAL_TEST'),
(8, 16, '2025-01-23 15:30:00', 0.50, 'VOICE_TEST'),
(8, 16, '2025-02-10 09:40:00', 0.48, 'SPIRAL_TEST'),
(8, 16, '2025-02-28 13:55:00', 0.49, 'VOICE_TEST'),
(8, 16, '2025-03-18 11:20:00', 0.47, 'SPIRAL_TEST'),
(8, 16, '2025-04-05 15:10:00', 0.48, 'VOICE_TEST'),
(8, 16, '2025-04-23 10:30:00', 0.46, 'SPIRAL_TEST'),
(8, 16, '2025-05-12 14:45:00', 0.47, 'VOICE_TEST');

-- Testes de Mariana (42 anos - suspeita inicial, monitoramento)
-- 18 testes mostrando leve declínio
INSERT INTO test (patient_id, doctor_id, execution_date, score, type) VALUES
(4, 17, '2024-06-10 10:00:00', 0.75, 'SPIRAL_TEST'),
(4, 17, '2024-06-28 14:30:00', 0.74, 'VOICE_TEST'),
(4, 17, '2024-07-18 11:20:00', 0.73, 'SPIRAL_TEST'),
(4, 17, '2024-08-05 15:40:00', 0.72, 'VOICE_TEST'),
(4, 17, '2024-08-25 09:50:00', 0.71, 'SPIRAL_TEST'),
(4, 17, '2024-09-12 13:15:00', 0.70, 'VOICE_TEST'),
(4, 17, '2024-10-01 10:30:00', 0.69, 'SPIRAL_TEST'),
(4, 17, '2024-10-20 14:45:00', 0.68, 'VOICE_TEST'),
(4, 17, '2024-11-08 11:10:00', 0.67, 'SPIRAL_TEST'),
(4, 17, '2024-11-28 15:25:00', 0.66, 'VOICE_TEST'),
(4, 17, '2024-12-16 09:35:00', 0.65, 'SPIRAL_TEST'),
(4, 17, '2025-01-05 13:50:00', 0.64, 'VOICE_TEST'),
(4, 17, '2025-01-25 10:20:00', 0.63, 'SPIRAL_TEST'),
(4, 17, '2025-02-14 14:40:00', 0.62, 'VOICE_TEST'),
(4, 17, '2025-03-05 11:00:00', 0.61, 'SPIRAL_TEST'),
(4, 17, '2025-03-25 15:15:00', 0.60, 'VOICE_TEST'),
(4, 17, '2025-04-14 09:45:00', 0.59, 'SPIRAL_TEST'),
(4, 17, '2025-05-05 13:30:00', 0.58, 'VOICE_TEST');

-- Testes de Luiza (47 anos - paciente com sintomas leves progressivos)
-- 20 testes mostrando progressão lenta
INSERT INTO test (patient_id, doctor_id, execution_date, score, type) VALUES
(9, 17, '2024-05-20 13:45:00', 0.65, 'SPIRAL_TEST'),
(9, 17, '2024-06-05 10:15:00', 0.64, 'VOICE_TEST'),
(9, 17, '2024-06-25 16:00:00', 0.63, 'SPIRAL_TEST'),
(9, 17, '2024-07-12 11:30:00', 0.62, 'VOICE_TEST'),
(9, 17, '2024-07-30 14:50:00', 0.61, 'SPIRAL_TEST'),
(9, 17, '2024-08-18 09:20:00', 0.60, 'VOICE_TEST'),
(9, 17, '2024-09-05 13:40:00', 0.59, 'SPIRAL_TEST'),
(9, 17, '2024-09-25 10:55:00', 0.58, 'VOICE_TEST'),
(9, 17, '2024-10-13 15:10:00', 0.57, 'SPIRAL_TEST'),
(9, 17, '2024-11-01 11:25:00', 0.56, 'VOICE_TEST'),
(9, 17, '2024-11-20 14:35:00', 0.55, 'SPIRAL_TEST'),
(9, 17, '2024-12-08 09:50:00', 0.54, 'VOICE_TEST'),
(9, 17, '2024-12-28 13:05:00', 0.53, 'SPIRAL_TEST'),
(9, 17, '2025-01-16 10:20:00', 0.52, 'VOICE_TEST'),
(9, 17, '2025-02-05 14:40:00', 0.51, 'SPIRAL_TEST'),
(9, 17, '2025-02-25 11:55:00', 0.50, 'VOICE_TEST'),
(9, 17, '2025-03-15 15:10:00', 0.49, 'SPIRAL_TEST'),
(9, 17, '2025-04-03 09:25:00', 0.48, 'VOICE_TEST'),
(9, 17, '2025-04-22 13:40:00', 0.47, 'SPIRAL_TEST'),
(9, 17, '2025-05-12 10:50:00', 0.46, 'VOICE_TEST');

-- Testes de Rafael (43 anos - monitoramento preventivo, estável)
-- 16 testes mostrando valores saudáveis
INSERT INTO test (patient_id, doctor_id, execution_date, score, type) VALUES
(12, 17, '2024-06-15 09:30:00', 0.78, 'SPIRAL_TEST'),
(12, 17, '2024-07-05 15:45:00', 0.77, 'VOICE_TEST'),
(12, 17, '2024-07-28 11:15:00', 0.76, 'SPIRAL_TEST'),
(12, 17, '2024-08-20 14:30:00', 0.75, 'VOICE_TEST'),
(12, 17, '2024-09-12 10:45:00', 0.74, 'SPIRAL_TEST'),
(12, 17, '2024-10-05 13:20:00', 0.73, 'VOICE_TEST'),
(12, 17, '2024-10-28 09:50:00', 0.74, 'SPIRAL_TEST'),
(12, 17, '2024-11-20 15:10:00', 0.75, 'VOICE_TEST'),
(12, 17, '2024-12-13 11:35:00', 0.76, 'SPIRAL_TEST'),
(12, 17, '2025-01-08 14:50:00', 0.77, 'VOICE_TEST'),
(12, 17, '2025-02-01 10:20:00', 0.78, 'SPIRAL_TEST'),
(12, 17, '2025-02-25 13:40:00', 0.77, 'VOICE_TEST'),
(12, 17, '2025-03-20 09:55:00', 0.76, 'SPIRAL_TEST'),
(12, 17, '2025-04-12 14:15:00', 0.75, 'VOICE_TEST'),
(12, 17, '2025-05-05 11:30:00', 0.74, 'SPIRAL_TEST'),
(12, 17, '2025-05-28 15:45:00', 0.75, 'VOICE_TEST');

-- Testes de Bernardo (27 anos - saudável, controle)
-- 14 testes mostrando valores excelentes e estáveis
INSERT INTO test (patient_id, doctor_id, execution_date, score, type) VALUES
(1, 18, '2024-06-20 11:00:00', 0.90, 'SPIRAL_TEST'),
(1, 18, '2024-07-15 14:00:00', 0.91, 'VOICE_TEST'),
(1, 18, '2024-08-10 10:30:00', 0.89, 'SPIRAL_TEST'),
(1, 18, '2024-09-05 15:15:00', 0.90, 'VOICE_TEST'),
(1, 18, '2024-10-01 11:45:00', 0.92, 'SPIRAL_TEST'),
(1, 18, '2024-10-28 14:20:00', 0.91, 'VOICE_TEST'),
(1, 18, '2024-11-22 10:10:00', 0.90, 'SPIRAL_TEST'),
(1, 18, '2024-12-18 13:35:00', 0.89, 'VOICE_TEST'),
(1, 18, '2025-01-15 09:50:00', 0.91, 'SPIRAL_TEST'),
(1, 18, '2025-02-10 14:25:00', 0.90, 'VOICE_TEST'),
(1, 18, '2025-03-08 11:15:00', 0.92, 'SPIRAL_TEST'),
(1, 18, '2025-04-03 15:40:00', 0.91, 'VOICE_TEST'),
(1, 18, '2025-04-28 10:55:00', 0.90, 'SPIRAL_TEST'),
(1, 18, '2025-05-25 14:10:00', 0.89, 'VOICE_TEST');

-- Testes de Oliver (32 anos - saudável)
-- 15 testes com valores saudáveis
INSERT INTO test (patient_id, doctor_id, execution_date, score, type) VALUES
(2, 18, '2024-06-12 10:30:00', 0.87, 'SPIRAL_TEST'),
(2, 18, '2024-07-08 13:15:00', 0.86, 'VOICE_TEST'),
(2, 18, '2024-08-03 09:45:00', 0.88, 'SPIRAL_TEST'),
(2, 18, '2024-08-30 14:30:00', 0.87, 'VOICE_TEST'),
(2, 18, '2024-09-25 11:20:00', 0.86, 'SPIRAL_TEST'),
(2, 18, '2024-10-20 15:50:00', 0.85, 'VOICE_TEST'),
(2, 18, '2024-11-15 10:40:00', 0.87, 'SPIRAL_TEST'),
(2, 18, '2024-12-10 13:55:00', 0.88, 'VOICE_TEST'),
(2, 18, '2025-01-05 09:25:00', 0.86, 'SPIRAL_TEST'),
(2, 18, '2025-02-01 14:10:00', 0.87, 'VOICE_TEST'),
(2, 18, '2025-02-28 11:35:00', 0.85, 'SPIRAL_TEST'),
(2, 18, '2025-03-25 15:20:00', 0.86, 'VOICE_TEST'),
(2, 18, '2025-04-20 10:50:00', 0.88, 'SPIRAL_TEST'),
(2, 18, '2025-05-15 14:05:00', 0.87, 'VOICE_TEST'),
(2, 18, '2025-06-08 11:30:00', 0.86, 'VOICE_TEST');

-- Testes de Fabiana (36 anos - saudável)
-- 16 testes mostrando saúde neurológica
INSERT INTO test (patient_id, doctor_id, execution_date, score, type) VALUES
(10, 18, '2024-06-08 15:20:00', 0.84, 'SPIRAL_TEST'),
(10, 18, '2024-07-02 09:45:00', 0.83, 'VOICE_TEST'),
(10, 18, '2024-07-28 13:30:00', 0.85, 'SPIRAL_TEST'),
(10, 18, '2024-08-22 10:15:00', 0.84, 'VOICE_TEST'),
(10, 18, '2024-09-18 14:40:00', 0.83, 'SPIRAL_TEST'),
(10, 18, '2024-10-15 11:25:00', 0.82, 'VOICE_TEST'),
(10, 18, '2024-11-10 15:10:00', 0.84, 'SPIRAL_TEST'),
(10, 18, '2024-12-05 09:55:00', 0.85, 'VOICE_TEST'),
(10, 18, '2025-01-02 13:20:00', 0.83, 'SPIRAL_TEST'),
(10, 18, '2025-01-28 10:45:00', 0.84, 'VOICE_TEST'),
(10, 18, '2025-02-22 14:30:00', 0.82, 'SPIRAL_TEST'),
(10, 18, '2025-03-18 11:50:00', 0.83, 'VOICE_TEST'),
(10, 18, '2025-04-12 15:15:00', 0.85, 'SPIRAL_TEST'),
(10, 18, '2025-05-08 10:35:00', 0.84, 'VOICE_TEST'),
(10, 18, '2025-06-02 14:00:00', 0.83, 'SPIRAL_TEST'),
(10, 18, '2025-06-28 11:20:00', 0.82, 'VOICE_TEST');

-- Testes de Juliana (25 anos - jovem saudável)
-- 12 testes de acompanhamento preventivo
INSERT INTO test (patient_id, doctor_id, execution_date, score, type) VALUES
(5, 18, '2024-07-10 10:00:00', 0.92, 'SPIRAL_TEST'),
(5, 18, '2024-08-15 14:30:00', 0.93, 'VOICE_TEST'),
(5, 18, '2024-09-20 11:15:00', 0.91, 'SPIRAL_TEST'),
(5, 18, '2024-10-25 15:45:00', 0.92, 'VOICE_TEST'),
(5, 18, '2024-11-30 10:30:00', 0.94, 'SPIRAL_TEST'),
(5, 18, '2025-01-05 14:20:00', 0.93, 'VOICE_TEST'),
(5, 18, '2025-02-10 11:50:00', 0.92, 'SPIRAL_TEST'),
(5, 18, '2025-03-18 15:10:00', 0.91, 'VOICE_TEST'),
(5, 18, '2025-04-22 10:40:00', 0.93, 'SPIRAL_TEST'),
(5, 18, '2025-05-28 14:00:00', 0.94, 'VOICE_TEST'),
(5, 18, '2025-07-02 11:25:00', 0.92, 'SPIRAL_TEST'),
(5, 18, '2025-08-08 15:35:00', 0.93, 'VOICE_TEST');

-- Testes de Valentina (25 anos - jovem saudável)
-- 13 testes preventivos
INSERT INTO test (patient_id, doctor_id, execution_date, score, type) VALUES
(6, 18, '2024-06-25 09:30:00', 0.89, 'SPIRAL_TEST'),
(6, 18, '2024-07-30 13:45:00', 0.90, 'VOICE_TEST'),
(6, 18, '2024-09-05 10:20:00', 0.88, 'SPIRAL_TEST'),
(6, 18, '2024-10-12 14:50:00', 0.89, 'VOICE_TEST'),
(6, 18, '2024-11-18 11:10:00', 0.91, 'SPIRAL_TEST'),
(6, 18, '2024-12-22 15:30:00', 0.90, 'VOICE_TEST'),
(6, 18, '2025-01-28 10:55:00', 0.89, 'SPIRAL_TEST'),
(6, 18, '2025-03-05 14:15:00', 0.88, 'VOICE_TEST'),
(6, 18, '2025-04-10 11:40:00', 0.90, 'SPIRAL_TEST'),
(6, 18, '2025-05-16 15:05:00', 0.91, 'VOICE_TEST'),
(6, 18, '2025-06-20 10:25:00', 0.89, 'SPIRAL_TEST'),
(6, 18, '2025-07-25 13:50:00', 0.90, 'VOICE_TEST'),
(6, 18, '2025-08-30 11:15:00', 0.88, 'VOICE_TEST');

-- Testes de Emanuelly (18 anos - muito jovem, acompanhamento por histórico familiar)
-- 10 testes preventivos
INSERT INTO test (patient_id, doctor_id, execution_date, score, type) VALUES
(11, 16, '2024-08-05 10:00:00', 0.95, 'SPIRAL_TEST'),
(11, 16, '2024-09-15 14:30:00', 0.94, 'VOICE_TEST'),
(11, 16, '2024-10-25 11:20:00', 0.96, 'SPIRAL_TEST'),
(11, 16, '2024-12-05 15:45:00', 0.95, 'VOICE_TEST'),
(11, 16, '2025-01-18 10:15:00', 0.94, 'SPIRAL_TEST'),
(11, 16, '2025-03-02 14:40:00', 0.95, 'VOICE_TEST'),
(11, 16, '2025-04-15 11:30:00', 0.96, 'SPIRAL_TEST'),
(11, 16, '2025-05-28 15:50:00', 0.95, 'VOICE_TEST'),
(11, 16, '2025-07-10 10:25:00', 0.94, 'SPIRAL_TEST'),
(11, 16, '2025-08-22 14:10:00', 0.95, 'VOICE_TEST'),

-- Testes de Carlos (55 anos - NOVO paciente com apenas 2 testes para demonstrar onboarding)
-- 2 testes recentes
(13, 16, '2025-10-15 09:30:00', 0.67, 'SPIRAL_TEST'),
(13, 16, '2025-11-05 14:20:00', 0.65, 'VOICE_TEST'),

-- Testes de Ana (68 anos - NOVA paciente com apenas 1 teste para demonstrar primeiro uso)
-- 1 teste único
(14, 17, '2025-11-10 10:45:00', 0.52, 'SPIRAL_TEST');

-- Pedro (31 anos - NOVO paciente SEM TESTES para demonstrar cadastro sem atividade)
-- 0 testes (apenas cadastrado)

-- ========================================
-- DETALHES DOS TESTES DE ESPIRAL
-- ========================================
-- Inserir apenas os testes do tipo SPIRAL_TEST (IDs ímpares na maioria)
-- Os valores de avg_parkinson_probability são calculados como: 1.0 - score (já que score = probabilidade de saudável)

INSERT INTO spiral_test (id, draw_duration, method, avg_parkinson_probability, majority_vote, healthy_votes, parkinson_votes) VALUES
-- Rita - testes 1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25
-- avg_parkinson_probability = 1.0 - score (score de 0.52 = prob parkinson de 0.48)
-- majority_vote baseado na probabilidade: >0.5 = PARKINSON, <=0.5 = HEALTHY
(1, 55.2, 'WEBCAM', 0.48, 'HEALTHY', 6, 5), (3, 58.5, 'PAPER', 0.50, 'HEALTHY', 6, 5),
(5, 62.3, 'WEBCAM', 0.52, 'PARKINSON', 5, 6), (7, 65.8, 'PAPER', 0.54, 'PARKINSON', 5, 6),
(9, 68.4, 'WEBCAM', 0.56, 'PARKINSON', 5, 6), (11, 70.2, 'PAPER', 0.58, 'PARKINSON', 4, 7),
(13, 72.5, 'WEBCAM', 0.60, 'PARKINSON', 4, 7), (15, 74.8, 'PAPER', 0.62, 'PARKINSON', 4, 7),
(17, 76.3, 'WEBCAM', 0.63, 'PARKINSON', 4, 7), (19, 78.5, 'PAPER', 0.64, 'PARKINSON', 4, 7),
(21, 80.2, 'WEBCAM', 0.65, 'PARKINSON', 4, 7), (23, 82.4, 'PAPER', 0.66, 'PARKINSON', 3, 8),
(25, 83.7, 'WEBCAM', 0.67, 'PARKINSON', 3, 8),
-- Isabella - testes 26, 28, 30, 32, 34, 36, 38, 40, 42, 44, 46 (scores 0.46-0.47 = prob parkinson 0.54-0.53)
(26, 52.8, 'WEBCAM', 0.54, 'PARKINSON', 5, 6), (28, 53.5, 'PAPER', 0.53, 'PARKINSON', 5, 6),
(30, 54.2, 'WEBCAM', 0.55, 'PARKINSON', 5, 6), (32, 53.8, 'PAPER', 0.54, 'PARKINSON', 5, 6),
(34, 54.5, 'WEBCAM', 0.56, 'PARKINSON', 5, 6), (36, 53.2, 'PAPER', 0.55, 'PARKINSON', 5, 6),
(38, 52.9, 'WEBCAM', 0.54, 'PARKINSON', 5, 6), (40, 53.6, 'PAPER', 0.54, 'PARKINSON', 5, 6),
(42, 54.8, 'WEBCAM', 0.55, 'PARKINSON', 5, 6), (44, 55.2, 'PAPER', 0.55, 'PARKINSON', 5, 6),
(46, 56.5, 'WEBCAM', 0.59, 'PARKINSON', 4, 7),
-- Felipe - testes 48, 50, 52, 54, 56, 58, 60, 62, 64, 66 (scores variando de 0.46-0.58)
(48, 48.3, 'WEBCAM', 0.54, 'PARKINSON', 5, 6), (50, 49.7, 'PAPER', 0.50, 'HEALTHY', 6, 5),
(52, 51.2, 'WEBCAM', 0.48, 'HEALTHY', 6, 5), (54, 52.4, 'PAPER', 0.46, 'HEALTHY', 6, 5),
(56, 53.8, 'WEBCAM', 0.44, 'HEALTHY', 6, 5), (58, 54.5, 'PAPER', 0.44, 'HEALTHY', 7, 4),
(60, 55.9, 'WEBCAM', 0.43, 'HEALTHY', 7, 4), (62, 57.2, 'PAPER', 0.42, 'HEALTHY', 7, 4),
(64, 58.8, 'WEBCAM', 0.42, 'HEALTHY', 7, 4), (66, 60.1, 'PAPER', 0.41, 'HEALTHY', 7, 4),
-- Mariana - testes 68, 70, 72, 74, 76, 78, 80, 82, 84 (scores 0.58-0.75 = saudável)
(68, 42.5, 'WEBCAM', 0.42, 'HEALTHY', 7, 4), (70, 43.8, 'PAPER', 0.39, 'HEALTHY', 7, 4),
(72, 45.2, 'WEBCAM', 0.36, 'HEALTHY', 8, 3), (74, 46.5, 'PAPER', 0.35, 'HEALTHY', 8, 3),
(76, 47.8, 'WEBCAM', 0.33, 'HEALTHY', 8, 3), (78, 49.2, 'PAPER', 0.31, 'HEALTHY', 8, 3),
(80, 50.5, 'WEBCAM', 0.29, 'HEALTHY', 9, 2), (82, 51.8, 'PAPER', 0.27, 'HEALTHY', 9, 2),
(84, 53.2, 'WEBCAM', 0.25, 'HEALTHY', 9, 2),
-- Luiza - testes 86, 88, 90, 92, 94, 96, 98, 100, 102, 104 (scores 0.46-0.65)
(86, 45.8, 'WEBCAM', 0.54, 'PARKINSON', 5, 6), (88, 47.2, 'PAPER', 0.50, 'HEALTHY', 6, 5),
(90, 48.5, 'WEBCAM', 0.45, 'HEALTHY', 6, 5), (92, 49.8, 'PAPER', 0.42, 'HEALTHY', 7, 4),
(94, 51.2, 'WEBCAM', 0.39, 'HEALTHY', 7, 4), (96, 52.5, 'PAPER', 0.37, 'HEALTHY', 8, 3),
(98, 53.8, 'WEBCAM', 0.36, 'HEALTHY', 8, 3), (100, 55.2, 'PAPER', 0.35, 'HEALTHY', 8, 3),
(102, 56.5, 'WEBCAM', 0.35, 'HEALTHY', 8, 3), (104, 57.8, 'PAPER', 0.35, 'HEALTHY', 8, 3),
-- Rafael - testes 106, 108, 110, 112, 114, 116, 118, 120 (scores 0.73-0.78 = saudável)
(106, 35.5, 'WEBCAM', 0.27, 'HEALTHY', 9, 2), (108, 36.2, 'PAPER', 0.26, 'HEALTHY', 9, 2),
(110, 36.8, 'WEBCAM', 0.25, 'HEALTHY', 9, 2), (112, 37.5, 'PAPER', 0.24, 'HEALTHY', 9, 2),
(114, 38.2, 'WEBCAM', 0.23, 'HEALTHY', 10, 1), (116, 37.8, 'PAPER', 0.23, 'HEALTHY', 10, 1),
(118, 37.2, 'WEBCAM', 0.24, 'HEALTHY', 9, 2), (120, 36.5, 'PAPER', 0.25, 'HEALTHY', 9, 2),
-- Bernardo - testes 122, 124, 126, 128, 130, 132, 134 (scores 0.89-0.92 = muito saudável)
(122, 28.5, 'WEBCAM', 0.11, 'HEALTHY', 11, 0), (124, 27.8, 'PAPER', 0.09, 'HEALTHY', 11, 0),
(126, 28.2, 'WEBCAM', 0.10, 'HEALTHY', 11, 0), (128, 27.5, 'PAPER', 0.09, 'HEALTHY', 11, 0),
(130, 28.8, 'WEBCAM', 0.10, 'HEALTHY', 11, 0), (132, 27.2, 'PAPER', 0.11, 'HEALTHY', 11, 0),
(134, 28.0, 'WEBCAM', 0.08, 'HEALTHY', 11, 0),
-- Oliver - testes 136, 138, 140, 142, 144, 146, 148 (scores 0.85-0.88)
(136, 30.2, 'WEBCAM', 0.15, 'HEALTHY', 10, 1), (138, 29.8, 'PAPER', 0.14, 'HEALTHY', 10, 1),
(140, 30.5, 'WEBCAM', 0.13, 'HEALTHY', 10, 1), (142, 29.5, 'PAPER', 0.14, 'HEALTHY', 10, 1),
(144, 30.8, 'WEBCAM', 0.13, 'HEALTHY', 10, 1), (146, 29.2, 'PAPER', 0.15, 'HEALTHY', 10, 1),
(148, 30.0, 'WEBCAM', 0.14, 'HEALTHY', 10, 1),
-- Fabiana - testes 151, 153, 155, 157, 159, 161, 163, 165 (scores 0.82-0.85)
(151, 31.5, 'WEBCAM', 0.18, 'HEALTHY', 10, 1), (153, 32.2, 'PAPER', 0.17, 'HEALTHY', 10, 1),
(155, 31.8, 'WEBCAM', 0.17, 'HEALTHY', 10, 1), (157, 32.5, 'PAPER', 0.16, 'HEALTHY', 10, 1),
(159, 31.2, 'WEBCAM', 0.18, 'HEALTHY', 10, 1), (161, 32.8, 'PAPER', 0.16, 'HEALTHY', 10, 1),
(163, 31.0, 'WEBCAM', 0.17, 'HEALTHY', 10, 1), (165, 32.0, 'PAPER', 0.15, 'HEALTHY', 10, 1),
-- Juliana - testes 167, 169, 171, 173, 175, 177 (scores 0.91-0.94)
(167, 25.5, 'WEBCAM', 0.09, 'HEALTHY', 11, 0), (169, 25.2, 'PAPER', 0.08, 'HEALTHY', 11, 0),
(171, 25.8, 'WEBCAM', 0.07, 'HEALTHY', 11, 0), (173, 25.0, 'PAPER', 0.06, 'HEALTHY', 11, 0),
(175, 25.5, 'WEBCAM', 0.07, 'HEALTHY', 11, 0), (177, 25.3, 'PAPER', 0.09, 'HEALTHY', 11, 0),
-- Valentina - testes 179, 181, 183, 185, 187, 189, 191 (scores 0.88-0.91)
(179, 27.8, 'WEBCAM', 0.12, 'HEALTHY', 11, 0), (181, 27.5, 'PAPER', 0.11, 'HEALTHY', 11, 0),
(183, 28.2, 'WEBCAM', 0.10, 'HEALTHY', 11, 0), (185, 27.2, 'PAPER', 0.11, 'HEALTHY', 11, 0),
(187, 28.0, 'WEBCAM', 0.12, 'HEALTHY', 11, 0), (189, 27.0, 'PAPER', 0.11, 'HEALTHY', 11, 0),
(191, 28.5, 'WEBCAM', 0.09, 'HEALTHY', 11, 0),
-- Emanuelly - testes 192, 194, 196, 198, 200 (scores 0.94-0.96)
(192, 24.2, 'WEBCAM', 0.06, 'HEALTHY', 11, 0), (194, 24.0, 'PAPER', 0.05, 'HEALTHY', 11, 0),
(196, 24.5, 'WEBCAM', 0.04, 'HEALTHY', 11, 0), (198, 23.8, 'PAPER', 0.05, 'HEALTHY', 11, 0),
(200, 24.3, 'WEBCAM', 0.05, 'HEALTHY', 11, 0),
-- Carlos - teste 202 (apenas 1 spiral test - score 0.70)
(202, 45.5, 'PAPER', 0.30, 'HEALTHY', 8, 3),
-- Ana - teste 204 (apenas 1 spiral test - primeiro teste - score 0.62)
(204, 52.3, 'WEBCAM', 0.38, 'HEALTHY', 7, 4);

-- ========================================
-- DETALHES DOS TESTES DE VOZ
-- ========================================
-- Inserir apenas os testes do tipo VOICE_TEST (IDs pares na maioria)
-- raw_parkinson_probability = 1.0 - score (já que score = probabilidade de saudável)

INSERT INTO voice_test (id, record_duration, raw_parkinson_probability) VALUES
-- Rita - testes 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24 (scores 0.54, 0.51, 0.49, 0.47...)
(2, 18.5, 0.46), (4, 19.2, 0.49), (6, 20.5, 0.51), (8, 21.8, 0.53), (10, 22.5, 0.55), (12, 23.2, 0.57),
(14, 24.5, 0.59), (16, 25.8, 0.61), (18, 26.5, 0.62), (20, 27.2, 0.63), (22, 28.5, 0.64), (24, 29.2, 0.65),
-- Isabella - testes 27, 29, 31, 33, 35, 37, 39, 41, 43, 45, 47 (scores ~0.47)
(27, 17.2, 0.53), (29, 17.5, 0.53), (31, 17.8, 0.54), (33, 18.2, 0.54), (35, 18.5, 0.55), (37, 18.8, 0.55),
(39, 19.2, 0.55), (41, 19.5, 0.54), (43, 19.8, 0.54), (45, 20.2, 0.54), (47, 20.5, 0.53),
-- Felipe - testes 49, 51, 53, 55, 57, 59, 61, 63, 65, 67 (dados sem prob. - NULL permitido)
(49, 15.8, NULL), (51, 16.2, NULL), (53, 16.5, NULL), (55, 16.8, NULL), (57, 17.2, NULL), (59, 17.5, NULL),
(61, 17.8, NULL), (63, 18.2, NULL), (65, 18.5, NULL), (67, 18.8, NULL),
-- Mariana - testes 69, 71, 73, 75, 77, 79, 81, 83, 85 (dados sem prob. - NULL permitido)
(69, 13.5, NULL), (71, 13.8, NULL), (73, 14.2, NULL), (75, 14.5, NULL), (77, 14.8, NULL), (79, 15.2, NULL),
(81, 15.5, NULL), (83, 15.8, NULL), (85, 16.2, NULL),
-- Luiza - testes 87, 89, 91, 93, 95, 97, 99, 101, 103, 105 (dados sem prob. - NULL permitido)
(87, 14.2, NULL), (89, 14.5, NULL), (91, 14.8, NULL), (93, 15.2, NULL), (95, 15.5, NULL), (97, 15.8, NULL),
(99, 16.2, NULL), (101, 16.5, NULL), (103, 16.8, NULL), (105, 17.2, NULL),
-- Rafael - testes 107, 109, 111, 113, 115, 117, 119, 121 (dados sem prob. - NULL permitido)
(107, 12.5, NULL), (109, 12.8, NULL), (111, 13.2, NULL), (113, 13.5, NULL), (115, 13.8, NULL), (117, 14.2, NULL),
(119, 14.5, NULL), (121, 14.8, NULL),
-- Bernardo - testes 123, 125, 127, 129, 131, 133, 135 (dados sem prob. - NULL permitido)
(123, 10.2, NULL), (125, 10.5, NULL), (127, 10.8, NULL), (129, 11.2, NULL), (131, 11.5, NULL), (133, 11.8, NULL),
(135, 12.2, NULL),
-- Oliver - testes 137, 139, 141, 143, 145, 147, 149, 150 (dados sem prob. - NULL permitido)
(137, 10.8, NULL), (139, 11.2, NULL), (141, 11.5, NULL), (143, 11.8, NULL), (145, 12.2, NULL), (147, 12.5, NULL),
(149, 12.8, NULL), (150, 13.2, NULL),
-- Fabiana - testes 152, 154, 156, 158, 160, 162, 164, 166 (dados sem prob. - NULL permitido)
(152, 11.5, NULL), (154, 11.8, NULL), (156, 12.2, NULL), (158, 12.5, NULL), (160, 12.8, NULL), (162, 13.2, NULL),
(164, 13.5, NULL), (166, 13.8, NULL),
-- Juliana - testes 168, 170, 172, 174, 176, 178 (dados sem prob. - NULL permitido)
(168, 9.5, NULL), (170, 9.8, NULL), (172, 10.2, NULL), (174, 10.5, NULL), (176, 10.8, NULL), (178, 11.2, NULL),
-- Valentina - testes 180, 182, 184, 186, 188, 190 (dados sem prob. - NULL permitido)
(180, 10.2, NULL), (182, 10.5, NULL), (184, 10.8, NULL), (186, 11.2, NULL), (188, 11.5, NULL), (190, 11.8, NULL),
-- Emanuelly - testes 193, 195, 197, 199, 201 (dados sem prob. - NULL permitido)
(193, 8.5, NULL), (195, 8.8, NULL), (197, 9.2, NULL), (199, 9.5, NULL), (201, 9.8, NULL),
-- Carlos - teste 203 (apenas 1 voice test)
(203, 15.3, NULL);

-- ========================================
-- INSERÇÃO DE NOTAS DOS MÉDICOS
-- ========================================
-- Total de ~300+ notas distribuídas entre os pacientes e médicos

-- ============================================================
-- NOTAS DO DR. SAMUEL (ID 16) - Especialista em casos avançados
-- ============================================================

-- Notas sobre Rita (paciente 3) - Parkinson progressivo - ~40 notas
INSERT INTO note (content, patient_view, category, test_id, doctor_id, parent_note_id) VALUES
('Primeira avaliação: Score 0.52 indica possíveis sinais iniciais. Necessário acompanhamento regular.', TRUE, 'OBSERVATION', 1, 16, NULL),
('Paciente apresenta tremores característicos ao desenhar a espiral. Score 0.54 mantém-se estável.', TRUE, 'OBSERVATION', 2, 16, NULL),
('Leve declínio observado (0.52 → 0.50). Monitorar evolução nas próximas semanas.', TRUE, 'OBSERVATION', 3, 16, NULL),
('Teste de voz confirma tremor vocal. Score 0.51. Recomendo fonoaudiologia.', TRUE, 'RECOMMENDATION', 4, 16, NULL),
('Score em 0.48 mostra progressão. Iniciando protocolo medicamentoso.', FALSE, 'ALERT', 5, 16, NULL),
('Paciente relata melhora subjetiva, mas score 0.49 ainda indica Parkinson.', TRUE, 'OBSERVATION', 6, 16, NULL),
('Declínio para 0.46 é preocupante. Ajustando dosagem de Levodopa.', FALSE, 'RECOMMENDATION', 7, 16, NULL),
('Teste de voz (0.47) mostra leve melhora após ajuste medicamentoso.', TRUE, 'OBSERVATION', 8, 16, NULL),
('Score 0.44 - progressão continua apesar da medicação. Considerar terapia adjuvante.', FALSE, 'ALERT', 9, 16, NULL),
('Paciente respondeu bem ao exercício fisioterapêutico. Score 0.45 estável.', TRUE, 'OBSERVATION', 10, 16, NULL),
('Score 0.42 indica necessidade de reavaliação neurológica completa.', TRUE, 'ALERT', 11, 16, NULL),
('Teste de voz (0.43) consistente com progressão esperada do quadro.', TRUE, 'OBSERVATION', 12, 16, NULL),
('ALERTA: Score caiu para 0.40. Paciente deve retornar em 7 dias.', TRUE, 'ALERT', 16,16, NULL),
('Família relata piora na qualidade de vida. Score 0.41 confirma.', FALSE, 'OBSERVATION', 17,16, NULL),
('Score 0.38 - estágio moderado confirmado. Discussão sobre opções terapêuticas.', FALSE, 'RECOMMENDATION', 18,16, NULL),
('Paciente iniciou fisioterapia motora. Score 0.39 mostra estabilização temporária.', TRUE, 'OBSERVATION', 16, 16, NULL),
('Score 0.37 - menor valor registrado. Encaminhamento para neurologista especializado.', TRUE, 'ALERT', 17, 16, NULL),
('Consulta realizada com especialista. Score 0.38 mantém tendência de declínio.', TRUE, 'OBSERVATION', 18, 16, NULL),
('Score 0.36 após mudança de medicação. Aguardar estabilização do novo protocolo.', FALSE, 'OBSERVATION', 19, 16, NULL),
('Teste de voz (0.37) mostra leve melhora. Protocolo atual parece adequado.', TRUE, 'OBSERVATION', 20, 16, NULL),
('Score 0.35 estável. Paciente adaptado à nova medicação.', TRUE, 'OBSERVATION', 21, 16, NULL),
('Tremor vocal persistente. Score 0.36. Fonoaudiologia mostrando resultados.', TRUE, 'RECOMMENDATION', 22, 16, NULL),
('Score 0.34 - novo mínimo. Avaliando necessidade de DBS (estimulação cerebral profunda).', FALSE, 'ALERT', 23, 16, NULL),
('Família quer discutir opções cirúrgicas. Score 0.35 indica elegibilidade para DBS.', FALSE, 'RECOMMENDATION', 24, 16, NULL),
('Score 0.33 - paciente foi aprovado para DBS. Aguardando programação cirúrgica.', TRUE, 'ALERT', 25, 16,NULL);

-- Respostas e anotações complementares sobre Rita
INSERT INTO note (content, patient_view, category, test_id, doctor_id, parent_note_id) VALUES
('Paciente questionou sobre efeitos colaterais da Levodopa. Orientações fornecidas sobre náusea e discinesia.', FALSE, 'OBSERVATION', 7, 16, 7),
('Familiar perguntou sobre progressão esperada. Explicado que cada caso é único.', FALSE, 'OBSERVATION', 16, 16, 13),
('Paciente expressa ansiedade sobre DBS. Encaminhada para suporte psicológico.', TRUE, 'RECOMMENDATION', 25, 16, 25),
('Revisão do histórico medicamentoso. Todas as doses estão adequadas para o peso e idade.', FALSE, 'OBSERVATION', 18, 16, 15),
('Paciente relata tremores matinais intensos. Ajustado horário da primeira dose.', TRUE, 'RECOMMENDATION', 11, 16, 11);

-- Notas sobre Isabella (paciente 7) - Parkinson estável - ~30 notas
INSERT INTO note (content, patient_view, category, test_id, doctor_id, parent_note_id) VALUES
('Primeira avaliação: Score 0.46 indica Parkinson moderado. Histórico familiar positivo.', TRUE, 'OBSERVATION', 26, 16, NULL),
('Score 0.47 mostra leve melhora. Paciente respondendo bem à medicação inicial.', TRUE, 'OBSERVATION', 27, 16, NULL),
('Estabilidade no score (0.45). Protocolo atual mantendo controle adequado.', TRUE, 'OBSERVATION', 28, 16, NULL),
('Teste de voz (0.46) consistente com quadro estável de Parkinson.', TRUE, 'OBSERVATION', 29, 16, NULL),
('Score 0.44 - leve flutuação esperada. Sem necessidade de ajuste medicamentoso.', TRUE, 'OBSERVATION', 30, 16, NULL),
('Paciente relatou discinesia leve. Score 0.45. Ajustando dosagem.', TRUE, 'RECOMMENDATION', 31, 16, NULL),
('Score 0.46 após ajuste. Discinesia controlada sem comprometer eficácia.', TRUE, 'OBSERVATION', 32, 16, NULL),
('Excelente adesão ao tratamento. Score 0.45 mostra estabilidade.', TRUE, 'OBSERVATION', 33, 16, NULL),
('Score 0.47 - melhor resultado em 6 meses. Fisioterapia fazendo diferença.', TRUE, 'OBSERVATION', 34, 16, NULL),
('Teste de voz (0.46) estável. Qualidade vocal mantida.', TRUE, 'OBSERVATION', 35, 16, NULL),
('Score 0.45 consistente. Paciente é exemplo de bom controle da doença.', TRUE, 'OBSERVATION', 36, 16, NULL),
('Leve queda para 0.44. Investigar se paciente está pulando doses.', FALSE, 'ALERT', 37, 16, NULL),
('Confirmado que paciente estava esquecendo doses. Orientações reforçadas. Score 0.45.', TRUE, 'OBSERVATION', 38, 16, NULL),
('Score 0.46 após retomada correta da medicação. Sugerido uso de alarmes.', TRUE, 'RECOMMENDATION', 39, 16, NULL),
('Estabilidade mantida (0.45). Controle excelente há 12 meses.', TRUE, 'OBSERVATION', 40, 16, NULL),
('Score 0.44 - dentro da variação normal. Sem alterações necessárias.', TRUE, 'OBSERVATION', 41, 16, NULL),
('Score 0.45 consistente. Renovar receitas e agendar retorno trimestral.', TRUE, 'OBSERVATION', 42, 16, NULL),
('Teste de voz (0.46) estável. Fonoaudiologia preventiva recomendada.', TRUE, 'RECOMMENDATION', 43, 16, NULL),
('Score 0.44 - paciente questionou sobre novos tratamentos. Explicado sobre pesquisas atuais.', TRUE, 'OBSERVATION', 44, 16, NULL),
('Leve declínio para 0.45. Monitorar próximos testes para identificar tendência.', TRUE, 'OBSERVATION', 45, 16, NULL),
('Score 0.41 preocupante após 6 meses estável. Solicitados exames complementares.', TRUE, 'ALERT', 46, 16, NULL),
('Exames descartaram outras causas. Score 0.42 pode indicar progressão natural.', FALSE, 'OBSERVATION', 47, 16,NULL);

-- Respostas sobre Isabella
INSERT INTO note (content, patient_view, category, test_id, doctor_id, parent_note_id) VALUES
('Paciente perguntou sobre atividades físicas permitidas. Incentivada a continuar caminhadas e yoga.', TRUE, 'RECOMMENDATION', 34, 16, 34),
('Familiar questionou sobre hereditariedade. Explicado risco aumentado para filhos.', FALSE, 'OBSERVATION', 26, 16, 26),
('Discutido sobre qualidade de vida e expectativas realistas de controle.', TRUE, 'OBSERVATION', 40, 16, 40);

-- Notas sobre Felipe (paciente 8) - Parkinson inicial - ~25 notas
INSERT INTO note (content, patient_view, category, test_id, doctor_id, parent_note_id) VALUES
('Avaliação inicial: Score 0.58 sugere estágio muito inicial ou forma leve de Parkinson.', TRUE, 'OBSERVATION', 48, 16, NULL),
('Score 0.56 confirma tendência. Iniciando tratamento conservador.', TRUE, 'OBSERVATION', 49, 16, NULL),
('Declínio para 0.54. Monitorar evolução antes de intensificar tratamento.', TRUE, 'OBSERVATION', 50, 16, NULL),
('Teste de voz (0.55) mostra flutuações típicas do estágio inicial.', TRUE, 'OBSERVATION', 51, 16, NULL),
('Score 0.53 - progressão lenta conforme esperado. Medicação mantida.', TRUE, 'OBSERVATION', 52, 16, NULL),
('Paciente adaptou-se bem à medicação. Score 0.54 mostra leve melhora.', TRUE, 'OBSERVATION', 53, 16, NULL),
('Score 0.52 após 6 meses de tratamento. Resposta adequada ao protocolo.', TRUE, 'OBSERVATION', 54, 16, NULL),
('Teste de voz (0.53) estável. Sem necessidade de fonoaudiologia no momento.', TRUE, 'OBSERVATION', 55, 16, NULL),
('Score 0.51 - primeiro teste abaixo de 0.52. Aumento gradual da dose programado.', TRUE, 'RECOMMENDATION', 56, 16, NULL),
('Após ajuste, score 0.52 mostra estabilização. Dose atual apropriada.', TRUE, 'OBSERVATION', 57, 16, NULL),
('Score 0.50 indica progressão esperada. Paciente consciente da evolução natural.', TRUE, 'OBSERVATION', 58, 16, NULL),
('Teste de voz (0.51) consistente. Qualidade de vida mantida.', TRUE, 'OBSERVATION', 59, 16, NULL),
('Score 0.49 - discussão sobre quando iniciar fisioterapia especializada.', FALSE, 'RECOMMENDATION', 60, 16, NULL),
('Paciente iniciou fisioterapia preventiva. Score 0.50 estável.', TRUE, 'OBSERVATION', 61, 16, NULL),
('Score 0.48 após 12 meses de acompanhamento. Progressão dentro do esperado.', TRUE, 'OBSERVATION', 62, 16, NULL),
('Teste de voz (0.49) mostra manutenção da função vocal.', TRUE, 'OBSERVATION', 63, 16, NULL),
('Score 0.47 - novo mínimo. Avaliando necessidade de terapia adjuvante.', TRUE, 'ALERT', 64, 16, NULL),
('Adicionado agonista dopaminérgico ao protocolo. Score 0.48 após 2 semanas.', TRUE, 'OBSERVATION', 65, 16, NULL),
('Score 0.46 mostra que medicação combinada não está sendo suficiente.', FALSE, 'ALERT', 66, 16, NULL),
('Teste de voz (0.47) estável. Concentrar ajustes na medicação motora.', TRUE, 'OBSERVATION', 67, 16,NULL);

-- Respostas sobre Felipe
INSERT INTO note (content, patient_view, category, test_id, doctor_id, parent_note_id) VALUES
('Paciente questionou sobre tempo de progressão esperado. Explicado que varia muito individualmente.', TRUE, 'OBSERVATION', 54, 16, 54),
('Discutido efeitos colaterais possíveis do novo medicamento adicionado.', FALSE, 'RECOMMENDATION', 65, 16, 65);

-- ============================================================
-- NOTAS DA DRA. FERNANDA (ID 17) - Especialista em casos moderados
-- ============================================================

-- Notas sobre Mariana (paciente 4) - Suspeita inicial - ~30 notas
INSERT INTO note (content, patient_view, category, test_id, doctor_id, parent_note_id) VALUES
('Primeira avaliação: Score 0.75 está na faixa limítrofe. Sintomas clínicos sugerem investigação.', TRUE, 'OBSERVATION', 68, 17, NULL),
('Score 0.74 mostra leve declínio. Solicitando RM cerebral para descartar outras causas.', TRUE, 'RECOMMENDATION', 69, 17, NULL),
('RM normal. Score 0.73 sugere Parkinson inicial ou parkinsonismo atípico.', FALSE, 'OBSERVATION', 70, 17, NULL),
('Teste de voz (0.72) corrobora hipótese diagnóstica. Iniciando trial terapêutico.', TRUE, 'OBSERVATION', 71, 17, NULL),
('Score 0.71 após 30 dias de medicação. Resposta terapêutica favorável ao diagnóstico.', TRUE, 'OBSERVATION', 72, 17, NULL),
('Paciente relata melhora dos tremores. Score 0.70 confirma resposta positiva.', TRUE, 'OBSERVATION', 73, 17, NULL),
('Score 0.69 estável há 2 meses. Diagnóstico de Parkinson inicial confirmado.', TRUE, 'OBSERVATION', 74, 17, NULL),
('Teste de voz (0.68) mostra estabilização. Tratamento atual adequado.', TRUE, 'OBSERVATION', 75, 17, NULL),
('Score 0.67 - leve declínio esperado. Ajuste fino da dosagem.', TRUE, 'OBSERVATION', 76, 17, NULL),
('Após ajuste, score 0.66 mantém tendência. Monitoramento continuado.', TRUE, 'OBSERVATION', 77, 17, NULL),
('Score 0.65 aos 9 meses de tratamento. Progressão lenta e controlada.', TRUE, 'OBSERVATION', 78, 17, NULL),
('Teste de voz (0.64) consistente. Qualidade vocal preservada.', TRUE, 'OBSERVATION', 79, 17, NULL),
('Score 0.63 - paciente questionou sobre expectativas de longo prazo.', TRUE, 'OBSERVATION', 80, 17, NULL),
('Discussão ampla sobre prognóstico. Score 0.62 indica bom controle atual.', FALSE, 'OBSERVATION', 81, 17, NULL),
('Score 0.61 após 15 meses de diagnóstico. Evolução favorável com tratamento.', TRUE, 'OBSERVATION', 82, 17, NULL),
('Teste de voz (0.60) mostra declínio gradual. Fonoaudiologia pode ser benéfica.', TRUE, 'RECOMMENDATION', 83, 17, NULL),
('Score 0.59 - encaminhamento para fonoaudiologia realizado.', TRUE, 'OBSERVATION', 84, 17, NULL),
('Paciente iniciou fono. Score 0.58 mostra que tratamento multidisciplinar é essencial.', TRUE, 'RECOMMENDATION', 85, 17,NULL);

-- Respostas sobre Mariana
INSERT INTO note (content, patient_view, category, test_id, doctor_id, parent_note_id) VALUES
('Paciente ansiosa com diagnóstico. Oferecido suporte psicológico e grupos de apoio.', TRUE, 'RECOMMENDATION', 68, 17, 68),
('Familiar perguntou sobre opções de tratamento não-medicamentoso. Explicado sobre fisioterapia e exercícios.', FALSE, 'OBSERVATION', 74, 17, 74),
('Discutido sobre impacto no trabalho. Paciente ainda totalmente funcional.', TRUE, 'OBSERVATION', 80, 17, 80),
('Paciente expressou satisfação com resultados da fonoterapia após 2 meses.', TRUE, 'OBSERVATION', 85, 17, 85);

-- Notas sobre Luiza (paciente 9) - Sintomas leves progressivos - ~35 notas
INSERT INTO note (content, patient_view, category, test_id, doctor_id, parent_note_id) VALUES
('Primeira consulta: Score 0.65 com sintomas clínicos evidentes. Diagnóstico provável de Parkinson.', TRUE, 'OBSERVATION', 86, 17, NULL),
('Score 0.64 confirma tendência de declínio. Iniciando protocolo terapêutico.', TRUE, 'OBSERVATION', 87, 17, NULL),
('Paciente respondendo à medicação. Score 0.63 estável após 1 mês.', TRUE, 'OBSERVATION', 88, 17, NULL),
('Teste de voz (0.62) mostra envolvimento vocal. Recomendado acompanhamento fono.', TRUE, 'RECOMMENDATION', 89, 17, NULL),
('Score 0.61 - declínio gradual esperado. Dose ajustada profilaticamente.', TRUE, 'OBSERVATION', 90, 17, NULL),
('Após ajuste, score 0.60 mostra estabilização temporária.', TRUE, 'OBSERVATION', 91, 17, NULL),
('Score 0.59 indica progressão contínua. Adicionado exercício físico ao plano.', TRUE, 'RECOMMENDATION', 92, 17, NULL),
('Teste de voz (0.58) após início de exercícios. Benefícios ainda não aparentes.', TRUE, 'OBSERVATION', 93, 17, NULL),
('Score 0.57 - paciente relatou melhora na rigidez com exercícios regulares.', TRUE, 'OBSERVATION', 94, 17, NULL),
('Qualidade de vida melhorou apesar de score 0.56. Importância do tratamento holístico.', TRUE, 'OBSERVATION', 95, 17, NULL),
('Score 0.55 aos 6 meses de tratamento integrado. Evolução adequada.', TRUE, 'OBSERVATION', 96, 17, NULL),
('Teste de voz (0.54) mostra declínio vocal. Intensificar fonoterapia.', TRUE, 'RECOMMENDATION', 97, 17, NULL),
('Score 0.53 - família questiona sobre medicações alternativas. Explicado evidências científicas.', FALSE, 'OBSERVATION', 98, 17, NULL),
('Paciente interessada em tai chi. Score 0.52. Atividade aprovada e encorajada.', TRUE, 'RECOMMENDATION', 99, 17, NULL),
('Score 0.51 após 3 meses de tai chi. Possível correlação com estabilização relativa.', TRUE, 'OBSERVATION', 100, 17, NULL),
('Teste de voz (0.50) - limiar importante. Discussão sobre intensificação terapêutica.', TRUE, 'ALERT', 101, 17, NULL),
('Score 0.49 indica entrada em fase moderada. Reavaliação completa do protocolo.', TRUE, 'ALERT', 102, 17, NULL),
('Após reavaliação, ajustado esquema medicamentoso. Score 0.48 aguardando resposta.', FALSE, 'OBSERVATION', 103, 17, NULL),
('Score 0.47 mostra que ajuste não foi suficiente. Considerar segunda linha de tratamento.', TRUE, 'RECOMMENDATION', 104, 17, NULL),
('ALERTA: Paciente faltou à última consulta presencial. Contato telefônico realizado. Score 0.46.', FALSE, 'ALERT', 105, 17,NULL);

-- Respostas sobre Luiza
INSERT INTO note (content, patient_view, category, test_id, doctor_id, parent_note_id) VALUES
('Paciente justificou falta por problema familiar. Reagendado e orientado sobre importância do acompanhamento.', TRUE, 'OBSERVATION', 105, 17, 105),
('Filha da paciente presente na consulta. Discutido papel da família no tratamento.', FALSE, 'OBSERVATION', 98, 17, 98),
('Paciente emocionada com diagnóstico de fase moderada. Suporte emocional e encaminhamento para psicologia.', TRUE, 'RECOMMENDATION', 102, 17, 102),
('Discutido sobre grupos de apoio para pacientes com Parkinson. Paciente interessada.', TRUE, 'RECOMMENDATION', 100, 17, 100);

-- Notas sobre Rafael (paciente 12) - Monitoramento preventivo - ~25 notas
INSERT INTO note (content, patient_view, category, test_id, doctor_id, parent_note_id) VALUES
('Avaliação inicial: Score 0.78 saudável, mas paciente tem histórico familiar forte. Monitoramento preventivo.', TRUE, 'OBSERVATION', 106, 17, NULL),
('Score 0.77 estável. Sem sintomas clínicos. Acompanhamento anual suficiente.', TRUE, 'OBSERVATION', 107, 17, NULL),
('Score 0.76 - leve variação normal. Paciente assintomático.', TRUE, 'OBSERVATION', 108, 17, NULL),
('Teste de voz (0.75) dentro da normalidade. Monitoramento mantido.', TRUE, 'OBSERVATION', 109, 17, NULL),
('Score 0.74 após 6 meses. Questionado sobre sintomas subjetivos - nenhum relatado.', TRUE, 'OBSERVATION', 110, 17, NULL),
('Paciente preocupado com declínio nos scores. Explicado que ainda está em faixa normal.', TRUE, 'OBSERVATION', 111, 17, NULL),
('Score 0.73 - limítrofe superior da normalidade. Exame neurológico normal.', TRUE, 'OBSERVATION', 112, 17, NULL),
('Teste de voz (0.74) mostra leve melhora. Variação dentro do esperado.', TRUE, 'OBSERVATION', 113, 17, NULL),
('Score 0.75 - paciente tranquilizado sobre variações normais nos testes.', TRUE, 'OBSERVATION', 114, 17, NULL),
('Score 0.76 confirma que oscilações são benignas. Sem sinais de Parkinson.', TRUE, 'OBSERVATION', 115, 17, NULL),
('Score 0.77 aos 18 meses de seguimento. Continuar monitoramento anual.', TRUE, 'OBSERVATION', 116, 17, NULL),
('Teste de voz (0.76) estável. Paciente saudável, acompanhamento por precaução.', TRUE, 'OBSERVATION', 117, 17, NULL),
('Score 0.75 - discutido sobre sinais de alerta para retorno antecipado.', TRUE, 'OBSERVATION', 118, 17, NULL),
('Paciente compreende quando deve buscar avaliação fora do cronograma. Score 0.74.', TRUE, 'OBSERVATION', 119, 17, NULL),
('Score 0.76 - resultado tranquilizador. Próximo retorno em 12 meses.', TRUE, 'OBSERVATION', 120, 17, NULL),
('Teste de voz (0.75) normal. Familiar presente questionou sobre prevenção.', TRUE, 'OBSERVATION', 121, 17,NULL);

-- Respostas sobre Rafael
INSERT INTO note (content, patient_view, category, test_id, doctor_id, parent_note_id) VALUES
('Explicado ao familiar que exercícios físicos regulares podem ter efeito neuroprotetor.', TRUE, 'RECOMMENDATION', 121, 17, 121),
('Paciente perguntou sobre suplementação. Orientado que não há evidência robusta de prevenção medicamentosa.', TRUE, 'OBSERVATION', 111, 17, 111);

-- ============================================================
-- NOTAS DA DRA. HELOISA (ID 18) - Acompanhamento geral e casos leves
-- ============================================================

-- Notas sobre Bernardo (paciente 1) - Saudável - ~20 notas
INSERT INTO note (content, patient_view, category, test_id, doctor_id, parent_note_id) VALUES
('Avaliação inicial por queixa de tremor ocasional. Score 0.90 excelente, descarta Parkinson.', TRUE, 'OBSERVATION', 122, 18, NULL),
('Score 0.91 confirma ausência de sinais parkinsonianos. Tremor likely benigno ou ansioso.', TRUE, 'OBSERVATION', 123, 18, NULL),
('Paciente jovem sem fatores de risco. Score 0.89 dentro da normalidade.', TRUE, 'OBSERVATION', 124, 18, NULL),
('Teste de voz (0.90) excelente. Qualidade vocal preservada.', TRUE, 'OBSERVATION', 125, 18, NULL),
('Score 0.92 - melhor resultado até agora. Tremor foi transitório.', TRUE, 'OBSERVATION', 126, 18, NULL),
('Paciente assintomático há 3 meses. Score 0.91 excelente. Alta do acompanhamento neurológico.', TRUE, 'OBSERVATION', 127, 18, NULL),
('Retorno por insistência do paciente. Score 0.90 mantém-se ótimo.', TRUE, 'OBSERVATION', 128, 18, NULL),
('Teste de voz (0.89) normal. Explicado que testes ocasionais são desnecessários.', TRUE, 'OBSERVATION', 129, 18, NULL),
('Score 0.91 - paciente tem ansiedade de saúde. Sugerido acompanhamento psicológico.', TRUE, 'RECOMMENDATION', 130, 18, NULL),
('Após início de terapia, paciente mais tranquilo. Score 0.90 estável.', TRUE, 'OBSERVATION', 131, 18, NULL),
('Score 0.92 excelente. Paciente concordou com alta definitiva.', TRUE, 'OBSERVATION', 132, 18, NULL),
('Teste de voz (0.91) ótimo. Alta do serviço de neurologia.', TRUE, 'OBSERVATION', 133, 18, NULL),
('Última avaliação: Score 0.90. Orientado retornar apenas se sintomas novos.', TRUE, 'OBSERVATION', 134, 18, NULL),
('Teste final de voz (0.89) normal. Alta confirmada.', TRUE, 'OBSERVATION', 135, 18,NULL);

-- Respostas sobre Bernardo
INSERT INTO note (content, patient_view, category, test_id, doctor_id, parent_note_id) VALUES
('Paciente questionou se precisa retornos anuais. Orientado que não há necessidade sem sintomas.', TRUE, 'OBSERVATION', 132, 18, 132),
('Familiar preocupado com hereditariedade. Explicado que risco é baixo na idade do paciente.', FALSE, 'OBSERVATION', 122, 18, 122);

-- Notas sobre Oliver (paciente 2) - Saudável - ~20 notas
INSERT INTO note (content, patient_view, category, test_id, doctor_id, parent_note_id) VALUES
('Encaminhado por clínico geral por histórico familiar. Score 0.87 excelente, sem Parkinson.', TRUE, 'OBSERVATION', 136, 18, NULL),
('Score 0.86 normal para a idade. Exame neurológico sem alterações.', TRUE, 'OBSERVATION', 137, 18, NULL),
('Paciente assintomático. Score 0.88 ótimo resultado.', TRUE, 'OBSERVATION', 138, 18, NULL),
('Teste de voz (0.87) dentro da normalidade esperada.', TRUE, 'OBSERVATION', 139, 18, NULL),
('Score 0.86 estável. Acompanhamento anual por histórico familiar.', TRUE, 'OBSERVATION', 140, 18, NULL),
('Paciente tem pai com Parkinson. Score 0.85 ainda muito bom. Monitoramento preventivo.', TRUE, 'OBSERVATION', 141, 18, NULL),
('Score 0.87 aos 12 meses. Sem sinais de desenvolvimento da doença.', TRUE, 'OBSERVATION', 142, 18, NULL),
('Teste de voz (0.88) excelente. Continuar acompanhamento anual.', TRUE, 'OBSERVATION', 143, 18, NULL),
('Score 0.86 - paciente perguntou sobre prevenção. Orientado sobre exercícios.', TRUE, 'RECOMMENDATION', 144, 18, NULL),
('Paciente iniciou atividade física regular. Score 0.87 mantido.', TRUE, 'OBSERVATION', 145, 18, NULL),
('Score 0.85 - leve oscilação normal. Exame clínico sem alterações.', TRUE, 'OBSERVATION', 146, 18, NULL),
('Teste de voz (0.86) normal. Acompanhamento anual adequado.', TRUE, 'OBSERVATION', 147, 18, NULL),
('Score 0.88 após 24 meses de seguimento. Prognóstico favorável.', TRUE, 'OBSERVATION', 148, 18, NULL),
('Teste de voz (0.87) estável. Próximo retorno em 1 ano.', TRUE, 'OBSERVATION', 149, 18, NULL),
('Score 0.86 - paciente saudável, monitoramento continuado por precaução.', TRUE, 'OBSERVATION', 148, 18, NULL),
('Teste de voz (0.86) final - sem sinais de Parkinson. Manter vigilância.', TRUE, 'OBSERVATION', 150, 18,NULL);

-- Respostas sobre Oliver
INSERT INTO note (content, patient_view, category, test_id, doctor_id, parent_note_id) VALUES
('Discutido risco genético. Explicado que maioria dos casos de Parkinson não é hereditária.', TRUE, 'OBSERVATION', 136, 18, 136),
('Paciente quer fazer teste genético. Orientado sobre limitações dos testes disponíveis.', FALSE, 'OBSERVATION', 141, 18, 141),
('Elogiado paciente por adotar estilo de vida saudável. Exercício é importante fator protetor.', TRUE, 'RECOMMENDATION', 145, 18, 145);

-- Notas sobre Fabiana (paciente 10) - Saudável - ~22 notas
INSERT INTO note (content, patient_view, category, test_id, doctor_id, parent_note_id) VALUES
('Primeira avaliação: Score 0.84 normal. Paciente preocupada com tremor postural.', TRUE, 'OBSERVATION', 151, 18, NULL),
('Tremor é essencial familiar, não Parkinson. Score 0.83 confirma. Tranquilizada.', TRUE, 'OBSERVATION', 152, 18, NULL),
('Score 0.85 excelente. Tremor essencial é benigno e não evolui para Parkinson.', TRUE, 'OBSERVATION', 153, 18, NULL),
('Teste de voz (0.84) normal. Sem comprometimento vocal.', TRUE, 'OBSERVATION', 154, 18, NULL),
('Score 0.83 estável. Discutido tratamento do tremor essencial se incomodar.', TRUE, 'OBSERVATION', 155, 18, NULL),
('Paciente optou por não tratar tremor por enquanto. Score 0.82 mantém-se bom.', TRUE, 'OBSERVATION', 156, 18, NULL),
('Score 0.84 - tremor essencial estável. Acompanhamento semestral.', TRUE, 'OBSERVATION', 157, 18, NULL),
('Teste de voz (0.85) excelente. Qualidade de vida preservada.', TRUE, 'OBSERVATION', 158, 18, NULL),
('Score 0.83 aos 9 meses. Sem progressão do tremor.', TRUE, 'OBSERVATION', 159, 18, NULL),
('Paciente adaptada ao tremor. Score 0.84 normal. Sem necessidade de medicação.', TRUE, 'OBSERVATION', 160, 18, NULL),
('Score 0.82 - leve oscilação. Tremor essencial permanece estável.', TRUE, 'OBSERVATION', 161, 18, NULL),
('Teste de voz (0.83) dentro da normalidade.', TRUE, 'OBSERVATION', 162, 18, NULL),
('Score 0.85 - melhor resultado recente. Paciente bem adaptada.', TRUE, 'OBSERVATION', 163, 18, NULL),
('Teste de voz (0.84) ótimo. Acompanhamento anual suficiente.', TRUE, 'OBSERVATION', 164, 18, NULL),
('Score 0.83 aos 18 meses. Tremor essencial não piorou.', TRUE, 'OBSERVATION', 165, 18, NULL),
('Teste de voz (0.82) normal. Alta do acompanhamento neurológico regular.', TRUE, 'OBSERVATION', 166, 18,NULL);

-- Respostas sobre Fabiana
INSERT INTO note (content, patient_view, category, test_id, doctor_id, parent_note_id) VALUES
('Paciente perguntou se tremor pode piorar com idade. Explicado que pode, mas não é Parkinson.', TRUE, 'OBSERVATION', 155, 18, 155),
('Discutido opções de tratamento futuro caso tremor interfira em atividades.', TRUE, 'RECOMMENDATION', 157, 18, 157),
('Paciente satisfeita com decisão de não medicar. Qualidade de vida excelente.', TRUE, 'OBSERVATION', 160, 18, 160);

-- Notas adicionais sobre pacientes menos acompanhados
-- Juliana (paciente 5), Valentina (6), Emanuelly (11) - Notas esparsas

-- Juliana
INSERT INTO note (content, patient_view, category, test_id, doctor_id, parent_note_id) VALUES
('Avaliação preventiva: Score 0.92 excelente. Sem sinais de Parkinson.', TRUE, 'OBSERVATION', 168, 18, NULL),
('Score 0.93 ótimo. Retorno anual recomendado por histórico familiar.', TRUE, 'OBSERVATION', 169, 18, NULL),
('Score 0.91 normal. Acompanhamento mantido.', TRUE, 'OBSERVATION', 170, 18, NULL),
('Score 0.92 estável. Paciente saudável.', TRUE, 'OBSERVATION', 171, 18, NULL),
('Score 0.94 excelente. Sem necessidade de acompanhamento frequente.', TRUE, 'OBSERVATION', 172, 18,NULL);

-- Valentina
INSERT INTO note (content, patient_view, category, test_id, doctor_id, parent_note_id) VALUES
('Avaliação inicial: Score 0.89 muito bom. Sem alterações neurológicas.', TRUE, 'OBSERVATION', 180, 18, NULL),
('Score 0.90 excelente. Acompanhamento anual por precaução.', TRUE, 'OBSERVATION', 181, 18, NULL),
('Score 0.88 normal. Paciente assintomática.', TRUE, 'OBSERVATION', 182, 18, NULL),
('Score 0.89 estável. Retorno programado.', TRUE, 'OBSERVATION', 183, 18, NULL),
('Score 0.91 ótimo resultado. Continuar monitoramento leve.', TRUE, 'OBSERVATION', 184, 18,NULL);

-- Emanuelly
INSERT INTO note (content, patient_view, category, test_id, doctor_id, parent_note_id) VALUES
('Muito jovem, avaliação por histórico familiar. Score 0.95 excelente.', TRUE, 'OBSERVATION', 193, 18, NULL),
('Score 0.94 perfeito para a idade. Retorno em 2 anos suficiente.', TRUE, 'OBSERVATION', 194, 18, NULL),
('Score 0.96 - melhor possível. Sem risco imediato.', TRUE, 'OBSERVATION', 195, 18, NULL),
('Score 0.95 ótimo. Paciente extremamente saudável.', TRUE, 'OBSERVATION', 196, 18,NULL);

-- ========================================
-- FIM DO SCRIPT
-- ========================================
