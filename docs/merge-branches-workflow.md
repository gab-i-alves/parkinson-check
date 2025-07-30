
### **Guia Workflow para Merge de Branches**

Este documento descreve o processo padrão para integrar branches de feature, garantindo a estabilidade da branch `main`, a qualidade do código através de revisões e um histórico de commits limpo.

#### **Visão Geral do Processo**

1.  **Merge Local:** Juntar a branch de origem na branch de destino localmente.
2.  **Verificação e Testes:** Resolver conflitos e testar a integração completa.
3.  **Sincronização com a `main`:** Atualizar sua branch com o estado mais recente da `main`.
4.  **Pull Request (PR):** Criar uma solicitação de merge para revisão da equipe.
5.  **Merge Final:** Integrar o código na `main` após a aprovação.

---

### **Passo 1: Preparação e Merge Local**

O primeiro passo é trazer as alterações de uma branch para outra em seu ambiente local.

1.  **Faça o checkout da branch de destino:**

    ```bash
    # Exemplo: movendo para a branch que receberá as alterações
    git checkout feat/api-initial-setup-and-login-mock
    ```

2.  **Atualize a branch de destino com a versão do repositório remoto:**

    ```bash
    git pull origin feat/api-initial-setup-and-login-mock
    ```

3.  **Faça o merge da branch de origem na sua branch atual:**
    Usamos `--no-ff` (no fast-forward) para criar um "merge commit". Isso mantém o histórico mais claro, mostrando exatamente onde uma feature foi integrada.

    ```bash
    # Exemplo: trazendo a branch do banco de dados para a branch da API
    git merge --no-ff feat/backend-db-connection-and-users-table
    ```

### **Passo 2: Resolução de Conflitos e Testes Locais**

Este é um passo crítico para garantir a segurança da integração.

1.  **Se houver conflitos, identifique os arquivos:**

    ```bash
    git status
    ```

    O Git listará os arquivos em "Unmerged paths".

2.  **Resolva os conflitos:** Abra cada arquivo no editor, remova os marcadores (`<<<<<<<`, `=======`, `>>>>>>>`) e ajuste o código para a versão final desejada.

3.  **Finalize o merge:** Após resolver todos os conflitos, adicione os arquivos e continue o merge.

    ```bash
    git add .
    git merge --continue
    ```

4.  **Teste tudo localmente:**

    - Compile e execute o projeto.
    - Rode todos os testes automatizados (unitários, integração, etc.).
    - Teste manualmente a funcionalidade combinada para garantir que tudo funciona como esperado.

### **Passo 3: Sincronização com a Branch `main`**

Antes de criar o Pull Request, precisamos garantir que a branch está atualizada com a `main` para evitar surpresas.

1.  **Busque as últimas atualizações de todas as branches remotas:**

    ```bash
    git fetch origin
    ```

2.  **Faça o merge da `main` remota na sua branch de feature:**

    ```bash
    git merge origin/main
    ```

    Isso traz o trabalho mais recente de outros desenvolvedores para a sua branch. Se surgirem novos conflitos, resolva-os como no Passo 2.

3.  **Envie sua branch atualizada para o repositório remoto:**

    ```bash
    git push origin feat/api-initial-setup-and-login-mock
    ```

### **Passo 4: Criação do Pull Request (PR)**

O Pull Request é o coração do processo de revisão e colaboração.

1.  **Acesse o GitHub**.
2.  **Inicie a criação de um novo Pull Request**.
3.  **Configure as branches:**
    - **Branch base (alvo):** `main`
    - **Branch de comparação (origem):** `feat/api-initial-setup-and-login-mock`
4.  **Escreva uma descrição clara e objetiva:**
    - **Título:** Um resumo curto e direto (ex: "feat: Implementa login na API com conexão ao banco de dados").
    - **Descrição:** Detalhe **o que** foi feito, **por que** foi feito (ex: "resolve a tarefa \#123") e **como testar** as alterações.
5.  **Adicione revisores (reviewers)** e crie o PR.

### **Passo 5: Revisão de Código e Merge Final**

1.  **Aguarde a aprovação:** Espere os testes automatizados (CI/CD) passarem e os revisores aprovarem as mudanças. Se pedirem alterações, faça os commits na sua branch local e envie-os com `git push`. O PR será atualizado automaticamente.
2.  **Faça o merge do PR:** Após a aprovação, use a interface web para fazer o merge.
    - **Método recomendado: "Squash and Merge"**. Esta opção agrupa todos os commits da sua branch em um único commit na `main`. Isso mantém o histórico da `main` limpo, linear e fácil de entender.
3.  **Exclua a branch:** Após o merge, a branch de feature pode ser excluída para manter o repositório organizado.