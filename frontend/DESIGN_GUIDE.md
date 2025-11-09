# Guia de Design - ParkinsonCheck

Este documento contém os princípios de design, padrões de UI/UX e componentes de referência para manter consistência visual em toda a aplicação.

---

## 📋 Índice

1. [Componentes de Referência](#componentes-de-referência)
2. [Princípios de Design](#princípios-de-design)
3. [Paleta de Cores](#paleta-de-cores)
4. [Componentes UI](#componentes-ui)
5. [Exemplos de Código](#exemplos-de-código)

---

## 🎨 Componentes de Referência

Use estes componentes como base para extrair padrões de design:

### Páginas de Autenticação

- `frontend/src/app/features/home/landing-page/landing-page.html`
- `frontend/src/app/features/auth/components/auth-layout/auth-layout.component.html`
- `frontend/src/app/features/auth/components/login/login.component.html`
- `frontend/src/app/features/auth/components/register/register.component.html`
- `frontend/src/app/features/auth/components/forgot-password/forgot-password.component.html`
- `frontend/src/app/features/auth/components/reset-password/reset-password.component.html`

### Formulários de Registro

- `frontend/src/app/features/auth/components/patient-register-form/patient-register-form.component.html`
- `frontend/src/app/features/auth/components/doctor-register-form/doctor-register-form.component.html`

### Dashboard (Aplicação dos Princípios)

- `frontend/src/app/features/dashboard/components/patient-dashboard/patient-dashboard.component.html`
- `frontend/src/app/features/dashboard/components/my-doctors/my-doctors.component.html`

---

## 🎯 Princípios de Design

### 1. Background Decorativo

Todas as páginas principais devem ter círculos desfocados no fundo para criar profundidade visual.

```html
<!-- Background decorativo -->
<div class="absolute top-0 left-0 w-full h-full -z-10 overflow-hidden">
  <div class="absolute top-[-10%] right-[-5%] w-96 h-96 bg-violet-200/30 rounded-full filter blur-3xl opacity-50"></div>
  <div class="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-purple-200/30 rounded-full filter blur-3xl opacity-40"></div>
  <div class="absolute top-[30%] left-[10%] w-64 h-64 bg-orange-200/30 rounded-full filter blur-3xl opacity-35"></div>
</div>
```

**Características:**

- Posicionamento: `absolute` com `-z-10`
- Tamanhos: `w-96 h-96` (grandes) ou `w-64 h-64` (médios)
- Cores: violet-200, purple-200, orange-200 com opacidade 30-50%
- Blur: `blur-3xl`
- Posições variadas: top/bottom + left/right negativas

---

### 2. Cards com Glassmorphism

Efeito de "vidro fosco" para cards e containers principais.

```html
<div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-8">
  <!-- Conteúdo -->
</div>
```

**Classes Essenciais:**

- Background: `bg-white/80` (branco com 80% de opacidade)
- Blur: `backdrop-blur-sm`
- Bordas: `rounded-2xl` (muito arredondadas)
- Sombra: `shadow-lg`
- Border: `border border-gray-200/50` (borda sutil)
- Padding: `p-6` ou `p-8`

**Com Hover:**

```html
<div class="bg-violet-50/50 border border-violet-200 rounded-2xl p-6 shadow-md hover:shadow-lg transition-all hover:-translate-y-1">
  <!-- Card interativo -->
</div>
```

---

### 3. Ícones com Background

Ícones devem ter containers com background colorido e bordas.

```html
<div class="flex h-14 w-14 items-center justify-center rounded-lg bg-violet-700 shadow-lg">
  <svg class="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <!-- Path do ícone -->
  </svg>
</div>
```

**Variações de Tamanho:**

**Grande (Header/Logo):**

- Container: `h-14 w-14`
- Ícone: `h-8 w-8`
- Background: `bg-violet-700`
- Border radius: `rounded-lg`

**Médio (Cards):**

- Container: `h-14 w-14`
- Ícone: `h-7 w-7`
- Background: `bg-{color}-100`
- Border: `border-2 border-{color}-200`

**Pequeno (Info):**

- Container: `h-10 w-10`
- Ícone: `h-5 w-5`
- Background: `bg-{color}-100`
- Border: `border-2 border-{color}-200`

---

### 4. Typography Hierárquica

**Títulos Principais:**

```html
<h1 class="text-3xl font-bold text-gray-900">Título</h1>
<p class="text-sm text-gray-600 mt-1">Subtítulo</p>
```

**Títulos de Seção:**

```html
<h3 class="text-lg font-bold text-gray-900 mb-4">Seção</h3>
```

**Labels e Descrições:**

```html
<p class="text-sm font-medium text-{color}-700">Label</p>
<p class="text-xs text-gray-700 mt-2">Descrição</p>
```

**Valores/Métricas:**

```html
<p class="text-3xl font-bold text-gray-900 mt-2">123</p>
```

---

### 5. Botões Padronizados

**Botão Primário:**

```html
<button class="inline-flex items-center rounded-lg bg-violet-700 px-6 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-violet-800 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 transition-all">Texto do Botão</button>
```

**Botão Secundário:**

```html
<button class="inline-flex items-center px-6 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 transition-all">Voltar</button>
```

**Link Estilo Botão:**

```html
<button class="inline-flex items-center text-sm font-medium text-violet-700 hover:text-violet-800 transition-colors">Ver Perfil</button>
```

---

### 6. Estados de Loading

**Spinner com Mensagem:**

```html
<div class="flex h-screen items-center justify-center">
  <div class="text-center">
    <svg class="inline-block animate-spin rounded-full h-12 w-12 text-violet-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    <p class="text-gray-600 mt-4 font-medium">Carregando...</p>
  </div>
</div>
```

---

### 7. Estados Vazios

**Empty State com Ícone:**

```html
<div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-12 text-center">
  <div class="flex h-16 w-16 items-center justify-center rounded-lg bg-gray-100 border-2 border-gray-200 mx-auto mb-4">
    <svg class="h-10 w-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <!-- Path do ícone -->
    </svg>
  </div>
  <h3 class="text-lg font-semibold text-gray-900">Nenhum item encontrado</h3>
  <p class="text-sm text-gray-600 mt-2">Descrição do estado vazio</p>
</div>
```

---

### 8. Feature Cards

Cards de funcionalidades na landing page ou dashboards.

```html
<div class="bg-violet-50/50 border border-violet-200 rounded-2xl p-6 shadow-md hover:shadow-lg transition-all hover:-translate-y-1">
  <div class="flex items-start space-x-4">
    <!-- Ícone -->
    <div class="flex h-14 w-14 items-center justify-center rounded-lg bg-violet-100 border-2 border-violet-200 flex-shrink-0">
      <svg class="h-7 w-7 text-violet-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <!-- Path -->
      </svg>
    </div>

    <!-- Conteúdo -->
    <div class="flex-1">
      <h3 class="text-lg font-bold text-gray-900 mb-2">Título da Funcionalidade</h3>
      <p class="text-sm text-gray-700 leading-relaxed">Descrição da funcionalidade.</p>

      <!-- Link opcional -->
      <div class="mt-4 flex items-center text-xs font-medium text-violet-700">
        <span>Saiba mais</span>
        <svg class="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  </div>
</div>
```

---

## 🎨 Paleta de Cores

### Cores Primárias

**Violet (Principal):**

- `violet-700` - Cor primária principal
- `violet-800` - Hover states
- `violet-600` - Variações
- `violet-100` - Backgrounds claros
- `violet-50/50` - Backgrounds muito claros

**Purple (Secundária):**

- `purple-700`
- `purple-200/30` - Background blur
- `purple-100` - Cards
- `purple-50/50` - Feature cards

### Cores de Feature/Categoria

**Orange:**

- `orange-700`
- `orange-200` - Borders
- `orange-100` - Icon backgrounds
- `orange-50/50` - Card backgrounds

**Indigo:**

- `indigo-700`
- `indigo-200` - Borders
- `indigo-100` - Icon backgrounds
- `indigo-50/50` - Card backgrounds

**Pink:**

- `pink-700`
- `pink-200` - Borders
- `pink-100` - Icon backgrounds
- `pink-50/50` - Card backgrounds

**Green:**

- `green-700`
- `green-600` - Success states
- `green-200` - Borders
- `green-100` - Icon backgrounds
- `green-50/50` - Card backgrounds

**Red:**

- `red-700`
- `red-600` - Error states
- `red-200` - Borders
- `red-100` - Icon backgrounds
- `red-50/50` - Card backgrounds

### Cores Neutras

**Gray (Base):**

- `gray-900` - Textos principais
- `gray-800` - Textos secundários
- `gray-700` - Labels, descrições
- `gray-600` - Textos terciários
- `gray-500` - Placeholders
- `gray-400` - Icons disabled
- `gray-300` - Borders
- `gray-200` - Divisórias
- `gray-100` - Backgrounds secundários
- `gray-50` - Backgrounds muito claros

---

## 🧩 Componentes UI

### Input Fields

```html
<div>
  <label for="field" class="block text-sm font-medium text-gray-900 mb-2"> Label </label>
  <input id="field" type="text" placeholder="Digite aqui..." class="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 shadow-sm transition-colors focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 sm:text-sm" />
</div>
```

### Select/Dropdown

```html
<select class="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 shadow-sm transition-colors focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 sm:text-sm">
  <option>Opção 1</option>
  <option>Opção 2</option>
</select>
```

### Mensagens de Erro

```html
<div class="bg-red-50/80 border border-red-200 rounded-lg p-4">
  <div class="flex items-start">
    <svg class="h-5 w-5 text-red-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    <p class="text-sm font-medium text-red-800">Mensagem de erro</p>
  </div>
</div>
```

### Mensagens de Sucesso

```html
<div class="bg-green-50/80 border border-green-200 rounded-lg p-4">
  <div class="flex items-start">
    <svg class="h-5 w-5 text-green-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    <p class="text-sm font-medium text-green-800">Mensagem de sucesso</p>
  </div>
</div>
```

### Tabs/Navegação

```html
<div class="flex bg-gray-100 rounded-lg p-1 mb-6">
  <button
    [ngClass]="{
      'bg-white shadow-sm text-violet-700 font-semibold': activeTab === 'tab1',
      'text-gray-600 hover:text-gray-900': activeTab !== 'tab1'
    }"
    class="flex-1 py-2.5 px-3 text-sm rounded-md transition-all duration-200 focus:outline-none"
  >
    Tab 1
  </button>
  <button
    [ngClass]="{
      'bg-white shadow-sm text-violet-700 font-semibold': activeTab === 'tab2',
      'text-gray-600 hover:text-gray-900': activeTab !== 'tab2'
    }"
    class="flex-1 py-2.5 px-3 text-sm rounded-md transition-all duration-200 focus:outline-none"
  >
    Tab 2
  </button>
</div>
```

---

## 📐 Espaçamento e Layout

### Container Principal

```html
<div class="min-h-screen bg-gray-100 relative overflow-hidden">
  <!-- Background decorativo -->

  <div class="container mx-auto px-6 py-8 space-y-6 relative">
    <!-- Conteúdo -->
  </div>
</div>
```

### Grid de Cards

**2 Colunas:**

```html
<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
  <!-- Cards -->
</div>
```

**4 Colunas:**

```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  <!-- Cards -->
</div>
```

### Espaçamentos Padrão

- Entre seções: `space-y-6` ou `space-y-8`
- Padding de cards: `p-6` ou `p-8`
- Gaps em grids: `gap-4`, `gap-6`
- Margens: `mt-2`, `mt-4`, `mb-4`

---

## ✨ Transições e Animações

### Hover Effects em Cards

```html
class="hover:shadow-lg transition-all hover:-translate-y-1"
```

### Transições Gerais

```html
class="transition-all"
<!-- Todas as propriedades -->
class="transition-colors"
<!-- Apenas cores -->
class="transition-all duration-200"
<!-- Com duração customizada -->
```

### Spinner de Loading

```html
class="animate-spin"
```

---

## 📝 Boas Práticas

1. **Sempre use o background decorativo** em páginas principais
2. **Prefira glassmorphism** para cards principais (`bg-white/80 backdrop-blur-sm`)
3. **Use ícones com background** para melhor hierarquia visual
4. **Mantenha consistência nas cores** de acordo com o contexto:
   - Violet/Purple para ações primárias
   - Orange para alertas importantes
   - Green para sucesso
   - Red para erros
5. **Adicione hover effects** em elementos interativos
6. **Use rounded-2xl** para cards principais e `rounded-lg` para ícones
7. **Shadow-lg** para cards principais, `shadow-md` para cards secundários
8. **Typography**: Gray-900 para títulos, Gray-700 para descrições

---

## 🔍 Checklist de Implementação

Ao criar uma nova página/componente, verifique:

- [ ] Background decorativo adicionado
- [ ] Cards principais usam glassmorphism
- [ ] Ícones têm backgrounds coloridos apropriados
- [ ] Typography segue a hierarquia definida
- [ ] Botões seguem os padrões (primário/secundário)
- [ ] Estados de loading implementados
- [ ] Estados vazios implementados
- [ ] Hover effects em elementos interativos
- [ ] Transições suaves configuradas
- [ ] Cores consistentes com a paleta
- [ ] Espaçamentos seguem o padrão
- [ ] Responsive (grid responsivo implementado)

---

## 📚 Recursos Adicionais

- **Tailwind CSS Documentation**: https://tailwindcss.com/docs
- **Heroicons** (ícones usados): https://heroicons.com/
- **Color Palette Generator**: https://tailwindcolor.com/

---

**Última atualização**: Janeiro 2025
**Versão**: 1.0
