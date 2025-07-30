### **Comunicação para os Responsáveis do Backend, API e QA**

Está finalizado a **primeira versão** da lógica e da estrutura dos formulários de **Login** e **Cadastro** no frontend. Para garantir que estamos todos alinhados, aqui estão os detalhes técnicos que impactam os seus cards:

#### **Para os Cards da API:**

Os endpoints que o frontend irá chamar e os corpos (payloads) que serão enviados são os seguintes:

1.  **Endpoint de Login (`POST /api/auth/login`):**

    - O frontend enviará um JSON com três campos: `email`, `password` e `role`.
    - O campo `role` é crucial, pois informa explicitamente qual o tipo de usuário que está tentando fazer o login. Os valores possíveis são: `"paciente"`, `"medico"` ou `"admin"`.
    - **Exemplo de Payload:**
      ```json
      {
        "email": "medico@email.com",
        "password": "uma_senha_segura",
        "role": "medico"
      }
      ```

2.  **Endpoint de Cadastro de Paciente (`POST /api/auth/register/patient`):**

    - O frontend enviará um JSON com todos os dados do formulário de paciente.
    - **Exemplo de Payload:**
      ```json
      {
        "fullName": "Nome Completo do Paciente",
        "cpf": "12345678900", // CPF sem máscara
        "birthDate": "1990-12-31",
        "cep": "80000000", // CEP sem máscara
        "street": "Rua Exemplo",
        "number": "123",
        "complement": "Apto 4",
        "neighborhood": "Bairro Exemplo",
        "city": "Cidade",
        "state": "PR",
        "email": "paciente@email.com",
        "password": "uma_senha_forte_123"
      }
      ```

#### **Para os Cards do Backend:**

O frontend está realizando validações do lado do cliente para melhorar a experiência do usuário. O backend deve implementar as mesmas regras (ou mais rigorosas) como a fonte final da verdade.

1.  **Validação de CPF:** O frontend já verifica se o CPF é matematicamente válido. O backend deve replicar esta validação. O valor do CPF será enviado como uma string de 11 dígitos, sem pontos ou hifens.
2.  **Validação de Senha Forte:** O frontend está impondo uma regra de **mínimo de 8 caracteres**, contendo pelo menos **uma letra maiúscula, uma minúscula e um número**. É fundamental que o backend imponha a mesma regra ao criar um usuário.
3.  **Tratamento de Erros:** A aplicação frontend está preparada para lidar com respostas de erro, especialmente o status `409 Conflict` para quando um e-mail ou CPF já existe no banco de dados, sinta-se a vontade para melhorar este tratamento.

#### **Para os Card de Documentação e QA:**

Ao documentar e testar, por favor, considere os seguintes fluxos e validações:

1.  **Documentação:** Os corpos das requisições (payloads) para os endpoints de login e cadastro de paciente devem seguir os exemplos acima. Não se esqueça de incluir o campo `role` na documentação do endpoint de login, pois ele é essencial.
2.  **Testes de QA:**
    - **Validações no Frontend:** Teste os formulários com dados inválidos:
      - Tente submeter campos em branco.
      - Use um e-mail sem o formato correto (ex: "teste@teste").
      - Use um CPF com números repetidos (ex: "111.111.111-11") ou matematicamente inválido.
      - Use uma senha fraca (ex: "12345678" ou "password").
      - Tente submeter senhas que não coincidem no campo de confirmação.
    - **Feedback Visual:** Verifique se o botão "Entrar" / "Criar Conta" fica desativado e se um spinner de carregamento aparece durante a submissão. Verifique se as mensagens de erro (ex: "CPF inválido", "As senhas não coincidem") são exibidas corretamente.
    - **Fluxo do Médico:** Ao tentar criar uma conta de médico, o usuário deve ser redirecionado para a página de login com uma mensagem informando que seu cadastro está pendente de aprovação.

> *IMPORTANTE:* O endpoint de cadastro do médico está sendo desenvolvido e não está finalizado.