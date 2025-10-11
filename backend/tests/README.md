# Testes de Unidade - Camada de Serviços

Este diretório contém a suíte de testes de unidade para a camada de serviços do backend da aplicação Parkinson Check.

## 🎉 Destaque: 100% de Cobertura Alcançada!

A suíte de testes possui **65 testes** que cobrem **100%** de todas as linhas de código dos serviços:

```
================================ tests coverage ================================
Name                               Stmts   Miss  Cover
----------------------------------------------------------------
core/services/address_service.py      17      0   100%
core/services/auth_service.py         15      0   100%
core/services/doctor_service.py       63      0   100%
core/services/patient_service.py      60      0   100%
core/services/test_service.py         64      0   100%
core/services/user_service.py         25      0   100%
----------------------------------------------------------------
TOTAL                                244      0   100%
======================== 65 passed in 0.98s ========================
```

## Estrutura de Diretórios

```
tests/
├── __init__.py
├── conftest.py                    # Fixtures globais compartilhadas
├── README.md                      # Este arquivo
└── unit/
    ├── __init__.py
    └── services/
        ├── __init__.py
        ├── test_address_service.py    # Testes para address_service
        ├── test_auth_service.py       # Testes para auth_service
        ├── test_doctor_service.py     # Testes para doctor_service
        ├── test_patient_service.py    # Testes para patient_service
        ├── test_test_service.py       # Testes para test_service
        └── test_user_service.py       # Testes para user_service
```

## Dependências

As seguintes dependências de teste foram adicionadas ao `requirements.txt`:

- `pytest` - Framework de testes
- `pytest-mock` - Plugin para facilitar mocking
- `pytest-cov` - Plugin para medir cobertura de código
- `faker` - Biblioteca para gerar dados de teste realistas

Para instalar todas as dependências:

```bash
pip install -r requirements.txt
```

## Executando os Testes

### Todos os testes

```bash
pytest tests/unit/services/
```

### Com modo verbose

```bash
pytest tests/unit/services/ -v
```

### Com relatório de cobertura

```bash
pytest tests/unit/services/ --cov=core/services --cov-report=term-missing
```

### Executar arquivo específico

```bash
pytest tests/unit/services/test_auth_service.py -v
```

### Executar teste específico

```bash
pytest tests/unit/services/test_auth_service.py::TestAuthService::test_login_success -v
```

## Cobertura de Testes

A suíte de testes atual oferece **100% de cobertura** em todos os serviços:

| Serviço                | Cobertura | Testes        | Status                           |
| ---------------------- | --------- | ------------- | -------------------------------- |
| **address_service.py** | 100%      | 8 testes      | ✅ Cobertura completa            |
| **auth_service.py**    | 100%      | 5 testes      | ✅ Cobertura completa            |
| **doctor_service.py**  | 100%      | 15 testes     | ✅ Cobertura completa            |
| **patient_service.py** | 100%      | 12 testes     | ✅ Cobertura completa            |
| **test_service.py**    | 100%      | 14 testes     | ✅ Cobertura completa            |
| **user_service.py**    | 100%      | 10 testes     | ✅ Cobertura completa            |
| **TOTAL**              | **100%**  | **65 testes** | ✅ **Cobertura total alcançada** |

## Princípios dos Testes

### 1. Isolamento

Todos os testes são completamente isolados usando mocks do SQLAlchemy Session. Não há interação com banco de dados real.

### 2. AAA Pattern

Cada teste segue o padrão AAA (Arrange-Act-Assert):

- **Arrange**: Preparação dos dados e mocks
- **Act**: Execução da função sendo testada
- **Assert**: Verificação dos resultados

### 3. Fixtures

O arquivo `conftest.py` contém fixtures reutilizáveis:

- `mock_session`: Mock da Session do SQLAlchemy
- `sample_address`: Endereço de exemplo
- `sample_user`: Usuário básico
- `sample_doctor`: Médico com dados completos
- `sample_patient`: Paciente com dados completos
- `sample_bind`: Vínculo entre médico e paciente
- `sample_voice_test`: Teste de voz de exemplo
- `sample_spiral_test`: Teste de espiral de exemplo
- `multiple_binds`: Lista de vínculos com diferentes status

## Exemplos de Testes

### Teste de Sucesso

```python
def test_get_user_by_email_found(self, mock_session, sample_user):
    """Testa busca de usuário por email quando usuário existe."""
    # Arrange
    mock_query = MagicMock()
    mock_query.filter.return_value.first.return_value = sample_user
    mock_session.query.return_value = mock_query

    # Act
    result = user_service.get_user_by_email("joao@example.com", mock_session)

    # Assert
    assert result == sample_user
    assert result.email == "joao@example.com"
```

### Teste de Exceção

```python
def test_login_user_not_found(self, mock_session):
    """Testa falha de login quando usuário não existe."""
    # Arrange
    mock_query = MagicMock()
    mock_query.filter.return_value.first.return_value = None
    mock_session.query.return_value = mock_query

    # Act & Assert
    with pytest.raises(HTTPException) as exc_info:
        auth_service.login(login_form, mock_session)

    assert exc_info.value.status_code == HTTPStatus.UNAUTHORIZED
```

## Cobertura por Serviço

### address_service.py (100% - 8 testes)

- ✅ get_similar_address (encontrado e não encontrado)
- ✅ create_address (sucesso, duplicado e sem complemento)
- ✅ get_by_id (encontrado e não encontrado)
- ✅ Validação de todos os critérios de busca

### auth_service.py (100% - 5 testes)

- ✅ Login bem-sucedido
- ✅ Login com usuário inexistente
- ✅ Login com senha incorreta
- ✅ Validação de token gerado
- ✅ Validação de UserResponse

### doctor_service.py (100% - 15 testes)

- ✅ Criação de médico (sucesso e validações de duplicidade)
- ✅ Criação de médico com novo endereço
- ✅ Busca por CRM (encontrado e não encontrado)
- ✅ Listagem de médicos com filtros
- ✅ Gerenciamento de vínculos (aprovar/rejeitar/não encontrado)
- ✅ Busca de solicitações pendentes (recebidas e enviadas)
- ✅ Busca de médicos vinculados

### patient_service.py (100% - 12 testes)

- ✅ Criação de paciente (sucesso e validações de duplicidade)
- ✅ Criação de paciente com novo endereço
- ✅ Criação de solicitação de vínculo (sucesso, já ativo, já pendente)
- ✅ Reativação de vínculo rejeitado
- ✅ Médico não encontrado
- ✅ Desvinculação de médico (sucesso, não encontrado, sem permissão)
- ✅ Busca de pacientes vinculados

### test_service.py (100% - 14 testes)

- ✅ Processamento de espiral como prática (sucesso e erros)
- ✅ Processamento de voz como prática (sucesso e erros)
- ✅ Tratamento de erros HTTP, conexão e genéricos
- ✅ Limpeza de arquivos temporários
- ✅ Busca de testes de pacientes (sucesso, sem vínculos, acesso negado)
- ✅ Busca detalhada de testes (sucesso, sem acesso, acesso negado)

### user_service.py (100% - 10 testes)

- ✅ Busca por email (encontrado e não encontrado)
- ✅ Busca por CPF (encontrado e não encontrado)
- ✅ Busca de vínculos ativos (com vínculos, sem vínculos, filtros de status)
- ✅ Listagem de usuários vinculados (sucesso, sem vínculos, como médico)
- ✅ Validação de permissões

## Conquistas

- ✅ **100% de cobertura** em todos os serviços
- ✅ **65 testes** cobrindo todos os cenários críticos
- ✅ **Isolamento completo** usando mocks do SQLAlchemy
- ✅ **Padrão AAA** seguido em todos os testes
- ✅ **Fixtures reutilizáveis** para setup eficiente

## Melhorias Futuras

1. **Testes de integração**: Criar testes que validem a integração entre serviços
2. **Testes de performance**: Adicionar testes de carga para operações críticas
3. **Testes paramétricos**: Usar `pytest.mark.parametrize` para reduzir código duplicado
4. **Fixtures mais complexas**: Criar factories para geração dinâmica de dados de teste
5. **Testes E2E**: Adicionar testes ponta-a-ponta para fluxos completos do usuário

## Troubleshooting

### Erro: No module named pytest

```bash
pip install pytest pytest-mock pytest-cov faker
```

### Erro: TypeError com dataclasses

Os modelos usam `mapped_as_dataclass`. Certifique-se de criar objetos sem passar `id` no construtor e definir o `id` depois:

```python
user = User(name="João", cpf="123", ...)
user.id = 1
```/exi

### Testes lentos

Use a opção `-n auto` para executar testes em paralelo (requer pytest-xdist):

```bash
pip install pytest-xdist
pytest tests/unit/services/ -n auto
```
