# Desafio do Saber — PWA
Jogo de perguntas (IFES/ENEM) com medalhas, ranking, sons e importação CSV/JSON.

## Rodar local
```bash
npm i
npm run dev
```

## Build
```bash
npm run build
npm run preview
```

## Deploy (Vercel)
1. Crie um repositório no GitHub e envie os arquivos.
2. No vercel.com, **New Project** → importe o repo.
3. Framework: **Vite**; Build: `npm run build`; Output: `dist`.
4. Deploy e use a URL.

## Deploy (Netlify)
- Conecte o repositório. Build: `npm run build`; Publish dir: `dist`.

## Importar perguntas
- Botão **Importar perguntas** (arquivo CSV/JSON ou URL do Google Sheets publicado como CSV).
- Colunas: `mode,id,year,subject,difficulty,stem,option_a,option_b,option_c,option_d,correct,feedback_correct,feedback_wrong`.
