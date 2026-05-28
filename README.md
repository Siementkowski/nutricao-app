# Nutrição App

PWA de acompanhamento nutricional pessoal — React 18 + Vite + TypeScript + Tailwind CSS v4 + Supabase.

## Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS v4 (`@tailwindcss/vite`)
- **Estado**: Zustand
- **Backend**: Supabase (PostgreSQL, sem autenticação)
- **Gráficos**: Recharts
- **PWA**: `vite-plugin-pwa`

## Configuração

### 1. Clonar e instalar

```bash
git clone <repo-url>
cd nutricao-app
npm install
```

### 2. Variáveis de ambiente

Crie `.env` a partir do `.env.example`:

```bash
cp .env.example .env
```

Preencha com as credenciais do seu projeto Supabase:

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

### 3. Banco de dados (Supabase)

No painel do Supabase, execute em ordem:

1. `supabase/schema.sql` — cria as 6 tabelas com RLS desabilitado
2. `supabase/seed.sql` — insere metas padrão + 20 alimentos de exemplo

### 4. Planilha Google Sheets (opcional)

Para importar alimentos e dieta personalizada, crie uma planilha pública com duas abas:

**Aba "Alimentos"** (colunas na ordem):
```
nome | kcal/100g | proteína/100g | carb/100g | gordura/100g
```

**Aba "Dieta"** (colunas na ordem):
```
refeição | alimento | quantidade_g | kcal | proteína | carb | gordura
```

> Valores de `refeição` aceitos: `café`, `almoço`, `jantar`, `lanche` (em português, sem acento é aceito também)

Compartilhe a planilha como **"Qualquer pessoa com o link pode ver"** e copie o ID da URL:
```
https://docs.google.com/spreadsheets/d/<ID-AQUI>/edit
```

Cole o ID em **Configurações → Google Sheets** dentro do app.

### 5. Rodar localmente

```bash
npm run dev
```

Acesse `http://localhost:5174`

## Build para produção

```bash
npm run build
```

Os arquivos ficam em `dist/`.

## Deploy no Vercel

O arquivo `vercel.json` já configura o roteamento SPA. Basta conectar o repositório no Vercel — o build é detectado automaticamente.

Variáveis de ambiente necessárias no painel do Vercel:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Funcionalidades

- **Home**: Anel de calorias, barras de macros, hidratação, resumo de refeições, card de déficit/superávit calórico
- **Refeições**: Registro por refeição, busca de alimentos, cálculo de macros em tempo real
- **Dieta**: Visualização da dieta prescrita importada da planilha, botão "Usar hoje"
- **Substituições**: Calculadora com 5 modos (kcal, proteína, carboidrato, gordura, balanceado), tabela comparativa
- **Progresso**: Gráfico de peso (Recharts), heatmap de aderência alimentar 60 dias, métricas de sequência
- **Configurações**: Metas diárias, gasto energético (TMB/TDEE via Mifflin-St Jeor), sincronização com Google Sheets

## Estrutura

```
src/
  components/
    home/        ProgressRing, MacroBar, EnergyCard
    layout/      BottomNav, PageHeader, PageTransition
    meals/       MealSection, FoodCard, AddFoodModal
    progress/    LogWeightModal
    settings/    SettingsModal
  hooks/         useDiary, useFoods, useDiet, useWater, useSubstitution, useProgress
  lib/           supabase.ts, sheets.ts, energy.ts
  pages/         Home, Meals, Diet, Substitution, Progress
  store/         diaryStore, foodStore, userStore
  types/         index.ts
```
